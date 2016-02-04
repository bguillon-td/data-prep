import TransformChoiceParamCtrl from './choice/transformation-choice-param-controller';
import TransformChoiceParam from './choice/transformation-choice-param-directive';
import TransformClusterParamsCtrl from './cluster/transformation-cluster-params-controller';
import TransformClusterParams from './cluster/transformation-cluster-params-directive';
import TransformColumnParamCtrl from './column/transformation-column-param-controller';
import TransformColumnParam from './column/transformation-column-param-directive';
import TransformDateParamCtrl from './date/transformation-date-param-controller';
import TransformDateParam from './date/transformation-date-param-directive';
import TransformRegexParamCtrl from './regex/transformation-regex-param-controller';
import TransformRegexParam from './regex/transformation-regex-param-directive';
import TransformSimpleParamCtrl from './simple/transformation-simple-param-controller';
import TransformSimpleParam from './simple/transformation-simple-param-directive';
import TransformParamsCtrl from './params/transformation-params-controller';
import TransformParams from './params/transformation-params-directive';
import TransformForm from './transformation-form-directive';
import TransformFormCtrl from './transformation-form-controller';

(() => {
    'use strict';

    /**
     * @ngdoc object
     * @name data-prep.transformation-form
     * @description This module contains the controller and directives to manage transformation parameters
     * @requires data-prep.services.state
     * @requires data-prep.services.utils.service
     * @requires data-prep.validation
     */
    angular.module('data-prep.transformation-form',
        [
            'data-prep.services.state',
            'data-prep.services.utils',
            'data-prep.validation',
            'talend.widget'
        ])

        .controller('TransformChoiceParamCtrl', TransformChoiceParamCtrl)
        .directive('transformChoiceParam', TransformChoiceParam)

        .controller('TransformClusterParamsCtrl', TransformClusterParamsCtrl)
        .directive('transformClusterParams', TransformClusterParams)

        .controller('TransformColumnParamCtrl', TransformColumnParamCtrl)
        .directive('transformColumnParam', TransformColumnParam)

        .controller('TransformDateParamCtrl', TransformDateParamCtrl)
        .directive('transformDateParam', TransformDateParam)

        .controller('TransformRegexParamCtrl', TransformRegexParamCtrl)
        .directive('transformRegexParam', TransformRegexParam)

        .controller('TransformSimpleParamCtrl', TransformSimpleParamCtrl)
        .directive('transformSimpleParam', TransformSimpleParam)

        .controller('TransformParamsCtrl', TransformParamsCtrl)
        .directive('transformParams', TransformParams)

        .controller('TransformFormCtrl', TransformFormCtrl)
        .directive('transformForm', TransformForm);
})();