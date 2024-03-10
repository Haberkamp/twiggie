import { type Token, Tokenizer } from "@/Tokenizer";

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
      body: this.NodeList(),
    };
  }

  private NodeList(
    options: { stopAt: string | string[] } | undefined = undefined,
  ) {
    const nodes = [];
    const stopAt = Array.isArray(options?.stopAt)
      ? options.stopAt
      : [options?.stopAt];

    while (this.lookahead !== null && !stopAt.includes(this.lookahead.type)) {
      switch (this.lookahead.type) {
        case "TEXT":
          nodes.push(this.Text());
          break;
        case "HTML_ATTRIBUTE":
          nodes.push(this.HTMLAttribute());
          break;
        default:
          nodes.push(this.Tag());
      }
    }

    return nodes;
  }

  private Text() {
    const { value } = this.eat("TEXT");

    return {
      type: "Text",
      value,
    };
  }

  private Tag() {
    const token = this.lookahead;
    // TODO: add autocompletion for .type property
    if (token?.type === "START_OF_HTML_OPENING_TAG") return this.HTMLTag();

    return this.TwigBlock();
  }

  private HTMLTag(): {
    type: string;
    name: string;
    body: any[];
    attributes: ReturnType<Parser["HTMLAttribute"]>[];
  } {
    const token = this.eat("START_OF_HTML_OPENING_TAG");
    const name = token.value.match(/\w+/)![0];

    const hasAttributes = this.lookahead?.type === "HTML_ATTRIBUTE";

    const attributes =
      // TODO: I think the lookahead is always defined so we don't
      //  need the optional chaining operator
      hasAttributes && this.lookahead?.type !== "END_OF_HTML_TAG"
        ? this.NodeList({
            stopAt: ["END_OF_HTML_TAG", "END_OF_SELF_CLOSING_HTML_TAG"],
          })
        : [];

    const isSelfClosing =
      this.lookahead?.type === "END_OF_SELF_CLOSING_HTML_TAG";
    if (isSelfClosing) {
      this.eat("END_OF_SELF_CLOSING_HTML_TAG");

      return {
        type: "HTMLTag",
        name,
        attributes,
        body: [],
      };
    }

    this.eat("END_OF_HTML_TAG");

    const body =
      this.lookahead?.type !== "START_OF_HTML_CLOSING_TAG"
        ? this.NodeList({ stopAt: "START_OF_HTML_CLOSING_TAG" })
        : [];

    this.eat("START_OF_HTML_CLOSING_TAG");
    this.eat("END_OF_HTML_TAG");

    return {
      type: "HTMLTag",
      name,
      attributes,
      body,
    };
  }

  private HTMLAttribute() {
    const token = this.eat("HTML_ATTRIBUTE");

    const match = /".*"/.exec(token.value)!;
    const noAttribute = !match;
    if (noAttribute) {
      return {
        type: "HTMLAttribute",
        name: token.value,
      };
    }

    return {
      type: "HTMLAttribute",
      name: token.value.split("=")[0],
      value: match[0].slice(1, -1),
    };
  }

  private TwigBlock(): { type: string; name: string; body: any[] } {
    const token = this.eat("TWIG_START_BLOCK");

    const body =
      this.lookahead?.type !== "TWIG_END_BLOCK"
        ? this.NodeList({ stopAt: "TWIG_END_BLOCK" })
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
