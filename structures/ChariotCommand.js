/**
 * Basic abstract Command class for command identification
 */
class ChartiotCommand {
    execute() {
        throw new Error('No command logic implemented! Please check the official example on GitHub. https://github.com/riyacchi/chariot.js-example');
    }

    /**
     * Simple argument handler for getting tailed arguments with custom length and delimeters
     * @param {string} string A string to be used 
     * @param {string} delimeter A delimeter to split a text by 
     * @param {number} count How often a string should be split by the delimeter before merging the contents
     * @returns {string[]} An array of all collected arguments
     */
    tailedArguments() {
        const parts  = string.split(delimeter);
        const tail   = parts.slice(count).join(delimeter);
        const result = parts.slice(0, count);

        result.push(tail);

        return result;
    }

    /**
     * Send an embed and delete it automatically after a set amount of time
     * @async
     * @param {object} message A message object emitted from the Discord API 
     * @param {Chariot#Embed} embed A new Kirameki Embed
     * @param {number} time A number in seconds when to delete the message
     */
    async createFlashEmbed(message, time, embed) {
        const createdMessage = await message.channel.createEmbed(embed);

        setTimeout(() => {
            createdMessage.delete().catch((error) => {
                this.log(this.LogLevel.ERROR, 'MESSAGE DELETE ERROR', `Couldn't delete message because of: ${error}`);
            });
        }, time * 1000);
    }
}

module.exports = ChartiotCommand;