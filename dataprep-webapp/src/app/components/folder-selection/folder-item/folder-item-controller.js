/*  ============================================================================

 Copyright (C) 2006-2016 Talend Inc. - www.talend.com

 This source code is available under agreement available at
 https://github.com/Talend/data-prep/blob/master/LICENSE

 You should have received a copy of the agreement
 along with this program; if not, write to Talend SA
 9 rue Pages 92150 Suresnes, France

 ============================================================================*/

/**
 * @ngdoc controller
 * @name data-prep.folder-selection.controller:FolderItemCtrl
 * @description destination Folder selection for cloning/moving
 * @requires data-prep.services.folder.service:FolderService
 */

export default function FolderItemCtrl(FolderService) {
    'ngInject';

    var vm = this;

    /**
     * @ngdoc method
     * @name toggle
     * @methodOf data-prep.folder-item.controller:FolderItemCtrl
     * @description loads folder's children
     * @param {object} folder The folder to query its children
     */
    vm.toggle = function toggle(folder) {
        if (folder.collapsed) {
            if (folder.alreadyToggled) {
                updateChildrenDisplay(folder, true);
            }
            else {
                folder.alreadyToggled = true;
                FolderService.children(folder.id)
                             .then(function (res) {
                                 if (!res.data.length) {
                                     folder.hasNoChildren = true;
                                 }
                                 var currentIndex = _.findIndex(vm.folders, folder);
                                 _.each(res.data, function (child, index) {
                                     child.level = folder.level + 1;
                                     child.collapsed = true;
                                     child.showFolder = true;
                                     //insert folder children at the right position
                                     vm.folders.splice(currentIndex + 1 + index, 0, child);
                                 });
                             });
            }
        } else {
            updateChildrenDisplay(folder, false);
        }
        folder.collapsed = !folder.collapsed;
    };

    /**
     * @ngdoc method
     * @name updateChildrenDisplay
     * @description shows/hides all the children of a given folder
     * @param {object} parent the folder to update its children's display
     * @param {Boolean} showChildren show/hide boolean value
     */
    function updateChildrenDisplay(parent, showChildren) {
        var parentPosition = _.findIndex(vm.folders, parent);
        var followingFolders = vm.folders.slice(parentPosition + 1, vm.folders.length);
        var nextSiblingPos = _.findIndex(followingFolders, function (followingFolder) {
            return followingFolder.level <= parent.level;
        });
        if (nextSiblingPos === -1) {
            nextSiblingPos = vm.folders.length;
        }
        vm.folders.slice(parentPosition + 1, parentPosition + nextSiblingPos + 1)
                  .map(function (folderItem) {
                      folderItem.showFolder = showChildren;
                  });
    }

    /**
     * @ngdoc method
     * @name chooseFolder
     * @methodOf data-prep.folder-item.controller:FolderItemCtrl
     * @description Set folder destination choice
     * @param {object} folder - the folder to use for cloning/moving the dataset
     */
    vm.chooseFolder = function (folder) {
        vm.selectedFolder = folder;
    };
}