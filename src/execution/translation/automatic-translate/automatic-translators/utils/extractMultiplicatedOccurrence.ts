import { ExecutionError } from '../../../../../errors/ExecutionError';

/**
 *
 * @param message
 * @returns
 * @throws {ExecutionError}
 */
export function extractMultiplicatedOccurrence(message: string): string {
    for (let subLength = 1; subLength < message.length / 2; subLength++) {
        if (message.substring(subLength * 0, subLength * 1) === message.substring(subLength * 1, subLength * 2)) {
            return message.substring(subLength * 0, subLength * 1);
        }
    }

    throw new ExecutionError(`Cannot extract multiplicated occurrence from "${message}"`);
}
