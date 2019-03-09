const read              = require('fs-readdir-recursive');
const Eris              = require("eris-additions")(require("eris"));
const Collection        = require('../helpers/Collection');
const Logger            = require('../helpers/Logger');
const MessageHandler    = require('../handlers/MessageHandler');

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

        if (!chariotOptions.chariotConfig.owner) {
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

    _addEventListeners() {
        this.on('ready', this._readyEmitter);
        this.on('messageCreate', this._runMessageOperators);
    }

    _runMessageOperators(message) {
        this._messageListener(message);
    }

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

    _readyEmitter() {
        Logger.log(0, "CHARIOT STARTUP", "Successfully started and logged in!");
    }

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