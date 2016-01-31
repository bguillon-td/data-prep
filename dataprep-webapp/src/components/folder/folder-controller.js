(function () {
	'use strict';

	/**
	 * @ngdoc controller
	 * @name data-prep.folder.controller:FolderCtrl
	 * @description Export controller.
	 * @requires data-prep.services.folder.service:FolderService
	 * @requires data-prep.services.state.constant:state
	 */
	function FolderCtrl (FolderService, state, StateService, StorageService) {
		var vm = this;
		vm.state = state;

		/**
		 * @ngdoc method
		 * @methodOf data-prep.dataset-list.controller:DatasetListCtrl
		 * @name refreshDatasetsSort
		 * @description refresh the actual sort parameter
		 * */
		function refreshDatasetsSort() {
			var savedSort = StorageService.getDatasetsSort();
			if(savedSort){
				StateService.setDatasetsSort(_.find(state.inventory.sortList, {id: savedSort}));
			}
		}

		/**
		 * @ngdoc method
		 * @methodOf data-prep.dataset-list.controller:DatasetListCtrl
		 * @name refreshDatasetsOrder
		 * @description refresh the actual order parameter
		 */
		function refreshDatasetsOrder() {
			var savedSortOrder = StorageService.getDatasetsOrder();
			if(savedSortOrder){
				StateService.setDatasetsOrder(_.find(state.inventory.orderList, {id: savedSortOrder}));
			}
		}

		/**
		 * @ngdoc method
		 * @name goToFolder
		 * @methodOf data-prep.folder.controller:FolderCtrl
		 * @param {object} folder - the folder to go
		 */
		vm.goToFolder = function goToFolder (folder) {
			FolderService.getContent(folder);
		};

		/**
		 * @ngdoc method
		 * @name initMenuChildren
		 * @methodOf data-prep.folder.controller:FolderCtrl
		 * @param {object} folder - the folder
		 * @description build the children of the folder menu entry as parameter
		 */
		vm.initMenuChildren = function initMenuChildren (folder) {
			StateService.setMenuChildren([]);
			FolderService.populateMenuChildren(folder);
		};

		/**
		 * Load folders on start
		 */
		refreshDatasetsSort();
		refreshDatasetsOrder();

		FolderService.getContent();
	}

	angular.module('data-prep.folder')
		.controller('FolderCtrl', FolderCtrl);
})();