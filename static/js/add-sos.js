var manual_location_input;


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

function unSelect(key, that){
    mapSelections.splice(mapSelections.indexOf(key), 1);
    updateLayer(key);
    $(that).closest('li').remove();
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
    }
    else {
        simplifiedFrame.css("display", "none");
        frame.css("display", "inherit");
        selectedTags = {};
    }
}


var sectorData = [
    { id: 'food', title: 'Food', quantification: '', analytical_value: ''},
    { id: 'water-supply', title: 'Water Supply', quantification: '', analytical_value: ''},
    { id: 'hygine', title: 'Hygine', quantification: '', analytical_value: ''},
    { id: 'sanitation', title: 'Sanitation', quantification: '', analytical_value: ''},
    { id: 'livelihood', title: 'Livelihood', quantification: '', analytical_value: ''},
    { id: 'health', title: 'Health', quantification: '', analytical_value: ''},
    { id: 'nutrition', title: 'Nutrition', quantification: '', analytical_value: ''},
    { id: 'shelter', title: 'Shelter', quantification: '', analytical_value: ''},
    { id: 'non-food-items', title: 'Non Food Items', quantification: '', analytical_value: ''},
    { id: 'protection', title: 'Protection', quantification: '', analytical_value: ''},
    { id: 'child-protection', title: 'Child Protection', quantification: '', analytical_value: ''},
    { id: 'humanitarian-access', title: 'Humanitarian Access', quantification: '', analytical_value: ''},
    { id: 'market', title: 'Market', quantification: '', analytical_value: ''},
    { id: 'logistic', title: 'Logistic', quantification: '', analytical_value: ''},
    { id: 'commercial', title: 'Commercial', quantification: '', analytical_value: ''},
];


$(document).ready(function(){

    $('#country').selectize();
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

    $('div.split-pane').splitPane();
    $('input[type=radio][name=lead-view-option]').change(function() {
        changeLeadPreview(this.value=='simplified');
    });
    changeLeadPreview(leadSimplified!="");

    function createSectors(){
        var sectorContainer = $('#sectors');
        var sectorTemplate = $('<a class="sector"></a>');
        for(var i = 0; i < sectorData.length; i++){
            var sector = sectorTemplate.clone();
            sector.prop('id', i);
            if(i == 0){
                sector.addClass('active');
                $('#sector-input').find('.title').text(sectorData[i].title);
                $('#sector-input').find('#quantification').val(sectorData[i].quantification);
                $('#sector-input').find('#analytical-value').val(sectorData[i].analytical_value);

            }
            if(sectorData[i].quantification.length > 0 || sectorData[i].analytical_value.length > 0){
                sector.addClass('filled');
            }
            sector.text(sectorData[i].title);
            sector.on('click', function(e){
                e.preventDefault();
                var current = $('#sectors .active');
                current.removeClass('active');

                sectorData[current.prop('id')].quantification = $('#sector-input').find('#quantification').val();
                sectorData[current.prop('id')].analytical_value = $('#sector-input').find('#analytical-value').val();

                if(sectorData[current.prop('id')].quantification.length > 0 || sectorData[current.prop('id')].analytical_value.length > 0){
                    current.addClass('filled');
                } else{
                    current.removeClass('filled')
                }
                $(this).addClass('active');

                $('#sector-input').find('.title').text(sectorData[$(this).prop('id')].title);
                $('#sector-input').find('#quantification').val(sectorData[$(this).prop('id')].quantification);
                $('#sector-input').find('#analytical-value').val(sectorData[$(this).prop('id')].analytical_value);
            });
            sector.appendTo(sectorContainer);
        }
    }
    createSectors();

    // Trigger on change of country selection.
    $("#country").trigger('change');
});
