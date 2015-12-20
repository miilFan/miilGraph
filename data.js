var miil_categories = categories;

var json = {
    nodes: [
        {
            id: '130727',
            type: 'user',
            photo_url: "daiz.jpg",
            title: "daiz"
        },
        {
            id: '29600',
            type: 'user',
            photo_url: "miil.jpg",
            title: "miilme"
        },
        {
            type: 'root',
            photo_url: "miilicon.png",
            title: "miil.me",
            id: 'miilroot'
        }
    ],

    edges: [
        {source: 2, target: 0},
        {source: 2, target: 1}
    ]
};
