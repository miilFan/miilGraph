/* サイドフォトギャラリー付きForceレイアウトd3jsグラフ */
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var LayoutForce = (function () {
    function LayoutForce(stage_id, nodes, links) {
        _classCallCheck(this, LayoutForce);

        this.stageId = stage_id;

        /* フォトギャラリーの設定 */
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

    // 与えられたIDのノードの子要素を除去する

    _createClass(LayoutForce, [{
        key: 'closeNode',
        value: function closeNode(id) {}
    }, {
        key: 'initGraph',
        value: function initGraph() {
            // 虫眼鏡UIに必要な要素を挿入する
            // グラフを初期化する
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
        key: 'drawGraph',
        value: function drawGraph() {
            var _this = this;

            var self = this;
            var svg = this.dom(this.stageId);

            // Nodesを反映
            var nodes = svg.selectAll('.node').data(this.nodes).enter().append('g').attr('class', 'node').call(this.force.drag);
            svg.selectAll('.node').data(this.nodes).exit().remove();

            // Node.Circlesを反映
            var circle = node.append('circle').attr('r', function (d) {
                return _this.getRadiusByNodeType(d.type);
            }).attr('id', function (d) {
                return d.id;
            }).style('fill', function (d) {
                return _this.getFillColorByNodeType(d.type);
            }).on('mouseover', function (d) {
                d3.select(this).transition().duration(200).style('r', function (d) {
                    return self.getRadiusByNodeType(d.type) + 4;
                });
                self.circleMouseOver(d);
            }).on('mouseout', function (d) {
                d3.select(this).transition().duration(1000).style('r', function (d) {
                    return self.getRadiusByNodeType(d.type);
                });
                self.circleMouseOut(d);
            }).on('dbclick', function (d) {
                self.expandNode(d);
            });

            // Labelsを反映
            var text = node.append('text').attr('dx', 12).attr('dy', 35).text(function (d) {
                return _this.getTitleByNode(d);
            }).style('stroke', '#9e9e9e').on('click', function (d) {
                self.updatePhotoGallery(d);
            }).on('dbclick', function (d) {
                if (d.open === undefined || d.open === false) {
                    self.expandNode(d);
                } else {
                    self.closeNode(d);
                }
            });

            // Linksを反映
            var edge = svg.selectAll('.link').data(this.links).enter().append('lien').attr('class', 'link').style('stroke', function (d) {
                return _this.getEdgeColorByTargetNodeType(d.target.type);
            }).style('stroke-width', function (d) {
                if (d.value !== undefined) return d.value;
                return 1;
            });

            svg.selectAll('link').data(this.links).exit().remove();

            this.force.start();
        }

        // 未登録であれば，与えられたノードを追加する
        // 第二引数が true であれば，グラフを更新する
    }, {
        key: 'addNode',
        value: function addNode(node, redraw) {
            if (redraw === undefined) redraw = false;
            this.nodes.push(node);
            if (redraw) {
                this.drawGraph();
            }
            return this.nodes.length - 1;
        }

        // 未登録であれば，与えられたリンクを追加する
    }, {
        key: 'addLink',
        value: function addLink(srcNode, targetNode, redraw) {
            this.links.push({ source: srcNode, target: targetNode });
        }

        // 与えられたIDを持つノードを削除する
        // 第二引数が true であれば，グラフを更新する
    }, {
        key: 'removeNodeById',
        value: function removeNodeById(id, redraw) {}

        // 与えられたIDを持つリンクを削除する
    }, {
        key: 'removeLinkById',
        value: function removeLinkById(id, redraw) {}

        // canvasサイズを設定する
    }, {
        key: 'setGraphSize',
        value: function setGraphSize() {
            var width = window.innerWidth - this.widthPhotoGallery;
            var height = window.innerHeight;
            this.dom(this.stageId).setAttribute('width', width + 'px');
            this.dom(this.stageId).setAttribute('height', height + 'px');
            this.dom('gallery').style.height = height + 'px';
            this.force.size([width, height]);
        }

        // windowに関するイベントリスナ
    }, {
        key: 'bindWindowEvents',
        value: function bindWindowEvents() {
            var _this2 = this;

            // ウィンドウのサイズが変更されたとき，canvasのサイズを再設定する
            window.addEventListener('resize', function (e) {
                _this2.setGraphSize();
            }, false);

            // * canvas上でクリックされた場合は，虫眼鏡ビューを非表示にする
            // * ギャラリー上の写真がクリックされた場合は，カスタムイベントを発行する
            window.addEventListener('click', function (e) {
                var id = e.target.id;
                var cn = e.target.className;
                if (id === _this2.stageId) {
                    _this2.hide('preview');
                    _this2.hide('preview_title');
                } else if (cn === 'gphoto') {
                    _this2.galleryPhotoClick(e);
                }
            }, false);

            // ギャラリーのフォトをホバー時に虫眼鏡ビューの内容を更新する
            window.addEventListener('mouseover', function (e) {
                var cn = e.target.className;
                if (cn === 'gphoto') {
                    var nodeId = e.target.photo_id;
                    var node = _this2.getNodeById(nodeId);
                    var x = node.x + 120;
                    var y = node.y;
                    _this2.top('preview', y);
                    _this2.left('preview', x);
                    _this2.top('preview_title', y + 55);
                    _this2.left('preview_title', x + 2);
                    // 虫眼鏡のフォトとして，src属性を参照する
                    _this2.bgImg('preview', e.target.src);
                    _this2.show('preview');
                    _this2.dom('preview_title').innerHTML = node.title;
                    _this2.show('preview_title');
                }
            }, false);

            // フォトギャラリー上以外の場所でマウスストーカーする
            window.addEventListener('mousemove', function (e) {
                var cn = e.target.className;
                if (cn === 'gphoto') {
                    var x = e.clientX + 10;
                    var y = e.clientY - 42;
                    _this2.top('preview', y);
                    _this2.left('preview', x);
                    _this2.top('preview_title', y + 55);
                    _this2.left('preview_title', x + 2);
                }
            }, false);

            /*
            window.addEventListener('load', e => {
                this.appLoad(e);
                drawGraph();
            });
            */
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

        // IDを指定してnodeを取得
    }, {
        key: 'getNodeById',
        value: function getNodeById(nodeId) {
            var nodes = this.nodes;
            return nodes.filter(function (node) {
                return node.id === nodeId;
            })[0];
        }
    }, {
        key: 'getNodeIdxById',
        value: function getNodeIdxById(nodeId) {
            var nodes = this.nodes;
            for (var i = 0; i < nodes.length; i++) {
                var node = nodes[i];
                if (node.id == nodeId) return i;
            }
        }

        // DOM操作関連
    }, {
        key: 'dom',
        value: function dom(id) {
            return document.getElementById(id);
        }
    }, {
        key: 'hide',
        value: function hide(id) {
            this.dom(id).style.display = 'none';
        }
    }, {
        key: 'show',
        value: function show(id) {
            this.dom(id).style.display = 'block';
        }
    }, {
        key: 'top',
        value: function top(id, num) {
            this.dom(id).style.top = num + 'px';
        }
    }, {
        key: 'left',
        value: function left(id, num) {
            this.dom(id).style.left = num + 'px';
        }
    }, {
        key: 'bgImg',
        value: function bgImg(id, src) {
            this.dom(id).style.backgroundImage = 'url(' + src + ')';
        }

        /* 以下のメソッドは，適宜Overrideして定義する */
    }, {
        key: 'getEdgeColorByTargetNodeType',
        value: function getEdgeColorByTargetNodeType(type) {
            return '#ddd';
        }
    }, {
        key: 'getRadiusByNodeType',
        value: function getRadiusByNodeType(type) {
            return 6;
        }
    }, {
        key: 'getFillColorByNodeType',
        value: function getFillColorByNodeType(type) {
            return '#ff9933';
        }
    }, {
        key: 'getTitleByNode',
        value: function getTitleByNode(node) {
            return node.title;
        }
    }, {
        key: 'circleMouseOver',
        value: function circleMouseOver(node) {}
    }, {
        key: 'circleMouseOut',
        value: function circleMouseOut(node) {}

        // 与えられたノードを展開する
    }, {
        key: 'expandNode',
        value: function expandNode(node) {}
    }, {
        key: 'updatePhotoGallery',
        value: function updatePhotoGallery(node) {}
    }, {
        key: 'galleryPhotoClick',
        value: function galleryPhotoClick(ev) {}
    }, {
        key: 'appLoad',
        value: function appLoad(ev) {}
    }]);

    return LayoutForce;
})();

