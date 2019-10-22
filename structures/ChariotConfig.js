/**
 * Really simple and pretty straight forward custom config holder
 */
class ChariotConfig {
    constructor(token, chariotConfig, erisConfig) {      
        this.token = token;
        this.erisConfig = erisConfig;
        this.chariotConfig = chariotConfig;
    }
}

module.exports = ChariotConfig;