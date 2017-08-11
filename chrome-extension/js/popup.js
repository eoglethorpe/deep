var article = null;
var articleDate = null;
var tabId;


// TODO: check for message broadcaster to avoid conflicts
// maybe use app name and version
chrome.tabs.executeScript(null, {code: 'chrome.runtime.sendMessage({ currentPageHtml: document.documentElement.innerHTML });' });
chrome.runtime.onMessage.addListener( function(request, sender) {
    if(request.currentPageHtml){
        extension.currentPage = '<html>'+request.currentPageHtml+'</html>';
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

    const publishDatePicker = $('#publish-date-picker');
    publishDatePicker.datepicker({
        altField: $('#publish-date'),
        altFormat: 'yy-mm-dd',
        dateFormat: 'dd-mm-yy',
        onSelect: function() {
            $('#publish-date').change();
            $('#publish-date-picker').change();
        },
    });

    $('#publish-date').change(function() {
        if ($(this).val()) {
            publishDatePicker.datepicker('setDate', new Date($(this).val()));
            publishDatePicker.trigger('change');
        }
    });

    $('#publish-date-container a').on('click', function(){
        publishDatePicker.datepicker('setDate', new Date());
        publishDatePicker.trigger('change');
    });
     
    $('#event-select').on('change', function() {
         
        if($(this).val()) {
            let pk = $(this).val();
            $(this).val('');

            if($('.selected-event').filter(function(){ return $(this).data('pk') == pk; }).length > 0) {
                return;
            }
            let selectedEventElement = $(`
                <div class="selected-event">
                    <span class="name"></span>
                    <button><i class="fa fa-times"></i></button>
                </div>
            `);
            selectedEventElement.find('.name').text($(this).find('option[value="'+pk+'"]').text());
            selectedEventElement.data('pk', pk);
             
            selectedEventElement.find('button').on('click', function() {
                $(this).closest('.selected-event').remove();   
                return false;
            });

            selectedEventElement.appendTo('#selected-events');
        }
         
    });
});
