var database = {};


chrome.runtime.onMessage.addListener(
    function(request, sender, reply) {

        if (!(request.tab_id in database))
            database[request.tab_id] = {};

        if (request.msg == "set")
            database[request.tab_id][request.key] = request.val;

        else if (request.msg == "get") {
            reply({val: database[request.tab_id][request.key]});
        }

    }
);
