
function styleText(text) {
    for (var tag in selectedTags) {
        var color = selectedTags[tag];

        for (var j in tags[tag]) {
            var keyword = tags[tag][j];

            var search = '('+keyword+')';
            var regex = new RegExp(search, "ig");
            var replace = "<span style='background-color:" + color + ";'> $1 </span>";
            text = text.replace(regex, replace);
        }
    }
    return text_style + "<div>" + text + "</div>";
}

function reloadPreview() {
    var iframe = document.getElementById("lead-preview");
    var old = iframe.src;
    iframe.src = '';
    setTimeout( function () {
        iframe.src = old;
    }, 0);
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

            var frame = $("#lead-preview");
            if (isSimplified) {
                frame.attr('src', "data:text/html;charset=utf-8," + styleText(lead_simplified));
                reloadPreview();
            }
        }}(btn, tag));
    }
}

function changeLeadPreview(simplified) {
    isSimplified = simplified;
    var frame = $("#lead-preview");
    if (simplified) {
        frame.attr('src', "data:text/html;charset=utf-8," + styleText(lead_simplified));
        fillTagButtons();
    }
    else {
        $("#tag-buttons").empty();
        selectedTags = {};

        if (lead_type == 'URL')
            frame.attr('src', lead_url);
        else if (lead_type == 'MAN')
            frame.attr('src', "data:text/html;charset=utf-8," + styleText(lead_description));
        else if (lead_type == 'ATT')
            if (lead_attachment.endsWith(".pdf") ||
                    lead_attachment.endsWith(".htm") ||
                    lead_attachment.endsWith(".html"))
                frame.attr('src', lead_attachment);
            // TODO Set other allowable extensions including images, text etc.
    }
    reloadPreview();
}

$(document).ready(function() {

    $("#country").selectize();

    $('input[type=radio][name=lead-view-option]').change(function() {
        changeLeadPreview(this.value=='simplified');
    });
    changeLeadPreview(lead_simplified!="");
});
