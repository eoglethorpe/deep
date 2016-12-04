var originalEntries = [];
var entries = [];
var entriesTimeline = [];       // Entries to display on timeline: includes even those filtered out by timeline filter

var filters = {

};
var timelineFilter = null;

var selectizes = [];
var pillarsFilterSelectize; // Required in report-weekly tab filtering

function clearFilters() {
    filters = {};
    $('input').val('');
    for (var i=0; i<selectizes.length; ++i) {
        selectizes[i][0].selectize.setValue(null);
    }
    filterEntries();
}


function filterEntries() {
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
    selectizes.push($('#users-filter').selectize());
    selectizes.push($('#date-published-filter').selectize());
    var areasSelectize = $('#areas-filter').selectize();
    selectizes.push(areasSelectize);
    selectizes.push($('#affected-groups-filter').selectize());
    selectizes.push($('#vulnerable-groups-filter').selectize());
    selectizes.push($('#specific-needs-groups-filter').selectize());
    pillarsFilterSelectize = $('#pillars-filter').selectize();
    selectizes.push(pillarsFilterSelectize);
    // selectizes.push($('#subpillars-filter').selectize());
    selectizes.push($('#sectors-filter').selectize());
    // selectizes.push($('#subsectors-filter').selectize());
    selectizes.push($('#reliabilities-min-filter').selectize());
    selectizes.push($('#reliabilities-max-filter').selectize());
    selectizes.push($('#severities-min-filter').selectize());
    selectizes.push($('#severities-max-filter').selectize());

    $.getJSON("/api/v1/entries/?event="+eventId, function(data){
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
                for (var k=0; k<info.map_selections.length; ++k) {
                    var ms = info.map_selections[k];
                    areasSelectize[0].selectize.addOption({value:ms.name, text:ms.name});
                }
            }
        }

        renderEntries();
    });

    // Filters

    $('#lead-title-search').on('input paste change drop', function() {
        var filterBy = $(this).val();
        addFilter('lead-title', filterBy == "", function(info){
            return info.lead_title.toLowerCase().includes(filterBy.toLowerCase());
        });
    });
    $('#sources-filter').on('input paste change drop', function() {
        var filterBy = $(this).val();
        addFilter('source', filterBy == "", function(info){
            if (info.lead_source)
                return info.lead_source.toLowerCase().includes(filterBy.toLowerCase());
        });
    });
    $('#users-filter').change(function() {
        var filterBy = $(this).val();
        addFilter('users', filterBy == null, function(info){
            return filterBy.indexOf(info.modified_by) >= 0;
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
            return info.affected_groups.filter(function(a){ return filterBy.indexOf(a.name) >= 0; }).length > 0;
        });
    });
    $('#vulnerable-groups-filter').change(function() {
        var filterBy = $(this).val();
        addFilter('vulnerable-groups', filterBy == null, function(info){
            return info.vulnerable_groups.filter(function(v){ return filterBy,indexOf(v.name) >= 0; }).length > 0;
        });
    });
    $('#specific-needs-groups-filter').change(function() {
        var filterBy = $(this).val();
        addFilter('specific-needs-groups', filterBy == null, function(info){
            return info.specific_needs_groups.filter(function(s){ return filterBy.indexOf(s.name) >= 0; }).length > 0;
        });
    });

    $('#search').on('input paste change drop', function() {
        var filterBy = $(this).val();
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

                    var index = pillarFilters.indexOf(a.subpillar.pillar.id);
                    if (index < 0)
                        return false;

                    if (subpillarFilters[index] == null || subpillarFilters[index] == a.subpillar.id)
                        return true;

                    return false;

                }).length > 0;
            });
        }
    });

    $('#sectors-filter').change(function() {
        var filterBy = $(this).val();

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

                    var index = sectorFilters.indexOf(a.sector.id);
                    if (index < 0)
                        return false;

                    if (a.subsectors.length == 0) {
                        if (subsectorFilters[index] == null)
                            return true;
                    }

                    if (subsectorFilters[index] == null || a.subsectors.filter(function(ss) {
                        return ss.id == subsectorFilters[index];
                    }).length > 0)
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
            return info.reliability.level >= minFilterBy && info.reliability.level <= maxFilterBy;
        });
    });

    $('.severities-filter').change(function() {
        var minFilterBy = $('#severities-min-filter').val();
        var maxFilterBy = $('#severities-max-filter').val();

        addFilter('severities', minFilterBy == "" || maxFilterBy == "", function(info){
            return info.severity.level >= minFilterBy && info.severity.level <= maxFilterBy;
        });
    });
}

function filterByTimeline() {
    if (isSelected) {
        var w = timelineCanvas.width * 0.9;
        var dateStart = (startPosition.x - timelineCanvas.width*0.05) * (maxDate.getTime() - minDate.getTime()) / w;
        dateStart = new Date(dateStart + minDate.getTime());
        
        var dateEnd = (endPosition.x - timelineCanvas.width*0.05) * (maxDate.getTime() - minDate.getTime()) / w;
        dateEnd = new Date(dateEnd + minDate.getTime());

        timelineFilter = function(info) {
            if (info.date)
                return new Date(info.date) >= dateStart && new Date(info.date) <= dateEnd;
            else
                return new Date(info.modified_at) >= dateStart && new Date(info.modified_at) <= dateEnd;
        }
        filterEntries();
    } else {
        timelineFilter = null;
        filterEntries();
    }
}
