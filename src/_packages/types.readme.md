This package is usefull when you want to explicitly define types in your code.

```typescript
import type { PromptbookJson } from '@promptbook/types';
import { promptbookStringToJson } from '@promptbook/core';

const promptbook: PromptbookJson = promptbookStringToJson(...);
```

_Note: `@promptbook/types` does not export brand-specific types like `OpenAiExecutionToolsOptions`, `ClaudeExecutionToolsOptions`, `LangchainExecutionToolsOptions`,... etc._
