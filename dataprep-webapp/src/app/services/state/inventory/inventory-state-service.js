'use strict';

const sortList = [
    {id: 'name', name: 'NAME_SORT', property: 'name'},
    {id: 'date', name: 'DATE_SORT', property: 'created'}
];

const orderList = [
    {id: 'asc', name: 'ASC_ORDER'},
    {id: 'desc', name: 'DESC_ORDER'}
];

export const inventoryState = {
    preparations: null,
    datasets: null,
    sortList: sortList,
    orderList: orderList,
    sort: sortList[1],
    order: orderList[1]
};


export function InventoryStateService() {
    return {
        setPreparations: setPreparations,
        removePreparation: removePreparation,
        setDatasets: setDatasets,
        removeDataset: removeDataset,
        setSort: setSort,
        setOrder: setOrder
    };

    function setPreparations(preparations) {
        inventoryState.preparations = preparations;
    }

    function removePreparation(preparation) {
        inventoryState.preparations = _.reject(inventoryState.preparations, {id: preparation.id});
    }

    function setDatasets(datasets) {
        inventoryState.datasets = datasets;
    }

    function removeDataset(dataset) {
        inventoryState.datasets = _.reject(inventoryState.datasets, {id: dataset.id});
    }

    function setSort(sort) {
        inventoryState.sort = sort;
    }

    function setOrder(order) {
        inventoryState.order = order;
    }

}