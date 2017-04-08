
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

    page1.selectedEntryIndex = entries.length - 1;
    page1.refresh();
}

function removeEntry(index) {
    entries.splice(index, 1);

    page1.selectedEntryIndex--;
    page1.refresh();
}

function addOrReplaceEntry(excerpt, image) {
    let index = entries.findIndex(e => e.excerpt == excerpt && e.image == image);
    if (index >= 0) {
        entries[index].excerpt = excerpt;
        entries[index].image = image;

        page1.selectedEntryIndex = index;
        page1.refresh();
    } else {
        addEntry(excerpt, image);
    }
}

function getEntryData(index, id) {
    let data = entries[index].elements.find(e => e.id == id);
    if (data) {
        return data;
    }

    data = {
        id: id,
    };
    entries[index].elements.push(data);
    return data;
}


let page1 = {
    init: function() {
        let that = this;
        this.selectedEntryIndex = -1;
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
            else if (element.type == 'matrix1d') {
                this.addMatrix1d(element);
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
            if (that.selectedEntryIndex >= 0 && that.selectedEntryIndex < entries.length) {
                removeEntry(that.selectedEntryIndex);
            }
        });

        // On entry selected
        entrySelector.find('select').change(function() {
            let temp = parseInt($(this).val());
            if (isNaN(temp)) {
                return;
            }
            that.selectedEntryIndex = temp;
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
            if (that.selectedEntryIndex < 0) {
                addEntry('', '');
            }

            entries[that.selectedEntryIndex].excerpt = $(this).val();
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

    addMatrix1d: function(element) {
        let that = this;

        let matrix = $('<div class="matrix1d" style="position: absolute; padding: 16px" data-id="' + element.id + '"></div>');
        matrix.append('<div class="title">' + element.title + '</div>');
        matrix.css('left', element.position.left);
        matrix.css('top', element.position.top);

        let pillarsContainer = $('<div class="pillars"></div>');
        matrix.append(pillarsContainer);

        for (let i=0; i<element.pillars.length; i++) {
            let pillar = element.pillars[i];
            let pillarElement = $('<div class="pillar" data-id="' + pillar.id + '"></div>');

            pillarElement.append($('<div class="title" style="display: inline-block; padding: 16px;">' + pillar.name + '</div>'));
            let subpillarsContainer = $('<div class="subpillars" style="display: inline-block;"></div>');
            pillarElement.append(subpillarsContainer);

            for (let j=0; j<pillar.subpillars.length; j++) {
                let subpillar = pillar.subpillars[j];
                let subpillarElement = $('<div class="subpillar" data-id="' + subpillar.id + '" style="display: inline-block;"></div>');

                subpillarElement.append($('<div class="title" style="display: inline-block; padding: 16px;">' + subpillar.name + '</div>'));
                subpillarsContainer.append(subpillarElement);

                subpillarElement.on('dragover', function(e) { e.originalEvent.preventDefault(); });
                subpillarElement.on('drop', function(e) { that.dropExcerpt(e); $(this).click(); });
                subpillarElement.on('click', function(e) {
                    if (that.selectedEntryIndex < 0 || entries.length <= that.selectedEntryIndex) {
                        return;
                    }

                    let data = getEntryData(that.selectedEntryIndex, element.id);
                    if (!data.selections) { data.selections = []; }
                    data.selections.push({ pillar: pillar.id, subpillar: subpillar.id });
                    that.refresh();
                });
            }

            pillarsContainer.append(pillarElement);
        }

        matrix.appendTo(this.container);
        return matrix;
    },

    refresh: function() {
        if (this.selectedEntryIndex < 0 && entries.length > 0) {
            this.selectedEntryIndex = 0;
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

        entrySelect[0].selectize.setValue(this.selectedEntryIndex, true);

        // Excerpt box
        if (this.selectedEntryIndex < 0) {
            this.excerptBox.find('textarea').val('');
        } else {
            let entry = entries[this.selectedEntryIndex];

            this.excerptBox.find('textarea').val(entry.excerpt);
            if (entry.image.length == 0) {
                this.imageBox.find('.image-box').html('');
            } else {
                this.imageBox.find('.image-box').html(
                    '<div class="image"><img src="' + entry.image + '"></div>'
                );
            }

            for (let i=0; i<entry.elements.length; i++) {
                let data = entry.elements[i];
                let templateElement = templateData.elements.find(e => e.id == data.id);
                if (templateElement) {

                    if (templateElement.type == 'matrix1d') {
                        let matrix = this.container.find('.matrix1d[data-id="' + data.id + '"]');
                        matrix.find('.subpillar.active').removeClass('active');
                        for (let j=0; j<data.selections.length; j++) {
                            matrix.find('.pillar[data-id="' + data.selections[j].pillar + '"]')
                                .find('.subpillar[data-id="' + data.selections[j].subpillar + '"]')
                                .addClass('active');
                        }

                        // TODO Use .active in scss instead of here
                        matrix.find('.subpillar').css('background-color', 'transparent');
                        matrix.find('.subpillar.active').css('background-color', 'rgba(0,0,0,0.3)');
                    }

                }
            }
        }
    },

    dropExcerpt: function(e) {
        let html = e.originalEvent.dataTransfer.getData('text/html');
        let excerpt = e.originalEvent.dataTransfer.getData('Text');
        let image = '';
        if ($(html).is('img')) {
            image = excerpt;
            excerpt = '';
        }

        addOrReplaceEntry(excerpt, image);
    },
}

let page2 = {
    init: function() {
        this.container = $('#page-two');
        this.template = this.container.find('.entry-template');

        for (let i=0; i<templateData.elements.length; i++) {
            let element = templateData.elements[i];
            if (element.page != 'page-two') {
                continue;
            }

            if (element.id == 'page-two-excerpt') {
                this.excerpBox = this.addExcerptBox(element);
            }
        }

        this.refresh();
    },

    addExcerptBox: function(element) {
        let that = this;
        let excerptBox = $('<div class="excerpt-box-container" style="position: absolute;"><textarea style="width: 100%; height: 100%; padding: 16px;" placeholder="Enter excerpt here"></textarea></div>');
        excerptBox.css('width', element.size.width);
        excerptBox.css('height', element.size.height);
        excerptBox.css('left', element.position.left);
        excerptBox.css('top', element.position.top);
        excerptBox.appendTo(this.template);

        this.container.on('change input paste drop', '.excerpt-box-container textarea', function() {
            let index = parseInt($(this).closest('.entry').data('index'));
            if (index != NaN) {
                entries[index].excerpt = $(this).val();
            }
        });
    },

    refresh: function() {
        this.container.find('.entries').empty();
        for (let i=0; i<entries.length; i++) {
            let entryContainer = this.template.clone();
            entryContainer.removeClass('entry-template').addClass('entry');
            entryContainer.data('index', i);
            entryContainer.css('position', 'relative');

            entryContainer.appendTo(this.container.find('.entries'));
            entryContainer.show();
        }
    },
};


$(document).ready(function() {
    setupCsrfForAjax();
    leadPreviewer.init();

    page1.init();
    page2.init();


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
