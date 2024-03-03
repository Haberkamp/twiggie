import { Parser } from "@/Parser";
import { Tokenizer } from "@/Tokenizer";
import fs from "node:fs";

const parser = new Parser(new Tokenizer());

const input = fs.readFileSync("./example/index.html", "utf8");
const result = parser.parse(input);

fs.writeFileSync(
  "./example/output.json",
  JSON.stringify(result, null, 2) + "\n",
);
