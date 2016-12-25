var runMiilClient = function () {
    var w = 488;
    var h = 668; //+ 22
    chrome.windows.create({
        url: 'http://daiiz-apps.appspot.com/miilclient',
        type: 'popup',
        width: w,
        height: h,
        top: 100,
        left: 100
    });
};
