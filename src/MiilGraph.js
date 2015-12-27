class MiilGraph extends LayoutForce {

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

    // @Override
    appLoad () {
        miil_categories.forEach(cate => {
            if (cate.category_id !== 588 && cate.category_id !== 589) {
                this.parseMiilCategories(cate, [this.getNodeIdxById('miilroot')]);
            }
        });
        this.drawGraph();
    }
}
