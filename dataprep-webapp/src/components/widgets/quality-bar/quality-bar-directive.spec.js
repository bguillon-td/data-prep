describe('Quality bar directive', function() {
    'use strict';

    var scope, element, createElement, controller;

    beforeEach(module('talend.widget'));
    beforeEach(module('htmlTemplates'));

    beforeEach(inject(function ($rootScope) {
        scope = $rootScope.$new();
    }));

    beforeEach(inject(function($compile) {
        createElement = function () {
            var html = '<quality-bar quality="quality" has-menu="hasMenu" enter-animation="enterAnimation"></quality-bar>';
            element = $compile(html)(scope);
            scope.$digest();

            controller = element.controller('qualityBar');
        };
    }));

    afterEach(function () {
        scope.$destroy();
        element.remove();
    });

    describe('with enter animation', function() {
        it('step 1: should block transition', inject(function($rootScope) {
            //given
            scope.quality = {
                valid: 10,
                invalid: 20,
                empty: 70
            };
            scope.enterAnimation = true;
            createElement();

            //when
            $rootScope.$digest();

            //then
            expect(controller.blockTransition).toBe(true);
        }));

        it('step 1: should reset the width object', inject(function($rootScope) {
            //given
            scope.quality = {
                valid: 10,
                invalid: 20,
                empty: 70
            };
            scope.enterAnimation = true;
            createElement();

            //when
            $rootScope.$digest();

            //then
            expect(controller.width).toEqual({
                invalid: 0,
                empty: 0,
                valid: 0
            });
        }));

        it('step 2: should re enable animation after a short timeout', inject(function($rootScope, $timeout) {
            //given
            scope.quality = {
                valid: 10,
                invalid: 20,
                empty: 70
            };
            scope.enterAnimation = true;
            createElement();

            //when
            $rootScope.$digest();
            $timeout.flush(1);

            //then
            expect(controller.blockTransition).toBe(false);
        }));

        it('step 3: compute percentage and width after a 300ms timeout', inject(function($rootScope, $timeout) {
            //given
            scope.quality = {
                valid: 10,
                invalid: 20,
                empty: 70
            };
            scope.enterAnimation = true;
            createElement();

            //when
            $rootScope.$digest();
            $timeout.flush(300);

            //then
            expect(controller.percent).toEqual({invalid: 20, empty: 70, valid: 10});
            expect(controller.width).toEqual({invalid: 20, empty: 70, valid: 10});
        }));
    });

    describe('without enter animation', function() {
        beforeEach(inject(function($compile) {
            createElement = function () {
                var html = '<quality-bar quality="quality" has-menu="hasMenu" enter-animation="false"></quality-bar>';
                element = $compile(html)(scope);
                scope.$digest();

                controller = element.controller('qualityBar');
            };
        }));

        it('step 3: compute percentage and width with no animation', inject(function($rootScope) {
            //given
            scope.quality = {
                valid: 10,
                invalid: 20,
                empty: 70
            };
            createElement();

            //when
            $rootScope.$digest();

            //then
            expect(controller.percent).toEqual({invalid: 20, empty: 70, valid: 10});
            expect(controller.width).toEqual({invalid: 20, empty: 70, valid: 10});
        }));
    });

    describe('without menu', function(){
        beforeEach(inject(function($compile) {
            createElement = function () {
                var html = '<quality-bar quality="quality" has-menu="hasMenu" enter-animation="false"></quality-bar>';
                element = $compile(html)(scope);
                scope.$digest();

                controller = element.controller('qualityBar');
            };
        }));

        it('should render only the 3 partitions', inject(function($timeout, $rootScope) {
            //given
            scope.quality = {
                valid: 10,
                invalid: 20,
                empty: 70
            };
            scope.hasMenu = false;
            createElement();

            //when
            $rootScope.$digest();
            $timeout.flush(300);

            //then
            expect(element.find('.valid-partition').eq(0)[0].hasAttribute('talend-dropdown')).toBe(false);
        }));
    });
    describe('with menu', function(){
        beforeEach(inject(function($compile) {
            createElement = function () {
                var html = '<quality-bar quality="quality" has-menu="hasMenu" enter-animation="false">' +
                    '<div class="valid-menu-item"><li class="column-action">IDCol</li></div>' +
                    '</quality-bar>';
                element = $compile(html)(scope);
                scope.$digest();

                controller = element.controller('qualityBar');
            };
        }));

        it('should render menu and its content', inject(function($timeout, $rootScope) {
            //given
            scope.quality = {
                valid: 10,
                invalid: 20,
                empty: 70
            };
            scope.hasMenu = true;
            createElement();

            //when
            $rootScope.$digest();
            $timeout.flush(300);

            //then
            expect(element.find('.valid-partition').eq(0)[0].hasAttribute('talend-dropdown')).toBe(true);
            expect(element.find('.column-action').text()).toBe('IDCol');
        }));
    });
});