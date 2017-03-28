
let templateEditor = {
    init: function() {
        let that = this;
        this.elements = [];

        $('#noob-widget button').on('click', function() {
            that.addElement(new NoobWidget($('main')));
        });

        $('#matrix1d-widget button').on('click', function() {
            that.addElement(new Matrix1D($('main')));
        });

        // Save button
        $('#save-button').click(function() {
            redirectPost(window.location.pathname, {
                data: JSON.stringify(that.save()),
            }, csrf_token);
        });
    },

    addElement: function(element) {
        let that = this;
        this.elements.push(element);

        let elementProperties = $('#elements .element-template').clone();
        elementProperties.removeClass('element-template').addClass('element');
        elementProperties.find('h4').text(element.getTitle());

        if (element.isRemovable()) {
            elementProperties.find('.delete-element').click(function() {
                elementProperties.remove();
                that.elements.splice(that.elements.indexOf(element), 1);
                element.dom.remove();
            });
        }
        else {
            elementProperties.find('.delete-element').hide();
        }
        element.addPropertiesTo(elementProperties.find('.properties'));

        elementProperties.find('.properties').hide();
        elementProperties.find('.toggle-properties').click(function() {
            let btn = $(this);
            elementProperties.find('.properties').slideToggle(function() {
                if ($(this).is(':visible')) {
                    btn.removeClass('fa-chevron-down').addClass('fa-chevron-up');
                } else {
                    btn.removeClass('fa-chevron-up').addClass('fa-chevron-down');
                }
            });
        });

        $('#elements').append(elementProperties);
        elementProperties.show();
    },

    load: function(data) {
        let that = this;
        this.elements = [];
        $('#elements .element').remove();

        $('#template-name').text(data.name);
        $('main').empty();

        let entrySelectorAdded = false;
        let excerptBoxAdded = false;
        let imageBoxAdded = false;

        for (let i=0; i<data.elements.length; i++) {
            let element = data.elements[i];
            if (element.type == 'noob') {
                that.addElement(new NoobWidget($('main'), element));
            }
            else if (element.type == 'matrix1d') {
                that.addElement(new Matrix1D($('main'), element));
            }
            else if (element.type == 'pageOneExcerptBox') {
                excerptBoxAdded = true;
                that.addElement(new PageOneExcerptBox($('main'), element));
            }
            else if (element.type == 'pageOneImageBox') {
                imageBoxAdded = true;
                that.addElement(new PageOneImageBox($('main'), element));
            }
            else if (element.type == 'pageOneEntrySelector') {
                entrySelectorAdded = true;
                that.addElement(new PageOneEntrySelector($('main'), element));
            }
        }

        if (!excerptBoxAdded) {
            that.addElement(new PageOneExcerptBox($('main')));
        }
        if (!imageBoxAdded) {
            that.addElement(new PageOneImageBox($('main')));
        }
        if (!entrySelectorAdded) {
            that.addElement(new PageOneEntrySelector($('main')));
        }
    },

    save: function() {
        let data = {};
        data['name'] = $('#template-name').text();
        data['elements'] = [];
        for (let i=0; i<this.elements.length; i++) {
            data['elements'].push(this.elements[i].save());
        }
        return data;
    },
};


$(document).ready(function() {
    templateEditor.init();
    templateEditor.load(templateData);
    $('#elements').sortable();
});
