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
 * @name data-prep.folder-selection:FolderSection
 * @description This directive displays a modal to select a destination folder
 * @restrict E
 * @usage
 * <folder-selection
 *        current-folder="datasetCopyMoveCtrl.currentFolder"
 *        ng-model="datasetCopyMoveCtrl.chosenFolder"
 *        visible="datasetCopyMoveCtrl.visibility"
 * ></folder-selection>
 *
 * @param {object}      currentFolder current folder of the dataset
 * @param {object}      ng-model the selected folder
 * @param {boolean}     visible shows the modal
 */

export default function FolderSelection() {

    return {
        templateUrl: 'app/components/folder-selection/folder-selection.html',
        restrict: 'E',
        bindToController: true,
        scope: {
            currentFolder: '=',
            selectedFolder: '=ngModel',
            visible: '='
        },
        controllerAs: 'folderSelectionCtrl',
        controller: 'FolderSelectionCtrl',
        link: function (scope, iElement, iAttrs, ctrl) {

            /*
             * watcher on the visible property to show/hide the modal
             * */
            scope.$watch (function () {
                return ctrl.visible;
            }, function (newValue) {
                if (newValue && newValue === true) {
                    ctrl.initFolders ();
                }
            });

            /*
             * watcher on the selected folder to update the background
             * */
            scope.$watch (function () {
                return ctrl.selectedFolder;
            }, function (newValue, previousValue) {
                if (newValue) {
                    ctrl.selectedFolder.selected = true;
                    previousValue.selected = false;
                }
            });
        }
    };
}