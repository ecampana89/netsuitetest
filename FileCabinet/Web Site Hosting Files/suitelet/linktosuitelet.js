/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define([ 'N/https', 'N/record', 'N/email', 'N/search' ],
    function callbackFunction(https, record, email, search) {
        function getFunction(context) {
            var contentRequest = https.get({
                url: "https://LinkToFormPage.html" // see the next snippet
            });
            var contentDocument = contentRequest.body;
            var sponsorid = context.request.parameters.sponsorid;
            if (sponsorid && sponsorid != "" && sponsorid != null) {
                contentDocument = contentDocument.replace("{{sponsorid}}", sponsorid);
                log.debug("Setting Sponsor", sponsorid)
            }
            var projectid = context.request.parameters.projectid;
            if (projectid && projectid != "" && projectid != null) {
                contentDocument = contentDocument.replace("{{projectid}}", projectid);
                log.debug("Setting Project", projectid);
            }
            context.response.write(contentDocument);
        }

        function postFunction(context) {
            var params = context.request.parameters;
            var emailString = "First Name: {{firstname}}\nLast Name: {{lastname}}\nEmail: {{email}}\nFacebook URL: {{custentity_fb_url}}"
            var contactRecord = record.create({
                type: "contact",
                isDynamic: true
            });
            for (param in params) {
                if (param === "company") {
                    if (params[param] !== "{{sponsorid}}") {
                        contactRecord.setValue({
                            fieldId: param,
                            value: params[param]
                        });
                        var lkpfld = search.lookupFields({
                            type: "vendor",
                            id: params["company"],
                            columns: [ "entityid" ]
                        });
                        emailString += "\nSponsor: " + lkpfld.entityid;
                    } else {
                        contactRecord.setValue({
                            fieldId: "custentity_sv_shn_isindi",
                            value: true
                        })
                    }
                } else {
                    if (param !== "project") {
                        contactRecord.setValue({
                            fieldId: param,
                            value: params[param]
                        });
                        var replacer = "{{" + param + "}}";
                        emailString = emailString.replace(replacer, params[param]);
                    }
                }
            }
            var contactId = contactRecord.save({
                ignoreMandatoryFields: true,
                enableSourcing: true
            });
            log.debug("Record ID", contactId);
            if (params["project"] && params["project"] !== "" && params["project"] != null && params
                ["project"] !== "{{projectid}}") {
                var lkpfld = search.lookupFields({
                    type: "job",
                    id: params["project"],
                    columns: [ "companyname" ]
                });
                emailString += "\nProject Name: " + lkpfld.companyname;
                var participationRec = record.create({
                    type: "customrecord_project_participants",
                    isDynamic: true
                });
                participationRec.setValue({
                    fieldId: "custrecord_participants_volunteer",
                    value: contactId
                })
                participationRec.setValue({
                    fieldId: "custrecord_participants_project",
                    value: params["project"]
                })
                var participationId = participationRec.save({
                    enableSourcing: true,
                    ignoreMandatoryFields: true
                })
            }
            log.debug("Email String", emailString);
            email.send({
                author: -5,
                recipients: 256,
                subject: "New Volunteer Signed Up",
                body: "A new volunteer has joined:\n\n" + emailString
            });
            email.send({
                author: -5,
                recipients: params["email"],
                subject: "Thank you!",
                body: "Thank you for volunteering:\n\n" + emailString
            });
            var contentRequest = https.get({
                url: "https://LinkToFormCompletePage.html"
            });
            var contentDocument = contentRequest.body;
            context.response.write(contentDocument);
        }

        function onRequestFxn(context) {
            if (context.request.method === "GET") {
                getFunction(context)
            } else {
                postFunction(context)
            }
        }

        return {
            onRequest: onRequestFxn
        };
    });
