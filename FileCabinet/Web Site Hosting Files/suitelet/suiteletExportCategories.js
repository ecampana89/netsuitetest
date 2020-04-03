/**
 * suiteletExportCategories.js
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/search', 'N/file'],
    /**
     * @param{search} search
     * @param{file} file
     */
    function (search, file) {

        function saveCSVFile(searchResult, folderName, fileName) {
            var csvFolderId = getFolderId(folderName);
            var now = new Date().toISOString();

            // Create the CSV file
            var csvFile = file.create({
                name: fileName + '-' + now + '-bndl.csv',
                contents:
                    'Category (No Hierarchy),' +
                    'Category,' +
                    'Is Inactive\n',
                folder: csvFolderId, //Folder ID (FileCabinet)
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

            var csvFileId = csvFile.save();

            log.debug({
                title: 'saveCSVFile',
                details: 'CSV file saved success - csvFileId[' + csvFileId + ']'
            });

            return csvFile;
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
                columns: [search.createColumn({
                    name: 'internalid'
                })]
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
            // Export Categories
            var fileName = 'categories-data-eureka';
            var folderName = 'EurekaLabs';

            var parameters = context.request.parameters;

            log.debug({
                title: 'onRequest',
                details: 'Parameters[' + JSON.stringify(parameters) + ']'
            });

            var websiteId = parameters.websiteId ? parameters.websiteId : 1;

            var filters = [
                search.createFilter({
                    name: 'isonline',
                    operator: search.Operator.IS,
                    values: ['T']
                }),
                search.createFilter({
                    name: 'website',
                    operator: search.Operator.IS,
                    values: [websiteId]
                }),
                search.createFilter({
                    name: 'formulanumeric',
                    formula: 'CASE WHEN {category} LIKE \'Related Items for%\' THEN 0 ELSE 1 END',
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

            var csvFile = saveCSVFile(searchResult, folderName, fileName);

            log.debug({
                title: 'onRequest',
                details: 'CSV file creation success'
            });
        }

        return {
            onRequest: onRequest
        };

    });
