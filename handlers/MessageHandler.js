const Logger = require('../helpers/Logger');

class MessageHandler {
    constructor(chariot) {
        this.chariot = chariot;
    }

    async handle(message, commands) {
        const commandArguments  = message.content.slice(this.chariot.prefix.length).split(/ +/);
        const commandName       = commandArguments.shift().toLowerCase();
        const command           = commands.get(commandName) || commands.find(chariotCommand => chariotCommand.aliases && chariotCommand.aliases.includes(commandName));

        if (!command) return;
        if (command.owner && chariotOptions.chariotConfig.owner !== message.author.id) {
            return message.channel.createMessage("Insufficient permissions!");
        }

        try {
            command.execute(message, this.chariot);
        } catch (chariotCommandExecutionError) {
            Logger.log(2, "COMMAND EXECUTION ERROR", `A command couldn't be executed because of: ${chariotCommandExecutionError}`);
        }
    }
}

module.exports = MessageHandler;