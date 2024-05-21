/*global QUnit*/

sap.ui.define([
	"np/registroestudiantes/controller/RegistroEstudiantes.controller"
], function (Controller) {
	"use strict";

	QUnit.module("RegistroEstudiantes Controller");

	QUnit.test("I should test the RegistroEstudiantes controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
