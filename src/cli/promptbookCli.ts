import commander from 'commander';
import { spaceTrim } from 'spacetrim';
import { isRunningInNode } from '../utils/isRunningInWhatever';
import { PROMPTBOOK_VERSION } from '../version';
import { initializeHello } from './actions/hello';
import { initializeMake } from './actions/make';
import { initializePrettify } from './actions/prettify';

/**
 * Runs CLI utilities of Promptbook package
 */
export async function promptbookCli(): Promise<void> {
    if (!isRunningInNode()) {
        throw new Error(
            spaceTrim(`
                Function promptbookCli is initiator of CLI script and should be run in Node.js environment.

                - In browser use function exported from \`@promptbook/utils\` or  \`@promptbook/core\` directly, for example \`prettifyPromptbookString\`.

            `),
        );
    }

    const program = new commander.Command();
    program.name('promptbook');
    program.version(PROMPTBOOK_VERSION);
    program.description(
        spaceTrim(`
            Promptbook utilities for enhancing workflow with promptbooks
        `),
    );

    initializeHello(program);
    initializeMake(program);
    initializePrettify(program);

    program.parse(process.argv);
}

/**
 * TODO: [🥠] Do not export to utils directly, its just for CLI script
 * TODO: [🕌] When more functionalities, rename
 * Note: 11:11
 */
