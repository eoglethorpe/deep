let template = {
    name: 'Untitled',
    elements: [],
};


class Element {
    constructor(container, dom) {
        this.dom = dom;
        container.append(dom);
        dom.draggable({ grid: [16, 16], containment: container, });
    }
};

class Matrix1D extends Element {
};

class NoobWidget extends Element {
    constructor(container) {
        let dom = $('<div class="widget noob-widget">Noob</div>');
        super(container, dom);
    }
};


let templateEditor = {
    init: function() {
        let that = this;
        $('#noob-widget button').on('click', function() {
            that.addElement(new NoobWidget($('main')));
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
