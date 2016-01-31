(function () {
    'use strict';

    /**
     * @ngdoc controller
     * @name data-prep.dataset-parameters.controller:DatasetParametersCtrl
     * @description Dataset parameters controller
     */
    function DatasetParametersCtrl() {
        var vm = this;

        /**
         * @ngdoc method
         * @name separatorIsInList
         * @methodOf data-prep.dataset-parameters.controller:DatasetParametersCtrl
         * @description Check if the current separator is in the list of separators
         */
        vm.separatorIsInList = function separatorIsInList() {
            return vm.parameters.separator && _.find(vm.configuration.separators, {value: vm.parameters.separator});
        };

        /**
         * @ngdoc method
         * @name validate
         * @methodOf data-prep.dataset-parameters.controller:DatasetParametersCtrl
         * @description Call the parameter change validation callback
         */
        vm.validate = function validate() {
            vm.onParametersChange({
                dataset: vm.dataset,
                parameters: vm.parameters
            });
        };
    }

    angular.module('data-prep.dataset-parameters')
        .controller('DatasetParametersCtrl', DatasetParametersCtrl);
})();