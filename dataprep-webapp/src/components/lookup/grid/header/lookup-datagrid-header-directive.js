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
    function LookupDatagridHeader($timeout) {
        return {
            restrict: 'E',
            templateUrl: 'components/lookup/grid/header/lookup-datagrid-header.html',
            scope: {
                column: '=',
                added: '='
            },
            bindToController: true,
            controllerAs: 'lookupDatagridHeaderCtrl',
            controller: 'LookupDatagridHeaderCtrl',
            link: function (scope, iElement) {
                var gridHeader = iElement.find('.lookup-grid-header .add-to-lookup > > span').eq(0);
                var checkBox = iElement.find('input[type="checkbox"]').eq(0);

                attachClickListener();
                /**
                 * @ngdoc method
                 * @name attachClickListener
                 * @methodOf data-prep.lookup-datagrid-header.directive:LookupDatagridHeader
                 * @description Attach a 'Click' event listener on grid header
                 */
                function attachClickListener() {
                    gridHeader.mousedown(function(event) {
                        event.stopPropagation();
                        $timeout(function(){
                            checkBox.click()
                        });
                    });
                }
            }
        };
    }

    angular.module('data-prep.lookup-datagrid-header')
        .directive('lookupDatagridHeader', LookupDatagridHeader);
})();
