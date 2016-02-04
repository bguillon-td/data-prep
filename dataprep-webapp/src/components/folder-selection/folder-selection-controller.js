(function () {
    'use strict';

    /**
     * @ngdoc controller
     * @name data-prep.folder-selection.controller:FolderSelectionCtrl
     * @description Folder selection controller
     * @requires data-prep.services.folder.service:FolderService
     */
    function FolderSelectionCtrl($translate, FolderService) {
        var vm = this;
        vm.visible = false;

        /**
         * @type {Array} folders found after a search query
         */
        vm.foldersFound = [];

        /**
         * @ngdoc method
         * @name initFolders
         * @methodOf data-prep.folder-selection.controller:FolderSelectionCtrl
         * @description Display folder destination choice tree
         */
        vm.initFolders = function initFolders() {
            vm.foldersFound = [];
            vm.searchFolderQuery = '';

            var rootFolder = {
                id: '',
                path: '',
                level: 0,
                alreadyToggled: true,
                showFolder: true,
                collapsed: false,
                name: $translate.instant('HOME_FOLDER')
            };
            vm.folders = [rootFolder];

            var pathParts = vm.currentFolder.path.split('/');
            if (vm.currentFolder.path !== '/') {
                pathParts.unshift('');
            }
            locateCurrentFolder(vm.folders[0], pathParts, '');
        };

        function locateCurrentFolder (parentFolder, pathParts, currentPath) {
            currentPath += currentPath ? '/' + pathParts[0] : pathParts[0];
            FolderService.children(currentPath)
                         .then(function (res) {
                             var currentIndex = _.findIndex(vm.folders, parentFolder);
                             _.each(res.data, function (child, index) {
                                 if (!res.data.length) {
                                     parentFolder.hasNoChildren = true;
                                 }
                                 child.level = parentFolder.level + 1;
                                 child.collapsed = true;
                                 child.alreadyToggled = false;
                                 child.showFolder = true;
                                 vm.folders.splice(currentIndex + 1 + index, 0, child);
                             });

                             var next = _.find(res.data, {name: pathParts[1]});

                             if (next) {
                                 pathParts.shift();

                                 if (pathParts.length === 1) {
                                     next.selected = true;
                                     vm.selectedFolder = next;
                                 }
                                 else {
                                     next.collapsed = false;
                                     next.alreadyToggled = true;
                                     locateCurrentFolder(next, pathParts, currentPath);
                                 }
                             }
                             else {//home level
                                 parentFolder.selected = true;
                                 vm.selectedFolder = parentFolder;
                             }
                         });
        }

        /**
         * @ngdoc method
         * @name searchFolders
         * @methodOf data-prep.folder-selection.controller:FolderSelectionCtrl
         * @description Search folders corresponding to a given string
         */
        vm.searchFolders = function searchFolders() {
            vm.foldersFound = [];
            if (vm.searchFolderQuery) {
                //Add the root folder if it matches the filter
                var n = $translate.instant('HOME_FOLDER').toLowerCase().indexOf(vm.searchFolderQuery.toLowerCase());

                FolderService.search(vm.searchFolderQuery)
                             .then(function (response) {
                                 if (n > -1) {
                                     var rootFolder = {
                                         id: '',
                                         path: '',
                                         showFolder: true,
                                         name: $translate.instant('HOME_FOLDER')
                                     };
                                     vm.foldersFound.push(rootFolder);
                                 }

                                 response.data.map(function (folder) {
                                     folder.showFolder = true;
                                     folder.searchResult = true;
                                     folder.level = 0;
                                 });

                                 vm.foldersFound = vm.foldersFound.concat(response.data);

                                 if (vm.foldersFound.length > 0) {
                                     vm.selectedFolder = vm.foldersFound[0];
                                     vm.selectedFolder.selected = true;
                                 }
                             });
            } else {
                vm.initFolders();
            }
        };
    }

    angular.module('data-prep.folder-selection')
           .controller('FolderSelectionCtrl', FolderSelectionCtrl);

})();