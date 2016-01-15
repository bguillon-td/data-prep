describe('Folder selection controller', function () {
	'use strict';

	var createController, scope, stateMock;

	var theCurrentFolder = {id: 'folder-16/folder-1/sub-1', path: 'folder-16/folder-1/sub-1', name: 'sub-1'};

	beforeEach(module('pascalprecht.translate', function ($translateProvider) {
		$translateProvider.translations('en', {
			'HOME_FOLDER': 'Home'
		});
		$translateProvider.preferredLanguage('en');
	}));

	beforeEach(module('data-prep.folder-selection', function ($provide) {
		stateMock = {
			folder: {
				currentFolder: theCurrentFolder,
				choosedFolder: null
			}
		};
		$provide.constant('state', stateMock);
	}));

	beforeEach(inject(function ($rootScope, $controller, $q, $state, MessageService) {
		scope = $rootScope.$new();

		createController = function () {
			return $controller('FolderSelectionCtrl', {
				$scope: scope
			});
		};
		spyOn(MessageService, 'error').and.returnValue();

	}));


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

		it('choose folder should marker folder as selected', inject(function (StateService) {
			//given
			var folder = {path: '/foo/beer'};
			var ctrl = createController();
			spyOn(StateService, 'setChoosedFolder').and.returnValue();

			//when
			ctrl.chooseFolder(folder);
			scope.$digest();

			//then
			expect(folder.selected).toBe(true);
			expect(StateService.setChoosedFolder).toHaveBeenCalledWith(folder);
		}));

		it('toggle should call children service', inject(function (FolderService) {
			//given
			var folder = {id: 'folder-1', collapsed: true};
			var ctrl = createController();
			spyOn(ctrl, 'chooseFolder').and.returnValue();

			//when
			ctrl.toggle(folder, ['beer'], 'folder-1');
			scope.$digest();

			//then
			expect(FolderService.children).toHaveBeenCalledWith(folder.id);
		}));

		it('toggle should not call children service because already children', inject(function (FolderService) {
			//given
			var folder = {id: '/foo/beer', collapsed: true, nodes: [{id: 'wine'}]};
			var ctrl = createController();

			//when
			ctrl.toggle(folder);
			scope.$digest();

			//then
			expect(FolderService.children).not.toHaveBeenCalled();
		}));

		it('toggle should not call children service because not collapsed', inject(function (FolderService) {
			//given
			var folder = {id: '/foo/beer', collapsed: false};
			var ctrl = createController();

			//when
			ctrl.toggle(folder);
			scope.$digest();

			//then
			expect(FolderService.children).not.toHaveBeenCalled();
		}));

		it('collapseNodes should mark children as collapsed', function () {
			//given
			var folder = {id: '/foo/beer', collapsed: true, nodes: [{id: 'wine'}, {id: 'cheese'}]};
			var ctrl = createController();

			//when
			ctrl.collapseNodes(folder);
			scope.$digest();

			//then
			expect(folder.nodes[0].collapsed).toBe(true);
			expect(folder.nodes[1].collapsed).toBe(true);
			expect(folder.collapsed).toBe(false);
		});

	});

});
