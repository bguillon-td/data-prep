(function () {
    'use strict';

    /**
     * @ngdoc directive
     * @name data-prep.dataset-list.directive:DatasetListCopyMove
     * @description
     * @requires data-prep.dataset-list.controller:DatasetCopyMoveCtrl
     * @restrict E
     */
    function DatasetCopyMove() {
        return {
            restrict: 'E',
            templateUrl: 'components/dataset/copy-move/dataset-copy-move.html',
            replace: false,
            bindToController: true,
            scope: {
                state: '='
            },
            controllerAs: 'datasetCopyMoveCtrl',
            controller: 'DatasetCopyMoveCtrl',
            link: function (scope, iElement, iAttrs, ctrl) {
                scope.$watch(function () {
                    return ctrl.state;
                }, function (newValue) {
                    ctrl.state = newValue;

                });
            }
        };
    }

    angular.module('data-prep.dataset-copy-move')
        .directive('datasetCopyMove', DatasetCopyMove);
})();