sap.ui.define([
	"sap/ui/test/Opa5"
], function(Opa5) {
	"use strict";

	return Opa5.extend("whr.com.br.ZLARAbonoHorasGestor.test.integration.pages.Common", {

		createAWaitForAnEntitySet : function  (oOptions) {
			return {
				success: function () {
					var bMockServerAvailable = false,
						aEntitySet;

					this.getMockServer().then(function (oMockServer) {
						aEntitySet = oMockServer.getEntitySetData(oOptions.entitySet);
						bMockServerAvailable = true;
					});

					return this.waitFor({
						check: function () {
							return bMockServerAvailable;
						},
						success : function () {
							oOptions.success.call(this, aEntitySet);
						}
					});
				}
			};
		},

		getMockServer : function () {
			return new Promise(function (success) {
				Opa5.getWindow().sap.ui.require(["whr/com/br/ZLARAbonoHorasGestor/localService/mockserver"], function (mockserver) {
					success(mockserver.getMockServer());
				});
			});
		}

	});

});