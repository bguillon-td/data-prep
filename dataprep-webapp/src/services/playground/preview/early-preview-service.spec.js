/*jshint camelcase: false */

describe('Early Preview Service', function () {
	'use strict';

	var currentMetadata = {id: '123456'};
	var column = {id: '0001', name: 'firstname'};
	var transfoScope;
	var transformation;
	var params;

	beforeEach(module('data-prep.services.playground'));

	beforeEach(inject(function(SuggestionService, PlaygroundService, PreviewService, RecipeService, EarlyPreviewService) {
		SuggestionService.currentColumn = column;
		PlaygroundService.currentMetadata = currentMetadata;

		transfoScope = 'column';
		transformation = {
			name: 'replace_on_value'
		};
		params = {
			value: 'James',
			replace: 'Jimmy'
		};

		spyOn(RecipeService, 'earlyPreview').and.returnValue();
		spyOn(RecipeService, 'cancelEarlyPreview').and.returnValue();
		spyOn(PreviewService, 'getPreviewAddRecords').and.returnValue();
		spyOn(PreviewService, 'cancelPreview').and.returnValue();
		spyOn(EarlyPreviewService, 'cancelPendingPreview').and.callThrough();
	}));

	it('should NOT trigger grid preview', inject(function ($timeout, PreviewService, EarlyPreviewService, RecipeService) {
		//given
		EarlyPreviewService.previewDisabled = true;

		//when
		EarlyPreviewService.earlyPreview(transformation, transfoScope)(params);
		$timeout.flush(300);

		//then
		expect(RecipeService.earlyPreview).not.toHaveBeenCalled();
		expect(EarlyPreviewService.cancelPendingPreview).not.toHaveBeenCalled();
		expect(PreviewService.getPreviewAddRecords).not.toHaveBeenCalled();

	}));

	it('should trigger grid preview after a 300ms delay', inject(function ($timeout, PreviewService, EarlyPreviewService, RecipeService) {
		//given

		//when
		EarlyPreviewService.earlyPreview(transformation, transfoScope)(params);
		expect(PreviewService.getPreviewAddRecords).not.toHaveBeenCalled();
		$timeout.flush(300);

		//then
		expect(RecipeService.earlyPreview).toHaveBeenCalledWith(
			column,
			transformation,
			{
				value: 'James',
				replace: 'Jimmy',
				scope: transfoScope,
				column_id: column.id,
				column_name: column.name
			}
		);
		expect(PreviewService.getPreviewAddRecords).toHaveBeenCalledWith(
			currentMetadata.id,
			'replace_on_value',
			{
				value: 'James',
				replace: 'Jimmy',
				scope: transfoScope,
				column_id: column.id,
				column_name: column.name
			}
		);
	}));

	it('should cancel pending early preview', inject(function ($timeout, RecipeService, PreviewService, EarlyPreviewService) {
		//given
		EarlyPreviewService.earlyPreview(transformation, transfoScope)(params);
		expect(RecipeService.earlyPreview).not.toHaveBeenCalled();
		expect(PreviewService.getPreviewAddRecords).not.toHaveBeenCalled();

		//when
		EarlyPreviewService.cancelEarlyPreview();
		$timeout.flush();

		//then
		expect(RecipeService.earlyPreview).not.toHaveBeenCalled();
		expect(PreviewService.getPreviewAddRecords).not.toHaveBeenCalled();
	}));

	it('should cancel current early preview after a 100ms delay', inject(function ($timeout, RecipeService, EarlyPreviewService, PreviewService) {
		//given

		//when
		EarlyPreviewService.cancelEarlyPreview();
		expect(RecipeService.cancelEarlyPreview).not.toHaveBeenCalled();
		expect(PreviewService.cancelPreview).not.toHaveBeenCalled();
		$timeout.flush(100);

		//then
		expect(RecipeService.cancelEarlyPreview).toHaveBeenCalled();
		expect(PreviewService.cancelPreview).toHaveBeenCalled();
	}));


	it('should NOT cancel current early preview even after a 100ms delay', inject(function ($timeout, RecipeService, EarlyPreviewService, PreviewService) {
		//given
		EarlyPreviewService.previewDisabled = true;

		//when
		EarlyPreviewService.cancelEarlyPreview();
		$timeout.flush(100);

		//then
		expect(RecipeService.cancelEarlyPreview).not.toHaveBeenCalled();
		expect(PreviewService.cancelPreview).not.toHaveBeenCalled();
	}));
});