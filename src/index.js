// @flow

import uniqueId from "lodash/uniqueId";

type Request<T> = {
  exec: () => Promise<T>,
  maxAttempts?: number,
  priority?: number
};

type InternalRequest<T> = {
  exec: () => Promise<T>,
  id: string,
  priority: number,
  reject: Error => void,
  remainingAttempts: number,
  resolve: T => void,
  state: "waiting" | "processing" | "resolved" | "rejected"
};

const CALLS_PER_SECOND = 2;
const MS_MARGIN = 10;

export const QueuePriority = {
  LOW: 0,
  MEDIUM: 100,
  HIGH: 1000
};

export default class SlowRate {
  _queue: Array<string> = [];
  _requestsById: Map<string, InternalRequest<any>> = new Map();
  _intervalId = undefined;

  constructor() {
    const interval = 1000 / CALLS_PER_SECOND;
    this._intervalId = setInterval(this._tick, interval + MS_MARGIN);
  }

  add = <T>(request: Request<T>): Promise<T> =>
    new Promise((resolve, reject) => {
      let insertIndex = 0;
      const internalRequest = createInternalRequest(request, resolve, reject);
      while (
        hasSameOrHigherPriority(this, insertIndex, internalRequest.priority)
      ) {
        insertIndex += 1;
      }
      this._requestsById.set(internalRequest.id, internalRequest);
      this._queue.splice(insertIndex, 0, internalRequest.id);
    });

  _tick = async () => {
    const waitingRequest = getFirstWaitingRequest(this);
    if (waitingRequest) {
      try {
        waitingRequest.state = "processing";
        const result = await waitingRequest.exec();
        waitingRequest.state = "resolved";
        waitingRequest.resolve(result);
        this._removeRequest(waitingRequest.id);
      } catch (error) {
        waitingRequest.remainingAttempts -= 1;
        if (waitingRequest.remainingAttempts > 0) {
          waitingRequest.state = "waiting";
        } else {
          waitingRequest.state = "rejected";
          waitingRequest.reject(error);
          this._removeRequest(waitingRequest.id);
        }
      }
    }
  };

  _removeRequest = (id: string) => {
    this._requestsById.delete(id);
    this._queue = this._queue.filter(idItem => idItem !== id);
  };
}

const createInternalRequest = <T>(
  request: Request<T>,
  resolve: T => void,
  reject: Error => void
): InternalRequest<T> => ({
  exec: request.exec,
  id: uniqueId(),
  priority: request.priority || 0,
  reject,
  remainingAttempts: request.maxAttempts || 1,
  resolve,
  state: "waiting"
});

function hasSameOrHigherPriority(
  self: SlowRate,
  index: number,
  priority: number
): boolean {
  if (index < self._queue.length) {
    const id = self._queue[index];
    const request = self._requestsById.get(id);
    if (request && request.priority >= priority) {
      return true;
    }
  }
  return false;
}

function getFirstWaitingRequest<T>(
  self: ShopifyAPIRequestQueue
): void | InternalRequest<T> {
  for (let i = 0; i < self._queue.length; i++) {
    const id = self._queue[i];
    const request = self._requestsById.get(id);
    if (request && request.state === "waiting") {
      return request;
    }
  }
  return undefined;
}
