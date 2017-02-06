
var childrenFields = {
    init: function() {
        /*
        data = { ...,
            "human": {
                "number": {pk: data}, "source": {}, "comment": {},
                "numberDecay": {}, "sourceDecay": {}, "commentDecay": {}
            },
            "human-children": {
                pk: [{number:, source:, comment:}]
            }
        }
        */

        // Setup add-child buttons
        $('.add-child').click(function() {
            var parentDiv = $(this).parent('div');
            childrenFields.addChildElement(parentDiv, function(pk, childElement, parentDiv, parentNumberElement){
                // If first child element, then transfer the value down to the child
                if (!(pk in data['human-children']) || data['human-children'][pk].length == 0) {
                    childElement.find('.human-profile-child-number').val(parentNumberElement.val());

                    childElement.find('.human-profile-child-source').val(parentDiv.find('input.human-source').val());
                    parentDiv.find('input.human-source').val(null);
                    parentDiv.find('input.human-source').trigger('change');

                    childElement.find('.human-profile-child-comment').val(parentDiv.find('input.human-comment').val());
                    parentDiv.find('input.human-comment').val(null);
                    parentDiv.find('input.human-comment').trigger('change');

                    data['human-children'][pk] = [{
                        number: getNumberValue(childElement.find('.human-profile-child-number')),
                        source: childElement.find('.human-profile-child-source').val(),
                        comment: childElement.find('.human-profile-child-comment').val()
                    }];
                }
                else {
                    // Add child data structure as well
                    data['human-children'][pk].push({
                        number: null, source: null, comment: null
                    });
                }
            });
        });

        // Based on existing data, add children
        for (var pk in data['human-children']) {
            var children = data['human-children'][pk];

            for (var i=0; i<children.length; i++) {
                var parentDiv = $('.human-number[data-human-pk="' + pk + '"]').parent('div');
                var childElement = childrenFields.addChildElement(parentDiv, function(pk, childElement) {
                    childElement.find('.human-profile-child-number').val(children[i]['number']);
                    childElement.find('.human-profile-child-source').val(children[i]['source']);
                    childElement.find('.human-profile-child-comment').val(children[i]['comment']);
                });
            }
        }

    },

    addChildElement: function(parentDiv, setValues) {
        var parentNumberElement = parentDiv.find('input.human-number');
        parentNumberElement.attr('readonly', true);
        var pk = parentNumberElement.data('human-pk');

        // Create a child element
        var childElement = $('<div class="human-profile-child"><i></i><input class="human-profile-child-number number"><input class="human-profile-child-source"><input class="human-profile-child-comment"><a class="fa fa-minus remove-child"></a></div>');
        childElement.insertAfter(parentDiv.find('.add-child'));

        setValues(pk, childElement, parentDiv, parentNumberElement);

        var index = parentDiv.find('.add-child').nextAll().length - 1;

        // Setup events
        childElement.find('.human-profile-child-number').on('paste change input', function(pk, index) {
            return function() {
                formatNumber($(this));
                data['human-children'][pk][index]['number'] = getNumberValue($(this));
                childrenFields.refreshParent(pk);
            }
        }(pk, index));
        childElement.find('.human-profile-child-source').on('paste change input', function(pk, index) {
            return function() {
                data['human-children'][pk][index]['source'] = $(this).val();
            }
        }(pk, index));
        childElement.find('.human-profile-child-comment').on('paste change input', function(pk, index) {
            return function() {
                data['human-children'][pk][index]['comment'] = $(this).val();
            }
        }(pk, index));

        childrenFields.refreshParent(pk);
        formatNumber(childElement.find('.human-profile-child-number'));

        // The remove child button
        childElement.find('.remove-child').click(function(parentDiv, childElement, pk, index) {
            return function() {

                // If last element, move value up to the parent
                if (data['human-children'][pk].length == 1) {
                    parentDiv.find('.human-number').val(childElement.find('.human-profile-child-number').val());
                    parentDiv.find('.human-number').trigger('change');

                    parentDiv.find('.human-source').val(childElement.find('.human-profile-child-source').val());
                    parentDiv.find('.human-source').trigger('change');

                    parentDiv.find('.human-comment').val(childElement.find('.human-profile-child-comment').val());
                    parentDiv.find('.human-comment').trigger('change');
                }

                childElement.remove();
                data['human-children'][pk].splice(index, 1);
            }
        }(parentDiv, childElement, pk, index));

        return childElement;
    },

    refreshParent: function(pk) {
        var parentElement = $('.human-number[data-human-pk="' + pk + '"]');
        childrenElements = parentElement.parent('.human-profile-subfield').find('.human-profile-child-number');
        var sum = 0;
        childrenElements.each(function() {
            sum = sum + (+getNumberValue($(this)));
        });
        parentElement.val(sum==0?null:sum);
        parentElement.trigger('change');
    },
};
