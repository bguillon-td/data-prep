(function () {
    'use strict';

    /**
     * @ngdoc directive
     * @name talend.widget.directive:TalendButtonLoader
     * @description This directive create a button that switch content to a loading icon
     * @restrict E
     * @usage
     *
     <talend-button-loader
         button-class=""
         disable-condition=""
         loading=""
         loading-class="">
     </talend-button-loader>

     * @param {string} button-class The css class to add to the button
     * @param {boolean} disable-condition The condition to disable the button
     * @param {boolean} loading The loading flag
     * @param {string} loading-class The class to add to the loader
     */
    function TalendButtonLoader() {
        return {
            restrict: 'E',
            templateUrl: 'components/widgets/button-loader/button-loader.html',
            transclude: true,
            scope: {
                buttonClass: '@',
                disableCondition: '=',
                loading: '=',
                loadingClass: '@'
            },
            bindToController: true,
            controller: function () {},
            controllerAs: 'buttonLoaderCtrl'
        };
    }

    angular.module('talend.widget')
        .directive('talendButtonLoader', TalendButtonLoader);
})();