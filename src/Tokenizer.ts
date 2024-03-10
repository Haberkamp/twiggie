const enum State {
  Global = "GLOBAL",
  InHTMLOpenTag = "IN_HTML_OPEN_TAG",
  InHTMLClosingTag = "IN_HTML_CLOSING_TAG",
}

const spec: Array<[RegExp, null | string, State | null, State]> = [
  // 1. Stuff we ignore
  [/^\s+/, null, null, State.Global],
  [/^<!--.*-->/, null, null, State.Global],
  [/^<!DOCTYPE html>/, null, null, State.Global],

  // 2. Twig Syntax
  [/^{% block \w+ %}/, "TWIG_START_BLOCK", null, State.Global],
  [/^{% endblock %}/, "TWIG_END_BLOCK", null, State.Global],

  // 3. HTML syntax
  [/^<\w+/, "START_OF_HTML_OPENING_TAG", State.InHTMLOpenTag, State.Global],
  [/^\/>/, "END_OF_SELF_CLOSING_HTML_TAG", State.Global, State.Global],
  [/^>/, "END_OF_HTML_TAG", State.Global, State.Global],
  [
    /^<\/\w+/,
    "START_OF_HTML_CLOSING_TAG",
    State.InHTMLClosingTag,
    State.Global,
  ],
  [/^[\w-]+((="([^"]*)"))?/, "HTML_ATTRIBUTE", null, State.InHTMLOpenTag],

  // 4. Literal values
  [/^[\d\w\s\!\?\=\_\,]+\b(!|\?)*/, "TEXT", null, State.Global],
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

  private state: State = State.Global;

  init(program: string) {
    this.string = program;
  }

  public getNextToken(): Token | null {
    const ranOutOfTokens = !this.hasMoreTokens();
    if (ranOutOfTokens) {
      return null;
    }

    const string = this.string.slice(this.cursor);

    for (const [regex, type, newStateAfterMatch, expectedState] of spec) {
      // skip rule because it does not apply to the current context
      const ruleDoesNotApplyToCurrentState =
        expectedState !== State.Global && expectedState !== this.state;

      if (ruleDoesNotApplyToCurrentState) continue;

      const tokenValue = this.match(regex, string);

      // Can't match this rule, try the next one.
      if (!tokenValue) continue;

      // skip token, e.g. whitespace
      if (type === null) return this.getNextToken();

      // Now we have a match, define the state where the token will be in
      // when it matches the upcoming token.
      if (newStateAfterMatch) this.state = newStateAfterMatch;

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
