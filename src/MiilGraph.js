class MiilGraph extends LayoutForce {
    // ミイルAPIを呼ぶためのURLを構成する
    getMiilApiUrl (baseURL, seriesURL, padding) {
        if (padding !== undefined) {
            if (seriesURL !== undefined) {
                baseURL = seriesURL.replace('&limit=10', '').replace('.json', '');
                padding = '&' + padding;
            }else {
                padding = '?' + padding;
            }
        }else {
            padding = '';
        }
        var apiURL = baseURL + padding;
        console.warn(apiURL);
        return apiURL;
    }

    labelShortener (title, words) {
        words.forEach(word => {
            title = title.replace(word, '');
        })
        return title;
    }

    // カテゴリリストを展開する
    parseMiilCategories (category, miilRootIdxs) {
        var me = {
            id: category.category_id,
            title: category.name,
            type: 'category'
        };
        miilRootIdxs.forEach(rootNode => {
            this.addLink(rootNode, this.addNode(me), false);
        });
    }

    // サブカテゴリリストを展開する
    parseMiilSubCategories (categoryId) {
        miil_categories.forEach(cate => {
            if (cate.category_id === categoryId) {
                var subCates = cate.categories;
                subCates.forEach(subcate => {
                    var me = {
                        title: this.labelShortener(subcate.name, ['手料理：', '（その他）', '【特集】']),
                        id: subcate.category_id,
                        type: 'subcategory'
                    }
                    this.addNode(me);
                    var parent = this.getNodeById(categoryId);
                    this.addLink(parent, me, false);
                })
            }
        });
        this.drawGraph();
    }

    // ごちそう写真を展開する
    parseMiilPhotos (callback_res, queryType, self) {
        var photos  = callback_res.photos;
        var nextUrl = callback_res.next_url;
        var pid;
        if (queryType === 'subcategory') {
            pid = 'category_id';
            nextUrl = nextUrl.replace('.?', '.json?');
        }else {
            pid = 'user_id';
            nextUrl = nextUrl.replace('.?', '.json?').split('&')[0];
        }

        photos.forEach(photo_json => {
            var parentNodeId = photo_json[pid];
            var me = {
                id: photo_json.id,
                title: photo_json.title,
                type: 'photo',
                photo_url: photo_json.url,
                page_url: photo_json.page_url,
                group: parentNodeId
            }
            self.addNode(me);
            var parent = self.getNodeById(parentNodeId);
            parent.nextUrl = nextUrl;
            self.addLink(parent, me, false);
        });

        self.drawGraph();
    }

    parseMiilPhotosInUser (callback_res) {
        m.parseMiilPhotos(callback_res, 'user', m);
    }

    parseMiilPhotosInSubCate (callback_res) {
        // TODO: `m`を使わない場合どうすれば良いのかわからない
        m.parseMiilPhotos(callback_res, 'subcategory', m);
    }

    // @Override
    getFillColorByNodeType (type) {
        if (type === 'user' || type === 'root') return '#F4433C';
        if (type === 'category' || type === 'subcategory') return '#1F77B4';
        return '#ff9933';
    }

    // @Override
    appLoad () {
        miil_categories.forEach(cate => {
            if (cate.category_id !== 588 && cate.category_id !== 589) {
                this.parseMiilCategories(cate, [this.getNodeIdxById('miilroot')]);
            }
        });
        this.drawGraph();
    }

    // @Override
    expandNode (node) {
        var id = node.id;
        var type = node.type;

        if (type === 'category') {
            // サブカテゴリを展開する
            this.parseMiilSubCategories(id);
        }else if (type === 'subcategory') {
            // サブカテゴリに属するコンテンツを展開する
            var baseApi = 'http://api.miil.me/api/photos/recent/categories/' + node.id;
            var api = this.getMiilApiUrl(baseApi, node.nextUrl, 'callback=ps');
            d3.jsonp(api, null);
        }else if (type === 'user') {
            var userName = node.title;
            var baseApi = 'http://api.miil.me/api/users/'+ userName +'/photos/public';
            var api = this.getMiilApiUrl(baseApi, node.nextUrl, 'callback=pu');
            d3.jsonp(api, null);
        }
    }


    // @Override
    getRadiusByNodeType (type) {
        if (type === 'user' || type === 'root') return 6;
        if (type === 'category' || type === 'subcategory') return 5;
        return 6;
    }

    // @Override
    getEdgeColorByType (type) {
        if (type === 'subcategory') return '#C5CAE9';
        return '#ddd';
    }

    // @Override
    getTitleByNode (node) {
        if (node.type !== 'photo') return node.title;
        return '';
    }

    // @Override
    circleMouseOver (node) {
        if (node.photo_url !== undefined) {
            this.bgImg('preview', node.photo_url);
            this.show('preview');
            this.dom('preview_title').innerHTML = node.title;
            this.show('preview_title');
        }else {
            this.hide('preview');
            this.hide('preview_title');
        }
    }

    // @Override
    updatePhotoGallery (node) {
        if (node.type !== 'subcategory' && node.type !== 'user') return;
        var photos = [];
        var edges = this.getLinksAll();
        // ノードの子要素である写真を得る
        edges.forEach(function (edge) {
            if (edge.source.id === node.id) {
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

    // @Override
    galleryPhotoClick (e) {
        window.open(e.target.dataset.page_url);
    }
}
