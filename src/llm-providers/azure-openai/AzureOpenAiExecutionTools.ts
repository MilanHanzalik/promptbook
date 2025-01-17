import { AzureKeyCredential, OpenAIClient } from '@azure/openai';
import colors from 'colors';
import { ExecutionError } from '../../errors/ExecutionError';
import type { AvailableModel } from '../../execution/LlmExecutionTools';
import type { LlmExecutionTools } from '../../execution/LlmExecutionTools';
import type { PromptChatResult } from '../../execution/PromptResult';
import type { PromptCompletionResult } from '../../execution/PromptResult';
import type { PromptResultUsage } from '../../execution/PromptResult';
import { computeUsageCounts } from '../../execution/utils/computeUsageCounts';
import { uncertainNumber } from '../../execution/utils/uncertainNumber';
import type { Prompt } from '../../types/Prompt';
import type { string_date_iso8601 } from '../../types/typeAliases';
import { getCurrentIsoDate } from '../../utils/getCurrentIsoDate';
import { OPENAI_MODELS } from '../openai/openai-models';
import type { AzureOpenAiExecutionToolsOptions } from './AzureOpenAiExecutionToolsOptions';

/**
 * Execution Tools for calling Azure OpenAI API.
 */
export class AzureOpenAiExecutionTools implements LlmExecutionTools {
    /**
     * OpenAI Azure API client.
     */
    private readonly client: OpenAIClient;

    /**
     * Creates OpenAI Execution Tools.
     *
     * @param options which are relevant are directly passed to the OpenAI client
     */
    public constructor(private readonly options: AzureOpenAiExecutionToolsOptions) {
        this.client = new OpenAIClient(
            `https://${options.resourceName}.openai.azure.com/`,
            new AzureKeyCredential(options.apiKey),
        );
    }

    /**
     * Calls OpenAI API to use a chat model.
     */
    public async callChatModel(prompt: Pick<Prompt, 'content' | 'modelRequirements'>): Promise<PromptChatResult> {
        if (this.options.isVerbose) {
            console.info('💬 OpenAI callChatModel call');
        }

        const { content, modelRequirements } = prompt;

        // TODO: [☂] Use here more modelRequirements
        if (modelRequirements.modelVariant !== 'CHAT') {
            throw new ExecutionError('Use callChatModel only for CHAT variant');
        }

        try {
            const modelName = prompt.modelRequirements.modelName || this.options.deploymentName;
            const modelSettings = {
                maxTokens: modelRequirements.maxTokens,
                //                                      <- TODO: Make some global max cap for maxTokens
                user: this.options.user,
            };

            const messages = [
                {
                    role: 'user',
                    content,
                },
            ];

            const start: string_date_iso8601 = getCurrentIsoDate();
            let complete: string_date_iso8601;

            if (this.options.isVerbose) {
                console.info(colors.bgWhite('messages'), JSON.stringify(messages, null, 4));
            }
            const rawResponse = await this.client.getChatCompletions(modelName, messages, modelSettings);

            if (this.options.isVerbose) {
                console.info(colors.bgWhite('rawResponse'), JSON.stringify(rawResponse, null, 4));
            }

            if (!rawResponse.choices[0]) {
                throw new ExecutionError('No choises from Azure OpenAI');
            }

            if (rawResponse.choices.length > 1) {
                // TODO: This should be maybe only warning
                throw new ExecutionError('More than one choise from Azure OpenAI');
            }

            if (!rawResponse.choices[0].message || !rawResponse.choices[0].message.content) {
                throw new ExecutionError('Empty response from Azure OpenAI');
            }

            const resultContent = rawResponse.choices[0].message.content;
            // eslint-disable-next-line prefer-const
            complete = getCurrentIsoDate();
            const usage = {
                price: uncertainNumber() /* <- TODO: [🐞] Compute usage */,
                input: {
                    tokensCount: uncertainNumber(rawResponse.usage?.promptTokens),
                    ...computeUsageCounts(prompt.content),
                },
                output: {
                    tokensCount: uncertainNumber(rawResponse.usage?.completionTokens),
                    ...computeUsageCounts(prompt.content),
                },
            } satisfies PromptResultUsage;

            return {
                content: resultContent,
                modelName,
                timing: {
                    start,
                    complete,
                },
                usage,
                rawResponse,
                // <- [🤹‍♂️]
            };
        } catch (error) {
            throw this.transformAzureError(error as { code: string; message: string });
        }
    }

    /**
     * Calls Azure OpenAI API to use a complete model.
     */
    public async callCompletionModel(
        prompt: Pick<Prompt, 'content' | 'modelRequirements'>,
    ): Promise<PromptCompletionResult> {
        if (this.options.isVerbose) {
            console.info('🖋 OpenAI callCompletionModel call');
        }

        const { content, modelRequirements } = prompt;

        // TODO: [☂] Use here more modelRequirements
        if (modelRequirements.modelVariant !== 'COMPLETION') {
            throw new ExecutionError('Use callCompletionModel only for COMPLETION variant');
        }

        try {
            const modelName = prompt.modelRequirements.modelName || this.options.deploymentName;
            const modelSettings = {
                maxTokens: modelRequirements.maxTokens || 2000, // <- Note: 2000 is for lagacy reasons
                //                                                  <- TODO: Make some global max cap for maxTokens
                user: this.options.user,
            };

            const start: string_date_iso8601 = getCurrentIsoDate();
            let complete: string_date_iso8601;

            if (this.options.isVerbose) {
                console.info(colors.bgWhite('content'), JSON.stringify(content, null, 4));
            }
            const rawResponse = await this.client.getCompletions(modelName, [content], modelSettings);
            if (this.options.isVerbose) {
                console.info(colors.bgWhite('rawResponse'), JSON.stringify(rawResponse, null, 4));
            }

            if (!rawResponse.choices[0]) {
                throw new ExecutionError('No choises from OpenAI');
            }

            if (rawResponse.choices.length > 1) {
                // TODO: This should be maybe only warning
                throw new ExecutionError('More than one choise from OpenAI');
            }

            const resultContent = rawResponse.choices[0].text;
            // eslint-disable-next-line prefer-const
            complete = getCurrentIsoDate();

            const usage = {
                price: uncertainNumber() /* <- TODO: [🐞] Compute usage */,
                input: {
                    tokensCount: uncertainNumber(rawResponse.usage?.promptTokens),
                    ...computeUsageCounts(prompt.content),
                },
                output: {
                    tokensCount: uncertainNumber(rawResponse.usage?.completionTokens),
                    ...computeUsageCounts(prompt.content),
                },
            } satisfies PromptResultUsage;

            return {
                content: resultContent,
                modelName,
                timing: {
                    start,
                    complete,
                },
                usage,
                rawResponse,
                // <- [🤹‍♂️]
            };
        } catch (error) {
            throw this.transformAzureError(error as { code: string; message: string });
        }
    }

    /**
     * Changes Azure error (which is not propper Error but object) to propper Error
     */
    private transformAzureError(azureError: { code: string; message: string }): Error {
        if (typeof azureError !== 'object' || azureError === null) {
            return new ExecutionError(`Unknown Azure OpenAI error`);
        }

        const { code, message } = azureError;
        return new ExecutionError(`${code}: ${message}`);
    }

    /**
     * List all available Azure OpenAI models that can be used
     */
    public async listModels(): Promise<Array<AvailableModel>> {
        // TODO: !!! Do here some filtering which models are really available as deployment
        //       @see https://management.azure.com/subscriptions/subscriptionId/resourceGroups/resourceGroupName/providers/Microsoft.CognitiveServices/accounts/accountName/deployments?api-version=2023-05-01
        return OPENAI_MODELS.map(
            ({
                modelTitle,
                modelName,

                modelVariant,
            }) => ({
                modelTitle: `Azure ${modelTitle}`,
                modelName,
                modelVariant,
            }),
        );
    }
}

/**
 * TODO: Maybe Create some common util for callChatModel and callCompletionModel
 * TODO: Maybe make custom AzureOpenaiError
 */
