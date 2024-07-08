import { describe, expect, it } from '@jest/globals';
import { spaceTrim } from 'spacetrim';
import { forTime } from 'waitasecond';
import { pipelineStringToJson } from '../../conversion/pipelineStringToJson';
import { createPromptbookExecutor } from '../../execution/createPromptbookExecutor';
import { CallbackInterfaceTools } from '../../knowledge/dialogs/callback/CallbackInterfaceTools';
import { MockedEchoLlmExecutionTools } from '../../llm-providers/mocked/MockedEchoLlmExecutionTools';
import type { PipelineString } from '../../types/PipelineString';
import { JavascriptExecutionTools } from '../javascript/JavascriptExecutionTools';

describe('createPromptbookExecutor + custom async function ', () => {
    it('should use custom postprocessing function', () => {
        expect(
            getPromptbookExecutor().then((promptbookExecutor) => promptbookExecutor({ yourName: 'Matthew' }, () => {})),
        ).resolves.toMatchObject({
            isSuccessful: true,
            errors: [],
            outputParameters: {
                greeting: 'Hello Matthew the Evangelist',
            },
        });

        expect(
            getPromptbookExecutor().then((promptbookExecutor) => promptbookExecutor({ yourName: 'Mark' }, () => {})),
        ).resolves.toMatchObject({
            isSuccessful: true,
            errors: [],
            outputParameters: {
                greeting: 'Hello Mark the Evangelist',
            },
        });

        expect(
            getPromptbookExecutor().then((promptbookExecutor) => promptbookExecutor({ yourName: 'Luke' }, () => {})),
        ).resolves.toMatchObject({
            isSuccessful: true,
            errors: [],
            outputParameters: {
                greeting: 'Hello Luke the Evangelist',
            },
        });

        expect(
            getPromptbookExecutor().then((promptbookExecutor) => promptbookExecutor({ yourName: 'John' }, () => {})),
        ).resolves.toMatchObject({
            isSuccessful: true,
            errors: [],
            outputParameters: {
                greeting: 'Hello John the Evangelist',
            },
        });
    });
});

async function getPromptbookExecutor() {
    const promptbook = await pipelineStringToJson(
        spaceTrim(`
            # Custom functions

            Show how to use custom postprocessing async function

            -   PROMPTBOOK VERSION 1.0.0
            -   INPUT  PARAMETER {yourName} Name of the hero
            -   OUTPUT PARAMETER {greeting}

            ## Question

            -   SIMPLE TEMPLATE
            -   POSTPROCESSING addHello

            \`\`\`markdown
            {yourName} the Evangelist
            \`\`\`

            -> {greeting}
        `) as PipelineString,
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
                        async addHello(value) {
                            await forTime(1000);
                            return `Hello ${value}`;
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

    return promptbookExecutor;
}
