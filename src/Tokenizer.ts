const spec: Array<[RegExp, null | string]> = [
  // 1. Stuff we ignore
  [/^\s+/, null],
  [/^<!--.*-->/, null],

  // 2. Twig Syntax
  [/^{% block \w+ %}/, "TWIG_START_BLOCK"],
  [/^{% endblock %}/, "TWIG_END_BLOCK"],

  // 3. HTML syntax
  [/^<\w+\s*([\w-]+\s*)*\s*>/, "HTML_OPENING_TAG"],
  [/^<\/\w+>/, "HTML_CLOSING_TAG"],
  [/^<\w+\s*([\w-]+\s*)*\s*\/>/, "HTML_SELF_CLOSING_TAG"],

  // 4. Literal values
  [/^\S+/, "LITERAL"],
];

export type Token = {
  type: string;
  value: string;
};

/**
 * Tokenizer specification
 */
export class Tokenizer {
  private cursor: number = 0;
  private string: string = "";

  init(program: string) {
    this.string = program;
  }

  public getNextToken(): Token | null {
    const ranOutOfTokens = !this.hasMoreTokens();
    if (ranOutOfTokens) {
      return null;
    }

    const string = this.string.slice(this.cursor);

    for (const [regex, type] of spec) {
      const tokenValue = this.match(regex, string);

      // Can't match this rule, try the next one.
      if (!tokenValue) continue;

      // skip token, e.g. whitespace
      if (type === null) return this.getNextToken();

      return {
        type,
        value: tokenValue,
      };
    }

    throw new SyntaxError(`Unexpected token: ${string[0]}`);
  }

  private hasMoreTokens() {
    return this.cursor < this.string.length;
  }

  private match(regex: RegExp, string: string) {
    const matched = regex.exec(string);
    if (!matched) return null;

    this.cursor += matched[0].length;
    return matched[0];
  }
}
