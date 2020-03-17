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

        function saveCSVFile(searchResult) {
            // Create the CSV file
            var csvFile = file.create({
                name: 'items-data-eureka.csv',
                contents: 'internalid,name,description,image,imgname\n',
                folder: 700,
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
                        searchResult[i].getValue({name: 'description'}) + ',' +
                        searchResult[i].getValue({name: 'thumbnailurl'}) + ',' +
                        searchResult[i].getValue({name: 'imageurl'})
                });
                log.debug({
                    title: 'saveCSVFile',
                    details: 'Append Line - items.id[' + searchResult[i].id + ']'
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
            // Search on Items
            var filters = [
                search.createFilter({
                    name: 'isinactive',
                    operator: search.Operator.IS,
                    values: [ 'F' ]
                })
            ];

            var searchResult = search.create({
                type: search.Type.ITEM,
                title: 'Items',
                id: 'customsearch_items_eureka',
                columns: [ 'internalid', 'name', 'description', 'thumbnailurl', 'imageurl' ],
                filters: filters
            }).run();
            searchResult = searchResult.getRange(0, 1000);
            log.debug({
                title: 'Success',
                details: searchResult
            });
            var csvFileId = saveCSVFile(searchResult);
            log.debug({
                title: 'onRequest',
                details: 'csvFileId[' + csvFileId + ']'
            });
            context.response.write('Success');
            return;
        }

        return {
            onRequest: onRequest
        };

    });
