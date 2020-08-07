/**
 * suiteletExportImages.js
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define([ 'N/search', 'N/file', './customModule'],
    /**
     * @param{search} search
     * @param{file} file
     * @param{customModule} customModule
     */
    function (search, file, customModule) {

        function saveCSVFile(searchResultFile, searchResultItem, folderName, fileName) {
            var csvFolderId = customModule.getFolderId(folderName);
            var now = new Date().toISOString();

            // Create the CSV file
            var csvFile = file.create({
                name: fileName + '-' + now + '-bndl.csv',
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

            log.debug({
                title: 'saveCSVFile',
                details: 'CSV file saved success - csvFileId[' + csvFileId + ']'
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
            // Export Item / Images
            var fileName = 'images-item-eureka';
            var folderName = 'EurekaLabs';

            var parameters = context.request.parameters;

            log.debug({
                title: 'onRequest',
                details: 'Parameters[' + JSON.stringify(parameters) + ']'
            });

            var siteBuilderWebsiteId = parameters.siteBuilderWebsiteId ? parameters.siteBuilderWebsiteId : 1;
            var suiteCommerceWebsiteId = parameters.suiteCommerceWebsiteId ? parameters.suiteCommerceWebsiteId : 1;

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
                type: 'file',
                title: 'ImagesItems',
                id: 'customsearch_files_eureka',
                columns: [
                    search.createColumn({'name': 'internalid'}),
                    search.createColumn({'name': 'name'}),
                    search.createColumn({'name': 'folder'}),
                    search.createColumn({'name': 'url'})
                ],
                filters: filtersFile
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
                    values: [ siteBuilderWebsiteId ]
                })
            ];

            var searchResultItem = search.create({
                type: search.Type.ITEM,
                title: 'item',
                id: 'customsearch_images_items_eureka',
                columns: [
                    search.createColumn({'name': 'internalid'}),
                    search.createColumn({'name': 'imageurl'})
                ],
                filters: filtersItem
            });

            searchResultItem = searchResultItem.run().getRange(0, 1000);

            log.debug({
                title: 'Success search items',
                details: searchResultItem
            });

            var csvFile = saveCSVFile(searchResultFile, searchResultItem, folderName, fileName);

            log.debug({
                title: 'onRequest',
                details: 'CSV file creation success'
            });
        }

        return {
            onRequest: onRequest
        };

    }
);
