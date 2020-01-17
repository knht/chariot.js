/**
 * Basic abstract Command class for command identification
 */
class ChariotCommand {
    execute() {
        throw new Error('No command logic implemented!');
    }

    /**
     * Simple argument handler for getting tailed arguments with custom length and delimeters
     * @param {string} string A string to be used 
     * @param {string} delimeter A delimeter to split a text by 
     * @param {number} count How often a string should be split by the delimeter before merging the contents
     * @returns {string[]} An array of all collected arguments
     */
    tailedArguments(string, delimeter, count) {
        const parts  = string.split(delimeter);
        const tail   = parts.slice(count).join(delimeter);
        const result = parts.slice(0, count);

        result.push(tail);

        return result;
    }
}

module.exports = ChariotCommand;