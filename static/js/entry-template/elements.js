
class Element {
    constructor(container, dom) {
        this.dom = dom;
        container.append(dom);
        if (dom.find('.handle').length > 0) {
            dom.draggable({ scroll: true, grid: [16, 16], containment: container, handle: '.handle' });
        } else {
            dom.draggable({ scroll: true, grid: [16, 16], containment: container });
        }
        this.id = templateEditor.getUniqueElementId();
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
        this.addIdProperty(container);
    }

    addIdProperty(container) {
        let that = this;

        let idProperty = $('<div class="property"></div>');
        idProperty.append($('<label>Id</label>'));
        idProperty.append($('<input type="text">'));
        idProperty.find('input').val(this.id);

        idProperty.find('input').change(function() {
            let oldValue = that.id;

            that.id = '`!@#$%^&*()_+][]';
            if (templateEditor.checkElementId($(this).val())) {
                alert('This id is already taken by another element');
                $(this).val(oldValue);
            } else {
                that.id = $(this).val();
            }
        });
        container.append(idProperty);
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
            id: this.id,
            type: 'noob',
            position: this.getPosition(),
            backgroundColor: rgb2hex(this.dom.css('background-color')),
        }
    }

    load(data) {
        if (data.id) {
            this.id = data.id;
        }
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
        this.addIdProperty(container);
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
