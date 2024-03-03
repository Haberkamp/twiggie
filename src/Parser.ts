import { type Token, Tokenizer } from "@/Tokenizer";
import { aT } from "vitest/dist/reporters-MmQN-57K.js";

export class Parser {
  private lookahead: Token | null = null;

  constructor(private tokenizer: Tokenizer) {}

  parse(program: string) {
    this.tokenizer.init(program);

    this.lookahead = this.tokenizer.getNextToken();

    return this.Program();
  }

  private Program() {
    return {
      type: "Program",
      body: this.TagList(),
    };
  }

  private TagList(options: { stopAt: string } | undefined = undefined) {
    const tags = [];

    while (this.lookahead !== null && this.lookahead.type !== options?.stopAt) {
      tags.push(this.Tag());
    }

    return tags;
  }

  private Tag() {
    const token = this.lookahead;
    // TODO: add autocompletion for .type property
    if (
      token?.type === "HTML_OPENING_TAG" ||
      token?.type === "HTML_SELF_CLOSING_TAG"
    )
      return this.HTMLTag();

    return this.TwigBlock();
  }

  private HTMLTag(): {
    type: string;
    name: string;
    body: any[];
    attributes: ReturnType<Parser["HTMLAttribute"]>[];
  } {
    const isSelfClosingTag = this.lookahead?.type === "HTML_SELF_CLOSING_TAG";
    if (isSelfClosingTag) {
      const token = this.eat("HTML_SELF_CLOSING_TAG");

      const name = /\w+/.exec(token.value)![0];
      const attributes = [token.value.slice(1 + name.length, -2).trim()]
        .filter((attribute) => Boolean(attribute))
        .map((rawAttribute) => this.HTMLAttribute(rawAttribute));

      return {
        type: "HTMLTag",
        name: /\w+/.exec(token.value)![0],
        attributes,
        body: [],
      };
    }

    const token = this.eat("HTML_OPENING_TAG");
    const name = /\w+/.exec(token.value)![0];
    const attributes = [token.value.slice(1 + name.length, -1).trim()]
      .filter((attribute) => Boolean(attribute))
      .map((rawAttribute) => this.HTMLAttribute(rawAttribute));

    const body =
      // TODO: I think the lookahead is always defined so we don't
      //  need the optional chaining operator
      this.lookahead?.type !== "HTML_CLOSING_TAG"
        ? this.TagList({ stopAt: "HTML_CLOSING_TAG" })
        : [];

    this.eat("HTML_CLOSING_TAG");

    return {
      type: "HTMLTag",
      name,
      attributes,
      body,
    };
  }

  private HTMLAttribute(rawAttribute: string) {
    return {
      type: "HTMLAttribute",
      name: rawAttribute,
    };
  }

  private TwigBlock(): { type: string; name: string; body: any[] } {
    const token = this.eat("TWIG_START_BLOCK");

    const body =
      this.lookahead?.type !== "TWIG_END_BLOCK"
        ? this.TagList({ stopAt: "TWIG_END_BLOCK" })
        : [];

    this.eat("TWIG_END_BLOCK");

    return {
      type: "TwigBlock",
      // @ts-expect-error - The regex in the tokenizer makes sure that the Twig block has a name
      name: token.value.split(" ")[2],
      body,
    };
  }

  private eat(tokenType: string) {
    const token = this.lookahead;

    const reachedEndOfInput = token === null;
    if (reachedEndOfInput)
      throw new SyntaxError(
        `Failed to parse program; unexpected end of input, expected: ${tokenType}`,
      );

    const gotDifferentToken = token.type !== tokenType;
    if (gotDifferentToken) {
      throw new SyntaxError(
        `Failed to parse program; unexpected token ${token.type}, expected: ${tokenType}`,
      );
    }

    this.lookahead = this.tokenizer.getNextToken();

    return token;
  }
}
