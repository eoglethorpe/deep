// @TODO: Check if there are no events


// example of serverAddress http://52.87.160.69
// don't add the trailing /
//var serverAddress = 'http://localhost:8000';
var serverAddress = 'http://54.83.82.134';

var currentEvent = 0;
var currentUser = -1;

var currentPage = null;

var article = null;
var articleDate = null;

var tabId;

var inputs = {};

var currentTabUrl = null;


function loadName() {
    if (currentTabUrl && currentPage) {
        var loc = document.createElement('a');
        loc.href = currentTabUrl;
        var doc = (new DOMParser).parseFromString(currentPage, 'text/html');
        article = new Readability(loc, doc).parse();
        if (article != null)
            $('#name').val(article.title);
    }
}

chrome.tabs.executeScript(null, {file: "contentscript.js"});
chrome.runtime.onMessage.addListener( function(request, sender) {
    currentPage = '<html>'+request.data+'</html>';
    loadName();
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

        tabId = tab.id;

        $.ajax({
            type: 'GET',
            url: serverAddress + '/date/?link='+tab.url,
            success: function(response){
                $('#publish-date').val(response.date);
                if(response.lead_exists){
                    $('#lead-exists-msg').show();
                } else{
                    $('#lead-exists-msg').hide();
                }
                if(response.source != null){
                    $('#source').val(response.source);
                }
                //console.log(response);
            }
        });
        currentTabUrl = tab.url;
        loadName();
        callback(url);
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
});


$(document).ready(function(){
    $("#login").href = serverAddress;

    var date = $('input[type="date"]').css('padding-left', '32px');
    var today_btn = $('<button>&#9679;</button>');
    today_btn.appendTo(date.parent());
    today_btn.css('z-index', '10');
    date.css('position', 'relative');
    today_btn.css('position', 'absolute');
    today_btn.css('left', date.position().left+24+'px');
    today_btn.css('top', date.position().top-5+'px');
    today_btn.css('cursor', 'pointer');
    today_btn.css('background-color', 'transparent');
    today_btn.css('border', 'none');
    today_btn.css('font-size', '2em');
    today_btn.css('padding', '0');
    today_btn.css('outline', 'none');

    today_btn.on('click', function(e){
        e.preventDefault();
        date[0].valueAsDate = new Date();
    });

    getCurrentTabUrl(function(url){
        document.getElementById('url').value = url;
        document.getElementById('website').value = extractDomain(url);

        setSaveLoadHandlers();
    });

    $.ajax({
        type: 'GET',
        url: serverAddress + '/user/status',
        success: function(response){
            if(response){
                if(response.status == "logged-in"){
                    $("#loading-animation").hide();
                    $("#extras-wrapper").hide();
                    $("#lead-form-wrapper").show();
                    currentEvent = response.last_event;
                    currentUser = response.user_id;

                    if (inputs["user-select"])
                        currentUser = inputs["user-select"];
                    if (inputs["events"])
                        currentEvent = inputs["events"];

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
                            $("#lead-form-wrapper").hide();
                            $("#extras-wrapper").show();
                            $(".app-info").hide();
                            $("#loading-animation").show();
                            options["url"] = serverAddress + '/' + currentEvent + '/leads/add/';
                        },
                        success: function(response) {
                            //$("#lead-form-wrapper").hide();
                            $("#loading-animation").hide();
                            $(".app-info").show();
                            $("#submit-success-msg").show();

                            if (toString.call(response) === '[object Object]') {
                                var newURL = response;
                                chrome.tabs.create({ url: serverAddress + response.url });
                            }
                        },
                        error: function(response){
                            $("#loading-animation").hide();
                            //$(".app-info").show();
                            $(".app-info").show();
                            $("#submit-fail-msg").show();
                        }
                    };

                    $('#leads-form').ajaxForm(submitOptions);
                } else {
                    $("#loading-animation").hide();
                    $(".app-info").show();
                    $("#no-login-msg").show();
                }
            }

        },
        error: function(response){
            $("#loading-animation").hide();
            $(".app-info").show();
            $("#error-msg").show();
        },
    });

    function loadLists(){
        $.ajax({
            type: 'GET',
            url: serverAddress + '/api/v1/users/',
            success: function(response){
                if(response){
                    for(i = 0; i < response.length; i++){
                        if(response[i].first_name) {
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
        //                 $('#source').append('<option value="'+response[i].id+'"'
        //                     + ((inputs.id == response[i].id)?' selected':'') + '>'+response[i].name+'</option>');
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

$(document).ready(function(){
    $('body').on('click', 'a', function(){
        chrome.tabs.create({url: $(this).attr('href')});
        return false;
    });
});



function save(key, val) {
    chrome.runtime.sendMessage({"msg": "set", "tab_id": tabId, "key": key, "val": val});
}

function load(key, callback) {
    chrome.runtime.sendMessage({"msg": "get", "tab_id": tabId, "key": key}, function(response) {
        callback(response.val);
    });
}


function setSaveLoadHandlers() {
    ["events", "name", "source", "confidentiality", "user-select", "publish-date", "url", "website"]
        .forEach(function(name) { setSaveLoadHandlerFor(name); });
}

function setSaveLoadHandlerFor(inputname) {
    $("#" + inputname).change(function() {
        save(inputname, this.value);
    });
    $("#" + inputname).on("keyup", function() {
        save(inputname, this.value);
    });

    load(inputname, function(val) {
        inputs[inputname] = val;
        if (val)
            $("#" + inputname).val(val);
    });
}
