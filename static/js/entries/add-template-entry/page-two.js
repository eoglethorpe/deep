
const page2 = {
    init: function() {
        this.container = $('#page-two');
        this.template = this.container.find('.entry-template');

        for (let i=0; i<templateData.elements.length; i++) {
            let element = templateData.elements[i];

            // Special case matrix list
            if (element.type == 'matrix1d' && element.list) {
                this.addMatrix1dList(element);
                continue;
            }
            else if (element.type == 'matrix2d' && element.list) {
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
                this.addInputElement(element, 'number-input', 'input', $('<input type="text" class="number" placeholder="Enter number">'));
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
        this.addActionButtons();

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

    addActionButtons: function() {
        let that = this;
        let actionButtons = $('<div class="action-buttons"></div>');
        actionButtons.appendTo(this.template);

        actionButtons.append('<a class="edit-entry-button fa fa-edit"></a>');
        actionButtons.append('<a class="delete-entry-button fa fa-times"></a>');

        this.container.on('click', '.edit-entry-button', function() {
            let index = parseInt($(this).closest('.entry').data('index'));
            if (!isNaN(index)) {
                page1.selectedEntryIndex = index;
                $('.switch-page').get(0).click();
            }
        });
        this.container.on('click', '.delete-entry-button', function() {
            let index = parseInt($(this).closest('.entry').data('index'));
            if (!isNaN(index)) {
                page1.selectedEntryIndex = index;
                removeEntry(index);
                that.refresh();
            }
        });
    },

    addApplyButtons: function(container) {
        let that = this;
        let applyAll = $('<a class="fa fa-circle apply-button apply-all" title="Apply to all"></a>');
        let applyBelow = $('<a class="fa fa-circle apply-button apply-below" title="Apply to all below"></a>');

        applyAll.appendTo(container.find('header'));
        applyBelow.appendTo(container.find('header'));

        applyAll.click(function() {
            let index = parseInt($(this).closest('.entry').data('index'));
            let data = getEntryData(index, container.data('id'));
            if (data && !isNaN(index)) {
                for (let i=0; i<entries.length; i++) {
                    if (i != index) {
                        entries[i].elements = entries[i].elements.filter(e => e.id != container.data('id'));
                        entries[i].elements.push($.extend(true, {}, data));
                    }
                }
            }
            that.refresh();
        });


        applyBelow.click(function() {
            let index = parseInt($(this).closest('.entry').data('index'));
            let data = getEntryData(index, container.data('id'));
            if (data && !isNaN(index)) {
                for (let i=index+1; i<entries.length; i++) {
                    entries[i].elements = entries[i].elements.filter(e => e.id != container.data('id'));
                    entries[i].elements.push($.extend(true, {}, data));
                }
            }
            that.refresh();
        });
    },

    addExcerptBox: function(element) {
        let that = this;
        let excerptBox = $('<div class="excerpt-box-container"><label>Excerpt</label><textarea placeholder="Enter excerpt here"></textarea></div>');
        excerptBox.css('width', element.width);
        excerptBox.css('left', element.left);
        excerptBox.appendTo(this.template);

        if (element.excerptLabel) {
            excerptBox.find('label').text(element.excerptLabel);
        }

        let imageBox = $('<div class="image-box-container"><label>Image</label><div class="image-box"><img></div></div>');
        imageBox.css('width', element.width);
        imageBox.css('left', element.left);
        imageBox.appendTo(this.template);

        if (element.imageLabel) {
            imageBox.find('label').text(element.imageLabel);
        }

        this.container.on('change input paste drop', '.excerpt-box-container textarea', function() {
            let index = parseInt($(this).closest('.entry').data('index'));
            if (!isNaN(index)) {
                entries[index].excerpt = $(this).val();
            }
        });
    },

    addInputElement: function(element, className, childSelector, dom) {
        let that = this;
        let inputElement = $('<div data-id="' + element.id + '" class="input-element ' + className + ' appliable" style="position: absolute;"></div>');
        inputElement.css('width', element.size.width);
        inputElement.css('height', element.size.height);
        inputElement.css('left', element.position.left);
        inputElement.css('top', element.position.top);

        inputElement.append($('<header><label>' + element.label + '</label></header>'));
        inputElement.append(dom);

        if (className == 'date-input') {
            const picker = $('<input class="date-picker-template" type="text" data-alt="[data-id=\'' + element.id + '\'] input[type=\'date\']">');
            inputElement.append(picker);
        }

        inputElement.appendTo(this.template);

        this.container.on('change input paste drop', '.input-element[data-id="' + element.id + '"] ' + childSelector, function() {
            if (element.type == 'number-input') {
                formatNumber($(this));
            }

            let index = parseInt($(this).closest('.entry').data('index'));
            if (!isNaN(index)) {
                let data = getEntryData(index, element.id);

                if (element.type == 'number-input') {
                    data.value = getNumberValue($(this));
                }
                else {
                    data.value = $(this).val();
                }
            }
        });
    },

    addMultiselect: function(element) {
        let that = this;
        let selectContainer = $('<div data-id="' + element.id + '" class="multiselect appliable" style="position: absolute;"></div>');
        selectContainer.css('width', element.width);
        selectContainer.css('left', element.left);

        selectContainer.append($('<header><label>' + element.label + '</label></header>'));
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
            if (!isNaN(index)) {
                let data = getEntryData(index, element.id);
                data.value = $(this).val();
            }
        });
    },

    addScale: function(element) {
        let that = this;
        let scaleContainer = $('<div class="scale-container appliable" data-id="' + element.id + '"></div>');
        scaleContainer.css('width', element.size.width);
        scaleContainer.css('height', element.size.height);
        scaleContainer.css('left', element.position.left);
        scaleContainer.css('top', element.position.top);

        scaleContainer.append($('<header><label>' + element.label + '</label></header>'));
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
            if (!isNaN(index)) {
                let data = getEntryData(index, element.id);
                data.value = $(this).data('id');

                $(this).closest('.scale').find('span').removeClass('active');
                $(this).addClass('active');
            }
        });

        scaleContainer.appendTo(this.template);
    },

    addOrganigram: function(element) {
        let that = this;
        let organigramInput = $('<div class="organigram appliable" data-id="' + element.id + '" style="position: absolute;"></div>');
        organigramInput.css('width', element.width);
        organigramInput.css('left', element.left);

        organigramInput.append('<header><label>' + element.label + '</label><a><img src="/static/img/organigram.png" width="24px"></a></header>');
        organigramInput.append('<div></div>');
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
            let thisContainer = $(this).closest('.organigram');
            // Get selected entry
            let index = parseInt($(this).closest('.entry').data('index'));
            if (!isNaN(index)) {
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
                    that.refreshOrganigram(thisContainer);
                });
            }
        });
    },

    refreshOrganigram: function(dom) {
        let index = parseInt(dom.closest('.entry').data('index'));
        let element = templateData.elements.find(e => e.id == dom.data('id'));
        if (!isNaN(index)) {
            let data = getEntryData(index, element.id);
            if (data.value) {
                dom.find('> div').empty();
                for (let i=0; i<data.value.length; i++) {
                    dom.find('> div').append('<div class="item">' +  element.nodes.find(n => n.id == data.value[i]).name + '</div>');
                }
            }
        }
    },

    addGeolocations: function(element) {
        let that = this;
        let geolocationsInput = $('<div class="geolocations appliable" data-id="' + element.id + '" style="position: absolute;"></div>');
        geolocationsInput.css('width', element.width);
        geolocationsInput.css('left', element.left);

        geolocationsInput.append('<header><label>' + element.label + '</label><a><img src="/static/img/mapicon.png" width="24px"></a></header>');
        geolocationsInput.append('<div></div>');
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

        modalDialog.find('.map-section').append($('<div class="map"></div>'));
        modalDialog.find('.map-section').append($('<div class="buttons-container"></div>'));
        let map = new Map(modalDialog.find('.map'), modalDialog.find('.buttons-container'));

        // Control sections
        let controlSection1 = $('<div></div>');
        controlSection1.append($('<label>Select a country</label><select class="country"><option value="">Select a country</option></select>'));
        controlSection1.append($('<label>Add locations</label><select class="locations" multiple><option value="">Add locations</option></select>'));
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
        };

        // let controlSection2 = $('<div></div>');
        // controlSection2.append($('<div class="selection-list"></div>'));
        // controlSection2.append($('<a class="clear">Clear all</a>'));

        modalDialog.find('.control-section').append(controlSection1);
        // modalDialog.find('.control-section').append(controlSection2);

        /////////

        let newModal = new Modal(modalDialog, true);
        this.container.on('click', '.geolocations a', function() {
            let thisContainer = $(this).closest('.geolocations');

            // Get selected entry
            let index = parseInt($(this).closest('.entry').data('index'));
            if (!isNaN(index)) {
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
                    that.refreshGeolocations(thisContainer);
                });
            }
        });
    },

    refreshGeolocations: function(dom) {
        let index = parseInt(dom.closest('.entry').data('index'));
        let element = templateData.elements.find(e => e.id == dom.data('id'));
        if (!isNaN(index)) {
            let data = getEntryData(index, element.id);
            if (data.value) {
                dom.find('> div').empty();
                for (let i=0; i<data.value.length; i++) {
                    dom.find('> div').append('<div class="item">' +  data.value[i].split(':')[2] + '</div>');
                }
            }
        }
    },

    addMatrix1dList: function(parentElement) {
        let element = parentElement.list;

        let that = this;
        let listContainer = $('<div style="position: absolute;" class="matrix1d-list-container appliable" data-id="' + parentElement.id + '"></div>');
        listContainer.css('left', element.left);

        listContainer.append($('<header><label>' + parentElement.title + '</label></header>'));
        listContainer.append($('<div class="matrix1d-list"></div>'));

        listContainer.appendTo(this.template);
    },

    addMatrix2dList: function(parentElement) {
        let element = parentElement.list;

        let that = this;
        let listContainer = $('<div style="position: absolute;" class="matrix2d-list-container appliable" data-id="' + parentElement.id + '"></div>');
        listContainer.css('left', element.left);

        listContainer.append($('<header><label>' + parentElement.title + '</label></header>'));
        listContainer.append($('<div class="matrix2d-list"></div>'));

        listContainer.appendTo(this.template);
    },

    addSubsector: function(container, element, data) {
        let subsector = $('<div class="subsector" data-id="' + element.id + '"><span>' + element.title + '</span></div>');
        subsector.prepend($('<a class="fa fa-times"></a>'));

        subsector.find('a').click(function() {
            subsector.remove();
            if (data.indexOf(element.id) >= 0) {
                data.splice(data.indexOf(element.id), 1);
            }
            autoResize(container.closest('.entry'));
        });

        container.append(subsector);
        return subsector;
    },

    refresh: function() {
        let that = this;
        let lastScroll = this.container.scrollTop();

        this.container.find('.entries').empty();
        for (let i=0; i<entries.length; i++) {
            let entry = entries[i];
            let entryElement = this.template.clone();
            let entryContainer = $('<div class="entry-container"></div>');

            entryElement.removeClass('entry-template').addClass('entry');
            entryElement.data('index', i);
            entryElement.css('position', 'relative');

            entryElement.appendTo(entryContainer);
            entryContainer.appendTo(this.container.find('.entries'));
            entryElement.find('.action-buttons').detach().prependTo(entryContainer);
            entryElement.show();

            entryContainer.find('.action-buttons .delete-entry-button').click(() => {
                removeEntry(i);
            });
            entryContainer.find('.action-buttons .edit-entry-button').click(() => {
                page1.selectedEntryIndex = i;
                page1.refresh();
                switchPage();
            });

            entryElement.find('select').selectize();

            if (entry.image && entry.image.length > 0) {
                entryElement.find('.excerpt-box-container').hide();
                entryElement.find('.image-box-container').show();
                entryElement.find('.image-box-container img').attr('src', entry.image);
            } else {
                entryElement.find('.excerpt-box-container').show();
                entryElement.find('.image-box-container').hide();
                entryElement.find('.excerpt-box-container textarea').val(entry.excerpt);

                entryElement.find('.excerpt-box-container').find('textarea')
                    .on('input paste drop change', function() {
                        let dom = $(this)[0];
                        dom.style.height = '1px';
                        dom.style.height = (2 + dom.scrollHeight) + 'px';
                        autoResize($(this).closest('.entry'));
                    });
            }

            for (let i=0; i<templateData.elements.length; i++) {
                let templateElement = templateData.elements[i];

                if (templateElement.type == 'matrix2d' && templateElement.list) {
                    let data = entry.elements.find(d => d.id == templateElement.id);
                    if (data && data.selections) {
                        let listContainer = entryElement.find('.matrix2d-list-container[data-id="' + data.id + '"]');
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

                                let dropdownEmpty = true;

                                for (let k=0; k<sector.subsectors.length; k++) {
                                    let subsector = sector.subsectors[k];
                                    if (!selection.subsectors.find(s => s == subsector.id)) {
                                        let item = $('<a class="item">' + subsector.title + '</a>');
                                        dropdownEmpty = false;
                                        item.click(function() {
                                            selection.subsectors.push(subsector.id);
                                            that.addSubsector(subsectors, subsector, selection.subsectors);
                                            autoResize(entryElement);
                                            dropdown.blur();
                                        });
                                        dropdown.append(item);
                                    }
                                }

                                if(dropdownEmpty) {
                                    dropdown.append('<p class="empty-msg">No items</p>');
                                }
                            });

                            for (let k=0; k<selection.subsectors.length; k++) {
                                that.addSubsector(subsectors, sector.subsectors.find(s => s.id == selection.subsectors[k]), selection.subsectors);
                            }

                            let row = $('<div class="row"></div>');
                            row.append(col1);
                            row.append(col2);
                            list.append(row);
                        }
                    }
                    continue;
                }
                else if (templateElement.type == 'matrix1d' && templateElement.list) {
                    let data = entry.elements.find(d => d.id == templateElement.id);
                    if (data && data.selections) {
                        let listContainer = entryElement.find('.matrix1d-list-container[data-id="' + data.id + '"]');
                        let list = listContainer.find('.matrix1d-list');

                        list.empty();
                        for (let j=0; j<data.selections.length; j++) {
                            let selection = data.selections[j];
                            let pillar = templateElement.pillars.find(p => p.id == selection.pillar);
                            let subpillar = pillar.subpillars.find(s => s.id == selection.subpillar);

                            let col1 = $('<div class="col1"><div class="pillar">' + pillar.name + '</div><div class="subpillar">' + subpillar.name + '</div></div>');
                            let row = $('<div class="row"></div>');
                            row.append(col1);
                            list.append(row);
                        }
                    }
                    continue;
                }

                if (templateElement.page != 'page-two') {
                    continue;
                }

                let data = entry.elements.find(d => d.id == templateElement.id);

                if (templateElement.type == 'number-input') {
                    if (data) {
                        entryElement.find('.input-element[data-id="' + data.id + '"] input').val(data.value);
                        formatNumber(entryElement.find('.input-element[data-id="' + data.id + '"] input'));
                    }
                }
                else if (templateElement.type == 'date-input') {
                    if (data) {
                        entryContainer.find('.input-element[data-id="' + data.id + '"] input[type="date"]').val(data.value);
                    }
                }
                else if (templateElement.type == 'multiselect') {
                    if (data) {
                        entryElement.find('.multiselect[data-id="' + data.id + '"] select')[0].selectize.setValue(data.value);
                    }
                }
                else if (templateElement.type == 'scale') {
                    entryElement.find('.scale-container[data-id="' + templateElement.id + '"] .scale span.active').removeClass('active');
                    let selected = templateElement.scaleValues.find(e => e.default === true).id;
                    if (data && data.value) {
                        selected = data.value;
                    }
                    entryElement.find('.scale-container[data-id="' + templateElement.id + '"] .scale span[data-id="' + selected + '"]').addClass('active');
                }
                else if (templateElement.type == 'organigram') {
                    entryElement.find('.organigram[data-id="' + templateElement.id + '"]').each(function() { that.refreshOrganigram($(this)); });
                }
                else if (templateElement.type == 'geolocations') {
                    entryElement.find('.geolocations[data-id="' + templateElement.id + '"]').each(function() { that.refreshGeolocations($(this)); });
                }
            }

            entryElement.find('.appliable').each(function() { that.addApplyButtons($(this)); });

            entryElement.find('img').one('load', function() {
                autoResize(entryElement);
            });

            entryElement.find('.date-picker-template').removeClass('date-picker-template')
                .addClass('date-picker');

            autoResize(entryElement);
        }

        this.container.find('textarea').change();
        this.container.scrollTop(lastScroll);

        this.container.find('.entry-container').width(this.container.find('.entry').width());

        addTodayButtons();
    },
};
