describe('Folder Selection directive', function() {
    'use strict';

    var scope, createElement;

    var folders = [
        {'id':'folder-1','path':'folder-1','name':'The Folder 1'},
        {'id':'folder-2','path':'folder-2','name':'The Folder 2'}
    ];

    var foldersData = {data : folders};

    beforeEach(module('data-prep.folder-selection'));
    beforeEach(module('htmlTemplates'));

    beforeEach(module('pascalprecht.translate', function ($translateProvider) {
        $translateProvider.translations('en', {
            'HOME_FOLDER': 'The home'
        });
        $translateProvider.preferredLanguage('en');
    }));

    beforeEach(inject(function($rootScope, $compile) {
        scope = $rootScope.$new();

        createElement = function (directiveScope) {
            var element = angular.element('<folder-selection visible="displayThat"></folder-selection>');
            $compile(element)(directiveScope);
            scope.$digest();
            return element;
        };

    }));

    it('should render empty folders', inject(function($q, FolderService) {
        //given
        scope.displayThat = false;
        var element = createElement(scope);
        spyOn(FolderService, 'children').and.returnValue($q.when({}));

        //when
        scope.displayThat = true;
        scope.$digest();

        //then
        var text = element.find('.folder-nodes li div .folder-name').eq(0).text().trim();
        expect(text).toBe('The home');
        // no children
        expect(element.find('.folder-nodes li ol').children().length).toBe(0);

    }));


    it('should render two folders', inject(function($q, FolderService) {
        //given
        scope.displayThat = false;
        var element = createElement(scope);
        spyOn(FolderService, 'children').and.returnValue($q.when(foldersData));

        //when
        scope.displayThat = true;
        scope.$digest();

        //then
        var text = element.find('.folder-nodes li div .folder-name').eq(0).text().trim();
        expect(text).toBe('The home');
        // we expect 2 children
        var rootElement = element.find('.folder-nodes li ol');
        expect(rootElement.children().length).toBe(2);
        // test displayed folder names
        expect(rootElement.children().eq(0).find('div .folder-name').eq(0).text().trim()).toBe('The Folder 1');
        expect(rootElement.children().eq(1).find('div .folder-name').eq(0).text().trim()).toBe('The Folder 2');

    }));

});