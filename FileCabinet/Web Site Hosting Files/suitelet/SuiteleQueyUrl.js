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
            var now = new Date().toISOString();
            // Create the CSV file
            var csvFile = file.create({
                name: 'urls-data-eureka-' + now + '.csv',
                contents:
                    'internalid,' +
                    'name,' +
                    'pagetype,' +
                    'url\n',
                folder: 701,
                fileType: 'CSV'
            });

            log.debug({
                title: 'saveCSVFile',
                details: 'csvFile defined -  fileData.length[' + searchResult.length + ']'
            });

            for (var i = 0; i < searchResult.length; i++) {
                csvFile.appendLine({
                    value: (searchResult[i].getValue({name: 'internalid'})).replace(",", "") + ',' +
                        (searchResult[i].getValue({name: 'name'})).replace(",", "") + ',' +
                        (searchResult[i].getValue({name: 'pagetype'})).replace(",", "") + ',' +
                        searchResult[i].getValue({name: 'url'}.replace(",", ""))
                });
            }
            log.debug({
                title: 'saveCSVFile',
                details: 'CSV file saved success'
            });
            return csvFile;
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

            var parameters = context.request.parameters;

            log.debug({
                title: 'onRequest',
                details: 'Parameters: ' + JSON.stringify(parameters)
            });

            var onlyActiveFilter;

            if (parameters.onlyActive && parameters.onlyActive === 'T') {
                onlyActiveFilter = search.createFilter({
                    name: 'isinactive',
                    operator: search.Operator.IS,
                    values: [ 'F' ]
                });
            }

            var filters = [];

            if (onlyActiveFilter) filters = filters.concat(onlyActiveFilter)

            var searchResult = search.create({
                type: 'cmspage',
                title: 'cmspage',
                id: 'customsearch_cmspage_eureka',
                columns: [
                    search.createColumn({
                        name: 'url',
                        sort: search.Sort.ASC,
                        summary: search.Summary.GROUP
                    }),
                    search.createColumn({
                        name: 'pagetype',
                        sort: search.Sort.ASC
                    }),
                    search.createColumn({
                        name: 'name',
                        sort: search.Sort.ASC
                    }),
                    search.createColumn({
                        name: 'internalid',
                        sort: search.Sort.ASC
                    })
                ],
                filters: filters
            }).run();
            searchResult = searchResult.getRange(0, 1000);
            log.debug({
                title: 'onRequest',
                details: 'Search success: ' + searchResult
            });
            var csvFile = saveCSVFile(searchResult);
            log.debug({
                title: 'onRequest',
                details: 'CSV file creation success'
            });
            context.response.writeFile(csvFile)
        }

        return {
            onRequest: onRequest
        };

    });
