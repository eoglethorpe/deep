var article = null;
var articleDate = null;
var tabId;


chrome.tabs.executeScript(null, {code: 'chrome.runtime.sendMessage({ data: document.documentElement.innerHTML });' });
chrome.runtime.onMessage.addListener( function(request, sender) {
    extension.currentPage = '<html>'+request.data+'</html>';
    extension.loadTitle();
});

$(document).ready(function(){

    $.when(deep.init()).done(function(){
        extension.init();
        $.when(deep.getUserStatus()).done(function(){
            // if user is logged in
            if(deep.currentUser != -1){
                // load event & user list
                $.when(deep.loadEvents(), deep.loadUsers()).done(function(){
                    enhanceSelectInputs();

                    // hide loader and show the form
                    $('#loader').slideUp(function(){
                        $('#add-lead-form').slideDown();
                    });
                });
            }
        });
    });

});
