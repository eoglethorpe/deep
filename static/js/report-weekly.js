$(document).ready(function(){
    $('.entry').on('click', function(){
        if($(this).data('expanded')|false == true){
            $(this).find('p').slideUp();
            $(this).data('expanded', false);
        } else{
            $(this).find('p').slideDown();
            $(this).data('expanded', true);
        }
    });
});
