/*
Data structure

var informations = [
    {
        excerpt: "",
        attributesL [
            { subpillar: spid, sector: secid, subsector: ssecid },
            { subpillar: spid, sector: secid, subsector: ssecid },
            { subpillar: spid, sector: secid, subsector: ssecid },
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
        if ($(this).hasClass('active')){
            $(this).removeClass('active');
        }
        else {
            $(this).addClass('active');
        }
    });

    // Matrix two selection of attribute
    $('#matrix-two .attribute-block').click(function(){
        if ($(this).hasClass('active')){
            $(this).removeClass('active');
        }
        else {
            $(this).addClass('active');
        }
    })

    // Reliability and severity selection
    $('.reliability span').click(function(){
     $(this).closest('.reliability').find('span').removeClass('active');
     $(this).addClass('active');
    });

    $('.severity span').click(function(){
     $(this).closest('.severity').find('span').removeClass('active');
     $(this).addClass('active');
    });


});
