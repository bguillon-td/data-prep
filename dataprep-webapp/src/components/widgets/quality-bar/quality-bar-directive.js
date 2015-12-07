(function() {
    'use strict';

    /**
     * @ngdoc directive
     * @name data-prep.quality-bar.directive:QualityBar
     * @description Quality bar tooltip
     * @restrict E
     * @usage
     <quality-bar
             quality="quality"
             enterAnimation="enableEnterAnimation">
     </talend-tooltip>
     * @param {object} quality {empty: number, invalid: number, valid: number} The quality values
     * @param {string} enterAnimation Do not animate on enter if this flag === 'false'
     */
    function QualityBar($timeout) {
        return {
            restrict: 'E',
            templateUrl: 'components/widgets/quality-bar/quality-bar.html',
            scope: {
                enterAnimation: '@',
                quality: '='
            },
            transclude: true,
            bindToController: true,
            controller: 'QualityBarCtrl',
            controllerAs: 'qualityBarCtrl',
            link: function(scope, iElement, iAttrs, ctrl) {
                var initializing = true;

                /**
                 * @ngdoc method
                 * @name enableTransition
                 * @methodOf talend.widget.directive:QualityBar
                 * @description [PRIVATE] Enable animation
                 */
                var enableTransition = function enableTransition() {
                    ctrl.blockTransition = false;
                };

                /**
                 * @ngdoc method
                 * @name refreshBarsWithAnimation
                 * @methodOf talend.widget.directive:QualityBar
                 * @description [PRIVATE] Block animation, reset width to 0 and calculate the new width with animation enabling
                 */
                var refreshBarsWithAnimation = function refreshBarsWithAnimation() {
                    ctrl.blockTransition = true;
                    ctrl.width = {
                        invalid: 0,
                        empty: 0,
                        valid: 0
                    };

                    $timeout(enableTransition, 0, false);

                    $timeout(function() {
                        ctrl.computePercent();
                        ctrl.computeQualityWidth();
                        scope.$digest();
                    }, 300, false);
                };

                /**
                 * @ngdoc method
                 * @name refreshBars
                 * @methodOf talend.widget.directive:QualityBar
                 * @description [PRIVATE] Refresh the quality bars infos (percent and width)
                 * When enterAnimation === 'false', we do NOT animate on first render
                 */
                var refreshBars = function refreshBars() {
                    //Do NOT animate on first values and enterAnimation is false
                    if(initializing && ctrl.enterAnimation === 'false') {
                        initializing = false;
                        ctrl.computePercent();
                        ctrl.computeQualityWidth();
                    }
                    else {
                        refreshBarsWithAnimation();
                    }
                };

                scope.$watch(ctrl.hashQuality, refreshBars);
            }
        };
    }

    angular.module('talend.widget')
        .directive('qualityBar', QualityBar);
})();