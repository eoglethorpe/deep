
$(document).ready(function(){

    $('#date-created-filter').selectize();
    $('#areas-filter').selectize();
    $('#sectors-filter').selectize();
    $('#affected-groups-filter').selectize();
    $('#vulnerable-groups-filter').selectize();
    $('#specific-needs-groups-filter').selectize();

    $.getJSON("/api/v1/entries/?event="+eventId, function(data){
        refreshList(data);
    });
});

function refreshList(data) {
    
    $("#entries").empty();
    for (var i=0; i<data.length; ++i) {
        var entry = data[i];

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
    }
}