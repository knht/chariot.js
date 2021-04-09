/**
 * Basic abstract Command class for command identification
 */
class ChariotCommand {
    execute() {
        throw new Error('No command logic implemented!');
    }

    /**
     * Simple argument handler for getting tailed arguments with custom length and delimiters
     * @param {string} string A string to be used 
     * @param {string} delimiter A delimiter to split a text by 
     * @param {number} count How often a string should be split by the delimiter before merging the contents
     * @returns {string[]} An array of all collected arguments
     */
    tailedArguments(string, delimiter, count) {
        const parts  = string.split(delimiter);
        const tail   = parts.slice(count).join(delimiter);
        const result = parts.slice(0, count);

        result.push(tail);

        return result;
    }
}

module.exports = ChariotCommand;