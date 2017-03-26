
class Element {
    constructor(container, dom) {
        this.dom = dom;
        container.append(dom);
        if (dom.find('.handle').length > 0) {
            dom.draggable({ grid: [16, 16], containment: container, handle: '.handle' });
        } else {
            dom.draggable({ grid: [16, 16], containment: container });
        }
    }

    save() {
        return {}
    }
};

class PageOneExcerptBox extends Element {
    constructor(container, data) {
        let dom = $('<div class="element page-one-excert"></div>');
        dom.append($('<div class="fa fa-arrows handle"></div>'));
        dom.append($('<textarea placeholder="Enter excerpt here"></textarea>'));
        super(container, dom);
    }

    load(data) {
        if (data.size) {
            this.dom.find('textarea').attr('cols', data.size.cols);
            this.dom.find('textarea').attr('rows', data.size.rows);
        }
    }

    save() {
        return {
            type: 'pageOneExcerptBox',
            size:  { cols: this.dom.find('textarea')[0].cols, rows: this.dom.find('textarea')[0].rows },
        };
    }
};

class Matrix1D extends Element {
    constructor(container, data) {
        let dom = $('<div class="element matrix1d"></div>');
        dom.append($('<div class="fa fa-arrows handle"></div>'));
        dom.append($('<div class="pillars sortable"></div>'));
        dom.append($('<button class="fa fa-plus add-pillar"></button>'));
        super(container, dom);
        let that = this;

        this.addPillar();
        dom.find('.add-pillar').click(function() {
            that.addPillar();
        });

        this.dom.find('.pillars').sortable({ axis: 'y' });

        if (data) {
            this.load(data);
        }
    }

    addPillar() {
        let that = this;

        let pillar = $('<div class="pillar"></div>');
        pillar.append($('<div class="title-block">New pillar</div>'));
        pillar.append($('<div class="subpillars sortable"></div>'));
        pillar.append($('<button class="fa fa-plus add-subpillar"></button>'));
        pillar.prepend($('<button class="fa fa-times remove-pillar"></button>'));
        this.dom.find('.pillars').append(pillar);

        this.addSubpillar(pillar);
        pillar.find('.add-subpillar').click(function() {
            that.addSubpillar(pillar);
        });
        pillar.find('.remove-pillar').click(function() {
            pillar.remove();
        });

        this.makeEditable(pillar.find('.title-block'));
        pillar.find('.subpillars').sortable({ axis: 'x' });
        return pillar;
    }

    addSubpillar(pillar) {
        let subpillar = $('<div class="subpillar" tabIndex="1"></div>');
        subpillar.append($('<div class="title-block">New subpillar</div>'));
        subpillar.append($('<button class="fa fa-times remove-subpillar"></button>'))
        pillar.find('.subpillars').append(subpillar);

        subpillar.find('.remove-subpillar').click(function() {
            subpillar.remove();
        });

        this.makeEditable(subpillar.find('.title-block'));
        return subpillar;
    }

    makeEditable(element) {
        element.click(function() {
            $(this).closest('.element').find('div').attr('contenteditable', 'false');
            $(this).attr('contenteditable', 'true');
            $(this).closest('.element').draggable({ disabled: true });
            $(this).parents('.sortable').sortable({ disabled: true });
            $(this).focus();
        });

        element.blur(function(e) {
            $(this).attr('contenteditable', 'false');
            $(this).closest('.element').draggable({ disabled: false });
            $(this).parents('.sortable').sortable({ disabled: false });
        });
    }

    save() {
        let pillars = [];
        this.dom.find('.pillars .pillar').each(function() {
            let pillar = {};

            pillar.name = $(this).find('.title-block').eq(0).text();
            pillar.subpillars = [];
            $(this).find('.subpillars .subpillar').each(function() {
                let subpillar = {};

                subpillar.name = $(this).find('.title-block').eq(0).text();

                pillar.subpillars.push(subpillar);
            });

            pillars.push(pillar);
        });
        return {
            type: 'matrix1d',
            pillars: pillars,
            position: { left: this.dom.position().left, top: this.dom.position().top },
        }
    }

    load(data) {
        let that = this;
        this.dom.find('.pillars .pillar').remove();
        for (let i=0; i<data.pillars.length; i++) {
            let pillar = data.pillars[i];
            let pillarElement = that.addPillar();
            pillarElement.find('.subpillars').empty();
            pillarElement.find('.title-block').text(pillar.name);

            for (let j=0; j<pillar.subpillars.length; j++) {
                let subpillar = pillar.subpillars[j];
                let subpillarElement = that.addSubpillar(pillarElement);
                subpillarElement.find('.title-block').text(subpillar.name);
            }
        }

        if (data.position) {
            this.dom.css('left', data.position.left);
            this.dom.css('top', data.position.top);
        }
    }
};

class NoobWidget extends Element {
    constructor(container, data) {
        let dom = $('<div class="element noob-widget">Noob</div>');
        super(container, dom);

        if (data) {
            this.load(data);
        }
    }

    save() {
        return {
            type: 'noob',
            position: { left: this.dom.position().left, top: this.dom.position().top },
        }
    }

    load(data) {
        if (data.position) {
            this.dom.css('left', data.position.left);
            this.dom.css('top', data.position.top);
        }
    }
};


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
        this.elements.push(element);
    },

    load: function(data) {
        let that = this;
        this.elements = [];

        $('#template-name').text(data.name);
        $('main').empty();

        this.pageOneExcerptBox = new PageOneExcerptBox($('main'));

        for (let i=0; i<data.elements.length; i++) {
            let element = data.elements[i];
            if (element.type == 'noob') {
                that.addElement(new NoobWidget($('main'), element));
            }
            else if (element.type == 'matrix1d') {
                that.addElement(new Matrix1D($('main'), element));
            }
            else if (element.type == 'pageOneExcerptBox') {
                that.pageOneExcerptBox.load(element);
            }
        }
    },

    save: function() {
        let data = {};
        data['name'] = $('#template-name').text();
        data['elements'] = [];
        for (let i=0; i<this.elements.length; i++) {
            data['elements'].push(this.elements[i].save());
        }
        data['elements'].push(this.pageOneExcerptBox.save());
        return data;
    },
};


$(document).ready(function() {
    templateEditor.init();
    templateEditor.load(templateData);
    $('#elements').sortable();
});
