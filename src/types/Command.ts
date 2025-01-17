import type { ExecutionType } from './ExecutionTypes';
import type { ModelRequirements } from './ModelRequirements';
import type { ExpectationAmount } from './PipelineJson/PromptTemplateJson';
import type { ExpectationUnit } from './PipelineJson/PromptTemplateJson';
import type { string_markdown_text } from './typeAliases';
import type { string_name } from './typeAliases';
import type { string_version } from './typeAliases';

/**
 * Command is one piece of the prompt template which adds some logic to the prompt template or the whole pipeline.
 * It is parsed from the markdown from ul/ol items - one command per one item.
 */
export type Command =
    | PromptbookUrlCommand
    | PromptbookVersionCommand
    | ExecuteCommand
    | ModelCommand
    | JokerCommand
    | ParameterCommand
    | PostprocessCommand
    | ExpectCommand;

/**
 * PromptbookVersion command tells which version is .promptbook file using
 *
 * - It is used for backward compatibility
 * - It is defined per whole .promptbook file in the header
 */
export type PromptbookUrlCommand = {
    readonly type: 'PIPELINE_URL';
    readonly pipelineUrl: URL;
};

/**
 * PromptbookVersion command tells which version is .promptbook file using
 *
 * - It is used for backward compatibility
 * - It is defined per whole .promptbook file in the header
 */
export type PromptbookVersionCommand = {
    readonly type: 'PROMPTBOOK_VERSION';
    readonly promptbookVersion: string_version;
};

/**
 * Execute command tells how to execute the section
 * It can be either prompt template, script or SIMPLE TEMPLATE etc.
 */
export type ExecuteCommand = {
    readonly type: 'EXECUTE';
    readonly executionType: ExecutionType;
};

/**
 * Model command tells which model and modelRequirements to use for the prompt template. execution
 */
export type ModelCommand = {
    readonly type: 'MODEL';
    readonly key: keyof ModelRequirements;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly value: any /* <- TODO: Infer from used key, can it be done in TypeScript */;
};

/**
 * Joker parameter is used instead of executing the prompt template if it meet the expectations requirements
 */
export type JokerCommand = {
    readonly type: 'JOKER';
    readonly parameterName: string_name;
};

/**
 * Parameter command describes one parameter of the prompt template
 *
 * - It can tell if it is input or OUTPUT PARAMETER
 * - It can have description
 * - In description it can have simple formatting BUT not markdown structure or reference to other parameters
 */
export type ParameterCommand = {
    readonly type: 'PARAMETER';
    readonly isInput: boolean;
    readonly isOutput: boolean;
    readonly parameterName: string_name;
    readonly parameterDescription: string_markdown_text | null;
};

/**
 * Postprocess command describes which function to use for postprocessing
 * This will be created as separate EXECUTE SCRIPT block bellow
 */
export type PostprocessCommand = {
    readonly type: 'POSTPROCESS';
    readonly functionName: string_name;
};

/**
 * Expect command describes the desired output of the prompt template (after post-processing)
 * It can set limits for the maximum/minimum length of the output, measured in characters, words, sentences, paragraphs or some other shape of the output.
 */
export type ExpectCommand = ExpectAmountCommand | ExpectFormatCommand;

/**
 * Expect amount command describes the desired output of the prompt template (after post-processing)
 * It can set limits for the maximum/minimum length of the output, measured in characters, words, sentences, paragraphs,...
 *
 * Note: LLMs work with tokens, not characters, but in Promptbooks we want to use some human-recognisable and cross-model interoperable units.
 */
export type ExpectAmountCommand = {
    readonly type: 'EXPECT_AMOUNT';
    readonly sign: 'EXACTLY' | 'MINIMUM' | 'MAXIMUM';
    readonly unit: ExpectationUnit;
    readonly amount: ExpectationAmount;
};

/**
 * Represents a command that expects a specific format.
 */
export type ExpectFormatCommand = {
    readonly type: 'EXPECT_FORMAT';
    readonly format: 'JSON';
};

// <- [🥻] Insert here when making new command
