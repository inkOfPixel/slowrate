// @flow

import BinaryHeap from "./BinaryHeap";

describe("An integer BinaryHeap", () => {
  const queue = new BinaryHeap((a: number, b: number) => a - b);
  test("is initially empty", () => {
    expect(queue.isEmpty()).toBe(true);
  });
  test("always returns the highest value", () => {
    queue.push(1);
    queue.push(4);
    queue.push(10);
    expect(queue.peek()).toBe(10);
  });
  test("when calling size() returns the number of values stored in the heap", () => {
    expect(queue.size).toBe(3);
  });
  test("when calling toArray() returns an heapified array", () => {
    expect(queue.toArray()).toEqual([10, 1, 4]);
  });
  test("when calling pop() returns the highest value and decreases the size of the heap", () => {
    const oldSize = queue.size;
    const value = queue.pop();
    const newSize = queue.size;
    expect(value).toBe(10);
    expect(oldSize - newSize).toBe(1);
  });
  test("returns undefined when it is empty and pop() is called", () => {
    const emptyQueue = new BinaryHeap((a: number, b: number) => a - b);
    const value = emptyQueue.pop();
    expect(value).toBeUndefined();
    expect(emptyQueue.size).toBe(0);
  });
  test("returns undefined when it is empty and peek() is called", () => {
    const emptyQueue = new BinaryHeap((a: number, b: number) => a - b);
    const value = emptyQueue.peek();
    expect(value).toBeUndefined();
    expect(emptyQueue.size).toBe(0);
  });
});
