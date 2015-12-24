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
        this.links = nodes || [];
        this.initGraph();

        this.bindWindowEvents();
    }

    // 与えられたIDのノードを展開する
    // 第二引数が true であれば，グラフを更新して子要素を表示する
    expandNode (id) {

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

    renderGraph () {

    }

    // 未登録であれば，与えられたノードを追加する
    // 第二引数が true であれば，グラフを更新する
    addNode (node, redraw) {

    }

    // 未登録であれば，与えられたリンクを追加する
    addLink (link, redraw) {

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
        var width = util.w - this.widthPhotoGallery;
        var height = util.h;
        this.dom(this.stageId).setAttribute(width, width + 'px');
        this.dom(this.stageId).setAttribute(height, height + 'px');
        this.dom('gallery').style.height = height + 'px';
        this.force.size([width, height]);
    }

    // windowに関するイベントリスナ
    bindWindowEvents () {
        // ウィンドウのサイズが変更されたとき，canvasのサイズを再設定する
        window.addEventListener('resize', e => {
            this.setGraphSize();
        }, false);

        // * canvas上でクリックされた場合は，虫眼鏡を非表示にする
        // * ギャラリー上の写真がクリックされた場合は，カスタムイベントを発行する
        window.addEventListener('click', e => {
            var id = e.target.id;
            var cn = e.target.className;
            if (id === this.stageId) {
                none('preview');
                none('preview_title');
            }
        }, false);


    }

    // グラフに関するイベントリスナ
    bindGraphEvents () {
        var svg = this.dom(this.stageId);
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
}
