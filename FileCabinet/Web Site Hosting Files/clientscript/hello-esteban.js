/**
 @NApiVersion 2.0
 @NScriptType ClientScript
 @NModuleScope SameAccount
 */
define(["N/ui/message"], function (message) {
    function showMessage() {
        message.create({
            title: "Hello, Esteban!",
            message: "You've used a dependency correctly.",
            type: message.Type.CONFIRMATION
        }).show();
    }

    return {
        pageInit: showMessage
    };
});
