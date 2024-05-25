import { AzureKeyCredential, OpenAIClient } from '@azure/openai';
import colors from 'colors';
import { PromptbookExecutionError } from '../../../../errors/PromptbookExecutionError';
import type { Prompt } from '../../../../types/Prompt';
import type { string_date_iso8601 } from '../../../../types/typeAliases';
import { getCurrentIsoDate } from '../../../../utils/getCurrentIsoDate';
import type { AvailableModel, LlmExecutionTools } from '../../../LlmExecutionTools';
import type { PromptChatResult, PromptCompletionResult } from '../../../PromptResult';
import { OPENAI_MODELS } from '../openai/models';
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
    public async gptChat(prompt: Pick<Prompt, 'content' | 'modelRequirements'>): Promise<PromptChatResult> {
        if (this.options.isVerbose) {
            console.info('💬 OpenAI gptChat call');
        }

        const { content, modelRequirements } = prompt;

        // TODO: [☂] Use here more modelRequirements
        if (modelRequirements.modelVariant !== 'CHAT') {
            throw new PromptbookExecutionError('Use gptChat only for CHAT variant');
        }

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
            throw new PromptbookExecutionError('No choises from Azure OpenAI');
        }

        if (rawResponse.choices.length > 1) {
            // TODO: This should be maybe only warning
            throw new PromptbookExecutionError('More than one choise from Azure OpenAI');
        }

        if (!rawResponse.choices[0].message || !rawResponse.choices[0].message.content) {
            throw new PromptbookExecutionError('Empty response from Azure OpenAI');
        }

        const resultContent = rawResponse.choices[0].message.content;
        // eslint-disable-next-line prefer-const
        complete = getCurrentIsoDate();
        const usage = {
            price: 'UNKNOWN',
            inputTokens: rawResponse.usage?.promptTokens || 'UNKNOWN',
            outputTokens: rawResponse.usage?.completionTokens || 'UNKNOWN' /* <- TODO: [🐞] Compute usage */,
        } as const;

        if (!resultContent) {
            throw new PromptbookExecutionError('No response message from OpenAI');
        }

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
    }

    /**
     * Calls Azure OpenAI API to use a complete model.
     */
    public async gptComplete(prompt: Pick<Prompt, 'content' | 'modelRequirements'>): Promise<PromptCompletionResult> {
        if (this.options.isVerbose) {
            console.info('🖋 OpenAI gptComplete call');
        }

        const { content, modelRequirements } = prompt;

        // TODO: [☂] Use here more modelRequirements
        if (modelRequirements.modelVariant !== 'COMPLETION') {
            throw new PromptbookExecutionError('Use gptComplete only for COMPLETION variant');
        }

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
            throw new PromptbookExecutionError('No choises from OpenAI');
        }

        if (rawResponse.choices.length > 1) {
            // TODO: This should be maybe only warning
            throw new PromptbookExecutionError('More than one choise from OpenAI');
        }

        const resultContent = rawResponse.choices[0].text;
        // eslint-disable-next-line prefer-const
        complete = getCurrentIsoDate();
        const usage = {
            price: 'UNKNOWN',
            inputTokens: rawResponse.usage.promptTokens,
            outputTokens: rawResponse.usage.completionTokens /* <- TODO: [🐞] Compute usage */,
        } as const;

        if (!resultContent) {
            throw new PromptbookExecutionError('No response message from OpenAI');
        }

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
 * TODO: [🍓][♐] Allow to list compatible models with each variant
 * TODO: Maybe Create some common util for gptChat and gptComplete
 * TODO: Maybe make custom AzureOpenaiError
 */
