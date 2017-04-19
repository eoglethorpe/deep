let entriesManager = {
    init: function(eventId, filtersContainer) {
        this.eventId = eventId;
        this.renderCallback = null;
        this.filtersContainer = filtersContainer;

        this.entries = [];
        this.filters = {};
        this.filteredEntries = [];

        this.createBasicFilters();
    },

    readAll: function() {
        this.readPartial(0, 5);
    },

    readPartial: function(index, count) {
        let that = this;
        $.getJSON("/api/v2/entries/?event="+this.eventId+'&index='+index+'&count='+count, function(data){
            that.updateData(data);

            if (that.renderCallback) {
                that.renderCallback(false);
            }

            if (data.data.length >= 5) {
                that.readPartial(index+count, count);
            } else {
                if (that.renderCallback) {
                    that.renderCallback(true);
                }
            }
        });
    },

    updateData: function(data) {
        data = data.data;

        let lastId = this.entries.length;
        this.entries = this.entries.concat(data);
        this.entries.sort(function(e1, e2) {
            return new Date(e2.created_at) - new Date(e1.created_at);
        });

        for (let i=0; i<data.length; i++) {
            for (let j=0; j<data[i].informations.length; j++) {
                let info = data[i].informations[j];
                info.entryIndex = i + lastId;

                // Load geolocations
                let geolocationElements = templateData.elements.filter(
                    te => te.type == 'geolocations' && info.elements.find(e => te.id == e.id)
                );
                for (let k=0; k<geolocationElements.length; k++) {
                    let te = geolocationElements[k];
                    let data = info.elements.find(e => e.id == te.id);

                    if (data) {
                        for (let l=0; l<data.value.length; l++) {
                            this.findFilter(te.id)[0].selectize.addOption({
                                value: data.value[l],
                                text: data.value[l].split(':')[2],
                            });
                        }
                    }
                }
            }

            // Add option to user filters
            this.findFilter('user')[0].selectize.addOption({
                value: data[i].created_by,
                text: data[i].created_by_name,
            });
        }

        this.filterEntries();
    },

    findFilter: function(id) {
        return this.filtersContainer.find('[data-id="' + id + '"]');
    },

    filterEntries: function() {
        this.filteredEntries = [];
        for (let i=0; i<this.entries.length; i++) {
            let filteredEntry = $.extend(true, {}, this.entries[i]);

            for (let filterId in this.filters) {
                if (this.filters[filterId]) {
                    filteredEntry.informations = filteredEntry.informations.filter(this.filters[filterId]);
                }
            }

            if (filteredEntry.informations.length > 0) {
                this.filteredEntries.push(filteredEntry);
            }
        }
    },

    createBasicFilters: function() {
        let that = this;

        this.addTextFilter('search-excerpt', 'Search excerpt', function(info) {
            return info.excerpt.toLowerCase().includes(this.value.toLowerCase());
        });

        this.addTextFilter('lead-title', 'Lead title', function(info) {
            return that.entries[info.entryIndex].lead_title.toLowerCase().includes(this.value.toLowerCase());
        });

        this.addTextFilter('lead-source', 'Lead source', function(info) {
            if (that.entries[info.entryIndex].lead_source) {
                return that.entries[info.entryIndex].lead_source.toLowerCase().includes(this.value.toLowerCase());
            }
            return false;
        });

        this.addMultiselectFilter('user', 'User', function(info) {
            return this.value.indexOf(that.entries[info.entryIndex].created_by+'') >= 0;
        });

        this.addDateFilter('date-published', 'Date published', function(info) {
            let date = new Date(that.entries[info.entryIndex].lead_published_at);
            if (this.value == 'range') {
                return dateInRange(date, new Date(this.startDate), new Date(this.endDate));
            } else {
                return filterDate(this.value, date);
            }
        });
    },

    addFilterFor: function(element) {
        if (element.type == 'date-input') {
            this.addDateFilter(element.id, element.label, function(info) {
                let data = info.elements.find(d => d.id == element.id);
                if (data) {
                    if (this.value == 'range') {
                        return dateInRange(new Date(data.value), new Date(this.startDate), new Date(this.endDate));
                    } else {
                        return filterDate(this.value, new Date(data.value));
                    }
                }
                return false;
            });
        }
        else if (element.type == 'multiselect') {
            this.addMultiselectFilter(element.id, element.label, function(info) {
                let value = this.value;
                let data = info.elements.find(d => d.id == element.id);
                if (data) {
                    return data.value.find(v => value.indexOf(v) >= 0);
                }
                return false;
            });

            let filter = this.findFilter(element.id);
            for (let i=0; i<element.options.length; i++) {
                filter[0].selectize.addOption({
                    value: element.options[i].id,
                    text: element.options[i].text,
                });
            }
        }

        else if (element.type == 'organigram') {
            this.addMultiselectFilter(element.id, element.label, function(info) {
                let value = this.value;
                let data = info.elements.find(d => d.id == element.id);
                if (data) {
                    return data.value.find(v => value.indexOf(v) >= 0);
                }
                return false;
            });

            let filter = this.findFilter(element.id);
            for (let i=0; i<element.nodes.length; i++) {
                filter[0].selectize.addOption({
                    value: element.nodes[i].id,
                    text: element.nodes[i].name,
                });
            }
        }

        else if (element.type == 'geolocations') {
            this.addMultiselectFilter(element.id, element.label, function(info) {
                let value = this.value;
                let data = info.elements.find(d => d.id == element.id);
                if (data) {
                    return data.value.find(v => value.indexOf(v) >= 0);
                }
                return false;
            });
        }

        else if (element.type == 'matrix1d') {
            this.addMultiselectFilter(element.id, element.title, function(info) {
                let value = this.value;
                let data = info.elements.find(d => d.id == element.id);
                return (data && data.selections) && (value.find(v => data.selections.find(s => (v.indexOf(':') < 0) ? (s.pillar == v) : (s.pillar == v.split(':')[0] && s.subpillar == v.split(':')[1]))));
            });

            let filter = this.findFilter(element.id);
            for (let i=0; i<element.pillars.length; i++) {
                let pillar = element.pillars[i];

                filter[0].selectize.addOption({
                    value: pillar.id,
                    text: pillar.name,
                });

                for (let j=0; j<pillar.subpillars.length; j++) {
                    let subpillar = pillar.subpillars[j];

                    filter[0].selectize.addOption({
                        value: pillar.id + ':' + subpillar.id,
                        text: pillar.name + ' / ' + subpillar.name,
                    });
                }
            }
        }

        else if (element.type == 'matrix2d') {

            // Pillars subpillars
            this.addMultiselectFilter(element.id, element.title, function(info) {
                let value = this.value;
                let data = info.elements.find(d => d.id == element.id);
                return (data && data.selections) && (value.find(v => data.selections.find(s => (v.indexOf(':') < 0) ? (s.pillar == v) : (s.pillar == v.split(':')[0] && s.subpillar == v.split(':')[1]))));
            });

            let filter = this.findFilter(element.id);
            for (let i=0; i<element.pillars.length; i++) {
                let pillar = element.pillars[i];

                filter[0].selectize.addOption({
                    value: pillar.id,
                    text: pillar.title,
                });

                for (let j=0; j<pillar.subpillars.length; j++) {
                    let subpillar = pillar.subpillars[j];

                    filter[0].selectize.addOption({
                        value: pillar.id + ':' + subpillar.id,
                        text: pillar.title + ' / ' + subpillar.title,
                    });
                }
            }

            // Sectors subsectors
            this.addMultiselectFilter(element.id + '-sectors', 'Sectors and subsectors', function(info) {
                let value = this.value;
                let data = info.elements.find(d => d.id == element.id);
                return (data && data.selections) && (value.find(v => data.selections.find(s => (v.indexOf(':') < 0) ? (s.sector == v) : (s.sector == v.split(':')[0] && s.subsectors.indexOf(v.split(':')[1]) >= 0))));
            });

            filter = this.findFilter(element.id + '-sectors');
            for (let i=0; i<element.sectors.length; i++) {
                let sector = element.sectors[i];

                filter[0].selectize.addOption({
                    value: sector.id,
                    text: sector.title,
                });

                for (let j=0; j<sector.subsectors.length; j++) {
                    let subsector = sector.subsectors[j];

                    filter[0].selectize.addOption({
                        value: sector.id + ':' + subsector.id,
                        text: sector.title + ' / ' + subsector.title,
                    });
                }
            }
        }

        else if (element.type == 'scale') {
            this.addRangeFilter(element.id, element.label, function(info) {
                let data = info.elements.find(d => d.id == element.id);
                let fromId = element.scaleValues.findIndex(v => v.id == this.from);
                let toId = element.scaleValues.findIndex(v => v.id == this.to);
                let myId;
                if (data && data.value) {
                    myId = element.scaleValues.findIndex(v => v.id == data.value);
                } else {
                    myId = element.scaleValues.findIndex(v => v.default);
                }
                return (myId >= fromId && myId <= toId);
            });

            for (let i=0; i<element.scaleValues.length; i++) {
                this.findFilter(element.id)[0].selectize.addOption({
                    value: element.scaleValues[i].id,
                    text: element.scaleValues[i].name,
                });
                this.findFilter(element.id)[1].selectize.addOption({
                    value: element.scaleValues[i].id,
                    text: element.scaleValues[i].name,
                });
            }
        }
    },

    addTextFilter: function(id, label, filterFunction) {
        let that = this;
        let element = $('<input placeholder="' + label + '" data-id="' + id + '">');
        element.appendTo(this.filtersContainer);
        element.on('change paste drop input', function() {
            let val = $(this).val();
            if (!val) {
                that.filters[id] = null;
            } else {
                that.filters[id] = filterFunction.bind({ value: val });
            }

            that.filterEntries();
            if (that.renderCallback) { that.renderCallback(true); }
        });
    },

    addMultiselectFilter: function(id, label, filterFunction) {
        let that = this;
        let element = $('<select data-id="' + id + '" placeholder="' + label + '" multiple><option value="">' + label + '</option></select>');
        element.appendTo(this.filtersContainer);
        element.selectize();
        element.change(function() {
            let val = $(this).val();
            if (!val || val.length == 0) {
                that.filters[id] = null;
            } else {
                that.filters[id] = filterFunction.bind({ value: val });
            }

            that.filterEntries();
            if (that.renderCallback) { that.renderCallback(true); }
        });
    },

    addDateFilter: function(id, label, filterFunction) {
        let that = this;
        let element = $('<select data-id="' + id + '" placeholder="' + label + '"></select>');
        element.append('<option value="">' + label + '</option>');
        element.append('<option value="today">Today</option>');
        element.append('<option value="yesterday">Yesterday</option>');
        element.append('<option value="last-seven-days">Last 7 days</option>');
        element.append('<option value="this-week">This week</option>');
        element.append('<option value="last-thirty-days">Last 30 days</option>');
        element.append('<option value="this-month">This month</option>');
        element.append('<option value="range">Range</option>');

        element.appendTo(this.filtersContainer);
        element.selectize();

        let dateModalBox = $('<div class="modal" hidden></div>');
        dateModalBox.appendTo($('.modal-container'));
        dateModalBox.append('<header><h3 class="modal-title">Enter date range</h3></header>');
        dateModalBox.append('<div class="input-container"><label>Start date</label><input type="date" class="start-date"></div>');
        dateModalBox.append('<div class="input-container"><label>End date</label><input type="date" class="end-date"></div>');
        dateModalBox.append('<div class="action-buttons"><button class="cancel" data-action="dismiss">Cancel</button><button class="ok" data-action="proceed">Ok</button></div>');

        let dateModal = new Modal(dateModalBox);
        let previousSelection = null;

        element.change(function() {
            let val = $(this).val();
            if (!val) {
                that.filters[id] = null;
            } else if (val == 'range') {
                dateModal.show().then(function() {
                    if (dateModal.action == 'proceed') {
                        let startDate = dateModalBox.find('.start-date').val();
                        let endDate = dateModalBox.find('.end-date').val();
                        if (startDate && endDate) {
                            that.filters[id] = filterFunction.bind({ value: 'range', startDate: startDate, endDate: endDate });
                            that.filterEntries();
                            if (that.renderCallback) { that.renderCallback(true); }
                        }
                    } else {
                        element[0].selectize.setValue(previousSelection);
                    }
                });
                return;
            } else {
                that.filters[id] = filterFunction.bind({ value: val });
                previousSelection = val;
            }
            that.filterEntries();
            if (that.renderCallback) { that.renderCallback(true); }
        });
    },

    addRangeFilter: function(id, label, filterFunction) {
        let that = this;
        let elementFrom = $('<select data-id="' + id + '" placeholder="from"><option value="">from</option></select>') ;
        let elementTo = $('<select data-id="' + id + '" placeholder="to"><option value="">to</option></select>');

        let rangeContainer = $('<div class="range"></div>');
        rangeContainer.append('<label>' + label + '</label>');
        rangeContainer.append(elementFrom);
        rangeContainer.append(elementTo);
        this.filtersContainer.append(rangeContainer);

        elementFrom.selectize();
        elementTo.selectize();

        let elements = $().add(elementFrom).add(elementTo);
        elements.change(function() {
            let valFrom = elementFrom.val();
            let valTo = elementTo.val();
            if (!valFrom || !valTo) {
                that.filters[id] = null;
            } else {
                that.filters[id] = filterFunction.bind({ from: valFrom, to: valTo });
            }

            that.filterEntries();
            if (that.renderCallback) { that.renderCallback(true); }
        });
    },
};


let entriesList = {
    init: function(container) {
        this.refresh = this.refresh.bind(this);

        this.container = container;
        this.entryTemplate = this.container.find('.entry-template');
        this.template = this.container.find('.information-template');

        for (let i=0; i<templateData.elements.length; i++) {
            let element = templateData.elements[i];
            if (element.type == 'matrix2d' && element.list) {
                this.addMatrix2dList(element);
            }
            else if (element.type == 'matrix1d' && element.list) {
                this.addMatrix1dList(element);
            }
            else if (element.id == 'page-two-excerpt') {
                this.addExcerpt(element);
            }
            else if (element.type == 'number-input' || element.type == 'date-input') {
                this.addInputElement(element);
            }
            else if (element.type == 'multiselect' || element.type == 'geolocations' || element.type == 'organigram') {
                this.addList(element);
            }
            else if (element.type == 'scale') {
                this.addScale(element);
            }

            entriesManager.addFilterFor(element);
        }
    },

    addExcerpt: function(element) {
        let excerpt = $('<div class="element excerpt-container" style="position: absolute";></div>');
        excerpt.css('width', element.width);
        excerpt.css('left', element.left);
        excerpt.appendTo(this.template);
    },

    addInputElement: function(element) {
        let input = $('<div class="element input-container" data-id="' + element.id + '" style="position: absolute;"></div>');
        input.css('width', element.size.width);
        input.css('height', element.size.height);
        input.css('left', element.position.left);
        input.css('top', element.position.top);
        input.appendTo(this.template);

        input.append($('<label>' + element.label + '</label>'));
        input.append($('<div class="data"></div>'));
    },

    addList: function(element) {
        let list = $('<div class="element list-container" data-id="' + element.id + '" style="position: absolute;"></div>');
        list.css('left', element.left);
        list.appendTo(this.template);

        list.append($('<label>' + element.label + '</label>'));
        list.append($('<div class="data"></div>'));
    },

    addMatrix1dList: function(element) {
        let list = $('<div class="element list-container" data-id="' + element.id + '" style="position: absolute;"></div>');
        list.css('left', element.list.left);
        list.appendTo(this.template);

        list.append($('<label>' + element.title + '</label>'));
        list.append($('<div class="data"></div>'));
    },

    addMatrix2dList: function(element) {
        let list = $('<div class="element list-container" data-id="' + element.id + '" style="position: absolute;"></div>');
        list.css('left', element.list.left);
        list.appendTo(this.template);

        list.append($('<label>' + element.title + '</label>'));
        list.append($('<div class="data"></div>'));
    },

    addScale: function(element) {
        let scale = $('<div class="element scale-container" data-id="' + element.id + '" style="position: absolute;"></div>');
        scale.css('width', element.size.width);
        scale.css('height', element.size.height);
        scale.css('left', element.position.left);
        scale.css('top', element.position.top);
        scale.appendTo(this.template);

        scale.append($('<label>' + element.label + '</label>'));
        scale.append($('<div class="scale"></div>'));
        for (let i=0; i<element.scaleValues.length; i++) {
            let value = element.scaleValues[i];
            let scaleElement = $('<span data-id="' + value.id + '"></span>');
            scaleElement.attr('title', value.name);
            scaleElement.css('background-color', value.color);
            scale.find('.scale').append(scaleElement);
        }
    },

    refresh: function() {
        this.container.find('.entry').remove();

        let entries = entriesManager.filteredEntries;
        for (let i=0; i<entries.length; i++) {
            let entry = entries[i];
            if (entry.informations.length == 0) {
                continue;
            }

            let entryDom = this.entryTemplate.clone();
            entryDom.removeClass('entry-template').addClass('entry');

            entryDom.find('h2').html(
                searchAndHighlight(entry.lead_title, $('#filters input[data-id="lead-title"]').val())
            );
            entryDom.find('.created-on').text(formatDate(entry.created_at));
            entryDom.find('.created-by').text(entry.created_by_name);

            entryDom.find('.edit-btn').attr('href', '/' + eventId + '/entries/edit/' + entry.id);
            entryDom.find('.delete-btn').click(function() {
                if (confirm('Are you sure you want to delete this entry?')) {
                    redirectPost('/' + eventId + '/entries/delete/', { id: entry.id }, csrf_token);
                }
            });

            entryDom.appendTo(this.container);
            entryDom.show();

            for (let j=0; j<entry.informations.length; j++) {
                let information = entry.informations[j];
                let infoDom = this.template.clone();
                infoDom.removeClass('information-template').addClass('information');

                if (information.image && information.image.length > 0) {
                    infoDom.find('.excerpt-container').html(
                        '<img src="' + information.image + '">'
                    );
                } else {
                    infoDom.find('.excerpt-container').html(
                        searchAndHighlight(information.excerpt, $('#filters input[data-id="search-excerpt"]').val())
                    );
                }

                for (let k=0; k<templateData.elements.length; k++) {
                    let templateElement = templateData.elements[k];

                    if (templateElement.type == 'matrix2d' && templateElement.list) {
                        let data = information.elements.find(d => d.id == templateElement.id);
                        if (data) {
                            let dom = infoDom.find('.list-container[data-id="' + data.id + '"]');
                            let text = '';
                            if (data.selections) {
                                for (let l=0; l<data.selections.length; l++) {
                                    let pillar = templateElement.pillars.find(p => p.id == data.selections[l].pillar);
                                    let subpillar = pillar.subpillars.find(s => s.id == data.selections[l].subpillar);
                                    let sector = templateElement.sectors.find(s => s.id == data.selections[l].sector);
                                    text += '<div class="row">'
                                    text += '<div class="col"><div>' + pillar.title + '</div><div>' + subpillar.title + '</div></div>';
                                    text += '<div class="col"><div>' + sector.title + '</div><div>';

                                    if (data.selections[l].subsectors) {
                                        for (let m=0; m<data.selections[l].subsectors.length; m++) {
                                            text += '<span>' + sector.subsectors.find(s => s.id == data.selections[l].subsectors[m]).title + '</span>';
                                        }
                                    }

                                    text += '</div></div>';
                                    text += '</div>';
                                }
                            }
                            dom.find('.data').html(text);
                        }
                        continue;
                    }
                    else if (templateElement.type == 'matrix1d' && templateElement.list) {
                        let data = information.elements.find(d => d.id == templateElement.id);
                        if (data) {
                            let dom = infoDom.find('.list-container[data-id="' + data.id + '"]');
                            let text = '';
                            if (data.selections) {
                                for (let l=0; l<data.selections.length; l++) {
                                    let pillar = templateElement.pillars.find(p => p.id == data.selections[l].pillar);
                                    let subpillar = pillar.subpillars.find(s => s.id == data.selections[l].subpillar);
                                    text += '<div class="row">'
                                    text += '<div class="col"><div>' + pillar.name + '</div><div>' + subpillar.name + '</div></div>';
                                    text += '</div>';
                                }
                            }
                            dom.find('.data').html(text);
                        }
                        continue;
                    }

                    if (templateElement.page != 'page-two') {
                        continue;
                    }

                    let data = information.elements.find(d => d.id == templateElement.id);
                    if (data) {
                        if (templateElement.type == 'number-input') {
                            let dom = infoDom.find('.input-container[data-id="' + data.id + '"]');
                            dom.find('.data').text(data.value);
                        }
                        else if (templateElement.type == 'date-input') {
                            let dom = infoDom.find('.input-container[data-id="' + data.id + '"]');
                            dom.find('.data').text(formatDate(data.value));
                        }
                        else if (templateElement.type == 'multiselect') {
                            let dom = infoDom.find('.list-container[data-id="' + data.id + '"]');
                            let text = '';
                            if (data.value) {
                                for (let l=0; l<data.value.length; l++) {
                                    text += '<div>' + templateElement.options.find(o => o.id == data.value[l]).text + '</div>';
                                }
                            }
                            dom.find('.data').html(text);
                        }
                        else if (templateElement.type == 'geolocations') {
                            let dom = infoDom.find('.list-container[data-id="' + data.id + '"]');
                            let text = '';
                            if (data.value) {
                                for (let l=0; l<data.value.length; l++) {
                                    text += '<div>' + data.value[l].split(':')[2] + '</div>';
                                }
                            }
                            dom.find('.data').html(text);
                        }
                        else if (templateElement.type == 'organigram') {
                            let dom = infoDom.find('.list-container[data-id="' + data.id + '"]');
                            let text = '';
                            if (data.value) {
                                for (let l=0; l<data.value.length; l++) {
                                    text += '<div>' + templateElement.nodes.find(n => n.id == data.value[l]).name + '</div>';
                                }
                            }
                            dom.find('.data').html(text);
                        }
                        else if (templateElement.type == 'scale') {
                            let dom = infoDom.find('.scale-container[data-id="' + data.id + '"]');
                            let selected = templateElement.scaleValues.find(e => e.default == true).id;
                            if (data.value) {
                                selected = data.value;
                            }
                            dom.find('.scale span[data-id="' + selected + '"]').addClass('active');
                        }
                    } else {
                        if (templateElement.type == 'scale') {
                            let selected = templateElement.scaleValues.find(e => e.default == true).id;
                            infoDom.find('.scale-container[data-id="' + templateElement.id + '"]')
                                .find('.scale span[data-id="' + selected + '"]').addClass('active');
                        }
                    }
                }

                infoDom.appendTo(entryDom);
                infoDom.show();

                infoDom.find('img').one('load', function() {
                    autoResize(infoDom);
                });
                autoResize(infoDom);
            }
        }
    },
};


$(document).ready(function() {
    entriesManager.init(eventId, $('#filters'));
    entriesList.init($('#entries'));

    entriesManager.renderCallback = entriesList.refresh;
    entriesManager.readAll();
});



// Checks if the date is in given range
function dateInRange(date, min, max){
    date.setHours(0, 0, 0, 0);
    min.setHours(0, 0, 0, 0);
    max.setHours(0, 0, 0, 0);
    return (date >= min && date <= max);
}

function filterDate(filter, date){
    dateStr = date.toDateString();
    switch(filter){
        case "today":
            return (new Date()).toDateString() == dateStr;
        case "yesterday":
            yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            return yesterday.toDateString() == dateStr;
        case "last-seven-days":
            min = new Date();
            min.setDate(min.getDate() - 7);
            return dateInRange(date, min, (new Date));
        case "this-week":
            min = new Date();
            min.setDate(min.getDate() - min.getDay());
            return dateInRange(date, min, (new Date));
        case "last-thirty-days":
            min = new Date();
            min.setDate(min.getDate() - 30);
            return dateInRange(date, min, (new Date));
        case "this-month":
            min = new Date();
            min.setDate(1);
            return dateInRange(date, min, (new Date));
        default:
            return true;
    }
}
