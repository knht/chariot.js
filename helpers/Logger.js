const chalk = require('chalk');

class Logger {

    forcePad(number) {
        return (number < 10 ? '0' : '') + number;
    }

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