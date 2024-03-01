import { test, expect } from "vitest";
import { Parser } from "./Parser";

test("returns an empty Program", () => {
  // GIVEN
  const program = "";
  const subject = new Parser();

  // WHEN
  const result = subject.parse(program);

  // THEN
  expect(result).toStrictEqual({
    type: "Program",
    body: [],
  });
});
