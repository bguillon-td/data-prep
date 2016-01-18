describe('Folder Selection directive', function() {
    'use strict';

    var scope, createElement;

    var folders = [
        {"id":"folder-1","path":"folder-1","name":"folder-1"},
        {"id":"folder-2","path":"folder-2","name":"folder-2"}
    ];

    beforeEach(module('data-prep.folder-selection'));
    beforeEach(module('htmlTemplates'));

    beforeEach(inject(function($rootScope, $compile, FolderService, $q) {
        scope = $rootScope.$new();

        createElement = function (directiveScope) {
            var element = angular.element('<folder-selection visible="displayThat"></folder-selection>');
            $compile(element)(directiveScope);
            scope.$digest();
            return element;
        };

        spyOn(FolderService, 'children').and.returnValue($q.when(folders));

    }));

    /*
    beforeEach(inject(function($controllerProvider) {
        $controllerProvider.register('FolderSelectionCtrl', function($scope) {
            // Controller Mock
        });
    }));*/

    it('should render empty folders', inject(function($q, FolderService) {
        //given
        scope.displayThat = false;
        var element = createElement(scope);

        /*
        var folders = [
            {"id":"folder-1","path":"folder-1","name":"folder-1"},
            {"id":"folder-2","path":"folder-2","name":"folder-2"}
        ];

        var folderSelectionCtrl = element.controller('folderSelectionCtrl');
        spyOn(folderSelectionCtrl, 'callChildren').and.returnValue($q.when(folders));
        */

        //when
        scope.displayThat = true;
        scope.$digest();

        //then
        console.log('.folder-nodes:'+element.find('.folder-nodes').html());
    }));

});