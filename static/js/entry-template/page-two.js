
class PageTwoExcerptBox extends Element {
    constructor(container, data) {
        let dom = $('<div class="element page-two-excerpt"></div>');
        dom.append($('<div class="fa fa-arrows handle"></div>'));
        dom.append($('<div class="fa fa-edit edit"></div>'));
        dom.append($('<div class="excerpt-container"><label>Excerpt</label><textarea placeholder="Enter excerpt here" autoresize></textarea></div>'));
        dom.find('.excerpt-container').resizable({ grid: GRID_SIZE, handles: 'e, w', });
        super(container, dom);

        if (data) {
            this.load(data);
        }

        this.id = 'page-two-excerpt';
        this.addPropertiesTo(this.createPropertiesBox(this.dom.find('.edit')));
    }

    load(data) {
        if (data.id) {
            this.id = data.id;
        }
        if (data.width) {
            this.dom.find('.excerpt-container').css('width', data.width);
        }
        if (data.left) {
            this.dom.css('left', data.left);
        }
    }

    save() {
        return {
            id: this.id,
            type: 'pageTwoExcerptBox',
            width: this.dom.find('.excerpt-container').css('width'),
            left: this.dom.position().left,
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
};
