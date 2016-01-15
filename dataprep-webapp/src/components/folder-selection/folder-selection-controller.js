(function () {
	'use strict';

	/**
	 * @ngdoc controller
	 * @name data-prep.folder-selection.controller:FolderSelectionCtrl
	 * @description Folder selection controller.
	 * @requires data-prep.services.state.service:StateService
	 * @requires data-prep.services.folder.service:FolderService
	 * @requires data-prep.services.state.constant:state
	 */
	function FolderSelectionCtrl(FolderService, state, StateService, $translate) {
		var vm = this;
		vm.state = state;

		/**
		 * @type {Array} folder found after a search
		 */
		vm.foldersFound = [];

		/**
		 * @ngdoc method
		 * @name initFolders
		 * @methodOf data-prep.folder-selection.controller:FolderSelectionCtrl
		 * @description Display folder destination choice modal
		 */
		vm.initFolders = function initFolders() {
			vm.foldersFound = [];
			vm.searchFolderQuery = '';

			var toggleToCurrentFolder = state.folder && state.folder.currentFolder && state.folder.currentFolder.id;

			if (toggleToCurrentFolder) {
				var pathParts = state.folder.currentFolder.id.split('/');
				var currentPath = pathParts[0];
			}

			var rootFolder = {id: '', path: '', collapsed: false, name: $translate.instant('HOME_FOLDER')};

			FolderService.children()
					.then(function (res) {
						rootFolder.nodes = res.data;
						vm.chooseFolder(rootFolder);

						vm.folders = [rootFolder];
						_.forEach(vm.folders[0].nodes, function (folder) {
							folder.collapsed = true;
							// recursive toggle until we reach the current folder
							if (toggleToCurrentFolder && folder.id === currentPath) {
								vm.toggle(folder, pathParts.length > 0 ? _.slice(pathParts, 1) : null, currentPath);
								vm.chooseFolder(folder);
							}
						});
						vm.folderDestinationModal = true;
					});
		};

		/**
		 * @ngdoc method
		 * @name toggle
		 * @methodOf data-prep.folder-selection.controller:FolderSelectionCtrl
		 * @description load folder children
		 * @param {object} folder The folder to display children
		 * @param {array} pathParts All path parts
		 * @param {string} currentPath The current path for recursive call
		 */
		vm.toggle = function toggle (folder, pathParts, currentPath) {
			if (!folder.collapsed) {
				folder.collapsed = true;
			} else {
				if (!folder.nodes) {
					FolderService.children(folder.id)
							.then(function (res) {
								folder.nodes = res.data ? res.data : [];
								vm.collapseNodes(folder);
								if (pathParts && pathParts[0]) {
									currentPath += currentPath ? '/' + pathParts[0] : pathParts[0];
									_.forEach(folder.nodes, function (folder) {
										if (folder.id === currentPath) {
											vm.toggle(folder, pathParts.length > 0 ? _.slice(pathParts, 1) : null, currentPath);
											vm.chooseFolder(folder);
										}
									});
								}
							});

				} else {
					vm.collapseNodes(folder);
				}
			}
		};


		/**
		 * @ngdoc method
		 * @name chooseFolder
		 * @methodOf data-prep.folder-selection.controller:FolderSelectionCtrl
		 * @description Set folder destination choice
		 * @param {object} folder - the folder to use for cloning the data
		 */
		vm.chooseFolder = function (folder) {
			var previousSelected = state.folder.choosedFolder;
			if (previousSelected) {
				previousSelected.selected = false;
			}
			StateService.setChoosedFolder(folder);
			folder.selected = true;
		};

		/**
		 * @ngdoc method
		 * @name collapseNodes
		 * @methodOf data-prep.folder-selection.controller:FolderSelectionCtrl
		 * @description utility function to collapse nodes
		 * @param {object} node - parent node of childs to collapse
		 */
		vm.collapseNodes = function (node) {
			_.forEach(node.nodes, function (folder) {
				folder.collapsed = true;
			});
			if (node.nodes.length > 0) {
				node.collapsed = false;
			} else {
				node.collapsed = !node.collapsed;
			}
		};


		/**
		 * @ngdoc method
		 * @name searchFolders
		 * @methodOf data-prep.folder-selection.controller:FolderSelectionCtrl
		 * @description Search folders
		 */
		vm.searchFolders = function searchFolders () {

			vm.foldersFound = [];
			if (vm.searchFolderQuery) {
				//Add the root folder if it matches the filter
				var n = $translate.instant('HOME_FOLDER').indexOf(vm.searchFolderQuery);

				FolderService.search(vm.searchFolderQuery)
						.then(function (response) {
							if (n > -1) {
								var rootFolder = {id: '', path: '', name: $translate.instant('HOME_FOLDER')};
								vm.foldersFound.push(rootFolder);
								vm.foldersFound = vm.foldersFound.concat(response.data);
							} else {
								vm.foldersFound = response.data;
							}
							if (vm.foldersFound.length > 0) {
								vm.chooseFolder(vm.foldersFound[0]); //Select by default first folder
							}
						});
			} else {
				vm.chooseFolder(vm.folders[0]);  //Select by default first folder
			}

		};

	}

	angular.module('data-prep.folder-selection')
		.controller('FolderSelectionCtrl', FolderSelectionCtrl);

})();