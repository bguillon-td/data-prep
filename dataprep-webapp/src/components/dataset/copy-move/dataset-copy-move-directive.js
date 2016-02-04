(function () {
    'use strict';

    /**
     * @ngdoc directive
     * @name data-prep.dataset-list.directive:DatasetListCopyMove
     * @description
     * @requires data-prep.dataset-list.controller:DatasetCopyMoveCtrl
     * @restrict E
     * @usage
     * <dataset-copy-move
     *        chosen-folder="datasetListCtrl.state.folder.choosedFolder"
     *        current-folder="datasetListCtrl.state.folder.currentFolder"
     *        dataset-to-copy-clone="datasetListCtrl.state.folder.datasetToCopyClone"
     *        get-folder-children="datasetListCtrl.folderService.children(folderId)"
     *        get-folder-content="datasetListCtrl.folderService.getContent(folder)"
     *        on-copy-submit="datasetListCtrl.datasetService.clone(ds, destFolder, name)"
     *        on-move-submit="datasetListCtrl.datasetService.move(ds, fromFolder, destFolder, name)"
     *        set-dataset-to-copy-clone="datasetListCtrl.stateService.setDatasetToCopyClone(ds)"
     *        show-success-message="datasetListCtrl.messageService.success(successMsgTitle , successMsgContent)"
     *        visibility="datasetListCtrl.datasetCopyVisibility"
     * </dataset-copy-move>
     *
     * @param {object}      chosenFolder the destination folder
     * @param {object}      currentFolder the source folder
     * @param {object}      datasetToCopyClone the dataset to copy/clone
     * @param {function}    getFolderChildren get the folder children callback
     * @param {function}    getFolderContent get the folder datasets callback
     * @param {function}    onCopySubmit copy submit callback
     * @param {function}    onMoveSubmit move submit callback
     * @param {function}    searchFolders search by folders names
     * @param {function}    setDatasetToCopyClone set the selected dataset to be moved/copied callback
     * @param {function}    showSuccessMessage show success message callback
     * @param {boolean}     visibility shows/hides the modal
     */
    function DatasetCopyMove() {
        return {
            restrict: 'E',
            templateUrl: 'components/dataset/copy-move/dataset-copy-move.html',
            replace: false,
            bindToController: true,
            scope: {
                chosenFolder : '=',
                currentFolder : '=',
                datasetToCopyClone : '=',
                getFolderContent : '&',
                onCopySubmit : '&',
                onMoveSubmit : '&',
                setDatasetToCopyClone : '&',
                showSuccessMessage : '&',
                visibility : '='
            },
            controllerAs: 'datasetCopyMoveCtrl',
            controller: 'DatasetCopyMoveCtrl',
            link: function (scope, iElement, iAttrs, ctrl) {

                ctrl.focusOnNameInput = function focusOnNameInput () {
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

    angular.module('data-prep.dataset-copy-move')
        .directive('datasetCopyMove', DatasetCopyMove);
})();