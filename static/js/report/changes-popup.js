
class ChangesPopup {
    constructor(element, changes) {
        this.changes = changes;
        element.mouseenter((e) => {
            $('.display-card').empty();
            this.show(element);
        });
        element.mouseleave((e) => {
            $('.display-card').hide();
        });
    }

    show(element) {
        console.log(this.changes);
        if(this.changes.length > 0){
            this.changes.forEach(change => {
                const changeUnit = $('<div class="change-unit"></div>');
                changeUnit.append('<p class="change-unit-title">' + change.name + '</p>');
                changeUnit.appendTo($('.display-card'));

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
            changeUnit.appendTo($('.display-card'));
        }
        let top = $(element).position().top;
        let left = $(element).position().left;
        $('.display-card').css('top', top + 24 + 'px');
        $('.display-card').css('left', left + 64 + 'px');
        $('.display-card').show();
    }
}
