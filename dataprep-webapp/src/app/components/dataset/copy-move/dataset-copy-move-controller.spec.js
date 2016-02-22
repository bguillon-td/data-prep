/*  ============================================================================

 Copyright (C) 2006-2016 Talend Inc. - www.talend.com

 This source code is available under agreement available at
 https://github.com/Talend/data-prep/blob/master/LICENSE

 You should have received a copy of the agreement
 along with this program; if not, write to Talend SA
 9 rue Pages 92150 Suresnes, France

 ============================================================================*/

describe('DatasetCopyMove controller', function () {
    var  createController, scope, ctrl;

    beforeEach(angular.mock.module('data-prep.dataset-copy-move'));

    beforeEach(inject(function ($rootScope, $controller) {
        scope = $rootScope.$new();

        createController = function () {
            return $controller('DatasetCopyMoveCtrl', {
                $scope: scope
            });
        };
    }));

    describe('clone', function () {
        beforeEach(inject(function () {
            ctrl = createController();
            ctrl.showSuccessMessage = jasmine.createSpy('showSuccessMessage');
            ctrl.getFolderContent = jasmine.createSpy('getFolderContent');
            ctrl.datasetToCopyMove = {name: 'my ds name'};
            ctrl.chosenFolder = {name: 'my folder name', path:'/parent/child'};
            ctrl.cloneNameForm = {};
            ctrl.cloneNameForm.$commitViewValue = jasmine.createSpy('$commitViewValue');
        }));

        describe('when success', function () {

            beforeEach(inject(function ($q) {
                ctrl.onCopySubmit = jasmine.createSpy('onCopySubmit').and.returnValue($q.when(true));
            }));

            it('should call clone service', inject(function () {
                //when
                ctrl.clone();
                expect(ctrl.isCloningDs).toBeTruthy();
                expect(ctrl.cloneNameForm.$commitViewValue).toHaveBeenCalled();

                //then
                expect(ctrl.onCopySubmit).toHaveBeenCalledWith({
                    ds: ctrl.datasetToCopyMove,
                    destFolder: ctrl.chosenFolder,
                    name: ctrl.datasetToCopyMove.name
                });
            }));

            it('should display message on success', inject(function () {
                //given
                ctrl.currentFolder = {name: 'my folder name', path:'/parent/child'};

                //when
                ctrl.clone();
                scope.$digest();

                //then
                expect(ctrl.showSuccessMessage).toHaveBeenCalledWith({
                    successMsgTitle: 'COPY_SUCCESS_TITLE',
                    successMsgContent: 'COPY_SUCCESS'
                });
                expect(ctrl.getFolderContent).toHaveBeenCalledWith({folder: ctrl.currentFolder});
                expect(ctrl.isCloningDs).toBeFalsy();
            }));
        });

        describe('when failure due to server error', function () {
            beforeEach(inject(function ($q) {
                ctrl.onCopySubmit = jasmine.createSpy('onCopySubmit').and.returnValue($q.reject());
                ctrl.focusOnNameInput = jasmine.createSpy('focusOnNameInput');
            }));

            it('should fail on clone service call', inject(function ($timeout) {
                //when
                ctrl.clone();
                expect(ctrl.isCloningDs).toBeTruthy();
                scope.$digest();
                $timeout.flush(1100);

                //then
                expect(ctrl.showSuccessMessage).not.toHaveBeenCalled();
                expect(ctrl.getFolderContent).not.toHaveBeenCalled();
                expect(ctrl.isCloningDs).toBeFalsy();
                expect(ctrl.focusOnNameInput).toHaveBeenCalled();
            }));
        });
    });

    describe('move', function () {
        beforeEach(inject(function () {
            ctrl = createController();
            ctrl.showSuccessMessage = jasmine.createSpy('showSuccessMessage');
            ctrl.getFolderContent = jasmine.createSpy('getFolderContent');
            ctrl.datasetToCopyMove = {name: 'my ds name'};
            ctrl.chosenFolder = {name: 'my folder name', path:'/parent/child'};
            ctrl.cloneNameForm = {};
            ctrl.cloneNameForm.$commitViewValue = jasmine.createSpy('$commitViewValue');
            ctrl.currentFolder = {name: 'my folder name', path:'/parent/child'};
        }));

        describe('when success', function () {

            beforeEach(inject(function ($q) {
                ctrl.onMoveSubmit = jasmine.createSpy('onMoveSubmit').and.returnValue($q.when(true));
            }));

            it('should call move service', inject(function () {
                //when
                ctrl.move();
                expect(ctrl.isMovingDs).toBeTruthy();
                expect(ctrl.cloneNameForm.$commitViewValue).toHaveBeenCalled();

                //then
                expect(ctrl.onMoveSubmit).toHaveBeenCalledWith({
                    ds: ctrl.datasetToCopyMove,
                    fromFolder: ctrl.currentFolder,
                    destFolder: ctrl.chosenFolder,
                    name: ctrl.datasetToCopyMove.name
                });
            }));

            it('should display message on success', inject(function () {
                //given
                ctrl.currentFolder = {name: 'my folder name', path:'/parent/child'};

                //when
                ctrl.move();
                scope.$digest();

                //then
                expect(ctrl.showSuccessMessage).toHaveBeenCalledWith({
                    successMsgTitle: 'MOVE_SUCCESS_TITLE',
                    successMsgContent: 'MOVE_SUCCESS'
                });
                expect(ctrl.getFolderContent).toHaveBeenCalledWith({folder: ctrl.currentFolder});
                expect(ctrl.isMovingDs).toBeFalsy();
            }));
        });

        describe('when failure due to server error', function () {
            beforeEach(inject(function ($q) {
                ctrl.onMoveSubmit = jasmine.createSpy('onCopySubmit').and.returnValue($q.reject());
                ctrl.focusOnNameInput = jasmine.createSpy('focusOnNameInput');
            }));

            it('should fail on move service call', inject(function ($timeout) {
                //when
                ctrl.move();
                expect(ctrl.isMovingDs).toBeTruthy();
                scope.$digest();
                $timeout.flush(1100);

                //then
                expect(ctrl.showSuccessMessage).not.toHaveBeenCalled();
                expect(ctrl.getFolderContent).not.toHaveBeenCalled();
                expect(ctrl.isMovingDs).toBeFalsy();
                expect(ctrl.focusOnNameInput).toHaveBeenCalled();
            }));
        });
    });
});
