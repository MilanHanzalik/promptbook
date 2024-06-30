import { IVectorData } from 'xyzt';
import { string_keyword } from '../../_packages/utils.index';
import { string_href, string_markdown, string_markdown_text, string_model_name, string_name } from '../typeAliases';

export type MaterialKnowledgePieceJson = {

    readonly name: string_name;

    readonly title: string_markdown_text;

    readonly content: string_markdown;

    readonly keywords: Array<string_keyword>;

    readonly index: Array<{ modelName: string_model_name; position: IVectorData }>;

    readonly sources: Array<{ title: string_markdown_text; href: string_href }>;
};

/**
 * !!!! Annotate
 * TODO: [🧠][🦪] Maybe allow internal linkes between (Material)KnowledgePieces withing the KnowledgeJson and maybe require to explicitelly reference the source of the knowledge
 * TODO: [🧠] Make some non-material sources like external search engine or dialog to user
 * TODO: [🧠] Make some non-material (and maybe non-knowledge-like but tool-like) sources like calculator, code interpreter
 */
