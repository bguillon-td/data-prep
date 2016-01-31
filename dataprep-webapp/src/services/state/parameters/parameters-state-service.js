(function () {
    'use strict';

    var parametersState = {
        visible: false,
        isSending: false,
        configuration: {
            encodings: [],
            separators: [
                {label: ';', value: ';'},
                {label: ',', value: ','},
                {label: '<space>', value: ' '},
                {label: '<tab>', value: '\t'}
            ]
        },
        values: {
            separator: null,
            encoding: null
        }
    };

    /**
     * @ngdoc service
     * @name data-prep.services.state.service:ParameterService
     * @description Parameters service.
     */
    function ParametersStateService() {
        return {
            show: show,
            hide: hide,
            setIsSending: setIsSending,
            setEncodings: setEncodings,
            update: update,
            reset: reset
        };

        /**
         * @ngdoc method
         * @name show
         * @methodOf data-prep.services.state.service:ParameterService
         * @description Set the parameters visible
         */
        function show() {
            parametersState.visible = true;
        }

        /**
         * @ngdoc method
         * @name hide
         * @methodOf data-prep.services.state.service:ParameterService
         * @description Set the parameters visible
         */
        function hide() {
            parametersState.visible = false;
        }

        /**
         * @ngdoc method
         * @name setIsSending
         * @methodOf data-prep.services.state.service:ParameterService
         * @param {boolean} sending True if the app is sending new parameters
         * @description Set the parameters sending flag
         */
        function setIsSending(sending) {
            parametersState.isSending = sending;
        }

        /**
         * @ngdoc method
         * @name setSupportedEncodings
         * @methodOf data-prep.services.state.service:ParameterService
         * @param {array} encodings The array of supported encodings
         * @description Set the array of supported encodings
         */
        function setEncodings(encodings) {
            parametersState.configuration.encodings = encodings;
        }

        /**
         * @ngdoc method
         * @name update
         * @methodOf data-prep.services.state.service:ParameterService
         * @param {object} dataset The dataset where to extract parameters
         * @description Set the lookup visible
         */
        function update(dataset) {
            parametersState.values.separator = dataset.parameters.SEPARATOR;
            parametersState.values.encoding = dataset.encoding;
        }

        /**
         * @ngdoc method
         * @name reset
         * @methodOf data-prep.services.state.service:ParameterService
         * @description Reset the parameters internal state
         */
        function reset() {
            parametersState.visible = false;
            parametersState.isSending = false;
            parametersState.values = {
                separator: null,
                encoding: null
            };
        }
    }

    angular.module('data-prep.services.state')
        .service('ParametersStateService', ParametersStateService)
        .constant('parametersState', parametersState);
})();