let entriesManager = {
    init: function(eventId, filtersContainer, scrollElement=null) {
        this.eventId = eventId;
        this.renderCallback = null;
        this.filtersContainer = filtersContainer;

        this.entries = [];
        this.filters = {};
        this.filteredEntries = [];

        this.createBasicFilters();

        let that = this;
        if (scrollElement) {
            scrollElement.scroll(function() {
                if(scrollElement.scrollTop() + scrollElement.height() >= scrollElement[0].scrollHeight) {
                    if (that.scrollCallback) {
                        that.scrollCallback();
                    }
                }
            });
        }
        this.listableEntries = 3;
        this.maxEntries = null;
    },

    readAll: function() {
        this.readPartial(0, 3);
    },

    readPartial: function(index, count) {
        let that = this;
        $.getJSON("/api/v2/entries/?event="+this.eventId+'&index='+index+'&count='+count, function(data){
            if (data.status && data.data) {
                that.updateData(data.data);
            }

            if (that.renderCallback) {
                that.renderCallback(false);
            }

            if (data.data.length >= count) {
                that.readPartial(index+count, count);
                that.scrollCallback = function() {
                    that.listableEntries += 3;
                    if (that.renderCallback) {
                        that.renderCallback();
                    }

                    if (that.maxEntries && that.listableEntries >= that.maxEntries) {
                        $('.entries-loading-animation').hide();
                        that.scrollCallback = null;
                    }
                }
            } else {
                if (that.renderCallback) {
                    that.renderCallback(true);
                }
                that.maxEntries = that.entries.length;
            }
        });
    },

    updateData: function(data) {
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
                // let geolocationElements = templateData.elements.filter(
                //     te => te.type == 'geolocations' && info.elements.find(e => te.id == e.id)
                // );
                // for (let k=0; k<geolocationElements.length; k++) {
                //     let te = geolocationElements[k];
                //     if (this.findFilter(te.id)[0]) {
                //         let data = info.elements.find(e => e.id == te.id);

                //         if (data && data.value) {
                //             for (let l=0; l<data.value.length; l++) {
                //                 this.findFilter(te.id)[0].selectize.addOption({
                //                     value: data.value[l],
                //                     text: data.value[l].split(':')[2],
                //                 });
                //             }
                //         }
                //     }
                // }
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

        this.addMultiselectFilter('user', 'Imported by', function(info) {
            return this.value.indexOf(that.entries[info.entryIndex].created_by+'') >= 0;
        });

        this.addDateFilter('date-imported', 'Date imported', function(info) {
            let date = new Date(that.entries[info.entryIndex].created_at);
            if (this.value == 'range') {
                return dateInRange(date, new Date(this.startDate), new Date(this.endDate));
            } else {
                return filterDate(this.value, date);
            }
        });

        this.addTextFilter('lead-title', 'Lead title', function(info) {
            return that.entries[info.entryIndex].lead_title.toLowerCase().includes(this.value.toLowerCase());
        });

        this.addTextFilter('lead-source', 'Source', function(info) {
            if (that.entries[info.entryIndex].lead_source) {
                return that.entries[info.entryIndex].lead_source.toLowerCase().includes(this.value.toLowerCase());
            }
            return false;
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
            this.addGeoFilter(element.id, element.label, function(info) {
                let value = this.value;
                let data = info.elements.find(d => d.id == element.id);
                if (data && data.value) {
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
        let element = $('<div class="filter"><input placeholder="' + label + '" data-id="' + id + '"></div>');
        element.appendTo(this.filtersContainer);
        element.find('input').on('change paste drop input', function() {
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
        let element = $('<div class="filter"><select data-id="' + id + '" placeholder="' + label + '" multiple><option value="">' + label + '</option></select></div>');
        element.appendTo(this.filtersContainer);
        element.find('select').selectize();
        element.find('select').change(function() {
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

    addGeoFilter: function(id, label, filterFunction) {
        let that = this;
        let element = $('<div class="filter geo-filter"><select data-id="' + id + '" placeholder="' + label + '" multiple><option value="">' + label + '</option></select><a><img src="/static/img/mapicon.png" width="20px"></a></div>');
        element.appendTo(this.filtersContainer);
        element.find('select').selectize();
        element.find('select').change(function() {
            let val = $(this).val();
            if (!val || val.length == 0) {
                that.filters[id] = null;
            } else {
                that.filters[id] = filterFunction.bind({ value: val });
            }

            that.filterEntries();
            if (that.renderCallback) { that.renderCallback(true); }
        });

        let modalDialog = $('<div class="modal" hidden></div>');
        modalDialog.append($('<header><h3 class="modal-title">Select ' + (label.toLowerCase()) + '</h2></header>'));
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
        let locationSelectize2 = element.find('select')[0].selectize;

        map.loadCallback = function() {
            for (let key in map.allLocations) {
                locationSelectize.addOption({
                    value: key, text: map.allLocations[key],
                });
                locationSelectize2.addOption({
                    value: key, text: map.allLocations[key],
                });
            }
            locationSelectize.setValue(map.selections, true);
            locationSelectize2.setValue(map.selections, true);
        };
        controlSection1.find('.locations').change(function() {
            map.selections = $(this).val();
            map.refresh();
        });
        map.selectCallback = function() {
            locationSelectize.setValue(map.selections, true);
        };
        
        modalDialog.find('.control-section').append(controlSection1);

        if (countries.length > 0) {
            countrySelectize.setValue(countries[0].code);
        }

        /////////

        let newModal = new Modal(modalDialog, true);

        element.find('a').click(function() {
            let selected = locationSelectize2.getValue();

            map.reset();
            if (countries.length > 0) {
                countrySelectize.setValue(countries[0].code);
            }

            map.selections = selected;
            locationSelectize.setValue(selected, true);
            locationSelectize2.setValue(selected, true);

            // Show modal
            newModal.show().then(function() {}, null, function() {
                if (newModal.action == 'apply') {
                    // Save selections from modal
                    locationSelectize2.setValue(locationSelectize.getValue());
                    newModal.hide();
                } else {
                    map.map.invalidateSize();
                    map.refresh();
                }
            });
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

        let container = $('<div class="filter"></div>');
        element.appendTo(container);
        element.selectize();
        container.appendTo(this.filtersContainer);

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

        let rangeContainer = $('<div class="filter range"></div>');
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

            if (valFrom || valTo) {
                rangeContainer.addClass('filled');
            } else {
                rangeContainer.removeClass('filled');
            }

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
