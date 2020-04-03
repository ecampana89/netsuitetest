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
        var name = 'images-data-eureka.-' + now + '.csv';

        function saveCSVFile(searchResult) {
            // Create the CSV file
            var csvFile = file.create({
                name: name,
                contents: 'internalid,' +
                    'name,' +
                    'folder,' +
                    'url,' +
                    // 'item.internalid,' +
                    'item.imageurl\n',
                folder: 701,
                fileType: 'CSV'
            });

            log.debug({
                title: 'saveCSVFile',
                details: 'csvFile defined -  fileData.length[' + searchResult.length + ']'
            });

            for (var i = 0; i < searchResult.length; i++) {
                csvFile.appendLine({
                    value: searchResult[i].getValue({name: 'internalid'}) + ',' +
                        searchResult[i].getValue({name: 'name'}) + ',' +
                        searchResult[i].getValue({name: 'folder'}) + ',' +
                        searchResult[i].getValue({name: 'url'}) + ',' +
                        // searchResult[i].getValue({name: 'internalid', join: 'item'}) + ',' +
                        searchResult[i].getValue({name: 'imageurl', join: 'item'})
                });
                log.debug({
                    title: 'saveCSVFile',
                    details: 'Append Line - images.id[' + searchResult[i].id + ']'
                });
            }

            var csvFileId = csvFile.save();
            return csvFileId;
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

            // Search on images
            var filters = [
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
                // , search.createFilter({
                //     name: 'internalid',
                //     join: 'item',
                //     operator: search.Operator.ISNOTEMPTY
                //     // , values: JSON.parse(JSON.stringify(roleList))
                // })
            ];

            var itemColumn = search.createColumn({
                name: 'imageurl',
                join: 'item'
            });
            var searchResult = search.create({
                'type': 'file',
                'title': 'images',
                'id': 'customsearch_files_items_eureka',
                'columns': [
                    search.createColumn({'name': 'internalid'}),
                    search.createColumn({'name': 'name'}),
                    search.createColumn({'name': 'folder'}),
                    search.createColumn({'name': 'url'}),
                    itemColumn
                ],
                'filters': filters
            });
            searchResult = searchResult.run().getRange(0, 1000);
            log.debug({
                title: 'Success save images',
                details: searchResult
            });

            var csvFileId = saveCSVFile(searchResult);
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
