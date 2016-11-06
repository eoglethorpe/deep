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

});
