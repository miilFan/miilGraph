document.getElementById('mc').addEventListener('click', function () {
    var w = 488;
    var h = 668; //+ 22
    var l = window.screenX + (document.body.clientWidth / 2) - (w / 2);
    var t = window.screenY + (document.body.clientHeight / 2) - (h / 2);
    chrome.windows.create({
        url: 'http://daiiz-apps.appspot.com/miilclient',
        type: 'popup',
        width: w,
        height: h,
        top: Math.round(t),
        left: Math.round(l)
    });
});
