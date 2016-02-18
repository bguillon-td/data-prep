/*  ============================================================================

 Copyright (C) 2006-2016 Talend Inc. - www.talend.com

 This source code is available under agreement available at
 https://github.com/Talend/data-prep/blob/master/LICENSE

 You should have received a copy of the agreement
 along with this program; if not, write to Talend SA
 9 rue Pages 92150 Suresnes, France

 ============================================================================*/

/**
 * @ngdoc controller
 * @name data-prep.dataset-copy-move.controller:DatasetListCtrl
 * @description enables the user to move/copy a dataset from one folder to another
 */
export default function DatasetCopyMoveCtrl($timeout) {
    'ngInject';

    var vm = this;
    vm.visibility = false;

    vm.isCloningDs = false;
    vm.isMovingDs = false;

    /**
     * @ngdoc method
     * @name clone
     * @methodOf data-prep.dataset-list.controller:DatasetListCtrl
     * @description perform the dataset cloning to the folder destination
     */
    vm.clone = function () {
        vm.isCloningDs = true;
        vm.cloneNameForm.$commitViewValue();

        vm.onCopySubmit({
              ds: vm.datasetToCopyMove,
              destFolder: vm.chosenFolder,
              name: vm.datasetToCopyMove.name
          })
          .then(function () {
              vm.showSuccessMessage({
                  successMsgTitle: 'COPY_SUCCESS_TITLE',
                  successMsgContent: 'COPY_SUCCESS'
              });

              // force going to current folder to refresh the content
              vm.getFolderContent({folder: vm.currentFolder});
              // reset some values to initial values
              vm.isCloningDs = false;
              vm.visibility = false;
          }, function () {
              vm.isCloningDs = false;
              $timeout(vm.focusOnNameInput, 1100, false);
          });
    };

    /**
     * @ngdoc method
     * @name move
     * @methodOf data-prep.dataset-list.controller:DatasetListCtrl
     * @description perform the dataset moving to the folder destination
     */
    vm.move = function () {
        vm.isMovingDs = true;
        vm.cloneNameForm.$commitViewValue();

        vm.onMoveSubmit({
              ds: vm.datasetToCopyMove,
              fromFolder: vm.currentFolder,
              destFolder: vm.chosenFolder,
              name: vm.datasetToCopyMove.name
          })
          .then(function () {
              vm.showSuccessMessage({
                  successMsgTitle: 'MOVE_SUCCESS_TITLE',
                  successMsgContent: 'MOVE_SUCCESS'
              });

              // force going to current folder to refresh the content
              vm.getFolderContent({folder: vm.currentFolder});

              // reset some values to initial values
              vm.isMovingDs = false;
              vm.visibility = false;
          }, function () {
              vm.isMovingDs = false;
              $timeout(vm.focusOnNameInput, 1100, false);
          });
    };
}