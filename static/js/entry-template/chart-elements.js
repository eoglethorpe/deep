
class OrganigramInput extends Element {
    constructor(container, data) {
        let dom = $('<div class="element organigram"></div>');
        dom.append($('<div class="fa fa-arrows handle"></div>'));
        dom.append($('<div class="fa fa-edit edit"></div>'));
        dom.append($('<div class="fa fa-trash delete-element"></div>'));
        dom.append($('<div class="container"><div class="header"><label class="title">Organigram</label></header></div>'));
        dom.find('.container').find('.header').append($('<img src="/static/img/organigram.png">'));
        dom.find('.container').append($('<div class="items"><span>Item1</span><span>Item2</span></div>'));
        dom.find('.container').resizable({ grid: GRID_SIZE, handles: 'e, w', });
        super(container, dom);

        this.nodes = [
            { id: 'node-1', name: 'All', parent: null },
            { id: 'node-2', name: 'Affected', parent: 'node-1' },
            { id: 'node-3', name: 'Not affected', parent: 'node-1' },
        ];

        if (data) {
            this.load(data);
        }
        this.addPropertiesTo(this.createPropertiesBox(this.dom.find('.edit')));
    }

    save() {
        return {
            id: this.id,
            type: 'organigram',
            position: this.getPosition(),
            width: this.dom.find('.container').css('width'),
            left: this.dom.position().left,
            label: this.dom.find('label').eq(0).text(),
            nodes: this.nodes,
        };
    }

    load(data) {
        if (data.id) {
            this.id = data.id;
        }
        if (data.left) {
            this.dom.css('left', data.left);
        }
        if (data.width) {
            this.dom.find('.container').css('width', data.width);
        }
        if (data.label) {
            this.dom.find('label').eq(0).text(data.label);
        }
        if (data.nodes) {
            this.nodes = data.nodes;
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
            templateEditor.reloadElements();
        });
        container.append(labelProperty);

        let nodesProperty = $('<div class="property nodes-property"></div>');
        nodesProperty.append($('<div class="header"><label>Nodes</label><button class="add-node"><i class="fa fa-plus"></i></button></div>'));
        nodesProperty.append($('<div class="nodes-container"><div class="nodes"></div></div>'));

        let addNode = function() {
            let node = $('<div class="node-container"><input class="name" type="text"><select><option value="">Select parent node</option></select><button class="remove-node"><i class="fa fa-times"></i></button></div>');

            node.find('.name').data('id', that.getUniqueId());
            node.find('select').change(function() {
                if (!$(this).val() || $(this).val().length === 0) {
                    return;
                }
                that.refreshNodes();
            });
            node.find('.name').change(function() {
                that.refreshNodes();
            });

            node.find('select').selectize();

            node.find('.remove-node').click(function() {
                node.remove();
            });

            nodesProperty.find('.nodes').append(node);
            that.refreshNodes();

            return node;
        };

        nodesProperty.find('.add-node').click(function() {
            addNode();
        });

        for (let i=0; i<this.nodes.length; i++) {
            let node = addNode();
            node.find('.name').val(this.nodes[i].name);
            node.find('.name').data('id', this.nodes[i].id);
            that.addOptions(node);
            node.find('select')[0].selectize.setValue(this.nodes[i].parent);
        }

        this.nodesProperty = nodesProperty;
        this.refreshNodes();
        container.append(nodesProperty);
    }

    addOptions(node) {
        let selectize = node.find('select')[0].selectize;
        let val = selectize.getValue();

        selectize.clearOptions();
        for (let i=0; i<this.nodes.length; i++) {
            if (node.find('.name').data('id') == this.nodes[i].id) {
                continue;
            }
            selectize.addOption({
                value: this.nodes[i].id,
                text: this.nodes[i].name,
            });
        }
        selectize.setValue(val, true);
    }

    refreshNodes() {
        if (this.nodesProperty) {
            this.nodes = [];
            let nodes = this.nodesProperty.find('.nodes .node-container');
            for (let i=0; i<nodes.length; i++) {
                this.nodes.push({
                    id: nodes.eq(i).find('.name').data('id'),
                    name: nodes.eq(i).find('.name').val(),
                    parent: nodes.eq(i).find('select').val(),
                });
            }
            for (let i=0; i<nodes.length; i++) {
                this.addOptions(nodes.eq(i));
            }
        }
    }

    getUniqueId() {
        let i = this.nodes.length;
        while (true) {
            i++;
            let id = 'node-' + i;
            if (!this.nodes.find(o => o.id==id)) {
                return id;
            }
        }
    }

    getTitle() {
        return "Organigram Input";
    }
}


class GeolocationsInput extends Element {
    constructor(container, data) {
        let dom = $('<div class="element geolocations"></div>');
        dom.append($('<div class="fa fa-arrows handle"></div>'));
        dom.append($('<div class="fa fa-edit edit"></div>'));
        dom.append($('<div class="fa fa-trash delete-element"></div>'));
        dom.append($('<div class="container"><div class="header"><label class="title">Geolocations</label></div></div>'));
        dom.find('.container').find('.header').append($('<img src="/static/img/mapicon.png">'));
        dom.find('.container').append($('<div class="locations"><span>Location1</span><span>Location2</span></div>'));
        dom.find('.container').resizable({ grid: GRID_SIZE, handles: 'e, w', });
        super(container, dom);

        if (data) {
            this.load(data);
        }
        this.addPropertiesTo(this.createPropertiesBox(this.dom.find('.edit')));
    }

    save() {
        return {
            id: this.id,
            type: 'geolocations',
            width: this.dom.find('.container').css('width'),
            left: this.dom.position().left,
            label: this.dom.find('label').eq(0).text(),
        };
    }

    load(data) {
        if (data.id) {
            this.id = data.id;
        }
        if (data.left) {
            this.dom.css('left', data.left);
        }
        if (data.width) {
            this.dom.find('.container').css('width', data.width);
        }
        if (data.label) {
            this.dom.find('label').eq(0).text(data.label);
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
            templateEditor.reloadElements();
        });
        container.append(labelProperty);
    }

    getTitle() {
        return "Geolocations Input";
    }
}
