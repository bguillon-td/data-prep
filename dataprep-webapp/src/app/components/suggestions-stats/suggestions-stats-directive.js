export default function SuggestionsStats($timeout) {
    'ngInject';

    return {
        restrict: 'E',
        templateUrl: 'app/components/suggestions-stats/suggestions-stats.html',
        scope: {
            metadata: '='
        },
        bindToController: true,
        controllerAs: 'suggestionsStatsCtrl',
        controller: () => {},
        link: function (scope, iElement) {
            $timeout(function () {
                var handler = iElement.find('.split-handler').eq(0);
                var panel1 = iElement.find('.split-pane1').eq(0);
                var panel2 = iElement.find('.split-pane2').eq(0);

                //Initialization of the right panel
                // 325px : to have at least 5 actions in the top panel
                panel1.css('height', '310px');
                handler.css('top', '310px');
                panel2.css('top', '310px');
            }, 0, false);
        }
    };
}