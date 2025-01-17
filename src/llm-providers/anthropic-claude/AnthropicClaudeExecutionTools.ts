import Anthropic from '@anthropic-ai/sdk';
import type { MessageCreateParamsNonStreaming } from '@anthropic-ai/sdk/resources';
import colors from 'colors';
import spaceTrim from 'spacetrim';
import { ExecutionError } from '../../errors/ExecutionError';
import { UnexpectedError } from '../../errors/UnexpectedError';
import type { AvailableModel } from '../../execution/LlmExecutionTools';
import type { LlmExecutionTools } from '../../execution/LlmExecutionTools';
import type { PromptChatResult } from '../../execution/PromptResult';
import type { PromptCompletionResult } from '../../execution/PromptResult';
import type { PromptResultUsage } from '../../execution/PromptResult';
import { computeUsageCounts } from '../../execution/utils/computeUsageCounts';
import { uncertainNumber } from '../../execution/utils/uncertainNumber';
import type { Prompt } from '../../types/Prompt';
import type { string_date_iso8601 } from '../../types/typeAliases';
import type { string_model_name } from '../../types/typeAliases';
import { getCurrentIsoDate } from '../../utils/getCurrentIsoDate';
import { just } from '../../utils/just';
import type { AnthropicClaudeExecutionToolsOptions } from './AnthropicClaudeExecutionToolsOptions';
import { ANTHROPIC_CLAUDE_MODELS } from './anthropic-claude-models';

/**
 * Execution Tools for calling Anthropic Claude API.
 */
export class AnthropicClaudeExecutionTools implements LlmExecutionTools {
    /**
     * Anthropic Claude API client.
     */
    private readonly client: Anthropic;

    /**
     * Creates Anthropic Claude Execution Tools.
     *
     * @param options which are relevant are directly passed to the Anthropic Claude client
     */
    public constructor(private readonly options: AnthropicClaudeExecutionToolsOptions = {}) {
        // Note: Passing only Anthropic Claude relevant options to Anthropic constructor
        const anthropicOptions = { ...options };
        delete anthropicOptions.isVerbose;
        this.client = new Anthropic(anthropicOptions);
    }

    /**
     * Calls Anthropic Claude API to use a chat model.
     */
    public async callChatModel(prompt: Pick<Prompt, 'content' | 'modelRequirements'>): Promise<PromptChatResult> {
        if (this.options.isVerbose) {
            console.info('💬 Anthropic Claude callChatModel call');
        }

        const { content, modelRequirements } = prompt;

        // TODO: [☂] Use here more modelRequirements
        if (modelRequirements.modelVariant !== 'CHAT') {
            throw new ExecutionError('Use callChatModel only for CHAT variant');
        }

        const rawRequest: MessageCreateParamsNonStreaming = {
            model: modelRequirements.modelName || this.getDefaultChatModel().modelName,
            max_tokens: modelRequirements.maxTokens || 4096,
            //                                            <- TODO: Make some global max cap for maxTokens
            messages: [
                {
                    role: 'user',
                    content,
                },
            ],
            // TODO: Is here some equivalent of user identification?> user: this.options.user,
        };
        const start: string_date_iso8601 = getCurrentIsoDate();
        let complete: string_date_iso8601;

        if (this.options.isVerbose) {
            console.info(colors.bgWhite('rawRequest'), JSON.stringify(rawRequest, null, 4));
        }
        const rawResponse = await this.client.messages.create(rawRequest);
        if (this.options.isVerbose) {
            console.info(colors.bgWhite('rawResponse'), JSON.stringify(rawResponse, null, 4));
        }

        if (!rawResponse.content[0]) {
            throw new ExecutionError('No content from Anthropic Claude');
        }

        if (rawResponse.content.length > 1) {
            throw new ExecutionError('More than one content blocks from Anthropic Claude');
        }

        const resultContent = rawResponse.content[0].text;
        // eslint-disable-next-line prefer-const
        complete = getCurrentIsoDate();
        const usage = {
            price: { value: 0, isUncertain: true } /* <- TODO: [🐞] Compute usage */,
            input: {
                tokensCount: uncertainNumber(rawResponse.usage.input_tokens),
                ...computeUsageCounts(prompt.content),
            },
            output: {
                tokensCount: uncertainNumber(rawResponse.usage.output_tokens),
                ...computeUsageCounts(prompt.content),
            },
        } satisfies PromptResultUsage;

        return {
            content: resultContent,
            modelName: rawResponse.model,
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
     * Calls Anthropic Claude API to use a complete model.
     */
    public async callCompletionModel(
        prompt: Pick<Prompt, 'content' | 'modelRequirements'>,
    ): Promise<PromptCompletionResult> {
        just(prompt);
        throw new Error('Anthropic complation models are not implemented to Promptbook yet [👏]');
        /*
        TODO: [👏]
        if (this.options.isVerbose) {
            console.info('🖋 Anthropic Claude callCompletionModel call');
        }

        const { content, modelRequirements } = prompt;

        // TODO: [☂] Use here more modelRequirements
        if (modelRequirements.modelVariant !== 'COMPLETION') {
            throw new ExecutionError('Use callCompletionModel only for COMPLETION variant');
        }

        const model = modelRequirements.modelName || this.getDefaultChatModel().modelName;
        const modelSettings = {
            model: rawResponse.model || model,
            max_tokens: modelRequirements.maxTokens || 2000, // <- Note: 2000 is for lagacy reasons
            //                                                  <- TODO: Make some global max cap for maxTokens
        };

        const rawRequest: xxxx.Completions.CompletionCreateParamsNonStreaming = {
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
            throw new ExecutionError('No choises from Anthropic Claude');
        }

        if (rawResponse.choices.length > 1) {
            // TODO: This should be maybe only warning
            throw new ExecutionError('More than one choise from Anthropic Claude');
        }

        const resultContent = rawResponse.choices[0].text;
        // eslint-disable-next-line prefer-const
        complete = getCurrentIsoDate();
        const usage = { price: 'UNKNOWN', inputTokens: 0, outputTokens: 0 /* <- TODO: [🐞] Compute usage * / } satisfies PromptResultUsage;



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
        */
    }

    /**
     * Get the model that should be used as default
     */
    private getDefaultModel(defaultModelName: string_model_name): AvailableModel {
        const model = ANTHROPIC_CLAUDE_MODELS.find(({ modelName }) => modelName === defaultModelName);
        if (model === undefined) {
            throw new UnexpectedError(
                spaceTrim(
                    (block) =>
                        `
                          Cannot find model in OpenAI models with name ${defaultModelName} which should be used as default.

                          Available models:
                          ${block(ANTHROPIC_CLAUDE_MODELS.map(({ modelName }) => `- ${modelName}`).join('\n'))}

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
        return this.getDefaultModel('claude-3-opus');
    }

    /**
     * List all available Anthropic Claude models that can be used
     */
    public listModels(): Array<AvailableModel> {
        return ANTHROPIC_CLAUDE_MODELS;
    }
}

/**
 * TODO: !!!! [🍆] JSON mode
 * TODO: [🧠] Maybe handle errors via transformAnthropicError (like transformAzureError)
 * TODO: Maybe Create some common util for callChatModel and callCompletionModel
 * TODO: Maybe make custom OpenaiError
 */
