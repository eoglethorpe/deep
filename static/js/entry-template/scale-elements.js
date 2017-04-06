class ScaleElement extends Element {
    constructor(container, data) {
        let dom = $('<div class="element scale-element"></div>');
        dom.append($('<div class="fa fa-arrows handle"></div>'));
        dom.append($('<div class="scale-container"><label>Scale</label></div>'));
        dom.find('.scale-container').append($('<div class="scale"></div>'));
        dom.find('.scale-container').resizable({ grid: 5 });
        super(container, dom);

        this.scaleValues = [
            { name: 'No problem', color: '#e5c6c6', default: true },
            { name: 'Minor problem', color: '#d99b9b' },
            { name: 'Situation of concern', color: '#ce7171' },
            { name: 'Situation of major concern', color: '#c24646' },
            { name: 'Severe conditions', color: '#b71c1c' },
            { name: 'Critical situation', color: '#b71c1c' },
        ];

        if (data) {
            this.load(data);
        }
    }

    save() {
        return {
            id: this.id,
            type: 'scale',
            position: this.getPosition(),
            size:  { width: this.dom.find('.scale-container').css('width'), height: this.dom.find('.scale-container').css('height') },
            label: this.dom.find('label').text(),
            scaleValues: this.scaleValues,
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
            this.dom.find('.scale-container').css('width', data.size.width);
            this.dom.find('.scale-container').css('height', data.size.height);
        }
        if (data.label) {
            this.dom.find('label').text(data.label);
        }
        if (data.scaleValues) {
            this.scaleValues = data.scaleValues;
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

        let scaleProperty = $('<div class="property scale-property"></div>');
        scaleProperty.append($('<label>Scale values</label>'));
        scaleProperty.append($('<div class="values-container"><div class="values"></div><button class="add-value">+</button></div>'));

        let addValue = function() {
            let value = $('<div class="value-container"><input class="default" name="default" type="radio"><input type="text" class="name" placeholder="Enter value name, e.g.: Critical"><input class="color" type="color"><button class="remove-value">-</button></div>');

            value.find('.remove-value').click(function() {
                value.remove();
                that.refreshScale();
            });

            value.find('.name').change(function() {
                that.refreshScale();
            });
            value.find('.color').change(function() {
                that.refreshScale();
            });
            value.find('.default').change(function() {
                that.refreshScale();
            });

            scaleProperty.find('.values').append(value);
            that.refreshScale();

            return value;
        };
        scaleProperty.find('.add-value').click(function() {
            addValue();
        });

        for (let i=0; i<this.scaleValues.length; i++) {
            let value = addValue();
            value.find('.default').attr('checked', this.scaleValues[i].default);
            value.find('.name').val(this.scaleValues[i].name);
            value.find('.color').val(this.scaleValues[i].color);
        }

        this.scaleProperty = scaleProperty;
        this.refreshScale();
        container.append(scaleProperty);
    }

    refreshScale() {
        if (this.scaleProperty) {
            this.scaleValues = [];
            let values = this.scaleProperty.find('.values .value-container');
            for (let i=0; i<values.length; i++) {
                this.scaleValues.push({
                    name: values.eq(i).find('.name').val(),
                    color: values.eq(i).find('.color').val(),
                    default: values.eq(i).find('.default').is(':checked'),
                });
            }
        }

        let scale = this.dom.find('.scale-container .scale');
        scale.find('.value').remove();
        for (let i=0; i<this.scaleValues.length; i++) {
            let value = $('<div class="value ' + (this.scaleValues[i].default?'default':'') + '" style="background-color: ' + this.scaleValues[i].color + '" title="' + this.scaleValues[i].name + '"></div>');
            scale.append(value);
        }
        scale.show();
    }

    getTitle() {
        return "Scale";
    }
}
