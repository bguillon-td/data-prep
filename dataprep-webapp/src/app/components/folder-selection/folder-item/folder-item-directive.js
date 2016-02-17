/*  ============================================================================

 Copyright (C) 2006-2016 Talend Inc. - www.talend.com

 This source code is available under agreement available at
 https://github.com/Talend/data-prep/blob/master/LICENSE

 You should have received a copy of the agreement
 along with this program; if not, write to Talend SA
 9 rue Pages 92150 Suresnes, France

 ============================================================================*/

/**
 * @ngdoc directive
 * @name data-prep.folder-selection.directive:FolderSection
 * @restrict E
 * @usage
 * <folder-item
 *      folders="folderSelectionCtrl.folders"
 *      item="item"
 *      selected-folder="folderSelectionCtrl.selectedFolder"
 *  ></folder-item>
 *
 * @param {array}     folders all the folders to display in a tree way
 * @param {object}    item the current folder to display
 * @param {object}    selectedFolder the selected destination folder
 */

export default function FolderItem(){
    return {
        restrict: 'E',
        bindToController: true,
        controller: 'FolderItemCtrl',
        controllerAs: 'folderItemCtrl',
        scope: {
            folders: '=',
            selectedFolder: '=',
            item: '='
        },
        templateUrl: 'app/components/folder-selection/folder-item/folder-item.html'
    };
}