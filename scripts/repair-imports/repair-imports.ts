#!/usr/bin/env ts-node

import colors from 'colors';
import commander from 'commander';
import { dirname, join, relative } from 'path';
import spaceTrim from 'spacetrim';
import { commit } from '../utils/autocommit/commit';
import { findAllProjectEntities } from '../utils/findAllProjectEntities';
import { readAllProjectFiles } from '../utils/readAllProjectFiles';
import { writeAllProjectFiles } from '../utils/writeAllProjectFiles';
/*
import { findAllProjectFiles } from '../utils/findAllProjectFiles';
import { execCommands } from '../utils/execCommand/execCommands';
import { splitArrayIntoChunks } from './utils/splitArrayIntoChunks';
*/

if (process.cwd() !== join(__dirname, '../..')) {
    console.error(colors.red(`CWD must be root of the project`));
    process.exit(1);
}

const program = new commander.Command();
program.option('--organize', `Organize imports`, false);
program.option('--organize-all', `Organize all imports`, false);
program.option('--commit', `Auto commit`, false);
program.parse(process.argv);

const { organize: isOrganized, organizeAll: isOrganizedAll, commit: isCommited } = program.opts();

/**
 * VSCode sometimes offers auto-import which is malformed, for example:
 * > import type { PipelineJson, PromptTemplateJson } from '../../_packages/types.index';
 *
 * This script fixes that
 */
repairImports({ isOrganized, isOrganizedAll, isCommited })
    .catch((error: Error) => {
        console.error(colors.bgRed(error.name));
        console.error(error);
        process.exit(1);
    })
    .then(() => {
        process.exit(0);
    });

async function repairImports({
    isOrganized,
    // isOrganizedAll,
    isCommited,
}: {
    isOrganized: boolean;
    isOrganizedAll: boolean;
    isCommited: boolean;
}) {
    console.info(`🏭🩹 Repair imports`);

    const entities = await findAllProjectEntities();
    const files = await readAllProjectFiles();

    for (const file of files) {
        if (file.path === join(__dirname, '../../src/index.tsx').split('\\').join('/')) {
            continue;
        }

        if (file.path.includes('_packages')) {
            // Note: Do not repair imports in files which defines expoeted packages
            continue;
        }

        if (file.path.includes('JavascriptEvalExecutionTools.ts')) {
            // Note: [💎] Do not repair imports in file where we need a bit special treatment of imports because of the `eval`
            continue;
        }

        /*/
        // Note: Keep this for testing single file
        if (!file.path.includes('pipelineStringToJson.ts')) {
            continue;
        }
        /**/

        const matches = Array.from(
            file.content.matchAll(
                /**/ /^import\s+(type\s+)?\{\s+(?<importedEntities>[^;]*?)\s+\}\s+from\s+'\..*?';$/gm,
                //   /^import\s+(type\s+)?\{\s+(?<importedEntities>[^;]*?)\s+\}\s+from\s+'((.*?\.index))';$/gm,
            ),
        );

        if (matches.length === 0) {
            console.info(colors.gray('/' + relative(process.cwd(), file.path).split('\\').join('/')));
        } else {
            console.info(
                colors.green('/' + relative(process.cwd(), file.path).split('\\').join('/') + ` (${matches.length}x)`),
            );
        }

        for (const match of matches) {
            const importedEntities = match
                .groups!.importedEntities.split(',')
                .map((importedEntity) => spaceTrim(importedEntity))
                .filter((entity) => entity !== '');

            file.content = file.content.replace(
                match[0]!,
                importedEntities
                    .map((importedEntity: string) => {
                        const entity = entities.find(({ name }) => name === importedEntity);

                        if (!entity) {
                            console.info(colors.blue(entities.map(({ type, name }) => `- ${type} ${name}`).join('\n')));

                            throw new Error(
                                `Can not find in which file is entity "${importedEntity}" imported by file "${file.path}".`,
                            );
                        }

                        let importFrom = relative(dirname(file.path), entity.filePath)
                            // Note: Changing Windows path to Unix path (\ to /)
                            .split('\\')
                            .join('/')
                            // Note: Removing extension
                            .split(/\.(?:tsx?|jsx?)$/)
                            .join('');

                        if (!importFrom.startsWith('.')) {
                            importFrom = './' + importFrom;
                        }

                        return `import ${!entity.isType ? `` : `type `}{ ${importedEntity} } from '${importFrom}';`;
                    })
                    .join('\n'),
            );
        }
    }

    // Note: [🤛] Organizing brakes multiline imports (or does sth. which brakes the code where shouldn’t be)
    await writeAllProjectFiles(files, isOrganized);

    /*
    TODO: Fix & implement
    if (isOrganizedAll) {
        console.info('Organizing all imports...');

        try {
            const cwd = join(__dirname, '../../');
            await execCommands({
                cwd,
                commands: splitArrayIntoChunks(
                    await findAllProjectFiles(),
                    100 /* <- Note: We are getting here "Error: spawn ENAMETOOLONG" so the command is splitted into multiple ones * /,
                ).map(
                    (paths) =>
                        `npx organize-imports-cli ${paths
                            .map((path) => relative(cwd, path).split('\\').join('/'))
                            .join(' ')}`,
                ),
            });
        } catch (error) {
            if (!(error instanceof Error)) {
                throw error;
            }

            if (error.message.includes('No files specified')) {
                console.info(colors.red(`No files to be organized`));
            }

            throw error;
        }
    }
    */

    if (isCommited) {
        await commit('.', `🧹 Organize imports`);
    }
}
