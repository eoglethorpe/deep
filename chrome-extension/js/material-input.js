var materialSelect = {
    selectInput: null,
    select: null,
    selectDiv: null,
    optionContainer: null,

    init: function(_selectInput){
        this.selectInput = _selectInput;
        this.enhance();
    },
    enhance: function(selectInput){
        this.select = this.selectInput.find('select');
        let options = this.select.find('option');
        this.select.hide();

        this.selectDiv = $('<div class="select">' + this.getPlaceholder()+'</div>');
        let label = $('<label>' + this.getPlaceholder()+'</label>');
        let dropdownIcon = $('<span class="dropdown-icon fa fa-chevron-down"></span>');

        label.appendTo(this.selectInput);
        dropdownIcon.appendTo(this.selectInput);
        this.selectDiv.appendTo(this.selectInput);

        this.optionContainer = $('<div class="options"></div>');
        this.optionContainer.appendTo(this.selectInput);
        this.optionContainer.hide();

        let that = this;
        this.selectInput.on('click', function(){
            that.optionContainer.slideToggle('fast', function(){
                if(that.optionContainer.is(":visible")){
                    dropdownIcon.css('transform', 'rotate(180deg)');
                    that.selectDiv.addClass('select-active');
                } else{
                    dropdownIcon.css('transform', 'rotate(0deg)');
                    that.selectDiv.removeClass('select-active');
                }
            });
        });
        this.selectInput.attr('tabIndex', 0);
        this.selectInput.focusout(function(){
            that.optionContainer.slideUp('fast', function(){
                dropdownIcon.css('transform', 'rotate(0deg)');
                that.selectDiv.removeClass('select-active');
            });
        });

        options.each(function(i){
            function getSpan(_class){
                if(_class){
                    return '<span class="'+_class+'"></span>';
                }
                return '';
            }
            let optionDiv = $('<div class="option" data-val="'+$(this).val()+'">'+getSpan($(this).data('pre'))+$(this).text()+'</div>')
            optionDiv.appendTo(that.optionContainer);
            optionDiv.on('click', function(){
                that.selectOption($(this));
            });
        });

        this.selectOption(this.optionContainer.find('.option[data-val="'+this.select.val()+'"]'), false);
    },
    refresh: function(){
        this.selectOption(this.optionContainer.find('.option[data-val="'+this.select.val()+'"]'), false);
    },
    selectOption: function(opt, triggerChange){
        if ( triggerChange == null ){ triggerChange = true; }
        this.select.val(opt.data('val'));
        if(triggerChange){
            this.select.trigger('change');
        }
        let label = this.selectInput.find('label');
        if(opt.data('val') != opt.text()){
            label.addClass('filled');
            label.removeClass('disappear');
            this.selectDiv.text(opt.text());
            this.selectDiv.addClass('select-filled');
            this.selectDiv.removeClass('hidden');
        } else{
            this.selectDiv.addClass('hidden');
            let that = this;
            setTimeout(function(){
                that.selectDiv.text(that.getPlaceholder());
                that.selectDiv.removeClass('select-filled');
                label.addClass('disappear');
                label.removeClass('filled');
            }, 200);
        }
    },
    getPlaceholder: function(){ return this.selectInput.data('placeholder')? this.selectInput.data('placeholder'): 'Select an option';
    }
};

var materialSelects = [];
function enhanceSelectInputs(){
    $('.select-input').each(function(){
        let sel = $.extend(true, {}, materialSelect);
        sel.init($(this));
        materialSelects.push(sel);
    });
}
function refreshSelectInputs(){
    materialSelects.forEach(function(el){
        el.refresh();
    });
}
$(document).ready(function(){
    $('.text-input input').on('change input paste', function(){
        if($(this).val().length == 0){
            $(this).removeClass('filled');
        }else{
            $(this).addClass('filled');
        }
    });
    var dateInputs = $('.text-input input[type="date"]');
    dateInputs.each(function(){
        $(this)[0].type = 'text';
    });
    dateInputs.on('focus', function(){
        $(this)[0].type = 'date';
    });
    dateInputs.on('focusout', function(){
        if(!$(this).val()){
            $(this)[0].type = 'text';
        }
    });
});
