(function() {
    'use strict';

    /**
     * @ngdoc object
     * @name data-prep.folder-selection
     * @description This module contains the controller and directives to select a folder
     * @requires data-prep.services.state
     * @requires data-prep.services.folder
     */
    angular.module('data-prep.folder-selection', [
        'ui.router',
        'data-prep.services.state',
        'data-prep.services.folder'
    ]);
})();