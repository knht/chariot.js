/**
 * Really simple and pretty straight forward custom config holder
 */
class ChariotConfig {
    constructor(token, chariotConfig, erisConfig) {
        this.token = token;
        this.erisConfig = erisConfig;
        this.chariotConfig = chariotConfig;

        
        /**
         * Configure default locales
         */
        if (!this.chariotConfig.customLocales) {
            this.chariotConfig.customLocales = {};
        }

        this.chariotConfig.customLocales.missingPermissions = this.chariotConfig.customLocales.missingPermissions || "Can't run command **{command}** because I lack following permissions: **{missingPermissions}**";
        
        this.chariotConfig.customLocales.userPermissions = this.chariotConfig.customLocales.userPermissions || {
            title: 'Insufficient Permissions!',
            description: 'You lack following permissions to use this command: **{missingUserPermissions}**'
        };

        this.chariotConfig.customLocales.owner = this.chariotConfig.customLocales.owner || "Insufficient permissions!";
        
        this.chariotConfig.customLocales.nsfw = this.chariotConfig.customLocales.nsfw || "Command **{command}** is only available in NSFW channels!";

        this.chariotConfig.customLocales.cooldown = this.chariotConfig.customLocales.cooldown || "Please wait **{timeLeftFormatted}** before using **{command}** again";
    }
}

module.exports = ChariotConfig;
