import type { string_model_name } from './typeAliases';

export const MODEL_VARIANTS = ['COMPLETION', 'CHAT' /* [🏳]  */] as const;

/**
 * Model variant describes the very general type of the model
 *
 * There are two variants:
 * - **COMPLETION** - model that takes prompt and writes the rest of the text
 * - **CHAT** - model that takes prompt and previous messages and returns response
 */
export type ModelVariant = typeof MODEL_VARIANTS[number];

/**
 * Abstract way to specify the LLM. It does not specify the LLM with concrete version itself, only the requirements for the LLM.
 *
 * @see https://github.com/webgptorg/promptbook#model-requirements
 */
export type ModelRequirements = {
    /**
     * Model variant describes the very general type of the model
     *
     * There are two variants:
     * - **COMPLETION** - model that takes prompt and writes the rest of the text
     * - **CHAT** - model that takes prompt and previous messages and returns response
     */
    readonly modelVariant: ModelVariant;

    /**
     * The model for text prompt
     *
     * Note: Model must be compatible with the model variant
     * Note: If not specified, the best model for the variant will be used
     *
     * @example 'gpt-4', 'gpt-4-32k-0314', 'gpt-3.5-turbo-instruct',...
     */
    readonly modelName?: string_model_name;

    /**
     * Maximum number of tokens that can be generated by the model
     */
    readonly maxTokens?: number;
};

/**
 * TODO: Maybe figure out better word than "variant"
 * TODO: Add here more requirement options like max context size, max tokens, etc.
 */
