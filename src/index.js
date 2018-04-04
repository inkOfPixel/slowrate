// @flow

import BinaryHeap from "./BinaryHeap";

type ConstructorOptions = {
  interval: number
};

type InternalRequest<T> = {
  run: () => Promise<T>,
  resolve: T => void,
  reject: (error: Error) => void,
  priority: number,
  submittedTimestamp: number
};

export default class SlowRate {
  _priorityQueue: BinaryHeap<InternalRequest<mixed>>;
  _interval: number;
  _intervalId = undefined;

  constructor(options: ConstructorOptions = { interval: 500 }) {
    this._interval = options.interval;
    this._priorityQueue = new BinaryHeap(this._compareInternalRequests);
  }

  submit = <T>(run: () => Promise<T>, priority: number = 0): Promise<T> => {
    const now = Date.now();
    const promise = new Promise((resolve: any => void, reject: any => void) => {
      this._priorityQueue.push({
        run,
        resolve,
        reject,
        priority,
        submittedTimestamp: now
      });
    });
    if (this._intervalId === undefined) {
      this._intervalId = setInterval(this._fire, this._interval);
    }
    return promise;
  };

  queueSize: () => number = () => this._priorityQueue.size;

  _fire = async (): Promise<void> => {
    const request = this._priorityQueue.pop();
    if (this._priorityQueue.size === 0) {
      clearInterval(this._intervalId);
    }
    if (request) {
      try {
        const result = await request.run();
        request.resolve(result);
      } catch (error) {
        request.reject(error);
      }
    }
  };

  _compareInternalRequests = (
    a: InternalRequest<mixed>,
    b: InternalRequest<mixed>
  ): number => {
    let result = a.priority - b.priority;
    if (result === 0) {
      result = a.submittedTimestamp - b.submittedTimestamp;
    }
    return result;
  };
}
