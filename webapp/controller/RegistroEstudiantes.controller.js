jQuery.sap.require("sap.m.MessageBox");
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/ui/model/json/JSONModel',
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel) {
        "use strict";

        return Controller.extend("np.registroestudiantes.controller.RegistroEstudiantes", {
            onInit: function () {
                this.zfsTipoDocModel();
                this.zfsGenero();
                this.zfEstadoCivil();

                this.aUpdateEstudiante = false;

                if (screen.width >= 500) {
                    var _IDGenToolbar1 = this.getView().byId("_IDGenToolbar1");
                    _IDGenToolbar1.mProperties.visible = false;
                }
            },
            onSaveStudent: function () {
                var oView = this.getView();
                var oEstudiante = {};
                var oModel = oView.getModel();
                var aSaveEstudiante = false;

                oEstudiante.Cedula = oView.byId("oINumeroDocumento").getValue();
                oEstudiante.Facultadid = oView.byId("oSFacultadList").getSelectedItem().mProperties.key;
                oEstudiante.Tipocc = oView.byId("oSTipoDocumento").getSelectedItem().mProperties.key;
                oEstudiante.Tipoprogramaid = oView.byId("oSTipoPrograma").getSelectedItem().mProperties.key;
                oEstudiante.FNombre = oView.byId("oIPrimerNombre").getValue();
                oEstudiante.SNombre = oView.byId("oISegundoNombre").getValue();
                oEstudiante.FApellido = oView.byId("oIPrimerApellido").getValue();
                oEstudiante.SApellido = oView.byId("oISegundoApellido").getValue();

                oModel.create("/Estudiante_Set", oEstudiante, {
                    method: "POST",
                    success: function (data) {
                        sap.m.MessageToast.show("Estudiante almacenado correctamente", {
                            duration: 4000
                        });
                        $(".sapMMessageToast").addClass("sapMMessageToastSuccess");
                    },
                    error: function (data) {
                        sap.m.MessageToast.show("Error al almacenar Estudiante", {
                            duration: 4000
                        });
                        $(".sapMMessageToast").addClass("sapMMessageToastDanger");
                    },
                });
            },

            onSelectionFacultadChange: function (oEvent) {
                var that = this;
                var oView = this.getView(),
                    sPath;
                //$("#" + oView.byId("icsEntrevista").getId()).css("visibility", "hidden");
                var item = sap.ui.getCore().getControl(oEvent.getSource().getId()).getSelectedItem();
                // Get del componente de Select de pantalla con ese ID
                var oSTipoPrograma = oView.byId("oSTipoPrograma");
                oSTipoPrograma.unbindItems(); // Eliminar los datos del select
                var oModel = item.getModel(); // Get del Model Actual
                // Get del contexto , Path , seleccion etc
                var oContext = item.getBindingContext();
                if (item.getKey() == 'F0000') {
                    return;
                }
                // Armoe l path con la associación al Tipo de Programa
                sPath = oContext.getPath() + '/ToTipoPrograma';
                var oItems = new sap.ui.core.ListItem();
                oItems.bindProperty("text", "NombrePrograma");
                oItems.bindProperty("key", "Tipoprogramaid");
                oSTipoPrograma.setModel(oModel);
                var BusyDialog = oView.byId("BusyDialog");
                BusyDialog.open();
                oSTipoPrograma.bindAggregation("items", {
                    path: sPath,
                    template: oItems,
                    events: {
                        dataReceived: function () {
                            var oItemLength = oSTipoPrograma.getItems();
                            if (oItemLength.length === 0) {
                                var text = "En este momento la Facultad " + item.getText() +
                                    " no tiene programas asignados, por favor comunicate con la Universidad";
                                //      sap.m.MessageToast.show(text);
                                that.zfshowDialog(text);
                                BusyDialog.close();
                            }
                            BusyDialog.close();
                        }
                    }
                });


            },
            zgf_handleIconTabBarSelect: function (oEvent) {   
                return;             
                var oView = this.getView()
                var Form = this.byId("oSFDatosInscripcion");
                // Obtener Tab Key seleccionado
                var sKey = oEvent.getParameters().key;
                var oITBMenu = oView.byId("oITBMenu");
                var oTab = oITBMenu.getSelectedKey();
                var ztab = this.zfgetTabPos(sKey);

                // SI es primer TAB no valida                
                if (ztab == 0) {
                    return;
                }

                // Validar formularios anteriores a ese tab
                var IserrorForm = true;
                --ztab;
                do {
                    if (!this.zfvalForm(this.zfgetTabPos_s(ztab))) {
                        IserrorForm = false;
                    } else {
                        ++ztab;
                        break;
                    }
                    ztab = ztab - 1;
                } while (ztab >= 0);

                (ztab < 0) ? ++ztab : ztab;

                // SI encuentra error posicionar TAB con primer error
                if (!IserrorForm) {
                    this.zfgoToTab(oITBMenu, this.zfgetTabPos_s(ztab));
                    this.zfshowDialog("Complete los datos requeridos de esta pestaña");
                    return;
                }

                // Traer campos de las pestañas anteriores
                this.zforganizarinfo(ztab);
            },
            // ir a pestaña
            zfgoToTab: function (idIconTabBar, tab) {
                // this.showDialog("complete los datos de esta pestaña");
                var iTabPos = this.zfgetTabPos(tab);
                idIconTabBar.fireSelect({
                    item: idIconTabBar.getItems()[iTabPos],
                    key: tab
                });
                idIconTabBar.setSelectedKey(tab);
            },
            //obtener posicion de tab
            zfgetTabPos: function (sKey) {
                switch (sKey) {
                    case "oITFDatosInscripcion":
                        return 0;
                    case "oITFDatosPersonales":
                        return 1;
                    case "oITFDatosAcademicos":
                        return 2;
                }
            },
            //obtener posicion de tab
            zfgetTabPos_s: function (sKey) {
                switch (sKey) {
                    case 0:
                        return "oITFDatosInscripcion";
                    case 1:
                        return "oITFDatosPersonales";
                    case 2:
                        return "oITFDatosAcademicos";
                }
            },
            // Validar formulario 
            zfvalForm: function (sKey) {
                var sValue;
                var sIncomplete = true;
                var oView = this.getView();
                // Traer datos del TAB ingresado al metodo
                var oITFactual = oView.byId(sKey);
                var oContent = oITFactual.getContent();
                // recorer componentes de pantalla del TAB 
                oContent = oContent[0].getContent(); // Contenido del panel
                oContent = oContent[0].getContent(); // Contenido del ScrollContainer
                // Los form que encuentre dentro del ScrollCOntainer
                $.each(oContent, function (iEIndex, oForm) {
                    var that = this;
                    // Validar si es FORM
                    if (oForm.getFormContainers) {
                        var oContainers = oForm.getFormContainers();
                        $.each(oContainers, function (index, oFormContainer) {
                            $.each(oFormContainer.getFormElements(), function (iElIndex, oElement) {
                                $.each(oElement.getFields(), function (index, oField) {
                                    var oLabel = oView.byId(oField.getId());
                                    if (oLabel.mProperties.required === true) {
                                        var oInput = oView.byId(oLabel.__sLabeledControl);
                                        sValue = "";
                                        if (oInput.getValue) {
                                            sValue = oInput.getValue();
                                        } else if (oInput.getSelectedItem) {
                                            var oItem = sap.ui.getCore().getControl(oLabel.__sLabeledControl).getSelectedItem();
                                            if (oItem !== null) {
                                                // console.log(oItem.mProperties.key);
                                                // console.log(oItem.mProperties.text);
                                                sValue = oItem.mProperties.text;
                                            }
                                        } else if (oInput.getMetadata().getName() === "sap.m.RadioButtonGroup") {
                                            sValue = "OK";
                                        }
                                        // Validar que los parametros de entrada requeridos esten diligenciados
                                        if (sValue === "") {
                                            if (oInput.setValueState) {
                                                oInput.setValueState(sap.ui.core.ValueState.Error);
                                                sIncomplete = false;
                                            } else {
                                                oInput.addStyleClass("danger");
                                                sIncomplete = false;
                                            }
                                        } else {
                                            if (oInput.setValueState) {
                                                oInput.setValueState(sap.ui.core.ValueState.None);
                                            } else {
                                                oInput.removeStyleClass("danger");
                                            }
                                        }
                                    }

                                });
                            });
                        });
                    } else {
                        // recorrer los elementos del SimpleForm validar los requeridos
                        // que esten lleno          
                        $.each(oForm._aElements, function (iElIndex, oElement) {
                            if (oElement.sParentAggregationName === "label") {
                                if (oElement.mProperties.required === true) {
                                    var oInput = oView.byId(oElement.__sLabeledControl);
                                    sValue = "";
                                    if (oInput.getValue) {
                                        sValue = oInput.getValue();
                                    } else if (oInput.getSelectedItem) {
                                        var oItem = sap.ui.getCore().getControl(oElement.__sLabeledControl).getSelectedItem();
                                        if (oItem !== null) {
                                            sValue = oItem.mProperties.text;
                                        }
                                    } else if (oInput.getMetadata().getName() === "sap.m.RadioButtonGroup") {
                                        sValue = "OK";
                                    }
                                    // Validar que los parametros de entrada requeridos esten diligenciados
                                    if (sValue === "") {
                                        if (oInput.setValueState) {
                                            oInput.setValueState(sap.ui.core.ValueState.Error);
                                            sIncomplete = false;
                                        } else {
                                            oInput.addStyleClass("danger");
                                            sIncomplete = false;
                                        }
                                    } else {
                                        if (oInput.setValueState) {
                                            oInput.setValueState(sap.ui.core.ValueState.None);
                                        } else {
                                            oInput.removeStyleClass("danger");
                                        }
                                    }
                                }
                            }
                        });
                    }
                });
                return sIncomplete;
            },
            //mostrar mensaje
            zfshowDialog: function (oText) {
                sap.m.MessageToast.show(oText, {
                    duration: 4000
                });
                $(".sapMMessageToast").addClass("sapMMessageToastDanger");
            },
            // Model Tipo de documento 
            zfsTipoDocModel: function () {
                var aTipoDoc =
                {
                    "TipoDocumento": [
                        {
                            "key": "TD0000",
                            "value": ""
                        },
                        {
                            "key": "TD0001",
                            "value": "Cedula"
                        },
                        {
                            "key": "TD0002",
                            "value": "Cedula de Extranjería"
                        },
                        {
                            "key": "TD0003",
                            "value": "Pasaporte"
                        }
                    ]
                }

                var oModel = new JSONModel(aTipoDoc);
                this.getView().setModel(oModel, "tipodocModel");
            },
            zfsGenero: function () {
                var oGenero = {
                    "Genero": [
                        {
                            "key": "GE0000",
                            "value": ""
                        },
                        {
                            "key": "GE0001",
                            "value": "Masculino"
                        },
                        {
                            "key": "GE0002",
                            "value": "Femenino"
                        }
                    ]
                };

                var oModel = new JSONModel(oGenero);
                this.getView().setModel(oModel, "generoModel");
            },
            zfEstadoCivil: function () {
                var oEstadoCivil = {
                    "EstadoCivil": [
                        {
                            "key": "EC0000",
                            "value": ""
                        },
                        {
                            "key": "EC0001",
                            "value": "Soltero"
                        },
                        {
                            "key": "EC0002",
                            "value": "Casado"
                        },
                    ]
                };

                var oModel = new JSONModel(oEstadoCivil);
                this.getView().setModel(oModel, "estadocivilModel");
            },
            zforganizarinfo: function (ztab) {
                var oView = this.getView();
                var BusyDialog = oView.byId("BusyDialog");
                BusyDialog.open();
                switch (ztab) {
                    case 1:
                        var vDocumento = oView.byId("oINumeroDocumento");
                        var vDocP = oView.byId("oINumeroDocumento_d");
                        vDocP.setValue(vDocumento.getValue());
                        var vTpDoc = oView.byId("oSTipoDocumento").getSelectedItem();
                        var vTpDoc_d = oView.byId("oITipoDOcumento");
                        vTpDoc_d.setValue(vTpDoc.mProperties.text);

                        // BUscar si el Estudiante existe
                        this.zfBuscarEstudiante();
                        break;
                    case 2:
                        this.onSaveStudent();
                        break;

                    default:
                        break;
                };
                BusyDialog.close();
                return;
            },
            zfBuscarEstudiante: function () {
                var oView = this.getView();
                var vDocumento = oView.byId("oINumeroDocumento");
                var vPath = "/Estudiante_Set('" + vDocumento.getValue() + "')";
                var oModel = oView.getModel();
                var oITFDatosPersonales = oView.byId('oITFDatosPersonales');
                oITFDatosPersonales.unbindElement();
                oModel.read(vPath, {
                    method: "GET",
                    success: function (oData) {
                        oITFDatosPersonales.bindElement(vPath);
                    }.bind(this),
                    error: function (oError) {
                        console.log(oError);
                    }
                });

                //     var oITFDatosPersonales = oView.byId('oITFDatosPersonales');
                //     oITFDatosPersonales.unbindElement();
                //     oITFDatosPersonales.bindElement(vPath);
            }

        });
    });
