sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], (Controller, JSONModel) => {
    "use strict";

    return Controller.extend("mobileappwebcontainer.controller.View1", {

        onInit() {
            // Initialise the view model with all possible states
            this.getView().setModel(new JSONModel({
                busy: true,
                contextLoaded: false,
                showError: false,
                context: {}
            }), "view");

            this._loadContext();
        },

        /**
         * Fetch the FSM Mobile session context stored by the backend.
         *
         * The backend captures it when FSM Mobile POSTs to
         * /web-container-access-point and stores it in memory.
         * The frontend retrieves it here via GET /web-container-context.
         *
         * Possible outcomes:
         *  - 200 → context available, populate the view
         *  - 404 → app opened directly in browser (no POST received yet)
         *  - other error → treat as no-context
         */
        _loadContext() {
            const oModel = this.getView().getModel("view");

            fetch("/web-container-context")
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }
                    return response.json();
                })
                .then(context => {
                    oModel.setProperty("/context", context);
                    oModel.setProperty("/contextLoaded", true);
                    oModel.setProperty("/busy", false);

                    console.log("FSM context loaded:", {
                        user: context.userName,
                        company: context.companyName,
                        objectType: context.objectType
                    });
                })
                .catch(error => {
                    console.warn("FSM context not available:", error.message);
                    oModel.setProperty("/showError", true);
                    oModel.setProperty("/busy", false);
                });
        }

    });
});