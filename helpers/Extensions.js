/**
 * A collection of useful user-exposed library extensions.
 */
class Extensions {
    /**
     * Formats a message into multiple smaller chunks to avoid Discord max-length
     * @param {string} message The message to split
     * @param {object} [options] Options for splitting the message
     * @param {number} [options.length] The maximum allowed length of the text
     * @param {string} [options.splitter] The text to split the text with
     * @param {string} [options.prefix] The text to prefix the split chunks with
     * @param {string} [options.postfix] The text to postfix the split chunks with
     * @returns {string[]} An array of all split text chunks
     */
    static formatMessage(message, { length = 2000, splitter = '\n', prefix = '', postfix = '' } = {}) {
        if (message.length <= length) {
            return [message];
        }

        const splitMessage = message.split(splitter);

        if (splitMessage.some((textChunk) => textChunk.length > length)) {
            throw new Error('Message could not be split to desired length with the desired splitter.');
        }

        const chunks = [];
        let builder = '';

        for (const chunk of splitMessage) {
            if (builder && (builder + splitter + chunk + postfix).length > length) {
                chunks.push(builder + postfix);
                builder = prefix;
            }

            builder += (builder && builder !== prefix ? splitter : '') + chunk;
        }

        return chunks.concat(builder).filter((message) => message);
    }
}

module.exports = Extensions;