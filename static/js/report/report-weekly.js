
function addEventTimeline(data, add_btn) {
    var container = $('#event-timeline-container');
    var event_timeline = $('.event-timeline-template').clone();

    event_timeline.removeClass('event-timeline-template');
    event_timeline.addClass('event-timeline');

    if (data) {
        event_timeline.find('.event-value').val(data.value);
        event_timeline.find('.start-date').val(data.start_date);
        event_timeline.find('.end-date').val(data.end_date);
        event_timeline.find('.category-select').val(data.category);
    }

    event_timeline.find('select').selectize();
    event_timeline.appendTo(container);
    event_timeline.show();

    var set_remove_btn = !(add_btn | false);

    if(set_remove_btn){
        event_timeline.find('button').text('Remove');
        event_timeline.find('button').removeClass('btn-primary');
        event_timeline.find('button').addClass('btn-danger');

        event_timeline.find('button').on('click', function(){
            $(this).closest('.event-timeline').remove();
        })
    } else {
        event_timeline.find('button').text('Add');
        event_timeline.find('button').removeClass('btn-danger');
        event_timeline.find('button').addClass('btn-primary');

        event_timeline.find('button').on('click', addEventTimeline);
    }

    addTodayButtons();
}

function renderEntries(){
    var entryContainer = $('#entries');
    entryContainer.empty();

    var sevenDaysLater = false;

    for(var i=0; i<entries.length; i++){
        if (!sevenDaysLater &&
                !filterDate('last-seven-days', new Date(entries[i].modified_at)))
        {
            sevenDaysLater = true;
            if (i != 0) {
                var separator = $('<hr style="border-color: #c0392b;">');
                separator.appendTo(entryContainer);
            }
        }

        var entry = $('.entry-template').clone();
        entry.removeClass('entry-template');
        entry.addClass('entry');
        entry.find('h4').text(entries[i].lead_title);
        entry.find('.source').text(entries[i].lead_source_name!=null? entries[i].lead_source_name: 'Not specified');
        if (entries[i].lead_url)
            entry.find('.source').prop('href', entries[i].lead_url);

        var informationContainer = entry.find('.information-list');

        for(var j=0; j<entries[i].informations.length; j++){
            var information = $('.information-template').clone();
            information.removeClass('information-template');
            information.addClass('information');

            information.find('.excerpt').text(entries[i].informations[j].excerpt);
            if (entries[i].informations[j].date)
                information.find('date').text(formatDate(new Date(entries[i].informations[j].date)));
            else
                information.find('date').text("N/A");

            information.find(".reliability").find('._'+entries[i].informations[j].reliability.level).addClass('active');
            information.find(".severity").find('._'+entries[i].informations[j].severity.level).addClass('active');

            information.appendTo(informationContainer);
            information.show();
            if(j != (entries[i].informations.length-1)){
                $('<hr>').appendTo(informationContainer);
            }

            // Make date draggable
            information.find('date').css('cursor', 'pointer');
            information.find('date').attr('draggable', 'true');
            information.find('date').on('dragover', function(e){
                e.preventDefault();
            });
            information.find('date').on('dragstart', function(i, j) {
                return function(e){
                    e.originalEvent.dataTransfer.setData('Text', i+':'+j);
                }
            }(i, j));
        }

        entry.appendTo(entryContainer);
        entry.show();
    }
}

$(document).ready(function(){
    initEntryFilters();

    // One extra filter on last sevendays
    $('#last-seven-days-btn').click(function() {
        if ($(this).hasClass('active')) {
            $(this).removeClass('active');
            addFilter('last-seven-days', true, null);
            $(this).text('Show entries from last 7 days')
        } else {
            $(this).addClass('active');
            addFilter('last-seven-days', false, function(info) {
                return filterDate('last-seven-days', new Date(info.modified_at));
            });
            $(this).text('Show all entries')
        }
    });

    $("#save-btn").click(function() {
        getInputData();
        var d = { "data": JSON.stringify(data), "start_date": start_date };
        redirectPost(window.location.pathname, d, csrf_token);
    });

    // Rule checking
    checkRules();

    // Set fields data
    setInputData();

    // Selectize fields
    $('#disaster-type-select').selectize();
    $('#status-select').selectize();
    $('.access-select').selectize();

    // Tab navigation
    $('#navigator').on('click', 'a', function(){
        var that = $('#navigator .active');
        $(that.data('target')).hide();
        that.removeClass('active');

        $($(this).data('target')).show();
        $(this).addClass('active');

        // Filter pillars based on tabs
        var tag = $(this).data("pillar-tag");
        if (tag) {
            pillarsFilterSelectize[0].selectize.setValue(appearing_pillars[tag]);
        } else {
            pillarsFilterSelectize[0].selectize.setValue(null);
        }
    });

    // Make source/date fields droppable
    $('.source-droppable').on('drop', function(e) {
        var data=e.originalEvent.dataTransfer.getData("Text");
        var ids = data.split(':');
        if (ids.length != 2)
            return;

        var i = +ids[0];
        var j = +ids[1];
        if (isNaN(i) || isNaN(j))
            return;

        e.preventDefault();
        var text = entries[i].lead_source_name != null ? entries[i].lead_source_name : 'N/A';
        text += ' / ';
        if (entries[i].informations[j].date)
            text += formatDate(new Date(entries[i].informations[j].date));
        else
            text += 'N/A';
        $(this).val(text);
    });
});

function setInputData() {

    // Key events
    $("#disaster-type-select").val(data["disaster_type"]);
    $("#status-select").val(data["status"]);

    for (var i=0; i<data["events"].length; ++i)
        addEventTimeline(data["events"][i], i==0);

    // Humanitarian profile data
    for (var pk in data["human"]["number"])
        $(".human-number[data-human-pk='" + pk + "']").val(data["human"]["number"][pk]);
    for (var pk in data["human"]["source"])
        $(".human-source[data-human-pk='" + pk + "']").val(data["human"]["source"][pk]);
    for (var pk in data["human"]["comment"])
        $(".human-comment[data-human-pk='" + pk + "']").val(data["human"]["comment"][pk]);

    // People in need data
    for (var pk in data["people"]["total"])
        $(".people-total[data-people-pk='" + pk + "']").val(data["people"]["total"][pk]);
    for (var pk in data["people"]["moderate"])
        $(".people-moderate[data-people-pk='" + pk + "']").val(data["people"]["moderate"][pk]);
    for (var pk in data["people"]["severe"])
        $(".people-severe[data-people-pk='" + pk + "']").val(data["people"]["severe"][pk]);
    for (var pk in data["people"]["planned"])
        $(".people-planned[data-people-pk='" + pk + "']").val(data["people"]["planned"][pk]);
    for (var pk in data["people"]["total-source"])
        $(".people-total-source[data-people-pk='" + pk + "']").val(data["people"]["total-source"][pk]);
    for (var pk in data["people"]["moderate-source"])
        $(".people-moderate-source[data-people-pk='" + pk + "']").val(data["people"]["moderate-source"][pk]);
    for (var pk in data["people"]["severe-source"])
        $(".people-severe-source[data-people-pk='" + pk + "']").val(data["people"]["severe-source"][pk]);
    for (var pk in data["people"]["planned-source"])
        $(".people-planned-source[data-people-pk='" + pk + "']").val(data["people"]["planned-source"][pk]);
    for (var pk in data["people"]["total-comment"])
        $(".people-total-comment[data-people-pk='" + pk + "']").val(data["people"]["total-comment"][pk]);
    for (var pk in data["people"]["moderate-comment"])
        $(".people-moderate-comment[data-people-pk='" + pk + "']").val(data["people"]["moderate-comment"][pk]);
    for (var pk in data["people"]["severe"])
        $(".people-severe[data-people-pk='" + pk + "']").val(data["people"]["severe"][pk]);
    for (var pk in data["people"]["planned-comment"])
        $(".people-planned-comment[data-people-pk='" + pk + "']").val(data["people"]["planned-comment"][pk]);

    // IPC
    $("input[data-ipc]").each(function() {
        $(this).val(data["ipc"][$(this).data("ipc")]);
    });

    // Access data
    for (var pk in data["access"])
        $(".access-select[data-access-pk='" + pk + "']").val(data["access"][pk]);

    // Access pin data
    for (var pk in data["access-pin"]["number"])
        $(".access-pin-number[data-access-pin-pk='" + pk + "']").val(data["access-pin"]["number"][pk]);
    for (var pk in data["access-pin"]["source"])
        $(".access-pin-source[data-access-pin-pk='" + pk + "']").val(data["access-pin"]["source"][pk]);
    for (var pk in data["access-pin"]["comment"])
        $(".access-pin-comment[data-access-pin-pk='" + pk + "']").val(data["access-pin"]["comment"][pk]);
}

function getInputData() {

    // Key events
    data["disaster_type"] = $("#disaster-type-select").val();
    data["status"] = $("#status-select").val();

    data["events"] = [];
    $(".event-timeline").each(function() {
        var newevent = {};
        newevent["value"] = $(this).find('.event-value').val();
        newevent["start_date"] = $(this).find('.start-date').val();
        newevent["end_date"] = $(this).find('.end-date').val();
        newevent["category"] = $(this).find('.category-select').val();
        data["events"].push(newevent);
    });

    // Humanitarian profile data
    $(".human-number").each(function() {
        data["human"]["number"][$(this).data("human-pk")] = $(this).val();
    });
    $(".human-source").each(function() {
        data["human"]["source"][$(this).data("human-pk")] = $(this).val();
    });
    $(".human-comment").each(function() {
        data["human"]["comment"][$(this).data("human-pk")] = $(this).val();
    });

    // People in need data
    $(".people-total").each(function() {
        data["people"]["total"][$(this).data("people-pk")] = $(this).val();
    });
    $(".people-moderate").each(function() {
        data["people"]["moderate"][$(this).data("people-pk")] = $(this).val();
    });
    $(".people-severe").each(function() {
        data["people"]["severe"][$(this).data("people-pk")] = $(this).val();
    });
    $(".people-planned").each(function() {
        data["people"]["planned"][$(this).data("people-pk")] = $(this).val();
    });
    $(".people-total-source").each(function() {
        data["people"]["total-source"][$(this).data("people-pk")] = $(this).val();
    });
    $(".people-moderate-source").each(function() {
        data["people"]["moderate-source"][$(this).data("people-pk")] = $(this).val();
    });
    $(".people-severe-source").each(function() {
        data["people"]["severe-source"][$(this).data("people-pk")] = $(this).val();
    });
    $(".people-planned-source").each(function() {
        data["people"]["planned-source"][$(this).data("people-pk")] = $(this).val();
    });
    $(".people-total-comment").each(function() {
        data["people"]["total-comment"][$(this).data("people-pk")] = $(this).val();
    });
    $(".people-moderate-comment").each(function() {
        data["people"]["moderate-comment"][$(this).data("people-pk")] = $(this).val();
    });
    $(".people-severe-comment").each(function() {
        data["people"]["severe-comment"][$(this).data("people-pk")] = $(this).val();
    });
    $(".people-planned-comment").each(function() {
        data["people"]["planned-comment"][$(this).data("people-pk")] = $(this).val();
    });

    // IPC
    $("input[data-ipc]").each(function() {
        data["ipc"][$(this).data("ipc")] = $(this).val();
    });

    // Access data
    $(".access-select").each(function() {
        data["access"][$(this).data("access-pk")] = $(this).val();
    });

    // Access pin data
    $(".access-pin-number").each(function() {
        data["access-pin"]["number"][$(this).data("access-pin-pk")] = $(this).val();
    });
    $(".access-pin-source").each(function() {
        data["access-pin"]["number"][$(this).data("access-pin-pk")] = $(this).val();
    });
    $(".access-pin-comment").each(function() {
        data["access-pin"]["number"][$(this).data("access-pin-pk")] = $(this).val();
    });
}


// $(window).on('resize', function(e) {
//     $('#navigator').width($('#report-content').innerWidth())
// });


function checkRules() {
    $('.human-number').on('paste change input', function(){
        var errors = "";
        for (var i=0; i<human_profile_field_rules.length; i++) {
            var rule = human_profile_field_rules[i];

            var parent = +$('.human-number[data-human-pk="' + rule.parent + '"]').val();
            if (!parent || isNaN(parent))
                continue;
            var parentTitle = $('.human-number[data-human-pk="' + rule.parent + '"]').parent('div').parent('div').find('label').text();

            var childrenSum = 0;
            var children = [];
            var childrenTitles = [];

            for (var j=0; j<rule.children.length; j++) {
                var child = +$('.human-number[data-human-pk="' + rule.children[j] + '"]').val();
                if (child && !isNaN(child)) {
                    childrenSum += parseInt(child);
                    children.push(child);
                }

                var childTitle = $('.human-number[data-human-pk="' + rule.children[j] + '"]').parent('div').parent('div').find('label').text();
                childrenTitles.push(childTitle);
            }

            if (rule.comparision == '<') { 
                for (var j=0; j<children.length; j++) {
                    if (children[j] > parent)
                        break;
                }
                if (j != children.length) {
                    errors += '<strong>' + childrenTitles.join(', ') + '</strong> should be less than or equal to <strong>' + parentTitle + '</strong> ! <br>';
                }
            }
            else if (rule.comparision == '+<') {
                if (childrenSum > parent) {
                    errors += 'Sum of <strong>' + childrenTitles.join(', ') + '</strong> should be less than or equal to <strong>' + parentTitle + '</strong> ! <br>';
                }
            }
            else if (rule.comparision == '+') {
                if (childrenSum != parent) {
                    errors += 'Sum of <strong>' + childrenTitles.join(', ') + '</strong> should be equal to <strong>' + parentTitle + '</strong> ! <br>';
                }
            }
        }

        $('#humanitarian-profile-field-error').html(errors);
        if (errors != '')
            $('#humanitarian-profile-field-error').show();
        else
            $('#humanitarian-profile-field-error').hide();
    });
}