/*  ============================================================================

  Copyright (C) 2006-2016 Talend Inc. - www.talend.com

  This source code is available under agreement available at
  https://github.com/Talend/data-prep/blob/master/LICENSE

  You should have received a copy of the agreement
  along with this program; if not, write to Talend SA
  9 rue Pages 92150 Suresnes, France

  ============================================================================*/

/**
 * @ngdoc directive
 * @name talend.widget.directive:TalendAccordionsItem
 * @description Accordions item directive. This MUST be used with accordions directive.
 * @restrict E
 * @usage
 <talend-accordions>
     <talend-accordions-item on-open='fn' default='true'>
         <div class="trigger"></div>
         <div class="content"></div>
     </talend-accordions-item>
     <talend-accordions-item>
         <div class="trigger"></div>
         <div class="content"></div>
     </talend-accordions-item>
     <talend-accordions-item>
         <div class="trigger"></div>
         <div class="content"></div>
     </talend-accordions-item>
 </talend-accordions>
 * @param {div} trigger The trigger element that will be injected in the trigger transclusion point
 * @param {div} content The content element that is shown/hidden
 * @param {function} on-open The function to execute on accordion item open
 * @param {boolean} default The default accordion to open
 */
export default function talendAccordionsItem($timeout) {
    'ngInject';

    return {
        restrict: 'E',
        transclude: true,
        templateUrl: 'app/components/widgets/accordions/accordions-item.html',
        require: '^^talendAccordions',
        scope: {
            'default': '=',
            'onOpen': '&'
        },
        bindToController: true,
        controller: () => {},
        controllerAs: 'accordionsItemCtrl',
        link: function (scope, iElement, iAttrs, accordionsCtrl) {
            var ctrl = scope.accordionsItemCtrl;
            var contentElement, accordionItem;
            var triggerContainer = iElement.find('>.accordion >.trigger-container');
            var contentContainer = iElement.find('>.accordion >.content-container');

            //------------------------------------------------------------------------------------------------
            //---------------------------------------------INIT-----------------------------------------------
            //------------------------------------------------------------------------------------------------
            /**
             * @ngdoc method
             * @name getContentElement
             * @methodOf talend.widget.directive:TalendAccordionsItem
             * @description [PRIVATE] Get content element. If it is defined, we save it to serve it directly next time
             */
            var getContentElement = function getContentElement() {
                if (contentElement) {
                    return contentElement;
                }
                var fetchContent = contentContainer.find('>.content').eq(0);
                if (fetchContent.length) {
                    contentElement = fetchContent;
                }
                return fetchContent;
            };

            /**
             * @ngdoc method
             * @name registerToParent
             * @methodOf talend.widget.directive:TalendAccordionsItem
             * @description [PRIVATE] Register itself to parent
             */
            var registerToParent = function registerToParent() {
                accordionsCtrl.register(accordionItem);
                if (ctrl.default) {
                    accordionsCtrl.toggle(accordionItem);
                }
            };

            /**
             * @ngdoc method
             * @name attachTriggerElement
             * @methodOf talend.widget.directive:TalendAccordionsItem
             * @description [PRIVATE] Place trigger element in the trigger zone
             */
            var attachTriggerElement = function attachTriggerElement() {
                var elementToAttach = contentContainer.find('>.trigger').eq(0);
                triggerContainer.append(elementToAttach);
            };

            /**
             * @ngdoc method
             * @name attachUnregisterOnDestroy
             * @methodOf talend.widget.directive:TalendAccordionsItem
             * @description [PRIVATE] Unregister itself on element destroy
             */
            var attachUnregisterOnDestroy = function attachUnregisterOnDestroy() {
                scope.$on('$destroy', function () {
                    accordionsCtrl.unregister(accordionItem);
                });
            };

            /**
             * @ngdoc method
             * @name open
             * @methodOf talend.widget.directive:TalendAccordionsItem
             * @description [PRIVATE] Open the accordion DOM element, trigger on open callback and update active flag
             */
            var open = function open() {
                this.active = true;
                getContentElement().slideDown('fast');
                iElement.addClass('open');
                ctrl.onOpen();
            };

            /**
             * @ngdoc method
             * @name close
             * @methodOf talend.widget.directive:TalendAccordionsItem
             * @description [PRIVATE] Close the accordion DOM element and update active flag
             */
            var close = function close() {
                this.active = false;
                getContentElement().slideUp('fast');
                iElement.removeClass('open');
            };

            /**
             * @ngdoc method
             * @name initAccordionItem
             * @methodOf talend.widget.directive:TalendAccordionsItem
             * @description [PRIVATE] Init the accordion item to expose to the accordion parent.
             * It contains active flag, open and close functions.
             */
            var initAccordionItem = function initAccordionItem() {
                accordionItem = {
                    active: false,
                    open: open,
                    close: close
                };
            };

            initAccordionItem();
            $timeout(registerToParent, 0, false);
            $timeout(attachTriggerElement, 0, false);
            attachUnregisterOnDestroy();

            //------------------------------------------------------------------------------------------------
            //--------------------------------------CONTROLLER INIT-------------------------------------------
            //------------------------------------------------------------------------------------------------
            //toggle item with impact ON WHOLE ACCORDION
            ctrl.toggle = function toggle() {
                accordionsCtrl.toggle(accordionItem);
            };
        }
    };
}