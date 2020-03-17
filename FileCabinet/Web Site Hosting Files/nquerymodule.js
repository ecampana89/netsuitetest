
require(["N/query"], function (q) {
    var customerQuery = q.create({type: q.Type.CUSTOMER});
    customerQuery.condition = customerQuery.createCondition({
        fieldId: "isperson",
        operator: q.Operator.IS,
        values: true
    });
    customerQuery.columns = [
        customerQuery.createColumn({fieldId: "email"}),
        customerQuery.createColumn({fieldId: "entityid"})
    ];
    var customerResultSet = customerQuery.run();
    customerResultSet.results.forEach(printCustomerNameAndEmail);
    function printCustomerNameAndEmail(result) {
        console.log(result.values[1] + " - " + result.values[0]);
    }
});
