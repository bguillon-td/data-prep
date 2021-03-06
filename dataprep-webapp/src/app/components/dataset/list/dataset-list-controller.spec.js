/*  ============================================================================

  Copyright (C) 2006-2016 Talend Inc. - www.talend.com

  This source code is available under agreement available at
  https://github.com/Talend/data-prep/blob/master/LICENSE

  You should have received a copy of the agreement
  along with this program; if not, write to Talend SA
  9 rue Pages 92150 Suresnes, France

  ============================================================================*/

describe('Dataset list controller', function () {
    'use strict';

    var createController, scope, stateMock;
    var datasets = [
        {id: 'ec4834d9bc2af8', name: 'Customers (50 lines)'},
        {id: 'ab45f893d8e923', name: 'Us states'},
        {id: 'cf98d83dcb9437', name: 'Customers (1K lines)'}
    ];
    var refreshedDatasets = [
        {id: 'ec4834d9bc2af8', name: 'Customers (50 lines)'},
        {id: 'ab45f893d8e923', name: 'Us states'}
    ];

    var theCurrentFolder = {path: 'folder-16/folder-1/sub-1', name: 'sub-1'};

    beforeEach(angular.mock.module('pascalprecht.translate', function ($translateProvider) {
        $translateProvider.translations('en', {
            'HOME_FOLDER': 'Home'
        });
        $translateProvider.preferredLanguage('en');
    }));

    var sortList = [
        {id: 'name', name: 'NAME_SORT', property: 'name'},
        {id: 'date', name: 'DATE_SORT', property: 'created'}
    ];

    var orderList = [
        {id: 'asc', name: 'ASC_ORDER'},
        {id: 'desc', name: 'DESC_ORDER'}
    ];

    beforeEach(angular.mock.module('data-prep.dataset-list', function ($provide) {
        stateMock = {
            inventory: {
                datasets: [],
                sortList: sortList,
                orderList: orderList,
                sort: sortList[0],
                order: orderList[0],
                currentFolder: theCurrentFolder,
                currentFolderContent: {
                    datasets: [datasets[0]]
                }
            }
        };
        $provide.constant('state', stateMock);
    }));

    beforeEach(inject(function ($rootScope, $controller, $q, $state, DatasetService, MessageService, StorageService, StateService) {
        var datasetsValues = [datasets, refreshedDatasets];
        scope = $rootScope.$new();

        createController = function () {
            return $controller('DatasetListCtrl', {
                $scope: scope
            });
        };

        spyOn($state, 'go').and.returnValue();
        spyOn(DatasetService, 'processCertification').and.returnValue($q.when());
        spyOn(DatasetService, 'getDatasets').and.callFake(() => $q.when(datasetsValues.shift()));
        spyOn(StorageService, 'setDatasetsSort').and.returnValue();
        spyOn(StorageService, 'setDatasetsOrder').and.returnValue();
        spyOn(StateService, 'setPreviousState').and.returnValue();
        spyOn(MessageService, 'error').and.returnValue();
    }));

    describe('sort parameters', function () {

        describe('with dataset refresh success', function () {
            beforeEach(inject(function ($q, FolderService) {
                spyOn(FolderService, 'getContent').and.returnValue($q.when(true));
            }));

            it('should refresh dataset when sort is changed', inject(function ($q, FolderService) {
                //given
                var ctrl = createController();
                var newSort = {id: 'date', name: 'DATE_SORT'};

                //when
                ctrl.updateSortBy(newSort);

                //then
                expect(FolderService.getContent).toHaveBeenCalledWith(theCurrentFolder);
            }));

            it('should refresh dataset when order is changed', inject(function ($q, FolderService) {
                //given
                var ctrl = createController();
                var newSortOrder = {id: 'desc', name: 'DESC_ORDER'};

                //when
                ctrl.updateSortOrder(newSortOrder);

                //then
                expect(FolderService.getContent).toHaveBeenCalledWith(theCurrentFolder);
            }));

            it('should not refresh dataset when requested sort is already the selected one', inject(function (FolderService) {
                //given
                var ctrl = createController();
                var newSort = {id: 'date', name: 'DATE_SORT'};

                //when
                ctrl.updateSortBy(newSort);
                stateMock.inventory.sort = newSort;
                ctrl.updateSortBy(newSort);

                //then
                expect(FolderService.getContent.calls.count()).toBe(1);
            }));

            it('should not refresh dataset when requested order is already the selected one', inject(function (FolderService) {
                //given
                var ctrl = createController();
                var newSortOrder = {id: 'desc', name: 'DESC_ORDER'};

                //when
                ctrl.updateSortOrder(newSortOrder);
                stateMock.inventory.order = newSortOrder;
                ctrl.updateSortOrder(newSortOrder);

                //then
                expect(FolderService.getContent.calls.count()).toBe(1);
            }));

            it('should update sort parameter', inject(function (DatasetService, StorageService) {
                //given
                var ctrl = createController();
                var newSort = {id: 'date', name: 'DATE'};

                //when
                ctrl.updateSortBy(newSort);

                //then
                expect(StorageService.setDatasetsSort).toHaveBeenCalledWith('date');
            }));

            it('should update order parameter', inject(function (DatasetService, StorageService) {
                //given
                var ctrl = createController();
                var newSortOrder = {id: 'desc', name: 'DESC_ORDER'};

                //when
                ctrl.updateSortOrder(newSortOrder);

                //then
                expect(StorageService.setDatasetsOrder).toHaveBeenCalledWith('desc');
            }));

        });

        describe('with dataset refresh failure', function () {
            beforeEach(inject(function ($q, FolderService, StateService) {
                spyOn(FolderService, 'getContent').and.returnValue($q.reject(false));
                spyOn(StateService, 'setDatasetsSort');
                spyOn(StateService, 'setDatasetsOrder');
            }));

            it('should set the old sort parameter', inject(function (StateService) {
                //given
                var newSort = {id: 'date', name: 'DATE'};
                var previousSelectedSort = {id: 'name', name: 'NAME_SORT'};

                var ctrl = createController();
                stateMock.inventory.sort = previousSelectedSort;

                //when
                ctrl.updateSortBy(newSort);
                expect(StateService.setDatasetsSort).toHaveBeenCalledWith(newSort);
                scope.$digest();

                //then
                expect(StateService.setDatasetsSort).toHaveBeenCalledWith(previousSelectedSort);
            }));

            it('should set the old order parameter', inject(function (StateService) {
                //given
                var newSortOrder = {id: 'desc', name: 'DESC'};
                var previousSelectedOrder = {id: 'asc', name: 'ASC_ORDER'};

                var ctrl = createController();
                stateMock.inventory.order = previousSelectedOrder;

                //when
                ctrl.updateSortOrder(newSortOrder);
                expect(StateService.setDatasetsOrder).toHaveBeenCalledWith(newSortOrder);
                scope.$digest();

                //then
                expect(StateService.setDatasetsOrder).toHaveBeenCalledWith(previousSelectedOrder);
            }));
        });
    });

    describe('remove dataset', function () {
        beforeEach(inject(function ($q, MessageService, DatasetService, TalendConfirmService, FolderService) {
            spyOn(FolderService, 'getContent').and.returnValue($q.when(true));
            spyOn(DatasetService, 'delete').and.returnValue($q.when(true));
            spyOn(MessageService, 'success').and.returnValue();
            spyOn(TalendConfirmService, 'confirm').and.returnValue($q.when(true));
        }));

        it('should ask confirmation before deletion', inject(function (TalendConfirmService) {
            //given
            var dataset = datasets[0];
            var ctrl = createController();

            //when
            ctrl.remove(dataset);
            scope.$digest();

            //then
            expect(TalendConfirmService.confirm).toHaveBeenCalledWith({disableEnter: true}, ['DELETE_PERMANENTLY', 'NO_UNDONE_CONFIRM'], {
                type: 'dataset',
                name: 'Customers (50 lines)'
            });
        }));

        it('should remove dataset', inject(function (DatasetService) {
            //given
            var dataset = datasets[0];
            var ctrl = createController();

            //when
            ctrl.remove(dataset);
            scope.$digest();

            //then
            expect(DatasetService.delete).toHaveBeenCalledWith(dataset);
        }));

        it('should show confirmation toast', inject(function (MessageService) {
            //given
            var dataset = datasets[0];
            var ctrl = createController();

            //when
            ctrl.remove(dataset);
            scope.$digest();

            //then
            expect(MessageService.success).toHaveBeenCalledWith('REMOVE_SUCCESS_TITLE', 'REMOVE_SUCCESS', {
                type: 'dataset',
                name: 'Customers (50 lines)'
            });
        }));

    });

    describe('bindings', function () {

        it('should reset parameters when click on add folder button', inject(function () {
            //given
            var ctrl = createController();

            //when
            ctrl.actionsOnAddFolderClick();

            //then
            expect(ctrl.folderNameModal).toBe(true);
            expect(ctrl.folderName).toBe('');
        }));

        it('should add folder with current folder path', inject(function ($q, FolderService) {
            //given
            var ctrl = createController();
            ctrl.folderName = '1';
            ctrl.folderNameForm = {};
            ctrl.folderNameForm.$commitViewValue = function () {
            };
            spyOn(FolderService, 'create').and.returnValue($q.when(true));
            spyOn(FolderService, 'getContent').and.returnValue($q.when(true));
            spyOn(ctrl.folderNameForm, '$commitViewValue').and.returnValue();

            //when
            ctrl.addFolder();
            scope.$digest();
            //then
            expect(ctrl.folderNameForm.$commitViewValue).toHaveBeenCalled();
            expect(FolderService.create).toHaveBeenCalledWith(theCurrentFolder.path + '/1');
            expect(FolderService.getContent).toHaveBeenCalledWith(theCurrentFolder);

        }));


        it('should add folder with root folder path', inject(function ($q, FolderService) {
            //given
            stateMock.inventory.currentFolder = {path: '', name: 'Home'};

            var ctrl = createController();
            ctrl.folderName = '1';
            ctrl.folderNameForm = {};
            ctrl.folderNameForm.$commitViewValue = function () {
            };
            spyOn(FolderService, 'create').and.returnValue($q.when(true));
            spyOn(FolderService, 'getContent').and.returnValue($q.when(true));
            spyOn(ctrl.folderNameForm, '$commitViewValue').and.returnValue();

            //when
            ctrl.addFolder();
            scope.$digest();
            //then
            expect(ctrl.folderNameForm.$commitViewValue).toHaveBeenCalled();
            expect(FolderService.create).toHaveBeenCalledWith('/1');
            expect(FolderService.getContent).toHaveBeenCalledWith({path: '', name: 'Home'});

        }));

        it('should process certification', inject(function ($q, FolderService, DatasetService) {
            //given
            var ctrl = createController();
            spyOn(FolderService, 'getContent').and.returnValue($q.when(true));

            //when
            ctrl.processCertification(datasets[0]);
            scope.$digest();
            //then
            expect(DatasetService.processCertification).toHaveBeenCalledWith(datasets[0]);
            expect(FolderService.getContent).toHaveBeenCalledWith(theCurrentFolder, undefined);
        }));
    });

    describe('rename', function () {

        it('should do nothing when dataset is currently being renamed', inject(function ($q, DatasetService) {
            //given
            spyOn(DatasetService, 'update').and.returnValue($q.when(true));

            var ctrl = createController();
            var dataset = {renaming: true};
            var name = 'new dataset name';

            //when
            ctrl.rename(dataset, name);

            //then
            expect(DatasetService.update).not.toHaveBeenCalled();
        }));

        it('should change name on the current dataset and call service to rename it', inject(function ($q, DatasetService) {
            //given
            spyOn(DatasetService, 'update').and.returnValue($q.when(true));

            var ctrl = createController();
            var dataset = {name: 'my old name'};
            var name = 'new dataset name';

            //when
            ctrl.rename(dataset, name);

            //then
            expect(dataset.name).toBe(name);
            expect(DatasetService.update).toHaveBeenCalledWith(dataset);
        }));

        it('should show confirmation message', inject(function ($q, DatasetService, MessageService) {
            //given
            spyOn(DatasetService, 'update').and.returnValue($q.when(true));
            spyOn(MessageService, 'success').and.returnValue();

            var ctrl = createController();
            var dataset = {name: 'my old name'};
            var name = 'new dataset name';

            //when
            ctrl.rename(dataset, name);
            scope.$digest();

            //then
            expect(MessageService.success).toHaveBeenCalledWith('DATASET_RENAME_SUCCESS_TITLE', 'DATASET_RENAME_SUCCESS');
        }));

        it('should set back the old name when the real rename is rejected', inject(function ($q, DatasetService) {
            //given
            spyOn(DatasetService, 'update').and.returnValue($q.reject(false));

            var ctrl = createController();
            var oldName = 'my old name';
            var newName = 'new dataset name';
            var dataset = {name: oldName};

            //when
            ctrl.rename(dataset, newName);
            expect(dataset.name).toBe(newName);
            scope.$digest();

            //then
            expect(dataset.name).toBe(oldName);
        }));

        it('should manage "renaming" flag', inject(function ($q, DatasetService, MessageService) {
            //given
            spyOn(DatasetService, 'update').and.returnValue($q.when(true));
            spyOn(MessageService, 'success').and.returnValue();

            var ctrl = createController();
            var dataset = {name: 'my old name'};
            var name = 'new dataset name';

            expect(dataset.renaming).toBeFalsy();

            //when
            ctrl.rename(dataset, name);
            expect(dataset.renaming).toBeTruthy();
            scope.$digest();

            //then
            expect(dataset.renaming).toBeFalsy();
        }));

        it('should not call service to rename dataset with null name', inject(function ($q, DatasetService) {
            //given
            spyOn(DatasetService, 'update').and.returnValue($q.when(true));
            var ctrl = createController();
            var name = 'dataset name';
            var dataset = {name: name};


            //when
            ctrl.rename(dataset);
            scope.$digest();

            //then
            expect(dataset.name).toBe(name);
            expect(DatasetService.update).not.toHaveBeenCalled();
            expect(DatasetService.update).not.toHaveBeenCalledWith(dataset);
        }));

        it('should not call service to rename dataset with empty name', inject(function ($q, DatasetService) {
            //given
            spyOn(DatasetService, 'update').and.returnValue($q.when(true));
            var ctrl = createController();
            var name = 'dataset name';
            var dataset = {name: name};


            //when
            ctrl.rename(dataset, '');
            scope.$digest();

            //then
            expect(dataset.name).toBe(name);
            expect(DatasetService.update).not.toHaveBeenCalled();
            expect(DatasetService.update).not.toHaveBeenCalledWith(dataset);
        }));

        it('should not call service to rename dataset with an already existing name', inject(function ($q, DatasetService, MessageService) {
            //given
            spyOn(DatasetService, 'update').and.returnValue($q.when(true));
            spyOn(DatasetService, 'getDatasetByName').and.returnValue({id: 'ab45f893d8e923', name: 'Us states'});
            var ctrl = createController();
            var name = 'foo';
            var dataset = {name: name};

            //when
            ctrl.rename(dataset, 'Us states');
            scope.$digest();

            //then
            expect(dataset.name).toBe(name);
            expect(DatasetService.update).not.toHaveBeenCalled();
            expect(MessageService.error).toHaveBeenCalledWith('DATASET_NAME_ALREADY_USED_TITLE', 'DATASET_NAME_ALREADY_USED');
        }));


    });

    describe('clone', function () {

        beforeEach(inject(function ($q, MessageService, FolderService) {
            spyOn(MessageService, 'success').and.returnValue();
            spyOn(FolderService, 'getContent').and.returnValue($q.when(true));
        }));

        describe('when success', function () {
            beforeEach(inject(function ($q, DatasetService) {
                spyOn(DatasetService, 'clone').and.returnValue($q.when(true));
            }));

            it('should call clone service', inject(function ($q, DatasetService, FolderService) {
                //given
                var folder = {path: 'foo'};
                var cloneName = 'bar';
                var ctrl = createController();
                ctrl.datasetToClone = datasets[0];
                ctrl.folderDestination = folder;
                ctrl.cloneNameForm = {};
                ctrl.cloneNameForm.$commitViewValue = function () {};
                ctrl.cloneName = cloneName;

                //when
                ctrl.clone();
                expect(ctrl.isCloningDs).toBeTruthy();
                scope.$digest();

                //then
                expect(DatasetService.clone).toHaveBeenCalledWith(datasets[0], folder, cloneName);
                expect(FolderService.getContent).toHaveBeenCalled();
                expect(ctrl.isCloningDs).toBeFalsy();
            }));

            it('should display message on success', inject(function ($q, MessageService, DatasetService, FolderService) {
                //given
                var folder = {path: 'foo'};
                var ctrl = createController();
                var cloneName = 'bar';
                ctrl.datasetToClone = datasets[0];
                ctrl.folderDestination = folder;
                ctrl.cloneNameForm = {};
                ctrl.cloneNameForm.$commitViewValue = function () {};
                ctrl.cloneName = cloneName;

                //when
                ctrl.clone();
                scope.$digest();

                //then
                expect(DatasetService.clone).toHaveBeenCalledWith(datasets[0], folder, cloneName);
                expect(MessageService.success).toHaveBeenCalledWith('COPY_SUCCESS_TITLE', 'COPY_SUCCESS');
                expect(FolderService.getContent).toHaveBeenCalled();
            }));
        });

        describe('when failure due to server error', function () {
            beforeEach(inject(function ($q, MessageService, FolderService, DatasetService) {
                spyOn(DatasetService, 'clone').and.returnValue($q.reject());
            }));

            it('should faill on clone service call', inject(function ($q, DatasetService) {
                //given
                var folder = {path: 'foo'};
                var cloneName = 'bar';
                var ctrl = createController();
                ctrl.datasetToClone = datasets[0];
                ctrl.folderDestination = folder;
                ctrl.cloneNameForm = {};
                ctrl.cloneNameForm.$commitViewValue = function () {};
                ctrl.cloneName = cloneName;

                //when
                ctrl.clone();
                expect(ctrl.isCloningDs).toBeTruthy();
                scope.$digest();

                //then
                expect(DatasetService.clone).toHaveBeenCalledWith(datasets[0], folder, cloneName);
                expect(ctrl.isCloningDs).toBeFalsy();
            }));
        });

    });

    describe('move', function () {

        beforeEach(inject(function ($q, MessageService, FolderService) {
            spyOn(MessageService, 'success').and.returnValue();
            spyOn(FolderService, 'getContent').and.returnValue($q.when(true));
        }));

        describe('when success', function () {
            beforeEach(inject(function ($q, MessageService, FolderService, DatasetService) {
                spyOn(DatasetService, 'move').and.returnValue($q.when(true));
            }));

            it('should call move service', inject(function ($q, DatasetService, FolderService) {
                //given
                var folder = {path: 'foo'};
                var cloneName = 'bar';
                var ctrl = createController();
                ctrl.datasetToClone = datasets[0];
                ctrl.folderDestination = folder;
                ctrl.cloneNameForm = {};
                ctrl.cloneNameForm.$commitViewValue = function () {};
                ctrl.cloneName = cloneName;

                //when
                ctrl.move();
                expect(ctrl.isMovingDs).toBeTruthy();
                scope.$digest();

                //then
                expect(DatasetService.move).toHaveBeenCalledWith(datasets[0], theCurrentFolder, folder, cloneName);
                expect(FolderService.getContent).toHaveBeenCalled();
                expect(ctrl.isMovingDs).toBeFalsy();
            }));

            it('should display message on success', inject(function ($q, MessageService, DatasetService, FolderService) {
                //given
                var folder = {path: 'foo'};
                var ctrl = createController();
                var cloneName = 'bar';

                ctrl.datasetToClone = datasets[0];
                ctrl.folderDestination = folder;
                ctrl.cloneNameForm = {};
                ctrl.cloneNameForm.$commitViewValue = function () {};
                ctrl.cloneName = cloneName;

                //when
                ctrl.move();
                scope.$digest();

                //then
                expect(DatasetService.move).toHaveBeenCalledWith(datasets[0], theCurrentFolder, folder, cloneName);
                expect(MessageService.success).toHaveBeenCalledWith('MOVE_SUCCESS_TITLE', 'MOVE_SUCCESS');
                expect(FolderService.getContent).toHaveBeenCalled();
            }));
        });

        describe('when failure due to server error', function () {
            beforeEach(inject(function ($q, MessageService, FolderService, DatasetService) {
                spyOn(DatasetService, 'move').and.returnValue($q.reject());
            }));

            it('should fail on move service call', inject(function ($q, DatasetService) {
                //given
                var folder = {path: 'foo'};
                var cloneName = 'bar';
                var ctrl = createController();
                ctrl.datasetToClone = datasets[0];
                ctrl.folderDestination = folder;
                ctrl.cloneNameForm = {};
                ctrl.cloneNameForm.$commitViewValue = function () {};
                ctrl.cloneName = cloneName;

                //when
                ctrl.move();
                expect(ctrl.isMovingDs).toBeTruthy();
                scope.$digest();

                //then
                expect(DatasetService.move).toHaveBeenCalledWith(datasets[0], theCurrentFolder, folder, cloneName);
                expect(ctrl.isMovingDs).toBeFalsy();
            }));
        });
    });

    describe('search folders', function () {

        beforeEach(inject(function ($q, MessageService, FolderService) {
            var foldersFromSearch = [
                {path: 'folder-1', name: 'folder-1'},
                {path: 'folder-1/sub-1', name: 'sub-1'},
                {path: 'folder-1/sub-2/folder-1-beer', name: 'folder-1-beer'}
            ];

            var childrenFolders = [
                {path: 'folder-1/beer', name: 'folder-1/beer'},
                {path: 'folder-2', name: 'folder-2'},
                {path: 'folder-3', name: 'folder-3'}
            ];

            spyOn(FolderService, 'children').and.returnValue($q.when({data: childrenFolders}));
            spyOn(FolderService, 'search').and.returnValue($q.when({data: foldersFromSearch}));
            spyOn(MessageService, 'success').and.returnValue();

        }));

        it('should call children service and open modal', inject(function (FolderService) {
            // given
            var ctrl = createController();
            stateMock.inventory.currentFolder = {path: 'folder-1', name: 'folder-1'};
            scope.$digest();
            spyOn(ctrl, 'chooseFolder').and.returnValue();
            spyOn(ctrl, 'toggle').and.returnValue();

            // when
            ctrl.openFolderChoice(datasets[0]);
            scope.$digest();

            //then
            expect(FolderService.children).toHaveBeenCalled();
            expect(ctrl.folderDestinationModal).toBe(true);
            expect(ctrl.datasetToClone).toBe(datasets[0]);
            expect(ctrl.foldersFound).toEqual([]);
            expect(ctrl.searchFolderQuery).toBe('');
            expect(ctrl.folders).toEqual([{
                path: '',
                collapsed: false,
                name: 'Home',
                nodes: [
                    {path: 'folder-1/beer', name: 'folder-1/beer', collapsed: true},
                    {path: 'folder-2', name: 'folder-2', collapsed: true},
                    {path: 'folder-3', name: 'folder-3', collapsed: true}
                ]
            }]);

        }));


        it('should call search folders service', inject(function (FolderService) {
            //given
            var foldersFromSearch = [
                {path: 'folder-1', name: 'folder-1'},
                {path: 'folder-1/sub-1', name: 'sub-1'},
                {path: 'folder-1/sub-2/folder-1-beer', name: 'folder-1-beer'}
            ];

            var ctrl = createController();
            ctrl.searchFolderQuery = 'beer';
            spyOn(ctrl, 'chooseFolder').and.returnValue();

            //when
            ctrl.searchFolders();
            scope.$digest();

            //then
            expect(FolderService.search).toHaveBeenCalledWith(ctrl.searchFolderQuery);
            expect(ctrl.foldersFound).toEqual(foldersFromSearch);
            expect(ctrl.chooseFolder).toHaveBeenCalledWith(foldersFromSearch[0]);
        }));

        it('should call filter root folder and search folders service', inject(function (FolderService) {
            //given
            var foldersFromSearch = [
                {path: '', name: 'Home'},
                {path: 'folder-1', name: 'folder-1'},
                {path: 'folder-1/sub-1', name: 'sub-1'},
                {path: 'folder-1/sub-2/folder-1-beer', name: 'folder-1-beer'}
            ];

            var ctrl = createController();
            ctrl.searchFolderQuery = 'H';
            spyOn(ctrl, 'chooseFolder').and.returnValue();
            var rootFolder = {path: '', name: 'Home'};

            //when
            ctrl.searchFolders();
            scope.$digest();

            //then
            expect(FolderService.search).toHaveBeenCalledWith(ctrl.searchFolderQuery);
            expect(ctrl.foldersFound).toEqual(foldersFromSearch);
            expect(ctrl.chooseFolder).toHaveBeenCalledWith(rootFolder);
        }));

        it('should not call search folders service if searchFolderQuery is empty', inject(function (FolderService) {
            //given

            var ctrl = createController();
            ctrl.searchFolderQuery = '';
            spyOn(ctrl, 'chooseFolder').and.returnValue();
            ctrl.folders = [
                {path: 'folder-1', name: 'folder-1'},
                {path: 'folder-1/sub-1', name: 'sub-1'},
                {path: 'folder-1/sub-2/folder-1-beer', name: 'folder-1-beer'}
            ];
            //when
            ctrl.searchFolders();
            scope.$digest();

            //then
            expect(FolderService.search).not.toHaveBeenCalled();
            expect(ctrl.chooseFolder).toHaveBeenCalledWith({path: 'folder-1', name: 'folder-1'});
        }));

        it('choose folder should marker folder as selected', function () {
            //given
            var folder = {path: '/foo/beer'};
            var ctrl = createController();

            //when
            ctrl.chooseFolder(folder);
            scope.$digest();

            //then
            expect(folder.selected).toBe(true);
            expect(ctrl.folderDestination).toBe(folder);
        });

        it('toggle should call children service', inject(function (FolderService) {
            //given
            var folder = {path: 'folder-1', collapsed: true};
            var ctrl = createController();
            spyOn(ctrl, 'chooseFolder').and.returnValue();

            //when
            ctrl.toggle(folder, ['beer'], 'folder-1');
            scope.$digest();

            //then
            expect(FolderService.children).toHaveBeenCalledWith(folder.path);
        }));

        it('toggle should not call children service because already children', inject(function (FolderService) {
            //given
            var folder = {path: '/foo/beer', collapsed: true, nodes: [{id: 'wine'}]};
            var ctrl = createController();

            //when
            ctrl.toggle(folder);
            scope.$digest();

            //then
            expect(FolderService.children).not.toHaveBeenCalled();
        }));

        it('toggle should not call children service because not collapsed', inject(function (FolderService) {
            //given
            var folder = {path: '/foo/beer', collapsed: false};
            var ctrl = createController();

            //when
            ctrl.toggle(folder);
            scope.$digest();

            //then
            expect(FolderService.children).not.toHaveBeenCalled();
        }));

        it('collapseNodes should mark children as collapsed', function () {
            //given
            var folder = {path: '/foo/beer', collapsed: true, nodes: [{id: 'wine'}, {id: 'cheese'}]};
            var ctrl = createController();

            //when
            ctrl.collapseNodes(folder);
            scope.$digest();

            //then
            expect(folder.nodes[0].collapsed).toBe(true);
            expect(folder.nodes[1].collapsed).toBe(true);
            expect(folder.collapsed).toBe(false);
        });

        it('should rename folder', inject(function ($q, FolderService) {
            //given
            spyOn(FolderService, 'rename').and.returnValue($q.when());
            spyOn(FolderService, 'getContent').and.returnValue($q.when());
            var ctrl = createController();
            var folderToRename = {path: 'toto/1'};

            //when
            ctrl.renameFolder(folderToRename, '2');
            scope.$digest();
            //then
            expect(FolderService.rename).toHaveBeenCalledWith('toto/1', 'toto/2');
            expect(FolderService.getContent).toHaveBeenCalledWith(theCurrentFolder);
        }));

        it('should remove folder', inject(function ($q, FolderService) {
            //given
            spyOn(FolderService, 'remove').and.returnValue($q.when(true));
            spyOn(FolderService, 'getContent').and.returnValue($q.when(true));
            var ctrl = createController();

            var folder = {path: 'toto'};

            //when
            ctrl.removeFolder(folder);
            scope.$digest();
            //then
            expect(FolderService.remove).toHaveBeenCalledWith(folder.path);
            expect(FolderService.getContent).toHaveBeenCalledWith(theCurrentFolder);
        }));

    });

    describe('Replace an existing dataset with a new one', function () {
        beforeEach(inject(function (UpdateWorkflowService) {
            spyOn(UpdateWorkflowService, 'updateDataset').and.returnValue();
        }));

        it('should update the existing dataset with the new file', inject(function (UpdateWorkflowService) {
            //given
            var ctrl = createController();
            var existingDataset = {};
            var newDataSet = {};
            ctrl.updateDatasetFile = [existingDataset];

            //when
            ctrl.uploadUpdatedDatasetFile(newDataSet);

            //then
            expect(UpdateWorkflowService.updateDataset).toHaveBeenCalledWith(existingDataset, newDataSet);
        }));
    });

    describe('related preparations', function () {

        it('should load preparation and show playground', inject(function ($state, $timeout, StateService) {
            //given
            var ctrl = createController();
            var preparation = {
                id: 'de618c62ef97b3a95b5c171bc077ffe22e1d6f79',
                dataSetId: 'dacd45cf-5bd0-4768-a9b7-f6c199581efc',
                author: 'anonymousUser'
            };

            //when
            ctrl.openPreparation(preparation);
            scope.$digest();
            $timeout.flush();

            //then
            expect(StateService.setPreviousState).toHaveBeenCalledWith('nav.home.datasets');
            expect($state.go).toHaveBeenCalledWith('playground.preparation', {prepid: preparation.id});
        }));
    });
});
