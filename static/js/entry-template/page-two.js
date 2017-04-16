
class PageTwoExcerptBox extends Element {
    constructor(container, data) {
        let dom = $('<div class="element page-two-excerpt"></div>');
        dom.append($('<div class="fa fa-arrows handle"></div>'));
        dom.append($('<div class="fa fa-edit edit"></div>'));
        dom.append($('<div class="excerpt-container"><label>Excerpt</label><textarea placeholder="Enter excerpt here" autoresize></textarea></div>'));
        dom.find('.excerpt-container').resizable({ grid: 20 });
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
            type: 'pageTwoExcerptBox',
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
};
