$(document).ready(function(){
    $('.entry').on('click', function(){
        if($(this).data('expanded')|false == true){
            $(this).find('.details').slideUp();
            $(this).data('expanded', false);
        } else{
            $(this).find('.details').slideDown();
            $(this).data('expanded', true);
        }
    });
});
