
class PageOneEntrySelector extends Element {
    constructor(container, data) {
        let dom = $('<div class="element page-one-entry-selector"></div>');
        dom.append($('<div class="fa fa-arrows handle"></div>'));
        dom.append($('<div class="fa fa-edit edit"></div>'));
        dom.append($('<div class="select-container"><select><option value="">Select an entry</option></select></div>'));
        dom.find('.select-container').resizable({ grid: GRID_SIZE });
        super(container, dom);

        dom.find('select').selectize();

        if (data) {
            this.load(data);
        }

        this.id = 'entry-selector';
        this.addPropertiesTo(this.createPropertiesBox(this.dom.find('.edit')));
    }

    load(data) {
        if (data.id) {
            this.id = data.id;
        }
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
            id: this.id,
            type: 'pageOneEntrySelector',
            size:  { width: this.dom.find('.select-container').css('width'), height: this.dom.find('.select-container').css('height') },
            position: this.getPosition(),
        };
    }

    getTitle() {
        return "Entry selector";
    }

    isRemovable() {
        return false;
    }

    addPropertiesTo(container) {

    }

    getAllowedPage() {
        return 'page-one';
    }
};


class PageOneExcerptBox extends Element {
    constructor(container, data) {
        let dom = $('<div class="element page-one-excerpt"></div>');
        dom.append($('<div class="fa fa-arrows handle"></div>'));
        dom.append($('<div class="fa fa-edit edit"></div>'));
        dom.append($('<div class="excerpt-container"><label class="title">Excerpt</label><textarea placeholder="Enter excerpt here" autoresize></textarea></div>'));
        dom.find('.excerpt-container').resizable({ grid: GRID_SIZE });
        super(container, dom);

        if (data) {
            this.load(data);
        }

        this.id = 'page-one-excerpt';
        this.addPropertiesTo(this.createPropertiesBox(this.dom.find('.edit')));
    }

    load(data) {
        if (data.id) {
            this.id = data.id;
        }
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
            id: this.id,
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

    addPropertiesTo(container) {

    }

    getAllowedPage() {
        return 'page-one';
    }
};


class PageOneImageBox extends Element {
    constructor(container, data) {
        let dom = $('<div class="element page-one-image"></div>');
        dom.append($('<div class="fa fa-arrows handle"></div>'));
        dom.append($('<div class="fa fa-edit edit"></div>'));
        dom.append($('<div class="image-container"><label class="title">Image</label><div class="image-box"></div></div>'));
        dom.find('.image-container').resizable({ grid: GRID_SIZE });
        super(container, dom);

        if (data) {
            this.load(data);
        }

        this.id = 'page-one-image';
        this.addPropertiesTo(this.createPropertiesBox(this.dom.find('.edit')));
    }

    load(data) {
        if (data.id) {
            this.id = data.id;
        }
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
            id: this.id,
            type: 'pageOneImageBox',
            size:  { width: this.dom.find('.image-container').width(), height: this.dom.find('.image-container').height() },
            position: this.getPosition(),
        };
    }

    getTitle() {
        return "Image Box";
    }

    isRemovable() {
        return false;
    }

    addPropertiesTo(container) {

    }

    getAllowedPage() {
        return 'page-one';
    }
};
