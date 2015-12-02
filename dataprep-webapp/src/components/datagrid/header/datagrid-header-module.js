(function() {
    'use strict';

    /**
     * @ngdoc object
     * @name data-prep.datagrid-header
     * @description This module contains the controller and directives to manage the datagrid header with transformation menu
     * @requires talend.module:widget
     * @requires data-prep.transformation-menu
     * @requires data-prep.services.utils
     * @requires data-prep.services.playground
     * @requires data-prep.services.transformation
     * @requires data-prep.quality-bar
     * ??????????????
     * ??????????????
     * ??????????????
     */
    angular.module('data-prep.datagrid-header', [
        'talend.widget',
        'data-prep.transformation-menu',
        'data-prep.services.utils',
        'data-prep.services.playground',
        'data-prep.services.filter',
        'data-prep.services.transformation',
        'data-prep.quality-bar'
    ]);
})();