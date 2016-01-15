describe('Folder Selection directive', function() {
    'use strict';

    var scope, createElement;

    beforeEach(module('data-prep.folder-selection'));
    beforeEach(module('htmlTemplates'));

    beforeEach(inject(function($rootScope, $compile) {
        scope = $rootScope.$new();

        createElement = function (directiveScope) {
            var element = angular.element('<folder-selection visible="displayThat"></folder-selection>');
            $compile(element)(directiveScope);
            scope.$digest();
            return element;
        };
    }));

    it('should render empty folders', function() {
        //when
        scope.displayThat = false;
        var element = createElement(scope);
        scope.displayThat = true;

        //then
        console.log('folder:'+element.text());
        console.log('.folder-nodes:'+element.find('.folder-nodes').text());
    });

});