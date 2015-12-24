class Util {
    constructor (w, g) {
        this.g = g || document;
        this.w = w || window;
    }

    /* Gets DOM elements which are detected CSS selector */
    getDom (selector) {
        if (selector === undefined) return false;
        return document.querySelector(selector);
    }

    getDoms (selector) {
        if (selector === undefined) return false;
        return document.querySelectorAll(selector);
    }

    /* Get DOM element which has a given id */
    getDomById (id) {
        return this.getDom('#' + id);
    }
}

var util = new Util();
