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
 * @name data-prep.transformation-form.directive:TransformColumnParam
 * @description This directive display a select parameter form to select a column
 * @restrict E
 * @usage <transform-column-param parameter="parameter"></transform-column-param>
 * @param {object} parameter The column parameter
 */
export default function TransformColumnParam() {
    return {
        restrict: 'E',
        templateUrl: 'app/components/transformation/form/column/transformation-column-param.html',
        scope: {
            parameter: '='
        },
        bindToController: true,
        controllerAs: 'columnParamCtrl',
        controller: 'TransformColumnParamCtrl'
    };
}