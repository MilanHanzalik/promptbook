import { normalizeToKebabCase } from '../../_packages/utils.index';
import { removeEmojis } from '../../utils/removeEmojis';

/**
 * Function normalizes title to name which can be used as identifier
 */

export function titleToName(value: string): string {
    value = removeEmojis(value);
    value = normalizeToKebabCase(value);

    // TODO: [🧠] Maybe warn or add some padding to short name which are not good identifiers
    return value;
}
