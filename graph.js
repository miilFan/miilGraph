var miil_categories = categories;

var labelShortener = function (title, words) {
    words.forEach(function (word) {
        title = title.replace(word, '');
    })
    return title;
}
var parseMiilSubCategories = function (parentId) {
    miil_categories.forEach(function (cate) {
        if (cate.category_id === parentId) {
            subCates = cate.categories;
            subCates.forEach(function (subcate) {
                var me = {
                    title: labelShortener(subcate.name, ['手料理：', '（その他）', '【特集】']),
                    id: subcate.category_id,
                    type: 'subcategory'
                }
                json.nodes.push(me);
                var parent = json.nodes.filter(function (n) { return n.id === parentId; })[0];
                var e = {source: parent , target: me};
                json.edges.push(e);
            })
        }
    });
    render();
}

var parseMiilDeliciousUserPhotos  = function (res) {
    var photos = res.photos;
    var nextUrl = res.next_url;

    photos.forEach(function (photo_json) {
        parentId = photo_json.user_id;
        var me = {
            title: photo_json.title,
            id: photo_json.id,
            type: 'photo',
            photo_url: photo_json.url,
            page_url: photo_json.page_url,
            group: parentId
        }
        json.nodes.push(me);
        var parent = json.nodes.filter(function (n) { return n.id == parentId; })[0];
        parent.nextUrl = nextUrl.replace('.?', '.json?').split('&')[0];
        console.warn(parent.nextUrl)
        var e = {source: parent , target: me};
        json.edges.push(e);
    });
    render();
}


var parseMiilDeliciousPhotos = function (res) {
    var photos = res.photos;
    var nextUrl = res.next_url;

    photos.forEach(function (photo_json) {
        parentId = photo_json.category_id;
        var me = {
            title: photo_json.title,
            id: photo_json.id,
            type: 'photo',
            photo_url: photo_json.url,
            page_url: photo_json.page_url,
            group: parentId
        }
        json.nodes.push(me);
        var parent = json.nodes.filter(function (n) { return n.id === parentId; })[0];
        parent.nextUrl = nextUrl.replace('.?', '.json?');
        console.warn(parent.nextUrl)
        var e = {source: parent , target: me};
        json.edges.push(e);
    });
    render();
}

var parseMiilCategories = function (j, parentIdxs) {
    var me = {
        title: j.name,
        id: j.category_id,
        type: 'category'
    }
    me = addNode(me);

    parentIdxs.forEach(function (p) {
        addEdge(p, me)
    });
}


var json = {
    nodes: [
        {
            id: '130727',
            type: 'user',
            photo_url: "daiz.jpg",
            title: "daiz"
        },
        {
            id: '29600',
            type: 'user',
            photo_url: "miil.jpg",
            title: "miilme"
        },
        {
            type: 'root',
            photo_url: "miilicon.png",
            title: "miil.me",
            id: 'miilroot'
        }
    ],

    edges: [
        {source: 2, target: 0},
        {source: 2, target: 1}
    ]
}

var updateGallery = function (d) {
    var photos = [];
    var edges = json.edges;
    // ノードの子要素である写真を得る
    edges.forEach(function (edge) {
        if (edge.source.id === d.id) {
            photos.push({
                photo_url: edge.target.photo_url,
                page_url: edge.target.page_url,
                id: edge.target.id
            });
        }
    });
    // 写真をギャラリーに表示する
    var gallery = document.querySelector('#gallery');
    gallery.innerHTML = '';
    photos.forEach(function (photo) {
        var img = document.createElement('img');
        img.className = 'gphoto';
        img.src = photo.photo_url;
        img.dataset.page_url = photo.page_url;
        img.dataset.photo_id = photo.id;
        gallery.appendChild(img);
    });
}

var getRbyType = function (type) {
    if (type === 'user' || type === 'root') return 6;
    if (type === 'category' || type === 'subcategory') return 5;
    return 6;
}

var getFillColorByType = function (type) {
    if (type === 'user' || type === 'root') return '#F4433C'
    if (type === 'category' || type === 'subcategory') return '#1F77B4'
    return '#ff9933';
}

var getEdgeColorByType = function (type) {
    if (type === 'subcategory') return '#C5CAE9';//'#AEC7E8';//'#C5CAE9';//'#9FC6E7'
    return '#ddd';
}

var getTitle = function (d) {
    if (d.type !== 'photo') return d.title;
    return '';
}

var setStageSize = function () {
    var ww = window.innerWidth - 130;
    var wh = window.innerHeight;
    document.querySelector('#stage').setAttribute('width', ww + 'px');
    document.querySelector('#stage').setAttribute('height', wh + 'px');
    document.querySelector('#gallery').style.height = wh + 'px';
    force.size([ww, wh]);
}

// 配列json.nodesのインデックスを返す
var addNode = function (d) {
    // TODO: d.idが未定義の場合は自動で付与する
    json.nodes.push(d);
    return json.nodes.length - 1;
}

var addEdgeById = function (src, target) {
    var s = json.nodes.filter(function(n) { return n.id === src; })[0];
    var t = json.nodes.filter(function(n) { return n.id === target; })[0];
    var e = {source: s, target: t};
    json.edges.push(e);
    render();
}
var addEdge = function (src, target) {
    json.edges.push({source: src, target: target});
}

var getIdxByNodeId = function (id) {
    var nodes = json.nodes;
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        if (node.id == id) return i;
    }
}

var extendNode = function (d) {
    var id = d.id;
    if (d.type === 'category') {
        parseMiilSubCategories(id);
    }else if (d.type == 'subcategory') {
        var api ='http://miil.me/api/photos/recent/categories/' + d.id + '?callback=parseMiilDeliciousPhotos';
        if (d.nextUrl !== undefined) {
            api = d.nextUrl.replace('&limit=10', '').replace('.json', '')
            api = api + '&callback=parseMiilDeliciousPhotos'
            console.info(api)
        }
        d3.jsonp(api, function() {
            console.log(arguments);
        });
    }else if (d.type === 'user') {
        var userName = d.title;
        var api = 'http://api.miil.me/api/users/'+ userName +'/photos/public' + '?callback=parseMiilDeliciousUserPhotos';
        if (d.nextUrl !== undefined) {
            api = d.nextUrl.replace('&limit=10', '').replace('.json', '')
            api = api + '&callback=parseMiilDeliciousUserPhotos'
            console.info(api)
        }
        d3.jsonp(api, function() {
            console.log(arguments);
        });
    }
}


var color = d3.scale.category20();
var w = window.innerWidth, h = innerHeight;

var force = d3.layout.force()
    .charge(-450)
    .linkDistance(100)
    .size([w, h]);

var svg = d3.select('#stage');

force.nodes(json.nodes).links(json.edges);

force.on('tick', function() {
    svg.selectAll('.link').attr('x1', function(d) { return d.source.x; })
        .attr('y1', function(d) { return d.source.y; })
        .attr('x2', function(d) { return d.target.x; })
        .attr('y2', function(d) { return d.target.y; });

    svg.selectAll('circle').attr('cx', function(d) { return d.x; })
          .attr('cy', function(d) { return d.y; });
    svg.selectAll('text').attr('x', function(d) { return d.x; })
        .attr('y', function(d) { return d.y; });
});

var render = function () {
    var svg = d3.select('#stage');
    var edge = svg.selectAll('.link').data(json.edges).enter()
        .append('line')
        .attr('class', 'link')
        .style('stroke-width', function (d) {
            if (d.value !== undefined) {
                return d.value
            }
            return 1
        })
        .style('stroke', function (d) {
            return getEdgeColorByType(d.target.type);
        });
    svg.selectAll('.link').data(json.edges).exit().remove();

    var node = svg.selectAll('.node').data(json.nodes).enter()
        .append('g')
        .attr('class', 'node')
        .call(force.drag);
    svg.selectAll('.node').data(json.nodes).exit().remove();

    var circle = node.append('circle')
        .attr('r', function (d) {
            return getRbyType(d.type);
        })
        .attr('id', function (d) {
            return d.id
        })
        .style('fill', function (d) {
            return getFillColorByType(d.type);
        })
        .on('mouseover', function (d) {
            d3.select(this).transition().duration(200).style('r', function (d) {
                return getRbyType(d.type) + 4
            });
            if (d.photo_url !== undefined) {
                document.querySelector('#preview').style.display = 'block';
                document.querySelector('#preview').style.backgroundImage = 'url('+ d.photo_url +')';
                document.querySelector('#preview_title').style.display = 'block';
                document.querySelector('#preview_title').innerHTML = d.title;
            }else {
                document.querySelector('#preview').style.display = 'none';
                document.querySelector('#preview_title').style.display = 'none';
            }
        })
        .on('mouseout', function (d) {
            d3.select(this).transition().duration(1000).style('r', function (d) {
                return getRbyType(d.type)
            });
        })
        .on('dblclick', function (d) {
            extendNode(d)
        });

    var text = node.append('text')
        .attr('dx', function (d) {
            return 12;
        })
        .attr('dy', '.35px')
        .text(function(d) {
            return getTitle(d);
        })
        .style('stroke', '#9e9e9e')
        .on('dblclick', function (d) {
            extendNode(d)
        })
        .on('click', function (d) {
            if (d.type === 'subcategory' || d.type === 'user') {
                updateGallery(d);
            }
        })

    force.start();
}

////////////////////////////////////////////////////////////////////////////////////////////////////

window.addEventListener('resize', setStageSize, false);

window.addEventListener('click', function (e) {
    var id = e.target.id;
    var cn = e.target.className;
    if (id === 'stage') {
        document.querySelector('#preview').style.display = 'none';
        document.querySelector('#preview_title').style.display = 'none';
    }else if (cn === 'gphoto') {
        window.open(e.target.dataset.page_url);
    }
});

window.addEventListener('mouseover', function (e) {
    var elm = e.target;
    var cn = elm.className;
    if (cn === 'gphoto') {
        var nodeId = elm.dataset.photo_id;
        var node = json.nodes[getIdxByNodeId(nodeId)];
        var x = node.x;
        var y = node.y;
        document.querySelector('#preview').style.top = y + 'px';
        document.querySelector('#preview').style.left = x + 'px';
        document.querySelector('#preview_title').style.top = (y + 55) + 'px';
        document.querySelector('#preview_title').style.left = (x + 2) + 'px';
        document.querySelector('#preview').style.backgroundImage = 'url('+ elm.src +')';
        document.querySelector('#preview').style.display = 'block';
        document.querySelector('#preview_title').innerHTML = node.title;
        document.querySelector('#preview_title').style.display = 'block';
    }
})

window.addEventListener('mousemove', function (e) {
    // ギャラリー上以外でマウスストーカーする
    if (e.target.className !== 'gphoto') {
        var x = e.clientX + 10;
        var y = e.clientY - 42;
        document.querySelector('#preview').style.top = y + 'px';
        document.querySelector('#preview').style.left = x + 'px';
        document.querySelector('#preview_title').style.top = (y + 55) + 'px';
        document.querySelector('#preview_title').style.left = (x + 2) + 'px';
    }
}, false);

window.addEventListener('load', function () {
    setStageSize();

    miil_categories.forEach(function (cate) {
        if (cate.category_id !== 588 && cate.category_id !== 589) {
            parseMiilCategories(cate, [getIdxByNodeId('miilroot')]);
        }
    })
    //parseMiilSubCategories(153);
    render();
}, false);
