const crypto = require('crypto');

class Util {
    /**
     * Formats a permission name
     * @param {string} permission The permission that should be formatted
     * @returns {string} The formatted permission 
     */
    formatPermission(permission) {
        const result = permission.split(/(?=[A-Z])/).join(' ');
        
        return result.charAt(0).toUpperCase() + result.slice(1);
    }

    /**
     * Generate RFC4122 compliant v4 UUIDs
     * @returns {string} A v4 UUID
     */
    uuidv4() {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(
            /[018]/g, 
            (char) => { 
                return (char ^ crypto.randomFillSync(new Uint8Array(1))[0] & 15 >> char / 4).toString(16) 
            }
        );
    }
}

module.exports = new Util();