class Modal{
    constructor(elem, notify=false){
        this.elem = elem;
        this.deferred = null;
        this.action = null;
        this.notify = notify;

        let that = this;
        $(this.elem).find('button[data-action]').on('click', function(){
            that.action = $(this).data('action');
            if(! $(this).data('persist')){
                that.hide();
            }else{
                that.deferred.notify();
            }
        });
    }
    show(){
        let that = this;
        this.action = null;
        this.deferred = new $.Deferred();

        $(this.elem).closest('.modal-container').fadeIn(function(){
            $(that.elem).slideDown(function(){
                if(that.notify){
                    that.deferred.notify();
                }
            });
            addTodayButtons();
        });

        return this.deferred.promise();
    }
    hide(){
        let that = this;

        $(this.elem).slideDown().slideUp(function(){
            $(that.elem).closest('.modal-container').fadeOut();
            that.deferred.resolve();
            addTodayButtons();
        });
    }
}
