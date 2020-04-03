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
        var name = 'items-html-data-eureka.-' + now + '.csv';

        function saveCSVFile(searchResult) {
            // Create the CSV file
            var csvFile = file.create({
                name: name,
                contents: 'internalid,storedescription\n',
                folder: 701,
                fileType: 'CSV'
            });

            log.debug({
                title: 'saveCSVFile',
                details: 'csvFile defined -  fileData.length[' + searchResult.length + ']'
            });

            for (var i = 0; i < searchResult.length; i++) {
                csvFile.appendLine({
                    value:
                        searchResult[i].getValue({name: 'internalid'}) + ',' +
                        (searchResult[i].getValue({name: 'storedescription'})).replace(",", "")
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
                    name: 'storedescription',
                    operator: search.Operator.ISNOTEMPTY
                })
            ];

            var searchResult = search.create({
                type: search.Type.ITEM,
                title: 'Items',
                id: 'customsearch_itemshtml_eureka',
                columns: [ 'internalid', 'storedescription' ],
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
            context.response.write('<h1>Success save items html</h1>' +
                'name:' + name);
        }

        return {
            onRequest: onRequest
        };

    });
