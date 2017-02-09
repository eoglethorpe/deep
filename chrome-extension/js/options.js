function showOption(option){
    let current = document.querySelector('aside a.active');
    if(current){
        current.className = '';
        document.querySelector(current.dataset.target).style.display = 'none';
    }
    option.className = 'active';
    document.querySelector(option.dataset.target).style.display = 'block';
}

window.onload = function(){
    showOption(document.querySelector('aside a'));
    document.querySelectorAll('aside a').forEach(function(item, index){
        item.onclick = function(){ showOption(this); };
    });
    document.getElementById('save-btn').addEventListener('click', saveOptions);
    loadOptions();
}

function saveOptions(){
    // remove any trailing / from the address
    var serverAddress = document.getElementById('server-address').value.replace(/\/\s*$/, "");
    chrome.storage.sync.set({'serverAddress': serverAddress}, function(){
        loadOptions();
        // Update status to let user know options were saved.
        var status = document.getElementById('status-text');
        status.innerHTML = '<i class="fa fa-check"></i>Cheers! Changes has been saved successfully.';
        status.style.display = 'block';
        setTimeout(function() {
            status.style.display = 'none';
        }, 3000);
    });
}
function loadOptions(){
    chrome.storage.sync.get({'serverAddress': 'http://thedeep.io'}, function(options) {
        document.getElementById('server-address').value = options.serverAddress;
        document.getElementById('server-address-link').href = options.serverAddress;
    });
}
