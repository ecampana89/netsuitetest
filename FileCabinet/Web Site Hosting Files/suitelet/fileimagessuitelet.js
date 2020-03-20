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
                name: 'images-data-eureka.csv',
                contents: 'internalid,name,description,filetype,folder,owner,url\n',
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
                        searchResult[i].getValue({name: 'filetype'}) + ',' +
                        searchResult[i].getValue({name: 'folder'}) + ',' +
                        searchResult[i].getValue({name: 'owner'}) + ',' +
                        searchResult[i].getValue({name: 'url'})
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
                    name: 'isavailable',
                    operator: search.Operator.IS,
                    values: [ 'true' ]
                })
                ,
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

            var searchResult = search.create({
                type: 'file',
                title: 'images',
                id: 'customsearch_files_eureka',
                columns: [ 'internalid', 'name', 'description', 'filetype', 'folder', 'owner', 'url' ],
                filters: filters
            }).run();
            searchResult = searchResult.getRange(0, 1000);
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
                'images-data-eureka.csv');
        }

        return {
            onRequest: onRequest
        };

    });
