
function checkEntryEmpty(index) {
    return (
        (entries[index].excerpt.trim().length == 0) &&
        (entries[index].image.trim().length == 0)
    );
}


$(document).ready(function() {
    setupCsrfForAjax();
    leadPreviewer.init();
});
