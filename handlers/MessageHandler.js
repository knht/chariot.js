const Logger = require('../helpers/Logger');

/**
 * This class handles the incoming messages and triggers commands if a valid command was issued
 */
class MessageHandler {
    constructor(chariot) {
        this.chariot = chariot;
    }

    /**
     * This method handles messages and checks their content for valid commands.
     * If a valid command was found, the command file will be checked for its instantiated properties and then executed.
     * @async
     * @param {Object} message The message object emitted from Discord 
     * @param {Chariot.Collection} commands A collection containing all registered commands 
     */
    async handle(message, commands) {
        const commandArguments  = message.content.slice(this.chariot.prefix.length).split(/ +/);
        const commandName       = commandArguments.shift().toLowerCase();
        const command           = commands.get(commandName) || commands.find(chariotCommand => chariotCommand.aliases && chariotCommand.aliases.includes(commandName));

        if (!command) return;
        if (command.owner && !this.chariot.chariotOptions.chariotConfig.owner.includes(message.author.id)) {
            return message.channel.createMessage("Insufficient permissions!");
        }

        try {
            command.execute(message, commandArguments, this.chariot)
                .catch(chariotCommandExecutionError => {
                    throw chariotCommandExecutionError; 
                });
        } catch (chariotCommandExecutionError) {
            Logger.log(2, "COMMAND EXECUTION ERROR", `Command ${command.name} couldn't be executed because of: ${chariotCommandExecutionError}`);
        }
    }
}

module.exports = MessageHandler;