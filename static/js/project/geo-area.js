$(document).ready(function(){
    $('.admin-boundary ').on('click', function(){
        $('.admin-boundary.active').removeClass('active');
        $(this).addClass('active');
    });
});
