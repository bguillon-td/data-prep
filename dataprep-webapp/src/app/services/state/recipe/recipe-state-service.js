/*  ============================================================================

  Copyright (C) 2006-2016 Talend Inc. - www.talend.com

  This source code is available under agreement available at
  https://github.com/Talend/data-prep/blob/master/LICENSE

  You should have received a copy of the agreement
  along with this program; if not, write to Talend SA
  9 rue Pages 92150 Suresnes, France

  ============================================================================*/

export const recipeState = {
    visible: false
};

export function RecipeStateService() {
    return {
        show: show,
        hide: hide,
        reset: reset
    };

    function show() {
        recipeState.visible = true;
    }

    function hide() {
        recipeState.visible = false;
    }

    function reset() {
        recipeState.visible = false;
    }
}