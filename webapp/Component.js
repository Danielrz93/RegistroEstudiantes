/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
        "sap/ui/core/UIComponent",
        "sap/ui/Device",
        "np/registroestudiantes/model/models",
        "sap/ui/model/BindingMode"
    ],
    function (UIComponent, Device, models , BindingMode) {
        "use strict";

        return UIComponent.extend("np.registroestudiantes.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                // // enable routing
                this.getRouter().initialize();

                // set the device model
                this.setModel(models.createDeviceModel(), "device");
                this.getModel().setDefaultBindingMode(BindingMode.OneWay);
            }
        });
    }
);