/*  ============================================================================

 Copyright (C) 2006-2016 Talend Inc. - www.talend.com

 This source code is available under agreement available at
 https://github.com/Talend/data-prep/blob/master/LICENSE

 You should have received a copy of the agreement
 along with this program; if not, write to Talend SA
 9 rue Pages 92150 Suresnes, France

 ============================================================================*/

import DatasetCopyMoveCtrl from './dataset-copy-move-controller';
import DatasetCopyMove from './dataset-copy-move-directive';

(() => {

    /**
     * @ngdoc object
     * @name data-prep.dataset-copy-move
     * @description This module contains the controller and directives to manage the dataset copy move
     * @requires talend.widget
     * @requires data-prep.services.dataset
     * @requires data-prep.services.playground
     * @requires data-prep.services.datasetWorkflowService
     * @requires data-prep.services.utils
     * @requires data-prep.services.state
     * @requires data-prep.services.folder
     * @requires data-prep.services.folder-selection
     */
    angular.module('data-prep.dataset-copy-move',
        [
            'ui.router',
            'pascalprecht.translate',
            'talend.widget',
            'data-prep.services.dataset',
            'data-prep.services.playground',
            'data-prep.services.datasetWorkflowService',
            'data-prep.services.utils',
            'data-prep.services.state',
            'data-prep.services.folder',
            'data-prep.folder-selection'
        ])
           .controller('DatasetCopyMoveCtrl', DatasetCopyMoveCtrl)
           .directive('datasetCopyMove', DatasetCopyMove);
})();