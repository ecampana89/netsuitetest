/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define([ 'N/file', 'N/query', 'N/search' ],
    /**
     * @param{file} file
     * @param{query} query
     * @param{search} search
     */
    function (file, query, search) {

        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} context
         * @param {ServerRequest} context.request - Encapsulation of the incoming request
         * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
         * @Since 2015.2
         */
        function onRequest(context) {
            // Search on employees
            var customerQuery = query.create({type: query.Type.EMPLOYEE});
            customerQuery.condition = customerQuery.createCondition({
                fieldId: "isinactive",
                operator: query.Operator.IS,
                values: false
            });
            customerQuery.columns = [
                customerQuery.createColumn({fieldId: "firstname"}),
                customerQuery.createColumn({fieldId: "entityid"}),
                customerQuery.createColumn({fieldId: "email"}),
                customerQuery.createColumn({fieldId: "lastname"}),
                customerQuery.createColumn({fieldId: "phone"})
            ];
            var customerResultSet = customerQuery.run();
            var res = customerResultSet.results
            var html = '<h1>Employees</h1>';
            for(var i = 0; i<res.length-1;i++) {
                debugger;
                html += '<li>entityid: '+res[i].values[1] + " - email: " + res[i].values[2]+ " - phone: " + res[i].values[4]+'</li>';
            }
            context.response.write({ output: html });
        }

        return {
            onRequest: onRequest
        };

    });
