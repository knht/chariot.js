const read              = require('fs-readdir-recursive');
const Eris              = require("eris-additions")(require("eris"));
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

        if (!chariotOptions.commandPath) {
            throw "You must specify a valid path for your command directory!";
        }

        if (!chariotOptions.chariotConfig.prefix) {
            throw "You must specify a valid prefix for your bot!";
        }

        if (!chariotOptions.chariotConfig.owner.length) {
            throw "You must specify a valid Discord ID for your bot owner!";
        }

        super(chariotOptions.token, chariotOptions.erisConfig);

        this.chariotOptions = chariotOptions;
        this.prefix = chariotOptions.chariotConfig.prefix;
        this.commands = new Collection();
        this.commandFiles = [];
        this.messageHandler = new MessageHandler(this);
        this._registerChariotCommands(chariotOptions.commandPath);
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
                if (message.channel.type != 0) return;
            }

            if (message.author.bot) return;
            if (!message.content.startsWith(this.prefix)) return;
            if (message.content == this.prefix) return;

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

    /**
     * Registering all commands within the specified command path.
     * This method also checks for duplicate command names and ignores
     * any file type but JavaScript files to avoid unwanted behavior due to user error.
     * @param {string} directory The directory path of the command files. 
     */
    _registerChariotCommands(directory) {
        this.commandFiles = read(directory).filter(file => file.endsWith('.js'));

        for (const chariotCommandFile of this.commandFiles) {
            const chariotCommand = require(`${directory}/${chariotCommandFile}`);

            if (this.commands.find(commandName => commandName.name == chariotCommand.name)) {
                throw `A command with the name of ${chariotCommand.name} has already been registered!`;
            }

            this.commands.set(chariotCommand.name, chariotCommand);
        }

        const commandPlural = this.commands.size == 1 ? 'command' : 'commands';
        Logger.log(0, "COMMANDS", `Successfully loaded ${this.commands.size} ${commandPlural}`);
    }
}

module.exports = ChariotClient;