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


$(document).ready(function(){
    $('.split-pane').splitPane();

    $('.sub-pillar').click(function(){
        if ($(this).hasClass('active')){
            $(this).removeClass('active');
        }
        else {
            $(this).addClass('active');
        }
    });

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

    $('.reliability span').click(function(){
     $('.reliability span').removeClass('active');
     $(this).addClass('active');
    });

    $('.severity span').click(function(){
     $('.severity span').removeClass('active');
     $(this).addClass('active');
    });

});
