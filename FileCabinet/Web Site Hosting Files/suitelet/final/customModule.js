/**
 * customModule.js
 * @NApiVersion 2.x
 */

define(['N/search', 'N/email', 'N/format'],
    /**
     * @param{search} search
     * @param{email} email
     * @param{format} format
     */
    function (search, email, format) {

        function getFolderId(folderName) {
            log.debug({
                title: 'getFolderId',
                details: 'Init getFolderId - folderName[' + folderName + ']'
            });

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

            var folderId = searchFolderResult[0].getValue('internalid');

            log.debug({
                title: 'getFolderId',
                details: 'Success getFolderId - folderId[' + folderId + ']'
            });

            return folderId;
        }

        function sendErrorEmail(subject, error, params) {
            var now = new Date();
            var dateTime = format.format({value: now, type: format.Type.DATETIMETZ});

            var body = 'Error DataTime[' + dateTime + '] \n\n' +
                'Error Name[' + error.name + '] \n\n' +
                'Error Message[' + error.message + '] \n\n' +
                'Error Stack[' + error.stack + '] \n\n' +
                'Params[' + JSON.stringify(params) + ']';
            sendEmail(subject, body);
        }

        function sendEmail(subject, body) {
            var senderId = -5;
            var recipientEmail = 'lucas@eurekalabs.io';
            email.send({
                author: senderId,
                recipients: [recipientEmail],
                subject: subject,
                body: body
            });
        }

        return {
            getFolderId: getFolderId,
            sendErrorEmail: sendErrorEmail,
            sendEmail: sendEmail
        };

    });
