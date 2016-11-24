var originalEntries = [];
var entries = [];

var filters = {

};

var pillarsFilterSelectize;


function filterEntries() {
    entries = [];
    for (var i=0; i<originalEntries.length; ++i) {
        var entry = $.extend(true, {}, originalEntries[i]);
        
        for (var filter in filters) {
            if (filters[filter]) {
                entry.informations = entry.informations.filter(filters[filter]);
            }
        }

        if (entry.informations.length > 0)
            entries.push(entry);
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
    $('#sources-filter').selectize();
    $('#users-filter').selectize();
    $('#date-modified-filter').selectize();
    var areasSelectize = $('#areas-filter').selectize();
    $('#affected-groups-filter').selectize();
    $('#vulnerable-groups-filter').selectize();
    $('#specific-needs-groups-filter').selectize();
    pillarsFilterSelectize = $('#pillars-filter').selectize();
    $('#subpillars-filter').selectize();
    $('#sectors-filter').selectize();
    $('#subsectors-filter').selectize();
    $('#reliabilities-min-filter').selectize();
    $('#reliabilities-max-filter').selectize();
    $('#severities-min-filter').selectize();
    $('#severities-max-filter').selectize();

    $.getJSON("/api/v1/entries/?event="+eventId, function(data){
        originalEntries = data;
        entries = data;

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

        entries.sort(function(e1, e2) {
            return new Date(e2.modified_at) - new Date(e1.modified_at);
        });

        renderEntries();
    });

    // Filters

    $('#lead-title-search').on('input paste change drop', function() {
        var filterBy = $(this).val();
        addFilter('lead-title', filterBy == "", function(info){
            return info.lead_title.toLowerCase().includes(filterBy.toLowerCase());
        });
    });
    $('#sources-filter').change(function() {
        var filterBy = $(this).val();
        addFilter('source', filterBy == null, function(info){
            return filterBy.indexOf(info.lead_source) >= 0;
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