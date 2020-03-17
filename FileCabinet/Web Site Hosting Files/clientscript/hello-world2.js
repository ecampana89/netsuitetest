define([], function () {
    /**
     * A simple "Hello, World!" example of a Client Script. Uses the `pageInit`
     * event to write a message to the console log.
     *
     * @NApiVersion 2.x
     * @NModuleScope Public
     * @NScriptType ClientScript
     */
    var exports = {};
    function pageInit(context) {
        console.log("Hello, World from a 2.0 Client Script!");
    }
    exports.pageInit = pageInit;
    return exports;
});
