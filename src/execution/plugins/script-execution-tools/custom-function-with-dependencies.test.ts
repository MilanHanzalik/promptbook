import { describe, expect, it } from '@jest/globals';
import { spaceTrim } from 'spacetrim';
import { promptbookStringToJson } from './../../../conversion/promptbookStringToJson';
import type { PromptbookString } from './../../../types/PromptbookString';
import { countCharacters } from './../../../utils/expectation-counters/countCharacters';
import { countWords } from './../../../utils/expectation-counters/countWords';
import { createPromptbookExecutor } from './../../createPromptbookExecutor';
import { MockedEchoLlmExecutionTools } from './../llm-execution-tools/mocked/MockedEchoLlmExecutionTools';
import { CallbackInterfaceTools } from './../user-interface-execution-tools/callback/CallbackInterfaceTools';
import { JavascriptExecutionTools } from './javascript/JavascriptExecutionTools';

describe('createPromptbookExecutor + custom function with dependencies', () => {
    const promptbook = promptbookStringToJson(
        spaceTrim(`
            # Custom functions

            Show how to use custom postprocessing functions with dependencies

            -   PROMPTBOOK VERSION 1.0.0
            -   INPUT  PARAMETER {yourName} Name of the hero
            -   OUTPUT PARAMETER {greeting}

            ## Question

            -   SIMPLE TEMPLATE
            -   POSTPROCESSING addHello
            -   POSTPROCESSING withStatistics

            \`\`\`markdown
            {yourName} the Evangelist
            \`\`\`

            -> {greeting}
         `) as PromptbookString,
    );

    const promptbookExecutor = createPromptbookExecutor({
        promptbook,
        tools: {
            llm: new MockedEchoLlmExecutionTools({ isVerbose: true }),
            script: [
                new JavascriptExecutionTools({
                    isVerbose: true,

                    // Note: [🕎]
                    functions: {
                        addHello(value) {
                            return `Hello ${value}`;
                        },
                        withStatistics(value) {
                            // Note: Testing custom function with dependencies
                            return value + ` (${countCharacters(value)} characters, ${countWords(value)} words)`;
                        },
                    },
                }),
            ],
            userInterface: new CallbackInterfaceTools({
                isVerbose: true,
                async callback() {
                    return 'Hello';
                },
            }),
        },
        settings: {
            maxExecutionAttempts: 3,
        },
    });

    it('should use custom postprocessing function', () => {
        expect(promptbookExecutor({ yourName: 'Matthew' }, () => {})).resolves.toMatchObject({
            isSuccessful: true,
            errors: [],
            outputParameters: {
                greeting: 'Hello Matthew the Evangelist (28 characters, 4 words)',
            },
        });

        expect(promptbookExecutor({ yourName: 'Mark' }, () => {})).resolves.toMatchObject({
            isSuccessful: true,
            errors: [],
            outputParameters: {
                greeting: 'Hello Mark the Evangelist (25 characters, 4 words)',
            },
        });

        expect(promptbookExecutor({ yourName: 'Luke' }, () => {})).resolves.toMatchObject({
            isSuccessful: true,
            errors: [],
            outputParameters: {
                greeting: 'Hello Luke the Evangelist (25 characters, 4 words)',
            },
        });

        expect(promptbookExecutor({ yourName: 'John' }, () => {})).resolves.toMatchObject({
            isSuccessful: true,
            errors: [],
            outputParameters: {
                greeting: 'Hello John the Evangelist (25 characters, 4 words)',
            },
        });
    });
});
