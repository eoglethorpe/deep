
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

    $("#information-attributes .attr").bind('click', function(e) {
        addExcerpt("", $(this).data("attrPk"));
    });
});
