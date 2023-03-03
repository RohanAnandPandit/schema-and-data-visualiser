// import { UnControlled as CodeMirror } from "react-codemirror2";
import CodeMirror from "@uiw/react-codemirror";
import "codemirror/addon/edit/closebrackets";
import "codemirror/mode/sparql/sparql";
import "codemirror/addon/hint/show-hint";
import "codemirror/addon/hint/anyword-hint";
import { StreamLanguage } from "@codemirror/language";
import { sparql } from "@codemirror/legacy-modes/mode/sparql";
import { duotoneLight, duotoneDark } from "@uiw/codemirror-theme-duotone";
import { autocompletion, CompletionContext } from "@codemirror/autocomplete";

type CodeEditorProps = {
  code: string;
  setCode: React.Dispatch<React.SetStateAction<string>>;
  language: string;
  darkTheme: boolean
};

const languageParsers: any = {
  sparql: sparql,
};

const keywords: { [language: string]: string[] } = {
  sparql: ["SELECT", "WHERE", "CONSTRUCT", "PREFIX", "LIMIT"],
};

const CodeEditor = ({ code, setCode, language, darkTheme }: CodeEditorProps) => {
  const myCompletions = (context: CompletionContext) => {
    let word = context.matchBefore(/\w*/)!;
    if (word.from === word.to && !context.explicit) return null;
    return {
      from: word.from,
      options: keywords[language].map((kw) => {
        return { label: kw, type: "keyword" };
      }),
    };
  };

  return (
    <CodeMirror
      value={code}
      basicSetup={{
        autocompletion: true,
      }}
      height="200px"
      extensions={[
        StreamLanguage.define(languageParsers[language]),
        autocompletion({ override: [myCompletions] }),
      ]}
      onChange={(value: string, viewUpdate: any) => {
        setCode(value);
      }}
      theme={darkTheme ? duotoneDark : duotoneLight}
    />
  );
};

export default CodeEditor;
