
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
            else if (element.type == 'matrix2d') {
                this.addMatrix2d(element);
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

                    let existingIndex = data.selections.findIndex(s => s.pillar == pillar.id && s.subpillar == subpillar.id);
                    if (existingIndex < 0) {
                        data.selections.push({ pillar: pillar.id, subpillar: subpillar.id });
                    } else {
                        data.selections.splice(existingIndex, 1);
                    }
                    that.refresh();
                });
            }

            pillarsContainer.append(pillarElement);
        }

        matrix.appendTo(this.container);
        return matrix;
    },

    addMatrix2d: function(element) {
        let that = this;
        let matrix = $('<div class="matrix2d" style="position: absolute; padding: 16px" data-id="' + element.id + '"></div>');
        matrix.append('<div class="title">' + element.title + '</div>');
        matrix.css('left', element.position.left);
        matrix.css('top', element.position.top);

        let sectorsContainer = $('<div class="sectors" style="display: flex; margin-left: 256px;"></div>');
        matrix.append(sectorsContainer);

        for (let i=0; i<element.sectors.length; i++) {
            let sector = element.sectors[i];
            let sectorElement = $('<div class="sector" data-id="' + sector.id + '"></div>');
            sectorElement.append('<div class="title" style="padding: 16px; width: 100px;">' + sector.title + '</div>');
            sectorsContainer.append(sectorElement);
        }

        let pillarsContainer = $('<div class="pillars"></div>');
        matrix.append(pillarsContainer);

        for (let i=0; i<element.pillars.length; i++) {
            let pillar = element.pillars[i];
            let pillarElement = $('<div class="pillar" data-id="' + pillar.id + '" style="display: flex;"></div>');
            pillarElement.append('<div class="title" style="padding: 16px; width: 100px;">' + pillar.title + '</div>');

            let subpillarsContainer = $('<div class="subpillars"></div>');
            pillarElement.append(subpillarsContainer);

            for (let j=0; j<pillar.subpillars.length; j++) {
                let subpillar = pillar.subpillars[j];
                let subpillarElement = $('<div class="subpillar" data-id="' + subpillar.id + '" style="display: flex;"></div>');
                subpillarElement.append('<div class="title" style="padding: 16px; width: 156px;">' + subpillar.title + '</div>');
                subpillarsContainer.append(subpillarElement);

                let blocksContainer = $('<div class="sector-blocks" style="display: flex;"></div>');
                subpillarElement.append(blocksContainer);

                for (let k=0; k<element.sectors.length; k++) {
                    let sector = element.sectors[k];
                    let blockElement = $('<div class="sector-block" data-id="' + sector.id + '" style="width: 100px; border: 1px solid white;"></div>');
                    blocksContainer.append(blockElement);


                    // Handle drop and click
                    blockElement.on('dragover', function(e) { e.originalEvent.preventDefault(); });
                    blockElement.on('drop', function(e) { that.dropExcerpt(e); $(this).click(); });
                    blockElement.on('click', function(e) {
                        if (that.selectedEntryIndex < 0 || entries.length <= that.selectedEntryIndex) {
                            return;
                        }

                        let data = getEntryData(that.selectedEntryIndex, element.id);
                        if (!data.selections) { data.selections = []; }

                        let existingIndex = data.selections.findIndex(s => s.pillar == pillar.id && s.subpillar == subpillar.id && s.sector == sector.id);
                        if (existingIndex < 0) {
                            data.selections.push({ pillar: pillar.id, subpillar: subpillar.id, sector: sector.id });
                        } else {
                            data.selections.splice(existingIndex, 1);
                        }
                        that.refresh();
                    });
                }
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

            for (let i=0; i<templateData.elements.length; i++) {
                let templateElement = templateData.elements[i];
                if (templateElement.page != 'page-one') {
                    continue;
                }

                let data = entry.elements.find(d => d.id == templateElement.id);

                if (templateElement.type == 'matrix1d') {
                    let matrix = this.container.find('.matrix1d[data-id="' + templateElement.id + '"]');
                    matrix.find('.subpillar.active').removeClass('active');

                    if (data) {
                        for (let j=0; j<data.selections.length; j++) {
                            matrix.find('.pillar[data-id="' + data.selections[j].pillar + '"]')
                                .find('.subpillar[data-id="' + data.selections[j].subpillar + '"]')
                                .addClass('active');
                        }
                    }

                    // TODO Use .active in scss instead of here
                    matrix.find('.subpillar').css('background-color', 'transparent');
                    matrix.find('.subpillar.active').css('background-color', 'rgba(0,0,0,0.3)');
                }

                else if (templateElement.type == 'matrix2d') {
                    let matrix = this.container.find('.matrix2d[data-id="' + templateElement.id + '"]');
                    matrix.find('.sector-block.active').removeClass('active');

                    if (data) {
                        for (let j=0; j<data.selections.length; j++) {
                            matrix.find('.pillar[data-id="' + data.selections[j].pillar + '"]')
                                .find('.subpillar[data-id="' + data.selections[j].subpillar + '"]')
                                .find('.sector-block[data-id="' + data.selections[j].sector + '"]')
                                .addClass('active');
                        }
                    }

                    // TODO Use .active in scss instead of here
                    matrix.find('.sector-block').css('background-color', 'transparent');
                    matrix.find('.sector-block.active').css('background-color', 'rgba(0,0,0,0.3)');
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
                this.addExcerptBox(element);
            }

            else if (element.type == 'number-input') {
                this.addInputElement(element, 'number-input', 'input', $('<input type="number", placeholder="Enter number">'));
            }
            else if (element.type == 'date-input') {
                this.addInputElement(element, 'date-input', 'input', $('<input type="date", placeholder="Enter number">'));
            }
            else if (element.type == 'multiselect') {
                this.addMultiselect(element);
            }
            else if (element.type == 'scale') {
                this.addScale(element);
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

    addInputElement: function(element, className, childSelector, dom) {
        let that = this;
        let inputElement = $('<div data-id="' + element.id + '" class="input-element ' + className + '" style="position: absolute;"></div>');
        inputElement.css('width', element.size.width);
        inputElement.css('height', element.size.height);
        inputElement.css('left', element.position.left);
        inputElement.css('top', element.position.top);

        inputElement.append($('<label>' + element.label + '</label>'));
        inputElement.append(dom);
        inputElement.appendTo(this.template);

        this.container.on('change input paste drop', '.input-element[data-id="' + element.id + '"] ' + childSelector, function() {
            let index = parseInt($(this).closest('.entry').data('index'));
            if (index != NaN) {
                let data = getEntryData(index, element.id);
                data.value = $(this).val();
            }
        });
    },

    addMultiselect: function(element) {
        let that = this;
        let selectContainer = $('<div data-id="' + element.id + '" class="multiselect" style="position: absolute;"></div>');
        selectContainer.css('width', element.size.width);
        selectContainer.css('height', element.size.height);
        selectContainer.css('left', element.position.left);
        selectContainer.css('top', element.position.top);

        selectContainer.append($('<label>' + element.label + '</label>'));
        selectContainer.append($('<select multiple><option values="">Type for options</option></select>'));

        for (let i=0; i<element.options.length; i++) {
            let option = element.options[i];
            selectContainer.find('select').append(
                $('<option value="' + option.id + '">' + option.text + '</option>')
            );
        }
        selectContainer.appendTo(this.template);

        this.container.on('change', '.multiselect[data-id="' + element.id + '"] select', function() {
            let index = parseInt($(this).closest('.entry').data('index'));
            if (index != NaN) {
                let data = getEntryData(index, element.id);
                data.value = $(this).val();
            }
        });
    },

    addScale: function(element) {
        let that = this;
        let scaleContainer = $('<div class="scale-container" data-id="' + element.id + '" style="position: absolute;"></div>');
        scaleContainer.css('width', element.size.width);
        scaleContainer.css('height', element.size.height);
        scaleContainer.css('left', element.position.left);
        scaleContainer.css('top', element.position.top);

        scaleContainer.append($('<label>' + element.label + '</label>'));
        scaleContainer.append($('<div class="scale" style="display: flex; justify-content: space-between; align-items: center;"></div>'));
        for (let i=0; i<element.scaleValues.length; i++) {
            let value = element.scaleValues[i];
            let scaleElement = $('<span style="width: 10px; height: 20px; margin: 1px;" data-id="' + value.id + '"></span>');
            scaleElement.css('background-color', value.color);
            scaleElement.attr('title', value.name);
            scaleContainer.find('.scale').append(scaleElement);
        }

        this.container.on('click', '.scale-container[data-id="' + element.id + '"] .scale span', function() {
            let index = parseInt($(this).closest('.entry').data('index'));
            if (index != NaN) {
                let data = getEntryData(index, element.id);
                data.value = $(this).data('id');

                $(this).closest('.scale').find('span').removeClass('active');
                $(this).addClass('active');


                // TODO remove and use scss
                let scales = $('.scale-container .scale span');
                scales.css('width', '10px');
                scales.css('height', '20px');
                let selectedScales = $('.scale-container .scale span.active');
                selectedScales.css('width', '12px');
                selectedScales.css('height', '24px');
            }
        });

        scaleContainer.appendTo(this.template);
    },

    refresh: function() {
        this.container.find('.entries').empty();
        for (let i=0; i<entries.length; i++) {
            let entry = entries[i];
            let entryContainer = this.template.clone();

            entryContainer.removeClass('entry-template').addClass('entry');
            entryContainer.data('index', i);
            entryContainer.css('position', 'relative');

            entryContainer.appendTo(this.container.find('.entries'));
            entryContainer.show();

            entryContainer.find('select').selectize();

            entryContainer.find('.excerpt-box-container textarea').val(entry.excerpt);

            for (let i=0; i<templateData.elements.length; i++) {
                let templateElement = templateData.elements[i];
                if (templateElement.page != 'page-two') {
                    continue;
                }

                let data = entry.elements.find(d => d.id == templateElement.id);

                if (templateElement.type == 'number-input' || templateElement.type == 'date-input') {
                    if (data) {
                        entryContainer.find('.input-element[data-id="' + data.id + '"] input').val(data.value);
                    }
                }
                else if (templateElement.type == 'multiselect') {
                    if (data) {
                        entryContainer.find('.multiselect[data-id="' + data.id + '"] select')[0].selectize.setValue(data.value);
                    }
                }
                else if (templateElement.type == 'scale') {
                    entryContainer.find('.scale-container[data-id="' + templateElement.id + '"] .scale span.active').removeClass('active');
                    let selected = templateElement.scaleValues.find(e => e.default==true).id;
                    if (data && data.value) {
                        selected = data.value;
                    }
                    entryContainer.find('.scale-container[data-id="' + templateElement.id + '"] .scale span[data-id="' + selected + '"]').addClass('active');
                }
            }
        }

        // TODO remove and use scss
        let scales = $('.scale-container .scale span');
        scales.css('width', '10px');
        scales.css('height', '20px');
        let selectedScales = $('.scale-container .scale span.active');
        selectedScales.css('width', '12px');
        selectedScales.css('height', '24px');
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
