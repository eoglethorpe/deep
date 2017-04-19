class InputElement extends Element {
    constructor(container, data, inputDom, className, defaultLabel) {
        let dom = $('<div class="element ' + className + ' input-element"></div>');
        dom.append($('<div class="fa fa-arrows handle"></div>'));
        dom.append($('<div class="fa fa-edit edit"></div>'));
        dom.append($('<div class="input-container"><label>' + defaultLabel + '</label></div>'));
        dom.find('.input-container').append(inputDom);
        dom.find('.input-container').resizable({ grid: GRID_SIZE });
        super(container, dom);

        this.type = className;
        if (data) {
            this.load(data);
        }

        this.addPropertiesTo(this.createPropertiesBox(this.dom.find('.edit')));
    }

    save() {
        return {
            id: this.id,
            type: this.type,
            position: this.getPosition(),
            size:  { width: this.dom.find('.input-container').css('width'), height: this.dom.find('.input-container').css('height') },
            label: this.dom.find('label').eq(0).eq(0).text(),
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
            this.dom.find('label').eq(0).eq(0).text(data.label);
        }
    }

    addPropertiesTo(container) {
        this.addIdProperty(container);
        let that = this;

        let labelProperty = $('<div class="property"></div>');
        labelProperty.append($('<label>Label</label>'));
        labelProperty.append($('<input type="text">'));
        labelProperty.find('input').val(this.dom.find('label').eq(0).eq(0).text());
        labelProperty.find('input').change(function() {
            that.dom.find('label').eq(0).eq(0).text($(this).val());
        });
        container.append(labelProperty);
    }

}


class NumberInput extends InputElement {
    constructor(container, data) {
        super(container, data, $('<input type="text" placeholder="Number input">'), 'number-input', 'Number');
    }

    getTitle() {
        return "Number Input";
    }
};

class DateInput extends InputElement {
    constructor(container, data) {
        super(container, data, $('<input type="date" placeholder="Date input">'), 'date-input', 'Date');
    }

    getTitle() {
        return "Date Input";
    }
}


class MultiselectInput extends Element {
    constructor(container, data) {
        let dom = $('<div class="element multiselect-element"></div>');
        dom.append($('<div class="fa fa-arrows handle"></div>'));
        dom.append($('<div class="fa fa-edit edit"></div>'));
        dom.append($('<div class="input-container"><label>Groups</label></div>'));
        dom.find('.input-container').append($('<select multiple><option value="">Select groups</option></select>'));
        dom.find('.input-container').resizable({ grid: GRID_SIZE, handles: 'e, w', });
        super(container, dom);

        dom.find('select').selectize();

        this.options = [{
                id: 'option-1',
                text: 'Everyone',
            }, {
                id: 'option-2',
                text: 'Special ones',
            }, {
                id: 'option-3',
                text: 'General ones',
            },
        ];

        if (data) {
            this.load(data);
        }
        this.addPropertiesTo(this.createPropertiesBox(this.dom.find('.edit')));
    }

    save() {
        return {
            id: this.id,
            type: 'multiselect',
            width: this.dom.find('.input-container').css('width'),
            left: this.dom.position().left,
            label: this.dom.find('label').eq(0).text(),
            options: this.options,
        }
    }

    load(data) {
        if (data.id) {
            this.id = data.id;
        }
        if (data.left) {
            this.dom.css('left', data.left);
        }
        if (data.width) {
            this.dom.find('.input-container').css('width', data.width);
        }
        if (data.label) {
            this.dom.find('label').eq(0).text(data.label);
        }
        if (data.options) {
            this.options = data.options;
        }
    }

    addPropertiesTo(container) {
        this.addIdProperty(container);
        let that = this;

        let labelProperty = $('<div class="property"></div>');
        labelProperty.append($('<label>Label</label>'));
        labelProperty.append($('<input type="text">'));
        labelProperty.find('input').val(this.dom.find('label').eq(0).text());
        labelProperty.find('input').change(function() {
            that.dom.find('label').eq(0).text($(this).val());
        });
        container.append(labelProperty);

        let optionsProperty = $('<div class="property options-container"></div>');
        optionsProperty.append($('<div class="header"><label>Options</label><button class="add-option"><i class="fa fa-plus"></i></button></div>'));
        optionsProperty.append($('<div class="options-container"><div class="options"></div></div>'));

        let addOption = function() {
            let option = $('<div class="option-container"><input type="text" placeholder="Enter an option"><button class="remove-option"><i class="fa fa-times"></i></button></div>');
            option.find('input').data('id', that.getUniqueId());

            option.find('.remove-option').click(function() {
                option.remove();
                that.refreshOptions();
            });

            option.find('input').change(function() {
                that.refreshOptions();
            });

            optionsProperty.find('.options').append(option);
            that.refreshOptions();

            return option;
        };
        optionsProperty.find('.add-option').click(function() {
            addOption();
        });

        for (let i=0; i<this.options.length; i++) {
            let option = addOption();
            option.find('input').val(this.options[i].text);
            option.find('input').data('id', this.options[i].id);
        }

        this.optionsProperty = optionsProperty;
        this.refreshOptions();
        container.append(optionsProperty);
    }

    getUniqueId() {
        let i = this.options.length;
        while (true) {
            i++;
            let id = 'option-' + i;
            if (!this.options.find(o => o.id==id)) {
                return id;
            }
        }
    }

    refreshOptions() {
        if (this.optionsProperty) {
            this.options = [];
            let options = this.optionsProperty.find('.options .option-container');
            for (let i=0; i<options.length; i++) {
                let option = options.eq(i).find('input').val();
                let id = options.eq(i).find('input').data('id');
                if (option && option.trim().length > 0) {
                    this.options.push({
                        id: id,
                        text: option,
                    });
                }
            }
        }

        let selectize = this.dom.find('select')[0].selectize;
        selectize.clearOptions();
        for (let i=0; i<this.options.length; i++) {
            selectize.addOption({
                value: this.options[i].id,
                text: this.options[i].text,
            });
        }
    }

    getTitle() {
        return "Multiselect Input";
    }
}
