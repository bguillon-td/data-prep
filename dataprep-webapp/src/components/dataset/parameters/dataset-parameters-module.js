(function() {
    'use strict';

    /**
     * @ngdoc object
     * @name data-prep.dataset-parameters
     * @description This module contains the controller and directives to manage the dataset parameters
     * @requires talend.widget
     * @requires data-prep.services.dataset
     * @requires data-prep.services.playground
     */
    angular.module('data-prep.dataset-parameters', [
        'pascalprecht.translate',
        'talend.widget',
        'data-prep.services.dataset',
        'data-prep.services.playground'
    ]);
})();