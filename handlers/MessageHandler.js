const Logger = require('../helpers/Logger');
const Collection = require('../helpers/Collection');
const Util = require('../helpers/Util');
const Embed = require('../structures/ChariotEmbed');

/**
 * This class handles the incoming messages and triggers commands if a valid command was issued
 */
class MessageHandler {
    constructor(chariot) {
        this.chariot = chariot;
        this.cooldowns = new Collection();
        this.minimumPermissions = ['readMessages', 'sendMessages'];
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

        /* Stop handling if no command was found */
        if (!command) return;

        /* Check if the bot has adequate permissions */
        const pendingPermissions = (!command.permissions) ? this.minimumPermissions : this.minimumPermissions.concat(command.permissions);
        let missingPermissions = [];

        for (let i = 0; i < pendingPermissions.length; i++) {
            if (!message.channel.permissionsOf(this.chariot.user.id).has(pendingPermissions[i])) {
                missingPermissions.push(Util.formatPermission(pendingPermissions[i]));
            }
        }

        if (missingPermissions.length) {
            console.log(missingPermissions);
            return message.channel.createMessage(`Can't run command **${command.name}** because I lack following permissions: **${missingPermissions.join(', ')}**`).catch((messageSendError) => {
                Logger.log(1, 'MUTED', `Can't send messages in #${message.channel.name} (${message.channel.id})`);
            });
        }

        /* Check if the user has adequate permissions */
        const pendingUserPermissions = (!command.userPermissions) ? false : command.userPermissions;
        let missingUserPermissions = [];

        if (pendingUserPermissions) {
            for (let j = 0; j < pendingUserPermissions.length; j++) {
                if (!message.member.permission.has(pendingUserPermissions[j])) {
                    missingUserPermissions.push(Util.formatPermission(pendingUserPermissions[j]));
                }
            }
        }

        if (missingUserPermissions.length) {
            return message.channel.createEmbed(new Embed()
                .setColor('RED')
                .setTitle('Insufficient Permissions!')
                .setDescription(`You lack following permissions to use this command: **${missingUserPermissions.join(', ')}**`)
            ).catch((embedSendError) => {
                message.channel.createMessage(`You lack following permissions to use this command: **${missingUserPermissions.join(', ')}**`).catch((messageSendError) => {
                    Logger.log(1, 'MUTED', `Can't send messages in #${message.channel.name} (${message.channel.id})`);
                });
            });
        }

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