
class ChangesPopup {
    constructor(element, changes) {
        this.changes = changes;
        this.container = $('.display-card');
        this.content = this.container.find('.content');

        element.mouseenter((e) => {
            this.container.removeClass('rotated');
            this.content.empty();
            this.show(element);
        });
        element.mouseleave((e) => {
            this.container.hide();
        });
    }

    show(element) {
        if(this.changes.length > 0){
            this.changes.forEach(change => {
                const changeUnit = $('<div class="change-unit"></div>');
                changeUnit.append('<p class="change-unit-title">' + change.name + '</p>');
                changeUnit.appendTo(this.content);

                Object.keys(change.fields).forEach(key => {
                    const field = change.fields[key];
                    const fieldUnit = $('<div class="field-unit"></div>');
                    fieldUnit.append('<p class="field-name">' + field.name + '</p>');

                    let value = field.value;
                    if(field.value !== field.value || field.value == 'Infinity'){
                        value = 'New value';
                    }
                    else{
                        value = field.value.toFixed(2) + '%';
                    }
                    if(field.value > 0 && field.value < 0.01){
                        value = '<0.01%';
                    }
                    fieldUnit.append('<p class="field-value">' + value + '</p>');

                    if(field.value >= 0){
                        fieldUnit.find('.field-value').css('color', 'green');
                    }
                    else if(field.value < 0){
                        fieldUnit.find('.field-value').css('color', 'red');
                    }

                    const fieldSource = $('<div class="field-source"></div>');
                    field.source.new.forEach(src =>{
                        let source = src.name + '/' + src.date;
                        fieldSource.append('<p class="field-source-unit">' + source + '</p>');
                    });
                    fieldUnit.append(fieldSource);
                    fieldUnit.appendTo(changeUnit);
                });
            });
        }
        else{
            const changeUnit = $('<h3 class="no-changes">No Changes</h3>');
            changeUnit.appendTo(this.content);
        }
        let top = $(element).position().top;
        let bottom = $(element).position().bottom;
        let left = $(element).position().left;
        this.container.show();
        if((top + this.container.height()) > $(window).height()){
            this.container.addClass('rotated');
        }
        this.container.css('top', top + 24 + 'px');
        this.container.css('left', left + 64 + 'px');
    }
}
