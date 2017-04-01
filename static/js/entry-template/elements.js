
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

    getAllowedPage() {
        return 'all';
    }
};
