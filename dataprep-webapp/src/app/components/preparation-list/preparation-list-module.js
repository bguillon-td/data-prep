import PreparationListCtrl from './preparation-list-controller';
import PreparationList from './preparation-list-directive';

(() => {
    'use strict';

    /**
     * @ngdoc object
     * @name data-prep.preparation-list
     * @description This module contains the controller and directives to manage the preparation list
     * @requires ui.router
     * @requires talend.widget
     * @requires data-prep.services.preparation
     * @requires data-prep.services.playground
     * @requires data-prep.services.state
     */
    angular.module('data-prep.preparation-list',
        [
            'ui.router',
            'talend.widget',
            'data-prep.services.preparation',
            'data-prep.services.playground',
            'data-prep.services.state'
        ])
        .controller('PreparationListCtrl', PreparationListCtrl)
        .directive('preparationList', PreparationList);
})();