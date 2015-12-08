(function () {
    'use strict';

    var suggestionsState = {
        isLoading: false,
        line: {
            allTransformations: [],
            filteredTransformations: [],
            allCategories: null
        },
        column: {
            allSuggestions: [],     // all selected column suggestions
            allTransformations: [], // all selected column transformations
            filteredTransformations: [], // categories with their transformations to display, result of filter
            transformationsForEmptyCells: [], // all column transformations applied to empty cells
            transformationsForInvalidCells: []// all column transformations applied to invalid cells
        }
    };

    function SuggestionsStateService() {

        return {
            setLineTransformations: setLineTransformations,
            setColumnTransformations: setColumnTransformations,
            setLoading: setLoading,
            reset: reset
        };

        function setLoading(isLoading) {
            suggestionsState.isLoading = isLoading;
        }

        function setLineTransformations(lineTransformations) {
            suggestionsState.line = lineTransformations;
        }

        function setColumnTransformations(columnTransformations) {
            suggestionsState.column = columnTransformations;
        }

        function reset() {
            suggestionsState.isLoading = false;
            suggestionsState.line = {
                allTransformations: [],
                filteredTransformations: [],
                allCategories: null
            };
            suggestionsState.column.allSuggestions =  [];
            suggestionsState.column.allTransformations =  [];
            suggestionsState.column.filteredTransformations =  [];
        }
    }

    angular.module('data-prep.services.state')
        .service('SuggestionsStateService', SuggestionsStateService)
        .constant('suggestionsState', suggestionsState);
})();