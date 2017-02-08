// extension.js
// extension specific codes

var extension = {
    inputs: {},
    currentTabUrl: null,
    currentPage: null,
    tabId: null,

    init: function(){
        extension.getCurrentTabUrl(function(){
            extension.loadUrl();
            extension.loadWebsite();
            extension.loadTitle();
            extension.queryCurrentPage();
            extension.restoreInputValues();
        });
        $('input').on('change textInput input', function(){
            extension.storeInputValue($(this));
        });
        $('select').change(function(){
            extension.storeInputValue($(this));
        })
    },
    loadTitle: function(){
        if (extension.currentTabUrl && extension.currentPage) {
            var loc = document.createElement('a');
            loc.href = extension.currentTabUrl;
            var doc = (new DOMParser).parseFromString(extension.currentPage, 'text/html');
            article = new Readability(loc, doc).parse();
            if (article != null){
                $('#title').val(article.title).addClass('filled');
            }
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
                }

                // source of the article/news
                if(response.source != null){
                    $('#source').val(response.source).addClass('filled');
                }

                if(response.lead_exists){
                    // a lead from this url already exists
                } else{
                }

            }
        });
    },
    // fills the url input from current tab url
    loadUrl: function(){
        $('#url').val(extension.currentTabUrl).addClass('filled');
    },
    // fills the website input by trimming the current tab url
    loadWebsite: function(){
        //find & remove protocol (http, ftp, etc.) and get domain
        let domain = (extension.currentTabUrl.indexOf("://") > -1)? extension.currentTabUrl.split('/')[2]: domain = url.split('/')[0];

        //find & remove port number
        domain = domain.split(':')[0];

        if(domain){
            $('#website').val(domain).addClass('filled');
        }
    },
    getCurrentTabUrl: function(callback) {
        var queryInfo = { active: true, currentWindow: true };
        chrome.tabs.query(queryInfo, function(tabs) {
            var tab = tabs[0];
            var url = tab.url;
            extension.tabId = tab.id;
            extension.currentTabUrl = tab.url;
            callback();
        });
    },

    storeInputValue: function(ip){
        chrome.runtime.sendMessage({'msg': 'set', 'tab_id': extension.tabId, 'key': ip[0].id, 'val': ip.val() });
    },
    restoreInputValue: function(ip){
        chrome.runtime.sendMessage({'msg': 'get', 'tab_id': extension.tabId, 'key': ip[0].id}, function(response){
            if(response && response.val){
                if(ip.is('input')){
                    ip.val(response.val).addClass('filled');
                } else if(ip.is('select')){
                    ip.val(response.val);
                    refreshSelectInputs();
                }
            }
        });
    },

    restoreInputValues: function(){
        $('input').each(function(){
            extension.restoreInputValue($(this));
        });
    },

    ajaxSubmitOptions: {
        url: null,
        beforeSubmit: function(data, form, options){
            options["url"] = deep.serverAddress + '/' + deep.currentEvent + '/leads/add/';
        },
        success: function(response) {
            $('#add-lead-form').hide();
            $('<p>'+response+'</p>').appendTo('body');
        },
        error: function(response){
            console.log(response);
            $('#add-lead-form').hide();

            $('<p>'+$(response.responseText).find('body').text()+'</p>').appendTo('body');
        }
    }
};
