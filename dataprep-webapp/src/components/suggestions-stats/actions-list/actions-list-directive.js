(function () {
    'use strict';

    /**
     * @ngdoc directive
     * @name data-prep.actions-list.directive:actionsList
     * @description list of the action to apply on a (column, cell or dataset)
     * @restrict E
     * @usage
     *     <action-list
     *             actions="actions"
     *             should-render-category="shouldRenderCategoryCb"
     *             should-render-action="shouldRenderActionCb"
     *             scroll-to-bottom="scrollFn"
     *             scope="scope"></action-list>
     * @param {array} actions The actions to render
     * @param {function} shouldRenderCategory Function that define if the category passed as parameter should be rendered
     * @param {function} shouldRenderActionCb Function that define if the action passed as parameter should be rendered
     * @param {function} scrollToBottom The scroll action when an action is opened
     * @param {string} scope The action scope (LINE, COLUMN, ...)
     * */
    function ActionsList() {
        return {
            restrict: 'E',
            templateUrl: 'components/suggestions-stats/actions-list/actions-list.html',
            bindToController: true,
            controllerAs: 'actionsListCtrl',
            controller: 'ActionsListCtrl',
            scope: {
                actions: '=',
                shouldRenderCategory: '=',
                shouldRenderAction: '=',
                scrollToBottom: '=',
                scope: '@'
            }
        };
    }

    angular.module('data-prep.actions-list')
        .directive('actionsList', ActionsList);
})();