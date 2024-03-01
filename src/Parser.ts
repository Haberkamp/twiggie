import { type Token, Tokenizer } from "./Tokenizer";

export class Parser {
  private string: string = "";

  private lookahead: Token | null = null;

  constructor(private tokenizer: Tokenizer) {}

  parse(program: string) {
    this.string = program;
    this.tokenizer.init(program);

    this.lookahead = this.tokenizer.getNextToken();

    return this.Program();
  }

  Program() {
    return {
      type: "Program",
      body: this.TagList(),
    };
  }

  TagList() {
    const tags = [];

    while (this.lookahead !== null) {
      const result = this.Tag();
      tags.push(result);
    }

    return tags;
  }

  Tag() {
    return this.TwigBlock();
  }

  TwigBlock() {
    const token = this.eat("TWIG_START_BLOCK");

    this.eat("TWIG_END_BLOCK");

    return {
      type: "TwigBlock",
      name: token.value.split(" ")[2],
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
