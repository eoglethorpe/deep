$(document).ready(function() {
    $('#login-hid').click(function() {
        window.location.href = hid_login_url; // 'http://auth.dev.humanitarian.id/oauth/authorize?response_type=token&client_id=deep-dev&scope=profile&state=12345&redirect_uri=http://www.thedeep.io/login/';
    });

    if (window.location.hash.indexOf('access_token=') >= 0) {
        window.location.href = hid_access_token_url + '?' + window.location.hash.substr(1);
    }
});
