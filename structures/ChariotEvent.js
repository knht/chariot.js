/**
 * Basic abstract Command class for command identification
 */
class ChariotEvent {
    /**
     * Instantiate a new Chartio.js Event 
     * @param {string} event A valid Eris event name! E.g. messageCreate, guildMemberAdd, etc.
     */
    constructor(event) {
        this._checkEventValidity(event);
        this._eventName = event;
    }

    _checkEventValidity(event) {
        const validEvents = [
            '',
        ];
    }
}

module.exports = ChariotEvent;