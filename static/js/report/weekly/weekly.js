var weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
var keyEvents = [];
var dateRangeInputModal;

function initLazyLoad() {
    scrollHandlingNeeded = true;

    const scrollElement = $('#entries');
    scrollElement.scroll(function() {
        if(scrollElement.scrollTop() + scrollElement.height() >= scrollElement[0].scrollHeight) {
            if (scrollCallback) {
                scrollCallback();
            }
        }
    });
}

function addKeyEvent(data) {
    var container = $('#key-event-list');
    var keyEvent = $('.key-event-template').clone();

    keyEvent.removeClass('key-event-template');
    keyEvent.addClass('key-event');
    keyEvent.removeClass('key-event-template');

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

    keyEvent.find('.date-picker-template').removeClass('date-picker-template')
        .addClass('date-picker');

    addTodayButtons();
}

function renderEntries(){
    var entryContainer = $('#entries');
    entryContainer.empty();

    var sevenDaysLater = false;

    for(var i=0; i<entries.length; i++){
        if (!sevenDaysLater &&
                !filterDate('last-seven-days', new Date(entries[i].created_at)))
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
        entry.find('h4').html(searchAndHighlight(entries[i].lead_title, leadTitleFilterText));
        entry.find('.source').text(entries[i].lead_source!=null? entries[i].lead_source: 'Not specified');
        if (entries[i].lead_url)
            entry.find('.source').prop('href', entries[i].lead_url);

        var informationContainer = entry.find('.information-list');

        for(var j=0; j<entries[i].informations.length; j++){
            var information = $('.information-template').clone();
            information.removeClass('information-template');
            information.addClass('information');

            if(entries[i].informations[j].image.length == 0){
                information.find('.excerpt-text').html(searchAndHighlight(entries[i].informations[j].excerpt, searchFilterText));
                information.find('.excerpt-image').hide();
                information.find('.excerpt-text').show();
            } else{
                information.find('.excerpt-image').attr('src', entries[i].informations[j].image);
                information.find('.excerpt-text').hide();
                information.find('.excerpt-image').show();
            }
            if (entries[i].informations[j].date){
                entry.find('date').text(formatDate(new Date(entries[i].informations[j].date)));
            } else{
                entry.find('date').text("N/A");
            }

            information.find(".reliability").find('._'+entries[i].informations[j].reliability).addClass('active');
            information.find(".severity").find('._'+entries[i].informations[j].severity).addClass('active');

            information.appendTo(informationContainer);
            information.show();
            if(j != (entries[i].informations.length-1)){
                $('<hr>').appendTo(informationContainer);
            }

            // Make source id draggable
            information.find('.source-id').css('cursor', 'pointer');
            information.find('.source-id').attr('draggable', 'true');
            information.find('.source-id').on('dragover', function(e){
                e.preventDefault();
            });
            information.find('.source-id').on('dragstart', function(i, j) {
                return function(e){
                    e.originalEvent.dataTransfer.setData('Text', i+':'+j);
                }
            }(entries[i].id, entries[i].informations[j].id));
        }

        entry.appendTo(entryContainer);
        entry.show();
    }
}

function renderTemplateEntries() {
    let entryContainer = $('#entries');
    entryContainer.empty();

    let sevenDaysLater = false;

    let entries = entriesManager.filteredEntries;
    for (let i=0; i<entries.length; i++) {
        if (!sevenDaysLater && !filterDate('last-seven-days', new Date(entries[i].created_at))) {
            sevenDaysLater = true;
            if (i != 0) {
                let separator = $('<hr style="border-color: #c0392b; margin: 0">');
                separator.appendTo(entryContainer);
            }
        }

        let entry = $('.entry-template').clone();
        entry.removeClass('entry-template');
        entry.addClass('entry');
        entry.find('h4').html(searchAndHighlight(entries[i].lead_title, $('#filters input[data-id="lead-title"]').val()));
        entry.find('.source').text(entries[i].lead_source!=null? entries[i].lead_source: 'Not specified');
        if (entries[i].lead_url)
            entry.find('.source').prop('href', entries[i].lead_url);

        let informationContainer = entry.find('.information-list');

        for (let j=0; j<entries[i].informations.length; j++){
            let information = $('.template-information-template').clone();
            information.removeClass('information-template');
            information.addClass('information');

            if(entries[i].informations[j].image.length == 0){
                information.find('.excerpt-text').html(searchAndHighlight(entries[i].informations[j].excerpt, $('#filters input[data-id="search-excerpt"]').val()));
                information.find('.excerpt-image').hide();
                information.find('.excerpt-text').show();
            } else{
                information.find('.excerpt-image').attr('src', entries[i].informations[j].image);
                information.find('.excerpt-text').hide();
                information.find('.excerpt-image').show();
            }

            information.appendTo(informationContainer);
            information.show();
            if(j != (entries[i].informations.length-1)){
                $('<hr>').appendTo(informationContainer);
            }

            // Make source id draggable
            information.find('.source-id').css('cursor', 'pointer');
            information.find('.source-id').attr('draggable', 'true');
            information.find('.source-id').on('dragover', function(e){
                e.preventDefault();
            });
            information.find('.source-id').on('dragstart', function(i, j) {
                return function(e){
                    e.originalEvent.dataTransfer.setData('Text', i+':'+j);
                }
            }(entries[i].id, entries[i].informations[j].id));
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
            'endDate': $(this).find('.end-date').val(),
            'category': $(this).find('.category-select').val()
        });
    });
    keyEvents.sort(function(a, b){
        return (new Date(a.startDate)) < (new Date(b.startDate));
    });
    var dateDiff = (new Date(keyEvents[0].startDate)).getTime() - (new Date(keyEvents[keyEvents.length-1].startDate)).getTime();

    function getDateFromString(dateStr){
        let monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        let date = new Date(dateStr);
        return date.getDate() + ' ' + monthNamesShort[date.getMonth()] + ' ' + date.getFullYear();
    }

    for(var i=0; i<keyEvents.length; i++){
        var timeElement = timeElementTemplate.clone();
        timeElement.find('h3').text(keyEvents[i].value);
        timeElement.find('date').text(getDateFromString(keyEvents[i].startDate) + (keyEvents[i].endDate? (' - ' + getDateFromString(keyEvents[i].endDate)): '') );
        timeElement.addClass(timelineCategories[keyEvents[i].category-1].substr(0, 3).toLowerCase());
        //timeElement.find('p').text(timelineCategories[keyEvents[i].category-1]);
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
    dateRangeInputModal = new Modal('#date-range-input');

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

    if (templateData) {
        entriesManager.init(eventId, $('#filters'));
        for (let i=0; i<templateData.elements.length; i++) {
            entriesManager.addFilterFor(templateData.elements[i]);
        }

        entriesManager.renderCallback = renderTemplateEntries;
        entriesManager.readAll();
    }
    else {
        initEntryFilters();
    }

    // One extra filter on last sevendays
    $('#last-seven-days-btn').click(function() {
        if ($(this).hasClass('active')) {
            $(this).removeClass('active');
            addFilter('last-seven-days', true, null);
            $(this).text('Show entries from last 7 days')
        } else {
            $(this).addClass('active');
            addFilter('last-seven-days', false, function(info) {
                return filterDate('last-seven-days', new Date(originalEntries[info.entryIndex].created_at));
            });
            $(this).text('Show all entries')
        }
    });

    $("#save-btn").click(function() {
        if ($('.comment+p').length > 0) {
            alert('You have entered a value with no source and comment');
            return;
        }

        autoCalculateScores();
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
    //$('.access-select').selectize();
    $('#day-select').selectize();

    // Tab navigation
    $('#navigator').on('click', 'a', function(){
        var that = $('#navigator .active');
        $(that.data('target')).hide();
        that.removeClass('active');

        $($(this).data('target')).show();
        $(this).addClass('active');

        if (!templateData) {
            // Filter pillars based on tabs
            var tag = $(this).data("pillar-tag");
            if (tag) {
                pillarsFilterSelectize[0].selectize.setValue(appearing_pillars[tag]);
            } else {
                pillarsFilterSelectize[0].selectize.setValue(null);
            }
        }
        addTodayButtons();
    });

    // Make source/date fields droppable
    $('.source-droppable').on('drop', function(e) {
        let data=e.originalEvent.dataTransfer.getData("Text");
        let ids = data.split(':');
        if (ids.length != 2)
            return;

        let i = +ids[0];
        let j = +ids[1];
        if (isNaN(i) || isNaN(j))
            return;

        e.preventDefault();

        let entry = originalEntries.find(e => e.id == i);
        let information = entry.informations.find(info => info.id == j);

        let text = entry.lead_source!= null ? entry.lead_source: 'N/A';
        if (entry.lead_url)
            text += ' (' + entry.lead_url + ')'
        text += ' / ';
        if (information.date)
            text += formatDate(new Date(information.date));
        else
            text += 'N/A';
        $(this).val(text);
        $(this).trigger('change');
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
    $('#week-select').val(weekDate.getWeekYear()+'-W'+getTwoDigits(weekDate.getWeek()));
    changeWeekSelection();

    $('#week-select').change(function() {
        if ($(this).val() == '') {
            $('#week-select').val(weekDate.getWeekYear()+'-W'+getTwoDigits(weekDate.getWeek()));
        }
        var tmp = $(this).val().split('-W');
        tmp[0] = +tmp[0];
        tmp[1] = +tmp[1];
        start_date = getStupidDateFormat(getDateOfISOWeek(tmp[1], tmp[0]));
        changeWeekSelection();

    });


    // Initialize children fields stuffs
    childrenFields.init();

    // Handle source fields
    source.init();

    initLazyLoad();
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
    // for (var pk in data["human"]["source"])
    //     $(".human-source[data-human-pk='" + pk + "']").val(getOldSourceData(data["human"]["source"][pk]));
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

    // for (var pk in data["people"]["total-source"])
    //     $(".people-total-source[data-people-pk='" + pk + "']").val(getOldSourceData(data["people"]["total-source"][pk]));
    // for (var pk in data["people"]["at-risk-source"])
    //     $(".people-at-risk-source[data-people-pk='" + pk + "']").val(getOldSourceData(data["people"]["at-risk-source"][pk]));
    // for (var pk in data["people"]["moderate-source"])
    //     $(".people-moderate-source[data-people-pk='" + pk + "']").val(getOldSourceData(data["people"]["moderate-source"][pk]));
    // for (var pk in data["people"]["severe-source"])
    //     $(".people-severe-source[data-people-pk='" + pk + "']").val(getOldSourceData(data["people"]["severe-source"][pk]));
    // for (var pk in data["people"]["planned-source"])
    //     $(".people-planned-source[data-people-pk='" + pk + "']").val(getOldSourceData(data["people"]["planned-source"][pk]));

    for (var pk in data["people"]["total-comment"])
        $(".people-total-comment[data-people-pk='" + pk + "']").val(data["people"]["total-comment"][pk]);
    for (var pk in data["people"]["at-risk-comment"])
        $(".people-at-risk-comment[data-people-pk='" + pk + "']").val(data["people"]["at-risk-comment"][pk]);
    for (var pk in data["people"]["moderate-comment"])
        $(".people-moderate-comment[data-people-pk='" + pk + "']").val(data["people"]["moderate-comment"][pk]);
    for (var pk in data["people"]["severe"])
        $(".people-severe-comment[data-people-pk='" + pk + "']").val(data["people"]["severe-comment"][pk]);
    for (var pk in data["people"]["planned-comment"])
        $(".people-planned-comment[data-people-pk='" + pk + "']").val(data["people"]["planned-comment"][pk]);

    peopleInNeedDecay.init();
    peopleInNeedDecay.setData(reportMode);

    // IPC
    $(".ipc input[data-ipc]").each(function() {
        if ($(this).data("ipc") == 'f'){
            $(this).val(getOldSourceData(data["ipc"][$(this).data("ipc")]));
        }else{
            $(this).val(data["ipc"][$(this).data("ipc")]);
        }
    });

    $(".ipc-forecasted input[data-ipc]").each(function() {
        if ($(this).data("ipc") == 'f'){
            $(this).val(getOldSourceData(data["ipc-forecast"][$(this).data("ipc")]));
        }else{
            $(this).val(data["ipc-forecast"][$(this).data("ipc")]);
        }
    });

    // Access data
    for (var pk in data["access"])
        $(".access-select[data-access-pk='" + pk + "']").val(data["access"][pk]);
    // for (var pk in data["access-extra"]["source"])
    //     $(".access-source[data-access-pk='" + pk + "']").val(getOldSourceData(data["access-extra"]["source"][pk]));
    for (var pk in data["access-extra"]["comment"])
        $(".access-comment[data-access-pk='" + pk + "']").val(data["access-extra"]["comment"][pk]);

    // Access pin data
    for (var pk in data["access-pin"]["number"])
        $(".access-pin-number[data-access-pin-pk='" + pk + "']").val(data["access-pin"]["number"][pk]);
    // for (var pk in data["access-pin"]["source"])
    //     $(".access-pin-source[data-access-pin-pk='" + pk + "']").val(getOldSourceData(data["access-pin"]["source"][pk]));
    for (var pk in data["access-pin"]["comment"])
        $(".access-pin-comment[data-access-pin-pk='" + pk + "']").val(data["access-pin"]["comment"][pk]);

    humanitarianAccessDecay.init();
    humanitarianAccessDecay.setData(reportMode);

    // Severity score
    $('#final-score').val(data["final-severity-score"].score);
    $('#final-score-comment').val(data["final-severity-score"].comment);
}

function getInputData() {
    data = newData;

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
    //     data["human"][source"][$(this).data("human-pk")]['old'] = $(this).val();
        data["human"]["sourceDecay"][$(this).data("human-pk")] = $(this).data('decay-color');
    });
    $(".human-comment").each(function() {
        data["human"]["comment"][$(this).data("human-pk")] = $(this).val();
        data["human"]["commentDecay"][$(this).data("human-pk")] = $(this).data('decay-color');
    });

    // People in need data
    $(".people-total").each(function() {
        data["people"]["total"][$(this).data("people-pk")] = getNumberValue($(this));
        data["people"]["totalDecay"][$(this).data("people-pk")] = $(this).data('decay-color');
    });
    $(".people-at-risk").each(function() {
        data["people"]["at-risk"][$(this).data("people-pk")] = getNumberValue($(this));
        data["people"]["atRiskDecay"][$(this).data("people-pk")] = $(this).data('decay-color');
    });
    $(".people-moderate").each(function() {
        data["people"]["moderate"][$(this).data("people-pk")] = getNumberValue($(this));
        data["people"]["moderateDecay"][$(this).data("people-pk")] = $(this).data('decay-color');
    });
    $(".people-severe").each(function() {
        data["people"]["severe"][$(this).data("people-pk")] = getNumberValue($(this));
        data["people"]["severeDecay"][$(this).data("people-pk")] = $(this).data('decay-color');
    });
    $(".people-planned").each(function() {
        data["people"]["planned"][$(this).data("people-pk")] = getNumberValue($(this));
        data["people"]["plannedDecay"][$(this).data("people-pk")] = $(this).data('decay-color');
    });

    $(".people-total-source").each(function() {
        // data["people"]["total-source"][$(this).data("people-pk")]['old'] = $(this).val();
        data["people"]["totalSourceDecay"][$(this).data("people-pk")] = $(this).data('decay-color');
    });
    $(".people-at-risk-source").each(function() {
        // data["people"]["at-risk-source"][$(this).data("people-pk")]['old'] = $(this).val();
        data["people"]["atRiskSourceDecay"][$(this).data("people-pk")] = $(this).data('decay-color');
    });
    $(".people-moderate-source").each(function() {
        // data["people"]["moderate-source"][$(this).data("people-pk")]['old'] = $(this).val();
        data["people"]["moderateSourceDecay"][$(this).data("people-pk")] = $(this).data('decay-color');
    });
    $(".people-severe-source").each(function() {
        // data["people"]["severe-source"][$(this).data("people-pk")]['old'] = $(this).val();
        data["people"]["severeSourceDecay"][$(this).data("people-pk")] = $(this).data('decay-color');
    });
    $(".people-planned-source").each(function() {
        // data["people"]["planned-source"][$(this).data("people-pk")]['old'] = $(this).val();
        data["people"]["plannedSourceDecay"][$(this).data("people-pk")] = $(this).data('decay-color');
    });

    $(".people-total-comment").each(function() {
        data["people"]["total-comment"][$(this).data("people-pk")] = $(this).val();
        data["people"]["totalCommentDecay"][$(this).data("people-pk")] = $(this).data('decay-color');
    });
    $(".people-at-risk-comment").each(function() {
        data["people"]["at-risk-comment"][$(this).data("people-pk")] = $(this).val();
        data["people"]["atRiskCommentDecay"][$(this).data("people-pk")] = $(this).data('decay-color');
    });
    $(".people-moderate-comment").each(function() {
        data["people"]["moderate-comment"][$(this).data("people-pk")] = $(this).val();
        data["people"]["moderateCommentDecay"][$(this).data("people-pk")] = $(this).data('decay-color');
    });
    $(".people-severe-comment").each(function() {
        data["people"]["severe-comment"][$(this).data("people-pk")] = $(this).val();
        data["people"]["severeCommentDecay"][$(this).data("people-pk")] = $(this).data('decay-color');
    });
    $(".people-planned-comment").each(function() {
        data["people"]["planned-comment"][$(this).data("people-pk")] = $(this).val();
        data["people"]["plannedCommentDecay"][$(this).data("people-pk")] = $(this).data('decay-color');
    });

    // IPC
    $(".ipc input[data-ipc]").each(function() {
        // if ($(this).data("ipc") == 'f'){
        //     data["ipc"][$(this).data("ipc")]["old"] = $(this).val();
        // }else
        if ($(this).data('ipc') != 'g') {
            data["ipc"][$(this).data("ipc")] = getNumberValue($(this));
        }
        else {
            data["ipc"][$(this).data("ipc")] = $(this).val();
        }
    });

    $('.ipc-forecasted input[data-ipc]').each(function() {
        if ($(this).data('ipc') != 'g') {
            data["ipc-forecast"][$(this).data("ipc")] = getNumberValue($(this));
        }
        else {
            data["ipc-forecast"][$(this).data("ipc")] = $(this).val();
        }
    });

    // Access data
    $(".access-select").each(function() {
        data["access"][$(this).data("access-pk")] = $(this).val();
        data["accessDecay"][$(this).data("access-pk")] = $(this).data('decay-color');
    });
    // $(".access-source").each(function() {
    //     if(!data["access-extra"]["source"][$(this).data("access-pk")]){
    //         data["access-extra"]["source"][$(this).data("access-pk")] = {};
    //     }
    //     data["access-extra"]["source"][$(this).data("access-pk")]['old'] = $(this).val();
    // });
    $(".access-comment").each(function() {
        data["access-extra"]["comment"][$(this).data("access-pk")] = $(this).val();
    });

    // Access pin data
    $(".access-pin-number").each(function() {
        data["access-pin"]["number"][$(this).data("access-pin-pk")] = getNumberValue($(this));
        data["access-pin"]["numberDecay"][$(this).data("access-pin-pk")] = $(this).data('decay-color');
    });
    $(".access-pin-source").each(function() {
        // data["access-pin"]["source"][$(this).data("access-pin-pk")]['old'] = $(this).val();
        data["access-pin"]["sourceDecay"][$(this).data("access-pin-pk")] = $(this).data('decay-color');
    });
    $(".access-pin-comment").each(function() {
        data["access-pin"]["comment"][$(this).data("access-pin-pk")] = $(this).val();
        data["access-pin"]["commentDecay"][$(this).data("access-pin-pk")] = $(this).data('decay-color');
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
    $('.human-comment').on('drop paste change input', function(){
        humanitarianProfileDecay.updateHumanComment($(this));
        validateSource($(this), newData['human']['source'][$(this).data('human-pk')]);
    });
    // $('.human-source').on('drop paste change input', function(){
    //     humanitarianProfileDecay.updateHumanSource($(this));
    // });

    $('.human-number').on('drop paste change input', function(){
        humanitarianProfileDecay.updateHumanNumber($(this));    // check for decay as well
        validateSource($(this), newData['human']['source'][$(this).data('human-pk')]);

        var errors = "";
        for (var i=0; i<human_profile_field_rules.length; i++) {
            var rule = human_profile_field_rules[i];

            var parent = +getNumberValue($('.human-number[data-human-pk="' + rule.parent + '"]'));
            if (!parent || isNaN(parent))
                continue;
            var parentTitle = $('.human-number[data-human-pk="' + rule.parent + '"]').closest('.human-profile-field').find('label').eq(0).text();

            var childrenSum = 0;
            var children = [];
            var childrenTitles = [];

            for (var j=0; j<rule.children.length; j++) {
                var child = +getNumberValue($('.human-number[data-human-pk="' + rule.children[j] + '"]'));
                if (child && !isNaN(child)) {
                    childrenSum += parseInt(child);
                    children.push(child);
                }

                var childTitle = $('.human-number[data-human-pk="' + rule.children[j] + '"]').closest('.human-profile-subfield').find('label').eq(0).text();
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

        let errorField = $(this).closest('section').find('.field-error');

        errorField.html(errors);
        if (errors != '')
            errorField.show();
        else
            errorField.hide();
    });

    $(".people-total").on('drop paste change input', function() {
        peopleInNeedDecay.update($(this), data["people"]["total"][$(this).data("people-pk")]);
        validateSource($(this), newData['people']['total-source'][$(this).data('people-pk')]);
    });
    $(".people-at-risk").on('drop paste change input', function() {
        peopleInNeedDecay.update($(this), data["people"]["at-risk"][$(this).data("people-pk")]);
        validateSource($(this), newData['people']['at-risk-source'][$(this).data('people-pk')]);
    });
    $(".people-moderate").on('drop paste change input', function() {
        peopleInNeedDecay.update($(this), data["people"]["moderate"][$(this).data("people-pk")]);
        validateSource($(this), newData['people']['moderate-source'][$(this).data('people-pk')]);
    });
    $(".people-severe").on('drop paste change input', function() {
        peopleInNeedDecay.update($(this), data["people"]["severe"][$(this).data("people-pk")]);
        validateSource($(this), newData['people']['severe-source'][$(this).data('people-pk')]);
    });
    $(".people-planned").on('drop paste change input', function() {
        peopleInNeedDecay.update($(this), data["people"]["planned"][$(this).data("people-pk")]);
        validateSource($(this), newData['people']['planned-source'][$(this).data('people-pk')]);
    });

    // $(".people-total-source").on('drop paste change input', function() {
    //     peopleInNeedDecay.update($(this), data["people"]["total-source"][$(this).data("people-pk")]['old']);
    //     validateSource($(this), newData['people']['total-source'][$(this).data('people-pk')]);
    // });
    // $(".people-at-risk-source").on('drop paste change input', function() {
    //     peopleInNeedDecay.update($(this), data["people"]["at-risk-source"][$(this).data("people-pk")]['old']);
    //     validateSource($(this), newData['people']['at-risk-source'][$(this).data('people-pk')]);
    // });
    // $(".people-moderate-source").on('drop paste change input', function() {
    //     peopleInNeedDecay.update($(this), data["people"]["moderate-source"][$(this).data("people-pk")]['old']);
    //     validateSource($(this), newData['people']['moderate-source'][$(this).data('people-pk')]);
    // });
    // $(".people-severe-source").on('drop paste change input', function() {
    //     peopleInNeedDecay.update($(this), data["people"]["severe-source"][$(this).data("people-pk")]['old']);
    //     validateSource($(this), newData['people']['severe-source'][$(this).data('people-pk')]);
    // });
    // $(".people-planned-source").on('drop paste change input', function() {
    //     peopleInNeedDecay.update($(this), data["people"]["planned-source"][$(this).data("people-pk")]['old']);
    //     validateSource($(this), newData['people']['planned-source'][$(this).data('people-pk')]);
    // });

    $(".people-total-comment").on('drop paste change input', function() {
        peopleInNeedDecay.update($(this), data["people"]["total-comment"][$(this).data("people-pk")]);
        validateSource($(this), newData['people']['total-source'][$(this).data('people-pk')]);
    });
    $(".people-at-risk-comment").on('drop paste change input', function() {
        peopleInNeedDecay.update($(this), data["people"]["at-risk-comment"][$(this).data("people-pk")]);
        validateSource($(this), newData['people']['at-risk-source'][$(this).data('people-pk')]);
    });
    $(".people-moderate-comment").on('drop paste change input', function() {
        peopleInNeedDecay.update($(this), data["people"]["moderate-comment"][$(this).data("people-pk")]);
        validateSource($(this), newData['people']['moderate-source'][$(this).data('people-pk')]);
    });
    $(".people-severe-comment").on('drop paste change input', function() {
        peopleInNeedDecay.update($(this), data["people"]["severe-comment"][$(this).data("people-pk")]);
        validateSource($(this), newData['people']['severe-source'][$(this).data('people-pk')]);
    });
    $(".people-planned-comment").on('drop paste change input', function() {
        peopleInNeedDecay.update($(this), data["people"]["planned-comment"][$(this).data("people-pk")]);
        validateSource($(this), newData['people']['planned-source'][$(this).data('people-pk')]);
    });

    $(".access-pin-number").on('drop paste change input', function(){
        humanitarianAccessDecay.update($(this), data['access-pin']['numberDecay'][$(this).data('access-pin-pk')]);
        validateSource($(this), newData['access-pin']['source'][$(this).data('access-pin-pk')]);
    });
    // $(".access-pin-source").on('drop paste change input', function(){
    //     humanitarianAccessDecay.update($(this), data['access-pin']['sourceDecay'][$(this).data('access-pin-pk')]);
    //     validateSource($(this), newData['access-pin']['source'][$(this).data('access-pin-pk')]);
    // });
    $(".access-pin-comment").on('drop paste change input', function(){
        humanitarianAccessDecay.update($(this), data['access-pin']['commentDecay'][$(this).data('access-pin-pk')]);
        validateSource($(this), newData['access-pin']['source'][$(this).data('access-pin-pk')]);
    });
    $(".access-select").change(function(){
        humanitarianAccessDecay.update($(this), data['accessDecay'][$(this).data('access-pk')]);
    })

    $('.ipc input').on('drop paste change input', function() {
        validateSource($(this), newData['ipc']['f']);
    });
    $('.ipc-forecasted input').on('drop paste change input', function() {
        validateSource($(this), newData['ipc-forecast']['f']);
    });
}

function validateSource(element, sourceData) {
    let prefix = element.data('prefix');
    if (!prefix) {
        return;
    }

    let id;
    let dataAttr;
    let number;

    if (prefix == 'ipc') {
        number = '';
        $('.ipc input[class="number"]').each(function() {
            number += $(this).val().trim();
        });
        dataAttr = '';
    }
    else if (prefix == 'ipc-forecast') {
        number = '';
        $('.ipc-forecasted input[class="number"]').each(function() {
            number += $(this).val().trim();
        });
        dataAttr = '';
    }
    else if (prefix.indexOf('people') == 0) {
        id = element.data('people-pk');
        dataAttr = '[data-people-pk="' + id + '"]';
        number = $('.' + prefix + dataAttr).val();
    }
    else {
        id = element.data(prefix + '-pk');
        dataAttr = '[data-' + prefix + '-pk="' + id + '"]';
        number = $('.' + prefix + '-number' + dataAttr).val();
    }

    let sourceField = $('.' + prefix + '-source' + dataAttr);
    let commentField = $('.' + prefix + '-comment' + dataAttr);

    if (number && number.trim().length > 0 && isSourceEmpty(sourceData)) {
        let warning = '<i class="fa fa-warning"></i>You have not entered a source';
        let error = '<i class="fa fa-warning"></i>Enter comment if there is no source';

        if (sourceField.next('p').length > 0) {
            sourceField.next('p').html(warning);
        } else {
            sourceField.after('<p class="warning-error">' + warning + '</p>');
            sourceField.parent().addClass('error-padding');
        }

        if (commentField.val().trim().length == 0) {
            if (commentField.next('p').length > 0) {
                commentField.next('p').html(error);
            } else {
                commentField.after('<p class="warning-error">' + error + '</p>');
                commentField.parent().addClass('error-padding');
            }
        } else {
            commentField.next('p').remove();
        }
    }
    else {
        sourceField.next('p').remove();
        commentField.next('p').remove();
        commentField.parent().removeClass('error-padding');
        sourceField.parent().removeClass('error-padding');
    }
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

    // Severity score total number of people in need
    var totalPinReported = parseInt(getNumberValue($('#people-in-need .people-total')));
    var totalPinCalculated = maxTotalPin;

    var maxPin = isNaN(totalPinReported)? totalPinCalculated: Math.max(totalPinReported, totalPinCalculated);

    var pinPercentage = (maxPin / totalPopulation) * 100;

    var pinScore = 0;
    if (!isNaN(pinPercentage)) {
        if (pinPercentage >= 1)
            pinScore = 1;
        if (pinPercentage >= 3)
            pinScore = 2;
        if (pinPercentage >= 10)
            pinScore = 3;
        $('#pin-percentage').val(Math.round(pinPercentage) +'%');
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

    $('#mortality-rate').val(Math.round(under5MortalityRate));
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

    $('#hdi').val(hdi.toFixed(3));
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
    $('#uprooted-percentage').val(Math.round(uprootedPercentage)+ "%");
    $('#uprooted-score').val(uprootedScore);

    var scores = [
        pinScore, accessScore, mortalityScore,
        hdiScore, uprootedScore
    ];

     var calculatedScore = Math.min(Math.round(findMedian(scores)), 3);
    $('#calculated-score').val(calculatedScore);

    $('#pin-percentage-score').attr('class', 'score score-'+pinScore);
    $('#level-of-access-score').attr('class', 'score score-'+accessScore);
    $('#mortality-rate-score').attr('class', 'score score-'+mortalityScore);
    $('#hdi-score').attr('class', 'score score-'+hdiScore);
    $('#uprooted-score').attr('class', 'score score-'+uprootedScore);

    $('#calculated-score').attr('class', 'score score-'+calculatedScore);
    $('#final-score').attr('class', 'score score-'+$('#final-score').val());


    totalPinReported = totalPinReported == 0? '': totalPinReported;
    //var totalHumanAffected = parseInt(getNumberValue($('#humanitarian-profile .number[data-human-pk='+severityScoreTotalPinHumanId+']')));
    // total pin in severity score
    if(isNaN(totalPinReported) && isNaN(totalPinCalculated) ){
        $('#total-pin').val('');
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
    var ipcLvl4 = +getNumberValue($('input[data-ipc-level="4"]'));
    var ipcLvl5 = +getNumberValue($('input[data-ipc-level="5"]'));
    var ipcLvl3 = +getNumberValue($('input[data-ipc-level="3"]'));

    $('.ipc-severe-calculated').val( !(isNaN(ipcLvl4) || isNaN(ipcLvl5))? (ipcLvl4+ipcLvl5): '' );
    $('.ipc-moderate-calculated').val( !isNaN(ipcLvl3)? ipcLvl3: '' );
    formatNumber($('.ipc-severe-calculated'));
    formatNumber($('.ipc-moderate-calculated'));

    let totalModerate = +getNumberValue($('.ipc-severe-calculated'));
    let totalSevere = +getNumberValue($('.ipc-moderate-calculated'));
    $('.ipc-total-calculated').val(totalModerate+totalSevere);
    formatNumber($('.ipc-total-calculated'));

}
