(function () {
    'use strict';

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
    function FolderItem() {
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
            templateUrl: 'components/folder-selection/folder-item/folder-item.html'
        };
    }

    angular.module ('data-prep.folder-selection')
        .directive ('folderItem', FolderItem);
}) ();