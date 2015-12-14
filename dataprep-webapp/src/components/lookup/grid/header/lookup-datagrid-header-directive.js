(function () {
    'use strict';

    /**
     * @ngdoc directive
     * @name data-prep.lookup-datagrid-header.directive:DatagridHeader
     * @description This directive creates the lookup datagrid column header
     * @restrict E
     * @usage
     <lookup-datagrid-header
     added="added"
     column="column">
     </lookup-datagrid-header>
     * @param {object} column The column metadata
     * @param {object} added checkbox ng-model
     */
    function LookupDatagridHeader() {
        return {
            restrict: 'E',
            templateUrl: 'components/lookup/grid/header/lookup-datagrid-header.html',
            scope: {
                column: '=',
                added: '='
            },
            bindToController: true,
            controllerAs: 'lookupDatagridHeaderCtrl',
            controller: 'LookupDatagridHeaderCtrl'
        };
    }

    angular.module('data-prep.lookup-datagrid-header')
        .directive('lookupDatagridHeader', LookupDatagridHeader);
})();
