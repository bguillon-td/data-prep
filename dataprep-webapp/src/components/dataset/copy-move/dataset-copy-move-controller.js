(function () {
    'use strict';

    /**
     * @ngdoc controller
     * @name data-prep.dataset-list.controller:DatasetListCtrl
     * @description enables the user to move/copy a dataset from one folder to another
     */
    function DatasetCopyMoveCtrl() {
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
            vm.cloneNameForm.$commitViewValue ();

            vm.onCopySubmit ({
                    ds: vm.datasetToCopyClone,
                    destFolder: vm.chosenFolder,
                    name: vm.datasetToCopyClone.name
                })
                .then (function () {
                    vm.showSuccessMessage ({
                        successMsgTitle: 'COPY_SUCCESS_TITLE',
                        successMsgContent: 'COPY_SUCCESS'
                    });

                    // force going to current folder to refresh the content
                    vm.getFolderContent ({folder: vm.currentFolder});
                    // reset some values to initial values
                    vm.setDatasetToCopyClone ({ds: null});
                    vm.isCloningDs = false;
                    vm.visibility = false;
                }, function () {
                    vm.isCloningDs = false;
                    setTimeout (vm.focusOnNameInput, 1100);
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
            vm.cloneNameForm.$commitViewValue ();

            vm.onMoveSubmit ({
                    ds: vm.datasetToCopyClone,
                    fromFolder: vm.currentFolder,
                    destFolder: vm.chosenFolder,
                    name: vm.datasetToCopyClone.name
                })
                .then (function () {
                    vm.showSuccessMessage ({
                        successMsgTitle: 'MOVE_SUCCESS_TITLE',
                        successMsgContent: 'MOVE_SUCCESS'
                    });

                    // force going to current folder to refresh the content
                    vm.getFolderContent ({folder: vm.currentFolder});

                    // reset some values to initial values
                    vm.setDatasetToCopyClone ({ds: null});
                    vm.isMovingDs = false;
                    vm.visibility = false;
                }, function () {
                    vm.isMovingDs = false;
                    setTimeout (vm.focusOnNameInput, 1100);
                });
        };
    }

    angular.module ('data-prep.dataset-copy-move')
        .controller ('DatasetCopyMoveCtrl', DatasetCopyMoveCtrl);
}) ();
