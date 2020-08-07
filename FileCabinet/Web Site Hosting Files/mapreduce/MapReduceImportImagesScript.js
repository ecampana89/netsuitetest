/**
 * mapreduceImportImages.js
 * @NApiVersion 2.x
 * @NScriptType MapReduceScript
 */
define(['N/file', 'N/log', 'N/record', 'N/search', 'N/runtime','./customModule'],
    /**
     * @param{file} file
     * @param{log} log
     * @param{record} record
     * @param{search} search
     * @param{runtime} runtime
     * @param{customModule} customModule
     */
    function(file, log, record, search,runtime,customModule) {

        /**
         * Marks the beginning of the Map/Reduce process and generates input data.
         *
         * @typedef {Object} ObjectRef
         * @property {number} id - Internal ID of the record instance
         * @property {string} type - Record type id
         *
         * @return {Array|Object|Search|RecordRef} inputSummary
         * @since 2015.1
         */

        function getInputData() {

            var siteBuilderWebsiteId = runtime.getCurrentScript().getParameter('custscript_sitebuilder_website_id');

            log.audit({
                title: 'params input data',
                details: JSON.stringify({siteBuilderWebsiteId:siteBuilderWebsiteId})
            });

            // search on items
            var filtersItem = [

                search.createFilter({
                    name: 'isonline',
                    operator: search.Operator.IS,
                    values: ['T']
                }),
                search.createFilter({
                    name: 'isinactive',
                    operator: search.Operator.IS,
                    values: ['F']
                }),
                search.createFilter({
                    name: 'imageurl',
                    operator: search.Operator.ISNOTEMPTY
                })
                ,
                search.createFilter({
                    name: 'website',
                    operator: search.Operator.IS,
                    values: [ siteBuilderWebsiteId ]
                }),
                search.createFilter({
                    name: 'type',
                    operator: search.Operator.IS,
                    values: [ 'InvtPart' ]
                })

                /* ,search.createFilter({
                   name: 'itemid',
                   operator: search.Operator.IS,
                   values: ['CAM00006']
               })
               */
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

            return search.create({
                type: search.Type.ITEM,
                title: 'item',
                id: 'customsearch_images_items_eureka',
                columns: [
                    search.createColumn({'name': 'internalid',
                        sort: search.Sort.ASC}),
                    search.createColumn({'name': 'type'}),
                    search.createColumn({'name': 'subtype'}),
                    search.createColumn({'name': 'displayname'}),
                    search.createColumn({'name': 'caption'}),
                    search.createColumn({'name': 'itemid'}),
                    search.createColumn({'name': 'itemurl'}),
                    search.createColumn({'name': 'storedisplayimage'}),
                    search.createColumn({'name': 'storedisplayname'}),
                    search.createColumn({'name': 'imageurl'})
                ]
                ,
                filters: filtersItem
            });

        }

        /**
         * Executes when the map entry point is triggered and applies to each key/value pair.
         *
         * @param {MapSummary} context - Data collection containing the key/value pairs to process through the map stage
         * @since 2015.1
         */
        function map(context) {
            var data = '';
            var cleanImageFolder = runtime.getCurrentScript().getParameter({name:'custscript_clean_image_folder'});
            var destinationFolderId = runtime.getCurrentScript().getParameter({name:'custscript_folder_id'});
            log.debug({
                title: 'params map ',
                details: JSON.stringify({destinationFolderId:destinationFolderId,
                    cleanImageFolder:cleanImageFolder})
            });
            try {

                log.audit({
                    title: 'importImages',
                    details: 'Body - 10 ' + 'context: ' + JSON.stringify(context)
                });
                //cargamos la data del context, una por cada registro del search
                data = JSON.parse(context.value);
                var storedisplayimage = data.values["storedisplayimage"].value;
                var fileImage = file.load({id: storedisplayimage});

                if(cleanImageFolder === true){
                    log.debug({
                        title: 'clean images',
                        details: 'Body - 15 ' + 'file.load: ' + JSON.stringify(fileImage)
                    });
                    fileImage.folder = destinationFolderId;
                    var result = fileImage.save();

                    context.write(data.id, result); //write data
                    log.debug({
                        title: 'clean images',
                        details: 'Body - 16 ' + 'file.result: ' + JSON.stringify(result)
                    });
                }else {
                    log.debug({
                        title: 'importImages',
                        details: 'Body - 20 ' + 'file.load: ' + JSON.stringify(fileImage)
                    });
                    var newName = '';
                    //seteamos nombre
                    var displayname = data.values["displayname"];

                    if (!displayname || displayname.trim().length === 0) {

                        log.debug({
                            title: 'importImages',
                            details: 'Body - 21 ' + ' item sin displayname '
                        });
                        // ver parametro code en netsuite si no usar otro para completar el display name
                        var itemid = data.values["itemid"];
                        if (itemid && itemid.trim().length > 0) {
                            //cargamos el record de item
                            var itemRecord = record.load({
                                id: data.values["internalid"].value,
                                type: record.Type.INVENTORY_ITEM
                            })
                            log.debug({
                                title: 'importImages',
                                details: 'Body - 22 ' + 'record.load: ' + JSON.stringify(itemRecord)
                            });
                            itemRecord.displayname = itemid;
                            itemRecord.save()

                            displayname = itemid;

                        } else {
                            log.debug({
                                title: 'importImages',
                                details: 'Body - 23 ' + ' item sin itemid '
                            });
                        }
                    }
                    var extension = ''
                    //seteamos extension
                    if (fileImage.fileType === file.Type.JPGIMAGE) {
                        extension = 'jpg'
                    } else if (fileImage.fileType === file.Type.PNGIMAGE) {
                        extension = 'png'
                    } else if (fileImage.fileType === file.Type.GIFIMAGE) {
                        extension = 'gif'
                    } else if (fileImage.fileType === file.Type.BMPIMAGE) {
                        extension = 'bmp'
                    } else if (fileImage.fileType === file.Type.PJPGIMAGE) {
                        extension = 'pjpg'
                    } else if (fileImage.fileType === file.Type.TIFFIMAGE) {
                        extension = 'tiff'
                    } else if (fileImage.fileType === file.Type.ICON) {
                        extension = 'ico'
                    } else {

                        log.debug({
                            title: 'importImages',
                            details: 'Body - 25 ' + 'filetype no coincidente' + fileImage.fileType
                        });
                    }
                    //armamos el nombre
                    newName = displayname + '_0.' + extension;
                    log.debug({
                        title: 'importImages',
                        details: 'Body - 30 ' + 'new file Name: ' + newName
                    });
                    fileImage.name = newName;
                    //seteamos ubicacion
                    fileImage.folder = destinationFolderId;
                    var result = fileImage.save();
                    if (result) {
                        var object = {resul: result, data: JSON.stringify(data), name: newName}
                        context.write(data.id, object); //write data
                    }
                }
                return true;
            } catch (ex) {
                var errorEx = {ex: ex, data: JSON.stringify(data)};
                log.error({title: 'map: error saving files', details: JSON.stringify(errorEx)});
                customModule.sendErrorEmail('Script Execution Error Details', ex, context);
                throw ex;
            }
        }

        function reduce(context) {

            log.audit({
                title: 'reduce',
                details: JSON.stringify(context)
            });

            context.write({
                key: context.key,
                value: context.values
            });
        }


        /**
         * Executes when the summarize entry point is triggered and applies to the result set.
         *
         * @param {Summary} summary - Holds statistics regarding the execution of a map/reduce script
         * @since 2015.1
         */
        function summarize(context) {

            // Log details about the script's execution.
            log.audit({
                title: 'Usage units consumed',
                details: context.usage
            });
            log.audit({
                title: 'Concurrency',
                details: context.concurrency
            });
            log.audit({
                title: 'Number of yields',
                details: context.yields
            });

            log.audit({
                title: 'inputSummary',
                details: JSON.stringify(context.inputSummary)
            });

            // Use the context object's output iterator to gather the key/value pairs saved
            // at the end of the reduce stage. Also, tabulate the number of key/value pairs
            // that were saved. This number represents the total number of unique letters
            // used in the original string.
            // var text = '';
            var totalItemsProcessed = 0;
            context.output.iterator().each(function(key, value) {
                // text += ('Count: '+totalItemsProcessed +' key: '+ key + ' value: ' + value + '\n');
                totalItemsProcessed++;
                return true;
            });

            log.audit({
                title: 'Total Items Processed',
                details: totalItemsProcessed
            });

            var cleanImageFolder = runtime.getCurrentScript().getParameter({name:'custscript_clean_image_folder'});

            log.audit({
                title: 'cleanImageFolder',
                details: cleanImageFolder
            });
            if(!cleanImageFolder === false) {
                log.audit({
                    title: 'Send succes email',
                    details: 'Export/Import Images '
                });
                var emailSuccessMessageSubject = 'Export/Import Images Success';
                var emailSuccessMessageBody = 'Export/Import Images Script execution success. Usage consumed ' + context.usage + ', total item processed: ' + totalItemsProcessed + '.';
                customModule.sendEmail(emailSuccessMessageSubject, emailSuccessMessageBody);
            }
        }

        return {
            getInputData: getInputData,
            map: map,
            reduce: reduce,
            summarize: summarize
        };

    });
