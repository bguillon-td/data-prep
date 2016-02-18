/*  ============================================================================

 Copyright (C) 2006-2016 Talend Inc. - www.talend.com

 This source code is available under agreement available at
 https://github.com/Talend/data-prep/blob/master/LICENSE

 You should have received a copy of the agreement
 along with this program; if not, write to Talend SA
 9 rue Pages 92150 Suresnes, France

 ============================================================================*/
/*

describe('', function(){























 describe('search folders', function () {

     beforeEach(inject(function ($q, MessageService, FolderService) {
         var foldersFromSearch = [
             {path: 'folder-1', name: 'folder-1'},
             {path: 'folder-1/sub-1', name: 'sub-1'},
             {path: 'folder-1/sub-2/folder-1-beer', name: 'folder-1-beer'}
         ];

         var childrenFolders = [
             {id: 'folder-1/beer', path: 'folder-1/beer', name: 'folder-1/beer'},
             {id: 'folder-2', path: 'folder-2', name: 'folder-2'},
             {id: 'folder-3', path: 'folder-3', name: 'folder-3'}
         ];

         spyOn(FolderService, 'children').and.returnValue($q.when({data: childrenFolders}));
         spyOn(FolderService, 'search').and.returnValue($q.when({data: foldersFromSearch}));
         spyOn(MessageService, 'success').and.returnValue();
     }));

     it('should rename folder', inject(function ($q, FolderService) {
         //given
         spyOn(FolderService, 'rename').and.returnValue($q.when());
         spyOn(FolderService, 'getContent').and.returnValue($q.when());
         var ctrl = createController();
         var folderToRename = {id: 'toto/1'};

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

         var folder = {id: 'toto'};

         //when
         ctrl.removeFolder(folder);
         scope.$digest();
         //then
         expect(FolderService.remove).toHaveBeenCalledWith(folder.id);
         expect(FolderService.getContent).toHaveBeenCalledWith(theCurrentFolder);
     }));

 });











    it('should call children service and open modal', inject(function (FolderService) {
        // given
        var ctrl = createController();
        stateMock.folder.currentFolder = {id: 'folder-1', path: 'folder-1', name: 'folder-1'};
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
            id: '', path: '', collapsed: false, name: 'Home',
            nodes: [{id: 'folder-1/beer', path: 'folder-1/beer', name: 'folder-1/beer', collapsed: true},
                {id: 'folder-2', path: 'folder-2', name: 'folder-2', collapsed: true},
                {id: 'folder-3', path: 'folder-3', name: 'folder-3', collapsed: true}]
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
            {id: '', path: '', name: 'Home'},
            {path: 'folder-1', name: 'folder-1'},
            {path: 'folder-1/sub-1', name: 'sub-1'},
            {path: 'folder-1/sub-2/folder-1-beer', name: 'folder-1-beer'}
        ];

        var ctrl = createController();
        ctrl.searchFolderQuery = 'H';
        spyOn(ctrl, 'chooseFolder').and.returnValue();
        var rootFolder = {id: '', path: '', name: 'Home'};

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
});

*/