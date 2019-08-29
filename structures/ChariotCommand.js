/**
 * Basic abstract Command class for command identification
 */
class ChartiotCommand {
    execute() {
        throw new Error('No command logic implemented! Please check the official example on GitHub. https://github.com/riyacchi/chariot.js-example');
    }
}

module.exports = ChartiotCommand;