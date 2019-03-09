const Eris = require('eris');

class Collection extends Eris.Collection {
    constructor(baseObject, limit) {
        super(baseObject, limit);
    }
}

module.exports = Collection;