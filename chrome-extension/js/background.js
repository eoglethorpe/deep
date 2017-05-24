var database = {};

// TODO: check for message broadcaster to avoid conflicts
// maybe use app name and version
chrome.runtime.onMessage.addListener(
    function(request, sender, reply) {
        if (!(request.tab_id in database)){
            database[request.tab_id] = {};
        }
        if (request.msg == "set"){
            database[request.tab_id][request.key] = request.val;
        } else if (request.msg == "get") {
            reply({val: database[request.tab_id][request.key]});
        }
    }
);

chrome.runtime.onMessageExternal.addListener( function(request, sender, reply) {
    if(request.msg == 'screenshot'){
        chrome.tabs.captureVisibleTab(null, {}, function(image){
            reply({'image': image});
        });

        // return true to indicate that the reply is async
        return true;
    }
});
