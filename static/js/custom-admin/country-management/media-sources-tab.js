
var mediaSourcesTab = {
    init: function() {
        var that = this;
        $('#media-sources').on('click', '.add-new-source-btn', function(){
            that.addMediaSource($(this).parent().parent());
        });

        $('#media-sources').on('click', '.remove-source-btn', function(){
            $(this).parent().remove();
        });
    },

    loadEmpty: function() {
        this.loadMediaSourcesFor($('#specialized-sources'), {}, 'Specialized');
        this.loadMediaSourcesFor($('#newspaper-sources'), {}, 'Newspaper');
        this.loadMediaSourcesFor($('#twitter-sources'), {}, 'Twitter');
    },

    onSubmit: function() {
        $('#media-sources-input').val(JSON.stringify(this.getMediaSources()));
    },

    loadForCountry: function(code, country) {
        this.loadMediaSourcesFor($('#specialized-sources'), country.media_sources, 'Specialized');
        this.loadMediaSourcesFor($('#newspaper-sources'), country.media_sources, 'Newspaper');
        this.loadMediaSourcesFor($('#twitter-sources'), country.media_sources, 'Twitter');
    },

    addMediaSource: function(container) {
        let firstSource = container.find('.media-source').length == 0;
        let mediaSourceElement = $('.media-source-template').clone();
        mediaSourceElement.removeClass('media-source-template');
        mediaSourceElement.addClass('media-source');
        mediaSourceElement.appendTo(container);

        if (firstSource) {
            mediaSourceElement.find('a').remove();
        }
        return mediaSourceElement;
    },

    loadMediaSourcesFor: function(container, data, key) {
        container.find('.media-source').remove();
        if (!data[key] || data[key].length == 0) {
            this.addMediaSource(container);
        }
        else {
            for (let i=0; i<data[key].length; i++) {
                let source = data[key][i];
                let element = this.addMediaSource(container);
                element.find('.name').val(source["name"]);
                element.find('.link').val(source["link"]);
            }
        }
    },

    getMediaSourcesFor: function(container, data, key) {
        let elements = container.find('.media-source');
        data[key] = [];
        elements.each(function(){
            data[key].push({
                "name": $(this).find('.name').val(),
                "link": $(this).find('.link').val()
            })
        });
    },

    getMediaSources: function() {
        let data = {};
        this.getMediaSourcesFor($('#specialized-sources'), data, 'Specialized');
        this.getMediaSourcesFor($('#newspaper-sources'), data, 'Newspaper');
        this.getMediaSourcesFor($('#twitter-sources'), data, 'Twitter');
        return data;
    },
};
