import { Parser } from "./Parser";
import { Tokenizer } from "./Tokenizer";

const parser = new Parser(new Tokenizer());

export const parseTwig = parser.parse.bind(parser);
