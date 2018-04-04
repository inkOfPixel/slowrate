// @flow

type CompareFn<T> = (a: T, b: T) => number;

const ROOT_INDEX = 0;

export default class BinaryHeap<T> {
  _heap: Array<T> = [];
  _compare: CompareFn<T>;

  constructor(compare: CompareFn<T>) {
    this._compare = compare;
  }

  get size(): number {
    return this._heap.length;
  }

  isEmpty = () => {
    return this.size === 0;
  };

  push = (value: T): void => {
    this._heap.push(value);
    this._siftUp(this._heap.length - 1);
  };

  pop = (): T | void => {
    const value = this.peek();
    const lastIndex = this.size - 1;
    if (lastIndex > ROOT_INDEX) {
      this._swap(ROOT_INDEX, lastIndex);
    }
    this._heap.pop();
    this._siftDown(ROOT_INDEX);
    return value;
  };

  peek = (): T | void => this._heap[ROOT_INDEX];

  toArray = (): Array<T> => this._heap;

  _siftUp = (nodeIndex: number) => {
    const parentNodeIndex = parentIndex(nodeIndex);
    if (
      parentNodeIndex >= 0 &&
      parentNodeIndex < nodeIndex &&
      this._isHigher(nodeIndex, parentNodeIndex)
    ) {
      this._swap(nodeIndex, parentNodeIndex);
      this._siftUp(parentNodeIndex);
    }
  };

  _siftDown = (nodeIndex: number) => {
    const leftIndex = leftChildIndex(nodeIndex);
    const rightIndex = rightChildIndex(nodeIndex);
    if (
      (leftIndex < this.size && this._isHigher(leftIndex, nodeIndex)) ||
      (rightIndex < this.size && this._isHigher(rightIndex, nodeIndex))
    ) {
      let higherChildIndex;
      if (leftIndex >= this.size) {
        higherChildIndex = rightIndex;
      } else if (rightIndex >= this.size) {
        higherChildIndex = leftIndex;
      } else if (this._isHigher(rightIndex, leftIndex)) {
        higherChildIndex = rightIndex;
      } else {
        higherChildIndex = leftIndex;
      }
      this._swap(nodeIndex, higherChildIndex);
      this._siftDown(higherChildIndex);
    }
  };

  _isHigher = (i: number, j: number): boolean => {
    return this._compare(this._heap[i], this._heap[j]) > 0;
  };

  _swap = (i: number, j: number): void => {
    const tmp = this._heap[i];
    this._heap[i] = this._heap[j];
    this._heap[j] = tmp;
  };
}

const parentIndex = (index: number): number => Math.floor((index - 1) / 2);

const leftChildIndex = (index: number): number => index * 2 + 1;

const rightChildIndex = (index: number): number => index * 2 + 2;
