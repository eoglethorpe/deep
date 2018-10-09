// deep.js
// contains server side specific codes

var deep = {
    // example of serverAddress http://52.87.160.69
    // don't add the trailing /
    // serverAddress: 'http://localhost:8000',
    serverAddress: 'https://legacy.thedeep.io',
    currentEvent: -1,
    currentUser: -1,
    csrfToken: null,
    init: function(callback){
        var defer = new $.Deferred();
        chrome.storage.sync.get({'serverAddress': 'https://legacy.thedeep.io'}, function(options) {
            deep.serverAddress = options.serverAddress;
            $('#add-lead-form').ajaxForm(extension.ajaxSubmitOptions);
            defer.resolve();
        });
        return defer.promise();
    },
    getUserStatus: function(){
        return $.ajax({
            type: 'GET',
            url: deep.serverAddress + '/user/status',
            success: function(response){
                if(response && response.status == 'logged-in'){
                    deep.currentEvent = response.last_event;
                    deep.currentUser = response.user_id;
                } else{
                    extension.showErrorMsg('<i class="fa fa-user"></i>You are not logged in', 'Please log in to the DEEP first to use the extension'.replace(new RegExp('DEEP', 'g'), '<a target="_blank" href="'+deep.serverAddress+'">DEEP</a>'));
                }
            },
            error: function(){
                extension.showErrorMsg('<i class="fa fa-times"></i>Something seems to be broken :/', 'Cannot connect to the DEEP server, please make sure that you have correct link to the DEEP server in the settings page and the DEEP server is up and running'.replace(new RegExp('DEEP', 'g'), '<a target="_blank" href="'+deep.serverAddress+'">DEEP</a>'));
            }
        });
    },
    loadEvents: function(){
        return $.ajax({
            type: 'GET',
            url: deep.serverAddress + '/api/v1/events/',
            success: function(response){
                if(response) {
                    response.sort(function(a, b){ return a.name.localeCompare(b.name); });
                    let eventSelectElement = $('#event-select');

                    eventSelectElement.empty();
                    eventSelectElement.append('<option value="">Add project</option>');
                    for(i = 0; i < response.length; i++){
                        eventSelectElement.append('<option value="'+response[i].id+'"'+(response[i].id==deep.currentEvent?' selected>':'>')+response[i].name+'</option>');
                    }
                    eventSelectElement.trigger('change');
                    deep.getCSRFToken();
                }
            },
        });
    },
    loadUsers: function(){
        return $.ajax({
            type: 'GET',
            url: deep.serverAddress + '/api/v1/users/',
            success: function(response){
                if(response){
                    let userSelectElement = $('#user-select');
                    for(i = 0; i < response.length; i++){
                        userSelectElement.append('<option value="'+response[i].id+'"'+(response[i].id == deep.currentUser? 'selected>':'>')+response[i].first_name+' '+ response[i].last_name+' (' + response[i].email +')'+ '</option>');
                    }
                }
            }
        });
    },
    getCSRFToken: function(){
        if (deep.csrfToken) {
            return;
        }
        if(deep.currentEvent != -1){
            return $.ajax({
                type: 'GET',
                url: deep.serverAddress + '/' + deep.currentEvent + '/leads/add/',
                success: function(response){
                    if(response){
                        deep.csrfToken = ($(response).find("input[name='csrfmiddlewaretoken']")).val();
                        $('#add-lead-form').append('<input type="hidden" name="csrfmiddlewaretoken" value="' + deep.csrfToken + '">');
                    }
                },
                error: function(response){
                }
            });
        }
    },
    // extracts and loads publication date and source of current page article
    queryCurrentPage: function(){
        return $.ajax({
            type: 'GET',
            // send the current tab url to the server (parsing of article is done server side)
            url: deep.serverAddress + '/date/?link='+ extension.currentTabUrl,
            success: function(response){
                // date of publication
                if(response.date){
                    $('#publish-date').val(response.date).addClass('filled');
                    $('#publish-date').trigger('change');
                }

                // source of the article/news
                if(response.source){
                    $('#source').val(response.source).addClass('filled');
                }

                if(response.lead_exists){
                    // a lead from this url already exists
                    $('#duplicate-lead-warning').slideDown();
                } else{
                    $('#duplicate-lead-warning').hide();
                }

                // event for the country referenced in this page
                if (response.event) {
                    $('#selected-events').empty();
                    $('#event-select').val(response.event);
                    $('#event-select').trigger('change');
                    refreshSelectInputs();
                }

            },
        });
    }
};
