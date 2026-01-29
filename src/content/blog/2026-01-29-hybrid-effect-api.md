---
title: "The Hybrid API Pattern: Serving Both Promise and Effect Users"
description: "Learn how to build TypeScript libraries that serve both traditional Promise users and Effect-TS power users from a single implementation"
pubDate: 2026-01-29
author: "SolidSnakeDev"
tags: ["effect-ts", "typescript", "api-design", "functional-programming"]
---

# The Hybrid API Pattern: Serving Both Promise and Effect Users

When I started building TypeScript libraries with Effect-TS, I kept running into the same question: how do I make this accessible to developers who have never heard of Effect, while still giving power users the full capabilities they expect?

The answer turned out to be simpler than I thought. Instead of choosing between Promise-based APIs and Effect-based APIs, we can offer both—from a single implementation. This is the hybrid API pattern.

## The Problem

Imagine you are building a library. Your team loves Effect-TS for its type-safe error handling and composability. But your users? Most of them just want to call a function and get a result. They are comfortable with sync functions, `async/await`, and `try/catch`. Asking them to learn Effect before they can use your library is a non-starter.

At the same time, you do not want to maintain two separate implementations. That way lies bugs and inconsistencies.

The hybrid pattern solves this by exposing three layers of API, all powered by the same Effect implementation underneath:

```typescript
// Traditional developers call functions directly
const json = encode({ data: myObject });
const response = await get("https://api.example.com/users");

// Effect developers use the effect namespace  
yield* effect.encode({ data: myObject });
yield* effect.get("https://api.example.com/users");

// Enterprise applications use dependency injection
const codec = yield* CodecService;
const http = yield* HttpService;
```

Same behavior. Same implementation. Different interfaces for different needs.

## A Tale of Two Designs

Before diving into code, we need to understand two orthogonal design decisions. Each shapes how your API feels to users.

**Stateless vs stateful.** Stateless design works when your code transforms data without owning it. Think of an encoder that converts objects to JSON strings. Each invocation is independent. Stateful design works when your code manages resources it owns. Think of a key-value store that holds data in memory. Order matters.

**Sync vs async.** Synchronous operations complete immediately—JSON parsing, math, in-memory lookups. Asynchronous operations involve I/O—network requests, file access, timers. Your public API should reflect this reality.

We will explore three examples: a stateless sync encoder, a stateless async HTTP client, and a stateful sync key-value store. The hybrid pattern works for all of them.

---

## Building a Stateless Module: The JSON Encoder

We will start simple. A JSON encoder takes data in, produces a string out. No state, no memory, just transformation.

### Types

First, we define what we are working with:

```typescript
import { Context, Data, Effect, Layer } from "effect";

interface Payload {
  readonly data: unknown;
}
```

Nothing fancy. Just a container for whatever data the user wants to encode.

### Error

Effect shines when it comes to errors. Instead of throwing generic exceptions, we create typed errors that tell us exactly what went wrong:

```typescript
class CodecError extends Data.TaggedError("CodecError")<{
  readonly operation: "encode" | "decode";
  readonly cause?: unknown;
}> {
  get message() {
    return `Codec ${this.operation} failed`;
  }
}
```

The `Data.TaggedError` base class gives us a `_tag` property automatically. This lets us use `Effect.catchTag` later for precise error handling.

### Effect Core

Now we write the actual logic. These functions are the heart of our module:

```typescript
function encodeEffect(payload: Payload): Effect.Effect<string, CodecError> {
  return Effect.try({
    try: () => JSON.stringify(payload.data),
    catch: (cause) => new CodecError({ operation: "encode", cause }),
  });
}

function decodeEffect(json: string): Effect.Effect<Payload, CodecError> {
  return Effect.try({
    try: () => ({ data: JSON.parse(json) }),
    catch: (cause) => new CodecError({ operation: "decode", cause }),
  });
}
```

`Effect.try` wraps synchronous code that might throw. If `JSON.stringify` fails (say, on a circular reference), we catch it and wrap it in our typed error.

### Public API: Sync

Most users will never see the Effect code above. They will use this:

```typescript
function encode(payload: Payload): string {
  return Effect.runSync(encodeEffect(payload));
}

function decode(json: string): Payload {
  return Effect.runSync(decodeEffect(json));
}
```

That is it. `Effect.runSync` executes a synchronous Effect and returns the value directly. Since `JSON.stringify` and `JSON.parse` are synchronous, there is no reason to wrap them in Promises:

```typescript
const json = encode({ data: { name: "Alice" } });
const payload = decode(json);
```

They never need to import Effect. They never need to learn generators. It just works.

Note the difference from async operations: when your underlying code is synchronous, use `Effect.runSync`. When it involves actual async work (network calls, file I/O), use `Effect.runPromise`. Honest APIs reflect the true nature of the operation.

### Effect API

For users who want Effect's power, we expose the raw functions:

```typescript
const effect = {
  encode: encodeEffect,
  decode: decodeEffect,
};
```

Now they can compose, retry, timeout, and handle errors with full type safety:

```typescript
const program = Effect.gen(function* () {
  const encoded = yield* effect.encode({ data: [1, 2, 3] });
  const decoded = yield* effect.decode(encoded);
  
  const safe = yield* effect.decode("invalid json").pipe(
    Effect.catchTag("CodecError", (e) => 
      Effect.succeed({ data: `Recovered from: ${e.message}` })
    )
  );
});
```

The `yield*` keyword might look unfamiliar. Think of it as `await` for Effects. It unwraps the Effect and gives you the success value, or propagates the error.

### Service Layer

Large applications benefit from swappable implementations. Why not just import the Effect functions directly? Because dependency injection lets you swap real implementations for mocks in tests, replace services without changing application code, and keep modules decoupled. We define a service interface and a tag:

```typescript
interface CodecServiceImpl {
  readonly encode: (payload: Payload) => Effect.Effect<string, CodecError>;
  readonly decode: (json: string) => Effect.Effect<Payload, CodecError>;
}

class CodecService extends Context.Tag("CodecService")<
  CodecService,
  CodecServiceImpl
>() {}

const Live = Layer.succeed(CodecService, {
  encode: encodeEffect,
  decode: decodeEffect,
});
```

Application code asks for the service without knowing which implementation it will get:

```typescript
const program = Effect.gen(function* () {
  const codec = yield* CodecService;
  const json = yield* codec.encode({ data: { name: "Alice" } });
  return yield* codec.decode(json);
});

// In production
Effect.runSync(program.pipe(Effect.provide(Live)));

// In tests
const MockCodec = Layer.succeed(CodecService, {
  encode: () => Effect.succeed('{"test":true}'),
  decode: () => Effect.succeed({ data: "mocked" }),
});
Effect.runSync(program.pipe(Effect.provide(MockCodec)));
```

The same program runs with real encoding or with mocks. No code changes needed.

---

## Async Operations: The HTTP Client

The encoder example uses synchronous operations, so we used `Effect.runSync`. But what about truly async operations like network requests? Let us build an HTTP client to see the difference.

### Types

```typescript
interface RequestOptions {
  readonly url: string;
  readonly method?: "GET" | "POST";
  readonly body?: unknown;
}

interface Response {
  readonly status: number;
  readonly data: unknown;
}
```

### Error

```typescript
class HttpError extends Data.TaggedError("HttpError")<{
  readonly url: string;
  readonly status?: number;
  readonly cause?: unknown;
}> {
  get message() {
    return this.status
      ? `HTTP ${this.status} for ${this.url}`
      : `Request failed for ${this.url}`;
  }
}
```

### Effect Core

The key difference from the encoder is `Effect.tryPromise` instead of `Effect.try`:

```typescript
function requestEffect(options: RequestOptions): Effect.Effect<Response, HttpError> {
  return Effect.tryPromise({
    try: async () => {
      const res = await fetch(options.url, {
        method: options.method ?? "GET",
        headers: options.body ? { "Content-Type": "application/json" } : undefined,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      if (!res.ok) {
        throw { status: res.status };
      }

      const data = await res.json();
      return { status: res.status, data };
    },
    catch: (cause) =>
      new HttpError({
        url: options.url,
        status: (cause as { status?: number })?.status,
        cause,
      }),
  });
}

function getEffect(url: string): Effect.Effect<Response, HttpError> {
  return requestEffect({ url, method: "GET" });
}

function postEffect(url: string, body: unknown): Effect.Effect<Response, HttpError> {
  return requestEffect({ url, method: "POST", body });
}
```

`Effect.tryPromise` wraps async code that might reject. The `try` function returns a Promise, and any rejection gets caught and transformed into our typed error.

### Public API: Promise

Because `fetch` is async, our public API must be async too:

```typescript
async function request(options: RequestOptions): Promise<Response> {
  return Effect.runPromise(requestEffect(options));
}

async function get(url: string): Promise<Response> {
  return Effect.runPromise(getEffect(url));
}

async function post(url: string, body: unknown): Promise<Response> {
  return Effect.runPromise(postEffect(url, body));
}
```

Notice we use `Effect.runPromise` here, not `Effect.runSync`. The underlying operation is async, so our API honestly reflects that:

```typescript
const response = await get("https://api.example.com/users/1");
console.log(response.data);
```

### Effect API

Same pattern as before:

```typescript
const effect = {
  request: requestEffect,
  get: getEffect,
  post: postEffect,
};
```

Effect users get composition with retries and timeouts:

```typescript
const program = Effect.gen(function* () {
  const response = yield* effect.get("https://api.example.com/users/1").pipe(
    Effect.retry({ times: 3 }),
    Effect.timeout("10 seconds")
  );
  return response.data;
});
```

### Service Layer

```typescript
interface HttpServiceImpl {
  readonly request: (options: RequestOptions) => Effect.Effect<Response, HttpError>;
  readonly get: (url: string) => Effect.Effect<Response, HttpError>;
  readonly post: (url: string, body: unknown) => Effect.Effect<Response, HttpError>;
}

class HttpService extends Context.Tag("HttpService")<
  HttpService,
  HttpServiceImpl
>() {}

const Live = Layer.succeed(HttpService, {
  request: requestEffect,
  get: getEffect,
  post: postEffect,
});
```

Usage follows the same pattern:

```typescript
const program = Effect.gen(function* () {
  const http = yield* HttpService;
  const response = yield* http.get("https://api.example.com/users/1");
  return response.data;
});

Effect.runPromise(program.pipe(Effect.provide(Live)));
```

### Sync vs Async: Choosing the Right Runner

The rule is simple:

- Use `Effect.runSync` when the underlying code is synchronous (JSON parsing, math, in-memory operations)
- Use `Effect.runPromise` when the underlying code is async (network, file I/O, timers)

Your public API should reflect reality. If the operation is instant, do not make users await it. If it involves I/O, do not pretend it is synchronous.

---

Both examples so far have been stateless—each call is independent. Now let us see how the pattern adapts when our code needs to remember things.

## Building a Stateful Class: The Key-Value Store

Now let us tackle something with internal state. A key-value store remembers what you put in it.

### Types

We start with a class that holds a Map:

```typescript
class KVStore {
  private data = new Map<string, string>();
}
```

This Map is the state. The class owns it, manages it, and exposes operations on it.

### Error

Same pattern as before:

```typescript
class KVError extends Data.TaggedError("KVError")<{
  readonly operation: string;
  readonly key: string;
}> {
  get message() {
    return `KV operation '${this.operation}' failed for key '${this.key}'`;
  }
}
```

### Effect Core

The private methods use Effect for the actual logic:

```typescript
class KVStore {
  private data = new Map<string, string>();

  private setEffect(key: string, value: string): Effect.Effect<void> {
    return Effect.sync(() => {
      this.data.set(key, value);
    });
  }

  private getEffect(key: string): Effect.Effect<string, KVError> {
    return Effect.suspend(() => {
      const value = this.data.get(key);
      return value !== undefined
        ? Effect.succeed(value)
        : Effect.fail(new KVError({ operation: "get", key }));
    });
  }

  private deleteEffect(key: string): Effect.Effect<boolean> {
    return Effect.sync(() => this.data.delete(key));
  }

  private keysEffect(): Effect.Effect<Array<string>> {
    return Effect.sync(() => [...this.data.keys()]);
  }
}
```

Notice `Effect.sync` for operations that always succeed, and `Effect.suspend` for operations that might fail. The `suspend` delays evaluation until the Effect runs, which matters when the result depends on current state.

### Public API: Sync

Since Map operations are synchronous, our public API should be too:

```typescript
class KVStore {
  // ... private methods ...

  set(key: string, value: string): void {
    return Effect.runSync(this.setEffect(key, value));
  }

  get(key: string): string {
    return Effect.runSync(this.getEffect(key));
  }

  delete(key: string): boolean {
    return Effect.runSync(this.deleteEffect(key));
  }

  keys(): Array<string> {
    return Effect.runSync(this.keysEffect());
  }
}
```

Usage is straightforward:

```typescript
const store = new KVStore();
store.set("name", "Alice");
store.set("city", "Paris");
console.log(store.get("name"));
console.log(store.keys());
```

### Effect API

We expose the Effect versions through a property:

```typescript
class KVStore {
  // ... other code ...

  readonly effect = {
    set: (key: string, value: string) => this.setEffect(key, value),
    get: (key: string) => this.getEffect(key),
    delete: (key: string) => this.deleteEffect(key),
    keys: () => this.keysEffect(),
  };
}
```

Effect users can now compose operations:

```typescript
const store = new KVStore();

const program = Effect.gen(function* () {
  yield* store.effect.set("counter", "0");
  
  const value = yield* store.effect.get("counter").pipe(
    Effect.catchTag("KVError", () => Effect.succeed("default"))
  );
  
  yield* Effect.log(`Counter: ${value}`);
});

Effect.runSync(program);
```

Here is the complete class with all three layers:

```typescript
class KVStore {
  private data = new Map<string, string>();

  // Effect Core (private)
  private setEffect(key: string, value: string): Effect.Effect<void> {
    return Effect.sync(() => {
      this.data.set(key, value);
    });
  }

  private getEffect(key: string): Effect.Effect<string, KVError> {
    return Effect.suspend(() => {
      const value = this.data.get(key);
      return value !== undefined
        ? Effect.succeed(value)
        : Effect.fail(new KVError({ operation: "get", key }));
    });
  }

  private deleteEffect(key: string): Effect.Effect<boolean> {
    return Effect.sync(() => this.data.delete(key));
  }

  private keysEffect(): Effect.Effect<Array<string>> {
    return Effect.sync(() => [...this.data.keys()]);
  }

  // Public API: Sync
  set(key: string, value: string): void {
    return Effect.runSync(this.setEffect(key, value));
  }

  get(key: string): string {
    return Effect.runSync(this.getEffect(key));
  }

  delete(key: string): boolean {
    return Effect.runSync(this.deleteEffect(key));
  }

  keys(): Array<string> {
    return Effect.runSync(this.keysEffect());
  }

  // Effect API
  readonly effect = {
    set: (key: string, value: string) => this.setEffect(key, value),
    get: (key: string) => this.getEffect(key),
    delete: (key: string) => this.deleteEffect(key),
    keys: () => this.keysEffect(),
  };
}
```

### Service Layer

For dependency injection, we define an interface and layer:

```typescript
interface KVServiceImpl {
  readonly set: (key: string, value: string) => Effect.Effect<void>;
  readonly get: (key: string) => Effect.Effect<string, KVError>;
  readonly delete: (key: string) => Effect.Effect<boolean>;
  readonly keys: () => Effect.Effect<Array<string>>;
}

class KVService extends Context.Tag("KVService")<KVService, KVServiceImpl>() {}

const Live = Layer.sync(KVService, () => {
  const store = new KVStore();
  return {
    set: (key, value) => store.effect.set(key, value),
    get: (key) => store.effect.get(key),
    delete: (key) => store.effect.delete(key),
    keys: () => store.effect.keys(),
  };
});
```

`Layer.sync` creates a new store instance when the layer is built. Each test can get a fresh store by providing a new layer.

---

## Why This Works

The pattern succeeds because it meets developers where they are.

Junior developers and teams new to Effect use the sync or Promise API. They get type-safe functions without any paradigm shift. Error handling works with try/catch, exactly as they expect.

Developers who know Effect use the effect namespace. They get full composability, retries, timeouts, and typed error handling. Nothing is hidden from them.

Enterprise teams use the service layer. They get dependency injection, mockable interfaces, and clean architecture. Tests become simple because swapping implementations is trivial.

And you, the library author? You maintain one implementation. The Effect core is the source of truth. The Promise and service layers are thin wrappers that delegate to it.

---

## Pitfalls to Avoid

A few mistakes are common when implementing this pattern.

First, do not leak Effect types into the Promise API. Your Promise functions should return `Promise<T>`, not `Promise<Effect<T>>`. Users of the Promise layer should never see the word Effect in their type signatures.

Second, keep error behavior consistent across layers. If the Effect version throws on a missing key, the Promise version should too. Do not silently return undefined in one layer while failing in another.

Third, remember to use `yield*` in Effect generators. Writing `store.effect.set("key", "value")` creates an Effect but does not run it. You must write `yield* store.effect.set("key", "value")` to actually execute the operation. Think of `yield*` as the Effect equivalent of `await`.

Finally, know when to skip the pattern entirely. For a quick script, an internal tool, or a library with a single user, three API layers are overkill. The hybrid pattern pays off when you have diverse users with different needs—or when you expect to have them someday.

---

## Wrapping Up

We covered a lot of ground. Here is what to remember:

**The Public API** gives traditional developers what they expect—sync functions or Promises, plain return types, standard error handling. Use `Effect.runSync` for synchronous operations and `Effect.runPromise` for async ones.

**The Effect API** exposes the raw Effect functions for power users who want composition, retries, timeouts, and typed error recovery. A simple `effect` namespace or property does the job.

**The Service Layer** enables dependency injection for large applications. Define a tag with `Context.Tag`, provide implementations with `Layer.succeed` or `Layer.sync`, and let application code remain decoupled from concrete implementations.

The pattern works for stateless modules and stateful classes, for sync and async operations. Pick the combination that fits your domain.

If you want to explore further, Effect offers much more: resource management with `Scope`, concurrent operations with `Fiber`, streaming with `Stream`, and schema validation. The hybrid pattern gives your users a gentle on-ramp to all of it.
