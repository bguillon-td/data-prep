(function() {
    'use strict';

    /**
     * @ngdoc directive
     * @name data-prep.dataset-parameters.directive:datasetParameters
     * @description Dataset parameters edition form element
     * @restrict E
     * @usage
     *     <dataset-parameters
     *             processing="true"
     *             dataset="dataset"
     *             on-parameters-change="validate(dataset, parameters)"
     *             configuration="configuration"
     *             parameters="parameters"></dataset-parameters>
     * @param {boolean} processing Flag that indicate that the validation is processing. It disables the validation button and switch to a loading icon.
     * @param {object} dataset The dataset we are editing
     * @param {function} onParametersChange The validation callback
     * @param {object} configuration The parameters configuration {separators: [{label: ';', value: ';'}, ...], encodings: ['UTF-8', ...]}
     * @param {object} parameters The parameters values {separator: ';', encoding: 'UTF-8'}. CAUTION: The values are directly bound to the inputs
     * */
    function DatasetParameters() {
        return {
            restrict: 'E',
            templateUrl: 'components/dataset/parameters/dataset-parameters.html',
            scope: {
                processing: '=',
                dataset: '=',
                onParametersChange: '&',
                configuration: '=',
                parameters: '='
            },
            bindToController: true,
            controller: 'DatasetParametersCtrl',
            controllerAs: 'datasetParametersCtrl'
        };
    }

    angular.module('data-prep.dataset-parameters')
        .directive('datasetParameters', DatasetParameters);
})();