'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var LayoutForce = (function () {
    function LayoutForce(stage_id, nodes, links) {
        _classCallCheck(this, LayoutForce);

        this.stageId = stage_id;
        this.widthPhotoGallery = 130;

        /* forceレイアウトの設定 */
        this.force = null;
        this.color = d3.scale.category20();
        this.charge = -450;
        this.linkDistance = 100;
        this.nodes = nodes || [];
        this.links = nodes || [];
        this.initGraph();

        this.bindWindowEvents();
    }

    _createClass(LayoutForce, [{
        key: 'dom',
        value: function dom(id) {
            return document.getElementById(id);
        }
    }, {
        key: 'expandNode',
        value: function expandNode(node_id) {}
    }, {
        key: 'closeNode',
        value: function closeNode(node_id) {}
    }, {
        key: 'initGraph',
        value: function initGraph() {
            this.force = d3.layout.force().charge(this.charge).linkDistance(this.linkDistance);
            this.setGraphSize();
            this.linkingData();
            this.bindGraphEvents();
        }

        // グラフにデータを関連付ける
    }, {
        key: 'linkingData',
        value: function linkingData() {
            this.force.nodes(this.nodes).links(this.links);
        }
    }, {
        key: 'renderGraph',
        value: function renderGraph() {}

        // canvasサイズを設定する
    }, {
        key: 'setGraphSize',
        value: function setGraphSize() {
            var width = util.w - this.widthPhotoGallery;
            var height = util.h;
            this.dom(this.stageId).setAttribute(width, width + 'px');
            this.dom(this.stageId).setAttribute(height, height + 'px');
            this.dom('gallery').style.height = height + 'px';
            this.force.size([width, height]);
        }

        // windowに関するイベントリスナ
    }, {
        key: 'bindWindowEvents',
        value: function bindWindowEvents() {
            var _this = this;

            window.addEventListener('resize', function (e) {
                _this.GraphSize();
            });
        }

        // グラフに関するイベントリスナ
    }, {
        key: 'bindGraphEvents',
        value: function bindGraphEvents() {
            var svg = this.dom(this.stageId);
            this.force.on('tick', function () {
                svg.selectAll('.link').attr('x1', function (d) {
                    return d.source.x;
                }).attr('y1', function (d) {
                    return d.source.y;
                }).attr('x2', function (d) {
                    return d.target.x;
                }).attr('y2', function (d) {
                    return d.target.y;
                });

                svg.selectAll('circle').attr('cx', function (d) {
                    return d.x;
                }).attr('cy', function (d) {
                    return d.y;
                });
                svg.selectAll('text').attr('x', function (d) {
                    return d.x;
                }).attr('y', function (d) {
                    return d.y;
                });
            });
        }
    }]);

    return LayoutForce;
})();
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MiilGraph = function MiilGraph() {
    _classCallCheck(this, MiilGraph);
};
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Util = (function () {
    function Util(w, g) {
        _classCallCheck(this, Util);

        this.g = g || document;
        this.w = w || window;
    }

    /* Gets DOM elements which are detected CSS selector */

    _createClass(Util, [{
        key: 'getDom',
        value: function getDom(selector) {
            if (selector === undefined) return false;
            return document.querySelector(selector);
        }
    }, {
        key: 'getDoms',
        value: function getDoms(selector) {
            if (selector === undefined) return false;
            return document.querySelectorAll(selector);
        }

        /* Get DOM element which has a given id */
    }, {
        key: 'getDomById',
        value: function getDomById(id) {
            return this.getDom('#' + id);
        }
    }]);

    return Util;
})();

var util = new Util();

