/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define([ 'N/query', 'N/search', 'N/file' ],
    /**
     * @param{query} query
     * @param{search} search
     * @param{file} file
     */
    function (query, search, file) {

        var now = new Date().toISOString();
        var name = 'images-item-eureka-' + now + '-bndl.csv';


        function saveCSVFile(searchResultFile, searchResultItem) {

            var folderName = 'EurekaLabs';
            var csvFolderId = getFolderId(folderName);
            log.debug({
                title: 'csvFolderId',
                details: 'csvFolderId -  id[' + csvFolderId + ']'
            });
            // Create the CSV file
            var csvFile = file.create({
                name: name,
                contents: 'internalid,' +
                    'name,' +
                    'folder,' +
                    'item.internalid,' +
                    'item.imageurl\n',
                folder: csvFolderId, //Folder ID (FileCabinet)
                fileType: 'CSV'
            });


            for (var i = 0; i < searchResultFile.length; i++) {
                for (var j = 0; j < searchResultItem.length; j++) {
                    if (searchResultFile[i].getValue({name: 'url'}) === searchResultItem[j].getValue({name: 'imageurl'})) {
                        csvFile.appendLine({
                            value: searchResultFile[i].getValue({name: 'internalid'}) + ',' +
                                searchResultFile[i].getValue({name: 'name'}) + ',' +
                                searchResultFile[i].getValue({name: 'folder'}) + ',' +
                                searchResultItem[j].getValue({name: 'internalid'}) + ',' +
                                searchResultItem[j].getValue({name: 'imageurl'})
                        });
                        log.debug({
                            title: 'saveCSVFile',
                            details: 'Append Line - file.id[' + searchResultFile[i].id + ']- item.id[' + searchResultItem[j].id + ']'
                        });
                    }
                }
            }

            var csvFileId = csvFile.save();
            return csvFileId;
        }

        function getFolderId(folderName) {
            var searchFolderResult = search.create({
                type: search.Type.FOLDER,
                title: 'Search Folder',
                filters: [
                    search.createFilter({
                        name: 'name',
                        operator: search.Operator.IS,
                        values: folderName
                    })
                ],
                columns: [ search.createColumn({
                    name: 'internalid'
                }) ]
            }).run();

            searchFolderResult = searchFolderResult.getRange(0, 1000);

            return searchFolderResult[0].getValue('internalid');
        }

        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} context
         * @param {ServerRequest} context.request - Encapsulation of the incoming request
         * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
         * @Since 2015.2
         */
        function onRequest(context) {

            // Export images


            var parameters = context.request.parameters;

            log.debug({
                title: 'onRequest',
                details: 'Parameters[' + JSON.stringify(parameters) + ']'
            });

            var websiteId = parameters.websiteId ? parameters.websiteId : 1;

            // Search on images
            var filtersFile = [
                search.createFilter({
                    name: 'filetype',
                    operator: search.Operator.IS,
                    values: [ 'JPGIMAGE' ]
                }),
                search.createFilter({
                    name: 'availablewithoutlogin',
                    operator: search.Operator.IS,
                    values: [ 'true' ]
                })
            ];

            var searchResultFile = search.create({
                'type': 'file',
                'title': 'file',
                'id': 'customsearch_fil-alone_eureka',
                'columns': [
                    search.createColumn({'name': 'internalid'}),
                    search.createColumn({'name': 'name'}),
                    search.createColumn({'name': 'folder'}),
                    search.createColumn({'name': 'url'})
                ],
                'filters': filtersFile
            });

            searchResultFile = searchResultFile.run().getRange(0, 1000);

            log.debug({
                title: 'Success save files',
                details: searchResultFile
            });

            // search on items
            var filtersItem = [
                search.createFilter({
                    name: 'imageurl',
                    operator: search.Operator.ISNOTEMPTY
                }),
                search.createFilter({
                    name: 'website',
                    operator: search.Operator.IS,
                    values: [ websiteId ]
                })
            ];

            var searchResultItem = search.create({
                'type': search.Type.ITEM,
                'title': 'item',
                'id': 'customsearch_items-alone_eureka',
                'columns': [
                    search.createColumn({'name': 'internalid'}),
                    search.createColumn({'name': 'imageurl'})
                ],
                'filters': filtersItem
            });

            searchResultItem = searchResultItem.run().getRange(0, 1000);
            log.debug({
                title: 'Success search items',
                details: searchResultItem
            });

            var csvFileId = saveCSVFile(searchResultFile, searchResultItem);
            log.debug({
                title: 'onRequest',
                details: 'csvFileId[' + csvFileId + ']'
            });
            context.response.write('<h1>Success save images</h1>' +
                'name:' + name);
        }

        return {
            onRequest: onRequest
        };

    }
);
