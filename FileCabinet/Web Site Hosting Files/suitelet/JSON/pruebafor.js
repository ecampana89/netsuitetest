function prueba(searchResultFile, searchResultItem) {
    for (var i = 0; i < searchResultFile.length; i++) {
        for (var j = 0; j < searchResultItem.length; j++) {
            if (searchResultFile[i].values.url === searchResultItem[j].values.imageurl)
                console.log({
                    title: 'sameUrl',
                    details: 'csvFile defined -  url[' + searchResultFile[i].values.url + ']'
                });
        }
    }
}

var searchResultFile = [ {
    "recordType": "file",
    "id": "1438",
    "values": {
        "internalid": [
            {
                "value": "1438",
                "text": "1438"
            }
        ],
        "name": "office_furniture-desk_computer01-sm.jpg",
        "folder": [
            {
                "value": "21",
                "text": "office furniture"
            }
        ],
        "url": "/core/media/media.nl?id=1438&c=TSTDRV2239225&h=e7121fefd8f0c6a96d76"
    }
},
    {
        "recordType": "file",
        "id": "1639",
        "values": {
            "internalid": [
                {
                    "value": "1639",
                    "text": "1639"
                }
            ],
            "name": "office_furniture-desk_lshape_teak-cat.jpg",
            "folder": [
                {
                    "value": "27",
                    "text": "categories"
                }
            ],
            "url": "/images/retail/phone81a.jpg"
        }
    }
];

var searchResultItem = [
    {
        "recordType": "inventoryitem",
        "id": "111",
        "values": {
            "internalid": [
                {
                    "value": "111",
                    "text": "111"
                }
            ],
            "imageurl": "http://shopping.eu1.netsuite.com/200b.jpg"
        }
    },
    {
        "recordType": "inventoryitem",
        "id": "837",
        "values": {
            "internalid": [
                {
                    "value": "837",
                    "text": "837"
                }
            ],
            "imageurl": "http://shopping.eu1.netsuite.com/laptop-bag3-md.jpg"
        }
    },
    {
        "recordType": "inventoryitem",
        "id": "508",
        "values": {
            "internalid": [
                {
                    "value": "508",
                    "text": "508"
                }
            ],
            "imageurl": "/images/retail/phone81a.jpg"
        }
    } ];
var result = prueba(searchResultFile, searchResultItem);

