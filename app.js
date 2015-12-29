var m, pu, ps;
var main = function () {
    m = new MiilGraph('stage', json.nodes, json.edges);
    pu = m.parseMiilPhotosInUser;
    ps = m.parseMiilPhotosInSubCate;
    m.appLoad();
}

window.addEventListener('load', function (e) {
    main();
}, false);
