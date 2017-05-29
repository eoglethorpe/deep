/*
Data structure

var excerpts = [
    {
        excerpt: "",
        image: "",
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
        bob: false
    },
    ...
];
*/

var mapModal = null;
var affectedGroupsModal = null;

var selectedExcerpt = -1;
var refreshing = false;

// map stuffs

function updateLocationSelections() {
    var container = $('#selected-location-list ul');
    var items = container.find('li');
    if(items){
        items.remove();
    }

    if(mapSelections.length === 0){
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
        refreshCurrentEntryLists();
    }
}

function refreshLocations() {
    // TODO: Clear all from select-location.
    //mapSelections = [];
    for (var key in locations) {
        var name = locations[key];
        $('#manual-location-input')[0].selectize.addOption({value: key, text: name});
        // if(key.includes(':0:')){
        //     $('#manual-location-input')[0].selectize.setValue(key);
        // }
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

        if (selection.length === 0) {
            if(mouseover_group != -1){
                selectedAffectedGroups = $.grep(selectedAffectedGroups, function(item){
                    return item.row != mouseover_group;
                });
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
var currentExcerptId = -1;  // Id
var currentExcerpt = null;  // Data
var currentEntry = null;    // Element

function refreshCurrentEntryLists() {
    // Refresh affected groups list for current excerpt
    currentEntry.find('.affected-group-list').empty();
    var text = [];
    for (var i=0; i<currentExcerpt.affected_groups.length; ++i){
        var ag = currentExcerpt.affected_groups[i];
        var title = affectedGroups[agIdRowMap[ag]][0];
        text.push(title);
    }
    if(text.length !== 0){
        currentEntry.find('.affected-group-list').html('<span>'+text.join('</span><span>')+'</span>');
    }

    // Refresh map list for current excerpt
    currentEntry.find('.geo-locations-list').empty();
    text = [];
    for (var i=0; i<currentExcerpt.map_selections.length; ++i){
        var ms = currentExcerpt.map_selections[i];
        var title = ms.split(':')[2];
        text.push(title);
    }
    if(text.length != 0){
        currentEntry.find('.geo-locations-list').html('<span>'+text.join('</span><span>')+'</span>');
    }
}

function refreshPageOne() {
    // Update lead preview
    var simplifiedFrame = $("#lead-simplified-preview");
    simplifiedFrame.html(styleText(leadSimplified));

    // Update selection
    var sel = $("#select-excerpt");
    sel.empty();

    // sel.append($("<option value='' selected disabled>Select excerpt</option>"));
    for (var i=0; i<excerpts.length; ++i) {
        var excerpt = excerpts[i];
        var option = $("<option value='" + i + "'></option>");
        var temp = excerpt.excerpt;
        if (excerpt.excerpt.length>0 && excerpt.excerpt.length<=100){

        }
        else if (excerpt.excerpt.length>100){
            temp = temp.substr(0,72)+"...";
        }
        else if (excerpt.image.length > 0) {
            temp = 'Image';
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

        // Upate excerpt image
        if (excerpt.image.length == 0) {
            $('#excerpt-image-container').html('');
        } else {
            $('#excerpt-image-container').html(
                '<div class="image"><img src="' + excerpt.image + '"></div>'
            );
        }

        if (excerpt.image.length != 0 && excerpt.excerpt.length == 0) {
            $("#excerpt-text").attr('disabled', true);
            $('#excerpt-image-container').attr('disabled', false);
        } else {
            $("#excerpt-text").attr('disabled', false);
            $('#excerpt-image-container').attr('disabled', true);
        }

        // Best of bullshit
        if (excerpt.bob) {
            $('#best-of-bullshits').addClass('active');
        } else {
            $('#best-of-bullshits').removeClass('active');
        }

        // Update attributes
        $("#matrix-one .sub-pillar").removeClass('active');
        $("#matrix-two .attribute-block").removeClass('active');
        $("#matrix-two .attribute-block").css("background-color", function(){ return $(this).data('bk-color'); });
        $("#matrix-two .attribute-block").css("color", function(){ return $(this).data('bk-color'); });

        for (var i=0; i<excerpt.attributes.length; ++i) {
            var attribute = excerpt.attributes[i];

            if (!attribute.sector) {
                // First matrix
                var ss = $("#matrix-one")
                    .find('.sub-pillar[data-pillar-id="' + attribute.pillar + '"][data-subpillar-id="' + attribute.subpillar + '"]');
                ss.addClass('active');
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
                var element = $('<div>' + sector.subsectors[attr.subsectors[k]] + '</div>');

                var deleteButton = $('<a class="fa fa-times"></a>');
                deleteButton.prependTo(element);
                deleteButton.width('16px');

                element.appendTo(subsectorList);

                deleteButton.click(function(attr, k, entry, excerpt) {
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

                    var element = ($('<a>' + sector.subsectors[ss] + '</a>'));
                    element.appendTo(subsectorMenu);
                    element.click(function(attr, ss, sector, subsector, entry, excerpt) {
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
        //attribute.show();
    }
}

function reformatCurrentExcerpt() {
    var text = $('#excerpt-text').val();
    $('#excerpt-text').val(reformatText(text));
    $('#excerpt-text').trigger('change');
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
        if(excerpt.image.length == 0){
            entry.find('.excerpt-text').val(excerpt.excerpt);
            entry.find('.excerpt-image').hide();
            entry.find('.excerpt-text').show();
        } else{
            entry.find('.excerpt-image').attr('src', excerpt.image)
            entry.find('.excerpt-text').hide();
            entry.find('.excerpt-image').show();
        }
        entry.find('.entry-date').val(excerpt.date);
        entry.find('.entry-number').val(excerpt.number);

        entry.find('.vulnerable-group-select').val(excerpt.vulnerable_groups);
        entry.find('.vulnerable-group-select').selectize({plugins: ['remove_button']});
        entry.find('.specific-need-group-select').val(excerpt.specific_needs_groups);
        entry.find('.specific-need-group-select').selectize({plugins: ['remove_button']});

        entry.find('.reliability span[data-id="' + excerpt.reliability + '"]').addClass('active');
        entry.find('.severity span[data-id="' + excerpt.severity + '"]').addClass('active');

        refreshAttributes(entry, excerpt);

        // Apply to all buttons
        entry.find('.btn-date-apply-to-all').click(function(i) {
            return function() {
                var date = excerpts[i].date;
                for (var d=0; d<excerpts.length; d++) {
                    excerpts[d].date = date;
                }
                refreshPageTwo();
            }
        }(i));
        entry.find('.btn-date-apply-to-all-below').click(function(i) {
            return function() {
                var date = excerpts[i].date;
                for (var d=i+1; d<excerpts.length; d++) {
                    excerpts[d].date = date;
                }
                refreshPageTwo();
            }
        }(i));
        entry.find('.btn-demographic-apply-to-all').click(function(i) {
            return function() {
                var vg = excerpts[i].vulnerable_groups;
                for (var d=0; d<excerpts.length; d++) {
                    excerpts[d].vulnerable_groups = vg;
                }
                refreshPageTwo();
            }
        }(i));
        entry.find('.btn-demographic-apply-to-all-below').click(function(i) {
            return function() {
                var vg = excerpts[i].vulnerable_groups;
                for (var d=i+1; d<excerpts.length; d++) {
                    excerpts[d].vulnerable_groups = vg;
                }
                refreshPageTwo();
            }
        }(i));
        entry.find('.btn-specific-needs-apply-to-all').click(function(i) {
            return function() {
                var sg = excerpts[i].specific_needs_groups;
                for (var d=0; d<excerpts.length; d++) {
                    excerpts[d].specific_needs_groups = sg;
                }
                refreshPageTwo();
            }
        }(i));
        entry.find('.btn-specific-needs-apply-to-all-below').click(function(i) {
            return function() {
                var sg = excerpts[i].specific_needs_groups;
                for (var d=i+1; d<excerpts.length; d++) {
                    excerpts[d].specific_needs_groups = sg;
                }
                refreshPageTwo();
            }
        }(i));

        // Edit and delete buttons
        entry.find('.edit-entry-btn').click(function(i) {
            return function() {
                selectedExcerpt = i;
                $('#back-to-excerpts-btn').click();
            }
        }(i));
        entry.find('.delete-entry-btn').click(function(i) {
            return function() {
                selectedExcerpt = i;
                deleteExcerpt();
            }
        }(i));

        // Map selections
        entry.find('.map-modal-btn').click(function(excerpt, entry, i) {
            return function() {
                currentExcerptId = i;
                currentExcerpt = excerpt;
                currentEntry = entry;
                mapSelections = excerpt.map_selections;
                mapModal.show().then(function(){
                    //
                }, null, function(){
                    map.invalidateSize();
                    refreshMap();
                });
            }
        }(excerpt, entry, i));

        // Affected group selection
        entry.find('.affected-groups-modal-btn').click(function(excerpt, entry, i) {
            return function() {
                currentExcerptId = i;
                currentExcerpt = excerpt;
                currentEntry = entry;
                selectedAffectedGroups = [];
                for (var k=0; k<excerpt.affected_groups.length; ++k) {
                    selectedAffectedGroups.push({column: null, row: agIdRowMap[excerpt.affected_groups[k]]});
                }
                affectedGroupsChart.setSelection(selectedAffectedGroups);
                affectedGroupsModal.show().then(function(){

                });
            }
        }(excerpt, entry, i));

        entry.appendTo(entriesContainer);
        entry.show();

        // Refresh lists as well
        currentExcerptId = i;
        currentEntry = entry;
        currentExcerpt = excerpt;
        refreshCurrentEntryLists();

        currentExcerptId = -1;
        currentEntry = null;
        currentExcerpt = null;

    }
    $('.excerpt-text').change();
}

function refreshExcerpts() {
    if (refreshing)
        return;

    // Make sure an excerpt is selected
    if (selectedExcerpt < 0) {
        if (excerpts.length > 0) {
            selectedExcerpt = 0;
        } else {
            addExcerpt('', '');
            return;
        }
    }

    refreshing = true;

    refreshPageOne();
    refreshPageTwo();

    refreshing = false;
}


function addExcerpt(text, image) {
    text = reformatText(text);

    // Create new excerpt and refresh
    var excerpt = {
        excerpt: text,
        image: image,
        attributes: [],
        reliability: defaultReliability, severity: defaultSeverity,
        date: defaultDate, number: null,
        affected_groups: [], vulnerable_groups: [], specific_needs_groups: [],
        map_selections: [],
        bob: false
    };
    excerpts.push(excerpt);

    selectedExcerpt = excerpts.length - 1;
    refreshExcerpts();
}

function addOrReplaceExcerpt(text, image) {
    let index = findExcerpt(text, image);
    if (index >= 0) {
        replaceExcerpt(index, text, image);
    }
    else if (checkExcerptEmpty(selectedExcerpt)) {
        replaceExcerpt(selectedExcerpt, text, image);
    }
    else {
        addExcerpt(text, image);
    }
}

function checkExcerptEmpty(index) {
    return (
        (excerpts[index].excerpt.trim().length == 0) &&
        (excerpts[index].image.trim().length == 0)
    );
}

function findExcerpt(text, image) {
    for (let i=0; i<excerpts.length; i++) {
        if (excerpts[i].excerpt == text && excerpts[i].image == image) {
            return i;
        }
    }
    return -1;
}

function replaceExcerpt(index, text, image) {
    excerpts[index].excerpt = text;
    excerpts[index].image = image;
    selectedExcerpt = index;
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
    for (var i=0; i<excerpts.length; ++i) {
        var excerpt = excerpts[i].excerpt;
        // text = highlighter.highlightHtml(text, excerpt, 'style="background-color:#ccc;"');

        // Search for this excerpt
        var index = text.indexOf(excerpt);
        var color = "#ccc";
        if (index >= 0) {
            // Create highlighting tag for this search
            if (excerpts[i].bob) {
                color = '#e04696';
            }
            else if (excerpts[i].attributes && excerpts[i].attributes.length > 0) {
                color = pillars[excerpts[i].attributes[0].pillar].bgColor;
            }

            text = text.slice(0, index) + '<span style="background-color:'+ color +'; color:'+ getContrastYIQ(color) +'" >'
                + excerpt + '</span>'
                + text.slice(index+excerpt.length)
        }
    }

    // return "<div>" + text.replace(/\n/g, "<br>"); + "</div>";
    return "<pre>" + text + "</pre>";
}

function sortLeadImages(sortType){
    let imageContainer = $('#lead-images-container');
    var imageList = imageContainer.find('.image').get();
    imageList.sort(function(a,b){
        let imgA = $(a).find('img');
        let imgB = $(b).find('img');

        if(sortType == 'asc'){
            return imgA[0].naturalWidth*imgA[0].naturalHeight - imgB[0].naturalWidth*imgB[0].naturalHeight;
        } else if(sortType == 'dsc'){
            return imgB[0].naturalWidth*imgB[0].naturalHeight - imgA[0].naturalWidth*imgA[0].naturalHeight;
        } else{
            return parseInt(imgA.data('default-order')) - parseInt(imgB.data('default-order'));
        }
    });
    $.each(imageList, function(index, item){ imageContainer.append(item); });
}

function changeLeadPreview(type) {
    isSimplified = (type == "simplified");
    var originalFrame = $("#lead-preview");
    var simplifiedFrame = $("#lead-simplified-preview");
    var imagesFrame = $("#lead-images-preview");

    if (type == 'simplified') {
        simplifiedFrame.css("display", "inherit");
        originalFrame.css("display", "none");
        imagesFrame.css("display", "none");
        $('#sort-images-wrapper').hide();
        $("#zoom-buttons").show();
        $('#screenshot-btn').hide();
    }
    else if (type == 'original') {
        simplifiedFrame.css("display", "none");
        originalFrame.css("display", "inherit");
        imagesFrame.css("display", "none");
        selectedTags = {};
        $('#sort-images-wrapper').hide();
        $("#zoom-buttons").hide();
        $('#screenshot-btn').show();

    }
    else if (type == 'images') {
        simplifiedFrame.css("display", "none");
        originalFrame.css("display", "none");
        imagesFrame.css("display", "inherit");
        $('#sort-images-wrapper').show();
        $("#zoom-buttons").show();
        $('#screenshot-btn').hide();
    }
}

function getScreenshot(){
    let extensionId = 'ggplhkhciodfdkkonmhgniaopboeoopi';

    chrome.runtime.sendMessage(extensionId, { msg: 'screenshot' }, function(response){
        if(!response){
            alert('Please install chrome extension for DEEP to use this feature');
        } else if(response.image){
            let img = new Image();
            img.onload = function(){
                $('#image-cropper-canvas-container').show();
                let imageCropper = new ImageCropper('image-cropper-canvas', this, {x: 0, y: 104, w: $('#image-cropper-canvas').innerWidth()-12, h: $('#image-cropper-canvas').innerHeight()-12});
                imageCropper.start();
                $('#screenshot-cancel-btn').one('click', function(){
                    imageCropper.stop();
                    $('#image-cropper-canvas-container').hide();
                });
                $('#screenshot-done-btn').one('click', function(){
                    addOrReplaceExcerpt('', imageCropper.getCroppedImage());
                    imageCropper.stop();
                    $('#image-cropper-canvas-container').hide();
                });
            }
            img.src = response.image;
        }

    });
}

function resizeCanvas(){
    $('#image-cropper-canvas-container').width(function(){
        return $(this).parent().innerWidth();
    });
    $('#image-cropper-canvas-container').height($(window).height()-50);
}

$(document).ready(function(){
    mapModal = new Modal('#map-modal', true);
    affectedGroupsModal = new Modal('#affected-groups-modal');

    $('#screenshot-btn').click(function(){
        getScreenshot();
    })

    resizeCanvas();

    // subsector dropdown menu
    $('#entries').on('click','.dropdown', function(){
        $(this).find('.dropdown-menu').toggle();
    });
    $('#entries').on('blur', '.dropdown', function(){
        $(this).find('.dropdown-menu').hide();
    });

    // simplified/original lead tab
    $('input[type=radio][name=lead-view-option]').change(function(){
        $('#lead-view-options label').removeClass('active');
        $(this).closest('label').addClass('active');
    });

    $('#matrix-two .pillar-header').each(function(i){
        $(this).css('color', getContrastYIQ( $(this).data('bg-color') ) );
    });
    $('#matrix-two .subpillar').each(function(i){
        $(this).css('color', getContrastYIQ( $(this).data('bg-color') ) );
    });

    google.charts.load('current', {packages:["orgchart"]});
    google.charts.setOnLoadCallback(drawChart);

    // Processed after scroll hits bottom
    let leadSimplifiedPageScrollDeltaY = 0;
    let leadSimplifiedPageLastScrollY = -1;
    $('#lead-simplified-preview').on('scroll', function() {
        if(leadSimplifiedPageLastScrollY != -1){
            leadSimplifiedPageScrollDeltaY = $(this).scrollTop() - leadSimplifiedPageLastScrollY;
        }
        leadSimplifiedPageLastScrollY = $(this).scrollTop();

        if($('#lead-simplified-preview').scrollTop() + $('#lead-simplified-preview').height() > $('#lead-simplified-preview pre').height()) {

            if(!(excerpts.length == 1 && checkExcerptEmpty(0)) && $('#pending-button').is(':visible') && leadSimplifiedPageScrollDeltaY > 0){
                $.post(markProcessedUrl, {
                    id: leadId,
                    status: 'PRO',
                }).done(function() {
                    $('#pending-button').click();
                    // $('#pending-button').hide();
                    // $('#process-button').show();
                    $('#lead-simplified-preview').off('scroll');
                });
            }
        }
    });

    var imageWidth;
    $('#lead-images-preview').on('click', '.image', function(){
        var source = $(this).find('img').attr('src');
        $('.image-viewer img').attr('src', source);
        $('.image-viewer').show();
        imageWidth = $("#lead-images-preview .image-viewer img").width();
    });
    $('#lead-images-preview .viewer-close-btn').click(function(){
        $("#lead-images-preview .image-viewer img").width(imageWidth);
        $('.image-viewer').hide();
    });

    //Image Viewer Main
    $('#excerpt-image-container').on('click','.image',function(){
        var source = $(this).find('img').attr('src');
        $('.image-viewer-main img').attr('src', source);
        $('.image-viewer-main').show();
    });
    $('.viewer-close-btn-main').click(function(){
        $('.image-viewer-main').hide();
    });

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
    $('.split-pane').on('splitpaneresize',function(){
        var width = $('#left-component').width();
        $('.image-viewer').width(width);
        width = width-48;
        $('.image-viewer .image-wrapper img').width(width);
        resizeCanvas();
    });

    // Change lead preview
    $('div.split-pane').splitPane();
    $('input[type=radio][name=lead-view-option]').change(function() {
        changeLeadPreview(this.value);
    });
    changeLeadPreview(leadSimplified!=""?"simplified":"original");

    // Zoom buttons
    $('#zoom-in').click(function(){
        if($('input[type="radio"][name=lead-view-option]:checked').val() == 'simplified'){
            var fontSize = $("#lead-preview-container").css('font-size');
            fontSize=parseInt(fontSize)+1+'px';
            $("#lead-preview-container").css('font-size',fontSize);
        }
        else if (($('input[type="radio"][name=lead-view-option]:checked').val() == 'images') && $('.image-viewer').is(':visible')) {
            let imageWidth = $("#lead-images-preview .image-viewer img").width();
            imageWidth=parseInt(imageWidth)*1.1+'px';
            $("#lead-images-preview .image-viewer img").css('width',imageWidth);
        }
    });
    $('#zoom-out').click(function(){
        if($('input[type="radio"][name=lead-view-option]:checked').val() == 'simplified'){
            var fontSize=$("#lead-preview-container").css('font-size');
            fontSize=parseInt(fontSize)-1+'px';
            $("#lead-preview-container").css('font-size',fontSize);
        }
        else if (($('input[type="radio"][name=lead-view-option]:checked').val() == 'images') && $('.image-viewer').is(':visible')) {
            let imageWidth = $("#lead-images-preview .image-viewer img").width();
            imageWidth=parseInt(imageWidth)*0.9+'px';
            $("#lead-images-preview .image-viewer img").css('width',imageWidth);
        }
    });

    // Navigation buttons between pages
    $('#edit-entries-btn').on('click', function(){
        refreshExcerpts();
        $('#page-one').fadeOut(function(){
            $('#page-two').fadeIn(function(){
                addTodayButtons();
            });
            $('.excerpt-text').change();
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

        var simplifiedFrame = $("#lead-simplified-preview");
        simplifiedFrame.html(styleText(leadSimplified));
    });

    // BOB selection
    $('#best-of-bullshits').click(function() {
        if ($(this).hasClass('active')) {
            $(this).removeClass('active');

            if (excerpts[selectedExcerpt]) {
                excerpts[selectedExcerpt].bob = false;
            }
        }
        else {
            $(this).addClass('active');

            if (excerpts[selectedExcerpt]) {
                excerpts[selectedExcerpt].bob = true;
            }
        }

        var simplifiedFrame = $("#lead-simplified-preview");
        simplifiedFrame.html(styleText(leadSimplified));
    });

    // Drag drop
    var dropEvent = function(e) {
        let html = e.originalEvent.dataTransfer.getData('text/html');
        let text = e.originalEvent.dataTransfer.getData('Text');
        let image = '';
        if ($(html).is('img')) {
            image = text;
            text = '';
        }

        addOrReplaceExcerpt(text, image);

        $(this).click();
        refreshExcerpts();
        window.getSelection().removeAllRanges();
        return false;
    };

    $("#matrix-one .sub-pillar, #best-of-bullshits").bind('dragover', function(e) {
        e.originalEvent.preventDefault();
        return false;
    });
    $("#matrix-one .sub-pillar").bind('drop', dropEvent);
    $('#best-of-bullshits').bind('drop', dropEvent);

    // Matrix-one default color
    $("#matrix-one .sub-pillar").css("background-color", function(){ return $(this).data('bk-color'); });

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

        var simplifiedFrame = $("#lead-simplified-preview");
        simplifiedFrame.html(styleText(leadSimplified));
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
    $("#add-excerpt").click(function() {
        addExcerpt('', '');
    });
    $("#delete-excerpt").click(function() {
        deleteExcerpt();
    });
    $("#select-excerpt").change(function() {
        selectedExcerpt = $(this).val();
        refreshExcerpts();
    });
    refreshExcerpts();

    // Excerpt text handler
    $("#excerpt-text").on('change input keyup', function() {
        excerpts[selectedExcerpt].excerpt = $(this).val();
        refreshExcerpts();
    });
    $("#excerpt-text").on('paste drop', function() {
        excerpts[selectedExcerpt].excerpt = reformatText($(this).val());
        refreshExcerpts();
    });

    // Page 2

    // Excerpt, date and number
    $(document).on('input paste drop change', '.entry .excerpt-text', function() {
        var excerpt = excerpts[parseInt($(this).closest('.entry').data('entry-id'))];
        excerpt.excerpt = $(this).val();

        var excerptDom = $(this)[0];
        excerptDom.style.height = '1px';
        excerptDom.style.height = (2+excerptDom.scrollHeight)+'px';
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
    $("#apply-all-affected").click(function() {
        for (var i=0; i<excerpts.length; ++i) {
            var excerpt = excerpts[i];
            excerpt.affected_groups = [];
            for (var k=0; k<selectedAffectedGroups.length; ++k) {
                excerpt.affected_groups.push(agRowIdMap[selectedAffectedGroups[k].row]);
            }
        }
        refreshExcerpts();
    });
    $("#apply-next-affected").click(function() {
        if (currentExcerptId < 0)
            return;
        for (var i=currentExcerptId; i<excerpts.length; ++i) {
            var excerpt = excerpts[i];
            excerpt.affected_groups = [];
            for (var k=0; k<selectedAffectedGroups.length; ++k) {
                excerpt.affected_groups.push(agRowIdMap[selectedAffectedGroups[k].row]);
            }
        }
        refreshExcerpts();
    });
    $("#clear-map-selections").click(function() {
        mapSelections = [];
        refreshMap();
    });
    $("#apply-all-map").click(function() {
        for (var i=0; i<excerpts.length; ++i) {
            var excerpt = excerpts[i];
            excerpt.map_selections = mapSelections.slice();
        }
        refreshExcerpts();
    });
    $("#apply-next-map").click(function() {
        if (currentExcerptId < 0)
            return;
        for (var i=currentExcerptId; i<excerpts.length; ++i) {
            var excerpt = excerpts[i];
            excerpt.map_selections = mapSelections.slice();
        }
        refreshExcerpts();
    });


    setupCsrfForAjax();
    // Mark processed
    $('#pending-button').click(function() {
        $.post(markProcessedUrl, {
            id: leadId,
            status: 'PRO',
        }).done(function() {
            $('#pending-button').addClass('hiding');
            setTimeout(function(){
                $('#pending-button').hide();
                $('#process-button').show();
                $('#pending-button').removeClass('hiding');
            }, 600);
        });
    });
    $('#process-button').click(function() {
        $.post(markProcessedUrl, {
            id: leadId,
            status: 'PEN',
        }).done(function() {
            // $('#process-button').hide();
            $('#process-button').addClass('hiding');
            setTimeout(function(){
                $('#process-button').hide();
                $('#pending-button').show();
                $('#process-button').removeClass('hiding');
            }, 600);
        });
    });

    //Sort images
    $('#sort-images').selectize();
    $('#sort-images').change(function(){
        if ($(this).find(':selected').val() === 'size-asc') {
            sortLeadImages('asc');
        }
        else if ($(this).find(':selected').val() === 'size-dsc') {
            sortLeadImages('dsc');
        }
        else if ($(this).find(':selected').val() === 'def-asc') {
            sortLeadImages('aa');
        }
    });

    // Save and cancel

    $('.save-excerpt').click(function() {
        var data = { excerpts: JSON.stringify(excerpts) };
        redirectPost(window.location.pathname, data, csrf_token);
    });
    $('.save-and-next').click(function() {
        var data = { excerpts: JSON.stringify(excerpts), 'next_pending': true };
        redirectPost(window.location.pathname, data, csrf_token);
    });
    $('.cancel').click(function() {
        if (confirm('Are you sure you want to cancel the changes?')) {
            window.location.href = cancelUrl;
        }
    });

    refreshExcerpts();
});
