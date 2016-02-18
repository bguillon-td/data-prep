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
 * @name data-prep.dataset-list.controller:DatasetListCtrl
 * @description Dataset list controller.
 On creation, it fetch dataset list from backend and load playground if 'datasetid' query param is provided
 * @requires data-prep.services.state.service:StateService
 * @requires data-prep.services.dataset.service:DatasetService
 * @requires data-prep.services.folder.service:FolderService
 * @requires data-prep.services.playground.service:PlaygroundService
 * @requires data-prep.services.uploadWorkflowService.service:UploadWorkflowService
 * @requires data-prep.services.datasetWorkflowService.service:UpdateWorkflowService
 * @requires data-prep.services.utils.service:MessageService
 * @requires talend.widget.service:TalendConfirmService
 * @requires data-prep.services.utils.service:StorageService
 * @requires data-prep.services.dataset.service:DatasetListService
 */
export default function DatasetListCtrl(state, $timeout, $translate, $stateParams, StateService, DatasetService, PlaygroundService,
                                        TalendConfirmService, MessageService, UploadWorkflowService, UpdateWorkflowService,
                                        FolderService, StorageService) {
    'ngInject';
    var vm = this;

    vm.datasetService = DatasetService;
    vm.uploadWorkflowService = UploadWorkflowService;
    vm.state = state;
    vm.stateService = StateService;
    vm.messageService = MessageService;
    vm.folderService = FolderService;

    vm.currentFolderClone = _.extend({}, vm.state.folder.currentFolder);

    /**
     * @ngdoc property
     * @name folderName
     * @propertyOf data-prep.dataset-list.controller:DatasetListCtrl
     * @description The folder name
     * @type {String}
     */
    vm.folderName = '';

    /**
     * @type {string} name used for dataset clone
     */
    vm.cloneName = '';

    /**
     * @ngdoc method
     * @name sort
     * @methodOf data-prep.dataset-list.controller:DatasetListCtrl
     * @description sort dataset by sortType by calling refreshDatasets from DatasetService
     * @param {object} sortType Criteria to sort
     */
    vm.updateSortBy = function (sortType) {
        if (state.inventory.sort.id === sortType.id) {
            return;
        }

        var oldSort = state.inventory.sort;

        StateService.setDatasetsSort(sortType);
        StorageService.setDatasetsSort(sortType.id);

        FolderService.getContent(state.folder.currentFolder)
                     .catch(function () {
                         StateService.setDatasetsSort(oldSort);
                         StorageService.setDatasetsSort(oldSort.id);
                     });
    };

    /**
     * @ngdoc method
     * @name sort
     * @methodOf data-prep.dataset-list.controller:DatasetListCtrl
     * @description sort dataset in order (ASC or DESC) by calling refreshDatasets from DatasetService
     * @param {object} order Sort order ASC(ascending) or DESC(descending)
     */
    vm.updateSortOrder = function (order) {
        if (state.inventory.order.id === order.id) {
            return;
        }

        var oldOrder = state.inventory.order;

        StateService.setDatasetsOrder(order);
        StorageService.setDatasetsOrder(order.id);

        FolderService.getContent(state.folder.currentFolder)
                     .catch(function () {
                         StateService.setDatasetsOrder(oldOrder);
                         StorageService.setDatasetsOrder(oldOrder.id);
                     });
    };

    /**
     * @ngdoc method
     * @name open
     * @methodOf data-prep.dataset-list.controller:DatasetListCtrl
     * @description [PRIVATE] Initiate a new preparation from dataset
     * @param {object} dataset The dataset to open
     */
    function open(dataset) {
        PlaygroundService.initPlayground(dataset)
                         .then(function () {
                             $timeout(StateService.showPlayground);
                         });
    }

    /**
     * @ngdoc method
     * @name openPreparation
     * @methodOf data-prep.dataset-list.controller:DatasetListCtrl
     * @description opens a preparation
     * @param {object} preparation The preparation to open
     */
    vm.openPreparation = function openPreparation(preparation) {
        PlaygroundService
            .load(preparation)
            .then(function () {
                $timeout(StateService.showPlayground);
            });
    };

    /**
     * @ngdoc method
     * @name uploadUpdatedDatasetFile
     * @methodOf data-prep.dataset-list.controller:DatasetListCtrl
     * @description [PRIVATE] updates the existing dataset with the uploadd one
     */
    vm.uploadUpdatedDatasetFile = function uploadUpdatedDatasetFile(dataset) {
        UpdateWorkflowService.updateDataset(vm.updateDatasetFile[0], dataset);
    };

    /**
     * @ngdoc method
     * @name remove
     * @methodOf data-prep.dataset-list.controller:DatasetListCtrl
     * @description Delete a dataset
     * @param {object} dataset The dataset to delete
     */
    vm.remove = function remove(dataset) {
        TalendConfirmService.confirm({disableEnter: true}, ['DELETE_PERMANENTLY', 'NO_UNDONE_CONFIRM'], {
                                type: 'dataset',
                                name: dataset.name
                            })
                            .then(function () {
                                return DatasetService.delete(dataset);
                            })
                            .then(function () {
                                FolderService.getContent(state.folder.currentFolder);
                                MessageService.success('REMOVE_SUCCESS_TITLE', 'REMOVE_SUCCESS', {
                                    type: 'dataset',
                                    name: dataset.name
                                });
                            });
    };

    /**
     * @ngdoc method
     * @name rename
     * @methodOf data-prep.dataset-list.controller:DatasetListCtrl
     * @param {object} dataset The dataset to rename
     * @param {string} name The new name
     * @description Rename a dataset
     */
    vm.rename = function rename(dataset, name) {
        var cleanName = name ? name.trim().toLowerCase() : '';
        if (cleanName) {
            if (dataset.renaming) {
                return;
            }

            if (DatasetService.getDatasetByName(cleanName)) {
                MessageService.error('DATASET_NAME_ALREADY_USED_TITLE', 'DATASET_NAME_ALREADY_USED');
                return;
            }

            dataset.renaming = true;
            var oldName = dataset.name;
            dataset.name = name;
            return DatasetService.update(dataset)
                                 .then(function () {
                                     MessageService.success('DATASET_RENAME_SUCCESS_TITLE',
                                         'DATASET_RENAME_SUCCESS');

                                 }).catch(function () {
                    dataset.name = oldName;
                }).finally(function () {
                    dataset.renaming = false;
                });
        }
    };

    /**
     * @ngdoc method
     * @name loadUrlSelectedDataset
     * @methodOf data-prep.dataset-list.controller:DatasetListCtrl
     * @description [PRIVATE] Load playground with provided dataset id, if present in route param
     * @param {object[]} datasets List of all user's datasets
     */
    var loadUrlSelectedDataset = function loadUrlSelectedDataset(datasets) {
        if ($stateParams.datasetid) {
            var selectedDataset = _.find(datasets, function (dataset) {
                return dataset.id === $stateParams.datasetid;
            });

            if (selectedDataset) {
                open(selectedDataset);
            }
            else {
                MessageService.error('PLAYGROUND_FILE_NOT_FOUND_TITLE', 'PLAYGROUND_FILE_NOT_FOUND', {type: 'dataset'});
            }
        }
    };


    /**
     * @ngdoc method
     * @name processCertification
     * @methodOf data-prep.dataset-list.controller:DatasetListCtrl
     * @description [PRIVATE] Ask certification for a dataset
     * @param {object[]} dataset Ask certification for the dataset
     */
    vm.processCertification = function (dataset) {
        vm.datasetService
          .processCertification(dataset)
          .then(FolderService.getContent.bind(null, state.folder.currentFolder));
    };

    //-------------------------------
    // Folder
    //-------------------------------

    vm.goToFolder = FolderService.getContent;

    /**
     * @ngdoc method
     * @name actionsOnAddFolderClick
     * @methodOf data-prep.dataset-list.controller:DatasetListCtrl
     * @description run these action when clicking on Add Folder button
     */
    vm.actionsOnAddFolderClick = function () {
        vm.folderNameModal = true;
        vm.folderName = '';
    };

    /**
     * @ngdoc method
     * @name addFolder
     * @methodOf data-prep.dataset-list.controller:DatasetListCtrl
     * @description Create a new folder
     */
    vm.addFolder = function addFolder() {
        vm.folderNameForm.$commitViewValue();

        var pathToCreate = (state.folder.currentFolder.id ? state.folder.currentFolder.id : '') + '/' + vm.folderName;
        FolderService.create(pathToCreate)
                     .then(function () {
                         FolderService.getContent(state.folder.currentFolder);
                         vm.folderNameModal = false;
                     });
    };

    /**
     * @ngdoc method
     * @name renameFolder
     * @methodOf data-prep.dataset-list.controller:DatasetListCtrl
     * @description Rename a folder
     * @param {object} folder the folder to rename
     * @param {string} newName the new last part of the path
     */
    vm.renameFolder = function renameFolder(folder, newName) {
        var path = folder.id;
        var lastSlashIndex = path.lastIndexOf('/');
        var newPath = path.substring(0, lastSlashIndex) + '/' + newName;
        FolderService.rename(path, newPath)
                     .then(function () {
                         FolderService.getContent(state.folder.currentFolder);
                     });
    };

    /**
     * @ngdoc method
     * @name removeFolder
     * @methodOf data-prep.dataset-list.controller:DatasetListCtrl
     * @description Remove a folder
     * @param {object} folder The folder to remove
     */
    vm.removeFolder = function removeFolder(folder) {
        FolderService.remove(folder.id)
                     .then(function () {
                         FolderService.getContent(state.folder.currentFolder);
                     });
    };


    /**
     * @ngdoc method
     * @name openFolderSelection
     * @methodOf data-prep.dataset-list.controller:DatasetListCtrl
     * @description Remove a folder
     * @param {object} dataset The dataset to clone or copy
     */
    vm.openFolderSelection = function openFolderSelection(dataset) {
        vm.datasetCopyVisibility = true;
        vm.datasetToCopyMove = dataset;
    };

    // load the datasets
    DatasetService
        .getDatasets()
        .then(loadUrlSelectedDataset);
}
