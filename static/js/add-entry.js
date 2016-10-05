var manual_location_input;


function updateLocationSelections() {
    var container = $('#selected-location-list ul');
    var items = container.find('li');
    if(items){
        items.remove();
    }
    for (var i=0; i < mapSelections.length; i++) {
        var selectionKey = mapSelections[i];
        element = $('<li><a onclick="unSelect(\''+selectionKey+'\', this)"><i class="fa fa-times"></i></a>'+manual_location_input[0].selectize.options[selectionKey].text+'</li>');
        element.appendTo(container);

        // Select the option with value selectionKey.
    }
}

function refreshLocations() {

    // TODO: Clear all from select-location.
    //mapSelections = [];
    for (var key in locations) {
        var name = locations[key];
        manual_location_input[0].selectize.addOption({value: key, text: name});
        // Add key to mapSelections array on selection and call updateLayer(key).
    }

    updateLocationSelections();
}



google.charts.load('current', {packages:["orgchart"]});
google.charts.setOnLoadCallback(drawChart);

var mouseover_group = -1;

function drawChart() {
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Name');
    data.addColumn('string', 'Manager');
    data.addColumn('string', 'ToolTip');

    data.addRows(affected_groups);

    // Create the chart.
    var chart = new google.visualization.OrgChart(document.getElementById('chart-div'));
    // Draw the chart, setting the allowHtml option to true for the tooltips.
    chart.draw(data, {
        nodeClass: 'affected-group',
        selectedNodeClass: 'active-affected-group',
    });
    google.visualization.events.addListener(chart, 'select', function(){
        var selection = chart.getSelection();
        if (selection.length == 0){
            if(mouseover_group != -1){
                selected_groups = $.grep(selected_groups, function(item){
                    return item.row != mouseover_group;
                })
            }
            chart.setSelection(selected_groups);
        } else{
            selected_groups.push(selection[0]);
            chart.setSelection(selected_groups);
        }
    });
    google.visualization.events.addListener(chart, 'onmouseover', function(row){
        mouseover_group = row.row;
    });
    google.visualization.events.addListener(chart, 'onmouseout', function(row){
        mouseover_group = -1;
    });

    // Set default selections.
    chart.setSelection(selected_groups);
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


function fillTagButtons(tag, title) {
    var btn = $("<button class='btn btn-default'>"+title+"</button>");
    $("#tag-buttons").append(btn);

    if (tag in selectedTags) {
        btn.addClass("btn-tag-select");
        btn.css("background-color", selectedTags[tag]);
    }

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

function refreshSectors() {
    for (var sector in sectors) {
        fillTagButtons(sector, sectors[sector]);
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
        refreshSectors();
    }
    else {
        simplifiedFrame.css("display", "none");
        frame.css("display", "inherit");

        $("#tag-buttons").empty();
    }
}

var attr_inputs = [];

function initAttrInputs(){
    //  fill up attr_inputs
    for(var i=0; i<attrs.length; i++){
        var attr_group = attrs[i];
        for(var j=0; j<attr_group['data'].length; j++){
            var attr = attr_group['data'][j];
            var attr_input;
            if (attr['pk'] in attr_data) {
                attr_input = attr_data[attr['pk']];
            }
            else {
                attr_input = {
                    'id': attr['pk'],
                    'data': [""],
                    'number': [""],
                    'reliability': ['USU'],
                    'severity': ['NOA']
                };
            }
            attr_inputs.push(attr_input);
        }
    }

    // create html elements
    var attr_container = $('#information-attributes #attr-contents');
    var flexrow_template = $('<div class="flexrow"></div>');
    var attr_title_template = $('<div class="attr-title"></div>');
    var attr_template = $('<div class="attr"></div>');

    var index = 0;
    for(var i=0; i<attrs.length; i++){
        var attr_group = attrs[i];
        var attr_group_title = attr_title_template.clone();
        var attr_group_flexrow = flexrow_template.clone();
        //attr_group_flexrow.hide();

        for(var j = 0; j<attr_group['data'].length; j++){
            var attr = attr_template.clone();
            attr.data('attr-pk', attr_group['data'][j]['pk']);
            attr.prop('id', 'attr-'+attr_group['data'][j]['pk']);
            attr.text(attr_group['data'][j]['text']);
            attr.appendTo(attr_group_flexrow);

            if(attr_inputs[index]['data'][0].length > 0){
                attr.addClass('filled');
            }
            index++;
        }
        attr_group_title.text(attr_group['id']['text']);

        attr_group_title.appendTo(attr_container);
        attr_group_flexrow.appendTo(attr_container);
        //attr_group.append
    }
}

var selectedAttrs = [];
var selectedTitles = [];

function removeAttrs(attrs) {
    for (var j=0; j<selectedAttrs.length; ++j) {
        var result = $.grep(attr_inputs, function(e) {return e.id == selectedAttrs[j]; });
        if (result.length != 1)
            continue;

        attr_input = result[0];
        for(var i=0; i<attr_input['data'].length; i++){
            if (attrs.some(function(x) {
                return x.data == attr_input['data'][i] &&
                    x.number == attr_input['number'][i] &&
                    x.reliability == attr_input['reliability'][i] &&
                    x.severity == attr_input['severity'][i];
            }))
            {
                attr_input['data'].splice(i, 1);
                attr_input['number'].splice(i, 1);
                attr_input['severity'].splice(i, 1);
                attr_input['reliability'].splice(i, 1);
                i--;
            }

        }
    };
}

function refreshAttrs() {
    if (selectedAttrs.length == 0) {
        $('#selected-attr-title').text("");
        return;
    }

    var title = "";
    for (var i=0; i<selectedTitles.length; ++i) {
        if (i==0)
            title = selectedTitles[i];
        else
            title += ", " + selectedTitles[i];
    }
    $('#selected-attr-title').text(title);

    // first get common attributes
    var common_attrs = [
    ];

    for (var j=0; j<selectedAttrs.length; ++j) {
        var result = $.grep(attr_inputs, function(e) {return e.id == selectedAttrs[j]; });
        if (result.length != 1)
            continue;

        attr_input = result[0];

        attrs = [];
        for(var i=0; i<attr_input['data'].length; i++){
            attr = {
                data: attr_input['data'][i],
                number: attr_input['number'][i],
                reliability: attr_input['reliability'][i],
                severity: attr_input['severity'][i]
            };
            attrs.push(attr);
        }

        if (common_attrs.length == 0) {
            common_attrs = attrs;
        }
        else {
            common_attrs = common_attrs.filter(function(x) {
                return attrs.some(function(y) {
                    return y.data == x.data && y.number == x.number
                        && y.reliability == x.reliability && y.severity == x.severity;
                });
            });
        }
    };

    if (common_attrs.length == 0) {
        common_attrs.push({
            data: '',
            number: '',
            reliability: 'USU',
            severity: 'NOA'
        });
    }

    // remove the common attributes, since we will be re-adding them later
    // at grabAttrInput()
    removeAttrs(common_attrs);

    // now show all common attributes
    var excerpts = $('#attr-inputs #contents');
    var excerptTemplate = $('.template-attr-input');

    for (var j=0; j<common_attrs.length; ++j) {
        var excerpt = excerptTemplate.clone();
        excerpt.removeClass('template-attr-input');
        excerpt.addClass('attr-input');
        if(j < (common_attrs.length-1)){
            var btn = excerpt.find('.btn-add');
            btn.removeClass('btn-primary');
            btn.removeClass('btn-add');
            btn.addClass('btn-danger');
            btn.addClass('btn-remove');
            btn.text('-')
        }
        excerpt.find('textarea').val(common_attrs[j]['data']);
        excerpt.find('input').val(common_attrs[j]['number']);
        excerpt.find('.reliability').val(common_attrs[j]['reliability']);
        excerpt.find('.severity').val(common_attrs[j]['severity']);
        excerpt.appendTo(excerpts);
        excerpt.show();
    }
}


function selectAttr(id) {
    selectedAttrs.push(id);
    refreshAttrs();
}

function unselectAttr(id) {
    selectedAttrs.removeValue(id);
    refreshAttrs();
}

function grabAttrInput(id){
    var result = $.grep(attr_inputs, function(e){ return e.id == id; });
    if(result.length == 0){
        // no result found (shouldn't happen)
    } else if(result.length == 1){
        attr_input = result[0];
        // attr_input['data'] = [];
        // attr_input['number'] = [];
        // attr_input['reliability'] = [];
        // attr_input['severity'] = [];
        var excerpts = $('#attr-inputs #contents').find('.attr-input');
        for(var i=0; i<excerpts.length; i++){
            attr_input['data'].push((excerpts.eq(i)).find('textarea').val());
            attr_input['number'].push((excerpts.eq(i)).find('input').val());
            attr_input['reliability'].push((excerpts.eq(i)).find('.reliability').val());
            attr_input['severity'].push((excerpts.eq(i)).find('.severity').val());

            if(attr_input['data'][0].length > 0) {
                $('#attr-'+attr_input['id']).addClass('filled');
            } else {
                $('#attr-'+attr_input['id']).removeClass('filled');
            }
        }
    } else{
        // more than 1 result found (shouldn't happen)
    }
}

function unSelect(key, that){
    mapSelections.splice(mapSelections.indexOf(key), 1);
    updateLayer(key);
    $(that).closest('li').remove();
}



$(document).ready(function() {
    manual_location_input = $("#manual-location-input").selectize();
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

        manual_location_input[0].selectize.clear(true);
    });

    $('.split-pane').splitPane();
    $("#country").selectize();
    $("#vulnerable-groups").selectize();
    $("#groups-with-specific-needs").selectize();

    $('input[type=radio][name=lead-view-option]').change(function() {
        changeLeadPreview(this.value=='simplified');
    });
    changeLeadPreview(leadSimplified!="");

    initAttrInputs();

    $("#information-attributes .attr").bind('dragover', function(e) {
        e.originalEvent.preventDefault();
        return false;
    });
    $("#information-attributes .attr").bind('drop', function(e) {
        e.originalEvent.preventDefault();
        var excerpt = e.originalEvent.dataTransfer.getData('Text');
        var pk = $(this).data("attr-pk");

        var result = $.grep(attr_inputs, function(e){ return e.id == pk; });
        var attr = result[0]['data'];

        if (attr[attr.length-1].trim().length > 0) {
            console.log("pushing");
            attr.push(excerpt);
            result[0]['number'].push("");
            result[0]['reliability'].push("USU");
            result[0]['severity'].push("NOA");
        }
        else {
            attr[attr.length-1] = excerpt;
        }

        // unselect all others
        while(selectedAttrs.length > 0) {
            var other = $("#information-attributes .attr")
                .filter(function() {
                    return $(this).data("attr-pk") ==  selectedAttrs[0];
                });
            console.log(other);
            other.click();
        }

        // select this
        $(this).click();

        return false;
    });

    var saveFunction = function(addAnother=false) {
        if (!confirm("Are you sure you want to save these changes?"))
            return;
        var current = $("#information-attributes .active");
        if(current != null) {
            current.each(function() {
                grabAttrInput($(this).data('attr-pk'));
            });
        }

        var data = {};

        var affecteds = [];
        if (selected_groups.length > 0)
        for (var s in selected_groups) {
            affecteds.push(affected_groups[selected_groups[s].row][0]);
        }
        data["affected_groups"] = JSON.stringify(affecteds);

        data["map_data"] = JSON.stringify(mapSelections);
        data["information_attributes"] = JSON.stringify(attr_inputs);

        var vgroups = [];
        $('#vulnerable-groups :selected').each(function(i, selected) {
            vgroups[i] = $(selected).val();
        });
        data["vulnerable_groups"] = JSON.stringify(vgroups);

        var spgroups = [];
        $('#groups-with-specific-needs :selected').each(function(i, selected) {
            spgroups[i] = $(selected).val();
        });
        data["specific_needs_groups"] = JSON.stringify(spgroups);

        data["add_another"] = addAnother?"1":"0";

        data["sectors"] = "{}"; //JSON.stringify(Object.keys(selectedTags));

        redirectPost(window.location.pathname, data, csrf_token);
    };
    $("#save-btn").on('click', function(){saveFunction(false);});
    $("#save-add-btn").on('click', function(){saveFunction(true);});

    // Trigger on change of country selection.
    $("#country").trigger('change');
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
    excerpt.find('input').val(attr_input['number']);
    excerpt.find('.reliability').val(attr_input['reliability']);
    excerpt.find('.severity').val(attr_input['severity']);
    excerpt.appendTo(excerpts);
    excerpt.show();

    excerpt.get(0).scrollIntoView();
});

$(document).on('click', '.btn-remove', function(e){

    var current = $(e.target);
    var container = (current.closest('.attr-input')).remove();
});

$(document).on('click', '#information-attributes .attr', function(e) {

    var current = $("#information-attributes .active");
    if(current != null){
        current.each(function() {
            grabAttrInput($(this).data('attr-pk'));
        });
        // current.removeClass('active');
        var excerpts = $('#attr-inputs #contents').find('.attr-input');
        if(excerpts){
            excerpts.remove();
        }
    }

    if ($(this).hasClass('active')) {
        $(this).removeClass('active');
        selectedTitles.removeValue($(this).text());
        unselectAttr($(this).data('attr-pk'));
    }
    else {
        $(this).addClass('active');
        selectedTitles.push($(this).text());
        selectAttr($(this).data('attr-pk'));
    }
});

$(document).on('click', '.attr-title', function(){
    $(this).next().toggle();
});
