
function checkEntryEmpty(index) {
    return (
        (entries[index].excerpt.trim().length == 0) &&
        (entries[index].image.trim().length == 0)
    );
}

function addEntry(excerpt, image) {
    entries.push({
        excerpt: excerpt,
        image: image,
        elements: [],
    });

    page1.selectedEntry = entries.length - 1;
    page1.refresh();
}

function removeEntry(index) {
    entries.splice(index, 1);

    page1.selectedEntry--;
    page1.refresh();
}


let page1 = {
    init: function() {
        let that = this;
        this.selectedEntry = -1;
        this.container = $('#page-one-elements');

        for (let i=0; i<templateData.elements.length; i++) {
            let element = templateData.elements[i];
            if (element.page != 'page-one') {
                continue;
            }

            if (element.id == 'entry-selector') {
                this.entrySelector = this.addEntrySelector(element);
            }
            else if (element.id == 'page-one-excerpt') {
                this.excerptBox = this.addExcerptBox(element);
            }
            else if (element.id == 'page-one-image') {
                this.imageBox = this.addImageBox(element);
            }

            else if (element.type == 'noob') {
                this.addNoobElement(element);
            }
        }

        this.refresh();
    },

    addEntrySelector: function(element) {
        let that = this;
        let entrySelector = $('<div class="entry-selector-container" style="position: absolute;"><select><option value="">Select an entry</option></select></div>');

        entrySelector.append($('<button class="add-entry"><i class="fa fa-plus"></i></button>'));
        entrySelector.append($('<button class="remove-entry"><i class="fa fa-minus"></i></button>'));

        entrySelector.find('select').css('width', 'calc(' + element.size.width + ' + 64px)');
        entrySelector.find('select').css('height', element.size.height);
        entrySelector.css('left', element.position.left);
        entrySelector.css('top', element.position.top);

        entrySelector.appendTo(this.container);
        entrySelector.find('select').selectize();

        // Add remove entry buttons
        entrySelector.find('.add-entry').click(function() {
            addEntry('', '');
        });
        entrySelector.find('.remove-entry').click(function() {
            if (that.selectedEntry >= 0 && that.selectedEntry < entries.length) {
                removeEntry(that.selectedEntry);
            }
        });

        // On entry selected
        entrySelector.find('select').change(function() {
            let temp = parseInt($(this).val());
            if (isNaN(temp)) {
                return;
            }
            that.selectedEntry = temp;
            that.refresh();
        });

        return entrySelector;
    },

    addExcerptBox: function(element) {
        let that = this;
        let excerptBox = $('<div class="excerpt-box-container" style="position: absolute;"><textarea style="width: 100%; height: 100%; padding: 16px;" placeholder="Enter excerpt here"></textarea></div>');
        excerptBox.css('width', element.size.width);
        excerptBox.css('height', element.size.height);
        excerptBox.css('left', element.position.left);
        excerptBox.css('top', element.position.top);
        excerptBox.appendTo(this.container);

        excerptBox.find('textarea').on('change input drop paste keyup', function() {
            if (that.selectedEntry < 0) {
                addEntry('', '');
            }

            entries[that.selectedEntry].excerpt = $(this).val();
            that.refresh();
        });

        return excerptBox;
    },

    addImageBox: function(element) {
        let imageBox = $('<div class="image-box-container" style="position: absolute; background-color: #fff; padding: 16px;"><div class="image-box"></div></div>');
        imageBox.find('.image-box').css('width', element.size.width);
        imageBox.find('.image-box').css('height', element.size.height);
        imageBox.css('left', element.position.left);
        imageBox.css('top', element.position.top);
        imageBox.appendTo(this.container);
        return imageBox;
    },

    addNoobElement: function(element) {
        let noob = $('<div style="position: absolute; padding: 16px;">Noob</div>')
        noob.css('left', element.position.left);
        noob.css('top', element.position.top);
        noob.css('background-color', element.backgroundColor);
        noob.appendTo(this.container);
        return noob;
    },

    refresh: function() {
        if (this.selectedEntry < 0 && entries.length > 0) {
            this.selectedEntry = 0;
        }

        // Refresh select box
        let entrySelect = this.entrySelector.find('select');
        entrySelect[0].selectize.clearOptions();

        for (let i=0; i<entries.length; i++) {
            let entry = entries[i];
            entrySelect[0].selectize.addOption({
                value: i,
                text: entry.excerpt.length == 0 ? 'New entry' : entry.excerpt.substr(0, 40),
            });
        }

        entrySelect[0].selectize.setValue(this.selectedEntry, true);

        // Excerpt box
        if (this.selectedEntry < 0) {
            this.excerptBox.find('textarea').val('');
        } else {
            let entry = entries[this.selectedEntry];
            this.excerptBox.find('textarea').val(entry.excerpt);
        }
    },
}


$(document).ready(function() {
    setupCsrfForAjax();
    leadPreviewer.init();

    page1.init();


    // Save and cancel
    $('.save-button').click(function() {
        var data = { entries: JSON.stringify(entries) };
        redirectPost(window.location.pathname, data, csrf_token);
    });
    $('.save-and-next-button').click(function() {
    });
    $('.cancel-button').click(function() {
        if (confirm('Are you sure you want to cancel the changes?')) {
            window.location.href = cancelUrl;
        }
    });
});
