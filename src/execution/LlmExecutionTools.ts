import type { Promisable } from 'type-fest';
import type { ModelVariant } from '../types/ModelRequirements';
import type { Prompt } from '../types/Prompt';
import type { string_model_name } from '../types/typeAliases';
import type { string_title } from '../types/typeAliases';
import type { PromptChatResult } from './PromptResult';
import type { PromptCompletionResult } from './PromptResult';

/**
 * Container for all the tools needed to execute prompts to large language models like GPT-4
 * On its interface it exposes common methods for prompt execution.
 * Inside (in constructor) it calls OpenAI, Azure, GPU, proxy, cache, logging,...
 *
 * @see https://github.com/webgptorg/promptbook#llm-execution-tools
 */
export type LlmExecutionTools = {
    /**
     * Use a chat model
     */
    callChatModel(prompt: Prompt): Promise<PromptChatResult>;

    /**
     * Use a completion model
     */
    callCompletionModel(prompt: Prompt): Promise<PromptCompletionResult>;

    // TODO: !!!! Translation model

    /**
     * List all available models that can be used
     */
    listModels(): Promisable<Array<AvailableModel>>;
};

/**
 * Represents a model that can be used for prompt execution
 */
export type AvailableModel = {
    /**
     * The model title
     */
    readonly modelTitle: string_title;

    /**
     * The model name aviailable
     */
    readonly modelName: string_model_name;

    /**
     * Variant of the model
     */
    readonly modelVariant: ModelVariant;

    // <- TODO: [♐] Add metadata about the model to make the best choice
};

/**
 * TODO: [🧠] Emulation of one type of model with another one - emuate chat with completion; emulate translation with chat
 * TODO: [🍓][♐] Some heuristic to pick the best model in listed models
 * TODO: [🏳] callChatModel -> chat, callCompletionModel -> complete, translate
 * TODO: [🧠] Should or should not there be a word "GPT" in both callCompletionModel and callChatModel
 */
