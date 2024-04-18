import colors from 'colors';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { spaceTrim } from 'spacetrim';
import { execCommand } from '../execCommand/execCommand';
import { isWorkingTreeClean } from './isWorkingTreeClean';

export async function commit(addPath: string, message: string): Promise<void> {
    const projectPath = process.cwd();
    // const addPath = '.';

    const commitMessageFilePath = join(process.cwd(), '.tmp', 'COMMIT_MESSAGE');
    const commitMessage = spaceTrim(
        (block) => `
        ${block(message)}

        🔼 This commit was automatically generated by map scripts
      `,
    );

    if (await isWorkingTreeClean(projectPath)) {
        console.info(colors.gray(`⏩ Not commiting because nothings changed`));
        return;
    }

    try {
        await execCommand({
            cwd: projectPath,
            crashOnError: false,
            command: `git add ${addPath}`,
        });

        await mkdir(dirname(commitMessageFilePath), { recursive: true });
        await writeFile(commitMessageFilePath, commitMessage, 'utf8');

        await execCommand({
            cwd: projectPath,
            crashOnError: false,
            command: `git commit --file ${commitMessageFilePath}`,
        });

        await execCommand({
            cwd: projectPath,
            crashOnError: false,
            command: `git push --quiet`,
        });
    } catch (error) {
        console.error(error);
    } finally {
        await unlink(commitMessageFilePath);
    }
}
