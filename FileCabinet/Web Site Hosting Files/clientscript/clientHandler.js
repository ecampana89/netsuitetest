/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/ui/dialog', 'N/url', 'N/https', 'N/ui/message'],
    /**
     * @param{dialog} dialog
     * @param{url} url
     * @param{https} https
     * @param{message} message
     */
    function (dialog, url, https, message) {
        /**
         * Validation function to be executed when record is saved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @returns {boolean} Return true if record is valid
         *
         * @since 2015.2
         */
        function saveRecord(scriptContext) {
            var title = 'EurekaLabs SiteBuilder Export';
            var text;

            try {
                // https://tstdrv2239225.app.netsuite.com/app/help/helpcenter.nl?fid=section_4642657958.html&whence=
                // https://netsuiteprofessionals.com/question/can-the-n-file-module-be-used-in-a-client-script/
                // https://stackoverflow.com/questions/32756760/how-to-call-suitelet-at-pageinit-function-of-client-in-netsuite
                // https://netsuiteprofessionals.com/question/call-a-suitelet-from-a-user-event-script-then-display-confirmation-message/

                var currentRecord = scriptContext.currentRecord;

                // Checkbox
                var exportCategories = currentRecord.getValue('custrecord_export_categories');
                var exportItemCategories = currentRecord.getValue('custrecord_export_item_categories');
                var importItemCategories = currentRecord.getValue('custrecord_import_item_categories');
                var exportImages = currentRecord.getValue('custrecord_export_images');
                var exportWebsiteSetup = currentRecord.getValue('custrecord_export_website_setup');

                var exportSelectedSiteBuilderWebsite = currentRecord.getValue('custrecord_sb_website');
                var exportSelectedSuiteCommerceWebsite = currentRecord.getValue('custrecord_sc_website');

                var suiteCommerceImportData = currentRecord.getValue('custrecord_sc_import_data');

                var deleteCustomRecordItemsCategories = currentRecord.getValue('custrecord_delete_item_categories');
                var deleteCategories = currentRecord.getValue('custrecord_delete_commerce_categories');
                var cleanImages = currentRecord.getValue('custrecord_clean_images');

                var subsidiaryId = currentRecord.getValue('custrecord_select_subsidiary_id');
                var destinationFolderId = currentRecord.getValue('custrecord_destination_folder_id');
                var displayInWebstore = currentRecord.getValue('custrecord_display_in_webstore');

                const scriptIdExportItems = 'customscript_export_categories_erk';
                const scriptIdExportItemsCategories = 'customscript_export_items_categories_erk';
                const scriptIdExportImages = 'customscript_export_images_erk';
                const scriptIdExportWebsiteSetup = 'customscript_export_website_setup_erk';

                log.debug({
                    title: 'Parameters',
                    details: 'exportCategories[' + exportCategories + '] ' +
                        ' - exportItemCategories[' + exportItemCategories + ']' +
                        ' - deleteCategories[' + deleteCategories + ']' +
                        ' - importItemCategories[' + importItemCategories + ']' +
                        ' - deleteCustomRecordItemsCategories[' + deleteCustomRecordItemsCategories + ']' +
                        ' - exportImages[' + exportImages + ']' +
                        ' - exportWebsiteSetup[' + exportWebsiteSetup + ']' +
                        ' - suiteCommerceImportData[' + suiteCommerceImportData + ']' +
                        ' - exportSelectedSiteBuilderWebsite[' + exportSelectedSiteBuilderWebsite + ']' +
                        ' - exportSelectedSuiteCommerceWebsite[' + exportSelectedSuiteCommerceWebsite + ']' +
                        ' - subsidiaryId[' + subsidiaryId + ']' +
                        ' - destinationFolderId[' + destinationFolderId + ']' +
                        ' - cleanImages[' + cleanImages + ']' +
                        ' - displayInWebstore[' + displayInWebstore + ']'
                });

                var params = {
                    siteBuilderWebsiteId: exportSelectedSiteBuilderWebsite,
                    suiteCommerceWebsiteId: exportSelectedSuiteCommerceWebsite
                };
                if (suiteCommerceImportData) {
                    params.suiteCommerceImportData = suiteCommerceImportData
                }

                if (exportCategories || deleteCategories) {
                    params.deleteCategories = deleteCategories;
                    params.exportCategories = exportCategories;
                    invokeSuitelet(scriptIdExportItems, params)
                }

                if (exportItemCategories || importItemCategories || deleteCustomRecordItemsCategories) {
                    params.exportItemCategories = exportItemCategories;
                    params.importItemCategories = importItemCategories;
                    params.deleteCustomRecordItemsCategories = deleteCustomRecordItemsCategories;
                    invokeSuitelet(scriptIdExportItemsCategories, params)
                }

                if (exportImages) {
                    if (subsidiaryId) {
                        params.subsidiaryId = subsidiaryId
                    }
                    if (destinationFolderId) {
                        params.destinationFolderId = destinationFolderId
                    }
                    if (displayInWebstore) {
                        params.displayInWebstore = displayInWebstore
                    }
                    if (cleanImages) {
                        params.cleanImages = cleanImages
                    }
                    invokeSuitelet(scriptIdExportImages, params)
                }

                if (exportWebsiteSetup) {
                    invokeSuitelet(scriptIdExportWebsiteSetup, params)
                }
                text = 'Export Success';

                callAlert(title, text, message.Type.CONFIRMATION);
                return true;
            } catch (e) {
                log.error({
                    title: e.name,
                    details: e.message
                });

                text = 'Error - error.name[' + e.name + '] - error.detail[' + e.message + ']';

                callAlert(title, text, message.Type.ERROR);
                return false;
            }
        }

        function callAlert(title, text, type) {

            var myMsg = message.create({
                title: title,
                message: text,
                type: type
            });
            myMsg.show();
        }

        function invokeSuitelet(scriptId, params) {
            log.debug({
                title: 'Invoke Suitelet',
                details: 'Init invokeSuitelet - scriptId[' + scriptId + '] ' +
                    '- params[' + JSON.stringify(params) + '] '
            });

            var suiteletURL = url.resolveScript({
                scriptId: scriptId,
                deploymentId: 'customdeploy1',
                returnExternalURL: false,
                params: params
            });

            log.debug({
                title: 'Invoke Suitelet',
                details: 'suiteletURL[' + suiteletURL + ']'
            });

            var response = https.request({
                method: https.Method.GET,
                url: suiteletURL,
                headers: []
            });

            log.debug({
                title: 'Invoke Suitelet',
                details: 'Success invokeSuitelet - scriptId[' + scriptId + ']'
            });

            return response;
        }

        /*
                function fieldChanged(scriptContext) {
                    var currentRecord = scriptContext.currentRecord;
                    var sublistName = scriptContext.sublistId;
                    var sublistFieldName = scriptContext.fieldId;
                    var line = scriptContext.line;
                    log.debug({
                        title: 'fieldChanged',
                        details: 'Success fieldChanged event - currentRecord['+JSON.stringify(currentRecord)+'] - sublistName['+sublistName+'] - sublistFieldName['+sublistFieldName+'] - line['+line+']'
                    });
                    if (sublistFieldName === 'custrecord_sc_website') {
                        log.debug({
                            title: 'fieldChanged',
                            details: 'Suite Commerce Website changed'
                        });
                        var selectField = currentRecord.getField({
                            fieldId: 'custrecord_sc_commerce_catalog'
                        });
                        log.debug({
                            title: 'fieldChanged',
                            details: 'selectField['+JSON.stringify(selectField)+']'
                        });
                        // Insert a new option.
                        selectField.addSelectOption({
                            value : '',
                            text : ''
                        });
                        selectField.addSelectOption({
                            value : 'a',
                            text : 'Albert'
                        });
                        field.insertSelectOption({
                            value: 'Option1',
                            text: 'alpha'
                        });
                    }
                }
        */
        return {
            saveRecord: saveRecord
        };

    });
