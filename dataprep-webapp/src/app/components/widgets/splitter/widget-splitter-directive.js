class TalendSplitterCtrl {
    constructor($scope, $element, $window) {
        'ngInject';
        this.drag = false;
        this.$element = $element;
        this.windowElement = angular.element($window);
        this.$scope = $scope;
    }

    $onInit() {
        this.initElements();
        this.attachListeners();
    }

    initElements() {
        this.minSize = +this.minSize || 256;
        this.splitContainer = this.$element.find('> .talend-splitter').eq(0);
        this.firstPane = this.$element.find('.split-first-pane').eq(0);
        this.splitHandler = this.$element.find('.split-handler').eq(0);
        this.secondPane = this.$element.find('.split-second-pane').eq(0);
    }

    attachListeners() {
        this.$element.on('mousemove', (event) => {
            if (!this.drag) {
                return;
            }
            event.preventDefault();
            this.updateSize(event);
        });

        this.splitHandler.on('mousedown', () => this.drag = true);

        const onmouseup = () => this.drag = false;
        this.windowElement.on('mouseup', onmouseup);

        this.$scope.$on('$destroy', () => this.windowElement.off('mouseup', onmouseup));
    }

    updateSize(event) {
        const bounds = this.splitContainer[0].getBoundingClientRect();

        if (this.orientation === 'vertical') {
            this.splitHandlerSize = this.splitHandlerSize || this.splitHandler.height();
            const pos = event.clientY - bounds.top - this.splitHandlerSize / 2;

            if (pos < this.minSize || pos > bounds.height - this.minSize) {
                return;
            }

            this.firstPane.css('bottom', bounds.height - pos);
            this.splitHandler.css('top', pos);
            this.secondPane.css('top', pos + this.splitHandlerSize);
        }
        else {
            this.splitHandlerSize = this.splitHandlerSize || this.splitHandler.width();
            const pos = event.clientX - bounds.left - this.splitHandlerSize / 2;

            if (pos < this.minSize || pos > bounds.width - this.minSize) {
                return;
            }

            this.firstPane.css('right', bounds.width - pos);
            this.splitHandler.css('left', pos);
            this.secondPane.css('left', pos + this.splitHandlerSize);
        }
    }
}

/**
 * @ngdoc directive
 * @name talend.widget.directive:TalendSlidable
 * @description Slidable widget.<br/>
 * If the slidable is resizable, the widget keeps the last width in localstorage so the element is resized in creation<br/>
 * To customize the slidable width, use the sass mixin to set properly all the flexbox element size
 <pre>

 .my-slidable-element {
        &#64;include slidable-size(300px, 20px);
    }

 </pre>
 * Parameters :
 * <ul>
 *     <li>First param (300px) is the panel width</li>
 *     <li>Second param (20px) is action bar (used to show/hide) width</li>
 * </ul>
 * @restrict E
 * @usage
 *  <talend-splitter orientation="vertical" min-size="300">
 *      <split-first-pane>
 *          My first pane
 *      </split-first-pane>
 *      <split-second-pane>
 *          My second pane
 *      </split-second-pane>
 *  </talend-splitter>
 * @param {string} orientation The splitter orientation : horizontal | vertical
 * @param {string} monSi `left` (default) | right. This defines the action bar and the resize bar position
 * @param {string} resizable Pass unique ID that will be used to store custom size in local storage (key = {data-prep-' + resizable_namespace + '-width}).<br/>
 * @param {string} controlBar If 'false', the action bar will not been displayed.<br/>
 * Resize feature is disabled by default and enabled if the attribute si set
 */
const TalendSplitter = {
    template: `
    <div class="talend-splitter {{::$ctrl.orientation}}">
        <div class="split-first-pane" ng-transclude="split-first-pane"></div>
        <div class="split-handler">
            <div class="split-handler-square"></div>
            <div class="split-handler-square"></div>
            <div class="split-handler-square"></div>
            <div class="split-handler-square"></div>
            <div class="split-handler-square"></div>
            <div class="split-handler-square"></div>
            <div class="split-handler-square"></div>
        </div>
        <div class="split-second-pane" ng-transclude="split-second-pane"></div>
    </div>`,
    bindings: {
        orientation: '@',
        minSize: '@'
    },
    transclude: {
        'split-first-pane': 'splitFirstPane',
        'split-second-pane': 'splitSecondPane'
    },
    controller: TalendSplitterCtrl
};

export default TalendSplitter;