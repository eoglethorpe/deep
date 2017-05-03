$(document).ready(function(){
    $('.project').on('click', function(){
        $('.project.active').removeClass('active');
        $(this).addClass('active');
    });
    $('.project header button').on('click', function(e){
        e.stopPropagation();
        $(this).closest('.project').toggleClass('expanded').find('.details').slideToggle('200');
    });

    $('select').selectize({plugins: ['remove_button']});
});
