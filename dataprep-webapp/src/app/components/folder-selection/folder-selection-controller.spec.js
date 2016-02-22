/*  ============================================================================

 Copyright (C) 2006-2016 Talend Inc. - www.talend.com

 This source code is available under agreement available at
 https://github.com/Talend/data-prep/blob/master/LICENSE

 You should have received a copy of the agreement
 along with this program; if not, write to Talend SA
 9 rue Pages 92150 Suresnes, France

 ============================================================================*/


describe('folder selection controller', function () {

    var createController, scope, ctrl;

    beforeEach(angular.mock.module('data-prep.folder-selection'));

    beforeEach(angular.mock.module('pascalprecht.translate', function ($translateProvider) {
        $translateProvider.translations('en', {
            'HOME_FOLDER': 'Home'
        });
        $translateProvider.preferredLanguage('en');
    }));

    beforeEach(inject(function ($rootScope, $controller) {
        scope = $rootScope.$new();

        createController = function (myCurrentFolder) {
            var ctrlFn = $controller('FolderSelectionCtrl', {
                $scope: scope
            }, true);
            ctrlFn.instance.currentFolder = myCurrentFolder;
            return ctrlFn();
        };
    }));

    describe('folders initialization', function () {
        it('should init folders tree at initialization', inject(function ($translate) {
            //when
            ctrl = createController(null);

            //then
            expect(ctrl.foldersFound).toEqual([]);
            expect(ctrl.searchFolderQuery).toBe('');
            expect(ctrl.folders[0]).toEqual({
                id: '',
                path: '',
                level: 0,
                alreadyToggled: true,
                showFolder: true,
                collapsed: false,
                name: $translate.instant('HOME_FOLDER')
            });
        }));


        it('should locate current folder in the folders tree at initialization at 1st level', inject(function ($q, $rootScope, FolderService) {
            //given
            var currentFolder = {name: 'lookup', path:'lookup'};
            spyOn(FolderService, 'children').and.returnValue($q.when({data:[currentFolder]}));

            //when
            ctrl = createController(currentFolder);
            $rootScope.$digest();

            //then
            expect(FolderService.children).toHaveBeenCalledWith('');
            expect(FolderService.children.calls.count()).toBe(1);
            expect(ctrl.selectedFolder.selected).toBe(true);
            expect(ctrl.selectedFolder).toEqual(currentFolder);
        }));

        it('should locate current folder in the folders tree at initialization at Root level', inject(function ($q, $rootScope, FolderService) {
            //given
            var currentFolder = {name: 'Home', path:'/'};
            spyOn(FolderService, 'children').and.returnValue($q.when({data:[]}));

            //when
            ctrl = createController(currentFolder);
            $rootScope.$digest();

            //then
            expect(FolderService.children).toHaveBeenCalledWith('');
            expect(FolderService.children.calls.count()).toBe(1);
            expect(ctrl.selectedFolder.selected).toBe(true);
            expect(ctrl.selectedFolder).toEqual(ctrl.folders[0]);
            expect(ctrl.selectedFolder.hasNoChildren).toBe(true);
        }));

        it('should locate current folder in the folders tree at initialization at 2nd/nth level', inject(function ($q, $rootScope, FolderService) {
            //given
            var currentFolder = {name: 'subSubFolder', path:'folder/subFolder/subSubFolder'};
            var counter = 0;
            spyOn(FolderService, 'children').and.callFake(function(){
                if(counter === 0){
                    counter++;
                    return $q.when({data:[{name: 'folder', path: 'folder'}]});
                }
                else if (counter === 1){
                    counter++;
                    return $q.when({data:[{name: 'subFolder', path: 'folder/subFolder'}]});
                }
                else if(counter === 2){
                    return $q.when({data:[currentFolder]})
                }
            });

            //when
            ctrl = createController(currentFolder);
            $rootScope.$digest();

            //then
            expect(ctrl.selectedFolder).toEqual(currentFolder);
            expect(ctrl.selectedFolder.selected).toBe(true);
        }));
    });

    describe('folders search', function(){
        var foldersSearchResult = [
            {path: 'folder-1', name: 'folder-1'},
            {path: 'folder-1/sub-1', name: 'sub-1'},
            {path: 'folder-1/sub-2/folder-1-beer', name: 'folder-1-beer'}
        ];

        beforeEach(inject(function($q, FolderService){
            ctrl = createController(null);
            spyOn(FolderService, 'search').and.returnValue($q.when({data:foldersSearchResult}));
        }));

        it('should call search folders service', inject(function (FolderService) {
            //given
            ctrl.searchFolderQuery = 'beer';

            //when
            ctrl.searchFolders();

            //then
            expect(ctrl.foldersFound).toEqual([]);
            expect(FolderService.search).toHaveBeenCalledWith(ctrl.searchFolderQuery);
        }));

        it('should call filter root folder and search folders service', inject(function () {
            //given
            ctrl.searchFolderQuery = 'e';

            //when
            ctrl.searchFolders();
            scope.$digest();

            //then
            expect(ctrl.foldersFound.length).toBe(foldersSearchResult.length + 1);
        }));

        it('should not call filter root folder but only search folders service', inject(function () {
            //given
            ctrl.searchFolderQuery = 'f';

            //when
            ctrl.searchFolders();
            scope.$digest();

            //then
            expect(ctrl.foldersFound.length).toBe(foldersSearchResult.length);
            expect(ctrl.foldersFound).toEqual(foldersSearchResult);
        }));

        it('should show the folders tree and not the search result', inject(function ($translate) {
            //given
            ctrl.searchFolderQuery = '';

            //when
            ctrl.searchFolders();
            scope.$digest();

            //then
            expect(ctrl.foldersFound).toEqual([]);
            expect(ctrl.folders).toEqual([{
                id: '',
                path: '',
                level: 0,
                alreadyToggled: true,
                showFolder: true,
                collapsed: false,
                name: $translate.instant('HOME_FOLDER')
            }]);
        }));

        it('should select the 1st result by default', inject(function () {
            //given
            ctrl.searchFolderQuery = 'f';

            //when
            ctrl.searchFolders();
            scope.$digest();

            //then
            expect(ctrl.selectedFolder).toBe(foldersSearchResult[0]);
            expect(ctrl.selectedFolder.selected).toBe(true);
        }));
    });
});