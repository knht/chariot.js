const chalk = require('chalk');

/**
 * Logger class for the Chariot.js Client framework. This logger class is used primarily internally,
 * however it also being exported means that users can use this logger for their commands as well.
 */
class Logger {

    /**
     * Pads a single number for unified looks in the console
     * @param {number} number The number that should be force-padded
     * @returns {number} The padded number
     */
    forcePad(number) {
        return (number < 10 ? '0' : '') + number;
    }

    /**
     * Gets the full current system time and date for logging purposes
     * @returns {string} The formatted current time
     */
    getCurrentTime() {
        const now = new Date();
        const day = this.forcePad(now.getDate());
        const month = this.forcePad(now.getMonth() + 1);
        const year = this.forcePad(now.getFullYear());
        const hour = this.forcePad(now.getHours());
        const minute = this.forcePad(now.getMinutes());
        const second = this.forcePad(now.getSeconds());

        return `${day}.${month}.${year} ${hour}:${minute}:${second}`;
    }

    /**
     * Custom log an expression with log levels, custom heading and custom body
     * @param {number} logLevel The log level of this log. 0: Success, 1: Warning, 2: Error 
     * @param {string} head The heading of this log enty
     * @param {string} body The body of the log entry
     */
    log(logLevel, head, body) {
        switch (logLevel) {
            case 0: {
                console.log(chalk.green(`[ ${this.getCurrentTime()} ] [ ${head} ] `) + body);
                break;
            }

            case 1: {
                console.log(chalk.yellow(`[ ${this.getCurrentTime()} ] [ ${head} ] `) + body);
                break;
            }

            case 2: {
                console.log(chalk.red(`[ ${this.getCurrentTime()} ] [ ${head} ] `) + body);
                break;
            }
        }
    }
}

module.exports = new Logger();