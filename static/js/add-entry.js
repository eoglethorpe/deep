google.charts.load('current', {packages:["orgchart"]});
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Name');
    data.addColumn('string', 'Manager');
    data.addColumn('string', 'ToolTip');


    // For each orgchart box, provide the name, manager, and tooltip to show.
    data.addRows([
        ['All Population', '', ''],
        ['Affected', 'All Population', ''],
        ['Non Affected', 'All Population', ''],
        ['Displaced', 'Affected', ''],
        ['Non displaced', 'Affected', ''],
        ['IDP', 'Displaced', ''],
        ['Refugees', 'Displaced', ''],
        ['Asylum Seekers', 'Displaced', ''],
        ['Returnees', 'Displaced', ''],
        ['Others of Concern', 'Displaced', ''],
        ['Host', 'Non displaced', ''],
        ['Non host', 'Non displaced', ''],
    ]);

    // Create the chart.
    var chart = new google.visualization.OrgChart(document.getElementById('chart-div'));
    // Draw the chart, setting the allowHtml option to true for the tooltips.
    chart.draw(data, {allowHtml:true});
}



function styleText(text) {
    for (var tag in selectedTags) {
        var color = selectedTags[tag];

        for (var j in tags[tag]) {
            var keyword = tags[tag][j];

            var search = '\\b('+keyword+')\\b';
            var regex = new RegExp(search, "ig");
            var replace = "<span style='background-color:" + color + ";'> $1 </span>";
            text = text.replace(regex, replace);
        }
    }
    return "<div>" + text + "</div>";
}


function fillTagButtons() {
    for (var tag in tags) {
        var btn = $("<button class='btn btn-default'>"+tag+"</button>");
        $("#tag-buttons").append(btn);

        btn.on('click', function(btn, tag) { return function() {
            if (!btn.hasClass("btn-tag-select")) {
                btn.addClass("btn-tag-select");
                selectedTags[tag] = getColor();
                btn.css("background-color", selectedTags[tag]);
            }
            else {
                btn.removeClass("btn-tag-select");
                delete selectedTags[tag];
                btn.css("background-color", "");
            }

            $("#lead-simplified-preview").html(styleText(leadSimplified));
        }}(btn, tag));
    }
}

function changeLeadPreview(simplified) {
    isSimplified = simplified;
    var frame = $("#lead-preview");
    var simplifiedFrame = $("#lead-simplified-preview");

    if (simplified) {
        simplifiedFrame.html(styleText(leadSimplified));

        simplifiedFrame.css("display", "inherit");
        frame.css("display", "none");

        fillTagButtons();
    }
    else {
        simplifiedFrame.css("display", "none");
        frame.css("display", "inherit");

        $("#tag-buttons").empty();
        selectedTags = {};
    }
}

function addExcerpt(excerpt, attribute) {
    var excerptInput = $("<div class='row'><textarea class='col-md-12 attr-excerpt'>" + excerpt+"</textarea></div>");
    $("#information-attributes #attr-inputs").append(excerptInput);
}


var attrs = [
    {
        'id': { 'pk': 'context', 'text': 'Context'},
        'data': [
            {'pk': 'hazard',    'text': 'Hazard Developments'},
            {'pk': 'lessons',   'text': 'Lessons Learned'},
            {'pk': 'stake',     'text': 'Stakeholders'},
            {'pk': 'politics',  'text': 'Politics & security overview'},
            {'pk': 'society',   'text': 'Society & community'},
            {'pk': 'economy',   'text': 'Economy'}
        ]
    },
    {
        'id': {'pk': 'population-data', 'text': 'Population data & characterstics'},
        'data': [
            {'pk': 'specific',      'text': 'Population with specific needs'},
            {'pk': 'displacement',  'text': 'Population displacement'},
            {'pk': 'demography',    'text': 'Demography'}
        ]
    }
];

var attr_inputs = [];

function initAttrInputs(){
    // temporarily fill up attr_inputs
    for(var i=0; i<attrs.length; i++){
        var attr_group = attrs[i];
        for(var j=0; j<attr_group['data'].length; j++){
            var attr = attr_group['data'][j];
            var attr_input = {
                'id': attr['pk'],
                'data': [""]
            };
            attr_inputs.push(attr_input);
        }
    }

    // create html elements
    var attr_container = $('#information-attributes #attr-contents');
    var flexrow_template = $('<div class="flexrow"></div>');
    var attr_title_template = $('<div class="attr-title"></div>');
    var attr_template = $('<div class="attr"></div>');
    for(var i=0; i<attrs.length; i++){
        var attr_group = attrs[i];
        var attr_group_title = attr_title_template.clone();
        var attr_group_flexrow = flexrow_template.clone();

        for(var j = 0; j<attr_group['data'].length; j++){
            var attr = attr_template.clone();
            attr.data('attr-pk', attr_group['data'][j]['pk']);
            attr.text(attr_group['data'][j]['text']);
            attr.appendTo(attr_group_flexrow);
        }
        attr_group_title.text(attr_group['id']['text']);

        attr_group_title.appendTo(attr_container);
        attr_group_flexrow.appendTo(attr_container);
        //attr_group.append
    }
}

function selectAttr(id){
    var result = $.grep(attr_inputs, function(e){ return e.id == id; });
    if(result.length == 0){
        // no result found (shouldn't happen)
    } else if(result.length == 1){

        attr_input = result[0];
        var excerpts = $('#attr-inputs #contents');
        var excerptTemplate = $('.template-attr-input');
        for(var i=0; i<attr_input['data'].length; i++){
            var excerpt = excerptTemplate.clone();
            excerpt.removeClass('template-attr-input');
            excerpt.addClass('attr-input');
            if(i < (attr_input['data'].length-1)){
                var btn = excerpt.find('.btn-add');
                btn.removeClass('btn-primary');
                btn.removeClass('btn-add');
                btn.addClass('btn-danger');
                btn.addClass('btn-remove');
                btn.text('-')
            }
            excerpt.find('textarea').val(attr_input['data'][i]);
            excerpt.appendTo(excerpts);
            excerpt.show();
        }
    } else{
        // no result found (shouldn't happen)
    }
}

function grabAttrInput(id){
    var result = $.grep(attr_inputs, function(e){ return e.id == id; });
    if(result.length == 0){
        // no result found (shouldn't happen)
    } else if(result.length == 1){
        attr_input = result[0];
        attr_input['data'] = [];
        var excerpts = $('#attr-inputs #contents').find('.attr-input');
        for(var i=0; i<excerpts.length; i++){
            attr_input['data'].push((excerpts.eq(i)).find('textarea').val());
        }
    } else{
        // no result found (shouldn't happen)
    }
}


$(document).ready(function() {
    $("#country").selectize();

    $('input[type=radio][name=lead-view-option]').change(function() {
        changeLeadPreview(this.value=='simplified');
    });
    changeLeadPreview(leadSimplified!="");

    $("#information-attributes .attr").bind('dragover', function(e) {
        e.originalEvent.preventDefault();
        return false;
    });
    $("#information-attributes .attr").bind('drop', function(e) {
        e.originalEvent.preventDefault();
        var excerpt = e.originalEvent.dataTransfer.getData('Text');
        addExcerpt(excerpt, $(this).data("attrPk"));
        return false;
    });

    initAttrInputs();
});

$(document).on('click', '.btn-add', function(e){
    var current = $(e.target);

    current.removeClass('btn-primary');
    current.removeClass('btn-add');
    current.addClass('btn-danger');
    current.addClass('btn-remove');
    current.text('-');

    var excerpts = $('#attr-inputs #contents');
    var excerpt = $('.template-attr-input').clone();

    excerpt.removeClass('template-attr-input');
    excerpt.addClass('attr-input');

    excerpt.find('textarea').val(attr_input['data']);
    excerpt.appendTo(excerpts);
    excerpt.show();
});

$(document).on('click', '.btn-remove', function(e){

    var current = $(e.target);
    var container = (current.closest('.attr-input')).remove();
});

$(document).on('click', '#information-attributes .attr', function(e) {
    var current = $("#information-attributes .active");
    if(current != null){
        grabAttrInput(current.data('attr-pk'));
        current.removeClass('active');
        var excerpts = $('#attr-inputs #contents').find('.attr-input');
        if(excerpts){
            excerpts.remove();
        }
    }
    $(this).addClass('active');
    $('#selected-attr-title').text($(this).text());
    selectAttr($(this).data('attr-pk'));
});

$(document).on('click', '.google-visualization-orgchart-node', function(){
    console.log($(this).text());
});
