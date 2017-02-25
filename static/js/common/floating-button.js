let floatingButton = {
    init: function(onclick){
        // Floating action button
        $('.floating-btn').click(onclick);
    },

    change: function(color, content, flag=null, time=200){
        this.flag = flag;

        $('.floating-btn').css('background-color', color);
        $('.floating-btn').addClass('btn-animation');
        $('.floating-btn').empty();

        setTimeout(function(){
            $(".floating-btn").html(content);
            $('.floating-btn').removeClass('btn-animation');
        }, time);
    },

    getFlag: function() {
        return this.flag;
    }
};
