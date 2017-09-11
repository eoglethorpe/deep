// extension.js
// extension specific codes

var extension = {
    inputs: {},
    currentTabUrl: null,
    currentPage: null,
    tabId: null,
    ajaxSubmitOptions: {
        url: null,
        beforeSubmit: function(data, form, options){
            $('#publish-date')[0].type = 'date';

            let pks = $('#selected-events .selected-event').map(function() {
                return $(this).data('pk');
            }).get();

            if (pks.length === 0) {
                return false;
            }

            options.url = deep.serverAddress + '/' + pks[0] + '/leads/add/';

            if (pks.length > 1) {
                data.push({
                    name: 'clone_to',
                    value: pks.slice(1).join(','),
                });
            }

            extension.showLoader();
        },
        success: function(response) {
            if (toString.call(response) === '[object Object]') {
                chrome.tabs.create({ url: deep.serverAddress + response.url });
            }
            extension.showSuccessMsg('<i class="fa fa-check"></i>Successful', 'The lead has been added successfully');
        },
        error: function(response){
            extension.showErrorMsg('<i class="fa fa-times"></i>Oh nose! Something is not right', 'Failed to add the lead');
        }
    },

    init: function(){
        var defer = new $.Deferred();
        extension.getCurrentTabUrl(function(){
            extension.loadUrl();
            extension.loadWebsite();
            extension.loadTitle();
            // deep.queryCurrentPage();
            // extension.restoreInputValues();
            defer.resolve();
        });

        $('#event-select').change(function(){
            const pks = $(this).val();

            if (!pks) {
                return;
            }

            deep.currentEvent = pks;
            deep.getCSRFToken();
        });
        return defer.promise();
    },
    startStoring: function() {
        $('input').on('change textInput input', function(){
            extension.storeInputValue($(this));
        });
        $('select').change(function(){
            extension.storeInputValue($(this));
        });
    },
    loadTitle: function(){
        if (extension.currentTabUrl && extension.currentPage) {
            var loc = document.createElement('a');
            loc.href = extension.currentTabUrl;
            var doc = (new DOMParser()).parseFromString(extension.currentPage, 'text/html');
            article = new Readability(loc, doc).parse();
            if (article){
                $('#title').val(article.title).addClass('filled');
            }
        }
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
        let defer = new $.Deferred();
        chrome.runtime.sendMessage({'msg': 'get', 'tab_id': extension.tabId, 'key': ip[0].id}, function(response){
            if(response && response.val){
                if(ip.is('input')){
                    ip.val(response.val).addClass('filled');
                } else if(ip.is('select')){
                    ip.val(response.val);
                    ip.trigger('change');
                    refreshSelectInputs();
                }
            }
            defer.resolve();
        });
        return defer.promise();
    },
    restoreInputValues: function(){
        let promises = [];
        $('input, select').each(function(){
            promises.push(extension.restoreInputValue($(this)));
        });
        // promises.push(extension.restoreInputValue($('#confidentiality')));
        // promises.push(extension.restoreInputValue($('#event-select')));
        // promises.push(extension.restoreInputValue($('#user-select')));
        return $.when(...promises);
    },
    showAddLeadForm: function(){
        $('body > *').hide();
        $('#add-lead-form').slideDown();
    },
    showLoader: function(){
        $('body > *').hide();
        $('#loader').fadeIn();
    },
    showErrorMsg: function(title, description){
        $('body > *').hide();
        $('#status-text')[0].className = 'error';
        $('#status-text h2').html(title);
        $('#status-text p').html(description);
        $('#status-text').slideDown();
    },
    showSuccessMsg: function(title, description){
        $('body > *').hide();
        $('#status-text')[0].className = 'success';
        $('#status-text h2').html(title);
        $('#status-text p').html(description);
        $('#status-text').slideDown();
    }
};
