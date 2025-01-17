# ✨ Sample: Parsing data to JSON

-   PIPELINE URL https://promptbook.studio/samples/expect-json.ptbk.md
-   PROMPTBOOK VERSION 1.0.0
-   INPUT  PARAMETER {sentence} Sentence to be processed
-   OUTPUT PARAMETER `{parsedSentence}`

<!--Graph-->
<!-- ⚠️ WARNING: This section was auto-generated -->

```mermaid
%% 🔮 Tip: Open this on GitHub or in the VSCode website to see the Mermaid graph visually

flowchart LR
  subgraph "✨ Sample: Parsing data to JSON"

      direction TB

      input((Input)):::input
      templateQuestion("💬 Question")
      input--"{sentence}"-->templateQuestion

      templateQuestion--"{parsedSentence}"-->output
      output((Output)):::output

      click templateQuestion href "#question" "💬 Question";

      classDef input color: grey;
      classDef output color: grey;

  end;
```

<!--/Graph-->

## 💬 Question

-   MODEL VARIANT Completion
-   MODEL NAME `gpt-3.5-turbo-instruct`
-   POSTPROCESSING `trimEndOfCodeBlock`
-   Expect JSON

```
Dark horse hopping over the fence.

\`\`\`json
{
  "subject": "horse",
  "action": "hopping",
  "object": "fence"
}
\`\`\`

---

{sentence}

\`\`\`json
```

-> {parsedSentence}
