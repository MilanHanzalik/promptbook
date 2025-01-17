// @promptbook/utils

import { spaceTrim } from 'spacetrim';
import { renderPromptbookMermaid } from '../conversion/prettify/renderPipelineMermaidOptions';
import { extractParametersFromPromptTemplate } from '../conversion/utils/extractParametersFromPromptTemplate';
import { extractVariables } from '../conversion/utils/extractVariables';
import { parseNumber } from '../conversion/utils/parseNumber';
import { renameParameter } from '../conversion/utils/renameParameter';
import { titleToName } from '../conversion/utils/titleToName';
import { forEachAsync } from '../execution/utils/forEachAsync';
import { replaceParameters } from '../execution/utils/replaceParameters';
import { isValidJsonString } from '../formats/json/utils/isValidJsonString';
import { countCharacters } from '../utils/expectation-counters/countCharacters';
import { countLines } from '../utils/expectation-counters/countLines';
import { countPages } from '../utils/expectation-counters/countPages';
import { countParagraphs } from '../utils/expectation-counters/countParagraphs';
import { countSentences, splitIntoSentences } from '../utils/expectation-counters/countSentences';
import { countWords } from '../utils/expectation-counters/countWords';
import { CountUtils } from '../utils/expectation-counters/index';
import { extractParameters } from '../utils/extractParameters';
import { extractAllBlocksFromMarkdown } from '../utils/markdown/extractAllBlocksFromMarkdown';
import { extractAllListItemsFromMarkdown } from '../utils/markdown/extractAllListItemsFromMarkdown';
import { extractOneBlockFromMarkdown } from '../utils/markdown/extractOneBlockFromMarkdown';
import { removeContentComments } from '../utils/markdown/removeContentComments';
import { removeMarkdownFormatting } from '../utils/markdown/removeMarkdownFormatting';
import { DIACRITIC_VARIANTS_LETTERS } from '../utils/normalization/DIACRITIC_VARIANTS_LETTERS';
import type { IKeywords, string_keyword } from '../utils/normalization/IKeywords';
import { capitalize } from '../utils/normalization/capitalize';
import { decapitalize } from '../utils/normalization/decapitalize';
import { isValidKeyword } from '../utils/normalization/isValidKeyword';
import { nameToUriPart } from '../utils/normalization/nameToUriPart';
import { nameToUriParts } from '../utils/normalization/nameToUriParts';
import { normalizeToKebabCase } from '../utils/normalization/normalize-to-kebab-case';
import { normalizeTo_PascalCase } from '../utils/normalization/normalizeTo_PascalCase';
import { normalizeTo_SCREAMING_CASE } from '../utils/normalization/normalizeTo_SCREAMING_CASE';
import { normalizeTo_camelCase } from '../utils/normalization/normalizeTo_camelCase';
import { normalizeTo_snake_case } from '../utils/normalization/normalizeTo_snake_case';
import { normalizeWhitespaces } from '../utils/normalization/normalizeWhitespaces';
import { parseKeywords } from '../utils/normalization/parseKeywords';
import { parseKeywordsFromString } from '../utils/normalization/parseKeywordsFromString';
import { removeDiacritics } from '../utils/normalization/removeDiacritics';
import { searchKeywords } from '../utils/normalization/searchKeywords';
import { extractBlock } from '../utils/postprocessing/extractBlock';
import { removeEmojis } from '../utils/removeEmojis';
import { removeQuotes } from '../utils/removeQuotes';
import { difference } from '../utils/sets/difference';
import { intersection } from '../utils/sets/intersection';
import { union } from '../utils/sets/union';
import { trimCodeBlock } from '../utils/trimCodeBlock';
import { trimEndOfCodeBlock } from '../utils/trimEndOfCodeBlock';
import { unwrapResult } from '../utils/unwrapResult';
import { PROMPTBOOK_VERSION } from '../version';

// Note: Exporting version from each package
export { PROMPTBOOK_VERSION, forEachAsync };

// TODO: [🌻] For all, decide if theese are internal or external
export {
    extractAllBlocksFromMarkdown, // <- [🌻]
    extractAllListItemsFromMarkdown,
    extractBlock, // <- [🌻]
    extractOneBlockFromMarkdown,
    extractParameters,
    extractVariables,
    isValidJsonString,
    parseNumber, // <- [🌻]
    removeContentComments,
    removeEmojis,
    removeMarkdownFormatting,
    removeQuotes,
    replaceParameters,
    spaceTrim,
    trimCodeBlock,
    trimEndOfCodeBlock,
    unwrapResult,
};

export { CountUtils, countCharacters, countLines, countPages, countParagraphs, countSentences, countWords };

export { splitIntoSentences };

// And the normalization (originally n12 library) utilities:

export const normalizeTo = {
    // [🕙] lowercase: normalizeTo_lowercase,
    // [🕙] UPPERCASE: normalizeTo_UPPERCASE,
    camelCase: normalizeTo_camelCase,
    PascalCase: normalizeTo_PascalCase,
    SCREAMING_CASE: normalizeTo_SCREAMING_CASE,
    snake_case: normalizeTo_snake_case,
    'kebab-case': normalizeToKebabCase,
};

export {
    DIACRITIC_VARIANTS_LETTERS,
    IKeywords,
    capitalize,
    decapitalize,
    isValidKeyword,
    nameToUriPart,
    nameToUriParts,
    normalizeToKebabCase,
    normalizeTo_PascalCase,
    normalizeTo_SCREAMING_CASE,
    // [🕙] normalizeTo_lowercase,
    // [🕙] normalizeTo_UPPERCASE,
    normalizeTo_camelCase,
    normalizeTo_snake_case,
    normalizeWhitespaces,
    parseKeywords,
    parseKeywordsFromString,
    removeDiacritics,
    searchKeywords,
    string_keyword,
    titleToName,
};

// Promptbook
export { extractParametersFromPromptTemplate, renameParameter, renderPromptbookMermaid };

export { difference, intersection, union };

/**
 * TODO: [🧠] Maybe create some indipendent package like `markdown-tools` from both here exported and @private utilities
 * Note: [🕙] It does not make sence to have simple lower / UPPER case normalization
 */
