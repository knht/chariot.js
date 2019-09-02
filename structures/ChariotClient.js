const path              = require('path');
const readdirp          = require('readdirp');
const Eris              = require('eris-additions')(require('eris'));
const Command           = require('../structures/ChariotCommand');
const Event             = require('../structures/ChariotEvent');
const Collection        = require('../helpers/Collection');
const Logger            = require('../helpers/Logger');
const MessageHandler    = require('../handlers/MessageHandler');

/**
 * Main class extending the actual Eris library.
 * This class handles all the config loading, assures that all pre-conditions are met and 
 * finally registers all valid commands in the specified command directory.
 */
class ChariotClient extends Eris.Client {
    constructor (chariotOptions) {

        if (!chariotOptions.token) {
            throw "You must specify a valid Discord token!";
        }

        if (!chariotOptions.chariotConfig.prefix) {
            throw "You must specify a valid prefix for your bot!";
        }

        if (!chariotOptions.chariotConfig.owner.length) {
            throw "You must specify a valid Discord ID for your bot owner!";
        }

        super(chariotOptions.token, chariotOptions.erisConfig);

        this.chariotOptions = chariotOptions;
        this.prefix         = chariotOptions.chariotConfig.prefix;
        
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
            if (!this.chariotOptions.chariotConfig.allowDMs) {
                if (message.channel.type !== 0) return;
            }

            if (message.author.bot) return;
            if (!message.content.startsWith(this.prefix)) return;
            if (message.content === this.prefix) return;

            this.messageHandler.handle(message, this.commands);
        } catch (chariotListenerError) {
            Logger.log(2, "CHARIOT ERROR", `Handling a message failed because of: ${chariotListenerError}`);
        }
    }

    /**
     * This method is called once the bot is "ready" which means that it's 
     * successfully logged in to Discord and is now ready to listen to events.
     */
    _readyEmitter() {
        Logger.log(0, "CHARIOT STARTUP", "Successfully started and logged in!");
    }

    _registerInternalCommands() {
        if (this.chariotOptions.chariotConfig.defaultHelpCommand) {
            const defaultHelpCommand = require('../internal/commands/ChariotHelp');

            if (this.commands.find(commandName => commandName.name === defaultHelpCommand.name)) {
                throw `Default help command couldn't be initialized because another command with the same name already exists!`;
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
        const readFiles = await readdirp.promise(directory, { fileFilter: '*.js', directoryFilter: ['!.git', '!*modules'] });

        this.eventFiles = readFiles.map(file => file.path);

        for (const chariotEventFile of this.eventFiles) {
            const chariotEvent = require(path.join(directory, chariotEventFile));

            if (chariotEvent instanceof Event) {
                this.events.add(chariotEvent);
            }
        }

        this.events.forEach((event) => {
            this.on(event._eventName, event.execute);
        });

        Logger.log(0, "EVENTS", `Successfully loaded ${this.events.size} ${(this.events.size === 1) ? 'event' : 'events'}`);
    }

    /**
     * Register all Chariot commands extending the abstract Command class, no matter where commands are saved without providing any path.
     * @async
     */
    async _registerChariotCommands() {
        const directory = path.dirname(require.main.filename);
        const readFiles = await readdirp.promise(directory, { fileFilter: '*.js', directoryFilter: ['!.git', '!*modules'] });
        
        this.commandFiles = readFiles.map(file => file.path);

        for (const chariotCommandFile of this.commandFiles) {
            const chariotCommand = require(path.join(directory, chariotCommandFile));

            if (this.commands.has(chariotCommand.name)) {
                throw new Error(`A command with the name of ${chariotCommand.name} has already been registered!`);
            }

            if (chariotCommand instanceof Command) {
                this.commands.set(chariotCommand.name, chariotCommand);
            }
        }

        Logger.log(0, "COMMANDS", `Successfully loaded ${this.commands.size} ${(this.commands.size === 1) ? 'command' : 'commands'}`);
    }
}

module.exports = ChariotClient;