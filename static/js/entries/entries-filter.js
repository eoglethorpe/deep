
var originalEntries = [];
var entries = [];
var entriesTimeline = [];       // Entries to display on timeline: includes even those filtered out by timeline filter

var filters = {

};
var timelineFilter = null;

var selectizes = [];
var pillarsFilterSelectize; // Required in report-weekly tab filtering
var sectorsFilterSelectize; // Required in entries visualization filtering
var areasSelectize;   // Required in entries visualization filtering

var previousPublishedDateFilterSelection;
var previousImportedDateFilterSelection;

// Required in entries visualization filtering:
var activeSectors = [];
var activeSeverities  = [];

// Active searches to use for highlighting and stuffs
var searchFilterText = "";
var leadTitleFilterText = "";

function clearFilters() {
    filters = {};
    $('input').val('');
    for (var i=0; i<selectizes.length; ++i) {
        selectizes[i][0].selectize.setValue(null);
    }
    filterEntries();

    // Entries visualization filters
    activeSectors = [];
    activeSeverities = [];
    if (refreshSectors) refreshSectors();
    if (refreshSeveritiesLegend) refreshSeveritiesLegend();
}


function filterEntries() {
    if (originalEntries.length == 0)
        return;
        
    entries = [];
    entriesTimeline = [];
    for (var i=0; i<originalEntries.length; ++i) {
        var entry = $.extend(true, {}, originalEntries[i]);
        var entryTimeline = $.extend(true, {}, originalEntries[i]);

        for (var filter in filters) {
            if (filters[filter]) {
                entry.informations = entry.informations.filter(filters[filter]);
                entryTimeline.informations = entryTimeline.informations.filter(filters[filter]);
            }
        }

        if (timelineFilter) {
            entry.informations = entry.informations.filter(timelineFilter);
        }

        if (entry.informations.length > 0) {
            entries.push(entry);
        }
        if (entryTimeline.informations.length > 0) {
            entriesTimeline.push(entryTimeline);
        }
    }
    renderEntries();
}


function addFilter(filterFor, clear, filterFunction) {
    if (clear)
        filters[filterFor] = null;
    else
        filters[filterFor] = filterFunction;

    filterEntries();
}

function initEntryFilters() {
    selectizes = [];
    selectizes.push($('#users-filter').selectize({plugins: ['remove_button']}));
    var publishedDateSelectize = $('#date-published-filter').selectize({plugins: ['remove_button']});
    selectizes.push(publishedDateSelectize);
    var importedDateSelectize = null;
    if ($('#date-imported-filter').length > 0) {
        importedDateSelectize = $('#date-imported-filter').selectize({plugins: ['remove_button']});
        selectizes.push(importedDateSelectize);
    }
    areasSelectize = $('#areas-filter').selectize({plugins: ['remove_button']});
    selectizes.push(areasSelectize);
    selectizes.push($('#affected-groups-filter').selectize({plugins: ['remove_button']}));
    selectizes.push($('#vulnerable-groups-filter').selectize({plugins: ['remove_button']}));
    selectizes.push($('#specific-needs-groups-filter').selectize({plugins: ['remove_button']}));
    pillarsFilterSelectize = $('#pillars-filter').selectize({plugins: ['remove_button']});
    selectizes.push(pillarsFilterSelectize);
    sectorsFilterSelectize = $('#sectors-filter').selectize({plugins: ['remove_button']});
    selectizes.push(sectorsFilterSelectize);
    selectizes.push($('#reliabilities-min-filter').selectize({plugins: ['remove_button']}));
    selectizes.push($('#reliabilities-max-filter').selectize({plugins: ['remove_button']}));
    selectizes.push($('#severities-min-filter').selectize({plugins: ['remove_button']}));
    selectizes.push($('#severities-max-filter').selectize({plugins: ['remove_button']}));

    $.getJSON("/api/v2/entries/?event="+eventId, function(data){
        data = data.data;
        data.sort(function(e1, e2) {
            return new Date(e2.modified_at) - new Date(e1.modified_at);
        });
        originalEntries = data;
        entries = data;
        entriesTimeline = data;

        // Get areas options
        for (var i=0; i<entries.length; ++i) {
            for (var j=0; j<entries[i].informations.length; ++j) {
                var info = entries[i].informations[j];
                info.entryIndex = i;
                for (var k=0; k<info.map_selections.length; ++k) {
                    var ms = info.map_selections[k];
                    areasSelectize[0].selectize.addOption({value:ms.name, text:ms.name});
                }
            }
        }

        renderEntries();
    });

    // Filters

    $('#lead-title-search').on('input paste change drop', function(){
        var filterBy = $(this).val();
        leadTitleFilterText = filterBy;
        addFilter('lead-title', filterBy == "", function(info){
            return originalEntries[info.entryIndex].lead_title.toLowerCase().includes(filterBy.toLowerCase());
        });
    });
    $('#sources-filter').on('input paste change drop', function() {
        var filterBy = $(this).val();
        addFilter('source', filterBy == "", function(info){
            if (originalEntries[info.entryIndex].lead_source)
                return originalEntries[info.entryIndex].lead_source.toLowerCase().includes(filterBy.toLowerCase());
            return false;
        });
    });
    $('#date-published-filter').change(function() {
        var filterBy = $(this).val();
        if (filterBy == 'range') {
            dateRangeInputModal.show().then(function(){
                if(dateRangeInputModal.action == 'proceed'){
                    var startDate = new Date($('#date-range-input #start-date').val());
                    var endDate = new Date($('#date-range-input #end-date').val());
                    addFilter('published-at', !startDate || !endDate, function(info) {
                        var date = new Date(originalEntries[info.entryIndex].lead_published_at);
                        return dateInRange(date, startDate, endDate);
                    });
                } else{
                    publishedDateSelectize[0].selectize.setValue(previousPublishedDateFilterSelection);
                }
            });
            
        } else {
            addFilter('published-at', filterBy == "" || filterBy == null, function(info) {
                if (originalEntries[info.entryIndex].lead_published_at)
                    return filterDate(filterBy, new Date(originalEntries[info.entryIndex].lead_published_at));
                return false;
            });
            previousPublishedDateFilterSelection = filterBy;
        }
    });
    if (importedDateSelectize) {
        $('#date-imported-filter').change(function() {
            var filterBy = $(this).val();
            if (filterBy == 'range') {
                $('#date-range-input').modal();
                $('#date-range-input #ok-btn').unbind().click(function(){
                    var startDate = new Date($('#date-range-input #start-date').val());
                    var endDate = new Date($('#date-range-input #end-date').val());
                    addFilter('imported-at', !startDate || !endDate, function(info) {
                        var date = new Date(originalEntries[info.entryIndex].modified_at);
                        return dateInRange(date, startDate, endDate);
                    });
                });
                $('#date-range-input #cancel-btn').unbind().click(function(){
                    importedDateSelectize[0].selectize.setValue(previousImportedDateFilterSelection);
                });
            } else {
                addFilter('imported-at', filterBy == "" || filterBy == null, function(info) {
                    if (originalEntries[info.entryIndex].modified_at) {
                        return filterDate(filterBy, new Date(originalEntries[info.entryIndex].modified_at));
                    }
                    return false;
                });
                previousImportedDateFilterSelection = filterBy;
            }
        });
    }

    $('#users-filter').change(function() {
        var filterBy = $(this).val();
        addFilter('users', filterBy == null, function(info){
            return filterBy.indexOf(originalEntries[info.entryIndex].modified_by+'') >= 0;
        });
    });
    $('#areas-filter').change(function() {
        var filterBy = $(this).val();
        addFilter('areas', filterBy == null, function(info){
            return info.map_selections.filter(function(ms){ return filterBy.indexOf(ms.name) >= 0; }).length > 0;
        });
    });
    $('#affected-groups-filter').change(function() {
        var filterBy = $(this).val();
        addFilter('affected-groups', filterBy == null, function(info){
            return info.affected_groups.filter(function(a){ return filterBy.indexOf(a) >= 0; }).length > 0;
        });
    });
    $('#vulnerable-groups-filter').change(function() {
        var filterBy = $(this).val();
        addFilter('vulnerable-groups', filterBy == null, function(info){
            return info.demographic_groups.filter(function(v){ return filterBy.indexOf(v) >= 0; }).length > 0;
        });
    });
    $('#specific-needs-groups-filter').change(function() {
        var filterBy = $(this).val();
        addFilter('specific-needs-groups', filterBy == null, function(info){
            return info.specific_needs_groups.filter(function(s){ return filterBy.indexOf(s) >= 0; }).length > 0;
        });
    });

    $('#search').on('input paste change drop', function() {
        var filterBy = $(this).val();
        searchFilterText = filterBy;
        addFilter('excerpt', filterBy == "", function(info){
            return info.excerpt.toLowerCase().includes(filterBy.toLowerCase());
        });
    });


    $('#pillars-filter').change(function() {
        var filterBy = $(this).val();

        if (filterBy == null)
            addFilter('pillar', true, null);
        else {
            // Separate the pillar and subpillar ids to filter by
            var pillarFilters = filterBy.map(function(a) {
                var strings = a.split("/");
                return parseInt(strings[0]);
            });

            var subpillarFilters = filterBy.map(function(a) {
                var strings = a.split("/");
                if (strings.length == 2) {
                    a = strings[0];
                    return parseInt(strings[1]);
                }
                else
                    return null;
            });

            // Filter accordingly
            addFilter("pillar", filterBy == null, function(info) {
                return info.attributes.filter(function(a) {

                    if (a.subpillar == null)
                        return false;

                    var index = pillarFilters.indexOf(a.pillar);
                    if (index < 0)
                        return false;

                    if (subpillarFilters[index] == null || subpillarFilters[index] == a.subpillar)
                        return true;

                    return false;

                }).length > 0;
            });
        }
    });

    $('#sectors-filter').change(function() {
        var filterBy = $(this).val();

        // For entries visualization
        if (refreshSectors) {
            if (filterBy == null)
                activeSectors = [];
            else {
                activeSectors = filterBy.filter(function(s) {
                    return s.indexOf('/') < 0;
                });
            }
            refreshSectors();
        }

        if (filterBy == null)
            addFilter('sector', true, null);
        else {

            // Separate the sector and subsector ids to filter by
            var sectorFilters = filterBy.map(function(a) {
                var strings = a.split("/");
                return parseInt(strings[0]);
            });

            var subsectorFilters = filterBy.map(function(a) {
                var strings = a.split("/");
                if (strings.length == 2) {
                    a = strings[0];
                    return parseInt(strings[1]);
                }
                else
                    return null;
            });

            // Filter accordingly
            addFilter("sector", filterBy == null, function(info) {
                return info.attributes.filter(function(a) {

                    if (a.sector == null)
                        return false;

                    var index = sectorFilters.indexOf(a.sector);
                    if (index < 0)
                        return false;

                    if (a.subsectors.length == 0) {
                        if (subsectorFilters[index] == null)
                            return true;
                    }

                    if (subsectorFilters[index] == null || a.subsectors.indexOf(subsectorFilters[index]) >= 0)
                        return true;

                    return false;

                }).length > 0;
            });
        }
    });


    $('.reliabilities-filter').change(function() {
        var minFilterBy = $('#reliabilities-min-filter').val();
        var maxFilterBy = $('#reliabilities-max-filter').val();

        addFilter('reliabilities', minFilterBy == "" || maxFilterBy == "", function(info){
            return info.reliability >= minFilterBy && info.reliability <= maxFilterBy;
        });
    });

    $('.severities-filter').change(function() {
        var minFilterBy = $('#severities-min-filter').val();
        var maxFilterBy = $('#severities-max-filter').val();

        addFilter('severities', minFilterBy == "" || maxFilterBy == "", function(info){
            return info.severity >= minFilterBy && info.severity <= maxFilterBy;
        });
    });
}

function filterByTimeline() {
    if (isSelected) {
        var w = timelineCanvas.width * 0.85;
        var dateStart = (startPosition.x - timelineCanvas.width*0.1) * (maxDate.getTime() - minDate.getTime()) / w;
        dateStart = new Date(dateStart + minDate.getTime());

        var dateEnd = (endPosition.x - timelineCanvas.width*0.1) * (maxDate.getTime() - minDate.getTime()) / w;
        dateEnd = new Date(dateEnd + minDate.getTime());

        timelineFilter = function(info) {
            if (info.date)
                return new Date(info.date) >= dateStart && new Date(info.date) <= dateEnd;
            else
                return new Date(originalEntries[info.entryIndex].modified_at) >= dateStart && new Date(originalEntries[info.entryIndex].modified_at) <= dateEnd;
        }
        filterEntries();
    } else {
        timelineFilter = null;
        filterEntries();
    }
}


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
