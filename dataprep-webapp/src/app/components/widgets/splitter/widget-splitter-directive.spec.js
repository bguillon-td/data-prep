describe('Talend splitter', () => {
    'use strict';

    var scope, element, createElement;

    beforeEach(angular.mock.module('talend.widget'));

    afterEach(() => {
        scope.$destroy();
        element.remove();
    });

    beforeEach(inject(function ($rootScope, $compile) {
        scope = $rootScope.$new();

        createElement = function () {
            var template =
                `<talend-splitter orientation="{{orientation}}" min-size="{{minSize}}">
                    <split-first-pane>
                        My first pane
                    </split-first-pane>
                    <split-second-pane>
                        My second pane
                    </split-second-pane>
                </talend-splitter>`;
            element = $compile(template)(scope);
            scope.$digest();
        };
    }));

    it('should render and transclude panes', () => {
        //given
        scope.orientation = 'vertical';

        //when
        createElement();

        //then
        expect(element.find('.split-first-pane').text().trim()).toBe('My first pane');
        expect(element.find('.split-second-pane').text().trim()).toBe('My second pane');
    });

    it('should render split handler', () => {
        //given
        scope.orientation = 'vertical';

        //when
        createElement();

        //then
        expect(element.find('.split-handler').length).toBe(1);
        expect(element.find('.split-handler').find('.split-handler-square').length).toBe(7);
    });

    describe('event listeners', () => {
        describe('drag flag', () => {
            it('should set drag flag to true on split handler mousedown', () => {
                //given
                scope.orientation = 'vertical';
                createElement();

                var event = angular.element.Event('mousedown');
                const ctrl = element.controller('talendSplitter');
                expect(ctrl.drag).toBe(false);

                //when
                element.find('.split-handler').eq(0).trigger(event);

                //then
                expect(ctrl.drag).toBe(true);
            });

            it('should set drag flag to true on window mouseup', inject(($window) => {
                //given
                scope.orientation = 'vertical';
                createElement();

                var event = angular.element.Event('mouseup');
                const ctrl = element.controller('talendSplitter');
                ctrl.drag = true;

                //when
                angular.element($window).trigger(event);

                //then
                expect(ctrl.drag).toBe(false);
            }));
        });

        describe('vertical', () => {
            let ctrl;

            beforeEach(() => {
                scope.orientation = 'vertical';
                scope.minSize = 300;
                createElement();

                ctrl = element.controller('talendSplitter');
            });

            it('should not change css properties when drag flag is false', () => {
                //given
                var event = angular.element.Event('mousemove');
                event.clientY = 500;

                ctrl.drag = false;

                expect(element.find('.split-first-pane').eq(0).css('bottom')).toBe('');
                expect(element.find('.split-handler').eq(0).css('top')).toBe('');
                expect(element.find('.split-second-pane').eq(0).css('top')).toBe('');

                //when
                element.trigger(event);

                //then
                expect(element.find('.split-first-pane').eq(0).css('bottom')).toBe('');
                expect(element.find('.split-handler').eq(0).css('top')).toBe('');
                expect(element.find('.split-second-pane').eq(0).css('top')).toBe('');
            });

            it('should not change css properties when move event is lower than first pane min size', () => {
                //given
                var event = angular.element.Event('mousemove');
                event.clientY = 100; // < minSize = 300

                ctrl.drag = true;

                expect(element.find('.split-first-pane').eq(0).css('bottom')).toBe('');
                expect(element.find('.split-handler').eq(0).css('top')).toBe('');
                expect(element.find('.split-second-pane').eq(0).css('top')).toBe('');

                //when
                element.trigger(event);

                //then
                expect(element.find('.split-first-pane').eq(0).css('bottom')).toBe('');
                expect(element.find('.split-handler').eq(0).css('top')).toBe('');
                expect(element.find('.split-second-pane').eq(0).css('top')).toBe('');
            });

            it('should not change css properties when move event is geater than second pane min size', () => {
                //given
                var event = angular.element.Event('mousemove');
                event.clientY = 900; // > total - minSize = 1000 - 300 = 700

                ctrl.drag = true;

                spyOn(element.find('> .talend-splitter').eq(0)[0], 'getBoundingClientRect').and.returnValue({
                    top: 0,
                    height: 1000
                });

                expect(element.find('.split-first-pane').eq(0).css('bottom')).toBe('');
                expect(element.find('.split-handler').eq(0).css('top')).toBe('');
                expect(element.find('.split-second-pane').eq(0).css('top')).toBe('');

                //when
                element.trigger(event);

                //then
                expect(element.find('.split-first-pane').eq(0).css('bottom')).toBe('');
                expect(element.find('.split-handler').eq(0).css('top')).toBe('');
                expect(element.find('.split-second-pane').eq(0).css('top')).toBe('');
            });

            it('should change css properties on move event', () => {
                //given
                var event = angular.element.Event('mousemove');
                event.clientY = 600;

                ctrl.drag = true;

                spyOn(element.find('> .talend-splitter').eq(0)[0], 'getBoundingClientRect').and.returnValue({
                    top: 0,
                    height: 1000
                });

                expect(element.find('.split-first-pane').eq(0).css('bottom')).toBe('');
                expect(element.find('.split-handler').eq(0).css('top')).toBe('');
                expect(element.find('.split-second-pane').eq(0).css('top')).toBe('');

                //when
                element.trigger(event);

                //then
                expect(element.find('.split-first-pane').eq(0).css('bottom')).toBe('400px');
                expect(element.find('.split-handler').eq(0).css('top')).toBe('600px');
                expect(element.find('.split-second-pane').eq(0).css('top')).toBe('600px');
            });
        });

        describe('horizontal', () => {
            let ctrl;

            beforeEach(() => {
                scope.orientation = 'horizontal';
                scope.minSize = 300;
                createElement();

                ctrl = element.controller('talendSplitter');
            });

            it('should not change css properties when drag flag is false', () => {
                //given
                var event = angular.element.Event('mousemove');
                event.clientX = 500;

                ctrl.drag = false;

                expect(element.find('.split-first-pane').eq(0).css('right')).toBe('');
                expect(element.find('.split-handler').eq(0).css('left')).toBe('');
                expect(element.find('.split-second-pane').eq(0).css('left')).toBe('');

                //when
                element.trigger(event);

                //then
                expect(element.find('.split-first-pane').eq(0).css('right')).toBe('');
                expect(element.find('.split-handler').eq(0).css('left')).toBe('');
                expect(element.find('.split-second-pane').eq(0).css('left')).toBe('');
            });

            it('should not change css properties when move event is lower than first pane min size', () => {
                //given
                var event = angular.element.Event('mousemove');
                event.clientX = 100; // < minSize = 300

                ctrl.drag = true;

                expect(element.find('.split-first-pane').eq(0).css('right')).toBe('');
                expect(element.find('.split-handler').eq(0).css('left')).toBe('');
                expect(element.find('.split-second-pane').eq(0).css('left')).toBe('');

                //when
                element.trigger(event);

                //then
                expect(element.find('.split-first-pane').eq(0).css('right')).toBe('');
                expect(element.find('.split-handler').eq(0).css('left')).toBe('');
                expect(element.find('.split-second-pane').eq(0).css('left')).toBe('');
            });

            it('should not change css properties when move event is geater than second pane min size', () => {
                //given
                var event = angular.element.Event('mousemove');
                event.clientX = 900; // > total - minSize = 1000 - 300 = 700

                ctrl.drag = true;

                spyOn(element.find('> .talend-splitter').eq(0)[0], 'getBoundingClientRect').and.returnValue({
                    left: 0,
                    width: 1000
                });

                expect(element.find('.split-first-pane').eq(0).css('right')).toBe('');
                expect(element.find('.split-handler').eq(0).css('left')).toBe('');
                expect(element.find('.split-second-pane').eq(0).css('left')).toBe('');

                //when
                element.trigger(event);

                //then
                expect(element.find('.split-first-pane').eq(0).css('right')).toBe('');
                expect(element.find('.split-handler').eq(0).css('left')).toBe('');
                expect(element.find('.split-second-pane').eq(0).css('left')).toBe('');
            });

            it('should change css properties on move event', () => {
                //given
                var event = angular.element.Event('mousemove');
                event.clientX = 600;

                ctrl.drag = true;

                spyOn(element.find('> .talend-splitter').eq(0)[0], 'getBoundingClientRect').and.returnValue({
                    left: 0,
                    width: 1000
                });

                expect(element.find('.split-first-pane').eq(0).css('right')).toBe('');
                expect(element.find('.split-handler').eq(0).css('left')).toBe('');
                expect(element.find('.split-second-pane').eq(0).css('left')).toBe('');

                //when
                element.trigger(event);

                //then
                expect(element.find('.split-first-pane').eq(0).css('right')).toBe('400px');
                expect(element.find('.split-handler').eq(0).css('left')).toBe('600px');
                expect(element.find('.split-second-pane').eq(0).css('left')).toBe('600px');
            });
        });
    });
});