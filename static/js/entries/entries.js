
var mapLoaded = false;

$(document).ready(function() {
    initEntryFilters();

    $('#toggle-panel').on('click', 'a', function(){
        $('#loading-animation').show();
        var current = $('#toggle-panel .active');
        current.removeClass('active');
        $(this).addClass('active');
        var that = $(this);

        $(current.data('target')).fadeOut(function(){
            $(that.data('target')).fadeIn(function() {
                if (that.data('target') == '#visualizations') {
                    // Fix a little bug on admin level buttons when they
                    // are loaded while not on visualization tab.
                    if (!mapLoaded) {
                        loadMap();
                    }
                    // A similar bug for timeline
                    resizeCanvas();
                    renderVisualizations();
                }
            });

        });
        setTimeout(function(){
            $('#loading-animation').hide();
        }, 500);

    });

    // loadMap();
});

function renderEntries() {
    renderVisualizations();

    $("#entries").empty();
    for (var i=0; i<entries.length; ++i) {
        var entry = entries[i];

        var entryElement = $(".entry-template").clone();
        entryElement.removeClass("entry-template");
        entryElement.addClass("entry");

        entryElement.find(".entry-title").html(searchAndHighlight(entry.lead_title, leadTitleFilterText));
        entryElement.find(".created-by").text(entry.modified_by);
        entryElement.find(".created-on").text(formatDate(new Date(entry.modified_at)));

        entryElement.appendTo($("#entries"));
        entryElement.show();

        for (var j=0; j<entry.informations.length; ++j) {
            var information = entry.informations[j];

            var informationElement = $(".information-template").clone();
            informationElement.removeClass("information-template");
            informationElement.addClass("information");

            informationElement.find('.excerpt').html(searchAndHighlight(information.excerpt, searchFilterText));

            informationElement.find('.reliability').find('span[data-id=' + information.reliability.id + ']').addClass('active');
            informationElement.find('.severity').find('span[data-id=' + information.severity.id + ']').addClass('active');

            informationElement.find('.date').text(information.date?formatDate(information.date):"");
            informationElement.find('.number').text(information.number);

            informationElement.find('.vulnerable-groups').html(
                information.vulnerable_groups.map(function(vg) {
                    return '<span>'+vg.name+'</span>';
                }).join('')
            );
            informationElement.find('.sepecific-need-groups').html(
                information.specific_needs_groups.map(function(sg) {
                    return '<span>'+sg.name+'</span>';
                }).join('')
            );

            informationElement.find('.affected-group-list').html(
                information.affected_groups.map(function(ag) {
                    return '<span>'+ag.name+'</span>';
                }).join('')
            );

            informationElement.find('.geo-locations-list').html(
                information.map_selections.map(function(ms) {
                    return '<span>'+ms.name+'</span>';
                }).join('')
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

                    if (attribute.subsectors) {
                        attributeElement.find(".sub-sector").text(
                            attribute.subsectors.reduce(function(a, b) {
                                if (a) return a + ", " + b.name;
                                else return b.name;
                            }, null)
                        );
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
    $('#loading-animation').hide();
}
