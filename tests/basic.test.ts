import { test, expect } from "vitest";
import { Parser } from "@/Parser";
import { Tokenizer } from "@/Tokenizer";

test("parses an empty file", () => {
  // GIVEN
  const program = "";
  const subject = new Parser(new Tokenizer());

  // WHEN
  const result = subject.parse(program);

  // THEN
  expect(result).toStrictEqual({
    type: "Program",
    body: [],
  });
});

test("parses a file with raw text", () => {
  // GIVEN
  const program = "Hello, world!";
  const subject = new Parser(new Tokenizer());

  // WHEN
  const result = subject.parse(program);

  // THEN
  expect(result).toStrictEqual({
    type: "Program",
    body: [
      {
        type: "Text",
        value: "Hello, world!",
      },
    ],
  });
});

test("ignores the <!DOCTYPE> tag", () => {
  // GIVEN
  const program = "<!DOCTYPE html>";
  const subject = new Parser(new Tokenizer());

  // WHEN
  const result = subject.parse(program);

  // THEN
  expect(result).toStrictEqual({
    type: "Program",
    body: [],
  });
});
