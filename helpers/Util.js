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
}

module.exports = new Util();