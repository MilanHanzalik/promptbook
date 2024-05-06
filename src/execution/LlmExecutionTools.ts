import type { Prompt } from '../types/Prompt';
import type { PromptChatResult, PromptCompletionResult } from './PromptResult';

/**
 * Vontainer for all the tools needed to execute prompts to large language models like GPT-4
 * On its interface it exposes common methods for prompt execution.
 * Inside (in constructor) it calls OpenAI, Azure, GPU, proxy, cache, logging,...
 *
 * @see https://github.com/webgptorg/promptbook#llm-execution-tools
 */
export type LlmExecutionTools = {
    /**
     * Use a chat model
     */
    gptChat(prompt: Prompt): Promise<PromptChatResult>;

    /**
     * Use a completion model
     */
    gptComplete(prompt: Prompt): Promise<PromptCompletionResult>;
};

/**
 * TODO: [🍓][♐] Allow to list compatible models with each variant
 * TODO: [🏳] gptChat -> chat, gptComplete -> complete, translate
 * TODO: [🧠] Should or should not there be a word "GPT" in both gptComplete and gptChat
 */