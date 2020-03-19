/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/runtime', 'N/log', 'N/file'],
    /**
     * @param{runtime} runtime
     * @param{log} log
     * @param{file} file
     */
    function (runtime, log, file) {
        function onRequest(context) {

            var objCurScript = runtime.getCurrentScript();

            //make flexible by having multiple deployments
            const IMAGE_FOLDER = objCurScript.getParameter({ name : 'custscript_mz_filepost_learn_folder' });
            const HTMLFILE = objCurScript.getParameter({ name : 'custscript_mz_filepost_learn_imghtml' });

            log.debug({title: 'Server Request URL', details: context.request.url});
            log.debug({title: 'Server Request Parameters', details: context.request.parameters});

            //this mode is when the image is posted to the server
            if (context.request.method == "POST"){
                var fObjs = context.request.files;
                var hrefs = [];
                //don't take a chance, we expect only one file but handle more than one
                for (var f in fObjs) {
                    log.debug ({title: 'f:' + f, details: fObjs[f] })
                    var fObj = fObjs[f]
                    if (fObj){
                        //now write the file and mark it available for download
                        var fileObj = file.create({
                            name: f,
                            fileType: fObj.fileType,
                            contents: fObj.getContents(),
                            encoding: file.Encoding.UTF8,
                            folder: IMAGE_FOLDER,
                            isOnline: true
                        })
                        var fileID = fileObj.save()
                        log.debug({title: 'File fragment saved with ID', details: fileID});
                         fileObj = file.load({id: fileID})
                        //build a JSON array of URLs
                        hrefs.push({scr : getRootUrl(context.request.url) + fileObj.url })
                    }
                }
                //return the JSON to the client
                log.debug({title: 'hrefs', details: hrefs});
                context.response.write (JSON.stringify({output: hrefs}))
            }

            //write the client web page by reading in the HTMLFILE in a GET operation
            if (context.request.method == "GET"){
                var html = file.load({id: HTMLFILE})
                context.response.write ({output: html.getContents()})
            }
        }

        function getRootUrl(url) {
            return url.toString().replace(/^(.*\/\/[^\/?#]*).*$/,"$1");
        }

        return { onRequest : onRequest };

        /*
         * image/png
         * image/jpg,
         * image/jpeg
         * image/gif
         * image/svg+xml
         */

    });
