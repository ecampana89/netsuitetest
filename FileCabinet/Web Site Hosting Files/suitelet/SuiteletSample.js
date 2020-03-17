/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/file', 'N/query', 'N/ui/dialog', 'N/ui/message'],
/**
 * @param{file} file
 * @param{query} query
 * @param{dialog} dialog
 * @param{message} message
 */
function(file, query, dialog, message) {
   
    /**
     * Definition of the Suitelet script trigger point.
     *
     * @param {Object} context
     * @param {ServerRequest} context.request - Encapsulation of the incoming request
     * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
     * @Since 2015.2
     */
    function onRequest(context) {

    }

    return {
        onRequest: onRequest
    };
    
});
