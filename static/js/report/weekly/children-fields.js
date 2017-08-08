
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
                if (!(pk in newData['human-children']) || newData['human-children'][pk].length == 0) {
                    childElement.find('.human-profile-child-number').val(parentNumberElement.val());

                    // childElement.find('.human-profile-child-source').val(parentDiv.find('input.human-source').val());
                    // parentDiv.find('input.human-source').val(null);
                    // parentDiv.find('input.human-source').trigger('change');


                    childElement.find('.human-profile-child-comment').val(parentDiv.find('input.human-comment').val());
                    parentDiv.find('input.human-comment').val(null);
                    parentDiv.find('input.human-comment').trigger('change');

                    newData['human-children'][pk] = [{
                        number: getNumberValue(childElement.find('.human-profile-child-number')),
                        // source: childElement.find('.human-profile-child-source').val(),
                        comment: childElement.find('.human-profile-child-comment').val()
                    }];

                    newData['human-children'][pk][0]['source'] = newData['human']['source'][pk];
                    newData['human']['source'][pk] = null;
                    source.refreshSources(parentDiv.find('.human-source'), newData['human']['source'][pk], data['human']['source'][pk]);
                }
                else {
                    // Add child data structure as well
                    newData['human-children'][pk].push({
                        number: null, source: null, comment: null
                    });
                }
            });
        });

        // Based on existing data, add children
        for (var pk in newData['human-children']) {
            var children = newData['human-children'][pk];

            for (var i=0; i<children.length; i++) {
                var parentDiv = $('.human-number[data-human-pk="' + pk + '"]').closest('.human-profile-subfield');
                var childElement = childrenFields.addChildElement(parentDiv, function(pk, childElement) {
                    childElement.find('.human-profile-child-number').val(children[i]['number']);
                    // childElement.find('.human-profile-child-source').val(getOldSourceData(children[i]['source']));
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
        var childElement = $('<div class="human-profile-child"><i></i><div class="number-wrapper"><input class="human-profile-child-number number"></div><div class="source-warning-wrapper"><div class="human-profile-child-source source-new"></div></div><div class="comment-warning-wrapper"><input class="human-profile-child-comment"></div><a class="fa fa-minus remove-child"></a></div>');
        childElement.insertAfter(parentDiv.find('.add-child'));

        setValues(pk, childElement, parentDiv, parentNumberElement);

        var index = parentDiv.find('.add-child').nextAll().length - 1;
        if (!newData['human-children'][pk][index]) {
            newData['human-children'][pk][index] = {};
        }

        // Setup events
        childElement.find('.human-profile-child-number').on('paste change input', function(pk) {
            return function() {
                var index = parentDiv.find('.human-profile-child-number').length - parentDiv.find('.human-profile-child-number').index($(this)) - 1;
                formatNumber($(this));
                newData['human-children'][pk][index]['number'] = getNumberValue($(this));
                childrenFields.refreshParent(pk);
            }
        }(pk));

        childElement.find('.human-profile-child-source').on('drop', source.getDropEvent(function(container, newSource) {
            var index = parentDiv.find('.human-profile-child-source').length - parentDiv.find('.human-profile-child-source').index(container) - 1;
            newData['human-children'][pk][index]['source'] = getNewSourceData(newData['human-children'][pk][index]['source']);
            newData['human-children'][pk][index]['source']['new'].push(newSource);
            source.refreshSources(container, newData['human-children'][pk][index]['source']);
        }));
        childElement.find('.human-profile-child-source').on('dragover', function(e) {
            e.originalEvent.preventDefault();
            return false;
        });
        newData['human-children'][pk][index]['source'] = getNewSourceData(newData['human-children'][pk][index]['source']);
        source.refreshSources(childElement.find('.human-profile-child-source'), newData['human-children'][pk][index]['source']);

        childElement.find('.human-profile-child-comment').on('paste change input', function(pk) {
            return function() {
                var index = parentDiv.find('.human-profile-child-comment').length - parentDiv.find('.human-profile-child-comment').index($(this)) - 1;
                newData['human-children'][pk][index]['comment'] = $(this).val();
            }
        }(pk));

        childrenFields.refreshParent(pk);
        formatNumber(childElement.find('.human-profile-child-number'));

        // The remove child button
        childElement.find('.remove-child').click(function(parentDiv, childElement, pk) {
            return function() {
                var index = parentDiv.find('.remove-child').length - parentDiv.find('.remove-child').index($(this)) - 1;

                // If last element, move value up to the parent
                if (newData['human-children'][pk].length == 1) {
                    parentDiv.find('.human-number').val(childElement.find('.human-profile-child-number').val());
                    parentDiv.find('.human-number').attr('readonly', false);
                    parentDiv.find('.human-number').trigger('change');

                    // parentDiv.find('.human-source').val(childElement.find('.human-profile-child-source').val());
                    // parentDiv.find('.human-source').trigger('change');
                    newData['human']['source'][pk] = newData['human-children'][pk][0]['source'];
                    source.refreshSources(parentDiv.find('.human-source'), newData['human']['source'][pk], data['human']['source'][pk]);

                    parentDiv.find('.human-comment').val(childElement.find('.human-profile-child-comment').val());
                    parentDiv.find('.human-comment').trigger('change');
                }

                childElement.remove();
                newData['human-children'][pk].splice(index, 1);
                childrenFields.refreshParent(pk);
            }
        }(parentDiv, childElement, pk));

        return childElement;
    },

    refreshParent: function(pk) {
        var parentElement = $('.human-number[data-human-pk="' + pk + '"]');
        childrenElements = parentElement.closest('.human-profile-subfield').find('.human-profile-child-number');
        if (childrenElements.length > 0) {
            var sum = 0;
            childrenElements.each(function() {
                sum = sum + (+getNumberValue($(this)));
            });
            parentElement.val(sum==0?null:sum);
        }
        parentElement.trigger('change');
    },
};
