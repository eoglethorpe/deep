$(document).ready(function(){
    $('#select-event').selectize();

    $('#select-event').change(function() {
        var event = $(this).val();
        window.location.href = window.location.pathname+"?"+$.param({event:event})
    });
});
