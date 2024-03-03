import { test, expect } from "vitest";
import { Parser } from "@/Parser";
import { Tokenizer } from "@/Tokenizer";

test("parses an HTML tag inside a Twig block", () => {
  // GIVEN
  const program = `
{% block my_block %}
  <div></div>
{% endblock %}`;

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
        body: [
          {
            type: "HTMLTag",
            name: "div",
            body: [],
          },
        ],
      },
    ],
  });
});

test("parses HTML tag adjacent to Twig block", () => {
  // GIVEN
  const program = `
<div></div>
{% block my_adjacent_block %}{% endblock %}`;

  const subject = new Parser(new Tokenizer());

  // WHEN
  const result = subject.parse(program);

  // THEN
  expect(result).toStrictEqual({
    type: "Program",
    body: [
      {
        type: "HTMLTag",
        name: "div",
        body: [],
      },
      {
        type: "TwigBlock",
        name: "my_adjacent_block",
        body: [],
      },
    ],
  });
});
