/**
 * suiteletExportImages.js
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/search', 'N/file', './customModule', 'N/runtime', 'N/task'],
    /**
     * @param{search} search
     * @param{file} file
     * @param{customModule} customModule
     * @param{runtime} runtime
     * @param{task} task
     */
    function (search, file, customModule, runtime, task) {

        //Global variables
        var scriptObj;

        function saveCSVFile(searchResultItem, folderName, fileName) {
            var csvFolderId = customModule.getFolderId(folderName);
            var now = new Date().toISOString();

            // Create the CSV file
            var csvFile = file.create({
                name: fileName + '-' + now + '-bndl.csv',
                contents: 'internalid,' +
                    'itemid,' +
                    'isinactive,' +
                    'type,' +
                    'subtype,' +
                    'displayname,' +
                    'caption,' +
                    'itemurl,' +
                    'storedisplayimage,' +
                    'storedisplayname,' +
                    'imageurl\n',
                folder: csvFolderId, //Folder ID (FileCabinet)
                fileType: 'CSV'
            });


            for (var j = 0; j < searchResultItem.length; j++) {
                csvFile.appendLine({
                    value: (searchResultItem[j].getValue({name: 'internalid'})).replace(",", "") + ',' +
                        (searchResultItem[j].getValue({name: 'itemid'})).replace(",", "") + ',' +
                        (searchResultItem[j].getValue({name: 'isinactive'})) + ',' +
                        (searchResultItem[j].getValue({name: 'type'})).replace(",", "") + ',' +
                        (searchResultItem[j].getValue({name: 'subtype'})).replace(",", "") + ',' +
                        (searchResultItem[j].getValue({name: 'displayname'})).replace(",", "") + ',' +
                        (searchResultItem[j].getValue({name: 'caption'})).replace(",", "") + ',' +
                        (searchResultItem[j].getValue({name: 'itemurl'})).replace(",", "") + ',' +
                        (searchResultItem[j].getValue({name: 'storedisplayimage'})).replace(",", "") + ',' +
                        (searchResultItem[j].getValue({name: 'storedisplayname'})).replace(",", "") + ',' +
                        (searchResultItem[j].getValue({name: 'imageurl'})).replace(",", "")
                });
                log.debug({
                    title: 'saveCSVFile',
                    details: 'Append Line - item.id[' + searchResultItem[j].id + ']'
                });

            }


            var csvFileId = csvFile.save();

            log.debug({
                title: 'saveCSVFile',
                details: 'CSV file saved success - csvFileId[' + csvFileId + ']'
            });

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
            var parameters = {};
            try {
                // Export Item / Images
                var fileName = 'images-item-eureka';
                var folderName = 'EurekaLabs';

                parameters = context.request.parameters;

                log.debug({
                    title: 'onRequest',
                    details: 'Parameters[' + JSON.stringify(parameters) + ']'
                });

                //traemos info del script actual
                scriptObj = runtime.getCurrentScript();
                log.debug("Remaining governance units inicial: " + scriptObj.getRemainingUsage());

                var siteBuilderWebsiteId = parameters.siteBuilderWebsiteId ? parameters.siteBuilderWebsiteId : 1;
                var folderId = parameters.destinationFolderId ? parameters.destinationFolderId : 7316;
                //TODO cambiar a false para subir
                var suiteCommerceImportData = parameters.suiteCommerceImportData ? parameters.suiteCommerceImportData : true;
                var cleanImageFolder = parameters.cleanImages ? parameters.cleanImages : false;


                // search on items
                var filtersItem = [

                    search.createFilter({
                        name: 'isonline',
                        operator: search.Operator.IS,
                        values: ['T']
                    })
                    , search.createFilter({
                        name: 'isinactive',
                        operator: search.Operator.IS,
                        values: ['F']
                    })
                    , search.createFilter({
                        name: 'imageurl',
                        operator: search.Operator.ISNOTEMPTY
                    })
                    , search.createFilter({
                        name: 'website',
                        operator: search.Operator.IS,
                        values: [siteBuilderWebsiteId]
                    })
                    // , search.createFilter({
                    //     name: 'type',
                    //     operator: search.Operator.IS,
                    //     values: ['InvtPart']
                    // })

                    // ,search.createFilter({
                    //     name: 'itemid',
                    //     operator: search.Operator.IS,
                    //     values: ['SEI00001']
                    // })
                ];

                // // search on items
                // var filtersItem = [
                //     search.createFilter({
                //         name: 'imageurl',
                //         operator: search.Operator.ISNOTEMPTY
                //     })
                //     ,
                //     search.createFilter({
                //         name: 'website',
                //         operator: search.Operator.IS,
                //         values: [ siteBuilderWebsiteId ]
                //     })
                //     ,
                //     search.createFilter({
                //         name: 'type',
                //         operator: search.Operator.IS,
                //         values: [ 'InvtPart' ]
                //     })
                // ];


                var searchResultItem = search.create({
                    type: search.Type.ITEM,
                    title: 'item',
                    id: 'customsearch_images_items_eureka',
                    columns: [
                        search.createColumn({
                            'name': 'internalid',
                        }),
                        search.createColumn({'name': 'itemid', sort: search.Sort.ASC}),
                        search.createColumn({'name': 'isinactive'}),
                        search.createColumn({'name': 'type'}),
                        search.createColumn({'name': 'subtype'}),
                        search.createColumn({'name': 'displayname'}),
                        search.createColumn({'name': 'caption'}),
                        search.createColumn({'name': 'itemurl'}),
                        search.createColumn({'name': 'storedisplayimage'}),
                        search.createColumn({'name': 'storedisplayname'}),
                        search.createColumn({'name': 'imageurl'})
                    ]
                    ,
                    filters: filtersItem
                });

                searchResultItem = searchResultItem.run().getRange(0, 1000);


                log.debug({
                    title: 'Success search items',
                    details: 'count: ' + searchResultItem.length + ' data: ' + JSON.stringify(searchResultItem)
                });

                log.debug("Remaining governance units search: " + scriptObj.getRemainingUsage());


                var csv = saveCSVFile(searchResultItem, folderName, fileName);

                log.debug({
                    title: 'onRequest',
                    details: 'CSV file creation success - remainingUsage[' + runtime.getCurrentScript().getRemainingUsage() + '] - saveCSVFile[' + JSON.stringify(csv) + ']'
                });

                var scriptTask;
                if (suiteCommerceImportData || cleanImageFolder) {
                    //llamar al nuevo script mapreduce
                    scriptTask = task.create({taskType: task.TaskType.MAP_REDUCE});
                    scriptTask.scriptId = 'customscript_map_reduce_images';
                    scriptTask.deploymentId = 'customdeploy_map_reduce_images';
                    scriptTask.params = {
                        custscript_sitebuilder_website_id: siteBuilderWebsiteId,
                        custscript_folder_id: folderId,
                        custscript_clean_image_folder: cleanImageFolder
                    };
                    scriptTask.submit();
                }
                if (scriptTask) {
                    log.debug("scriptTask : " + JSON.stringify(scriptTask));
                    log.debug("Remaining governance units task mapreduce: " + scriptObj.getRemainingUsage());
                }

                // var summary = scriptTask.checkStatus(scriptTaskId);
                // if (summary.stage === scriptTask.MapReduceStage.SUMMARIZE) {
                //     log.audit({
                //         title: 'onRequest',
                //         details: 'Call task map reduce Import Images success'
                //     });
                // }else{
                //     log.error({
                //         title: 'onRequest',
                //         details: 'Call task map reduce Import Images error'
                //     });
                // }

            } catch (e) {
                log.error({
                    title: 'onRequest',
                    details: 'Error during Item-Images execution - errorName[' + e.name + '] -  errorDetail[' + e.message + '] - params[' + JSON.stringify(parameters) + ']'
                });
                customModule.sendErrorEmail('Script Execution Error Details', e, parameters);
                throw e;
            }

        }

        return {
            onRequest: onRequest
        };

    }
);
