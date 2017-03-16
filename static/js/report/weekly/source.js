let source = {
    init: function() {
        let that = this;

        // The new source field
        $('.human-source-new').on('dragover', function(e) {
            e.originalEvent.preventDefault();
            return false;
        });
        $('.human-source-new').on('drop', function(e) {
            let droppedText = e.originalEvent.dataTransfer.getData("Text");
            let ids = droppedText.split(':');
            if (ids.length != 2)
                return;

            let i = +ids[0];
            let j = +ids[1];
            if (isNaN(i) || isNaN(j))
                return;

            let entry = entries[i];
            let information = entry.informations[j];

            let newSource = {
                name: entry.lead_source,
                url: entry.lead_url,
                date: information.date,
                entryId: i,
                informationId: j,
            };

            data['human']['source'][$(this).data('human-pk')]['new']
                .push(newSource);

            that.refreshSources($(this), data['human']['source'][$(this).data('human-pk')]);
        });

        $('.human-source-new').each(function() {
            that.refreshSources($(this), data['human']['source'][$(this).data('human-pk')]);
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

    refreshSources: function(container, sourceData) {
        if (!sourceData) {
            sourceData = {'old' : null, 'new': [] };
        }
        if (!sourceData['new']) {
            sourceData['new'] = []
        }

        let that = this;
        container.empty();

        let sources = sourceData['new'];
        for (let i=0; i<sources.length; i++) {
            let source = sources[i];
            let sourceElement = $('.source-template').clone();
            sourceElement.removeClass('source-template').addClass('source');

            sourceElement.find('.name').text(source.name);
            sourceElement.find('date').text(source.date);
            sourceElement.find('.delete').click(function() {
                sourceData['new'].splice(i, 1);
                that.refreshSources(container, sourceData);
            });

            sourceElement.appendTo(container);
            sourceElement.css('display','flex');

            sourceElement.click(function(e) {
                if (source.entryId != undefined && source.informationId != undefined) {
                    let entry = originalEntries[source.entryId];
                    if (entry) {
                        let information = entry.informations[source.informationId];
                        if (information) {
                            let displayCard = $(this).find('.display-card');

                            if (entry.lead_url) {
                                displayCard.find('.source-url').attr('href', entry.lead_url);
                            }
                            displayCard.find('.source-excerpt-text').text(information.excerpt);
                            displayCard.find('.lead-title-details').text(entry.lead_title);
                            displayCard.find('.added-by-details').text(entry.created_by_name?entry.created_by_name:entry.modified_by_name);
                            displayCard.find('.reliability-details').text(RELIABILITIES[information.reliability]);
                            displayCard.find('.severity-details').text(RELIABILITIES[information.severity]);
                            displayCard.find('.date-of-sub-details').text(formatDate(entry.created_at?entry.created_at:entry.modified_at));

                            displayCard.find('.reliability-color')[0].className = 'reliability-color _' + information.reliability;
                            displayCard.find('.severity-color')[0].className = 'severity-color _' + information.severity;

                            //For humanitarian-profile tab the display card is in right
                            displayCard.addClass('display-card-right');

                            displayCard.addClass('focus');

                            let that = $(this);

                            // Hide popup
                            $(document).mouseup(function (e){
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



function getOldSourceData(sourceData) {
    if (!sourceData) {
        sourceData = {'old' : null, 'new': [] };
    }
    if (!sourceData['old']) {
        sourceData['old'] = null;
    }
    return sourceData['old'];
};
