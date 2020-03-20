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
            // Create the CSV file
            var csvFile = file.create({
                name: 'categories-data-eureka.csv',
                contents:
                    'Category (No hierarchy),' +
                    'Category Hierarchy\n',
                folder: 39,
                fileType: 'CSV'
            });

            log.debug({
                title: 'saveCSVFile',
                details: 'csvFile defined -  fileData.length[' + searchResult.length + ']'
            });

            for (var i = 0; i < searchResult.length; i++) {
                csvFile.appendLine({
                    value: searchResult[i].getValue({name: 'categorynohierarchy', summary: 'GROUP'}) + ',' +
                        searchResult[i].getValue({name: 'formulatext', summary: 'GROUP'})
                });
                log.debug({
                    title: 'saveCSVFile',
                    details: 'Append Line - item.id[' + searchResult[i].id + ']'
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
            // Search on Categories
            // https://developers.suitecommerce.com/chapter4673202005
            var filters = [
                search.createFilter({
                    name: 'isinactive',
                    operator: search.Operator.IS,
                    values: ['F']
                }),
                search.createFilter({
                    name: 'isonline',
                    operator: search.Operator.IS,
                    values: ['T']
                }),
                search.createFilter({
                    name: 'formulanumeric',
                    formula: 'CASE {category} WHEN {categorypreferred} THEN 1 ELSE 0 END',
                    operator: search.Operator.EQUALTO,
                    values: ['1']
                })
            ];

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
                        name: 'formulatext',
                        formula: "'>>' || {category}",
                        label: 'Hierarchy',
                        summary: search.Summary.GROUP
                    })
                ],
                filters: filters
            }).run();
            searchResult = searchResult.getRange(0, 1000);
            log.debug({
                title: 'Success',
                details: searchResult
            });
            var csvFileId = saveCSVFile(searchResult);
            context.response.write('Success');
        }

        return {
            onRequest: onRequest
        };

    });
