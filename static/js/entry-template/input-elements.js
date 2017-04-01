class InputElement extends Element {
    constructor(container, data, inputDom, className, defaultLabel) {
        let dom = $('<div class="element ' + className + ' input-element"></div>');
        dom.append($('<div class="fa fa-arrows handle"></div>'));
        dom.append($('<div class="input-container"><label>' + defaultLabel + '</label></div>'));
        dom.find('.input-container').append(inputDom);
        dom.find('.input-container').resizable({ grid: 20 });
        super(container, dom);

        this.type = className;
        if (data) {
            this.load(data);
        }
    }

    save() {
        return {
            id: this.id,
            type: this.type,
            position: this.getPosition(),
            size:  { width: this.dom.find('.input-container').css('width'), height: this.dom.find('.input-container').css('height') },
            label: this.dom.find('label').text(),
        }
    }

    load(data) {
        if (data.id) {
            this.id = data.id;
        }
        if (data.position) {
            this.setPosition(data.position);
        }
        if (data.size) {
            this.dom.find('.input-container').css('width', data.size.width);
            this.dom.find('.input-container').css('height', data.size.height);
        }
        if (data.label) {
            this.dom.find('label').text(data.label);
        }
    }

    addPropertiesTo(container) {
        this.addIdProperty(container);
        let that = this;

        let labelProperty = $('<div class="property"></div>');
        labelProperty.append($('<label>Label</label>'));
        labelProperty.append($('<input type="text">'));
        labelProperty.find('input').val(this.dom.find('label').text());
        labelProperty.find('input').change(function() {
            that.dom.find('label').text($(this).val());
        });
        container.append(labelProperty);
    }

}


class NumberInput extends InputElement {
    constructor(container, data) {
        super(container, data, $('<input type="number" placeholder="Number input">'), 'number-input', 'Number');
    }

    getTitle() {
        return "Number Input"
    }
};

class DateInput extends InputElement {
    constructor(container, data) {
        super(container, data, $('<input type="date" placeholder="Date input">'), 'date-input', 'Date');
    }

    getTitle() {
        return "Date Input"
    }
}
