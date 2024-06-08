import type { number_positive_or_zero } from '../types/typeAliases';
import type { number_tokens } from '../types/typeAliases';
import type { number_usd } from '../types/typeAliases';
import type { string_date_iso8601 } from '../types/typeAliases';
import type { string_model_name } from '../types/typeAliases';

/**
 * Prompt result is the simplest concept of execution.
 * It is the result of executing one prompt _(NOT a template)_.
 *
 * @see https://github.com/webgptorg/promptbook#prompt-result
 */
export type PromptResult = PromptCompletionResult | PromptChatResult;

/**
 * Prompt completion result
 * It contains only the following text NOT the whole completion
 */
export type PromptCompletionResult = PromptCommonResult;

/**
 * Prompt chat result
 */
export type PromptChatResult = PromptCommonResult & {
    // TODO: [🤹‍♂️][🧠] Figure out way how to pass thread / previous messages
};

export type PromptCommonResult = {
    /**
     * Exact text response from the model
     */
    readonly content: string;

    /**
     * Name of the model used to generate the response
     */
    readonly modelName: string_model_name;

    /**
     * Timing
     */
    readonly timing: {
        /**
         * Start of the execution
         */
        start: string_date_iso8601;

        /**
         * First token generated
         */
        firstToken?: string_date_iso8601;

        /**
         * End of the execution
         */
        complete: string_date_iso8601;
    };

    /**
     * Usage of the prompt execution
     */
    readonly usage: {
        /**
         * Cost of the execution in USD
         *
         * If the cost is unknown, the value is `'UNKNOWN'`
         */
        price: (number_positive_or_zero & number_usd) | 'UNKNOWN';

        /**
         * Number of tokens used in the input aka. `prompt_tokens`
         */
        inputTokens: number_tokens | 'UNKNOWN';

        /**
         * Number of tokens used in the output aka. `completion_tokens`
         */
        outputTokens: number_tokens | 'UNKNOWN';
    };

    /**
     * Raw response from the model
     */
    readonly rawResponse: object;
};

/**
 * TODO: [🧠] Maybe timing more accurate then seconds?
 * TODO: [🧠] Should here be link to the prompt?
 * TODO: [🧠] Maybe type raw properly - not onject but OpenAI.result.whatever
 * TODO: [🧠] Maybe remove redundant raw.choices.text
 * TODO: Log raw even if prompt failed - log the raw error
 */
