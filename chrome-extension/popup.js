// @TODO: Check if there are no events


// example of serverAddress http://52.87.160.69
// don't add the trailing /
 var serverAddress = 'http://localhost:8000';
//var serverAddress = 'http://52.87.160.69';

var currentEvent = 0;
var currentUser = -1;

var currentPage = null;

var article = null;

chrome.tabs.executeScript(null, {file: "contentscript.js"});
chrome.runtime.onMessage.addListener( function(request, sender) {
    currentPage = '<html>'+request.data+'</html>';
});

function getCurrentTabUrl(callback) {
    var queryInfo = {
        active: true,
        currentWindow: true
    };
    chrome.tabs.query(queryInfo, function(tabs) {
        var tab = tabs[0];
        var url = tab.url;
        console.assert(typeof url == 'string', 'tab.url should be a string');
        callback(url);
    });
}

function getCurrentTabTitle(callback) {
    var queryInfo = {
        active: true,
        currentWindow: true
    };
    chrome.tabs.query(queryInfo, function(tabs) {
        var tab = tabs[0];
        var title = tab.title;
        console.assert(typeof title == 'string', 'tab.title should be a string');

        var loc = document.createElement('a');
        loc.href = tab.url;
        var doc = (new DOMParser).parseFromString(currentPage, 'text/html');
        article = new Readability(loc, doc).parse();
        $('#name').val(article.title);

        callback(title);
    });
}


function extractDomain(url) {
    var domain;
    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
    }
    else {
        domain = url.split('/')[0];
    }

    //find & remove port number
    domain = domain.split(':')[0];

    return domain;
}

document.addEventListener('DOMContentLoaded', function(){
    getCurrentTabUrl(function(url){
        document.getElementById('url').value = url;
        document.getElementById('website').value = extractDomain(url);
    });
    // getCurrentTabTitle(function(title){
    //     document.getElementById('name').value = title;
    // });
});


$(document).ready(function(){
    $.ajax({
        type: 'GET',
        url: serverAddress + '/user/status',
        success: function(response){
            if(response){
                if(response.status == "logged-in"){
                    $("#loading-animation").hide();
                    $("#extras-wrapper").hide();
                    $(".form-wrapper").removeClass('hidden');
                    currentEvent = response.last_event;
                    currentUser = response.user_id;
                    $.ajax({
                        type: 'GET',
                        url: serverAddress + '/api/v1/events/',
                        success: function(response){
                            if(response) {
                                for(i = 0; i < response.length; i++){
                                    if(response[i].id==currentEvent){
                                        $('#events').append('<option value="'+response[i].id+'" selected>'+response[i].name+'</option>');
                                    } else{
                                        $('#events').append('<option value="'+response[i].id+'">'+response[i].name+'</option>');
                                    }
                                }
                                $('#events').selectize({create: false});
                            }
                        },
                        error: function(response){
                            console.log(response);
                        },
                    });
                    getCSRFToken();
                    loadLists();
                    var submitOptions = {
                        url: serverAddress + '/' + currentEvent + '/leads/add/',
                        beforeSubmit: function(data, form, options){
                            $(".form-wrapper").addClass('hidden');
                            $("#extras-wrapper").show();
                            $(".app-info").hide();
                            $("#loading-animation").show();
                            options["url"] = serverAddress + '/' + currentEvent + '/leads/add/';
                        },
                        success: function(response) {
                            $("#loading-animation").hide();
                            $(".app-info").removeClass('hidden');
                            $(".app-info").show();
                            $("#submit-success-msg").removeClass('hidden');
                        },
                        error: function(response){
                            $("#loading-animation").hide();
                            $(".app-info").removeClass('hidden');
                            $(".app-info").show();
                            $("#submit-fail-msg").removeClass('hidden');
                        }
                    };

                    $('#leads-form').ajaxForm(submitOptions);
                } else {
                    $("#loading-animation").hide();
                    $(".app-info").removeClass('hidden');
                    $("#no-login-msg").removeClass('hidden');
                }
            }

        },
        error: function(response){
            $("#loading-animation").hide();
            $(".app-info").removeClass('hidden');
            $("#error-msg").removeClass('hidden');
        },
    });

    function loadLists(){
        $.ajax({
            type: 'GET',
            url: serverAddress + '/api/v1/users/',
            success: function(response){
                if(response){
                    for(i = 0; i < response.length; i++){
                        if(response[i].first_name){
                            if(response[i].id == currentUser){
                                $('#user-select').append('<option value="'+response[i].id+'" selected>' + response[i].first_name + ' ' + response[i].last_name + ' (' + response[i].email +')'+ '</option>');
                            } else {
                                $('#user-select').append('<option value="'+response[i].id+'">' + response[i].first_name + ' ' + response[i].last_name + ' (' + response[i].email +')'+ '</option>');
                            }
                        }
                        else {
                            if(response[i].id == currentUser){
                                $('#user-select').append('<option value="'+response[i].id+ '" selected>' + response[i].email + '</option>');
                            } else {
                                $('#user-select').append('<option value="'+response[i].id+ '">' + response[i].email + '</option>');
                            }
                        }
                    }
                    $('#user-select').selectize({create: false});
                }
            },
            error: function(response){
                console.log(response);
            },
        });

        // $.ajax({
        //     type: 'GET',
        //     url: serverAddress + '/api/v1/sources/',
        //     success: function(response){
        //         if(response) {
        //             for(i = 0; i < response.length; i++){
        //                 $('#source').append('<option value="'+response[i].source+'">'+response[i].source+'</option>');
        //             }
        //             $('#source').selectize();
        //         }
        //     },
        //     error: function(response){
        //         console.log(response);
        //     },
        // });

        $('#confidentiality').selectize();
    }

    function getCSRFToken(){
        $.ajax({
            type: 'GET',
            url: serverAddress + '/' + currentEvent + '/leads/add/',
            success: function(response){
                if(response){
                    csrfToken = ($(response).find("input[name='csrfmiddlewaretoken']")).val();
                    oldInput = $("input[name='csrfmiddlewaretoken']");
                    if(oldInput){
                        oldInput.remove();
                    }
                    $('#leads-form').append('<input type="hidden" name="csrfmiddlewaretoken" value = ' + csrfToken + '>');
                }
            },
            error: function(response){
                console.log(response);
            },
        });
    }

    $('#events').on('change', function(){
        currentEvent = $( "#events option:selected" ).val();
        getCSRFToken();
    });
});
