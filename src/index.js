// @flow

import uniqueId from "lodash/uniqueId";

type ConstructorOptions = {
  interval: number
};

export default class SlowRate {
  _interval = 500;
  _intervalId = undefined;

  constructor(options: ConstructorOptions = { interval: 500 }) {
    this._interval = options.interval;
  }

  submit = <T>(promise: Promise<T>): Promise<T> => {
    return promise;
  };

  _fire = () => {};
}
