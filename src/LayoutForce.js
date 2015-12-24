class LayoutForce {
    constructor (stage_id, nodes, links) {
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

    dom (id) {
        return document.getElementById(id);
    }

    expandNode (node_id) {

    }

    closeNode (node_id) {

    }

    initGraph () {
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
        window.addEventListener('resize', e => {
            this.setGraphSize();
        });
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
}
