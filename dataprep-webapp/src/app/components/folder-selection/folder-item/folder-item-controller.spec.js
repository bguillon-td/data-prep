/*  ============================================================================

 Copyright (C) 2006-2016 Talend Inc. - www.talend.com

 This source code is available under agreement available at
 https://github.com/Talend/data-prep/blob/master/LICENSE

 You should have received a copy of the agreement
 along with this program; if not, write to Talend SA
 9 rue Pages 92150 Suresnes, France

 ============================================================================*/
/*

    describe('', function(){

        it('choose folder should marker folder as selected', function () {
            //given
            var folder = {path: '/foo/beer'};
            var ctrl = createController();

            //when
            ctrl.chooseFolder(folder);
            scope.$digest();

            //then
            expect(folder.selected).toBe(true);
            expect(ctrl.folderDestination).toBe(folder);
        });

        it('toggle should call children service', inject(function (FolderService) {
            //given
            var folder = {id: 'folder-1', collapsed: true};
            var ctrl = createController();
            spyOn(ctrl, 'chooseFolder').and.returnValue();

            //when
            ctrl.toggle(folder, ['beer'], 'folder-1');
            scope.$digest();

            //then
            expect(FolderService.children).toHaveBeenCalledWith(folder.id);
        }));

        it('toggle should not call children service because already children', inject(function (FolderService) {
            //given
            var folder = {id: '/foo/beer', collapsed: true, nodes: [{id: 'wine'}]};
            var ctrl = createController();

            //when
            ctrl.toggle(folder);
            scope.$digest();

            //then
            expect(FolderService.children).not.toHaveBeenCalled();
        }));

        it('toggle should not call children service because not collapsed', inject(function (FolderService) {
            //given
            var folder = {id: '/foo/beer', collapsed: false};
            var ctrl = createController();

            //when
            ctrl.toggle(folder);
            scope.$digest();

            //then
            expect(FolderService.children).not.toHaveBeenCalled();
        }));
*/