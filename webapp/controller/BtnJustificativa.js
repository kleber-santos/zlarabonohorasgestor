sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	"sap/ui/core/UIComponent"
], function (ManagedObject, MessageBox, Utilities, History) {

	return ManagedObject.extend("whr.com.br.ZLARAbonoHorasGestor.controller.BtnJustificativa", {
		constructor: function (oView) {
			this._oView = oView;
			this._oControl = sap.ui.xmlfragment(oView.getId(), "whr.com.br.ZLARAbonoHorasGestor.view.BtnJustificativa", this);
			this._bInit = false;
		},

		exit: function () {
			delete this._oView;
		},

		getView: function () {
			return this._oView;
		},

		getControl: function () {
			return this._oControl;
		},

		getOwnerComponent: function () {
			return this._oView.getController().getOwnerComponent();
		},

		open: function () {
			var oView = this._oView;
			var oControl = this._oControl;

			if (!this._bInit) {

				// Initialize our fragment
				this.onInit();

				this._bInit = true;

				// connect fragment to the root view of this component (models, lifecycle)
				oView.addDependent(oControl);
			}

			var args = Array.prototype.slice.call(arguments);
			if (oControl.open) {
				oControl.open.apply(oControl, args);
			} else if (oControl.openBy) {
				oControl.openBy.apply(oControl, args);
			}
		},

		close: function () {
			this._oControl.close();
		},

		setRouter: function (oRouter) {
			this.oRouter = oRouter;

		},
		getBindingParameters: function () {
			return {};

		},
/*		_onDialogAfterClose: function (oEvent) {
		
			var oBindingContext = oEvent.getSource().getBindingContext();

			return new Promise(function (fnResolve) {

				this.doNavigate("Worklist", oBindingContext, fnResolve, "");
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});

		},*/

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel2: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},
/*		doNavigate: function (sRouteName, oBindingContext, fnPromiseResolve, sViaRelation) {
			var sPath = (oBindingContext) ? oBindingContext.getPath() : null;
			var oModel = (oBindingContext) ? oBindingContext.getModel() : null;

			var sEntityNameSet;
			if (sPath !== null && sPath !== "") {
				if (sPath.substring(0, 1) === "/") {
					sPath = sPath.substring(1);
				}
				sEntityNameSet = sPath.split("(")[0];
			}
			var sNavigationPropertyName;
			var sMasterContext = this.sMasterContext ? this.sMasterContext : sPath;

			if (sEntityNameSet !== null) {
				//sNavigationPropertyName = sViaRelation || this.getOwnerComponent().getNavigationPropertyForNavigationWithContext(sEntityNameSet,
				//	sRouteName);
			}
			if (sNavigationPropertyName !== null && sNavigationPropertyName !== undefined) {
				if (sNavigationPropertyName === "") {
					this.oRouter.navTo(sRouteName, {
						context: sPath,
						masterContext: sMasterContext
					}, false);
				} else {
					oModel.createBindingContext(sNavigationPropertyName, oBindingContext, null, function (bindingContext) {
						if (bindingContext) {
							sPath = bindingContext.getPath();
							if (sPath.substring(0, 1) === "/") {
								sPath = sPath.substring(1);
							}
						} else {
							sPath = "undefined";
						}

						// If the navigation is a 1-n, sPath would be "undefined" as this is not supported in Build
						if (sPath === "undefined") {
							this.oRouter.navTo(sRouteName);
						} else {
							this.oRouter.navTo(sRouteName, {
								context: sPath,
								masterContext: sMasterContext
							}, false);
						}
					}.bind(this));
				}
			} else {
				this.oRouter.navTo(sRouteName);
				//this.oRouter.navTo("worklist_teste", {objectId: "teste"});
			}

			if (typeof fnPromiseResolve === "function") {
				fnPromiseResolve();
			}
			
			

		},*/
		_onButtonPress: function () {
			//VIES
			var lv_periodo,
			    lv_emp,
			    lv_gest;
			    
			var index = sap.ui.getCore().getModel("indexModel").oData.index; // index da linha atual
			var justificativaModel = sap.ui.getCore().getModel("justificativaModel"); //ler dados da justificativa para atualizar 

			lv_periodo = this.getView().byId("Periodo_teste").getSelectedKey();
			lv_emp     = this.getView().byId("justivicativaEmp_teste").getValue();
			lv_gest    = this.getView().byId("justivicativaGest_teste").getValue();
			this._teste = [];
			
			//atualiza novos valores
			if(justificativaModel.oData.length === undefined){
				this._teste[0] = 
					   {index: index,
					    Atext: lv_periodo,
					    Message: lv_emp,
					    justivicativaGest: lv_gest
					};

					justificativaModel.setData(this._teste);
			}else{
			for (var i = 0; i < justificativaModel.oData.length; i ++){
				if( index === justificativaModel.oData[i].index){
					this._teste[i] = 
					   {index: index,
					    Atext: lv_periodo,
					    Message: lv_emp,
					    justivicativaGest: lv_gest
					};

					justificativaModel.setData(this._teste);
				}
			}

			}

			//VIES
			this.close();

		},
		_onButtonPress1: function () {

			this.close();

		},
		onInit: function () {

			this._oDialog = this.getControl();

		},
		onExit: function () {
			this._oDialog.destroy();

		}

	});
}, /* bExport= */ true);