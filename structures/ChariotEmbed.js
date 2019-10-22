const Colors = require('./ChariotColors');

/**
 * Custom Discord Embed builder with color resolving
 */
class ChariotEmbed {
    constructor(data = {}) {
        this.fields = [];
        Object.assign(this, data);

        return this;
    }

    /**
     * Set the author of this Embed
     * @param {string} name Name of the Author 
     * @param {string} icon URL of the icon that should be used
     * @param {string} url URL of the author if clicked
     */
    setAuthor(name, icon, url) {
        this.author = { name, icon_url: icon, url };

        return this;
    }

    /**
     * Resolves a color to a usable "Discord readable" color
     * @private
     * @param {*} color Any color which can be resolved 
     */
    _resolveColor(color) {
        if (typeof color === 'string') {
            if (color === 'RANDOM') return Math.floor(Math.random() * (0xFFFFFF + 1));
            color = Colors[color.toUpperCase()] || parseInt(color.replace('#', ''), 16);
        }

        return color;
    }

    /**
     * Set the color of this Embed
     * @param {*} color Any color resolvable by this._resolveColor 
     */
    setColor(color) {
        this.color = this._resolveColor(color);

        return this;
    }

    /**
     * Set the description of this Embed
     * @param {string} desc A description
     */
    setDescription(desc) {
        this.description = desc.toString().substring(0, 2048);

        return this;
    }

    /**
     * Add a field to the Embed
     * @param {string} name The name (or title if you will) of the field 
     * @param {string} value The content of the field
     * @param {boolean} inline Whether this field should be inline or not 
     */
    addField(name, value, inline = false) {
        if (this.fields.length >= 25) {
            return this;
        } else if (!name) {
            return this;
        } else if (!value) {
            return false;
        }

        this.fields.push({ name: name.toString().substring(0, 256), value: value.toString().substring(0, 1024), inline });

        return this;
    }

    /**
     * Add a blank field to the Embed
     * @param {boolean} inline Whether this field should be inline or not 
     */
    addBlankField(inline = false) {
        return this.addField('\u200B', '\u200B', inline);
    }

    /**
     * Attaches a file to the Embed
     * @param {*} file The file to be attached
     */
    attachFile(file) {
        this.file = file;

        return this;
    }

    /**
     * Set the footer of this Embed
     * @param {string} text The footer's text 
     * @param {string} icon The URL of an icon that should be used in the footer
     */
    setFooter(text, icon) {
        this.footer = { text: text.toString().substring(0, 2048), icon_url: icon };

        return this;
    }

    /**
     * Set the image of this Embed
     * @param {string} url The image url  
     */
    setImage(url) {
        this.image = { url };

        return this;
    }

    /**
     * Set the timestamp of this Embed
     * @param {*} time A time resolvable, e.g. a UTC timestamp or epoch timestamps in MS  
     */
    setTimestamp(time = new Date()) {
        this.timestamp = time;

        return this;
    }

    /**
     * Set the title of this Embed
     * @param {string} title The title this Embed should have
     */
    setTitle(title) {
        this.title = title.toString().substring(0, 256);

        return this;
    }

    /**
     * Set the thumbnail of this Embed
     * @param {string} url The thumbnail URL of this Embed 
     */
    setThumbnail(url) {
        this.thumbnail = { url };

        return this;
    }

    /**
     * Set the URL of this Embed
     * @param {string} url The URL of this Embed 
     */
    setUrl(url) {
        this.url = url;

        return this;
    }
}

module.exports = ChariotEmbed;

