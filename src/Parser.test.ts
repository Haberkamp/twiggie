import { test, expect } from "vitest";
import { Parser } from "./Parser";
import { Tokenizer } from "./Tokenizer";

test("returns an empty Program", () => {
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

test("returns a single Twig block", () => {
  // GIVEN
  const program = "{% block my_block %}{% endblock %}";
  const subject = new Parser(new Tokenizer());

  // WHEN
  const result = subject.parse(program);

  // THEN
  expect(result).toStrictEqual({
    type: "Program",
    body: [
      {
        type: "TwigBlock",
        name: "my_block",
      },
    ],
  });
});
