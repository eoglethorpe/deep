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
            else if (element.type == 'number2d') {
                this.addNumber2d(element);
            }
        }

        this.refresh();
    },

    addEntrySelector: function(element) {
        let that = this;
        let entrySelector = $('<div class="entry-selector-container"><select><option value="">Select an entry</option></select></div>');

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
        let excerptBox = $('<div class="excerpt-box-container"><label>Excerpt</label><textarea placeholder="Enter excerpt here"></textarea></div>');
        excerptBox.css('width', element.size.width);
        excerptBox.css('height', element.size.height);
        excerptBox.css('left', element.position.left);
        excerptBox.css('top', element.position.top);
        excerptBox.appendTo(this.container);

        if (element.label) {
            excerptBox.find('label').text(element.label);
        }

        let textArea = excerptBox.find('textarea');
        textArea.on('change input drop paste keyup', function() {
            if (that.selectedEntryIndex < 0) {
                addEntry('', '');
            }

            entries[that.selectedEntryIndex].excerpt = $(this).val();
            that.refresh();
        });

        excerptBox.append('<a class="fa fa-circle"></a>');
        excerptBox.find('a').click(function() {
            let text = textArea.val();
            textArea.val(reformatText(text));
            textArea.trigger('change');
        });

        return excerptBox;
    },

    addImageBox: function(element) {
        let imageBox = $('<div class="image-box-container"><label>Image</label><div class="image-box"></div></div>');
        imageBox.css('width', element.size.width);
        imageBox.css('height', element.size.height);
        imageBox.css('left', element.position.left);
        imageBox.css('top', element.position.top);
        imageBox.appendTo(this.container);

        if (element.label) {
            imageBox.find('label').text(element.label);
        }
        return imageBox;
    },

    addMatrix1d: function(element) {
        let that = this;

        let matrix = $('<div class="matrix1d" data-id="' + element.id + '"></div>');
        matrix.append('<div class="title">' + element.title + '</div>');
        matrix.css('left', element.position.left);
        matrix.css('top', element.position.top);
        matrix.css('width', element.width);

        let pillarsContainer = $('<div class="pillars"></div>');
        matrix.append(pillarsContainer);

        for (let i=0; i<element.pillars.length; i++) {
            let pillar = element.pillars[i];
            let pillarElement = $('<div class="pillar" title="' + pillar.tooltip + '" data-id="' + pillar.id + '"></div>');

            pillarElement.append($('<div class="title">' + pillar.name + '</div>'));
            let subpillarsContainer = $('<div class="subpillars"></div>');
            pillarElement.append(subpillarsContainer);

            for (let j=0; j<pillar.subpillars.length; j++) {
                let subpillar = pillar.subpillars[j];
                let subpillarElement = $('<div class="subpillar" data-id="' + subpillar.id + '"></div>');

                subpillarElement.append($('<div class="title">' + subpillar.name + '</div>'));
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
        let matrix = $('<div class="matrix2d" data-id="' + element.id + '"></div>');
        matrix.append('<div class="title">' + element.title + '</div>');
        matrix.css('left', element.position.left);
        matrix.css('top', element.position.top);
        matrix.css('width', element.width);

        let table = $('<table></table>');
        matrix.append(table);

        let sectorsContainer = $('<tr></tr>');
        sectorsContainer.append($('<td></td>'));
        sectorsContainer.append($('<td></td>'));
        table.append(sectorsContainer);

        for (let i=0; i<element.sectors.length; i++) {
            let sector = element.sectors[i];
            let sectorElement = $('<td class="sector">' + sector.title + '</td>');
            sectorsContainer.append(sectorElement);
        }

        for (let i=0; i<element.pillars.length; i++) {
            let pillar = element.pillars[i];
            let color = pillar.color;

            let row = $('<tr></tr>');
            table.append(row);
            row.append('<td rowspan="' + pillar.subpillars.length + '" title="' + pillar.tooltip + '" style="background-color: ' + color + '; color: ' + getContrastYIQ(color) + ';" class="pillar">' + pillar.title + '</td>');

            for (let j=0; j<pillar.subpillars.length; j++) {
                if (j !== 0) {
                    row = $('<tr></tr>');
                    table.append(row);
                }

                let subpillar = pillar.subpillars[j];
                row.append('<td class="subpillar" title="' + subpillar.tooltip + '" style="background-color: ' + color + '; color: ' + getContrastYIQ(color) + ';">' + subpillar.title + '</td>');

                for (let k=0; k<element.sectors.length; k++) {
                    let sector = element.sectors[k];
                    let blockElement = $('<td class="sector-block" style="background-color: ' + color + '; color: ' + getContrastYIQ(color) + ';" data-pillar-id="' + pillar.id + '" data-subpillar-id="' + subpillar.id + '" data-sector-id="' + sector.id + '"></td>');
                    row.append(blockElement);

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
        }

        matrix.appendTo(this.container);
        return matrix;
    },
    
    addNumber2d: function(element) {
        let that = this;
        let matrix = $('<div class="number2d" data-id="' + element.id + '"></div>');
        matrix.append('<div class="title">' + element.title + '</div>');
        matrix.css('left', element.position.left);
        matrix.css('top', element.position.top);
        matrix.css('width', element.width);

        let table = $('<table></table>');
        matrix.append(table);

        let columnsContainer = $('<tr></tr>');
        columnsContainer.append($('<td></td>'));
        table.append(columnsContainer);

        for (let i=0; i<element.columns.length; i++) {
            let column = element.columns[i];
            let columnElement = $('<td class="column">' + column.title + '</td>');
            columnsContainer.append(columnElement);
        }

        columnsContainer.append('<td></td>');

        for (let i=0; i<element.rows.length; i++) {
            let row = element.rows[i];

            let tableRow = $('<tr></tr>');
            table.append(tableRow);
            tableRow.append('<td class="row">' + row.title + '</td>');

            for (let k=0; k<element.columns.length; k++) {
                let column = element.columns[k];
                let blockElement = $('<td class="column-block" data-row-id="' + row.id + '" data-column-id="' + column.id + '"></td>');
                tableRow.append(blockElement);

                let numberBox = $('<input type="text" class="number">');
                blockElement.append(numberBox);

                numberBox.on('change input paste drop', function(e) {
                    formatNumber($(this));
                    if (that.selectedEntryIndex < 0 || entries.length <= that.selectedEntryIndex) {
                        return;
                    }

                    let data = getEntryData(that.selectedEntryIndex, element.id);
                    if (!data.numbers) { data.numbers = []; }

                    let d = data.numbers.find(n => n.row == row.id && n.column == column.id);
                    if (!d) {
                        d = {
                            row: row.id,
                            column: column.id,
                            value: getNumberValue($(this)),
                        }
                        data.numbers.push(d);
                    } else {
                        d.value = getNumberValue($(this));
                    }

                    that.validateNumberRow(tableRow.find('.check-block'), data, row.id);
                });
            }

            let checkBlock = $('<td class="check-block" data-row-id="' + row.id + '"></td>');
            tableRow.append(checkBlock);
        }

        matrix.appendTo(this.container);
        return matrix;
    },

    validateNumberRow(checkBlock, data, rowId) {
        const relevantData = data.numbers.filter(d => d.row == rowId);
        const equal = relevantData.length == 0 ||
            (!!relevantData.reduce((a, b) => +a.value === +b.value ? a : NaN));

        if (equal) {
            checkBlock.html('<span class="fa fa-check"></span>');
        } else {
            checkBlock.html('<span class="fa fa-times"></span>');
        }
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
                text: entry.excerpt.length === 0 ? 'New entry' : entry.excerpt.substr(0, 40),
            });
        }

        entrySelect[0].selectize.setValue(this.selectedEntryIndex, true);

        // Excerpt box
        if (this.selectedEntryIndex < 0) {
            this.excerptBox.find('textarea').val('');
        } else {
            let entry = entries[this.selectedEntryIndex];

            this.excerptBox.find('textarea').val(entry.excerpt);
            if (entry.image.length === 0) {
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

                    if (data && data.selections) {
                        for (let j=0; j<data.selections.length; j++) {
                            matrix.find('.pillar[data-id="' + data.selections[j].pillar + '"]')
                                .find('.subpillar[data-id="' + data.selections[j].subpillar + '"]')
                                .addClass('active');
                        }
                    }
                }

                else if (templateElement.type == 'matrix2d') {
                    let matrix = this.container.find('.matrix2d[data-id="' + templateElement.id + '"]');
                    matrix.find('.sector-block.active').removeClass('active');

                    if (data && data.selections) {
                        for (let j=0; j<data.selections.length; j++) {
                            matrix.find('.sector-block[data-pillar-id="' + data.selections[j].pillar + '"][data-subpillar-id="' + data.selections[j].subpillar + '"][data-sector-id="' + data.selections[j].sector + '"]')
                                .addClass('active');
                        }
                    }
                }

                else if (templateElement.type == 'number2d') {
                    let matrix = this.container.find('.number2d[data-id="' + templateElement.id + '"]');
                    matrix.find('.column-block .number').each(function() {
                        $(this).val('');
                    });
                    if (data && data.numbers) {
                        for (let j=0; j<data.numbers.length; j++) {
                            const numberBox = matrix.find('.column-block[data-row-id="' + data.numbers[j].row + '"][data-column-id="' + data.numbers[j].column + '"] .number');
                            numberBox.val(data.numbers[j].value);
                            formatNumber(numberBox);
                        }

                        for (let j=0; j<templateElement.rows.length; j++) {
                            const rowId = templateElement.rows[j].id;
                            this.validateNumberRow(
                                matrix.find('.check-block[data-row-id="' + rowId + '"]'),
                                data, rowId
                            );
                        }
                    }
                }
            }
        }

        leadPreviewer.refresh();
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
};
