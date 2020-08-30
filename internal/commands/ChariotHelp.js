const Embed = require('../../structures/ChariotEmbed');
const Logger = require('../../helpers/Logger');

class ChariotHelp {
    constructor() {
        this.name = 'help';
        this.permissions = ['embedLinks'];
        this.allowDMs = true;
        this.help = {
            message: 'Get either a general Help card or instructions for specified commands! Specifying a command is optional. If a command was specified its help text will show up.',
            usage: 'help [command]',
            example: ['help', 'help command'],
            inline: true
        }
    }

    async execute(message, args, chariot) {
        const prefixHandler = (message.prefix === `<@!${chariot.user.id}> ` || message.prefix === `<@${chariot.user.id}> `) ? `@${chariot.user.username}#${chariot.user.discriminator} ` : message.prefix;

        if (!args[0]) {
            const commandNames = chariot.commands.filter((cmnds) => !cmnds.owner).filter((cmnds) => (cmnds.hasOwnProperty('help')) ? ((cmnds.help.visible === undefined) ? true : !(cmnds.help.visible === false)) : true).map((cmnds) => '`' + cmnds.name + '`');

            return message.channel.createEmbed(new Embed()
                .setColor(chariot.chariotOptions.chariotConfig.primaryColor || 'RANDOM')
                .setTitle('Command Help')
                .setDescription(`Get detailed command instructions for any command!\n You can specify a certain command by writing \`${prefixHandler}help <commandName>\`!`)
                .addField('Commands', commandNames.join(', '))
            );
        } else {
            const foundCommand = chariot.commands.get(args[0]) || chariot.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(args[0]));

            if (!foundCommand) {
                return message.channel.createEmbed(new Embed()
                    .setColor('RED')
                    .setTitle(`Couldn't find command **${args[0]}**!`)
                );
            }

            if (foundCommand.owner && !chariot.chariotOptions.chariotConfig.owner.includes(message.author.id)) {
                return message.channel.createEmbed(new Embed()
                    .setColor('RED')
                    .setTitle('Insufficient Permissions!')
                );
            }

            if (foundCommand && !foundCommand.help) {
                return message.channel.createEmbed(new Embed()
                    .setColor('RED')
                    .setDescription(`Unfortunately command **${foundCommand.name}** has no integrated help text yet.`)
                );
            }

            const helpEmbed = new Embed();

            helpEmbed.setColor(chariot.chariotOptions.chariotConfig.primaryColor || 'RANDOM');
            helpEmbed.setTitle(`**${foundCommand.name}** Help`);
            helpEmbed.setDescription(foundCommand.help.message || 'No help description available');
            helpEmbed.addField('Usage', (foundCommand.help.usage) ? `\`${prefixHandler}${foundCommand.help.usage}\`` : 'No usage available', foundCommand.help.inline);

            let helpArray = [];
            let exampleText = '';

            if (Array.isArray(foundCommand.help.example)) {
                helpArray = foundCommand.help.example.map((helpItem) => `\`${prefixHandler}${helpItem}\``);
                exampleText = helpArray.join(', ');
            } else {
                exampleText = `\`${prefixHandler}${foundCommand.help.example}\``;
            }

            helpEmbed.addField(Array.isArray(foundCommand.help.example) ? 'Examples' : 'Example', exampleText, foundCommand.help.inline);

            if (foundCommand.aliases && foundCommand.aliases.length) {
                const commandAliases = foundCommand.aliases.map((alias) => `\`${alias}\``);
                helpEmbed.addField('Aliases', commandAliases.join(', '), false);
            }

            message.channel.createEmbed(helpEmbed);
            Logger.success('HELP', `${message.author.username}#${message.author.discriminator} (${message.author.id}) used the help command for command ${foundCommand.name}.`);
        }
    }
}

module.exports = new ChariotHelp();