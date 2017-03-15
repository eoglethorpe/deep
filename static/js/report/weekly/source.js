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
            sourceElement.show();
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
