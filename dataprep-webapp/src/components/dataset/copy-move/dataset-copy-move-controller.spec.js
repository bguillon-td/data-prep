describe('Dataset Copy Move controller', function () {
  'use strict';

  var createController, scope, stateMock;
  var datasets = [
    {id: 'ec4834d9bc2af8', name: 'Customers (50 lines)'},
    {id: 'ab45f893d8e923', name: 'Us states'},
    {id: 'cf98d83dcb9437', name: 'Customers (1K lines)'}
  ];
  var theCurrentFolder = {id: 'folder-16/folder-1/sub-1', path: 'folder-16/folder-1/sub-1', name: 'sub-1'};

  beforeEach(module('pascalprecht.translate', function ($translateProvider) {
    $translateProvider.translations('en', {
      'HOME_FOLDER': 'Home'
    });
    $translateProvider.preferredLanguage('en');
  }));

  beforeEach(module('data-prep.dataset-copy-move', function ($provide) {

    stateMock = {
      folder: {
        datasetToCopyClone: datasets[0],
        currentFolder: theCurrentFolder,
        choosedFolder: theCurrentFolder
      }
    };
    $provide.constant('state', stateMock);
  }));

  beforeEach(inject(function ($rootScope, $controller, $q, FolderService) {

    scope = $rootScope.$new();

    createController = function () {
      var ctrl = $controller('DatasetCopyMoveCtrl', {
        $scope: scope
      });
      ctrl.state = true;
      ctrl.cloneNameForm = {};
      ctrl.cloneNameForm.$commitViewValue = function () {};
      return ctrl;
    };

    spyOn(FolderService, 'getContent').and.returnValue($q.when(true));

  }));

  afterEach(inject(function ($stateParams) {
    $stateParams.datasetid = null;
  }));


  describe('clone', function () {

    beforeEach(inject(function ($q, MessageService) {
      spyOn(MessageService, 'success').and.returnValue();
    }));

    describe('when success', function () {
      beforeEach(inject(function ($q, DatasetService) {
        spyOn(DatasetService, 'clone').and.returnValue($q.when(true));
      }));

      it('should call clone service', inject(function ($q, DatasetService, FolderService) {
        //given
        var cloneName = 'bar';
        var ctrl = createController();
        ctrl.cloneName = cloneName;

        //when
        ctrl.clone();
        expect(ctrl.isCloningDs).toBeTruthy();
        scope.$digest();

        //then
        expect(DatasetService.clone).toHaveBeenCalledWith(datasets[0], theCurrentFolder, cloneName);
        expect(FolderService.getContent).toHaveBeenCalled();
        expect(ctrl.isCloningDs).toBeFalsy();
        expect(ctrl.state).toBeFalsy();
      }));

      it('should display message on success', inject(function ($q, MessageService, DatasetService, FolderService) {
        //given
        var ctrl = createController();
        var cloneName = 'bar';
        ctrl.cloneName = cloneName;

        //when
        ctrl.clone();
        scope.$digest();

        //then
        expect(DatasetService.clone).toHaveBeenCalledWith(datasets[0], theCurrentFolder, cloneName);
        expect(MessageService.success).toHaveBeenCalledWith('COPY_SUCCESS_TITLE', 'COPY_SUCCESS');
        expect(FolderService.getContent).toHaveBeenCalled();
        expect(ctrl.state).toBeFalsy();
      }));
    });

    describe('when failure due to server error', function () {
      beforeEach(inject(function ($q, MessageService, DatasetService) {
        spyOn(DatasetService, 'clone').and.returnValue($q.reject());
      }));

      it('should faill on clone service call', inject(function ($q, DatasetService) {
        //given
        var cloneName = 'bar';
        var ctrl = createController();
        ctrl.datasetToClone = datasets[0];
        ctrl.cloneName = cloneName;

        //when
        ctrl.clone();
        expect(ctrl.isCloningDs).toBeTruthy();
        scope.$digest();

        //then
        expect(DatasetService.clone).toHaveBeenCalledWith(datasets[0], theCurrentFolder, cloneName);
        expect(ctrl.isCloningDs).toBeFalsy();
        expect(ctrl.state).toBeFalsy();
      }));
    });

  });

  describe('move', function () {

    beforeEach(inject(function ($q, MessageService) {
      spyOn(MessageService, 'success').and.returnValue();
    }));

    describe('when success', function () {
      beforeEach(inject(function ($q, MessageService, FolderService, DatasetService) {
        spyOn(DatasetService, 'move').and.returnValue($q.when(true));
      }));

      it('should call move service', inject(function ($q, DatasetService, FolderService) {
        //given
        var cloneName = 'bar';
        var ctrl = createController();
        ctrl.cloneName = cloneName;

        var folder = {id: 'foo'};
        stateMock.folder.choosedFolder = folder;

        //when
        ctrl.move();
        expect(ctrl.isMovingDs).toBeTruthy();
        scope.$digest();

        //then
        expect(DatasetService.move).toHaveBeenCalledWith(datasets[0], theCurrentFolder, folder, cloneName);
        expect(FolderService.getContent).toHaveBeenCalled();
        expect(ctrl.isMovingDs).toBeFalsy();
        expect(ctrl.state).toBeFalsy();
      }));

      it('should display message on success', inject(function ($q, MessageService, DatasetService, FolderService) {
        //given
        var ctrl = createController();
        var cloneName = 'bar';
        ctrl.cloneName = cloneName;

        var folder = {id: 'foo'};
        stateMock.folder.choosedFolder = folder;

        //when
        ctrl.move();
        scope.$digest();

        //then
        expect(DatasetService.move).toHaveBeenCalledWith(datasets[0], theCurrentFolder, folder, cloneName);
        expect(MessageService.success).toHaveBeenCalledWith('MOVE_SUCCESS_TITLE', 'MOVE_SUCCESS');
        expect(FolderService.getContent).toHaveBeenCalled();
        expect(ctrl.state).toBeFalsy();
      }));
    });


  });
});
