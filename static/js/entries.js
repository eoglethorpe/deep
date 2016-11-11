var originalEntries = [];
var entries = [];


function filterEntries(clear, filterFunction) {
    if (clear) {
        entries = originalEntries;
        refreshList();
        return;
    }

    entries = [];
    for (var i=0; i < originalEntries.length; ++i) {
        var entry = $.extend(true, {}, originalEntries[i]);
        entry.informations = entry.informations.filter(filterFunction);

        if (entry.informations.length > 0)
            entries.push(entry);
    }
    refreshList();
}

$(document).ready(function(){
    $('#date-modified-filter').selectize();
    var areasSelectize = $('#areas-filter').selectize();
    $('#sectors-filter').selectize();
    $('#affected-groups-filter').selectize();
    $('#vulnerable-groups-filter').selectize();
    $('#specific-needs-groups-filter').selectize();

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

        refreshList();
    });

    // Filters
    $('#areas-filter').change(function() {
        var filterBy = $(this).val();
        filterEntries(filterBy == "", function(info){
            return info.map_selections.filter(function(ms){ return ms.name == filterBy; }).length > 0;
        });
    });
    $('#affected-groups-filter').change(function() {
        var filterBy = $(this).val();
        filterEntries(filterBy == "", function(info){
            return info.affected_groups.filter(function(a){ return a.name == filterBy; }).length > 0;
        });
    });
    $('#sectors-filter').change(function() {
        var filterBy = $(this).val();
        filterEntries(filterBy == "", function(info){
            return info.attributes.filter(function(a){ return a.sector != null && a.sector.id == filterBy; }).length > 0;
        });
    });
    $('#vulnerable-groups-filter').change(function() {
        var filterBy = $(this).val();
        filterEntries(filterBy == "", function(info){
            return info.vulnerable_groups.filter(function(v){ return v.name == filterBy; }).length > 0;
        });
    });
    $('#specific-needs-groups-filter').change(function() {
        var filterBy = $(this).val();
        filterEntries(filterBy == "", function(info){
            return info.specific_needs_groups.filter(function(s){ return s.name == filterBy; }).length > 0;
        });
    });
});

function refreshList() {
    
    $("#entries").empty();
    for (var i=0; i<entries.length; ++i) {
        var entry = entries[i];

        var entryElement = $(".entry-template").clone();
        entryElement.removeClass("entry-template");
        entryElement.addClass("entry");

        entryElement.find(".entry-title").text(entry.lead_title);

        entryElement.appendTo($("#entries"));
        entryElement.show();

        for (var j=0; j<entry.informations.length; ++j) {
            var information = entry.informations[j];

            var informationElement = $(".information-template").clone();
            informationElement.removeClass("information-template");
            informationElement.addClass("information");

            informationElement.find('.excerpt').text(information.excerpt);

            informationElement.find('.reliability').find('span[data-id=' + information.reliability.id + ']').addClass('active');
            informationElement.find('.severity').find('span[data-id=' + information.severity.id + ']').addClass('active');

            informationElement.find('.date').text(information.date);
            informationElement.find('.number').text(information.number);
            
            informationElement.find('.vulnerable-groups').text(
                information.vulnerable_groups.map(function(vg) {
                    return vg.name;
                }).join(", ")
            );
            informationElement.find('.sepecific-need-groups').text(
                information.specific_needs_groups.map(function(sg) {
                    return sg.name;
                }).join(", ")
            );

            informationElement.find('.affected-group-list').text(
                information.affected_groups.map(function(ag) {
                    return ag.name;
                }).join(", ")
            );

            informationElement.find('.geo-locations-list').text(
                information.map_selections.map(function(ms) {
                    return ms.name;
                }).join(", ")
            );

            for (var k=0; k<information.attributes.length; ++k) {
                var attribute = information.attributes[k];

                var attributeElement = $('.attribute-template').clone();
                attributeElement.removeClass('attribute-template');
                attributeElement.addClass('attribute');

                attributeElement.find('.pillar').text(attribute.subpillar.pillar.name);
                attributeElement.find('.sub-pillar').text(attribute.subpillar.name);

                if (attribute.sector) {
                    attributeElement.find(".sector").text(attribute.sector.name);

                    if (attribute.subsector) {
                        attributeElement.find(".sub-sector").text(attribute.subsector.name);
                    }
                }

                attributeElement.appendTo(informationElement.find('.attribute-list'));
                attributeElement.show();
            }

            informationElement.appendTo(entryElement.find('.information-list'));
            informationElement.show();
        }

        entryElement.find('.edit-btn').unbind().click(function(entry){
            return function() {
                window.location.href = "/" + eventId + "/entries/edit/" + entry.id + "/";
            }
        }(entry));

        entryElement.find('.delete-btn').unbind().click(function(entry){
            return function() {
                var data = { id: entry.id };
                redirectPost("/" + eventId + "/entries/delete/", data, csrf_token);
            }
        }(entry));
    }
}