function confirmRemoval() {
    return (num_entries === 0 ||
        confirm('This template has got ' + num_entries + ' entries which will lose the attribute you are trying to remove. Are you sure?'));
}

let templateEditor = {
    init: function() {
        let that = this;
        this.elements = [];

        $('#matrix1d-widget button').on('click', function() {
            that.addElement(new Matrix1D(that.getContainer(), $('#page-two .entry')), true).dom.data('new', true);
            that.reloadElements();
        });

        $('#matrix2d-widget button').on('click', function() {
            that.addElement(new Matrix2D(that.getContainer(), $('#page-two .entry')), true).dom.data('new', true);
            that.reloadElements();
        });

        $('#number-widget button').on('click', function() {
            that.addElement(new NumberInput(that.getContainer()), true).dom.data('new', true);
            that.reloadElements();
        });

        $('#date-widget button').on('click', function() {
            that.addElement(new DateInput(that.getContainer()), true).dom.data('new', true);
            that.reloadElements();
        });

        $('#scale-widget button').on('click', function() {
            that.addElement(new ScaleElement(that.getContainer()), true).dom.data('new', true);
            that.reloadElements();
        });

        $('#multiselect-widget button').on('click', function() {
            that.addElement(new MultiselectInput(that.getContainer()), true).dom.data('new', true);
            that.reloadElements();
        });

        $('#organigram-widget button').on('click', function() {
            that.addElement(new OrganigramInput(that.getContainer()), true).dom.data('new', true);
            that.reloadElements();
        });

        $('#geolocations-widget button').on('click', function() {
            that.addElement(new GeolocationsInput(that.getContainer()), true).dom.data('new', true);
            that.reloadElements();
        });

        // Save button
        $('#save-button').click(function() {
            that.save().then(function(data) {
                redirectPost(window.location.pathname, {
                    data: JSON.stringify(data),
                }, csrf_token);
            });
        });

        // Page switching
        $('.switch-page').click(function() {
            that.switchPage();
            that.reloadElements();
        });
    },

    addElement: function(element, newElement=false) {
        element.page = this.getPage();
        this.elements.push(element);

        if (newElement) {
            if(element.page == 'page-one'){
                let maxY = 0;
                $('main .element').not(element.dom[0]).each(function() {
                    let r = this.getBoundingClientRect();

                    if((r.top + r.height) > maxY) {
                        maxY = r.top + r.height;
                    }
                });
                element.dom.css('top', (maxY-48)+'px');
            }
            else if(element.page == 'page-two'){
                let maxX = 0;
                $('main .element').not(element.dom[0]).each(function() {
                    let r = this.getBoundingClientRect();

                    if((r.left + r.width) > maxX) {
                        maxX = r.left + r.width;
                    }
                });
                element.dom.css('left', maxX+'px');
            }
        }

        return element;
    },

    reloadElements: function() {
        $('#elements .element').remove();
        let that = this;
        for (let i=0; i<this.elements.length; i++) {
            let element = this.elements[i];
            if (element.page != this.getPage()) {
                continue;
            }

            let elementProperties = $('#elements .element-template').clone();
            elementProperties.removeClass('element-template').addClass('element');
            if(element.dom.find('.title').text().length > 0){
                elementProperties.find('h4').text(element.getTitle() + ' (' + element.dom.find('.title').text() + ')');
            }
            else{
                elementProperties.find('h4').text(element.getTitle());
            }

            if (element.isRemovable()) {
                let removeElement = function() {
                    if (element.dom.data('new') || confirmRemoval()) {
                        elementProperties.remove();
                        element.remove();
                        that.elements.splice(that.elements.indexOf(element), 1);
                    }
                };
                elementProperties.find('.delete-element').click(removeElement);
                element.dom.find('.delete-element').click(removeElement);
            }
            else {
                elementProperties.find('.delete-element').hide();
            }
            $('#elements').append(elementProperties);
            elementProperties.show();
        }
    },

    load: function(data) {
        let that = this;
        this.elements = [];
        $('#elements .element').remove();

        $('#template-name').text(data.name);
        that.getContainer().empty();

        let pageOneEntrySelectorAdded = false;
        let pageOneExcerptBoxAdded = false;
        let pageOneImageBoxAdded = false;
        let pageTwoExcerptBoxAdded = false;

        for (let i=0; i<data.elements.length; i++) {
            let element = data.elements[i];
            if (this.getPage() != element.page) {
                this.switchPage();
            }

            if (element.type == 'matrix1d') {
                that.addElement(new Matrix1D(that.getContainer(), $('#page-two .entry'), element));
            }
            else if (element.type == 'matrix2d') {
                that.addElement(new Matrix2D(that.getContainer(), $('#page-two .entry'), element));
            }
            else if (element.type == 'number-input') {
                that.addElement(new NumberInput(that.getContainer(), element));
            }
            else if (element.type == 'date-input') {
                that.addElement(new DateInput(that.getContainer(), element));
            }
            else if (element.type == 'scale') {
                that.addElement(new ScaleElement(that.getContainer(), element));
            }
            else if (element.type == 'multiselect') {
                that.addElement(new MultiselectInput(that.getContainer(), element));
            }
            else if (element.type == 'organigram') {
                that.addElement(new OrganigramInput(that.getContainer(), element));
            }
            else if (element.type == 'geolocations') {
                that.addElement(new GeolocationsInput(that.getContainer(), element));
            }
            else if (element.type == 'pageOneExcerptBox') {
                pageOneExcerptBoxAdded = true;
                that.addElement(new PageOneExcerptBox(that.getContainer(), element));
            }
            else if (element.type == 'pageOneImageBox') {
                pageOneImageBoxAdded = true;
                that.addElement(new PageOneImageBox(that.getContainer(), element));
            }
            else if (element.type == 'pageOneEntrySelector') {
                pageOneEntrySelectorAdded = true;
                that.addElement(new PageOneEntrySelector(that.getContainer(), element));
            }
            else if (element.type == 'pageTwoExcerptBox') {
                pageTwoExcerptBoxAdded = true;
                that.addElement(new PageTwoExcerptBox(that.getContainer(), element));
            }
        }

        if (!pageTwoExcerptBoxAdded) {
            if (this.getPage() != 'page-two') {
                this.switchPage();
            }
            that.addElement(new PageTwoExcerptBox(that.getContainer()));
        }

        if (this.getPage() != 'page-one') {
            this.switchPage();
        }
        if (!pageOneEntrySelectorAdded) {
            that.addElement(new PageOneEntrySelector(that.getContainer()));
        }
        if (!pageOneExcerptBoxAdded) {
            that.addElement(new PageOneExcerptBox(that.getContainer()));
        }
        if (!pageOneImageBoxAdded) {
            that.addElement(new PageOneImageBox(that.getContainer()));
        }

        that.reloadElements();
    },

    save: function() {
        return new Promise((resolve, reject) => {
            let that = this;
            let page = this.getPage();
            let data = {};

            data.name = $('#template-name').text();
            data.elements = [];
            for (let i=0; i<this.elements.length; i++) {
                if (this.getPage() != this.elements[i].page) {
                    this.switchPage();
                }
                let elementData = this.elements[i].save();
                elementData.page = this.elements[i].page;
                data.elements.push(elementData);
            }
            if (page != this.getPage()) {
                this.switchPage();
            }

            data.snapshots = {};
            var currentPage = this.getPage();
            if (currentPage != 'page-one') {
                this.switchPage();
            }
            html2canvas($('#page-one')[0], {
                onrendered: function(canvas) {
                    data.snapshots.pageOne = canvas.toDataURL();

                    that.switchPage();
                    html2canvas($('#page-two')[0], {
                        onrendered: function(canvas) {
                            data.snapshots.pageTwo = canvas.toDataURL();
                            if (currentPage == 'page-two') {
                                that.switchPage();
                            }
                            resolve(data);
                        }
                    });
                }
            });
        });
    },

    getUniqueElementId: function() {
        let i = 0;
        while (true) {
            let elementId = 'element' + i;
            if (!this.checkElementId(elementId)) {
                return elementId;
            }
            i++;
        }
    },

    checkElementId: function(elementId) {
        let j = 0;
        for (; j<this.elements.length; j++) {
            if (this.elements[j].id == elementId) {
                break;
            }
        }
        return j < this.elements.length;
    },

    getPage: function() {
        if ($('#page-one').is(':visible')) {
            return 'page-one';
        } else {
            return 'page-two';
        }
    },

    getContainer: function() {
        if ($('#page-one').is(':visible')) {
            return $('#page-one');
        } else {
            return $('#page-two .entry');
        }
    },

    switchPage: function() {
        if ($('#page-one').is(':visible')) {
            $('#page-one').hide();
            $('#page-two').css('display','flex');
            $('#switch-in-bar').css('display','inline-block');
            $('#switch-in-footer').css('display','none');
            $('body').removeClass('page-one').addClass('page-two');
        } else {
            $('#page-two').hide();
            $('#page-one').show();
            $('#switch-in-footer').css('display','inline-block');
            $('#switch-in-bar').css('display','none');
            $('body').removeClass('page-two').addClass('page-one');
        }
    },
};


$(document).ready(function() {
    templateEditor.init();
    templateEditor.load(templateData);

    $('#elements').sortable();

    $('.properties-box').on('visible', function(){
        $('.properties-box').not(this).hide();
        $('.floating-toolbar').hide();
    });
    $('.floating-toolbar').on('visible', function(){
        $('.floating-toolbar').not(this).hide();
        $('.properties-box').hide();
    });

    $(document).on('click', function(e){
        if($(e.target).closest('.properties-box').length === 0){
            $('.properties-box').hide();
        }
        if($(e.target).closest('.floating-toolbar').length === 0){
            $('.floating-toolbar').hide();
        }
    });
    $(document).keypress(function(e) {
    if(e.which == 13) {
        if($('.floating-toolbar').is(':visible')){}
    }
});
    function checkElementCollision(element, targetObjects){
        let r1 = element.getBoundingClientRect();
        let hit = false;
        targetObjects.not(element).each(function(){
            let r2 = this.getBoundingClientRect();

            if((r1.left < r2.left + r2.width && r1.left + r1.width > r2.left && r1.top < r2.top + r2.height && r1.height + r1.top > r2.top)) {
                hit = true;
                return false;
            }
        });
        return hit;
    }

    $('main').on('mousedown', '.ui-resizable', function(){
        $(this).data('width', $(this).width());
        $(this).data('height', $(this).height());
        $(this).data('mousedown', true);
    });
    $('main').on('mouseup', '.ui-resizable', function(){
        $(this).data('mousedown', false);
        if($(this).data('resizing')){
            if(checkElementCollision(this, $('main .ui-resizable'))){
                $(this).width($(this).data('width'));
                $(this).height($(this).data('height'));
            }
            $(this).data('resizing', false);
        }
    });
    $('main').on('resize', '.ui-resizable', function() {
        $(this).data('resizing', true);
    });

    $('main').on('dragstart', '.element', function(){
        $(this).data('initial-offset', $(this).offset());
    });
    $('main').on('dragstop', '.element', function(event, ui){
        if(checkElementCollision(this, $('main .element'))){
            $(this).offset($(this).data('initial-offset'));
        }
    });

    if (location.hash.indexOf('page2') > 0) {
        templateEditor.switchPage();
    }
});

