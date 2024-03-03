import { test, expect } from "vitest";
import { Parser } from "@/Parser";
import { Tokenizer } from "@/Tokenizer";

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
        body: [],
      },
    ],
  });
});

test("returns an AST containing adjacent Twig Blocks", () => {
  // GIVEN
  const program = `
{% block my_first_block %}{% endblock %}
{% block my_second_block %}{% endblock %}`;

  const subject = new Parser(new Tokenizer());

  // WHEN
  const result = subject.parse(program);

  // THEN
  expect(result).toStrictEqual({
    type: "Program",
    body: [
      {
        type: "TwigBlock",
        name: "my_first_block",
        body: [],
      },
      {
        type: "TwigBlock",
        name: "my_second_block",
        body: [],
      },
    ],
  });
});

test("parse nested Twig blocks", () => {
  // GIVEN
  const program = `
{% block my_parent_block %}
  {% block my_child_block %}{% endblock %}
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
        name: "my_parent_block",
        body: [
          {
            type: "TwigBlock",
            name: "my_child_block",
            body: [],
          },
        ],
      },
    ],
  });
});

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
