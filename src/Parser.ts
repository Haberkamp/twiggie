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

  private NodeList(options: { stopAt: string } | undefined = undefined) {
    const nodes = [];

    while (this.lookahead !== null && this.lookahead.type !== options?.stopAt) {
      switch (this.lookahead.type) {
        case "TEXT":
          nodes.push(this.Text());
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
      const attributes = token.value
        .slice(1 + name.length, -2)
        .trim()
        .split(/(?:(?<=["'])\s+|\s+(?=["'])|^|$)/)
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
    const attributes = token.value
      .slice(1 + name.length, -1)
      .trim()
      .split(/(?:(?<=["'])\s+|\s+(?=["'])|^|$)/)
      .map((rawAttribute) => this.HTMLAttribute(rawAttribute));

    const body =
      // TODO: I think the lookahead is always defined so we don't
      //  need the optional chaining operator
      this.lookahead?.type !== "HTML_CLOSING_TAG"
        ? this.NodeList({ stopAt: "HTML_CLOSING_TAG" })
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
    const hasValue = rawAttribute.includes("=");
    const name = hasValue ? rawAttribute.split("=")[0] : rawAttribute;

    if (hasValue) {
      return {
        type: "HTMLAttribute",
        name,
        value: rawAttribute.split("=")[1]!.slice(1, -1),
      };
    }

    return {
      type: "HTMLAttribute",
      name,
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
