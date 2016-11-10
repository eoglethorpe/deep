/*
Data structure

var excerpts = [
    {
        excerpt: "",
        attributes: [
            { pillar: pid, subpillar: spid, sector: secid, subsector: ssecid },
            { pillar: pid, subpillar: spid, sector: secid, subsector: ssecid },
            { pillar: pid, subpillar: spid, sector: secid, subsector: ssecid },
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


var excerpts = [];
var selectedExcerpt = -1;
var refreshing = false;

function refreshPageOne() {
    // Update selection
    var sel = $("#select-excerpt");
    sel.empty();
    for (var i=0; i<excerpts.length; ++i) {
        var excerpt = excerpts[i];
        var option = $("<option value='" + i + "'></option>");
        option.text(excerpt.excerpt.length>0?excerpt.excerpt.substr(0, 100):"New excerpt");
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

                // Subsector
                if (attr.subsector) {
                    attribute.find('.sub-sector').html(sector.subsectors[attr.subsector]);
                } else {
                    var subsector = attribute.find('.sub-sector');
                    subsector.html("[select]");
                    var subsectorMenu = subsector.parent().find('.dropdown-menu');
                    ($('<li><a>bla bla</a></li>')).appendTo(subsectorMenu);
                    ($('<li><a>bleh bla</a></li>')).appendTo(subsectorMenu);
                    ($('<li><a>blaa bfla</a></li>')).appendTo(subsectorMenu);

                }
            }
            // If there is not sector, hide the div tag containing the sector/subsector
            else {
                attribute.find('.sector').closest('div').html("");
            }

            attribute.appendTo(entry.find('.attribute-list'));
            attribute.show();
        }

        entry.appendTo(entriesContainer);
        entry.show();
    }

    addTodayButtons();
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
        reliability: default_reliability, severity: default_severity,
        date: null, number: null,
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
                    sector: null, subsector: null
                });
            }
        }
    });

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
                    sector: $(this).data('sector-id'), subsector: null
                });
            }
        }
    });
    // Matrix-two default color
    $("#matrix-two .attribute-block").css("background-color", function(){ return $(this).data('bk-color'); });

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
});
