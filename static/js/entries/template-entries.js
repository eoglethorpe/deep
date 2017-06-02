
let entriesList = {
    init: function(container) {
        this.refresh = this.refresh.bind(this);

        this.container = container;
        this.entryTemplate = this.container.find('.entry-template');
        this.template = this.container.find('.information-template');

        for (let i=0; i<templateData.elements.length; i++) {
            let element = templateData.elements[i];
            if (element.type == 'matrix2d' && element.list) {
                this.addMatrix2dList(element);
            }
            else if (element.type == 'matrix1d' && element.list) {
                this.addMatrix1dList(element);
            }
            else if (element.id == 'page-two-excerpt') {
                this.addExcerpt(element);
            }
            else if (element.type == 'number-input' || element.type == 'date-input') {
                this.addInputElement(element);
            }
            else if (element.type == 'multiselect' || element.type == 'geolocations' || element.type == 'organigram') {
                this.addList(element);
            }
            else if (element.type == 'scale') {
                this.addScale(element);
            }

            entriesManager.addFilterFor(element);
        }
    },

    addExcerpt: function(element) {
        let excerpt = $('<div class="element excerpt-container" style="position: absolute";></div>');
        excerpt.css('width', element.width);
        excerpt.css('left', element.left);
        excerpt.appendTo(this.template);
    },

    addInputElement: function(element) {
        let input = $('<div class="element input-container" data-id="' + element.id + '" style="position: absolute;"></div>');
        input.css('width', element.size.width);
        input.css('height', element.size.height);
        input.css('left', element.position.left);
        input.css('top', element.position.top);
        input.appendTo(this.template);

        input.append($('<label>' + element.label + '</label>'));
        input.append($('<div class="data"></div>'));
    },

    addList: function(element) {
        let list = $('<div class="element list-container" data-id="' + element.id + '" style="position: absolute;"></div>');
        list.css('left', element.left);
        list.appendTo(this.template);

        list.append($('<label>' + element.label + '</label>'));
        list.append($('<div class="data"></div>'));
    },

    addMatrix1dList: function(element) {
        let list = $('<div class="element list-container matrix1d" data-id="' + element.id + '" style="position: absolute;"></div>');
        list.css('left', element.list.left);
        list.appendTo(this.template);

        list.append($('<label>' + element.title + '</label>'));
        list.append($('<div class="data"></div>'));
    },

    addMatrix2dList: function(element) {
        let list = $('<div class="element list-container matrix2d" data-id="' + element.id + '" style="position: absolute;"></div>');
        list.css('left', element.list.left);
        list.appendTo(this.template);

        list.append($('<label>' + element.title + '</label>'));
        list.append($('<div class="data"></div>'));
    },

    addScale: function(element) {
        let scale = $('<div class="element scale-container" data-id="' + element.id + '" style="position: absolute;"></div>');
        scale.css('width', element.size.width);
        scale.css('height', element.size.height);
        scale.css('left', element.position.left);
        scale.css('top', element.position.top);
        scale.appendTo(this.template);

        scale.append($('<label>' + element.label + '</label>'));
        scale.append($('<div class="scale"></div>'));
        for (let i=0; i<element.scaleValues.length; i++) {
            let value = element.scaleValues[i];
            let scaleElement = $('<span data-id="' + value.id + '"></span>');
            scaleElement.attr('title', value.name);
            scaleElement.css('background-color', value.color);
            scale.find('.scale').append(scaleElement);
        }
    },

    refresh: function() {
        this.container.find('.entry').remove();

        let entries = entriesManager.filteredEntries;
        for (let i=0; i<entries.length; i++) {
            let entry = entries[i];
            if (entry.informations.length == 0) {
                continue;
            }

            let entryDom = this.entryTemplate.clone();
            entryDom.removeClass('entry-template').addClass('entry');

            entryDom.find('h2').html(
                searchAndHighlight(entry.lead_title, $('#filters input[data-id="lead-title"]').val())
            );
            entryDom.find('.created-on').text(formatDate(entry.created_at));
            entryDom.find('.created-by').text(entry.created_by_name);

            entryDom.find('.edit-btn').attr('href', '/' + eventId + '/entries/edit/' + entry.id);
            entryDom.find('.delete-btn').click(function() {
                if (confirm('Are you sure you want to delete this entry?')) {
                    redirectPost('/' + eventId + '/entries/delete/', { id: entry.id }, csrf_token);
                }
            });

            entryDom.appendTo(this.container);
            entryDom.show();

            for (let j=0; j<entry.informations.length; j++) {
                let information = entry.informations[j];
                let infoDom = this.template.clone();
                infoDom.removeClass('information-template').addClass('information');

                if (information.image && information.image.length > 0) {
                    infoDom.find('.excerpt-container').html(
                        '<img src="' + information.image + '">'
                    );
                } else {
                    infoDom.find('.excerpt-container').html(
                        searchAndHighlight(information.excerpt, $('#filters input[data-id="search-excerpt"]').val())
                    );
                }

                for (let k=0; k<templateData.elements.length; k++) {
                    let templateElement = templateData.elements[k];

                    if (templateElement.type == 'matrix2d' && templateElement.list) {
                        let data = information.elements.find(d => d.id == templateElement.id);
                        if (data) {
                            let dom = infoDom.find('.list-container[data-id="' + data.id + '"]');
                            let text = '';
                            if (data.selections) {
                                for (let l=0; l<data.selections.length; l++) {
                                    let pillar = templateElement.pillars.find(p => p.id == data.selections[l].pillar);
                                    let subpillar = pillar.subpillars.find(s => s.id == data.selections[l].subpillar);
                                    let sector = templateElement.sectors.find(s => s.id == data.selections[l].sector);
                                    if (!pillar || !subpillar || !sector) {
                                        continue;
                                    }

                                    text += '<div class="row">'
                                    text += '<div class="col"><div>' + pillar.title + '</div><div>' + subpillar.title + '</div></div>';
                                    text += '<div class="col"><div>' + sector.title + '</div><div>';

                                    if (data.selections[l].subsectors) {
                                        for (let m=0; m<data.selections[l].subsectors.length; m++) {
                                            text += '<span>' + sector.subsectors.find(s => s.id == data.selections[l].subsectors[m]).title + '</span>';
                                        }
                                    }

                                    text += '</div></div>';
                                    text += '</div>';
                                }
                            }
                            dom.find('.data').html(text);
                        }
                        continue;
                    }
                    else if (templateElement.type == 'matrix1d' && templateElement.list) {
                        let data = information.elements.find(d => d.id == templateElement.id);
                        if (data) {
                            let dom = infoDom.find('.list-container[data-id="' + data.id + '"]');
                            let text = '';
                            if (data.selections) {
                                for (let l=0; l<data.selections.length; l++) {
                                    let pillar = templateElement.pillars.find(p => p.id == data.selections[l].pillar);
                                    let subpillar = pillar.subpillars.find(s => s.id == data.selections[l].subpillar);
                                    if (!pillar || !subpillar) {
                                        continue;
                                    }

                                    text += '<div class="row">'
                                    text += '<div class="col"><div>' + pillar.name + '</div><div>' + subpillar.name + '</div></div>';
                                    text += '</div>';
                                }
                            }
                            dom.find('.data').html(text);
                        }
                        continue;
                    }

                    if (templateElement.page != 'page-two') {
                        continue;
                    }

                    let data = information.elements.find(d => d.id == templateElement.id);
                    if (data) {
                        if (templateElement.type == 'number-input') {
                            let dom = infoDom.find('.input-container[data-id="' + data.id + '"]');
                            dom.find('.data').text(data.value);
                        }
                        else if (templateElement.type == 'date-input') {
                            let dom = infoDom.find('.input-container[data-id="' + data.id + '"]');
                            dom.find('.data').text(formatDate(data.value));
                        }
                        else if (templateElement.type == 'multiselect') {
                            let dom = infoDom.find('.list-container[data-id="' + data.id + '"]');
                            let text = '';
                            if (data.value) {
                                for (let l=0; l<data.value.length; l++) {
                                    text += '<div>' + templateElement.options.find(o => o.id == data.value[l]).text + '</div>';
                                }
                            }
                            dom.find('.data').html(text);
                        }
                        else if (templateElement.type == 'geolocations') {
                            let dom = infoDom.find('.list-container[data-id="' + data.id + '"]');
                            let text = '';
                            if (data.value) {
                                for (let l=0; l<data.value.length; l++) {
                                    text += '<div>' + data.value[l].split(':')[2] + '</div>';
                                }
                            }
                            dom.find('.data').html(text);
                        }
                        else if (templateElement.type == 'organigram') {
                            let dom = infoDom.find('.list-container[data-id="' + data.id + '"]');
                            let text = '';
                            if (data.value) {
                                for (let l=0; l<data.value.length; l++) {
                                    text += '<div>' + templateElement.nodes.find(n => n.id == data.value[l]).name + '</div>';
                                }
                            }
                            dom.find('.data').html(text);
                        }
                        else if (templateElement.type == 'scale') {
                            let dom = infoDom.find('.scale-container[data-id="' + data.id + '"]');
                            let selected = templateElement.scaleValues.find(e => e.default == true).id;
                            if (data.value) {
                                selected = data.value;
                            }
                            dom.find('.scale span[data-id="' + selected + '"]').addClass('active');
                        }
                    } else {
                        if (templateElement.type == 'scale') {
                            let selected = templateElement.scaleValues.find(e => e.default == true).id;
                            infoDom.find('.scale-container[data-id="' + templateElement.id + '"]')
                                .find('.scale span[data-id="' + selected + '"]').addClass('active');
                        }
                    }
                }

                let infoContainer = $('<div class="information-container"></div>');
                infoDom.appendTo(infoContainer);
                infoContainer.appendTo(entryDom.find('.informations'));
                infoDom.show();

                infoDom.find('img').one('load', function() {
                    autoResize(infoDom);
                });
                autoResize(infoDom);
            }
        }

        $('.information-container').width(this.container.find('.information').width());
        $('#overflow-x div').width(this.container.find('.information').width());
    },
};


$(document).ready(function() {
    entriesManager.init(eventId, $('#filters'));
    entriesList.init($('#entries'));
    entriesManager.renderCallback = entriesList.refresh;
    entriesManager.readAll();

    $('#entries').height($(window).innerHeight() - $('body > nav').outerHeight() - $('#filters').outerHeight() - '16');

    $('#overflow-x, .information').on('scroll', function(){
        $('.informations').scrollLeft($(this).scrollLeft());
    });
});
