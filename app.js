var m;
var main = function () {
    m = new MiilGraph('stage', json.nodes, json.edges);
    console.info(m);
    m.appLoad();
}

window.addEventListener('load', function (e) {
    main();
}, false);
