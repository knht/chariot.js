class ChariotConfig {
    constructor(token, commandPath, chariotConfig, erisConfig) {      
        this.token = token;
        this.commandPath = commandPath;
        this.erisConfig = erisConfig;
        this.chariotConfig = chariotConfig;
    }
}

module.exports = ChariotConfig;