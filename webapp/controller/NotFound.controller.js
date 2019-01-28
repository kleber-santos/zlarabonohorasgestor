sap.ui.define([
	"whr/com/br/ZLARAbonoHorasGestor/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("whr.com.br.ZLARAbonoHorasGestor.controller.NotFound", {

			onInit: function () {
				this.getRouter().getTarget("notFound").attachDisplay(this._onNotFoundDisplayed, this);
			},

			_onNotFoundDisplayed : function () {
					this.getModel("appView").setProperty("/layout", "OneColumn");
			}
		});
	}
);