(function() {
    'use strict';

    function TalendEditableText($timeout) {
        return {
            restrict: 'E',
            templateUrl: 'components/widgets/editable-text/editable-text.html',
            scope: {
                placeholder: '@',
                text: '=',
                textTitle: '@',
                textClass: '@',
                editionMode: '=?',
                onTextClick: '&',
                onValidate: '&',
                onCancel: '&'
            },
            bindToController: true,
            controller: 'TalendEditableTextCtrl',
            controllerAs: 'editableTextCtrl',
            link: function(scope, iElement, iAttrs, ctrl) {
                $timeout(function() {
                    var inputElement = iElement.find('.edition-text-input').eq(0);
                    var editButton =  iElement.find('.edit-btn').eq(0);
                    var validButton =  iElement.find('.valid-btn').eq(0);
                    var isOverValidButton = false;

                    inputElement.keydown(function(e) {
                        if (e.keyCode === 27) {
                            e.stopPropagation();
                            ctrl.cancel();
                            scope.$digest();
                        }
                    });

                    inputElement.on('blur', function () {
                        if (!isOverValidButton) {
                            ctrl.cancel();
                            scope.$digest();
                        }
                    });

                    validButton.hover(function() {
                        isOverValidButton = true;
                    }, function() {
                        isOverValidButton = false;
                    });

                    editButton.click(function() {
                        inputElement.focus();
                        inputElement.select();
                    });
                }, 0, false);

                scope.$watch(
                    function() {
                        return ctrl.text;
                    },
                    function() {
                        ctrl.reset();
                    }
                );
            }
        };
    }

    angular.module('talend.widget')
        .directive('talendEditableText', TalendEditableText);
})();