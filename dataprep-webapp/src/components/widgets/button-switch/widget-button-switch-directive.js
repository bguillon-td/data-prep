(function () {
    'use strict';

    /**
     * @ngdoc directive
     * @name talend.widget.directive:TalendButtonSwitch
     * @description This directive create a badge with editable content switch on click.
     * @restrict E
     * @usage
     *
     <talend-button-switch
         button-values="valuesArray"
         button-current-text="texts"
         button-action="clickAction">
     </talend-button-switch>

     * @param {string[]}  button-values The possible values
     * @param {string} button-current-text The current value
     * @param {function} button-action The action that is triggered on switch
     */
    function TalendButtonSwitch() {
        return {
            restrict: 'E',
            templateUrl: 'components/widgets/button-switch/button-switch.html',
            scope: {
                currentValue: '=',
                displayKey: '@',
                values: '=',
                changeAction: '&'
            },
            bindToController: true,
            controller: function () {},
            controllerAs: 'buttonSwitchCtrl',
            link: function (scope, iElement, attrs, ctrl) {
                function next() {
                    var index = ctrl.values.indexOf(ctrl.currentValue);
                    return (index === -1 || index >= ctrl.values.length - 1) ?
                        ctrl.values[0] :
                        ctrl.values[index + 1];
                }

                iElement.on('click', function () {
                    ctrl.changeAction({selected: next()});
                });
            }
        };
    }

    angular.module('talend.widget')
        .directive('talendButtonSwitch', TalendButtonSwitch);
})();