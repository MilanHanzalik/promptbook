import { spaceTrim } from 'spacetrim';
import { promptbookStringToJson } from '../../conversion/promptbookStringToJson';
import { PromptbookString } from '../../types/PromptbookString';
import { addAutoGeneratedSection } from '../../utils/markdown/addAutoGeneratedSection';
import { prettifyMarkdown } from '../../utils/markdown/prettifyMarkdown';
import type { PrettifyOptions } from './PrettifyOptions';
import { renderPromptbookMermaid } from './renderPromptbookMermaid';

/**
 * Prettyfies Promptbook string and adds Mermaid graph
 */
export function prettifyPromptbookString(
    promptbookString: PromptbookString,
    options: PrettifyOptions,
): PromptbookString {
    const { isGraphAdded, isPrettifyed } = options;

    if (isGraphAdded) {
        const promptbookJson = promptbookStringToJson(promptbookString);

        const promptbookMermaid = renderPromptbookMermaid(promptbookJson);

        const promptbookMermaidBlock = spaceTrim(
            (block) => `
            \`\`\`mermaid
            ${block(promptbookMermaid)}
            \`\`\`
        `,
        );

        promptbookString = addAutoGeneratedSection(promptbookString, {
            sectionName: 'Graph',
            sectionContent: promptbookMermaidBlock,
        }) as PromptbookString;
    }

    if (isPrettifyed) {
        promptbookString = prettifyMarkdown(promptbookString) as PromptbookString;
    }

    return promptbookString;
}

/**
 * TODO: Maybe use some Mermaid library instead of string templating
 * TODO: [🕌] When more than 2 functionalities, split into separate functions
 */
