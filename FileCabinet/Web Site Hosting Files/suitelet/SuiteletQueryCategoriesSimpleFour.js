/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/query', 'N/search', 'N/file'],
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
                name: 'categories-data-eureka-' + now + '.csv',
                contents:
                    'Category (No Hierarchy),' +
                    'Category,' +
                    'Is Inactive\n',
                folder: 39,
                fileType: 'CSV'
            });

            log.debug({
                title: 'saveCSVFile',
                details: 'csvFile defined -  fileData.length[' + searchResult.length + ']'
            });

            for (var i = 0; i < searchResult.length; i++) {
                csvFile.appendLine({
                    value: (searchResult[i].getValue({
                            name: 'categorynohierarchy',
                            summary: 'GROUP'
                        })).replace(",", "") + ',' +
                        (searchResult[i].getValue({name: 'category', summary: 'GROUP'})).replace(",", "") + ',' +
                        searchResult[i].getValue({name: 'isinactive', summary: 'GROUP'})
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
            // Search on Categories
            // https://developers.suitecommerce.com/chapter4673202005

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
                    values: ['F']
                });
            }

            var filters = [
                search.createFilter({
                    name: 'isonline',
                    operator: search.Operator.IS,
                    values: ['T']
                }),
                search.createFilter({
                    name: 'formulanumeric',
                    formula: 'CASE WHEN {category} LIKE \'Related Items for%\' THEN 0 ELSE 1 END',
                    operator: search.Operator.EQUALTO,
                    values: ['1']
                })
            ];

            if (onlyActiveFilter) filters = filters.concat(onlyActiveFilter)

            var searchResult = search.create({
                type: search.Type.ITEM,
                title: 'Categories',
                id: 'customsearch_categories_eureka',
                columns: [
                    search.createColumn({
                        name: 'categorynohierarchy',
                        sort: search.Sort.ASC,
                        summary: search.Summary.GROUP
                    }),
                    search.createColumn({
                        name: 'category',
                        sort: search.Sort.ASC,
                        summary: search.Summary.GROUP
                    }),
                    search.createColumn({
                        name: 'isinactive',
                        sort: search.Sort.ASC,
                        summary: search.Summary.GROUP
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
