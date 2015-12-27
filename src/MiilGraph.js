class MiilGraph extends LayoutForce {
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
