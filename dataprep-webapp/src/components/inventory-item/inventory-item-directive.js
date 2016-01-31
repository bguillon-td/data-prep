(function() {
    'use strict';

    /**
     * @ngdoc directive
     * @name data-prep.inventoryItem.directive:InventoryItem
     * @description This directive display an inventory item
     * @restrict E
     *
     * @usage
     * <inventory-item
     *  copy="datasetListCtrl.openFolderChoice"
     *  details="INVENTORY_DETAILS"
     *  file-model="datasetListCtrl.updateDatasetFile"
     *  item="dataset"
     *  open="datasetListCtrl.uploadWorkflowService.openDataset"
     *  open-related-inv="datasetListCtrl.openPreparation"
     *  process-certification="datasetListCtrl.processCertification"
     *  remove="datasetListCtrl.remove"
     *  rename="datasetListCtrl.rename"
     *  related-inventories="dataset.preparations"
     *  related-inventories-type="preparation"
     *  toggle-favorite="datasetListCtrl.datasetService.toggleFavorite"
     *  type="dataset"
     *  update="datasetListCtrl.uploadUpdatedDatasetFile">
     * </inventory-item>
     *
     * @param {function}    copy copy or remove an inventory item
     * @param {string}      details of the inventory item to be translated (author, lines number)
     * @param {array}       fileModel the file which will replace the current item
     * @param {object}      item the inventory item
     * @param {function}    open the playground
     * @param {function}    openRelatedInv callback function to open the related inventory item
     * @param {function}    processCertification attributes certification to the inventory item
     * @param {function}    remove the inventory item
     * @param {function}    rename the inventory item
     * @param {array}       relatedInventories related inventory items
     * @param {string}      relatedInventoriesType of the related inventory item
     * @param {function}    toggleFavorite the inventory item
     * @param {string}      type of the inventory item
     * @param {function}    update the inventory item with the given fileModel
     */
    function InventoryItem() {
        return {
            restrict: 'E',
            templateUrl: 'components/inventory-item/inventory-item.html',
            replace: true,
            bindToController: true,
            controllerAs: 'inventoryItemCtrl',
            controller: 'InventoryItemCtrl',
            scope: {
                copy : '=',
                details : '@',
                fileModel : '=',
                item : '=',
                open : '=',
                openRelatedInv : '=',
                processCertification : '=',
                remove : '=',
                rename : '=',
                relatedInventories : '=',
                relatedInventoriesType : '@',
                toggleFavorite : '=',
                type : '@',
                update : '='
            }
        };
    }

    angular.module('data-prep.inventory-item')
        .directive('inventoryItem', InventoryItem);
})();