var weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
var keyEvents = [];
var decayPalette = ['#1a9850', '#66bd63', '#a6d96a', '#d9ef8b', '#fee08b', '#fdae61', '#f46d43','#d73027'];

function addKeyEvent(data) {
    var container = $('#key-event-list');
    var keyEvent = $('.key-event-template').clone();

    keyEvent.removeClass('key-event-template');
    keyEvent.addClass('key-event');

    if(data){
        keyEvent.find('.event-value').val(data.value);
        keyEvent.find('.start-date').val(data.start_date);
        keyEvent.find('.end-date').val(data.end_date);
        keyEvent.find('.category-select').val(data.category);
    }

    keyEvent.find('button').click(function(){
        var that = $(this).closest('.key-event');
        that.fadeOut('fast', function(){
            that.remove();
        });
    });

    keyEvent.find('select').selectize();
    keyEvent.appendTo(container);
    keyEvent.slideDown('slow');

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
                var separator = $('<hr style="border-color: #c0392b; margin: 0">');
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

function renderTimeline(){
    var container = $('#timeline-view');

    var line = container.find('#line');
    line.hide();

    var timeElements = $('.time-element');
    if(timeElements){
        timeElements.remove();
    }

    var timeElementTemplate = $('.time-element-template').clone();
    timeElementTemplate.removeClass('time-element-template');
    timeElementTemplate.addClass('time-element');

    keyEvents = [];
    var margins = [];
    margins.push(0);

    $('.key-event').each(function(){
        keyEvents.push({
            'value': $(this).find('.event-value').val(),
            'startDate': $(this).find('.start-date').val(),
            'category': $(this).find('.category-select').val()
        });
    });
    keyEvents.sort(function(a, b){
        return (new Date(a.startDate)) < (new Date(b.startDate));
    });
    var dateDiff = (new Date(keyEvents[0].startDate)).getTime() - (new Date(keyEvents[keyEvents.length-1].startDate)).getTime();

    for(var i=0; i<keyEvents.length; i++){
        var timeElement = timeElementTemplate.clone();
        timeElement.find('h3').text(keyEvents[i].value);
        timeElement.find('date').text(keyEvents[i].startDate);
        timeElement.find('p').text(timelineCategories[keyEvents[i].category-1]);
        timeElement.appendTo(container);
        var currentMargin = 0;
        if(i > 0){
            currentMargin = parseInt(240*((new Date(keyEvents[i-1].startDate)).getTime()-((new Date(keyEvents[i].startDate)).getTime()))/dateDiff);
            margins.push(currentMargin);
        }
        timeElement.show();
        timeElement.css('margin-top', parseInt(currentMargin)+'px');
    }
    timeElements = $('.time-element');
    var timelineHeight = 0;
    timeElements.each(function(i){
        timelineHeight += $(this).outerHeight() + margins[i];
    });
    line.height(timelineHeight);
    line.show();
}
function hideTimeline(){
    $('#timeline-view #line').hide();
    var container = $('#timeline-view');
    var timeElements = $('.time-element');
    timeElements.remove();
    container.hide();
}

$(document).ready(function(){
    $('#toggle-panel').on('click', 'a', function(){
        $('#loading-animation').show();
        var current = $('#toggle-panel .active');
        current.removeClass('active');
        $(this).addClass('active');
        var that = $(this);

        $(current.data('target')).fadeOut(function(){
            $(that.data('target')).fadeIn(function(){
                if(that.data('target') == '#timeline-view'){
                    renderTimeline();
                    $('#add-key-event-btn').hide();
                } else{
                    hideTimeline();
                    addTodayButtons();
                    $('#add-key-event-btn').show();
                }
            });
        });
    });
    $('#add-key-event-btn').click(function(){
        addKeyEvent();
    });
    $('.number').on('change input paste drop', function(){
        formatNumber($(this));
    });

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
    $('.number').each(function() {
        formatNumber($(this));
    })

    // Selectize fields
    $('#disaster-type-select').selectize();
    $('#status-select').selectize();
    $('.access-select').selectize();
    $('#day-select').selectize();

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
        addTodayButtons();
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
        if (entries[i].lead_url)
            text += ' (' + entries[i].lead_url + ')'
        text += ' / ';
        if (entries[i].informations[j].date)
            text += formatDate(new Date(entries[i].informations[j].date));
        else
            text += 'N/A';
        $(this).val(text);
    });

    autoCalculateScores();
    $('#report-content input').on('change paste drop input', autoCalculateScores);
    $('.access-select').change(autoCalculateScores);

    var changeWeekSelection = function() {
        // Week interval
        var sd = new Date(start_date);
        var ed = new Date(sd.getTime()  + 6*24*60*60*1000);
        $('#week-select-interval').text(formatDate(sd) + ' to ' + formatDate(ed));

        // Days selection
        var option = $('#day-select').val();
        var daySelectize = $('#day-select')[0].selectize;
        var i = 1;
        for (var date=sd; date<=ed; date.setDate(date.getDate()+1)) {
            daySelectize.updateOption(i+'', {
                value: i+'',
                text: weekDays[i-1] + ', ' + date.toLocaleString('en-gb', {
                    year: 'numeric',
                    month: 'long',
                    day: '2-digit'
                })
            });
            i++;
        }
    }

    var weekDate = new Date(start_date);
    $('#week-select').val(weekDate.getWeekYear()+'-W'+weekDate.getWeek());
    changeWeekSelection();

    $('#week-select').change(function() {
        if ($(this).val() == '') {
            $('#week-select').val(weekDate.getWeekYear()+'-W'+weekDate.getWeek());
        }
        var tmp = $(this).val().split('-W');
        tmp[0] = +tmp[0];
        tmp[1] = +tmp[1];
        start_date = getStupidDateFormat(getDateOfISOWeek(tmp[1], tmp[0]));
        changeWeekSelection();

    });
});

function setInputData() {

    // Parameters
    if (data['day-select'])
        $('#day-select').val(data['day-select']);

    $("#disaster-type-select").val(data["disaster_type"]);
    $("#status-select").val(data["status"]);

    // Key events
    for (var i=0; i<data["events"].length; ++i){
        addKeyEvent(data["events"][i]);
    }
    keyEvents = data["events"];

    // Humanitarian profile data
    for (var pk in data["human"]["number"])
        $(".human-number[data-human-pk='" + pk + "']").val(data["human"]["number"][pk]);
    for (var pk in data["human"]["source"])
        $(".human-source[data-human-pk='" + pk + "']").val(data["human"]["source"][pk]);
    for (var pk in data["human"]["comment"])
        $(".human-comment[data-human-pk='" + pk + "']").val(data["human"]["comment"][pk]);

    // decay colors for humanitarian profile
    humanitarianProfileDecay.init();    // migrations and stuff
    humanitarianProfileDecay.setData(reportMode);   // set data

    // People in need data
    for (var pk in data["people"]["total"])
        $(".people-total[data-people-pk='" + pk + "']").val(data["people"]["total"][pk]);
    for (var pk in data["people"]["at-risk"])
        $(".people-at-risk[data-people-pk='" + pk + "']").val(data["people"]["at-risk"][pk]);
    for (var pk in data["people"]["moderate"])
        $(".people-moderate[data-people-pk='" + pk + "']").val(data["people"]["moderate"][pk]);
    for (var pk in data["people"]["severe"])
        $(".people-severe[data-people-pk='" + pk + "']").val(data["people"]["severe"][pk]);
    for (var pk in data["people"]["planned"])
        $(".people-planned[data-people-pk='" + pk + "']").val(data["people"]["planned"][pk]);

    for (var pk in data["people"]["total-source"])
        $(".people-total-source[data-people-pk='" + pk + "']").val(data["people"]["total-source"][pk]);
    for (var pk in data["people"]["at-risk-source"])
        $(".people-at-risk-source[data-people-pk='" + pk + "']").val(data["people"]["at-risk-source"][pk]);
    for (var pk in data["people"]["moderate-source"])
        $(".people-moderate-source[data-people-pk='" + pk + "']").val(data["people"]["moderate-source"][pk]);
    for (var pk in data["people"]["severe-source"])
        $(".people-severe-source[data-people-pk='" + pk + "']").val(data["people"]["severe-source"][pk]);
    for (var pk in data["people"]["planned-source"])
        $(".people-planned-source[data-people-pk='" + pk + "']").val(data["people"]["planned-source"][pk]);

    for (var pk in data["people"]["total-comment"])
        $(".people-total-comment[data-people-pk='" + pk + "']").val(data["people"]["total-comment"][pk]);
    for (var pk in data["people"]["at-risk-comment"])
        $(".people-at-risk-comment[data-people-pk='" + pk + "']").val(data["people"]["at-risk-comment"][pk]);
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

    // Severity score
    $('#final-score').val(data["final-severity-score"].score);
    $('#final-score-comment').val(data["final-severity-score"].comment);
}

function getInputData() {

    // Parameters
    if ($('#day-select').val() == '')
        data['day-select'] = null;
    else
        data['day-select'] = $('#day-select').val();

    data["disaster_type"] = $("#disaster-type-select").val();
    data["status"] = $("#status-select").val();

    // Key events
    data["events"] = [];
    $(".key-event").each(function() {
        var newevent = {};
        newevent["value"] = $(this).find('.event-value').val();
        newevent["start_date"] = $(this).find('.start-date').val();
        newevent["end_date"] = $(this).find('.end-date').val();
        newevent["category"] = $(this).find('.category-select').val();
        data["events"].push(newevent);
    });

    // Humanitarian profile data
    $(".human-number").each(function() {
        data["human"]["number"][$(this).data("human-pk")] = getNumberValue($(this));
        data["human"]["numberDecay"][$(this).data("human-pk")] = $(this).data('decay-color');
    });
    $(".human-source").each(function() {
        data["human"]["source"][$(this).data("human-pk")] = $(this).val();
        data["human"]["sourceDecay"][$(this).data("human-pk")] = $(this).data('decay-color');
    });
    $(".human-comment").each(function() {
        data["human"]["comment"][$(this).data("human-pk")] = $(this).val();
        data["human"]["commentDecay"][$(this).data("human-pk")] = $(this).data('decay-color');
    });

    // People in need data
    $(".people-total").each(function() {
        data["people"]["total"][$(this).data("people-pk")] = getNumberValue($(this));
    });
    $(".people-at-risk").each(function() {
        data["people"]["at-risk"][$(this).data("people-pk")] = getNumberValue($(this));
    });
    $(".people-moderate").each(function() {
        data["people"]["moderate"][$(this).data("people-pk")] = getNumberValue($(this));
    });
    $(".people-severe").each(function() {
        data["people"]["severe"][$(this).data("people-pk")] = getNumberValue($(this));
    });
    $(".people-planned").each(function() {
        data["people"]["planned"][$(this).data("people-pk")] = getNumberValue($(this));
    });

    $(".people-total-source").each(function() {
        data["people"]["total-source"][$(this).data("people-pk")] = $(this).val();
    });
    $(".people-at-risk-source").each(function() {
        data["people"]["at-risk-source"][$(this).data("people-pk")] = $(this).val();
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
    $(".people-at-risk-comment").each(function() {
        data["people"]["at-risk-comment"][$(this).data("people-pk")] = $(this).val();
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
        data["access-pin"]["number"][$(this).data("access-pin-pk")] = getNumberValue($(this));
    });
    $(".access-pin-source").each(function() {
        data["access-pin"]["source"][$(this).data("access-pin-pk")] = $(this).val();
    });
    $(".access-pin-comment").each(function() {
        data["access-pin"]["comment"][$(this).data("access-pin-pk")] = $(this).val();
    });

    // Severity score
    $("#total-pin").each(function() {
        data["people"]["total"][$(this).data("people-pk")] = getNumberValue($(this));
    });

    $("#final-score").each(function() {
        data["final-severity-score"].score= $(this).val();
    });
    $("#final-score-comment").each(function() {
        data["final-severity-score"].comment= $(this).val();
    });

    data["calculated-severity-score"] = $('#calculated-score').val();
}

function checkRules() {

    // check for decay
    $('.human-comment').on('paste change input', function(){
        humanitarianProfileDecay.updateHumanComment($(this));
    });
    $('.human-source').on('paste change input', function(){
        humanitarianProfileDecay.updateHumanSource($(this));
    });

    $('.human-number').on('paste change input', function(){
        humanitarianProfileDecay.updateHumanNumber($(this));    // check for decay as well

        var errors = "";
        for (var i=0; i<human_profile_field_rules.length; i++) {
            var rule = human_profile_field_rules[i];

            var parent = +getNumberValue($('.human-number[data-human-pk="' + rule.parent + '"]'));
            if (!parent || isNaN(parent))
                continue;
            var parentTitle = $('.human-number[data-human-pk="' + rule.parent + '"]').parent('div').parent('div').find('label').text();

            var childrenSum = 0;
            var children = [];
            var childrenTitles = [];

            for (var j=0; j<rule.children.length; j++) {
                var child = +getNumberValue($('.human-number[data-human-pk="' + rule.children[j] + '"]'));
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


function autoCalculateScores() {

    // PIN
    var maxTotalPin, maxAtRiskPin, maxModeratePin, maxSeverePin, maxPlannedPin;
    $('.total-subfield').each(function() {
        var v = +getNumberValue($(this));
        if (!isNaN(v)) {
            if (!maxTotalPin || maxTotalPin < v)
                maxTotalPin = v;
        }
    });
    $('.people-total-calculated').val(maxTotalPin!=0?maxTotalPin:'');
    formatNumber($('.people-total-calculated'));

    $('.total-at-risk-subfield').each(function() {
        var v = +getNumberValue($(this));
        if (!isNaN(v)) {
            if (!maxAtRiskPin || maxAtRiskPin < v)
                maxAtRiskPin = v;
        }
    });
    $('.people-at-risk-calculated').val(maxAtRiskPin!=0?maxAtRiskPin:'');
    formatNumber($('.people-at-risk-calculated'));

    $('.total-moderate-subfield').each(function() {
        var v = +getNumberValue($(this));
        if (!isNaN(v)) {
            if (!maxModeratePin || maxModeratePin < v)
                maxModeratePin = v;
        }
    });
    $('.people-moderate-calculated').val(maxModeratePin!=0?maxModeratePin:'');
    formatNumber($('.people-moderate-calculated'));

    $('.total-severe-subfield').each(function() {
        var v = +getNumberValue($(this));
        if (!isNaN(v)) {
            if (!maxSeverePin || maxSeverePin < v)
                maxSeverePin = v;
        }
    });
    $('.people-severe-calculated').val(maxSeverePin!=0?maxSeverePin:'');
    formatNumber($('.people-severe-calculated'));

    $('.total-planned-subfield').each(function() {
        var v = +getNumberValue($(this));
        if (!isNaN(v)) {
            if (!maxPlannedPin || maxPlannedPin < v)
                maxPlannedPin = v;
        }
    });
    $('.people-planned-calculated').val(maxPlannedPin!=0?maxPlannedPin:'');
    formatNumber($('.people-planned-calculated'));


    // Severity scores

    // Percentage of the population in need or recently affected
    var totalPopulation = +getNumberValue($('.human-profile-total'));
    var pinOrAffected;

    if (getNumberValue($('.people-in-need-total')) != '') {
        pinOrAffected = +getNumberValue($('.people-in-need-total'));
    }

    if (!pinOrAffected || isNaN(pinOrAffected)) {
        pinOrAffected = +getNumberValue($('.human-profile-total-affected'));
    }

    var pinPercentage = pinOrAffected / totalPopulation * 100;

    var pinScore = 0;
    if (!isNaN(pinPercentage)) {
        if (pinPercentage >= 1)
            pinScore = 1;
        if (pinPercentage >= 3)
            pinScore = 2;
        if (pinPercentage >= 10)
            pinScore = 3;
        $('#pin-percentage').val(pinPercentage+'%');
    }
    $('#pin-percentage-score').val(pinScore);

    // Level of access to the affected population
    var levelOfAccess = 0;
    $('.access-select').each(function(){
        if ($(this).val() == "Yes")
            levelOfAccess++;
    });

    var accessScore = 0;
    if (levelOfAccess >= 2)
        accessScore = 1;
    if (levelOfAccess >= 4)
        accessScore = 2;
    if (levelOfAccess >= 6)
        accessScore = 3;

    $('#level-of-access').val(levelOfAccess);
    $('#level-of-access-score').val(accessScore);

    // Under-five mortality rate
    // var under5MortalityRate = 0;
    var mortalityScore = 0;
    if (under5MortalityRate >= 19)
        mortalityScore = 1;
    if (under5MortalityRate >= 55)
        mortalityScore = 2;
    if (under5MortalityRate >= 90)
        mortalityScore = 3;

    $('#mortality-rate').val(under5MortalityRate);
    $('#mortality-rate-score').val(mortalityScore);

    // HDI
    var hdiRank = "Low";
    var hdiScore = 3;
    if (hdi >= 0.55) {
        hdiScore = 2;
        hdiRank = "Medium";
    }
    if (hdi >= 0.625) {
        hdiScore = 1;
        hdiRank = "High";
    }

    // changed from 0.801 to 0.8
    if (hdi >= 0.7) {
        hdiScore = 0;
        hdiRank = "Very High";
    }

    $('#hdi').val(hdi);
    $('#hdi-rank').val(hdiRank);
    $('#hdi-score').val(hdiScore);

    // Number of uprooted people
    // var uprootedPeople = 0;
    // var uprootedPercentage = 0;
    var uprootedScore = 0;
    if (uprootedPercentage >= 1)
        uprootedScore = 1;
    if (uprootedPercentage >= 3)
        uprootedScore = 2;
    if (uprootedPercentage >= 10)
        uprootedScore = 3;

    $('#uprooted-people').val(uprootedPeople);
    formatNumber($('#uprooted-people'));
    $('#uprooted-percentage').val(uprootedPercentage);
    $('#uprooted-score').val(uprootedScore);

    var scores = [
        pinScore, accessScore, mortalityScore,
        hdiScore, uprootedScore
    ];

     var calculatedScore = Math.min(Math.round(findMedian(scores)), 3);
    $('#calculated-score').val(calculatedScore);

    $('#pin-percentage-score').attr('class', 'form-control score score-'+pinScore);
    $('#level-of-access-score').attr('class', 'form-control score score-'+accessScore);
    $('#mortality-rate-score').attr('class', 'form-control score score-'+mortalityScore);
    $('#hdi-score').attr('class', 'form-control score score-'+hdiScore);
    $('#uprooted-score').attr('class', 'form-control score score-'+uprootedScore);

    $('#calculated-score').attr('class', 'form-control score score-'+calculatedScore);
    $('#final-score').attr('class', 'form-control score score-'+$('#final-score').val());


    // Severity score total number of people in need
    var totalPinReported = parseInt(getNumberValue($('#people-in-need .people-total')));
    var totalPinCalculated = parseInt(getNumberValue($('#people-in-need .people-total-calculated')));
    var totalHumanAffected = parseInt(getNumberValue($('#humanitarian-profile .number[data-human-pk='+severityScoreTotalPinHumanId+']')));

    if(isNaN(totalPinReported) && isNaN(totalPinCalculated) ){
        if(!isNaN(totalHumanAffected)){
            $('#total-pin').val(totalHumanAffected);
            formatNumber($('#total-pin'));
        }else{
            $('#total-pin').val('');
        }
    } else if(isNaN(totalPinReported)){
        if(!isNaN(totalPinCalculated)){
            $('#total-pin').val(totalPinCalculated);
            formatNumber($('#total-pin'));
        }else{
            $('#total-pin').val('');
        }
    } else if(isNaN(totalPinCalculated)){
        $('#total-pin').val(totalPinReported);
        formatNumber($('#total-pin'));
    } else{
        $('#total-pin').val(Math.max(totalPinReported, totalPinCalculated));
        formatNumber($('#total-pin'));
    }

    // PIN IPC calculations
    var ipcLvl4 = parseInt($('input[data-ipc-level="4"]').val());
    var ipcLvl5 = parseInt($('input[data-ipc-level="5"]').val());
    var ipcLvl3 = parseInt($('input[data-ipc-level="3"]').val());

    $('.ipc-severe-calculated').val( !(isNaN(ipcLvl4) || isNaN(ipcLvl5))? ipcLvl4+ipcLvl5: '' );
    $('.ipc-moderate-calculated').val( !isNaN(ipcLvl3)? ipcLvl3: '' );
}
