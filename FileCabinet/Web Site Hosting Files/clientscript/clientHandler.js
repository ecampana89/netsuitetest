/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define([ 'N/ui/dialog', 'N/url', 'N/https', 'N/ui/message' ],
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
            try {
                // https://tstdrv2239225.app.netsuite.com/app/help/helpcenter.nl?fid=section_4642657958.html&whence=
                // https://netsuiteprofessionals.com/question/can-the-n-file-module-be-used-in-a-client-script/
                // https://stackoverflow.com/questions/32756760/how-to-call-suitelet-at-pageinit-function-of-client-in-netsuite
                // https://netsuiteprofessionals.com/question/call-a-suitelet-from-a-user-event-script-then-display-confirmation-message/

                var currentRecord = scriptContext.currentRecord;

                // Checkbox
                var exportCategories = currentRecord.getValue('custrecord_export_categories');
                var exportItemCategories = currentRecord.getValue('custrecord_export_item_categories');
                var exportImages = currentRecord.getValue('custrecord_export_images');
                var exportWebsiteSetup = currentRecord.getValue('custrecord_export_website_setup');
                var exportSelectedWebsite = currentRecord.getValue('custrecord_select_website');

                var scriptIdExportItems = 'customscript_export_categories_erk';
                var scriptIdExportItemsCategories = 'customscript_export_items_categories_erk';
                var scriptIdExportImages = 'customscript_export_images_erk';
                var scriptIdExportWebsiteSetup = 'customscript_export_website_setup_erk';

                log.debug({
                    title: 'Parameters',
                    details: 'exportCategories[' + exportCategories + '] ' +
                        ' - exportItemCategories[' + exportItemCategories + ']' +
                        ' - exportImages[' + exportImages + ']' +
                        ' - exportWebsiteSetup[' + exportWebsiteSetup + ']' +
                        ' - exportSelectedWebsite[' + exportSelectedWebsite + ']'
                });

                if (exportCategories) {
                    invokeSuitelet(scriptIdExportItems, exportSelectedWebsite)
                }

                if (exportItemCategories) {
                    invokeSuitelet(scriptIdExportItemsCategories, exportSelectedWebsite)
                }

                if (exportImages) {
                    invokeSuitelet(scriptIdExportImages, exportSelectedWebsite)
                }

                if (exportWebsiteSetup) {
                    invokeSuitelet(scriptIdExportWebsiteSetup, exportSelectedWebsite)
                }
                var title = 'EurekaLabs SiteBuilder Export';
                var text = 'Export Success';

                callAlert(title, text, message.Type.CONFIRMATION);
                return true;
            } catch (e) {
                log.error({
                    title: e.name,
                    details: e.message
                });

                // var title = 'EurekaLabs SiteBuilder Export';
                text = 'Error - error.name[' + e.name + '] - error.detail[' + e.message + ']';

                callAlert(title, text, message.Type.ERROR);
                return false;
            }
        }

        function callAlert(title, text, type) {

            var myMsg = message.create({
                title: title,
                message: text,
                type: message.Type.CONFIRMATION
            });
            myMsg.show();
        }

        function invokeSuitelet(scriptId, websiteId) {
            log.debug({
                title: 'Invoke Suitelet',
                details: 'Init invokeSuitelet - scriptId[' + scriptId + '] - websiteId[' + websiteId + ']'
            });

            var suiteletURL = url.resolveScript({
                scriptId: scriptId,
                deploymentId: 'customdeploy1',
                returnExternalURL: false,
                params: {websiteId: websiteId}
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


        return {
            saveRecord: saveRecord
        };

    });
