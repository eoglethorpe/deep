let template = {
    name: 'Untitled',
    elements: [],
};


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
};

class Matrix1D extends Element {
    constructor(container) {
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
};

class NoobWidget extends Element {
    constructor(container) {
        let dom = $('<div class="element noob-widget">Noob</div>');
        super(container, dom);
    }
};


let templateEditor = {
    init: function() {
        let that = this;
        $('#noob-widget button').on('click', function() {
            that.addElement(new NoobWidget($('main')));
        });

        $('#matrix1d-widget button').on('click', function() {
            that.addElement(new Matrix1D($('main')));
        });
    },

    addElement: function(element) {
        template.elements.push(element);
    },
};


$(document).ready(function() {
    templateEditor.init();
    $('#elements').sortable();
});
