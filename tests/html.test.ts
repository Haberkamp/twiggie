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
        attributes: [],
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
        attributes: [],
      },
      {
        type: "HTMLTag",
        name: "div",
        body: [],
        attributes: [],
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
        attributes: [],
        body: [
          {
            type: "HTMLTag",
            name: "div",
            body: [],
            attributes: [],
          },
        ],
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
        attributes: [],
      },
    ],
  });
});

test("parses self-closing HTML tag with an attribute", () => {
  // GIVEN
  const program = "<input disabled />";
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
        attributes: [
          {
            type: "HTMLAttribute",
            name: "disabled",
          },
        ],
        body: [],
      },
    ],
  });
});

test("parses HTML tag with an attribute", () => {
  // GIVEN
  const program = "<div hidden></div>";
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
        attributes: [
          {
            type: "HTMLAttribute",
            name: "hidden",
          },
        ],
        body: [],
      },
    ],
  });
});

test("parses HTML attribute with a value", () => {
  // GIVEN
  const program = '<div class="my-class"></div>';
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
        attributes: [
          {
            type: "HTMLAttribute",
            name: "class",
            value: "my-class",
          },
        ],
        body: [],
      },
    ],
  });
});

test("parse HTML tag with multiple attributes", () => {
  // GIVEN
  const program = '<button class="my-class" id="my-id" disabled></button>';
  const subject = new Parser(new Tokenizer());

  // WHEN
  const result = subject.parse(program);

  // THEN
  expect(result).toStrictEqual({
    type: "Program",
    body: [
      {
        type: "HTMLTag",
        name: "button",
        attributes: [
          {
            type: "HTMLAttribute",
            name: "class",
            value: "my-class",
          },
          {
            type: "HTMLAttribute",
            name: "id",
            value: "my-id",
          },
          {
            type: "HTMLAttribute",
            name: "disabled",
          },
        ],
        body: [],
      },
    ],
  });
});
