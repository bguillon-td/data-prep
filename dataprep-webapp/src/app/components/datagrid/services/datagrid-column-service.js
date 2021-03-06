/*  ============================================================================

  Copyright (C) 2006-2016 Talend Inc. - www.talend.com

  This source code is available under agreement available at
  https://github.com/Talend/data-prep/blob/master/LICENSE

  You should have received a copy of the agreement
  along with this program; if not, write to Talend SA
  9 rue Pages 92150 Suresnes, France

  ============================================================================*/

/**
 * @ngdoc service
 * @name data-prep.datagrid.service:DatagridColumnService
 * @description Datagrid private service that manage the grid columns and columns headers
 * LEXICON :
 * <ul>
 *     <li>Column : the slick grid column</li>
 *     <li>Header : the datagrid header directive. The header created by SlickGrid will be called by 'SlickGird Header'</li>
 * </ul>
 * @requires data-prep.datagrid.service:DatagridStyleService
 * @requires data-prep.services.playground.service:DatagridService
 * @requires data-prep.services.utils.service:ConverterService
 * @requires data-prep.services.playground.service:PlaygroundService
 */
export default function DatagridColumnService($rootScope, $compile, DatagridStyleService, ConverterService, PlaygroundService, $translate) {
    'ngInject';

    var grid;
    var availableHeaders = [];
    var renewAllFlag;
    var colIndexName = 'tdpId';

    var gridHeaderPreviewTemplate =
        '<div class="grid-header <%= diffClass %>">' +
        '   <div class="grid-header-title dropdown-button ng-binding"><%= name %></div>' +
        '       <div class="grid-header-type ng-binding"><%= simpleType %></div>' +
        '   </div>' +
        '<div class="quality-bar"><div class="record-unknown"></div></div>';

    return {
        init: init,
        renewAllColumns: renewAllColumns,
        createColumns: createColumns
    };

    //------------------------------------------------------------------------------------------------------
    //-----------------------------------------------GRID COLUMNS-------------------------------------------
    //------------------------------------------------------------------------------------------------------

    /**
     * @ngdoc method
     * @name createColumnDefinition
     * @methodOf data-prep.datagrid.service:DatagridColumnService
     * @param {object} col The column metadata to adapt
     * @param {boolean} preview Flag that indicates if we are in the preview mode
     * @description Adapt column metadata to slick column.
     * <ul>
     *     <li>Non preview mode : The div id depending on index is important. It is used as insertion point for the header directive.</li>
     *     <li>Preview mode : we inject directly a fake header</li>
     * </ul>
     * @returns {object} The adapted column item
     */
    function createColumnDefinition(col, preview) {
        var template = preview ?
            _.template(gridHeaderPreviewTemplate)({
                name: col.name,
                diffClass: DatagridStyleService.getColumnPreviewStyle(col),
                simpleType: col.domain ? col.domain : ConverterService.simplifyType(col.type)
            }) :
            '';
        var translatedMsg = $translate.instant('APPLY_TO_ALL_CELLS');

        return {
            id: col.id,
            field: col.id,
            name: template,
            formatter: DatagridStyleService.columnFormatter(col),
            tdpColMetadata: col,
            editor: preview ? null : Slick.Editors.TalendEditor(PlaygroundService.editCell, translatedMsg),
            preview: preview
        };
    }

    /**
     * @ngdoc method
     * @name createColumns
     * @methodOf data-prep.datagrid.service:DatagridColumnService
     * @param {object[]} columnsMetadata Columns details
     * @param {boolean} preview Flag that indicates if we are in preview mode
     * @description Two modes :
     * <ul>
     *     <li>Preview : we save actual headers and simulate fake headers with the new preview columns</li>
     *     <li>Classic : we map each column to a header. This header can be a reused header if the column was
     * the same as before, or a new created one otherwise.</li>
     * </ul>
     */

    function createColumns(columnsMetadata, preview) {
        //create new SlickGrid columns
        var colIndexArray = [];
        var colIndexNameTemplate = '<div class="slick-header-column-index">#</div>';

        //Add index column
        colIndexArray.push({
            id: colIndexName,
            name: colIndexNameTemplate,
            field: colIndexName,
            maxWidth: 45,
            formatter: function formatterIndex(row, cell, value) {
                return '<div class="index-cell">' + value + '</div>';
            },
            resizable: false,
            selectable: false
        });

        return _.union(colIndexArray, _.map(columnsMetadata, function (col) {
            return createColumnDefinition(col, preview);
        }));
    }

    //------------------------------------------------------------------------------------------------------
    //-----------------------------------------------GRID HEADERS-------------------------------------------
    //------------------------------------------------------------------------------------------------------
    /**
     * @ngdoc method
     * @name destroyHeader
     * @methodOf data-prep.datagrid.service:DatagridColumnService
     * @param {object} headerDefinition The header definition that contains scope (the angular scope) and header (the element)
     * @description Destroy the angular scope and header element
     */
    function destroyHeader(headerDefinition) {
        headerDefinition.scope.$destroy();
        headerDefinition.header.remove();
    }

    /**
     * @ngdoc method
     * @name renewAllColumns
     * @methodOf data-prep.datagrid.service:DatagridColumnService
     * @param {boolean} value The new flag value
     * @description Set the 'renewAllFlag' with provided value to control whether the headers should be reused or recreated
     */
    function renewAllColumns(value) {
        renewAllFlag = value;

        if (value) {
            _.forEach(availableHeaders, destroyHeader);
            availableHeaders = [];
        }
    }

    /**
     * @ngdoc method
     * @name createHeader
     * @methodOf data-prep.datagrid.service:DatagridColumnService
     * @description [PRIVATE] Create a column header object containing
     * <ul>
     *     <li>the element directive</li>
     *     <li>The directive scope</li>
     *     <li>The column metadata</li>
     * </ul>
     */
    function createHeader(col) {
        var headerScope = $rootScope.$new(true);
        headerScope.column = col;
        var headerElement = angular.element('<datagrid-header column="column"></datagrid-header>');
        $compile(headerElement)(headerScope);

        return {
            id: col.id,
            scope: headerScope,
            header: headerElement
        };
    }

    /**
     * @ngdoc method
     * @name detachAndSaveHeader
     * @methodOf data-prep.datagrid.service:DatagridColumnService
     * @param {object} event The Slickgrid header destroy event
     * @param {object} columnsArgs The column header arguments passed by SlickGrid
     * @description This is part of the process to avoid recreation od the datagrid header when it is not necessary.
     * It detach the element and save it with its scope, so it can be reused.
     * If the 'renewAllFlag' is set to true, the headers are destroyed. So they are forced to be recreated.
     */
    function detachAndSaveHeader(event, columnsArgs) {
        //No header to detach on preview
        var columnDef = columnsArgs.column;
        if (columnDef.preview || columnDef.id === colIndexName) {
            return;
        }

        //Destroy the header if explicitly requested
        if (renewAllFlag) {
            destroyHeader(columnDef);
        }
        //Detach and save it otherwise
        else {
            var scope = columnDef.scope;
            var header = columnDef.header;

            header.detach();
            availableHeaders.push({
                id: columnDef.id,
                scope: scope,
                header: header
            });
        }
    }

    /**
     * @ngdoc method
     * @name createAndAttachHeader
     * @methodOf data-prep.datagrid.service:DatagridColumnService
     * @param {object} event The Slickgrid header creation event
     * @param {object} columnsArgs The column header arguments passed by SlickGrid
     * @description This is part of the process to avoid recreation od the datagrid header when it is not necessary.
     * It fetch an existing saved header to reuse it, or create it otherwise.
     * The existing header is then updated with the new column metadata.
     */
    function createAndAttachHeader(event, columnsArgs) {
        //No header to append on preview
        var columnDef = columnsArgs.column;
        if (columnDef.preview || columnDef.id === colIndexName) {
            return;
        }

        //Get existing header and remove it from available headers list
        var headerDefinition = _.find(availableHeaders, {id: columnDef.id});
        if (headerDefinition) {
            var headerIndex = availableHeaders.indexOf(headerDefinition);
            availableHeaders.splice(headerIndex, 1);
        }

        //Create the header if no available created header, update it otherwise
        if (headerDefinition) {
            headerDefinition.scope.column = columnDef.tdpColMetadata;
            headerDefinition.scope.$digest();
        }
        else {
            headerDefinition = createHeader(columnDef.tdpColMetadata);
        }

        //Update column definition
        columnDef.scope = headerDefinition.scope;
        columnDef.header = headerDefinition.header;

        //Append the header
        var node = angular.element(columnsArgs.node);
        node.append(headerDefinition.header);
    }

    //------------------------------------------------------------------------------------------------------
    //--------------------------------------------------INIT------------------------------------------------
    //------------------------------------------------------------------------------------------------------
    /**
     * @ngdoc method
     * @name attachColumnHeaderEvents
     * @methodOf data-prep.datagrid.service:DatagridColumnService
     * @description Attach listeners for header creation/destroy. The handler detach and save headers on destroy,
     * attach (create them if necessary) and update them on render
     */
    function attachColumnHeaderEvents() {
        grid.onBeforeHeaderCellDestroy.subscribe(detachAndSaveHeader);
        grid.onHeaderCellRendered.subscribe(createAndAttachHeader);
    }

    /**
     * @ngdoc method
     * @name init
     * @methodOf data-prep.datagrid.service:DatagridColumnService
     * @param {object} newGrid The new grid
     * @description Initialize the grid and attach the column listeners
     */
    function init(newGrid) {
        grid = newGrid;
        attachColumnHeaderEvents();
    }
}