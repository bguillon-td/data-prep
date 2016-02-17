/*  ============================================================================

 Copyright (C) 2006-2016 Talend Inc. - www.talend.com

 This source code is available under agreement available at
 https://github.com/Talend/data-prep/blob/master/LICENSE

 You should have received a copy of the agreement
 along with this program; if not, write to Talend SA
 9 rue Pages 92150 Suresnes, France

 ============================================================================*/

/**
 * @ngdoc object
 * @name data-prep.folder-selection
 * @description This module contains the controller and directives to select a folder
 * @requires data-prep.services.state
 * @requires data-prep.services.folder
 */

import FolderSelectionCtrl from './folder-selection-controller';
import FolderItemCtrl from './folder-item/folder-item-controller';
import FolderSelection from './folder-selection-directive';
import FolderItem from './folder-item/folder-item-directive';

(() => {
    angular.module('data-prep.folder-selection', [
               'ui.router',
               'data-prep.services.state',
               'data-prep.services.folder'
           ])
           .controller('FolderSelectionCtrl', FolderSelectionCtrl)
           .controller('FolderItemCtrl', FolderItemCtrl)
           .directive('folderSelection', FolderSelection)
           .directive('folderItem', FolderItem);
})();