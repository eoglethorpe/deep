
class PageOneEntrySelector extends Element {
    constructor(container, data) {
        let dom = $('<div class="element page-one-entry-selector"></div>');
        dom.append($('<div class="fa fa-arrows handle"></div>'));
        dom.append($('<div class="select-container"><select><option value="">Select an entry</option></select></div>'));
        dom.find('.select-container').resizable({ grid: 20 });
        super(container, dom);

        dom.find('select').selectize();

        if (data) {
            this.load(data);
        }
    }

    load(data) {
        if (data.size) {
            this.dom.find('.select-container').css('width', data.size.width);
            this.dom.find('.select-container').css('height', data.size.height);
        }
        if (data.position) {
            this.setPosition(data.position);
        }
    }

    save() {
        return {
            type: 'pageOneEntrySelector',
            size:  { width: this.dom.find('.select-container').css('width'), height: this.dom.find('.select-container').css('height') },
            position: this.getPosition(),
        };
    }

    getTitle() {
        return "Entry selector"
    }

    isRemovable() {
        return false;
    }
};


class PageOneExcerptBox extends Element {
    constructor(container, data) {
        let dom = $('<div class="element page-one-excerpt"></div>');
        dom.append($('<div class="fa fa-arrows handle"></div>'));
        dom.append($('<div class="excerpt-container"><textarea placeholder="Enter excerpt here" autoresize></textarea></div>'));
        dom.find('.excerpt-container').resizable({ grid: 20 });
        super(container, dom);

        if (data) {
            this.load(data);
        }
    }

    load(data) {
        if (data.size) {
            this.dom.find('.excerpt-container').css('width', data.size.width);
            this.dom.find('.excerpt-container').css('height', data.size.height);
        }
        if (data.position) {
            this.setPosition(data.position);
        }
    }

    save() {
        return {
            type: 'pageOneExcerptBox',
            size:  { width: this.dom.find('.excerpt-container').css('width'), height: this.dom.find('.excerpt-container').css('height') },
            position: this.getPosition(),
        };
    }

    getTitle() {
        return "Excerpt Box"
    }

    isRemovable() {
        return false;
    }
};


class PageOneImageBox extends Element {
    constructor(container, data) {
        let dom = $('<div class="element page-one-image"></div>');
        dom.append($('<div class="fa fa-arrows handle"></div>'));
        dom.append($('<div class="image-container">Image</div>'));
        dom.find('.image-container').resizable({ grid: 20 });
        super(container, dom);

        if (data) {
            this.load(data);
        }
    }

    load(data) {
        if (data.size) {
            this.dom.find('.image-container').width(data.size.width);
            this.dom.find('.image-container').height(data.size.height);
        }
        if (data.position) {
            this.setPosition(data.position);
        }
    }

    save() {
        return {
            type: 'pageOneImageBox',
            size:  { width: this.dom.find('.image-container').width(), height: this.dom.find('.image-container').height() },
            position: this.getPosition(),
        };
    }

    getTitle() {
        return "Image Box"
    }

    isRemovable() {
        return false;
    }
};
