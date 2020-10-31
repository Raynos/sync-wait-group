// TypeScript Version: 3.0

interface AssertLike {
  ok(bool: boolean, msg: string): void;
}

declare namespace CollapsedAssert {}

declare class CollapsedAssert {
  constructor();
  hasFailed(): boolean;
  ifError(value: unknown, msg?: string): void;
  equal(value: unknown, expected: unknown, msg?: string): void;
  notEqual(value: unknown, expected: unknown, msg?: string): void;
  ok(value: unknown, msg?: string): void;
  fail(msg?: string): void;
  comment(msg: string): void;
  report(realAssert: AssertLike, msg: string): void;
}

export = CollapsedAssert;
