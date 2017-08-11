
function checkEntryEmpty(index) {
    return (
        (entries[index].excerpt.trim().length === 0) &&
        (entries[index].image.trim().length === 0)
    );
}

function getActualImage(imageUrl) {
    if (imageUrl.startsWith(window.location.origin)) {
        return imageUrl.replace(window.location.origin, '');
    }
    return imageUrl;
}

function addEntry(excerpt, image) {
    entries.push({
        excerpt: excerpt,
        image: getActualImage(image),
        elements: [],
    });

    page1.selectedEntryIndex = entries.length - 1;
    page1.refresh();
}

function removeEntry(index) {
    entries.splice(index, 1);

    page1.selectedEntryIndex--;
    if (page1.selectedEntryIndex < 0) {
        addEntry('', '');
    }

    page1.refresh();
    page2.refresh();
}

function addOrReplaceEntry(excerpt, image) {
    let index = entries.findIndex(e => e.excerpt == excerpt && e.image == image);
    if (index >= 0) {
        entries[index].excerpt = excerpt;
        entries[index].image = getActualImage(image);

        page1.selectedEntryIndex = index;
        page1.refresh();
    } else {
        addEntry(excerpt, image);
    }
}

function getEntryData(index, id) {
    let data = entries[index].elements.find(e => e.id == id);
    if (data) {
        return data;
    }

    data = {
        id: id,
    };
    entries[index].elements.push(data);
    return data;
}

function switchPage() {
    if ($('#page-one').is(':visible')) {
        $('#page-one').hide();
        $('#page-two').show();
    }
    else {
        $('#page-one').show();
        $('#page-two').hide();
    }
    page1.refresh();
    page2.refresh();
}


$(document).ready(function() {
    setupCsrfForAjax();
    leadPreviewer.init();

    page1.init();
    page2.init();

    google.charts.load('current', {packages:["orgchart"]});
    google.charts.setOnLoadCallback(function() {
        page2.loadOrganigrams();
    });


    // Save and cancel
    $('.save-button').click(function() {
        var data = { entries: JSON.stringify(entries) };
        redirectPost(window.location.pathname, data, csrf_token);
    });
    $('.save-and-next-button').click(function() {
    });
    $('.cancel-button').click(function() {
        if (confirm('Are you sure you want to cancel the changes?')) {
            window.location.href = cancelUrl;
        }
    });
    $('.switch-page').click(function() {
        switchPage();
    });
});
