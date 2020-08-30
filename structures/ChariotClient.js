const path              = require('path');
const readdirp          = require('readdirp');
const Eris              = require('eris-additions')(require('eris'));
const Command           = require('../structures/ChariotCommand');
const Event             = require('../structures/ChariotEvent');
const Collection        = require('../helpers/Collection');
const Logger            = require('../helpers/Logger');
const MessageHandler    = require('../handlers/MessageHandler');
const Constants         = require('../constants/General');

/**
 * Main class extending the actual Eris library.
 * This class handles all the config loading, assures that all pre-conditions are met and 
 * finally registers all valid commands in the specified command directory.
 */
class ChariotClient extends Eris.Client {
    constructor (chariotOptions) {
        if (!chariotOptions.token) {
            throw new Error('You must specify a valid Discord token!');
        }

        if (!chariotOptions.chariotConfig.prefix) {
            throw new Error('You must specify a valid prefix for your bot!');
        }

        if (!chariotOptions.chariotConfig.owner.length) {
            throw new Error('You must specify a valid Discord ID for your bot owner!');
        }

        super(chariotOptions.token, chariotOptions.erisConfig);

        this.chariotOptions = chariotOptions;
        this.prefix         = chariotOptions.chariotConfig.prefix;
        this.guildPrefixes  = chariotOptions.chariotConfig.guildPrefixes;
        
        this.events         = new Set();
        this.commands       = new Collection();
        this.messageHandler = new MessageHandler(this);

        this.commandFiles   = [];
        this.eventFiles     = [];

        this._registerInternalCommands();
        this._registerChariotCommands();
        this._registerChariotEvents();
        this._addEventListeners();
        this.connect();
    }

    /**
     * Adds all event listeners. This can be overwritten in the main bot file which inherits this class
     */
    _addEventListeners() {
        this.on('ready', this._readyEmitter);
        this.on('messageCreate', this._runMessageOperators);
    }

    /**
     * Run all message operators needed off of a single event.
     * @param {object} message The message object emitted from the Discord API 
     */
    _runMessageOperators(message) {
        this._messageListener(message);
    }

    /**
     * Listen for messages, check if they might be valid commands and assign the due work to the MessageHandler
     * @param {object} message The message object emitted from the Discord API 
     */
    _messageListener(message) {
        try {
            let prefix = null;

            if (message.author.bot) return;

            if (Array.isArray(this.prefix)) {
                if (this.prefix.length === 0) {
                    throw new Error(`The array of passed prefixes mustn't be empty!`);
                }

                const mentionIndex = this.prefix.indexOf('@mention');

                if (mentionIndex !== -1) {
                    this.prefix.splice(mentionIndex, 1);
                    this.prefix.push(`<@!${this.user.id}> `, `<@${this.user.id}> `);
                }
                
                for (const pf of this.prefix) {
                    if (message.content.startsWith(pf)) {
                        prefix = pf;
                        break;
                    }
                }
            } else {
                if (this.prefix.toLowerCase() === '@mention') {
                    if (message.content.startsWith('<@!')) {
                        prefix = `<@!${this.user.id}> `;
                    } else {
                        prefix = `<@${this.user.id}> `;
                    }
                } else {
                    prefix = this.prefix;
                }
            }

            if (prefix === null && !!this.guildPrefixes) {
                if (Array.isArray(this.guildPrefixes) && this.guildPrefixes.length > 0 && message.channel.type === 0) {
                    const validPrefixes = this.guildPrefixes.filter((guildPrefix) => guildPrefix.guildID === message.channel.guild.id);
                    
                    if (validPrefixes.length > 0) {
                        const customPrefixes = validPrefixes.map((validPrefix) => validPrefix.prefix);

                        for (const customPrefix of customPrefixes) {
                            if (message.content.startsWith(customPrefix)) {
                                prefix = customPrefix;
                                break;
                            }
                        }
                    }
                }
            }

            if (!message.content.startsWith(prefix)) return;
            if (message.content === prefix) return;

            message.prefix = prefix;

            this.messageHandler.handle(message, this.commands);
        } catch (chariotListenerError) {
            Logger.error('CHARIOT ERROR', `Handling a message failed because of: ${chariotListenerError.stack}`);
        }
    }

    /**
     * This method is called once the bot is "ready" which means that it's 
     * successfully logged in to Discord and is now ready to listen to events.
     */
    _readyEmitter() {
        Logger.success('CHARIOT STARTUP', 'Successfully started and logged in!');
    }

    _registerInternalCommands() {
        if (this.chariotOptions.chariotConfig.defaultHelpCommand) {
            const defaultHelpCommand = require('../internal/commands/ChariotHelp');

            if (this.commands.find(commandName => commandName.name === defaultHelpCommand.name)) {
                throw new Error(`Default help command couldn't be initialized because another command with the same name already exists!`);
            }

            this.commands.set(defaultHelpCommand.name, defaultHelpCommand);
        }
    }

     /**
     * Register all Chariot events extending the abstract Event class, no matter where events are saved without providing any path.
     * @async
     */
    async _registerChariotEvents() {
        const directory = path.dirname(require.main.filename);
        const customDirectoryFilter = [];

        if (
            this.chariotOptions.chariotConfig.excludeDirectories !== void 0
            && Array.isArray(this.chariotOptions.chariotConfig.excludeDirectories) 
            && this.chariotOptions.chariotConfig.excludeDirectories.length >= 1
        ) {
            this.chariotOptions.chariotConfig.excludeDirectories.forEach((directoryItem) => {
                if (directoryItem.length > 0) {
                    customDirectoryFilter.push(`!${directoryItem}`);
                }
            });
        }

        const readFiles = await readdirp.promise(directory, { fileFilter: '*.js', directoryFilter: ['!.git', '!*modules', ...customDirectoryFilter] });

        this.eventFiles = readFiles.map(file => file.path);

        for (const chariotEventFile of this.eventFiles) {
            let chariotEvent = require(path.join(directory, chariotEventFile));

            if (chariotEvent.__esModule) {
                chariotEvent = chariotEvent.default;
            }

            chariotEvent.client = this;

            if (chariotEvent instanceof Event) {
                if (!Constants.EVENTS.EVENT_NAMES.includes(chariotEvent._eventName)) {
                    throw new Error(`Unknown event called "${chariotEvent._eventName}" in file "${chariotEventFile}". Event names are case sensitive! Check https://abal.moe/Eris/docs/Client for an event overview.`)
                }

                if (typeof chariotEvent.execute === 'undefined') {
                    throw new Error(`Couldn't find main executor "execute" in event file "${chariotEventFile}"!`);
                }

                this.events.add(chariotEvent);
            }
        }

        this.events.forEach((event) => {
            this.on(event._eventName, event.execute);
        });

        Logger.success('EVENTS', `Successfully loaded ${this.events.size} ${(this.events.size === 1) ? 'event' : 'events'}`);
    }

    /**
     * Register all Chariot commands extending the abstract Command class, no matter where commands are saved without providing any path.
     * @async
     */
    async _registerChariotCommands() {
        const directory = path.dirname(require.main.filename);
        const customDirectoryFilter = [];

        if (
            this.chariotOptions.chariotConfig.excludeDirectories !== void 0
            && Array.isArray(this.chariotOptions.chariotConfig.excludeDirectories) 
            && this.chariotOptions.chariotConfig.excludeDirectories.length >= 1
        ) {
            this.chariotOptions.chariotConfig.excludeDirectories.forEach((directoryItem) => {
                if (directoryItem.length > 0) {
                    customDirectoryFilter.push(`!${directoryItem}`);
                }
            });
        }

        const readFiles = await readdirp.promise(directory, { fileFilter: '*.js', directoryFilter: ['!.git', '!*modules', ...customDirectoryFilter] });
        
        this.commandFiles = readFiles.map(file => file.path);

        for (const chariotCommandFile of this.commandFiles) {
            let chariotCommand = require(path.join(directory, chariotCommandFile));

            if (chariotCommand.__esModule) {
                chariotCommand = chariotCommand.default;
            }

            if (this.commands.has(chariotCommand.name) && (chariotCommand instanceof Command)) {
                throw new Error(`A command with the name of ${chariotCommand.name} has already been registered!`);
            }

            if (chariotCommand instanceof Command) {
                this.commands.set(chariotCommand.name, chariotCommand);
            }
        }

        Logger.success('COMMANDS', `Successfully loaded ${this.commands.size} ${(this.commands.size === 1) ? 'command' : 'commands'}`);
    }
}

module.exports = ChariotClient;