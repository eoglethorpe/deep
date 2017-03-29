
class Element {
    constructor(container, dom) {
        this.dom = dom;
        container.append(dom);
        if (dom.find('.handle').length > 0) {
            dom.draggable({ scroll: true, grid: [16, 16], containment: container, handle: '.handle' });
        } else {
            dom.draggable({ scroll: true, grid: [16, 16], containment: container });
        }
    }

    save() {
        return {}
    }

    getPosition() {
        return {
            left: this.dom.position().left,
            top: this.dom.position().top
        };
    }

    setPosition(position) {
        this.dom.css('left', position.left);
        this.dom.css('top', position.top);
    }

    getTitle() {
        return "Element"
    }

    addPropertiesTo(container) {

    }

    isRemovable() {
        return true;
    }
};


class NoobWidget extends Element {
    constructor(container, data) {
        let dom = $('<div class="element noob-widget">Noob</div>');
        dom.css('background-color', '#fff');
        super(container, dom);

        if (data) {
            this.load(data);
        }
    }

    save() {
        return {
            type: 'noob',
            position: this.getPosition(),
            backgroundColor: rgb2hex(this.dom.css('background-color')),
        }
    }

    load(data) {
        if (data.position) {
            this.setPosition(data.position);
        }
        if (data.backgroundColor) {
            this.dom.css('background-color', data.backgroundColor);
        }
    }

    getTitle() {
        return "Noob Widget"
    }

    addPropertiesTo(container) {
        let that = this;

        let colorProperty = $('<div class="property"></div>');
        colorProperty.append($('<label>Background color</label>'));
        colorProperty.append($('<input type="color">'));
        colorProperty.find('input').val(rgb2hex(this.dom.css('background-color')));
        colorProperty.find('input').change(function() {
            that.dom.css('background-color', $(this).val());
        });
        container.append(colorProperty);
    }
};
