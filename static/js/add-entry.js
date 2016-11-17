/*
Data structure

var excerpts = [
    {
        excerpt: "",
        attributes: [
            { pillar: pid, subpillar: spid, sector: secid, subsectors: [ssecid,] },
            { pillar: pid, subpillar: spid, sector: secid, subsectors: [ssecid,] },
            { pillar: pid, subpillar: spid, sector: secid, subsectors: [ssecid,] },
        ],
        reliability: relid, severity: sevid, date: date, number: number,
        affected_groups: [ agid, agid, ... ],
        vulnerable_groups: [ vgid, vgid, ... ],
        specific_needs_groups: [ sngid, sngid, ... ],
        map_selections: [
            'CountryCode:AdminLevel:SelectionName:SelectionPcode',
            'CountryCode:AdminLevel:SelectionName',
        ],
    },
    ...
];
*/


var selectedExcerpt = -1;
var refreshing = false;


// map stuffs

function updateLocationSelections() {
    var container = $('#selected-location-list ul');
    var items = container.find('li');
    if(items){
        items.remove();
    }

    if(mapSelections.length == 0){
        $("#empty-text").show();
    } else{
        $("#empty-text").hide();
    }

    for (var i=0; i < mapSelections.length; i++) {
        var selectionKey = mapSelections[i];
        element = $('<li><a onclick="unSelect(\''+selectionKey+'\', this)"><i class="fa fa-times"></i></a>'+$('#manual-location-input')[0].selectize.options[selectionKey].text+'</li>');
        element.appendTo(container);
    }

    if (currentExcerpt) {
        currentExcerpt.map_selections = mapSelections;
        refreshCurrentEntryLists()
    }
}

function refreshLocations() {
    // TODO: Clear all from select-location.
    //mapSelections = [];
    for (var key in locations) {
        var name = locations[key];
        $('#manual-location-input')[0].selectize.addOption({value: key, text: name});
        // Add key to mapSelections array on selection and call updateLayer(key).
    }

    updateLocationSelections();
}

function unSelect(key, that){
    mapSelections.splice(mapSelections.indexOf(key), 1);
    updateLayer(key);
    $(that).closest('li').remove();
}
// ...

var selectedAffectedGroups = [];
var affectedGroupsChart;

function drawChart() {
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Name');
    data.addColumn('string', 'Manager');
    data.addColumn('string', 'ToolTip');

    // For each orgchart box, provide the name, manager, and tooltip to show.
    data.addRows(affectedGroups);

    // Create the chart.
    var chart = new google.visualization.OrgChart(document.getElementById('chart-div'));
    chart.draw(data, {
         nodeClass: 'affected-group',
         selectedNodeClass: 'active-affected-group',
    });

    // Set select listener
    google.visualization.events.addListener(chart, 'select', function(){
        var selection = chart.getSelection();

        if (selection.length == 0){
            if(mouseover_group != -1){
                selectedAffectedGroups = $.grep(selectedAffectedGroups, function(item){
                    return item.row != mouseover_group;
                })
            }
            chart.setSelection(selectedAffectedGroups);
        }
        else{
            selectedAffectedGroups.push(selection[0]);
            chart.setSelection(selectedAffectedGroups);
        }

        if (currentExcerpt) {
            currentExcerpt.affected_groups = [];
            for (var k=0; k<selectedAffectedGroups.length; ++k) {
                currentExcerpt.affected_groups.push(agRowIdMap[selectedAffectedGroups[k].row]);
            }
            refreshCurrentEntryLists();
        }
    });
    google.visualization.events.addListener(chart, 'onmouseover', function(row){
        mouseover_group = row.row;
    });
    google.visualization.events.addListener(chart, 'onmouseout', function(row){
        mouseover_group = -1;
    });

    affectedGroupsChart = chart;

    // Set default selections.
    // chart.setSelection(selected_groups);
}


// Following variables represent entry for which AffectedGroups or Map buttons were clicked
var currentExcerpt = null;  // Data
var currentEntry = null;    // Element

function refreshCurrentEntryLists() {
    // Refresh affected groups list for current excerpt
    currentEntry.find('.affected-group-list').empty();
    var text = [];
    for (var i=0; i<currentExcerpt.affected_groups.length; ++i){
        var ag = currentExcerpt.affected_groups[i];
        var title = affectedGroups[agIdRowMap[ag]][0];
        text.push(title)
    }
    currentEntry.find('.affected-group-list').html(text.join(', '));

    // Refresh map list for current excerpt
    currentEntry.find('.geo-locations-list').empty();
    text = [];
    for (var i=0; i<currentExcerpt.map_selections.length; ++i){
        var ms = currentExcerpt.map_selections[i];
        var title = ms.split(':')[2];
        text.push(title)
    }
    currentEntry.find('.geo-locations-list').html(text.join(', '));
}

function refreshPageOne() {

    // Update selection
    var sel = $("#select-excerpt");
    sel.empty();

    // sel.append($("<option value='' selected disabled>Select excerpt</option>"));
    for (var i=0; i<excerpts.length; ++i) {
        var excerpt = excerpts[i];
        var option = $("<option value='" + i + "'></option>");
        var temp = excerpt.excerpt;
        if (excerpt.excerpt.length>0 && excerpt.excerpt.length<=64){

        }
        else if (excerpt.excerpt.length>64){
            temp = temp.substr(0,64)+" . . . .";
        }
        else {
            temp= "Add Excerpt";
        }
        option.html(temp);
        option.appendTo(sel);
    }

    sel.val(selectedExcerpt);

    var excerpt = excerpts[selectedExcerpt];
    if (excerpt) {
        // Update excerpt text
        $("#excerpt-text").val(excerpt.excerpt);

        // Update attributes
        $("#matrix-one .sub-pillar").removeClass('active');
        $("#matrix-two .attribute-block").removeClass('active');
        $("#matrix-two .attribute-block").css("background-color", function(){ return $(this).data('bk-color'); });
        for (var i=0; i<excerpt.attributes.length; ++i) {
            var attribute = excerpt.attributes[i];

            if (!attribute.sector) {
                // First matrix
                $("#matrix-one")
                    .find('.sub-pillar[data-pillar-id="' + attribute.pillar + '"][data-subpillar-id="' + attribute.subpillar + '"]')
                        .addClass('active');

            } else {
                // Second matrix
                var ab = $("#matrix-two")
                    .find('.attribute-block[data-pillar-id="' + attribute.pillar + '"][data-subpillar-id="' + attribute.subpillar + '"][data-sector-id="' + attribute.sector + '"]');
                ab.addClass('active');
                ab.css('background-color', ab.data("active-bk-color"));
            }
        }
    }
}

function refreshAttributes(entry, excerpt) {
    entry.find('.attribute-list').empty();
    for (var j=0; j<excerpt.attributes.length; ++j) {
        // Get each attribute and its pillar, subpillar, sector and subsector
        var attr = excerpt.attributes[j];
        var attribute = $(".attribute-template").clone();

        attribute.removeClass('attribute-template');
        attribute.addClass('attribute');

        var pillar = pillars[attr.pillar];
        attribute.find('.pillar').html(pillar.name);
        attribute.find('.sub-pillar').html(pillar.subpillars[attr.subpillar]);

        // Sector
        if (attr.sector) {
            var sector = sectors[attr.sector];
            attribute.find('.sector').html(sector.name);

            var subsector = attribute.find('.sub-sector');
            var subsectorList = attribute.find('.sub-sector-list');
            var subsectorMenu = subsector.parent().find('.dropdown-menu');

            // Show selected subsectors
            for (var k=0; k<attr.subsectors.length; ++k) {
                var element = $('<li>' + sector.subsectors[attr.subsectors[k]] + '</li>');

                var deleteButton = $('<a href="#" class="fa fa-times"></a>');
                deleteButton.prependTo(element);
                deleteButton.width('16px');

                element.appendTo(subsectorList);

                deleteButton.unbind().click(function(attr, k, entry, excerpt) {
                    return function() {
                        attr.subsectors.splice(k, 1);
                        refreshAttributes(entry, excerpt);
                    }
                }(attr, k, entry, excerpt));
            }

            var hasMenu = false;
            // Create subsector menu
            for (var ss in sector.subsectors) {
                if (!inArray(attr.subsectors, ss)) {
                    hasMenu = true;

                    var element = ($('<li><a>' + sector.subsectors[ss] + '</a></li>'));
                    element.appendTo(subsectorMenu);
                    element.unbind().click(function(attr, ss, sector, subsector, entry, excerpt) {
                        return function() {
                            attr.subsectors.push(ss);
                            refreshAttributes(entry, excerpt);
                        }
                    }(attr, ss, sector, subsector, entry, excerpt));
                }
            }

            if (hasMenu)
                subsector.html("Add subsector");
        }
        // If there is not sector, hide the div tag containing the sector/subsector
        else {
            attribute.find('.sector').closest('div').html("");
        }

        attribute.appendTo(entry.find('.attribute-list'));
        attribute.show();
    }
}

function refreshPageTwo() {
    var entriesContainer = $("#entries");
    entriesContainer.empty();
    for (var i=0; i<excerpts.length; ++i) {
        var excerpt = excerpts[i];

        var entry = $(".entry-template").clone();
        entry.removeClass("entry-template");
        entry.addClass("entry");
        entry.data('entry-id', i);

        // Load values
        entry.find('.excerpt').val(excerpt.excerpt);
        entry.find('.entry-date').val(excerpt.date);
        entry.find('.entry-number').val(excerpt.number);

        entry.find('.vulnerable-group-select').val(excerpt.vulnerable_groups);
        entry.find('.vulnerable-group-select').selectize();
        entry.find('.specific-need-group-select').val(excerpt.specific_needs_groups);
        entry.find('.specific-need-group-select').selectize();

        entry.find('.reliability span[data-id="' + excerpt.reliability + '"]').addClass('active');
        entry.find('.severity span[data-id="' + excerpt.severity + '"]').addClass('active');

        refreshAttributes(entry, excerpt);

        // Affected groups selections
        entry.find('.btn-affected').unbind().click(function(excerpt, entry) {
            return function() {
                currentExcerpt = excerpt;
                currentEntry = entry;
                selectedAffectedGroups = [];
                for (var k=0; k<excerpt.affected_groups.length; ++k) {
                    selectedAffectedGroups.push({column: null, row: agIdRowMap[excerpt.affected_groups[k]]});
                }
                affectedGroupsChart.setSelection(selectedAffectedGroups);
            }
        }(excerpt, entry));

        // Map selections
        entry.find('.btn-map').unbind().click(function(excerpt, entry) {
            return function() {
                currentExcerpt = excerpt;
                currentEntry = entry;
                mapSelections = excerpt.map_selections;
                refreshMap();
            }
        }(excerpt, entry));

        // Edit and delete buttons
        entry.find('.edit-entry-btn').unbind().click(function(i) {
            return function() {
                selectedExcerpt = i;
                $('#back-to-excerpts-btn').click();
            }
        }(i));
        entry.find('.delete-entry-btn').unbind().click(function(i) {
            return function() {
                selectedExcerpt = i;
                deleteExcerpt();
            }
        }(i));

        entry.appendTo(entriesContainer);
        entry.show();

        // Refresh lists as well
        currentEntry = entry;
        currentExcerpt = excerpt;
        refreshCurrentEntryLists();

        currentEntry = null;
        currentExcerpt = null;
    }

    addTodayButtons();
    $('.excerpt').change();
}

function refreshExcerpts() {
    if (refreshing)
        return;

    // Make sure an excerpt is selected
    if (selectedExcerpt < 0) {
        if (excerpts.length > 0) {
            selectedExcerpt = 0;
        } else {
            addExcerpt("");
            return;
        }
    }

    refreshing = true;

    refreshPageOne();
    refreshPageTwo();

    refreshing = false;
}


function addExcerpt(excerpt) {
    // Create new excerpt and refresh
    var excerpt = {
        excerpt: excerpt,
        attributes: [],
        reliability: defaultReliability, severity: defaultSeverity,
        date: defaultDate, number: null,
        affected_groups: [], vulnerable_groups: [], specific_needs_groups: [],
        map_selections: []
    };
    excerpts.push(excerpt);

    selectedExcerpt = excerpts.length - 1;
    refreshExcerpts();
}

function deleteExcerpt() {
    if (selectedExcerpt < 0 || selectedExcerpt >= excerpts.length)
        return;

    // Delete selected excerpt and refresh
    excerpts.splice(selectedExcerpt, 1);

    if (selectedExcerpt >= excerpts.length)
        selectedExcerpt--;
    refreshExcerpts();
}


function styleText(text) {
    return "<div>" + text + "</div>";
}

function changeLeadPreview(simplified) {
    isSimplified = simplified;
    var frame = $("#lead-preview");
    var simplifiedFrame = $("#lead-simplified-preview");

    if (simplified) {
        simplifiedFrame.html(styleText(leadSimplified));

        simplifiedFrame.css("display", "inherit");
        frame.css("display", "none");
        $(".btn-zoom").show();
    }
    else {
        simplifiedFrame.css("display", "none");
        frame.css("display", "inherit");
        selectedTags = {};
        $(".btn-zoom").hide();
    }
}


$(document).ready(function(){

    google.charts.load('current', {packages:["orgchart"]});
    google.charts.setOnLoadCallback(drawChart);

    // Map
    drawMap();
    $('#country').selectize();
    $('#manual-location-input').selectize();
    $("#manual-location-input").change(function(){
        var key = $("#manual-location-input").val();
        //mapSelections.push(key);
        if( !inArray(mapSelections, key) ){
            container = $('#selected-location-list').find('ul');
            element = $('<li><a onclick="unSelect(\''+key+'\', this)"><i class="fa fa-times"></i></a>'+$("#manual-location-input option:selected").text()+'</li>');
            element.appendTo(container);
            mapSelections.push(key);
        }
        updateLayer(key);

        $("#manual-location-input")[0].selectize.clear(true);

    });
    $("#country").trigger('change');

    // Split screen for preview
    $('.split-pane').splitPane();

    // Change lead preview
    $('div.split-pane').splitPane();
    $('input[type=radio][name=lead-view-option]').change(function() {
        changeLeadPreview(this.value=='simplified');
    });
    changeLeadPreview(leadSimplified!="");

    // Zoom buttons
    $('#zoom-in').click(function(){

        var font_size=$("#lead-preview-container").css('font-size');
        font_size=parseInt(font_size)+1+'px';
        $("#lead-preview-container").css('font-size',font_size);
    });

    $('#zoom-out').click(function(){

        var font_size=$("#lead-preview-container").css('font-size');
        font_size=parseInt(font_size)-1+'px';
        $("#lead-preview-container").css('font-size',font_size);
    });

    // Navigation buttons between pages
    $('#edit-entries-btn').on('click', function(){
        refreshExcerpts();
        $('#page-one').fadeOut(function(){
            $('#page-two').fadeIn();
            $('.excerpt').change();
        });
    });
    $('#back-to-excerpts-btn').on('click', function(){
        refreshExcerpts();
        $('#page-two').fadeOut(function(){
            $('#page-one').fadeIn();
        });
    });

    // Page 1

    // Matrix one selection of attribute
    $('#matrix-one .sub-pillar').click(function(){
        var parent = $(this).closest('.pillar');

        if ($(this).hasClass('active')){
            $(this).removeClass('active');

            if (excerpts[selectedExcerpt]) {
                // Remove the attribute
                var subpillar = $(this);
                var index = excerpts[selectedExcerpt].attributes.findIndex(function(attr){
                    return attr.pillar == subpillar.data('pillar-id')
                        && attr.subpillar == subpillar.data('subpillar-id');
                });
                if (index >= 0)
                    excerpts[selectedExcerpt].attributes.splice(index, 1);
            }
        }
        else {
            $(this).addClass('active');

            if (excerpts[selectedExcerpt]) {
                // Add new attribute
                excerpts[selectedExcerpt].attributes.push({
                    pillar: $(this).data('pillar-id'),
                    subpillar: $(this).data('subpillar-id'),
                    sector: null, subsectors: []
                });
            }
        }
    });

    // Drag drop
    var dropEvent = function(e) {
        var text = e.originalEvent.dataTransfer.getData('Text');
        if (excerpts[selectedExcerpt].excerpt.trim().length == 0
                || excerpts[selectedExcerpt].excerpt == text)
            excerpts[selectedExcerpt].excerpt = e.originalEvent.dataTransfer.getData('Text');
        else
            addExcerpt(e.originalEvent.dataTransfer.getData('Text'));

        $(this).click();
        refreshExcerpts();
        return false;
    };

    $("#matrix-one .sub-pillar").bind('dragover', function(e) {
        e.originalEvent.preventDefault();
        return false;
    });
    $("#matrix-one .sub-pillar").bind('drop', dropEvent);

    // Matrix two selection of attribute
    $('#matrix-two .attribute-block').click(function(){
        if ($(this).hasClass('active')){
            $(this).removeClass('active');

            // Color
            $(this).css("background-color", $(this).data('bk-color'));

            if (excerpts[selectedExcerpt]) {
                // Remove the attribute
                var block = $(this);
                var index = excerpts[selectedExcerpt].attributes.findIndex(function(attr){
                    return attr.pillar == block.data('pillar-id')
                        && attr.subpillar == block.data('subpillar-id')
                        && attr.sector == block.data('sector-id');
                });
                if (index >= 0)
                    excerpts[selectedExcerpt].attributes.splice(index, 1);
            }
        }
        else {
            $(this).addClass('active');

            // Color
            $(this).css("background-color", $(this).data('active-bk-color'));

            if (excerpts[selectedExcerpt]) {
                // Add new attribute
                excerpts[selectedExcerpt].attributes.push({
                    pillar: $(this).data('pillar-id'),
                    subpillar: $(this).data('subpillar-id'),
                    sector: $(this).data('sector-id'), subsectors: []
                });
            }
        }
    });
    // Matrix-two default color
    $("#matrix-two .attribute-block").css("background-color", function(){ return $(this).data('bk-color'); });

    // Drag drop
    $("#matrix-two .attribute-block").bind('dragover', function(e) {
        e.originalEvent.preventDefault();
        return false;
    });
    $("#matrix-two .attribute-block").bind('drop', dropEvent);

    // Add, remove and refresh excerpts
    $("#add-excerpt").unbind().click(function() {
        addExcerpt("");
    });
    $("#delete-excerpt").unbind().click(function() {
        deleteExcerpt();
    });
    $("#select-excerpt").change(function() {
        selectedExcerpt = $(this).val();
        refreshExcerpts();
    });
    refreshExcerpts();

    // Excerpt text handler
    $("#excerpt-text").on('input paste drop change', function() {
        excerpts[selectedExcerpt].excerpt = $(this).val();
        refreshExcerpts();
    });

    // Page 2

    // Excerpt, date and number
    $(document).on('input paste drop change', '.entry .excerpt', function() {
        var excerpt = excerpts[parseInt($(this).closest('.entry').data('entry-id'))];
        excerpt.excerpt = $(this).val();

        var excerptDom = $(this)[0];
        excerptDom.style.height = '1px';
        excerptDom.style.height = (20+excerptDom.scrollHeight)+'px';
    });
    $(document).on('input paste drop change', '.entry .entry-date', function() {
        var excerpt = excerpts[parseInt($(this).closest('.entry').data('entry-id'))];
        excerpt.date = $(this).val();
    });
    $(document).on('input paste drop change', '.entry .entry-number', function() {
        var excerpt = excerpts[parseInt($(this).closest('.entry').data('entry-id'))];
        excerpt.number = $(this).val();
    });

    // Reliability and severity selection
    $(document).on('click', '.entry .reliability span', function(){
        $(this).closest('.reliability').find('span').removeClass('active');
        $(this).addClass('active');

        var excerpt = excerpts[parseInt($(this).closest('.entry').data('entry-id'))];
        excerpt.reliability = $(this).data("id");
    });

    $(document).on('click', '.entry .severity span', function(){
        $(this).closest('.severity').find('span').removeClass('active');
        $(this).addClass('active');

        var excerpt = excerpts[parseInt($(this).closest('.entry').data('entry-id'))];
        excerpt.severity = $(this).data("id");
    });

    // Vulnerable group and specific needs group
    $(document).on('change', '.entry .vulnerable-group-select', function(){
        var excerpt = excerpts[parseInt($(this).closest('.entry').data('entry-id'))];
        excerpt.vulnerable_groups = $(this).val();
    });
    $(document).on('change', '.entry .specific-need-group-select', function(){
        var excerpt = excerpts[parseInt($(this).closest('.entry').data('entry-id'))];
        excerpt.specific_needs_groups = $(this).val();
    });

    // Apply to all buttons
    $("#apply-all-affected").unbind().click(function() {
        for (var i=0; i<excerpts.length; ++i) {
            var excerpt = excerpts[i];
            excerpt.affected_groups = [];
            for (var k=0; k<selectedAffectedGroups.length; ++k) {
                excerpt.affected_groups.push(agRowIdMap[selectedAffectedGroups[k].row]);
            }
        }
        refreshExcerpts();
    });

    $("#apply-all-map").unbind().click(function() {
        for (var i=0; i<excerpts.length; ++i) {
            var excerpt = excerpts[i];
            excerpt.map_selections = mapSelections;
        }
        refreshExcerpts();
    });


    // Save and cancel

    $('.save-excerpt').unbind().click(function() {
        var data = { excerpts: JSON.stringify(excerpts) };
        redirectPost(window.location.pathname, data, csrf_token);
    });
    $('.cancel').unbind().click(function() {
        window.location.href = cancelUrl;
    });

    refreshExcerpts();
});
