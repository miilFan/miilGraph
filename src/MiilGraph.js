class MiilGraph extends LayoutForce {
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
        }else if (type === 'user') {
            // ユーザコンテンツを展開する
            var userName = node.title;
        }
    }
}
