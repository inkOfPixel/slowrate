// @flow

import SlowRate from "./index";
import times from "lodash/times";

const TEST_INTERVAL = 100;

describe("A SlowRate instance", () => {
  test("submit() returns a promise that resolve to the value of the wrapped promise", async () => {
    const slowRate = new SlowRate({ interval: TEST_INTERVAL });
    const wrappedRequest = () => Promise.resolve("Hello");
    const [a, b] = await Promise.all([
      wrappedRequest(),
      slowRate.submit(wrappedRequest)
    ]);
    expect(a).toBe("Hello");
    expect(b).toBe(a);
  });

  test("the wrapped promise passed to submit() is executed only once", async () => {
    const slowRate = new SlowRate({ interval: TEST_INTERVAL });
    const mockedRequest = jest.fn().mockReturnValue(Promise.resolve("Hello"));
    const result = await slowRate.submit(mockedRequest);
    expect(mockedRequest).toHaveBeenCalledTimes(1);
    expect(result).toBe("Hello");
  });

  test("all submitted request are executed exactly once", async () => {
    const slowRate = new SlowRate({ interval: TEST_INTERVAL });
    const mockedRequest = jest.fn().mockReturnValue(Promise.resolve("Hello"));
    const promises = times(4, () => slowRate.submit(mockedRequest));
    const result = await Promise.all(promises);
    expect(mockedRequest).toHaveBeenCalledTimes(4);
  });

  test("requests are executed one at a time separated by the given time interval", async () => {
    const slowRate = new SlowRate({ interval: TEST_INTERVAL });
    const wrappedRequest = () => Promise.resolve(new Date());
    const promises = times(10, () => slowRate.submit(wrappedRequest));
    const result = await Promise.all(promises);
    const sortedResult = result.map(d => d.getTime()).sort();
    const averageInterval = sortedResult.reduce(
      (avg, currentTime, currentIndex, array) => {
        if (currentIndex > 0) {
          return (
            avg + (currentTime - array[currentIndex - 1]) / (array.length - 1)
          );
        }
        return avg;
      },
      0
    );
    expect(averageInterval).toBeGreaterThanOrEqual(TEST_INTERVAL);
    expect(averageInterval).toBeLessThan(TEST_INTERVAL + 10);
  });
});
