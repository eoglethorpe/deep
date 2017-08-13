$(document).ready(function() {
    dateRangeInputModal = new Modal('#date-range-input');
    attributesFilters.init(templateData.elements, $('#entry-attributes-filters .filters-container'));

    leads.init($('#entries-export .leads-container'), $('#entries-export .lead-filters'));
    reportStructure.init();

    $('#date-published-filter').change(function() {
        setDateRange($(this).val(), 'date-published');
    });
    $('#date-imported-filter').change(function() {
        setDateRange($(this).val(), 'date-imported');
    });

    $('#date-published-filter').selectize();
    $('#date-imported-filter').selectize();
    $('#users-filter').selectize();


    $('#entries-export-form').submit(function(e) {
        e.preventDefault();
    });

    $('#export-docx').click(function() {
        getExportUrl(false).then((url) => {
            window.open(exportProgressUrl + '?url=' + encodeURIComponent(url + '&export-docx=docx'), '_blank');
        });
    });

    $('#export-pdf').click(function() {
        getExportUrl(false).then((url) => {
            window.open(exportProgressUrl + '?url=' + encodeURIComponent(url+'&export-pdf=pdf'), '_blank');
        });
    });

    $('#export-xlsx').click(function() {
        getExportUrl(false).then((url) => {
            window.open(exportProgressUrl + '?url=' + encodeURIComponent(url+'&export-xls=xls'), '_blank');
        });
    });

    $('#preview-docx').click(function() {
        $('#preview-section').find('iframe').hide();
        $('#preview-section').find('>div').show();
        $('#preview-section').find('>div').html('<span class="fa fa-spin fa-spinner"></span>Exporting file for preview');

        getExportUrl().then((url) => {
            $.getJSON(downloadUrl + '?url=' + encodeURIComponent(url+'&export-docx=docx'), function(data) {
                if(data.s3){
                    let tempUrl = data.url;
                }else{
                let tempUrl = window.location.origin + downloadUrl + "?path=" +
                    encodeURIComponent(data.path) + "&filename=" +
                    encodeURIComponent(data.filename) + "&content_type=" +
                    encodeURIComponent(data.content_type);
                }

                $('#preview-section').find('iframe').attr('src', 'https://docs.google.com/viewer?url=' + encodeURIComponent(tempUrl) + '&embedded=true&chrome=false&dov=1');
                $('#preview-section').find('>div').hide();
                $('#preview-section').find('iframe').show();
            });
        });
    });

});


function getExportUrl(async=true) {
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'POST',
            url: window.location.origin + $('#entries-export-form').attr('action') + '?timestamp=' + (new Date().getTime()),
            data: $('#entries-export-form').serialize(),
            success: function(response) {
                resolve(window.location.origin + $('#entries-export-form').attr('action') + '?token=' + response.token +
                        '&export-format=analysis-generic&timestamp=?' + (new Date().getTime()));
            },
            async: async,
        });
    });
}


let dateRangeInputModal;

let leads = {
    init: function(container) {
        let that = this;
        this.leads = [];
        this.filters = {};
        this.container = container;

        // By default all leads are selected
        this.container.find('header .select input').attr('checked', true);

        $.getJSON('/api/v2/leads/?event=' + eventId + '&has_entries=1', function(data) {
            if (data.status && data.data) {
                that.updateData(data.data);
            }
        });

        // Setup filters
        this.container.find('header .select input').change(function() {
            that.container.find('.leads .lead .select input').prop('checked', $(this).is(':checked'));
        });
        this.container.on('change', 'input[type="checkbox"]', function() {
            that.refreshSelectedLeads();
        });
        this.initFilters();
    },

    initFilters: function() {
        let that = this;
        $('#lead-title-search').on('input paste drop change', function() {
            let key = 'lead-title';
            let val = $(this).val();
            if (!val) {
                that.filters[key] = null;
            } else {
                that.filters[key] = function(lead) {
                    return lead.name.toLowerCase().includes(val.toLowerCase());
                };
            }

            that.refresh();
        });

        $('#sources-filter').on('input paste drop change', function() {
            let key = 'lead-title';
            let val = $(this).val();
            if (!val) {
                that.filters[key] = null;
            } else {
                that.filters[key] = function(lead) {
                    return lead.source && lead.source.toLowerCase().includes(val.toLowerCase());
                };
            }

            that.refresh();
        });

        $('#date-published-start').change(function() {
            let key = 'date-published';
            let startDate = $('#date-published-start').val();
            let endDate = $('#date-published-end').val();
            if (!startDate || !endDate) {
                that.filters[key] = null;
            } else {
                that.filters[key] = function(lead) {
                    return lead.published_at && dateInRange(new Date(lead.published_at), new Date(startDate), new Date(endDate).addDays(-1));
                };
            }

            that.refresh();
        });
    },

    updateData: function(data) {
        this.leads = this.leads.concat(data);
        this.leads.sort(function (l1, l2) {
            return new Date(l2.created_at) - new Date(l1.created_at);
        });

        for (let i=0; i<this.leads.length; i++) {
            if (this.container.find('header .select input').is(':checked')) {
                this.leads[i].checked = true;
            }
        }

        this.refresh();
    },

    refresh: function() {
        let that = this;
        let filteredLeads = this.leads.slice();

        for (let filterKey in this.filters) {
            let filter = this.filters[filterKey];
            if (filter) {
                filteredLeads = filteredLeads.filter(filter);
            }
        }

        let list = this.container.find('.leads');
        let template = list.find('.lead-template');

        list.find('.lead').remove();
        for (let i=0; i<filteredLeads.length; i++) {
            let lead = filteredLeads[i];
            let leadDom = template.clone();
            leadDom.removeClass('lead-template').addClass('lead');
            leadDom.appendTo(list);
            leadDom.show();

            leadDom.find('.created-at').html('<date>' + formatDate(lead.created_at) + "</date><time>" + formatTime(lead.created_at) + '</time>');
            leadDom.find('.title').html(lead.name);
            leadDom.find('.select input').prop('checked', lead.checked);
            leadDom.data('id', lead.id);
        }

        this.refreshSelectedLeads();
    },

    refreshSelectedLeads: function() {
        let selectedLeads = [];

        let that = this;
        $('.leads .lead').each(function() {
            let id = $(this).data('id');
            let select = $(this).find('.select input').is(':checked');

            if (select) {
                if (selectedLeads.indexOf(id) < 0) {
                    selectedLeads.push(id);
                }
            } else {
                let index = selectedLeads.indexOf(id);
                if (index >= 0) {
                    selectedLeads.splice(index, 1);
                }
            }
        });
        $('#selected-leads').val(JSON.stringify(selectedLeads));
        $('#selected-leads-count').text(selectedLeads.length + ' of ' + this.leads.length + ' selected');
    },
};

let attributesFilters = {
    init: function(elements, filtersContainer) {
        this.filtersContainer = filtersContainer;
        for (let i=0; i<elements.length; i++) {
            this.addFilterFor(elements[i]);
        }
    },

    addFilterFor: function(element) {
        if (element.type == 'date-input') {
            this.addDateFilter(element.id, element.label);
        }
        else if (element.type == 'multiselect') {
            let filter = this.addMultiSelectFilter(element.id, element.label).find('select');

            for (let i=0; i<element.options.length; i++) {
                filter[0].selectize.addOption({
                    value: element.options[i].id,
                    text: element.options[i].text,
                });
            }
        }
        else if (element.type == 'organigram') {
            let filter = this.addMultiSelectFilter(element.id, element.label).find('select');

            for (let i=0; i<element.nodes.length; i++) {
                filter[0].selectize.addOption({
                    value: element.nodes[i].id,
                    text: element.nodes[i].name,
                });
            }
        }
        // else if (element.type == 'geolocations') {
        //     this.addTextFilter(element.id, element.label);
        // }
        else if (element.type == 'matrix1d') {
            let filter = this.addMultiSelectFilter(element.id, element.title).find('select');

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
            let filter = this.addMultiSelectFilter(element.id, element.title).find('select');
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
            
            filter = this.addMultiSelectFilter(element.id + '_sectors',
                    'Sectors and subsectors').find('select');
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
            let filter = this.addRangeFilter(element.id, element.label).find('select');

            for (let i=0; i<element.scaleValues.length; i++) {
                filter[0].selectize.addOption({
                    value: element.scaleValues[i].id,
                    text: element.scaleValues[i].name,
                });
                filter[1].selectize.addOption({
                    value: element.scaleValues[i].id,
                    text: element.scaleValues[i].name,
                });
            }
        }
    },

    addTextFilter: function(id, label) {
        let filter = $('<div class="filter"></div>');
        filter.append('<input placeholder="' + label + '" name="' + id + '">');

        this.filtersContainer.append(filter);
        return filter;
    },

    addDateFilter: function(id, label) {
        let filter = $('.date-filter-template').clone()
            .removeClass('date-filter-template').addClass('filter');
        filter.show();

        filter.find('select').attr('id', id + '-filter');
        filter.find('select option').first().text(label);
        filter.find('select').selectize();

        filter.find('.date-start').attr('id', id + '-start');
        filter.find('.date-end').attr('id', id + '-end');
        filter.find('.date-start').attr('name', id + '_start');
        filter.find('.date-end').attr('name', id + '_end');
        
        filter.find('select').change(function() {
            setDateRange($(this).val(), id);
        });

        this.filtersContainer.append(filter);
        return filter;
    },

    addMultiSelectFilter: function(id, label) {
        let filter = $('<div class="filter"><select multiple name="' + id + '"></select></div>');
        filter.find('select').append($('<option value="">' + label + '</option>'));
        filter.find('select').selectize();

        this.filtersContainer.append(filter);
        return filter;
    },

    addRangeFilter: function(id, label) {
        let filter = $('<div class="filter range-filter"></div>');

        filter.append('<label>' + label + '</label>');
        filter.append('<select class="min-filter" name="' + id  + '_min"><option value="">From</option></select>');
        filter.append('<select class="max-filter" name="' + id + '_max"><option value="">To</option></select>');
        filter.find('select').selectize();

        filter.find('select').change(function() {
            let parent = $(this).closest('.range-filter');
            parent.removeClass('filled');
            parent.find('select').each(function() {
                if ($(this).val()) {
                    parent.addClass('filled');
                }
            });
        });

        this.filtersContainer.append(filter);
        return filter;
    },
};


// Checks if the date is in given range
function dateInRange(date, min, max){
    date.setHours(0, 0, 0, 0);
    min.setHours(0, 0, 0, 0);
    max.setHours(0, 0, 0, 0);
    return (date >= min && date <= max);
}

function setDateRange(filter, id){
    let startDate = $('#' + id + '-start');
    let endDate = $('#' + id + '-end');

    let previousValue = $('#' + id + '-filter').data('previous-value');
    if (filter != 'range') {
        $('#' + id + '-filter').data('previous-value', $('#' + id + '-filter').val());
    }

    switch(filter){
        case "today":
            startDate.val(formatDateReverse(new Date()));
            endDate.val(formatDateReverse(new Date().addDays(1)));
            break;

        case "yesterday":
            yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            startDate.val(formatDateReverse(yesterday));
            endDate.val(formatDateReverse(yesterday.addDays(1)));
            break;

        case "last-seven-days":
            min = new Date();
            min.setDate(min.getDate() - 7);
            startDate.val(formatDateReverse(min));
            endDate.val(formatDateReverse(new Date().addDays(1)));
            break;

        case "this-week":
            min = new Date();
            min.setDate(min.getDate() - min.getDay());
            startDate.val(formatDateReverse(min));
            endDate.val(formatDateReverse(new Date().addDays(1)));
            break;

        case "last-thirty-days":
            min = new Date();
            min.setDate(min.getDate() - 30);
            startDate.val(formatDateReverse(min));
            endDate.val(formatDateReverse(new Date().addDays(1)));
            break;

        case "this-month":
            min = new Date();
            min.setDate(1);
            startDate.val(formatDateReverse(min));
            endDate.val(formatDateReverse(new Date().addDays(1)));
            break;

        case "range":
            dateRangeInputModal.show().then(function() {
                if (dateRangeInputModal.action == 'proceed') {
                    startDate.val(formatDateReverse(new Date($('#date-range-input #start-date').val())));
                    endDate.val(formatDateReverse(new Date($('#date-range-input #end-date').val()).addDays(1)));
                    startDate.change();
                } else {
                    $('#' + id + '-filter')[0].selectize.setValue(previousValue?previousValue:null, true);
                }
            });
            break;

        default:
            startDate.val(null);
            endDate.val(null);
    }

    startDate.change();
}


let reportStructure = {
    init: function() {
        let matrix1ds = templateData.elements.filter(d => d.type=='matrix1d');
        let matrix2ds = templateData.elements.filter(d => d.type=='matrix2d');

        for (let i=0; i<matrix1ds.length; i++) {
            let matrix = matrix1ds[i];

            for (let j=0; j<matrix.pillars.length; j++) {
                let pillar = matrix.pillars[j];
                let id = 'pillar:' + matrix.id + ':' + pillar.id;
                let checkGroup = this.addGroup(id, pillar.name);
                checkGroup.attr('data-id', id);
                checkGroup.appendTo('.check-group-list');

                for (let k=0; k<pillar.subpillars.length; k++) {
                    let subpillar = pillar.subpillars[k];
                    let id = 'subpillar:' + matrix.id + ':' + subpillar.id;
                    let child = this.addChild(id, subpillar.name);
                    child.attr('data-id', id);
                    checkGroup.find('.content').append(child);
                }

                checkGroup.find('.group-order').attr('name', 'order:' + id);
                checkGroup.find('.content').sortable({
                    create: function() {
                        checkGroup.find('.group-order')
                            .val($(this).sortable('toArray', { attribute: 'data-id' }));
                    },

                    update: function() {
                        checkGroup.find('.group-order')
                            .val($(this).sortable('toArray', { attribute: 'data-id' }));
                    },
                });
            }
        }

        for (let i=0; i<matrix2ds.length; i++) {
            let matrix = matrix2ds[i];

            for (let j=0; j<matrix.pillars.length; j++) {
                let pillar = matrix.pillars[j];
                let id = 'pillar:' + matrix.id + ':' + pillar.id;
                let checkGroup = this.addGroup(id, pillar.title);
                checkGroup.attr('data-id', id);
                checkGroup.appendTo('.check-group-list');

                for (let k=0; k<pillar.subpillars.length; k++) {
                    let subpillar = pillar.subpillars[k];
                    let id = 'subpillar:' + matrix.id + ':' + subpillar.id;
                    let child = this.addChild(id, subpillar.title);
                    child.attr('data-id', id);
                    checkGroup.find('.content').append(child);
                }

                checkGroup.find('.group-order').attr('name', 'order:' + id);
                checkGroup.find('.content').sortable({
                    create: function() {
                        checkGroup.find('.group-order')
                            .val($(this).sortable('toArray', { attribute: 'data-id' }));
                    },

                    update: function() {
                        checkGroup.find('.group-order')
                            .val($(this).sortable('toArray', { attribute: 'data-id' }));
                    },
                });
            }

            let id = 'sectors:' + matrix.id;
            let sectorsGroup = this.addGroup(id, matrix.title + ' sectors');
            sectorsGroup.attr('data-id', id);
            sectorsGroup.appendTo('.check-group-list');

            for (let j=0; j<matrix.sectors.length; j++) {
                let sector = matrix.sectors[j];
                let id = 'sector:' + matrix.id + ':' + sector.id;

                let child = this.addChild(id, sector.title);
                child.attr('data-id', id);
                sectorsGroup.find('.content').append(child);
            }


            sectorsGroup.find('.group-order').attr('name', 'order:' + id);
            sectorsGroup.find('.content').sortable({
                create: function() {
                    sectorsGroup.find('.group-order')
                        .val($(this).sortable('toArray', { attribute: 'data-id' }));
                },

                update: function() {
                    sectorsGroup.find('.group-order')
                        .val($(this).sortable('toArray', { attribute: 'data-id' }));
                },
            });
        }

        $('.check-group-list').sortable({
            create: function() {
                $('#list-order').val($(this).sortable('toArray', { attribute: 'data-id' }));
            },

            update: function() {
                $('#list-order').val($(this).sortable('toArray', { attribute: 'data-id' }));
            },
        });
    },

    addGroup: function(id, name) {
        let checkGroup = $('.check-group-template').clone()
            .removeClass('check-group-template').addClass('check-group');

        checkGroup.find('header input').click(function() {
            $(this).closest('.expandable')
                .children('.content').find('input')
                .prop('checked', $(this).is(':checked'));
        });

        checkGroup.find('.check-group-expand').click(function() {
            $(this).closest('.check-group').toggleClass('expanded')
                .children('.content').slideToggle(200);
        });

        checkGroup.find('header .name').text(name);
        checkGroup.find('header input').attr('name', id);
        checkGroup.find('header input').prop('checked', true);
        checkGroup.show();
        return checkGroup;
    },

    addChild: function(id, name) {
        let child = $('.check-template').clone()
            .removeClass('check-template').addClass('check');
        child.find('.name').text(name);
        child.find('input').attr('name', id);
        child.find('input').prop('checked', true);
        return child;
    },
};
