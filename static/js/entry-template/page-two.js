
class PageTwoExcerptBox extends Element {
    constructor(container, data) {
        let dom = $('<div class="element page-two-excerpt"></div>');
        dom.append($('<div class="fa fa-arrows handle"></div>'));
        dom.append($('<div class="fa fa-edit edit"></div>'));
        dom.append($('<div class="excerpt-container"><label class="excerpt-label">Excerpt</label> / <label class="image-label">Image</label><textarea placeholder="Enter excerpt here" autoresize></textarea></div>'));
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
        if (data.excerptLabel) {
            this.dom.find('.excerpt-label').text(data.excerptLabel);
        }
        if (data.imageLabel) {
            this.dom.find('.image-label').text(data.imageLabel);
        }
    }

    save() {
        return {
            id: this.id,
            type: 'pageTwoExcerptBox',
            width: this.dom.find('.excerpt-container').css('width'),
            left: this.dom.position().left,
            excerptLabel: this.dom.find('.excerpt-label').text(),
            imageLabel: this.dom.find('.image-label').text(),
        };
    }

    getTitle() {
        return "Excerpt Box"
    }

    isRemovable() {
        return false;
    }

    addPropertiesTo(container) {
        let that = this;

        let labelProperty = $('<div class="property"></div>');
        labelProperty.append($('<label>Excerpt label</label>'));
        labelProperty.append($('<input type="text">'));
        labelProperty.find('input').val(this.dom.find('.excerpt-label').eq(0).text());
        labelProperty.find('input').change(function() {
            that.dom.find('.excerpt-label').eq(0).text($(this).val());
            templateEditor.reloadElements();
        });
        container.append(labelProperty);

        labelProperty = $('<div class="property"></div>');
        labelProperty.append($('<label>Image label</label>'));
        labelProperty.append($('<input type="text">'));
        labelProperty.find('input').val(this.dom.find('.image-label').eq(0).text());
        labelProperty.find('input').change(function() {
            that.dom.find('.image-label').eq(0).text($(this).val());
            templateEditor.reloadElements();
        });
        container.append(labelProperty);
    }
};
