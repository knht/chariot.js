const Logger = require('../helpers/Logger');
const Collection = require('../helpers/Collection');
const Util = require('../helpers/Util');
const Embed = require('../structures/ChariotEmbed');
const juration = require('juration');

/**
 * This class handles the incoming messages and triggers commands if a valid command was issued
 */
class MessageHandler {
    constructor(chariot) {
        this.chariot = chariot;
        this.cooldowns = new Collection();
        this.minimumPermissions = ['viewChannel', 'sendMessages'];
    }


    /**
     * This method handles messages and checks their content for valid commands.
     * If a valid command was found, the command file will be checked for its instantiated properties and then executed.
     * @async
     * @param {Object} message The message object emitted from Discord 
     * @param {Chariot.Collection} commands A collection containing all registered commands 
     */
    async handle(message, commands) {
        const commandArguments  = message.content.slice(message.prefix.length).split(/ +/);
        const commandName       = commandArguments.shift().toLowerCase();
        const command           = commands.get(commandName) || commands.find(chariotCommand => chariotCommand.aliases && chariotCommand.aliases.includes(commandName));
        const chariotConfig     = this.chariot.chariotOptions.chariotConfig;

        /* Stop handling if no command was found */
        if (!command) return;

        /* Check if it is a DM */
        if (message.channel.type !== 0 && !command.allowDMs) return;

        /* Enable permission check for guild messages */
        if (message.channel.type === 0) {

            /* Check if the bot has adequate permissions */
            const pendingPermissions = (!command.permissions) ? this.minimumPermissions : this.minimumPermissions.concat(command.permissions);
            let missingPermissions = [];

            for (let i = 0; i < pendingPermissions.length; i++) {
                if (!message.channel.permissionsOf(this.chariot.user.id).has(pendingPermissions[i])) {
                    missingPermissions.push(Util.formatPermission(pendingPermissions[i]));
                }
            }

            if (missingPermissions.length) {
                return message.channel.createMessage(Util.getLocale(chariotConfig, "missingPermissions").replace("{command}", command.name).replace("{missingPermissions}", missingPermissions.join(', ')))
                    .catch((messageSendError) => {
                        Logger.warning('MUTED', `Can't send messages in #${message.channel.name} (${message.channel.id})`);
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
                    .setTitle(Util.getLocale(chariotConfig, "userPermissions", "title"))
                    .setDescription(Util.getLocale(chariotConfig, "userPermissions", "description").replace("{missingUserPermissions}", missingUserPermissions.join(', ')))
                ).catch((embedSendError) => {
                    message.channel.createMessage(Util.getLocale(chariotConfig, "userPermissions", "description").replace("{missingUserPermissions}", missingUserPermissions.join(', '))).catch((messageSendError) => {
                        Logger.warning('MUTED', `Can't send messages in #${message.channel.name} (${message.channel.id})`);
                    });
                });
            }
        }

        /* Check if the command is restricted to the bot owner */
        if (command.owner && !chariotConfig.owner.includes(message.author.id)) {
            return message.channel.createMessage(Util.getLocale(chariotConfig, "owner"));
        }

        /* Check if an NSFW command is only used in an NSFW channel */
        if (message.channel.type === 0) {
            if (command.nsfw && !message.channel.nsfw) {
                return message.channel.createEmbed(new Embed()
                    .setColor('RED')
                    .setTitle(Util.getLocale(chariotConfig, "nsfw").replace("{command}", command.name))
                ).catch((embedSendError) => {
                    message.channel.createMessage(Util.getLocale(chariotConfig, "nsfw").replace("{command}", command.name)).catch((messageSendError) => {
                        Logger.warning('MUTED', `Can't send messages in #${message.channel.name} (${message.channel.id})`);
                    });
                });
            }
        }

        /* Command Cooldowns */
        if (!this.cooldowns.has(command.name)) {
            this.cooldowns.set(command.name, new Collection());
        }

        const now = Date.now();
        const timestamps = this.cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown || 0) * 1000;

        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                const timeLeftFormatted = juration.stringify(timeLeft, { format: 'long', units: 1 });

                return message.channel.createEmbed(new Embed()
                    .setColor(chariotConfig.primaryColor || 'RANDOM')
                    .setTitle(Util.getLocale(chariotConfig, "cooldown").replace("{timeLeft}", Math.round(timeLeft)).replace("{timeLeftFormatted}", timeLeftFormatted).replace("{command}", command.name))
                ).catch((embedSendError) => {
                    message.channel.createMessage(Util.getLocale(chariotConfig, "cooldown").replace("{timeLeft}", Math.round(timeLeft)).replace("{timeLeftFormatted}", timeLeftFormatted).replace("{command}", command.name)).catch((messageSendError) => {
                        Logger.warning('MUTED', `Can't send messages in #${message.channel.name} (${message.channel.id})`);
                    });
                });
            }
        }

        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

        const next = () => {
            if (commandArguments.length && command.subcommands) {
                if (Array.isArray(command.subcommands) && command.subcommands.length) {
                    for (let i = 0; i < command.subcommands.length; i++) {
                        if (!command.subcommands[i]) {
                            throw new Error('An empty subcommand name was specified inside of the subcommands property array!');
                        }

                        if (typeof command[command.subcommands[i]] !== 'function') {
                            throw new Error(`Specified subcommand "${command.subcommands[i]}" has no invokable method inside command class "${command.name}"! You can fix this by adding this method to your command class: async ${command.subcommands[i]}(message, args, chariot) {}`);
                        }

                        if (command.subcommands[i].toLowerCase() === 'execute') {
                            throw new Error('The main command executor "execute" cannot be overwritten!');
                        }
                    }

                    if (command.subcommands.includes(commandArguments[0].toLowerCase()) && typeof command[commandArguments[0].toLowerCase()] === 'function') {
                        const subcommandName = commandArguments.shift();

                        command[subcommandName.toLowerCase()](message, commandArguments, this.chariot).catch(chariotCommandExecutionError => {
                            Logger.error('SUBCOMMAND EXECUTION ERROR', `Command ${command.name} couldn't be executed because of: ${chariotCommandExecutionError.stack}`);
                        });
                    } else {
                        command.execute(message, commandArguments, this.chariot).catch(chariotCommandExecutionError => {
                            Logger.error('COMMAND EXECUTION ERROR', `Command ${command.name} couldn't be executed because of: ${chariotCommandExecutionError.stack}`);
                        });
                    }
                } else {
                    throw new Error('A specified subcommands property must be of type array and have at least 1 element! If no subcommands are required, remove the subcommands property from the command constructor!');
                }
            } else {
                command.execute(message, commandArguments, this.chariot).catch(chariotCommandExecutionError => {
                    Logger.error('COMMAND EXECUTION ERROR', `Command ${command.name} couldn't be executed because of: ${chariotCommandExecutionError.stack}`);
                });
            }
        }

        try {
            if (typeof command.runPreconditions === 'function') {
                await command.runPreconditions(message, commandArguments, this.chariot, next);
            } else {
                next();
            }
        } catch (chariotCommandExecutionError) {
            Logger.error('COMMAND EXECUTION ERROR', `Command ${command.name} couldn't be executed because of: ${chariotCommandExecutionError}`);
        }
    }
}

module.exports = MessageHandler;
