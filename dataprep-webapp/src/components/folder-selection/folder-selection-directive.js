(function () {
	'use strict';

	/**
	 * @ngdoc directive
	 * @name data-prep.datagrid.directive:FolderSection
	 * @description This directive ask to selection a folder
	 * @restrict E
	 * @usage
	 * <folder-selection></folder-selection>
	 */
	function FolderSelection() {
		return {
			templateUrl: 'components/folder-selection/folder-selection.html',
			restrict: 'E',
			bindToController: true,
			controllerAs: 'folderSelectionCtrl',
			controller: 'FolderSelectionCtrl',
			link: function(scope, iElement, iAttrs, ctrl) {
				ctrl.initFolders();
			}
		};
	}

	angular.module('data-prep.folder-selection')
		.directive('folderSelection', FolderSelection);
})();