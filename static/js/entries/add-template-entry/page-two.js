
let page2 = {
    init: function() {
        this.container = $('#page-two');
        this.template = this.container.find('.entry-template');

        for (let i=0; i<templateData.elements.length; i++) {
            let element = templateData.elements[i];

            // Special case matrix 2d list
            if (element.type == 'matrix2d' && element.list) {
                this.addMatrix2dList(element);
                continue;
            }

            if (element.page != 'page-two') {
                continue;
            }

            if (element.id == 'page-two-excerpt') {
                this.addExcerptBox(element);
            }

            else if (element.type == 'number-input') {
                this.addInputElement(element, 'number-input', 'input', $('<input type="number", placeholder="Enter number">'));
            }
            else if (element.type == 'date-input') {
                this.addInputElement(element, 'date-input', 'input', $('<input type="date", placeholder="Enter number">'));
            }
            else if (element.type == 'multiselect') {
                this.addMultiselect(element);
            }
            else if (element.type == 'scale') {
                this.addScale(element);
            }
            else if (element.type == 'geolocations') {
                this.addGeolocations(element);
            }
        }

        this.refresh();
    },

    loadOrganigrams: function() {
        for (let i=0; i<templateData.elements.length; i++) {
            let element = templateData.elements[i];
            if (element.page != 'page-two') {
                continue;
            }
            if (element.type == 'organigram') {
                this.addOrganigram(element);
            }
        }

        this.refresh();
    },

    addExcerptBox: function(element) {
        let that = this;
        let excerptBox = $('<div class="excerpt-box-container" style="position: absolute;"><textarea style="width: 100%; height: 100%; padding: 16px;" placeholder="Enter excerpt here"></textarea></div>');
        excerptBox.css('width', element.size.width);
        excerptBox.css('height', element.size.height);
        excerptBox.css('left', element.position.left);
        excerptBox.css('top', element.position.top);
        excerptBox.appendTo(this.template);

        this.container.on('change input paste drop', '.excerpt-box-container textarea', function() {
            let index = parseInt($(this).closest('.entry').data('index'));
            if (index != NaN) {
                entries[index].excerpt = $(this).val();
            }
        });
    },

    addInputElement: function(element, className, childSelector, dom) {
        let that = this;
        let inputElement = $('<div data-id="' + element.id + '" class="input-element ' + className + '" style="position: absolute;"></div>');
        inputElement.css('width', element.size.width);
        inputElement.css('height', element.size.height);
        inputElement.css('left', element.position.left);
        inputElement.css('top', element.position.top);

        inputElement.append($('<label>' + element.label + '</label>'));
        inputElement.append(dom);
        inputElement.appendTo(this.template);

        this.container.on('change input paste drop', '.input-element[data-id="' + element.id + '"] ' + childSelector, function() {
            let index = parseInt($(this).closest('.entry').data('index'));
            if (index != NaN) {
                let data = getEntryData(index, element.id);
                data.value = $(this).val();
            }
        });
    },

    addMultiselect: function(element) {
        let that = this;
        let selectContainer = $('<div data-id="' + element.id + '" class="multiselect" style="position: absolute;"></div>');
        selectContainer.css('width', element.size.width);
        selectContainer.css('height', element.size.height);
        selectContainer.css('left', element.position.left);
        selectContainer.css('top', element.position.top);

        selectContainer.append($('<label>' + element.label + '</label>'));
        selectContainer.append($('<select multiple><option values="">Type for options</option></select>'));

        for (let i=0; i<element.options.length; i++) {
            let option = element.options[i];
            selectContainer.find('select').append(
                $('<option value="' + option.id + '">' + option.text + '</option>')
            );
        }
        selectContainer.appendTo(this.template);

        this.container.on('change', '.multiselect[data-id="' + element.id + '"] select', function() {
            let index = parseInt($(this).closest('.entry').data('index'));
            if (index != NaN) {
                let data = getEntryData(index, element.id);
                data.value = $(this).val();
            }
        });
    },

    addScale: function(element) {
        let that = this;
        let scaleContainer = $('<div class="scale-container" data-id="' + element.id + '"></div>');
        scaleContainer.css('width', element.size.width);
        scaleContainer.css('height', element.size.height);
        scaleContainer.css('left', element.position.left);
        scaleContainer.css('top', element.position.top);

        scaleContainer.append($('<label>' + element.label + '</label>'));
        scaleContainer.append($('<div class="scale"></div>'));
        for (let i=0; i<element.scaleValues.length; i++) {
            let value = element.scaleValues[i];
            let scaleElement = $('<span data-id="' + value.id + '"></span>');
            scaleElement.css('background-color', value.color);
            scaleElement.attr('title', value.name);
            scaleContainer.find('.scale').append(scaleElement);
        }

        this.container.on('click', '.scale-container[data-id="' + element.id + '"] .scale span', function() {
            let index = parseInt($(this).closest('.entry').data('index'));
            if (index != NaN) {
                let data = getEntryData(index, element.id);
                data.value = $(this).data('id');

                $(this).closest('.scale').find('span').removeClass('active');
                $(this).addClass('active');


                // TODO remove and use scss
                let scales = $('.scale-container .scale span');
                scales.css('width', '10px');
                scales.css('height', '20px');
                let selectedScales = $('.scale-container .scale span.active');
                selectedScales.css('width', '12px');
                selectedScales.css('height', '24px');
            }
        });

        scaleContainer.appendTo(this.template);
    },

    addOrganigram: function(element) {
        let that = this;
        let organigramInput = $('<div class="organigram" style="position: absolute;"></div>');
        organigramInput.css('width', element.size.width);
        organigramInput.css('height', element.size.height);
        organigramInput.css('left', element.position.left);
        organigramInput.css('top', element.position.top);

        organigramInput.append('<label>' + element.label + '</label>');
        organigramInput.append('<a><img src="/static/img/organigram.png" width="24px"></a>');
        organigramInput.appendTo(this.template);

        let modalDialog = $('<div class="modal" hidden></div>');
        modalDialog.append($('<header><h3 class="modal-title">Select ' + (element.label.toLowerCase()) + '</h2></header>'));
        modalDialog.append($('<div class="chart-div"></div>'));

        let actionButtons = $('<div class="action-buttons"></div>');
        actionButtons.append($('<button class="apply" data-action="apply" data-persist="true">Apply</button>'));
        actionButtons.append($('<button class="cancel" data-action="dismiss">Cancel</button>'));
        modalDialog.append(actionButtons);
        modalDialog.appendTo($('.modal-container'));

        // Google chart

        let data = new google.visualization.DataTable();
        data.addColumn('string', 'Name');
        data.addColumn('string', 'Manager');
        data.addColumn('string', 'Tooltip');

        // Fill data
        let nodes = [];
        for (let i=0; i<element.nodes.length; i++) {
            let node = element.nodes[i];
            let parent = null;
            if (node.parent) {
                parent = element.nodes.find(n => n.id == node.parent).name;
            }
            nodes.push([ node.name, parent, '' ]);
        }
        data.addRows(nodes);

        // Create chart
        let chart = new google.visualization.OrgChart(modalDialog.find('.chart-div')[0]);
        chart.draw(data, {
            nodeClass: 'org-node',
            selectedNodeClass: 'active-org-node',
        });

        let selectedNodes = [];
        let mouseOverNode = -1;

        // Listener
        google.visualization.events.addListener(chart, 'select', function() {
            let selection = chart.getSelection();

            if (selection.length === 0) {
                if (mouseOverNode != -1) {
                    selectedNodes = selectedNodes.filter(node => node.row != mouseOverNode);
                }
                chart.setSelection(selectedNodes);
            }
            else {
                selectedNodes.push(selection[0]);
                chart.setSelection(selectedNodes);
            }
        });

        google.visualization.events.addListener(chart, 'onmouseover', function(row){
            mouseOverNode = row.row;
        });
        google.visualization.events.addListener(chart, 'onmouseout', function(row){
            mouseOverNode = -1;
        });

        /////

        let newModal = new Modal(modalDialog);
        this.container.on('click', '.organigram a', function() {
            // Get selected entry
            let index = parseInt($(this).closest('.entry').data('index'));
            if (index != NaN) {
                let data = getEntryData(index, element.id);

                // Select nodes in chart
                if (data.value) {
                    selectedNodes.length = 0;
                    for (let i=0; i<data.value.length; i++) {
                        selectedNodes.push({
                            column: null,
                            row: element.nodes.findIndex(n => n.id == data.value[i])
                        });
                    }
                }
                chart.setSelection(selectedNodes);

                // Show modal
                newModal.show().then(function() {}, null, function() {
                    if (newModal.action == 'apply') {
                        data.value = [];
                        for (let i=0; i<selectedNodes.length; i++) {
                            data.value.push(element.nodes[selectedNodes[i].row].id);
                        }
                        newModal.hide();
                    }
                });
            }
        });
    },

    addGeolocations: function(element) {
        let that = this;
        let geolocationsInput = $('<div class="geolocations" style="position: absolute;"></div>');
        geolocationsInput.css('width', element.size.width);
        geolocationsInput.css('height', element.size.height);
        geolocationsInput.css('left', element.position.left);
        geolocationsInput.css('top', element.position.top);

        geolocationsInput.append('<label>' + element.label + '</label>');
        geolocationsInput.append('<a><img src="/static/img/mapicon.png" width="24px"></a>');
        geolocationsInput.appendTo(this.template);

        let modalDialog = $('<div class="modal" hidden></div>');
        modalDialog.append($('<header><h3 class="modal-title">Select ' + (element.label.toLowerCase()) + '</h2></header>'));
        modalDialog.append($('<div class="map-section"></div>'));
        modalDialog.append($('<div class="control-section"></div>'));

        let actionButtons = $('<div class="action-buttons"></div>');
        actionButtons.append($('<button class="apply" data-action="apply" data-persist="true">Apply</button>'));
        actionButtons.append($('<button class="cancel" data-action="dismiss">Cancel</button>'));
        modalDialog.append(actionButtons);
        modalDialog.appendTo($('.modal-container'));

        //// Map

        modalDialog.find('.map-section').append($('<div class="map" style="width: 100%; height: 250px;"></div>'));
        modalDialog.find('.map-section').append($('<div class="buttons-container"></div>'));
        let map = new Map(modalDialog.find('.map'), modalDialog.find('.buttons-container'));

        // Control sections
        let controlSection1 = $('<div></div>');
        controlSection1.append($('<label>Select a country</label><select class="country"><option value="">Select a country</option></select>'));
        controlSection1.append($('<label>Add locations</label><select class="locations" multiple><option value="">Add locations</option></select>'))
        controlSection1.find('select').selectize();

        // Country selection
        let countrySelectize = controlSection1.find('.country')[0].selectize;
        for (let i=0; i<countries.length; i++) {
            countrySelectize.addOption({
                value: countries[i].code, text: countries[i].name,
            });
        }
        controlSection1.find('.country').change(function() {
            if ($(this).val()) {
                map.selectCountry($(this).val());
            }
        });

        // Location selection
        let locationSelectize = controlSection1.find('.locations')[0].selectize;
        map.loadCallback = function() {
            for (let key in map.allLocations) {
                locationSelectize.addOption({
                    value: key, text: map.allLocations[key],
                });
            }
            locationSelectize.setValue(map.selections, true);
        };
        controlSection1.find('.locations').change(function() {
            map.selections = $(this).val();
            map.refresh();
        });
        map.selectCallback = function() {
            locationSelectize.setValue(map.selections, true);
        }

        // let controlSection2 = $('<div></div>');
        // controlSection2.append($('<div class="selection-list"></div>'));
        // controlSection2.append($('<a class="clear">Clear all</a>'));

        modalDialog.find('.control-section').append(controlSection1);
        // modalDialog.find('.control-section').append(controlSection2);

        /////////

        let newModal = new Modal(modalDialog, true);
        this.container.on('click', '.geolocations a', function() {
            // Get selected entry
            let index = parseInt($(this).closest('.entry').data('index'));
            if (index != NaN) {
                let data = getEntryData(index, element.id);
                map.reset();
                if (countries.length > 0) {
                    countrySelectize.setValue(countries[0].code);
                }
                if (data.value) {
                    // Load selections
                    map.selections = data.value;
                    locationSelectize.setValue(data.value, true);
                }

                // Show modal
                newModal.show().then(function() {}, null, function() {
                    if (newModal.action == 'apply') {
                        // Save selections from modal
                        data.value = map.selections;
                        newModal.hide();
                    } else {
                        map.map.invalidateSize();
                        map.refresh();
                    }
                });
            }
        });
    },

    addMatrix2dList: function(parentElement) {
        let element = parentElement.list;

        let that = this;
        let listContainer = $('<div style="position: absolute;" class="matrix2d-list-container" data-id="' + parentElement.id + '"></div>');
        // listContainer.css('width', element.size.width);
        // listContainer.css('height', element.size.height);
        listContainer.css('left', element.position.left);
        listContainer.css('top', element.position.top);

        listContainer.append($('<label>' + parentElement.title + '</label>'));
        listContainer.append($('<div class="matrix2d-list"></div>'));

        listContainer.appendTo(this.template);
    },

    addSubsector: function(container, element, data) {
        let subsector = $('<div class="subsector" data-id="' + element.id + '"><span>' + element.title + '</span></div>');
        subsector.append($('<a class="fa fa-times"></a>'));

        subsector.find('a').click(function() {
            subsector.remove();
            if (data.indexOf(element.id) >= 0) {
                data.splice(data.indexOf(element.id), 1);
            }
        });

        container.append(subsector);
        return subsector;
    },

    refresh: function() {
        let that = this;

        this.container.find('.entries').empty();
        for (let i=0; i<entries.length; i++) {
            let entry = entries[i];
            let entryContainer = this.template.clone();

            entryContainer.removeClass('entry-template').addClass('entry');
            entryContainer.data('index', i);
            entryContainer.css('position', 'relative');

            entryContainer.appendTo(this.container.find('.entries'));
            entryContainer.show();

            entryContainer.find('select').selectize();

            entryContainer.find('.excerpt-box-container textarea').val(entry.excerpt);

            for (let i=0; i<templateData.elements.length; i++) {
                let templateElement = templateData.elements[i];

                if (templateElement.type == 'matrix2d' && templateElement.list) {
                    let data = entry.elements.find(d => d.id == templateElement.id);
                    if (data) {
                        let listContainer = entryContainer.find('.matrix2d-list-container[data-id="' + data.id + '"]');
                        let list = listContainer.find('.matrix2d-list');

                        list.empty();
                        for (let j=0; j<data.selections.length; j++) {
                            let selection = data.selections[j];
                            let pillar = templateElement.pillars.find(p => p.id == selection.pillar);
                            let subpillar = pillar.subpillars.find(s => s.id == selection.subpillar);
                            let sector = templateElement.sectors.find(s => s.id == selection.sector);

                            let col1 = $('<div class="col1"><div class="pillar">' + pillar.title + '</div><div class="subpillar">' + subpillar.title + '</div></div>');
                            let col2 = $('<div class="col1"><div class="sector">' + sector.title + '</div><div class="subsectors"></div><a class="fa fa-plus"></a></div>');

                            let subsectors = col2.find('.subsectors');
                            if (!selection.subsectors) {
                                selection.subsectors = [];
                            }

                            for (let k=0; k<selection.subsectors.length; k++) {
                                that.addSubsector(subsectors, sector.subsectors.find(s => s.id == selection.subsectors[k]), selection.subsectors);
                            }

                            let dropdown = $('<div class="subsectors-dropdown" tabIndex="0"></div>');
                            dropdown.blur(function() {
                                $(this).hide();
                            });
                            dropdown.hide();
                            dropdown.insertAfter(col2.find('a'));

                            col2.find('a').click(function() {
                                dropdown.empty();
                                dropdown.show();
                                dropdown.focus();
                                for (let k=0; k<sector.subsectors.length; k++) {
                                    let subsector = sector.subsectors[k];
                                    if (!selection.subsectors.find(s => s == subsector.id)) {
                                        let item = $('<a class="item">' + subsector.title + '</a>');
                                        item.click(function() {
                                            selection.subsectors.push(subsector.id);
                                            that.addSubsector(subsectors, subsector, selection.subsectors);
                                            dropdown.blur();
                                        });
                                        dropdown.append(item);
                                    }
                                }
                            });

                            let row = $('<div class="row"></div>');
                            row.append(col1);
                            row.append(col2);
                            list.append(row);
                        }
                    }
                    continue;
                }

                if (templateElement.page != 'page-two') {
                    continue;
                }

                let data = entry.elements.find(d => d.id == templateElement.id);

                if (templateElement.type == 'number-input' || templateElement.type == 'date-input') {
                    if (data) {
                        entryContainer.find('.input-element[data-id="' + data.id + '"] input').val(data.value);
                    }
                }
                else if (templateElement.type == 'multiselect') {
                    if (data) {
                        entryContainer.find('.multiselect[data-id="' + data.id + '"] select')[0].selectize.setValue(data.value);
                    }
                }
                else if (templateElement.type == 'scale') {
                    entryContainer.find('.scale-container[data-id="' + templateElement.id + '"] .scale span.active').removeClass('active');
                    let selected = templateElement.scaleValues.find(e => e.default==true).id;
                    if (data && data.value) {
                        selected = data.value;
                    }
                    entryContainer.find('.scale-container[data-id="' + templateElement.id + '"] .scale span[data-id="' + selected + '"]').addClass('active');
                }
            }
        }

        // TODO remove and use scss
        let scales = $('.scale-container .scale span');
        scales.css('width', '10px');
        scales.css('height', '20px');
        let selectedScales = $('.scale-container .scale span.active');
        selectedScales.css('width', '12px');
        selectedScales.css('height', '24px');
    },
};
