'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MiilGraph = (function (_LayoutForce) {
    _inherits(MiilGraph, _LayoutForce);

    function MiilGraph() {
        _classCallCheck(this, MiilGraph);

        _get(Object.getPrototypeOf(MiilGraph.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(MiilGraph, [{
        key: 'getMiilApiUrl',

        // ミイルAPIを呼ぶためのURLを構成する
        value: function getMiilApiUrl(baseURL, seriesURL, padding) {
            if (padding !== undefined) {
                if (seriesURL !== undefined) {
                    seriesURL = seriesURL.replace(/^http\:/, 'https:');
                    baseURL = seriesURL.replace('&limit=10', '').replace('.json', '');
                    padding = '&' + padding;
                } else {
                    padding = '?' + padding;
                }
            } else {
                padding = '';
            }
            var apiURL = baseURL + padding;
            console.warn(apiURL);
            return apiURL;
        }
    }, {
        key: 'labelShortener',
        value: function labelShortener(title, words) {
            words.forEach(function (word) {
                title = title.replace(word, '');
            });
            return title;
        }

        // カテゴリリストを展開する
    }, {
        key: 'parseMiilCategories',
        value: function parseMiilCategories(category, miilRootIdxs) {
            var _this = this;

            var me = {
                id: category.category_id,
                title: category.name,
                type: 'category'
            };
            miilRootIdxs.forEach(function (rootNode) {
                _this.addLink(rootNode, _this.addNode(me), false);
            });
        }

        // サブカテゴリリストを展開する
    }, {
        key: 'parseMiilSubCategories',
        value: function parseMiilSubCategories(categoryId) {
            var _this2 = this;

            miil_categories.forEach(function (cate) {
                if (cate.category_id === categoryId) {
                    var subCates = cate.categories;
                    subCates.forEach(function (subcate) {
                        var me = {
                            title: _this2.labelShortener(subcate.name, ['手料理：', '（その他）', '【特集】']),
                            id: subcate.category_id,
                            type: 'subcategory',
                            open: false
                        };
                        _this2.addNode(me);
                        var parent = _this2.getNodeById(categoryId);
                        _this2.addLink(parent, me, false);
                    });
                }
            });
            this.drawGraph();
        }

        // ごちそう写真を展開する
    }, {
        key: 'parseMiilPhotos',
        value: function parseMiilPhotos(callback_res, queryType, self) {
            var photos = callback_res.photos;
            var nextUrl = callback_res.next_url;
            var pid;
            if (queryType === 'subcategory') {
                pid = 'category_id';
                nextUrl = nextUrl.replace('.?', '.json?');
            } else {
                pid = 'user_id';
                nextUrl = nextUrl.replace('.?', '.json?').split('&')[0];
            }

            photos.forEach(function (photo_json) {
                var parentNodeId = photo_json[pid];
                var me = {
                    pid: parentNodeId,
                    id: photo_json.id,
                    title: photo_json.title,
                    type: 'photo',
                    photo_url: photo_json.url,
                    page_url: photo_json.page_url,
                    group: parentNodeId,
                    visible: true
                };
                self.addNode(me);
                var parent = self.getNodeById(parentNodeId);
                parent.nextUrl = nextUrl;
                self.addLink(parent, me, false);
            });

            self.drawGraph();
        }
    }, {
        key: 'parseMiilPhotosInUser',
        value: function parseMiilPhotosInUser(callback_res) {
            m.parseMiilPhotos(callback_res, 'user', m);
        }
    }, {
        key: 'parseMiilPhotosInSubCate',
        value: function parseMiilPhotosInSubCate(callback_res) {
            // TODO: `m`を使わない場合どうすれば良いのかわからない
            m.parseMiilPhotos(callback_res, 'subcategory', m);
        }
    }, {
        key: 'closeNodeExceptNodeId',
        value: function closeNodeExceptNodeId(id) {
            var _this3 = this;

            var nodes = this.getNodesAll();
            nodes.forEach(function (node) {
                if (node.type === 'photo' && node.pid != id) {
                    console.info(node.pid);
                    _this3.updateNodeValuesById(node.id, { visible: false });
                } else if (node.type === 'photo' && node.pid == id) {
                    _this3.updateNodeValuesById(node.id, { visible: true });
                }
            });
        }

        // @Override
    }, {
        key: 'getFillColorByNodeType',
        value: function getFillColorByNodeType(type) {
            if (type === 'user' || type === 'root') return '#F4433C';
            if (type === 'category' || type === 'subcategory') return '#1F77B4';
            return '#ff9933';
        }

        // @Override
    }, {
        key: 'appLoad',
        value: function appLoad() {
            var _this4 = this;

            miil_categories.forEach(function (cate) {
                if (cate.category_id !== 588 && cate.category_id !== 589) {
                    _this4.parseMiilCategories(cate, [_this4.getNodeIdxById('miilroot')]);
                }
            });
            this.drawGraph();
        }

        // @Override
    }, {
        key: 'expandNode',
        value: function expandNode(node) {
            var id = node.id;
            var type = node.type;

            if (type === 'category') {
                // ノードの展開情報を展開済みに更新する
                this.updateNodeValuesById(id, { open: true });
                // サブカテゴリを展開する
                this.parseMiilSubCategories(id);
                console.info(node);
            } else if (type === 'subcategory') {
                // 自身以外のサブカテゴリに属するコンテンツを非表示にする
                this.closeNodeExceptNodeId(id);
                // サブカテゴリに属するコンテンツを展開する
                var baseApi = 'https://api.miil.me/api/photos/recent/categories/' + node.id;
                var api = this.getMiilApiUrl(baseApi, node.nextUrl, 'callback=ps');
                d3.jsonp(api, null);
            } else if (type === 'user') {
                this.closeNodeExceptNodeId(id);
                var userName = node.title;
                var baseApi = 'https://api.miil.me/api/users/' + userName + '/photos/public';
                var api = this.getMiilApiUrl(baseApi, node.nextUrl, 'callback=pu');
                d3.jsonp(api, null);
            }
        }

        // @Override
    }, {
        key: 'getRadiusByNodeType',
        value: function getRadiusByNodeType(type) {
            if (type === 'user' || type === 'root') return 6;
            if (type === 'category' || type === 'subcategory') return 5;
            return 6;
        }

        // @Override
    }, {
        key: 'getEdgeColorByType',
        value: function getEdgeColorByType(type) {
            if (type === 'subcategory') return '#C5CAE9';
            return '#ddd';
        }

        // @Override
    }, {
        key: 'getTitleByNode',
        value: function getTitleByNode(node) {
            if (node.type !== 'photo') return node.title;
            return '';
        }

        // @Override
    }, {
        key: 'circleMouseOver',
        value: function circleMouseOver(node) {
            if (node.photo_url !== undefined) {
                this.bgImg('preview', node.photo_url);
                this.show('preview');
                this.dom('preview_title').innerHTML = node.title;
                this.show('preview_title');
            } else {
                this.hide('preview');
                this.hide('preview_title');
            }
        }

        // @Override
    }, {
        key: 'updatePhotoGallery',
        value: function updatePhotoGallery(node) {
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
            if (photos.length > 0) {
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
        }

        // @Override
    }, {
        key: 'galleryPhotoClick',
        value: function galleryPhotoClick(e) {
            window.open(e.target.dataset.page_url);
        }
    }]);

    return MiilGraph;
})(LayoutForce);

