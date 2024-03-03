import { test, expect } from "vitest";
import { Parser } from "@/Parser";
import { Tokenizer } from "@/Tokenizer";

test("parses an HTML tag", () => {
  // GIVEN
  const program = "<div></div>";
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
    ],
  });
});

test("parses adjacent HTML tags", () => {
  // GIVEN
  const program = `
<div></div>
<div></div>
`;
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
        type: "HTMLTag",
        name: "div",
        body: [],
      },
    ],
  });
});

test("parses nested HTML tags", () => {
  // GIVEN
  const program = "<div><div></div></div>";
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

test("parses self-closing HTML tag", () => {
  // GIVEN
  const program = "<input />";
  const subject = new Parser(new Tokenizer());

  // WHEN
  const result = subject.parse(program);

  // THEN
  expect(result).toStrictEqual({
    type: "Program",
    body: [
      {
        type: "HTMLTag",
        name: "input",
        body: [],
      },
    ],
  });
});
