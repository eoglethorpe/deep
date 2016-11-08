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
        for (var i=0; i<excerpt.attributes.length; ++i) {
            var attribute = excerpt.attributes[i];

            if (!attribute.sector) {
                // First matrix
                $("#matrix-one")
                    .find('.sub-pillar[data-pillar-id="' + attribute.pillar + '"][data-subpillar-id="' + attribute.subpillar + '"]')
                        .addClass('active');

            } else {
                // Second matrix
                $("#matrix-two")
                    .find('.attribute-block[data-pillar-id="' + attribute.pillar + '"][data-subpillar-id="' + attribute.subpillar + '"][data-sector-id="' + attribute.sector + '"]')
                        .addClass('active');
            }
        }
    }

    refreshing = false;
}


function addExcerpt(excerpt) {
    // Create new excerpt and refresh
    var excerpt = {
        excerpt: excerpt,
        attributes: [],
        reliability: 0, severity: 0, date: null, number: null,
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
        $('#page-one').fadeOut(function(){
            $('#page-two').fadeIn();
        });
    });
    $('#back-to-excerpts-btn').on('click', function(){
        $('#page-two').fadeOut(function(){
            $('#page-one').fadeIn();
        });
    });

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

    // Reliability and severity selection
    $('.reliability span').click(function(){
     $(this).closest('.reliability').find('span').removeClass('active');
     $(this).addClass('active');
    });

    $('.severity span').click(function(){
     $(this).closest('.severity').find('span').removeClass('active');
     $(this).addClass('active');
    });

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
    $("#excerpt-text").on('input paste drop', function() {
        excerpts[selectedExcerpt].excerpt = $("#excerpt-text").val();
        refreshExcerpts();
    });

});
