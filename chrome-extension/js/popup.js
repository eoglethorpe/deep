var article = null;
var articleDate = null;
var tabId;


// TODO: check for message broadcaster to avoid conflicts
// maybe use app name and version
chrome.tabs.executeScript(null, {code: 'chrome.runtime.sendMessage({ currentPageHtml: document.documentElement.innerHTML });' });
chrome.runtime.onMessage.addListener( function(request, sender) {
    if(request.currentPageHtml){
        extension.currentPage = '<html>'+request.data+'</html>';
        extension.loadTitle();
    }
});

$(document).ready(function(){
    $('#status-text').hide();

    $.when(deep.init(), extension.init()).done(function(){
        $.when(deep.getUserStatus()).done(function(){
            // if user is logged in
            if(deep.currentUser != -1){
                // load event & user list
                $.when(deep.loadEvents(), deep.loadUsers()).done(function(){
                    deep.queryCurrentPage().then(function() {
                        extension.restoreInputValues().then(function() {
                            extension.startStoring();
                        });
                    });
                    enhanceSelectInputs();

                    // hide loader and show the form
                    $('#loader').slideUp(function(){
                        $('#add-lead-form').slideDown();
                    });
                });
            }
        });
    });

    $('#submit-and-add-entry').on('click', function(e){
        $('#add-lead-form').append('<input type="hidden" name="redirect-url" value="true">');
    });
    $('#publish-date-container a').on('click', function(){
        let dateInput = $('#publish-date');
        dateInput[0].type = 'date';
        dateInput[0].valueAsDate = new Date;
        dateInput.focus().addClass('filled');
        dateInput.trigger('change');
    });
});
