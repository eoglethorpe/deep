let source = {
    init: function() {
        let that = this;

        // The new source field
        $('.source-new').on('dragover', function(e) {
            e.originalEvent.preventDefault();
            return false;
        });

        // Humanitarian profile fields
        $('.human-source').on('drop', that.getDropEvent(function(container, newSource) {
            newData['human']['source'][container.data('human-pk')] = getNewSourceData(newData['human']['source'][container.data('human-pk')]);
            newData['human']['source'][container.data('human-pk')]['new']
                .push(newSource);
            that.refreshSources(container, newData['human']['source'][container.data('human-pk')], data['human']['source'][container.data('human-pk')], humanitarianProfileDecay);
        }));

        $('.human-source').each(function() {
            newData['human']['source'][$(this).data('human-pk')] = getNewSourceData(newData['human']['source'][$(this).data('human-pk')]);
            that.refreshSources($(this), newData['human']['source'][$(this).data('human-pk')], data['human']['source'][$(this).data('human-pk')], humanitarianProfileDecay);
        });

        // People in need fields
        function setupPeopleSource(type) {
            $('.people-' + type + '-source').on('drop', that.getDropEvent(function(container, newSource) {
                newData['people'][type + '-source'][container.data('people-pk')] = getNewSourceData(newData['people'][type + '-source'][container.data('people-pk')]);
                newData['people'][type + '-source'][container.data('people-pk')]['new']
                .push(newSource);
                that.refreshSources(container, newData['people'][type + '-source'][container.data('people-pk')], data['people'][type + '-source'][container.data('people-pk')], peopleInNeedDecay, 'bottom');
            }));

            $('.people-' + type + '-source').each(function() {
                newData['people'][type + '-source'][$(this).data('people-pk')] = getNewSourceData(newData['people'][type + '-source'][$(this).data('people-pk')]);
                that.refreshSources($(this), newData['people'][type + '-source'][$(this).data('people-pk')], data['people'][type + '-source'][$(this).data('people-pk')], peopleInNeedDecay, 'bottom');
            });
        }

        setupPeopleSource('total');
        setupPeopleSource('at-risk');
        setupPeopleSource('moderate');
        setupPeopleSource('severe');
        setupPeopleSource('planned');

        // ipc
        $('.ipc .ipc-source').on('drop', that.getDropEvent(function(container, newSource) {
            newData['ipc'][container.data('ipc')] = getNewSourceData(newData['ipc'][container.data('ipc')]);
            newData['ipc'][container.data('ipc')]['new']
                .push(newSource);
            that.refreshSources(container, newData['ipc'][container.data('ipc')]);
        }));

        $('.ipc .ipc-source').each(function() {
            newData['ipc'][$(this).data('ipc')] = getNewSourceData(newData['ipc'][$(this).data('ipc')]);
            that.refreshSources($(this), newData['ipc'][$(this).data('ipc')]);
        });

        $('.ipc-forecasted .ipc-forecast-source').on('drop', that.getDropEvent(function(container, newSource) {
            newData['ipc-forecast'][container.data('ipc')] = getNewSourceData(newData['ipc-forecast'][container.data('ipc')]);
            newData['ipc-forecast'][container.data('ipc')]['new']
                .push(newSource);
            that.refreshSources(container, newData['ipc-forecast'][container.data('ipc')]);
        }));

        $('.ipc-forecasted .ipc-forecast-source').each(function() {
            newData['ipc-forecast'][$(this).data('ipc')] = getNewSourceData(newData['ipc-forecast'][$(this).data('ipc')]);
            that.refreshSources($(this), newData['ipc-forecast'][$(this).data('ipc')]);
        });

        // access
        $('.access-source').on('drop', that.getDropEvent(function(container, newSource) {
            newData['access-extra']['source'][container.data('access-pk')] = getNewSourceData(newData['access-extra']['source'][container.data('access-pk')]);
            newData['access-extra']['source'][container.data('access-pk')]['new']
                .push(newSource);
            that.refreshSources(container, newData['access-extra']['source'][container.data('access-pk')]);
        }));

        $('.access-source').each(function() {
            newData['access-extra']['source'][$(this).data('access-pk')] = getNewSourceData(newData['access-extra']['source'][$(this).data('access-pk')]);
            that.refreshSources($(this), newData['access-extra']['source'][$(this).data('access-pk')]);
        });

        // access pin
        $('.access-pin-source').on('drop', that.getDropEvent(function(container, newSource) {
            newData['access-pin']['source'][container.data('access-pin-pk')] = getNewSourceData(newData['access-pin']['source'][container.data('access-pin-pk')]);
            newData['access-pin']['source'][container.data('access-pin-pk')]['new']
                .push(newSource);
            that.refreshSources(container, newData['access-pin']['source'][container.data('access-pin-pk')], data['access-pin']['source'][container.data('access-pin-pk')], humanitarianAccessDecay, 'bottom');
        }));

        $('.access-pin-source').each(function() {
            newData['access-pin']['source'][$(this).data('access-pin-pk')] = getNewSourceData(newData['access-pin']['source'][$(this).data('access-pin-pk')]);
            that.refreshSources($(this), newData['access-pin']['source'][$(this).data('access-pin-pk')], data['access-pin']['source'][$(this).data('access-pin-pk')], humanitarianAccessDecay, 'bottom');
        });

        //Flip source
        $('body').on('click','.source-flip',function(e){
            let sourceExcerptText = $(this).parent().find('.source-excerpt-text');
            let sourceDetails = $(this).parent().find('.source-details');
            if(sourceExcerptText.is(':visible')){
                sourceExcerptText.hide();
                sourceDetails[0].style.display = 'flex';
            }
            else{
                sourceDetails[0].style.display = 'none';
                sourceExcerptText.show();
            }
        });


    },

    getDropEvent: function(refreshCallback) {
        return function(e) {
            let droppedText = e.originalEvent.dataTransfer.getData("Text");
            let ids = droppedText.split(':');
            if (ids.length != 2)
                return;

            let i = +ids[0];
            let j = +ids[1];
            if (isNaN(i) || isNaN(j))
                return;


            let entry;
            if (templateData){
                entry = entriesManager.entries.find(e => e.id == i);
            }
            else {
                entry = originalEntries.find(e => e.id == i);
            }
            let information = entry.informations.find(info => info.id == j);

            let newSource = {
                name: entry.lead_source,
                url: entry.lead_url,
                date: (!templateData) ? information.date : '',
                entryId: i,
                informationId: j,
            };

            refreshCallback($(this), newSource);
        };
    },

    refreshSources: function(container, sourceData, oldSourceData, decayer, direction) {
        if (oldSourceData && decayer) {
            decayer.updateSource(container, sourceData, oldSourceData);
        }

        sourceData = getNewSourceData(sourceData);
        validateSource(container, sourceData);

        let that = this;
        container.empty();

        if (sourceData['old'] && sourceData['old'].length > 0) {
            let sourceElement = $('<div class="source">' + sourceData['old'] + '<div class="delete fa fa-times"></div></div>');
            sourceElement.appendTo(container);
            sourceElement.find('.delete').click(function() {
                sourceData['old'] = '';
                that.refreshSources(container, sourceData, oldSourceData);
            });
        }

        let sources = sourceData['new'];

        for (let i=0; i<sources.length; i++) {
            let source = sources[i];
            let sourceElement = $('.source-template').clone();
            sourceElement.removeClass('source-template').addClass('source');

            sourceElement.find('.name').text(source.name);
            sourceElement.find('date').text(source.date);
            sourceElement.find('.delete').click(function() {
                sourceData['new'].splice(i, 1);
                that.refreshSources(container, sourceData, oldSourceData);
            });

            sourceElement.appendTo(container);
            sourceElement.css('display','flex');

            sourceElement.click(function(e) {
                if (source.entryId != undefined && source.informationId != undefined) {
                    let entry;
                    if (templateData) {
                        entry = entriesManager.entries.find(e => e.id == source.entryId);
                    }
                    else {
                        entry = originalEntries.find(e => e.id == source.entryId);
                    }

                    if (entry) {
                        let information = entry.informations.find(info => info.id == source.informationId);
                        if (information) {
                            let displayCard = $(this).find('.display-card');

                            if (entry.lead_url) {
                                displayCard.find('.source-url').attr('href', entry.lead_url);
                            }
                            displayCard.find('.source-excerpt-text').text(information.excerpt);
                            displayCard.find('.lead-title-details').text(entry.lead_title);
                            displayCard.find('.added-by-details').text(entry.created_by_name?entry.created_by_name:entry.modified_by_name);
                            displayCard.find('.date-of-sub-details').text(formatDate(entry.created_at?entry.created_at:entry.modified_at));

                            if (templateData) {
                                displayCard.find('.reliability-color').css('opacity', '0');
                                displayCard.find('.severity-color').css('opacity', '0');
                            }
                            else {
                                displayCard.find('.reliability-details').text(RELIABILITIES[information.reliability]);
                                displayCard.find('.severity-details').text(RELIABILITIES[information.severity]);
                                displayCard.find('.reliability-color')[0].className = 'reliability-color _' + information.reliability;
                                displayCard.find('.severity-color')[0].className = 'severity-color _' + information.severity;
                            }


                            //For humanitarian-profile tab the display card is in right
                            if (!direction) {
                                displayCard.addClass('display-card-right');
                            } else {
                                displayCard.addClass('display-card-' + direction);
                            }

                            displayCard.addClass('focus');

                            let that = $(this);

                            // Hide popup
                            $(document).one('mouseup', function (e){
                                if (!that.is(e.target) && that.has(e.target).length === 0) {
                                    that.find('.source-excerpt-text').show();
                                    that.find('.source-details')[0].style.display = 'none';
                                    that.find('.display-card').removeClass('focus');
                                }
                            });
                        }
                    }
                }
            });
        }
    },
};


function getNewSourceData(sourceData) {
    if (sourceData && sourceData['old'] === undefined) {
        sourceData = {
            'old': sourceData,
            'new': []
        };
    }
    if (!sourceData) {
        sourceData = {'old' : null, 'new': [] };
    }
    if (!sourceData['new']) {
        sourceData['new'] = [];
    }
    return sourceData;
}


function getOldSourceData(sourceData) {
    sourceData = getNewSourceData(sourceData);
    if (!sourceData['old']) {
        sourceData['old'] = null;
    }
    return sourceData['old'];
};


function isSourceEmpty(sourceData) {
    sourceData = getNewSourceData(sourceData);
    return !sourceData.old && sourceData.new.length == 0;
}
