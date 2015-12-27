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
                            type: 'subcategory'
                        };
                        _this2.addNode(me);
                        var parent = _this2.getNodeById(categoryId);
                        _this2.addLink(parent, me, false);
                    });
                }
            });
            this.drawGraph();
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
            var _this3 = this;

            miil_categories.forEach(function (cate) {
                if (cate.category_id !== 588 && cate.category_id !== 589) {
                    _this3.parseMiilCategories(cate, [_this3.getNodeIdxById('miilroot')]);
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
                // サブカテゴリを展開する
                console.log(7777);
                this.parseMiilSubCategories(id);
            }
        }
    }]);

    return MiilGraph;
})(LayoutForce);

