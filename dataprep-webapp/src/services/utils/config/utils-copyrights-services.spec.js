describe('Copyrights service', function() {
    'use strict';

    beforeEach(module('data-prep.services.utils'));

    it('should set value by default', inject(function(copyRights) {
        //then
        expect(copyRights).toBe('Talend. All Rights Reserved');
    }));
});