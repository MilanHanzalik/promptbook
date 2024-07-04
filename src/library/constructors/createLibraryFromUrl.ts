import type { string_url } from '../../types/typeAliases';
import type { PromptbookLibrary } from '../PromptbookLibrary';
import { createLibraryFromPromise } from './createLibraryFromPromise';

/**
 * Options for `createLibraryFromDirectory` function
 */
type CreatePromptbookLibraryFromUrlyOptions = {
    /**
     * If true, the library creation outputs information about each file it reads
     *
     * @default false
     */
    isVerbose?: boolean;

    /**
     * If true, directory will be scanned only when needed not during the construction
     *
     * @default false
     */
    isLazyLoaded?: boolean;
};

/**
 * Constructs Promptbook from remote Promptbase URL

 * @returns PromptbookLibrary
 */
export async function createLibraryFromUrl(
    url: string_url | URL,
    options: CreatePromptbookLibraryFromUrlyOptions,
): Promise<PromptbookLibrary> {
    const { isVerbose = false, isLazyLoaded = false } = options || {};

    const library = createLibraryFromPromise(async () => {
        if (isVerbose) {
            console.info(`Creating promptbook library from url ${url.toString()}`);
        }

        throw new Error('Not implemented yet');
    });

    if (isLazyLoaded === false) {
        await library.listPromptbooks();
    }

    return library;

    // TODO: !!! [🏳‍🌈] Allow variant with .json .js and .ts files
    // TODO: [🧠][🏳‍🌈] .js and .ts files should create getter function for the library
    // TODO: Look at WebGPT "📖 Make Promptbook library" and https://webgpt.cz/_promptbook-library.json
    // TODO: !! Implement via createLibraryFromPromise
}

/**
 * TODO: !!!! [🧠] Library precompilation and do not mix markdown and json promptbooks
 */