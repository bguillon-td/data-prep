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
 * @name data-prep.dataset-list.directive:DatasetListCopyMove
 * @description
 * @requires data-prep.dataset-list.controller:DatasetCopyMoveCtrl
 * @restrict E
 * @usage
 * <dataset-copy-move
 *    chosen-folder="datasetListCtrl.state.folder.currentFolder"
 *    current-folder="datasetListCtrl.state.folder.currentFolder"
 *    dataset-to-copy-move="datasetListCtrl.datasetToCopyMove"
 *    get-folder-content="datasetListCtrl.folderService.getContent(folder)"
 *    on-copy-submit="datasetListCtrl.datasetService.clone(ds, destFolder, name)"
 *    on-move-submit="datasetListCtrl.datasetService.move(ds, fromFolder, destFolder, name)"
 *    show-success-message="datasetListCtrl.messageService.success(successMsgTitle , successMsgContent)"
 *    visibility="datasetListCtrl.datasetCopyVisibility"
 * </dataset-copy-move>
 *
 * @param {object}      chosenFolder the destination folder
 * @param {object}      currentFolder the source folder
 * @param {object}      datasetToCopyMove the dataset to copy/move
 * @param {function}    getFolderChildren get the folder children callback
 * @param {function}    getFolderContent get the folder datasets callback
 * @param {function}    onCopySubmit copy submit callback
 * @param {function}    onMoveSubmit move submit callback
 * @param {function}    searchFolders search by folders names
 * @param {function}    showSuccessMessage show success message callback
 * @param {boolean}     visibility shows/hides the modal
 */

export default function DatasetCopyMove() {
    return {
        restrict: 'E',
        templateUrl: 'app/components/dataset/copy-move/dataset-copy-move.html',
        replace: false,
        bindToController: true,
        scope: {
            chosenFolder: '=',
            currentFolder: '=',
            datasetToCopyMove: '=',
            getFolderContent: '&',
            onCopySubmit: '&',
            onMoveSubmit: '&',
            //setDatasetToCopyMove: '&',
            showSuccessMessage: '&',
            visibility: '='
        },
        controllerAs: 'datasetCopyMoveCtrl',
        controller: 'DatasetCopyMoveCtrl',
        link: function (scope, iElement, iAttrs, ctrl) {

            ctrl.focusOnNameInput = function focusOnNameInput() {
                angular.element('#new-name-input-id').eq(0)[0].focus();
            };

            scope.$watch(function () {
                return ctrl.visibility;
            }, function (newValue) {
                ctrl.visibility = newValue;
            });
        }
    };
}