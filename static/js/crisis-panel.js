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
