/**
 * Basic abstract Command class for command identification
 */
class ChariotEvent {
    /**
     * Instantiate a new Chariot.js Event 
     * @param {string} event A valid Eris event name! E.g. messageCreate, guildMemberAdd, etc.
     */
    constructor(event) {
        this._eventName = event;
    }
}

module.exports = ChariotEvent;