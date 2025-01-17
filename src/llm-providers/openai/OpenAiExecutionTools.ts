import colors from 'colors';
import OpenAI from 'openai';
import spaceTrim from 'spacetrim';
import { ExecutionError } from '../../errors/ExecutionError';
import { UnexpectedError } from '../../errors/UnexpectedError';
import type { AvailableModel } from '../../execution/LlmExecutionTools';
import type { LlmExecutionTools } from '../../execution/LlmExecutionTools';
import type { PromptChatResult } from '../../execution/PromptResult';
import type { PromptCompletionResult } from '../../execution/PromptResult';
import type { PromptEmbeddingResult } from '../../execution/PromptResult';
import type { Prompt } from '../../types/Prompt';
import type { string_date_iso8601 } from '../../types/typeAliases';
import type { string_model_name } from '../../types/typeAliases';
import { getCurrentIsoDate } from '../../utils/getCurrentIsoDate';
import type { OpenAiExecutionToolsOptions } from './OpenAiExecutionToolsOptions';
import { computeOpenaiUsage } from './computeOpenaiUsage';
import { OPENAI_MODELS } from './openai-models';

/**
 * Execution Tools for calling OpenAI API.
 */
export class OpenAiExecutionTools implements LlmExecutionTools {
    /**
     * OpenAI API client.
     */
    private readonly client: OpenAI;

    /**
     * Creates OpenAI Execution Tools.
     *
     * @param options which are relevant are directly passed to the OpenAI client
     */
    public constructor(private readonly options: OpenAiExecutionToolsOptions = {}) {
        // Note: Passing only OpenAI relevant options to OpenAI constructor
        const openAiOptions = { ...options };
        delete openAiOptions.isVerbose;
        delete openAiOptions.user;
        this.client = new OpenAI({
            ...openAiOptions,
        });
    }

    /**
     * Calls OpenAI API to use a chat model.
     */
    public async callChatModel(
        prompt: Pick<Prompt, 'content' | 'modelRequirements' | 'expectFormat'>,
    ): Promise<PromptChatResult> {
        if (this.options.isVerbose) {
            console.info('💬 OpenAI callChatModel call', { prompt });
        }

        const { content, modelRequirements, expectFormat } = prompt;

        // TODO: [☂] Use here more modelRequirements
        if (modelRequirements.modelVariant !== 'CHAT') {
            throw new ExecutionError('Use callChatModel only for CHAT variant');
        }

        const model = modelRequirements.modelName || this.getDefaultChatModel().modelName;
        const modelSettings = {
            model,
            max_tokens: modelRequirements.maxTokens,
            //                                   <- TODO: Make some global max cap for maxTokens
        } as OpenAI.Chat.Completions.CompletionCreateParamsNonStreaming; // <- TODO: Guard here types better

        if (expectFormat === 'JSON') {
            modelSettings.response_format = {
                type: 'json_object',
            };
        }

        const rawRequest: OpenAI.Chat.Completions.CompletionCreateParamsNonStreaming = {
            ...modelSettings,
            messages: [
                {
                    role: 'user',
                    content,
                },
            ],
            user: this.options.user,
        };
        const start: string_date_iso8601 = getCurrentIsoDate();
        let complete: string_date_iso8601;

        if (this.options.isVerbose) {
            console.info(colors.bgWhite('rawRequest'), JSON.stringify(rawRequest, null, 4));
        }
        const rawResponse = await this.client.chat.completions.create(rawRequest);
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

        const resultContent = rawResponse.choices[0].message.content;
        // eslint-disable-next-line prefer-const
        complete = getCurrentIsoDate();
        const usage = computeOpenaiUsage(content, resultContent || '', rawResponse);

        if (resultContent === null) {
            throw new ExecutionError('No response message from OpenAI');
        }

        return {
            content: resultContent,
            modelName: rawResponse.model || model,
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
     * Calls OpenAI API to use a complete model.
     */
    public async callCompletionModel(
        prompt: Pick<Prompt, 'content' | 'modelRequirements'>,
    ): Promise<PromptCompletionResult> {
        if (this.options.isVerbose) {
            console.info('🖋 OpenAI callCompletionModel call', { prompt });
        }

        const { content, modelRequirements } = prompt;

        // TODO: [☂] Use here more modelRequirements
        if (modelRequirements.modelVariant !== 'COMPLETION') {
            throw new ExecutionError('Use callCompletionModel only for COMPLETION variant');
        }

        const model = modelRequirements.modelName || this.getDefaultCompletionModel().modelName;
        const modelSettings = {
            model,
            max_tokens: modelRequirements.maxTokens || 2000, // <- Note: 2000 is for lagacy reasons
            //                                                  <- TODO: Make some global max cap for maxTokens
        };

        const rawRequest: OpenAI.Completions.CompletionCreateParamsNonStreaming = {
            ...modelSettings,
            prompt: content,
            user: this.options.user,
        };
        const start: string_date_iso8601 = getCurrentIsoDate();
        let complete: string_date_iso8601;

        if (this.options.isVerbose) {
            console.info(colors.bgWhite('rawRequest'), JSON.stringify(rawRequest, null, 4));
        }
        const rawResponse = await this.client.completions.create(rawRequest);
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
        const usage = computeOpenaiUsage(content, resultContent || '', rawResponse);

        return {
            content: resultContent,
            modelName: rawResponse.model || model,
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
     * Calls OpenAI API to use a embedding model
     */
    public async embed(prompt: Pick<Prompt, 'content' | 'modelRequirements'>): Promise<PromptEmbeddingResult> {
        if (this.options.isVerbose) {
            console.info('🖋 OpenAI embedding call', { prompt });
        }

        const { content, modelRequirements } = prompt;

        // TODO: [☂] Use here more modelRequirements
        if (modelRequirements.modelVariant !== 'EMBEDDING') {
            throw new ExecutionError('Use embed only for EMBEDDING variant');
        }

        const model = modelRequirements.modelName || this.getDefaultEmbeddingModel().modelName;

        const rawRequest: OpenAI.Embeddings.EmbeddingCreateParams = {
            input: content,
            model,

            // TODO: !!!! Test model 3 and dimensions
        };

        const start: string_date_iso8601 = getCurrentIsoDate();
        let complete: string_date_iso8601;

        if (this.options.isVerbose) {
            console.info(colors.bgWhite('rawRequest'), JSON.stringify(rawRequest, null, 4));
        }

        const rawResponse = await this.client.embeddings.create(rawRequest);

        if (this.options.isVerbose) {
            console.info(colors.bgWhite('rawResponse'), JSON.stringify(rawResponse, null, 4));
        }

        if (rawResponse.data.length !== 1) {
            throw new ExecutionError(`Expected exactly 1 data item in response, got ${rawResponse.data.length}`);
        }

        const resultContent = rawResponse.data[0]!.embedding;

        // eslint-disable-next-line prefer-const
        complete = getCurrentIsoDate();
        const usage = computeOpenaiUsage(content, '', rawResponse);

        return {
            content: resultContent,
            modelName: rawResponse.model || model,
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
     * Get the model that should be used as default
     */
    private getDefaultModel(defaultModelName: string_model_name): AvailableModel {
        const model = OPENAI_MODELS.find(({ modelName }) => modelName === defaultModelName);
        if (model === undefined) {
            throw new UnexpectedError(
                spaceTrim(
                    (block) =>
                        `
                            Cannot find model in OpenAI models with name ${defaultModelName} which should be used as default.

                            Available models:
                            ${block(OPENAI_MODELS.map(({ modelName }) => `- ${modelName}`).join('\n'))}

                        `,
                ),
            );
        }
        return model;
    }

    /**
     * Default model for chat variant.
     */
    private getDefaultChatModel(): AvailableModel {
        return this.getDefaultModel('gpt-4o');
    }

    /**
     * Default model for completion variant.
     */
    private getDefaultCompletionModel(): AvailableModel {
        return this.getDefaultModel('gpt-3.5-turbo-instruct');
    }

    /**
     * Default model for completion variant.
     */
    private getDefaultEmbeddingModel(): AvailableModel {
        return this.getDefaultModel('text-embedding-3-large');
    }

    /**
     * List all available OpenAI models that can be used
     */
    public listModels(): Array<AvailableModel> {
        /*
        Note: Dynamic lising of the models
        const models = await this.openai.models.list({});

        console.log({ models });
        console.log(models.data);
        */

        return OPENAI_MODELS;
    }
}

/**
 * TODO: [🧠][🧙‍♂️] Maybe there can be some wizzard for thoose who want to use just OpenAI
 * TODO: Maybe Create some common util for callChatModel and callCompletionModel
 * TODO: Maybe make custom OpenaiError
 */
