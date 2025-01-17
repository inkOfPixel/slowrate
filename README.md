# Slow Rate 🐢

A blazing slow library to deal with rate limited APIs

[![npm](https://img.shields.io/npm/v/slowrate.svg?style=flat-square)](https://www.npmjs.com/package/slowrate)

```
yarn add slowrate
```

```
npm i slowrate
```

## The problem

You need to use an API that allows only a certain number of the request to be made in a given interval but don't want to bother implementing your rate limit solution.

## The solution

`slowrate` enables you to make requests without worrying about all the delay logic. Just submit your promise wrapper to a SlowRate instance and wait until the promise resolves.

## Usage

```javascript
import SlowRate from "slowrate"

const slowRate = new SlowRate({ interval: 500 })
const response = await slowRate.submit(() => fetchDataFromRateLimitedAPI())
```

## API

### `new SlowRate(options)`

Creates a new `SlowRate` instance.

#### `options`

* `intervals` - Optional - Sets the interval between each request call in milliseconds. Defaults to `500`

#### Return value

A `SlowRate` instance.

### `.submit(wrappedPromise, [priority])`

Submit a promise to the slowrate queue.

#### `wrappedPromise`

A `function` that returns a `Promise`. This is called by the slowrate instance to start the promise.

#### `priority`

An optional `number` that represents the priority of the request (request with higher priorities are resolved first). Defaults to `0`.

#### Return value

A `Promise` that resolves to the result of the passed promise (or reject with the rejection error).

### `.queueSize()`

The number of promises enqueued in the slowrate instance.

#### Return value

A `number` that represents the number of promises enqueued in the slowrate instance.

## LICENSE

MIT
