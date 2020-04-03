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

        var now = new Date().toISOString();
        var name = 'employee-role-eureka.-' + now + '.csv';

        function saveCSVFile(searchResult) {
            // Create the CSV file
            var csvFile = file.create({
                name: name,
                contents: 'firstname,' +
                    'lastname,' +
                    'role.internalid,' +
                    'role.name\n',
                folder: 701,
                fileType: 'CSV'
            });

            log.debug({
                title: 'saveCSVFile',
                details: 'csvFile defined -  fileData.length[' + searchResult.length + ']'
            });

            for (var i = 0; i < searchResult.length; i++) {
                csvFile.appendLine({
                    value: searchResult[i].getValue({name: 'firstname'}) + ',' +
                        searchResult[i].getValue({name: 'lastname'}) + ',' +
                        searchResult[i].getValue({name: 'internalid', join: 'role'}) + ',' +
                        searchResult[i].getValue({ name: 'name', join: 'role' })
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

            //search on employees based on specific roles by joining to role table
            var filters = [
                search.createFilter({
                    name: 'isinactive',
                    operator: search.Operator.IS,
                    values: [ 'F' ]
                }),
                search.createFilter({
                    name: 'internalid',
                    join: 'role',
                    operator: search.Operator.ISNOTEMPTY
                    // , values: JSON.parse(JSON.stringify(roleList))
                })
            ];

            //get the values of the roles in the role table via SuiteScript 2.0
            var searchResult = search.create({
                'type': 'employee',
                'filters': filters,
                'columns': [
                    search.createColumn({'name': 'firstname'}),
                    search.createColumn({'name': 'lastname'}),
                    search.createColumn({'name': 'internalid', join: 'role'}),
                    search.createColumn({'name': 'name', join: 'role'})
                    // if we wanted to run a summary search, here is the syntax
                    //,search.createColumn({'name':'created','summary':search.Summary.MAX})
                ]
            }).run();
            searchResult = searchResult.getRange(0, 1000);
            log.debug({
                title: 'searchResult',
                details: searchResult
            });

            var csvFileId = saveCSVFile(searchResult);
            log.debug({
                title: 'onRequest',
                details: 'csvFileId[' + csvFileId + ']'
            });
            context.response.write('<h1>Success save images</h1>' +
                'name:' + name);
        }

        return {
            onRequest: onRequest
        };

    }
);



