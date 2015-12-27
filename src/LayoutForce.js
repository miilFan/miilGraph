/* サイドフォトギャラリー付きForceレイアウトd3jsグラフ */
class LayoutForce {
    constructor (stage_id, nodes, links) {
        this.stageId = stage_id;

        /* フォトギャラリーの設定 */
        this.widthPhotoGallery = 130;

        /* forceレイアウトの設定 */
        this.force = null;
        this.color = d3.scale.category20();
        this.charge = -450;
        this.linkDistance = 100;
        this.nodes = nodes || [];
        this.links = links || [];
        this.initGraph();

        this.bindWindowEvents();
    }

    // 与えられたIDのノードの子要素を除去する
    closeNode (id) {

    }

    initGraph () {
        // 虫眼鏡UIに必要な要素を挿入する
        // グラフを初期化する
        this.force = d3.layout.force()
            .charge(this.charge)
            .linkDistance(this.linkDistance);
        this.setGraphSize();
        this.linkingData();
        this.bindGraphEvents();
    }

    // グラフにデータを関連付ける
    linkingData () {
        this.force.nodes(this.nodes).links(this.links);
    }

    drawGraph () {
        var self = this;
        var svg = d3.select('#' + this.stageId);

        // Linksを反映
        var edge = svg.selectAll('.link').data(this.links).enter()
            .append('line')
            .attr('class', 'link')
            .style('stroke', d => {
                return this.getEdgeColorByTargetNodeType(d.target.type);
            })
            .style('stroke-width', d => {
                if (d.value !== undefined) return d.value;
                return 1;
            });
        svg.selectAll('link').data(this.links).exit().remove();

        // Nodesを反映
        var node = svg.selectAll('.node').data(this.nodes).enter()
            .append('g')
            .attr('class', 'node')
            .call(this.force.drag);
        svg.selectAll('.node').data(this.nodes).exit().remove();

        // Node.Circlesを反映
        var circle = node.append('circle')
            .attr('r', d => {
                return this.getRadiusByNodeType(d.type);
            })
            .attr('id', d => {return d.id;})
            .style('fill', d => {
                return this.getFillColorByNodeType(d.type);
            })
            .on('mouseover', function (d) {
                d3.select(this).transition().duration(200).style('r', function (d) {
                    return self.getRadiusByNodeType(d.type) + 4;
                });
                self.circleMouseOver(d);
            })
            .on('mouseout',function (d) {
                d3.select(this).transition().duration(1000).style('r', function (d) {
                    return self.getRadiusByNodeType(d.type)
                });
                self.circleMouseOut(d);
            })
            .on('dblclick', function (d) {
                self.expandNode(d)
            });

        // Labelsを反映
        var text = node.append('text')
            .attr('dx', '12px')
            .attr('dy', '.35px')
            .text(d => {return this.getTitleByNode(d);})
            .style('stroke', '#9e9e9e')
            .on('click', function (d) {
                self.updatePhotoGallery(d);
            })
            .on('dblclick', function (d) {
                if (d.open === undefined || d.open === false) {
                    self.expandNode(d);
                }else {
                    self.closeNode(d);
                }
            });

        this.force.start();
    }

    // 未登録であれば，与えられたノードを追加する
    // 第二引数が true であれば，グラフを更新する
    addNode (node, redraw) {
        if (redraw === undefined) redraw = false;
        this.nodes.push(node);
        if (redraw) {
            this.drawGraph();
        }
        return this.nodes.length - 1;
    }

    // 未登録であれば，与えられたリンクを追加する
    addLink (srcNode, targetNode, redraw) {
        this.links.push({source: srcNode, target: targetNode});
    }

    // 与えられたIDを持つノードを削除する
    // 第二引数が true であれば，グラフを更新する
    removeNodeById (id, redraw) {

    }

    // 与えられたIDを持つリンクを削除する
    removeLinkById (id, redraw) {

    }

    // canvasサイズを設定する
    setGraphSize () {
        var width = window.innerWidth - this.widthPhotoGallery;
        var height = window.innerHeight;
        this.dom(this.stageId).setAttribute('width', width + 'px');
        this.dom(this.stageId).setAttribute('height', height + 'px');
        this.dom('gallery').style.height = height + 'px';
        this.force.size([width, height]);
    }

    // windowに関するイベントリスナ
    bindWindowEvents () {
        // ウィンドウのサイズが変更されたとき，canvasのサイズを再設定する
        window.addEventListener('resize', e => {
            this.setGraphSize();
        }, false);

        // * canvas上でクリックされた場合は，虫眼鏡ビューを非表示にする
        // * ギャラリー上の写真がクリックされた場合は，カスタムイベントを発行する
        window.addEventListener('click', e => {
            var id = e.target.id;
            var cn = e.target.className;
            if (id === this.stageId) {
                this.hide('preview');
                this.hide('preview_title');
            }else if (cn === 'gphoto') {
                this.galleryPhotoClick(e);
            }
        }, false);

        // ギャラリーのフォトをホバー時に虫眼鏡ビューの内容を更新する
        window.addEventListener('mouseover', e => {
            var cn = e.target.className;
            if (cn ===  'gphoto') {
                var nodeId = e.target.photo_id;
                var node = this.getNodeById(nodeId);
                var x = node.x + 120;
                var y = node.y;
                this.top('preview', y);
                this.left('preview', x);
                this.top('preview_title', y + 55);
                this.left('preview_title', x + 2);
                // 虫眼鏡のフォトとして，src属性を参照する
                this.bgImg('preview', e.target.src);
                this.show('preview');
                this.dom('preview_title').innerHTML = node.title;
                this.show('preview_title');
            }
        }, false);

        // フォトギャラリー上以外の場所でマウスストーカーする
        window.addEventListener('mousemove', e => {
            var cn = e.target.className;
            if (cn === 'gphoto') {
                var x = e.clientX + 10;
                var y = e.clientY - 42;
                this.top('preview', y);
                this.left('preview', x);
                this.top('preview_title', y + 55);
                this.left('preview_title', x + 2);
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
    bindGraphEvents () {
        var svg = d3.select('#' + this.stageId);
        this.force.on('tick', function() {
            svg.selectAll('.link')
                .attr('x1', function (d) {return d.source.x;})
                .attr('y1', function (d) {return d.source.y;})
                .attr('x2', function (d) {return d.target.x;})
                .attr('y2', function (d) {return d.target.y;});

            svg.selectAll('circle')
                .attr('cx', function (d) {return d.x;})
                .attr('cy', function (d) {return d.y;});
            svg.selectAll('text')
                .attr('x', function (d) {return d.x;})
                .attr('y', function (d) {return d.y;});
        });
    }

    // IDを指定してnodeを取得
    getNodeById (nodeId) {
        var nodes = this.nodes;
        return nodes.filter(node => {
            return node.id === nodeId;
        })[0];
    }

    getNodeIdxById (nodeId) {
        var nodes = this.nodes;
        for (var i = 0; i < nodes.length; i++) {
            var node = nodes[i];
            if (node.id == nodeId) return i;
        }
    }

    // DOM操作関連
    dom (id) {
        return document.getElementById(id);
    }

    hide (id) {
        this.dom(id).style.display = 'none';
    }

    show (id) {
        this.dom(id).style.display = 'block';
    }

    top (id, num) {
        this.dom(id).style.top = num + 'px';
    }

    left (id, num) {
        this.dom(id).style.left = num + 'px';
    }

    bgImg (id, src) {
        this.dom(id).style.backgroundImage = 'url('+ src +')';
    }


    /* 以下のメソッドは，適宜Overrideして定義する */
    getEdgeColorByTargetNodeType (type) {
        return '#ddd';
    }

    getRadiusByNodeType (type) {
        return 6;
    }

    getFillColorByNodeType (type) {
        return '#ff9933';
    }

    getTitleByNode (node) {
        return node.title;
    }

    circleMouseOver (node) {
    }

    circleMouseOut (node) {
    }

    // 与えられたノードを展開する
    expandNode (node) {
    }

    updatePhotoGallery (node) {
    }

    galleryPhotoClick (ev) {
    }

    appLoad (ev) {
    }
}
