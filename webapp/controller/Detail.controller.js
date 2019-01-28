/*global location */
sap.ui.define([
	"whr/com/br/ZLARAbonoHorasGestor/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"whr/com/br/ZLARAbonoHorasGestor/model/formatter",
	'sap/m/MessageBox',
	"./Justificativa",
	"./BtnJustificativa",
	"./utilities",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Filter",
	"./InserirRegistro"
], function (BaseController, JSONModel, formatter, MessageBox, Justificativa, BtnJustificativa, Utilities,FilterOperator, Filter, InserirRegistro) {
	"use strict";
 
	return BaseController.extend("whr.com.br.ZLARAbonoHorasGestor.controller.Detail", {
				

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		onInit: function () {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var oViewModel = new JSONModel({
				busy: false,
				delay: 0
			});

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

			this.setModel(oViewModel, "detailView");

			this.getOwnerComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
		},
		
	

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler when the share by E-Mail button has been clicked
		 * @public
		 */
		onSendEmailPress: function () {
			var oViewModel = this.getModel("detailView");

			sap.m.URLHelper.triggerEmail(
				null,
				oViewModel.getProperty("/shareSendEmailSubject"),
				oViewModel.getProperty("/shareSendEmailMessage")
			);
		},

		/* =========================================================== */
		/* begin: internal methods                                     */
		/* =========================================================== */

		/**
		 * Binds the view to the object path and expands the aggregated line items.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function (oEvent) {
			var sObjectId = oEvent.getParameter("arguments").objectId;
			window.pernr = sObjectId; 
			this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
			this.getModel().metadataLoaded().then(function () {
				var sObjectPath = this.getModel().createKey("SUBORDINADOSSet", {
					Objid: sObjectId
				});
				this._bindView("/" + sObjectPath);
			}.bind(this));
			
			this.carregarPeriodo();
		},

		/**
		 * Binds the view to the object path. Makes sure that detail view displays
		 * a busy indicator while data for the corresponding element binding is loaded.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound to the view.
		 * @private
		 */
		_bindView: function (sObjectPath) {
			// Set busy indicator during view binding
			var oViewModel = this.getModel("detailView");

			// If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
			oViewModel.setProperty("/busy", false);

			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function () {
						oViewModel.setProperty("/busy", true);
					},
					dataReceived: function () {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},

		_onBindingChange: function () {
			var oView = this.getView(),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				//this.getRouter().getTargets().display("detailObjectNotFound");
				// if object could not be found, the selection in the master list
				// does not make sense anymore.
				this.getOwnerComponent().oListSelector.clearMasterListSelection();
				return;
			}

			var sPath = oElementBinding.getPath(),
				oResourceBundle = this.getResourceBundle(),
				oObject = oView.getModel().getObject(sPath),
				sObjectId = oObject.Objid,
				sObjectName = oObject.Stext,
				oViewModel = this.getModel("detailView");

			this.getOwnerComponent().oListSelector.selectAListItem(sPath);

			oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
		},

		_onMetadataLoaded: function () {
			// Store original busy indicator delay for the detail view
			var iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay(),
				oViewModel = this.getModel("detailView");

			// Make sure busy indicator is displayed immediately when
			// detail view is displayed for the first time
			oViewModel.setProperty("/delay", 0);

			// Binding the view will set it to not busy - so the view is always busy if it is not bound
			oViewModel.setProperty("/busy", true);
			// Restore original busy indicator delay for the detail view
			oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
		},

		/**
		 * Set the full screen mode to false and navigate to master page
		 */
		onCloseDetailPress: function () {
			this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
			// No item should be selected on master after detail page is closed
			this.getOwnerComponent().oListSelector.clearMasterListSelection();
			this.getRouter().navTo("master");
		},
		onchangeComboPeriodo: function (oEvent) {
			var periodoID = oEvent.getParameter("selectedItem").getKey();

			var globalModel = new sap.ui.model.json.JSONModel();
			globalModel.setData({
				periodo: periodoID,
			});
			sap.ui.getCore().setModel(globalModel, 'global2');

		},

		onJustificativaDialog: function (oEvent) {
			var sDialogName = "Justificativa";
			this.mDialogs = this.mDialogs || {};
			var oDialog = this.mDialogs[sDialogName];

			if (this.checkTableSelecionado() == false) {
				var bCompact = !!this.getView().$().closest("sapUISizeCompact").length;
				MessageBox.error('Selecione pelo menos 1 item na tabela!', {
						StyleClass: bCompact ? "sapUISizeCompact" : ""
					}

				);
			} else {
				var oTable = this.byId("table").getItems();

				if (!oDialog) {
					oDialog = new Justificativa(this.getView());
					this.mDialogs[sDialogName] = oDialog;

					// For navigation.
					oDialog.setRouter(this.oRouter);
				}
				oDialog.open();
			}
		},
		carregarBtnJustificativa: function (oEvent) {
			// if (!this._oPopover) {
			// 	this._oPopover = sap.ui.xmlfragment("whr.com.br.view.Popover", this);
			// 	//this._oPopover.bindElement("/ProductCollection/0");
			// 	this.getView().addDependent(this._oPopover);
			// }

			var sDialogName = "BtnJustificativa";
			this.mDialogs = this.mDialogs || {};
			var oDialog = this.mDialogs[sDialogName];
			var tb = this.getView().byId("table");
			var rowid = tb.setSelectedKey;

			if (!oDialog) {
				oDialog = new BtnJustificativa(this.getView());
				this.mDialogs[sDialogName] = oDialog;

				// For navigation.
				oDialog.setRouter(this.oRouter);
			}

			var justificativaModel = sap.ui.getCore().getModel("justificativaModel");
			//oDialog.setModel(justificativaModel);

			oDialog.open();
			//Limpa tela
			//this.getView().byId("Motivo2").setSelectedKey(null);
			this.getView().byId("justificativa2").setValue(null);
			//this.getView().byId("justivicativaGest_teste").setValue(null);

			var index = parseInt(oEvent.getSource().getParent().getCells()[8].getText());

			/*			var indexModel = new sap.ui.model.json.JSONModel(); // VIES
						sap.ui.getCore().setModel(indexModel, 'indexModel'); // VIES

						indexModel.setData({
							index: index
						});

						var oLinhas = this.byId("table").getItems().length;

						for (var i = 0; i < oLinhas; i++) {
							if (i === index) {
								for (var y = 0; y < justificativaModel.oData.length; y++) {
									if (i === y && y === justificativaModel.oData[y].index) {*/
			//this.getView().byId("Motivo2").setSelectedKey(oEvent.getSource().getParent().getCells()[9].getText());
			this.getView().byId("justificativa2").setValue(oEvent.getSource().getParent().getCells()[10].getText());
			//this.getView().byId("justivicativaGest_teste").setValue(justificativaModel.oData[y].justivicativaGest);
			/*				}
						}

					}
				}*/

		},

		onInserirRegistro: function () {

			var sDialogName = "InserirRegistro";
			this.mDialogs = this.mDialogs || {};
			var oDialog = this.mDialogs[sDialogName];

			if (this.checkTableSelecionado() == false) {
				var bCompact = !!this.getView().$().closest("sapUISizeCompact").length;
				MessageBox.error('Selecione pelo menos 1 item na tabela!', {
						StyleClass: bCompact ? "sapUISizeCompact" : ""
					}

				);
			} else {

				if (!oDialog) {
					oDialog = new InserirRegistro(this.getView());
					this.mDialogs[sDialogName] = oDialog;

					// For navigation.
					oDialog.setRouter(this.oRouter);
				}
				oDialog.open();
			}
		},

		formatTime: function (time) {
			var timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({
				pattern: "HH:mm"
			});
			var TZOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000;
			var timeStr = timeFormat.format(new Date(time.ms + TZOffsetMs));
			return timeStr;
		},
		formatDate: function (v) {

			jQuery.sap.require("sap.ui.core.format.DateFormat");

			var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
				pattern: "dd/MM/YYYY"
			});

			return oDateFormat.format(new Date(v));

		},
		checkTableSelecionado: function () {

			var oTable,
				lv_selected,
				retorno = false;

			oTable = this.byId("table").getItems();

			for (var i = 0; i < oTable.length; i++) {
				lv_selected = '';
				lv_selected = oTable[i].getSelected();
				if (lv_selected === true) {
					retorno = true;
				}
			}
			return retorno;
		},

		initCabecalho: function () {

			try {

				var sServiceUrl = "/sap/opu/odata/SAP/ZLAR_TIMEWEB_SRV";
				// create OData model instance with service URL and JSON format
				var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);

				var that = this;
				that.getView().setBusy(true);

				oModel.read("/CABECALHO_PERFILSet('00100059')",
					undefined,
					undefined,
					false,
					function _OnSuccess(oData, response) {
						var jSONModel = new sap.ui.model.json.JSONModel();

						jSONModel.setData(oData);
						that.getView().setModel(jSONModel, "cabecalhoModel");
					},
					function _OnError(oError) {}
				);

			} catch (ex) {}
			that.getView().setBusy(false);
		},
		onAprovacao: function (oEvent) {
			var sServiceUrl = "/sap/opu/odata/SAP/ZLAR_TIMEWEB_SRV";
			var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);

			var requestBody = {};
			var child = [];

			var oTable = this.getView().byId("table");
			var itemsSelected = oTable.getSelectedItems();

			for (var i = 0; i < itemsSelected.length; i++) {

				var item = itemsSelected[i];

				var context = item.getBindingContext();

				child.push({
					Pernr: context.getProperty("Pernr"),
					Cname: context.getProperty("Cname"),
					Persk: context.getProperty("Persk"),
					ZlDtocor: context.getProperty("ZlDtocor"),
					Diasemana: context.getProperty("Diasemana"),
					ZlBeguz: context.getProperty("ZlBeguz"),
					ZlEnduz: context.getProperty("ZlEnduz"),
					Vtken: context.getProperty("Vtken"),
					ZLgart: context.getProperty("ZLgart"),
					TpOcor: context.getProperty("TpOcor"),
					Awart: context.getProperty("Awart"),
					ZlLgart: context.getProperty("ZlLgart"),
					Lgtxt: context.getProperty("Lgtxt"),
					ZlAnzhl: context.getProperty("ZlAnzhl"),
					Hrgmt: context.getProperty("Hrgmt"),
					PspPhtd: context.getProperty("PspPhtd"),
					PspPhtdtx: context.getProperty("PspPhtdtx"),
					Sobeg: context.getProperty("Sobeg"),
					Pabeg: context.getProperty("Pabeg"),
					Paend: context.getProperty("Paend"),
					Soend: context.getProperty("Soend"),
					Newbegtm: context.getProperty("Newbegtm"),
					Newendtm: context.getProperty("Newendtm"),
					Cdmot: context.getProperty("Cdmot"),
					Type: context.getProperty("	Type"),
					Message: context.getProperty("Message"),
				});

			}

			requestBody.Pernr = '00100072';

			requestBody.ABONO_SAVE2Set = child;

			oModel.create("/DADOS_SAVESet", requestBody, {
				success: (function (oData, response) {
					sap.m.MessageBox.success("Gravado com sucesso!", {
						title: "Sucesso",
						initialFocus: null
					});
				}),
				error: function (Error) {

					var message = JSON.parse(Error.response.body);

					var msgText = message.error.message.value;

					sap.m.MessageBox.error(msgText, {
						title: "Erro",
						initialFocus: null
					});
				}
			});

		},
		onPesquisar: function (oEvent) {
			var begda;
			var endda;
			var globalModel = sap.ui.getCore().getModel("global2");
			var periodoModel = this.getView().getModel("periodoModel");
			var cabecalhoModel = this.getView().getModel("cabecalhoModel");

			var pernr = window.pernr;
			var periodoID = globalModel.oData.periodo;

			for (var y = 0; y < periodoModel.oData.results.length; y++) {
				if (periodoID == periodoModel.oData.results[y].CodPer) {
					begda = periodoModel.oData.results[y].Begda;
					endda = periodoModel.oData.results[y].Endda;

				}
			}

			var that = this;
			that.getView().setBusy(true);

			var aFilters = [];

			aFilters.push(new Filter("Begda", FilterOperator.EQ, begda));
			aFilters.push(new Filter("Endda", FilterOperator.EQ, endda));
			aFilters.push(new Filter("PernrLog", FilterOperator.EQ, pernr));

			var oBinding = this.byId("table").getBinding("items");
			oBinding.filter(aFilters);
			that.getView().setBusy(false);

			/*try {

						var sServiceUrl = "/sap/opu/odata/SAP/ZLAR_TIMEWEB_SRV";
						// create OData model instance with service URL and JSON format
						var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);

						var that = this;
				
						oModel.read("/ABONO_ITEMSSet", {
						filters: aFilters,
						error: function(err) {
							that.getView().setBusy(false);
							MessageBox.error(JSON.parse(err.responseText).error.message.value);
						},
						success: function(oData) {
							
							
							
						}
					});
						
						
						
						

					} catch (ex) {}
					that.getView().setBusy(false);
					
				*/
		},
				carregarPeriodo: function () {

			try {

				var sServiceUrl = "/sap/opu/odata/SAP/ZLAR_TIMEWEB_SRV";
				// create OData model instance with service URL and JSON format
				var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);

				var that = this;
				that.getView().setBusy(true);

				oModel.read("/PERIODOSet",
					undefined,
					undefined,
					false,
					function _OnSuccess(oData, response) {
						var jSONModel = new sap.ui.model.json.JSONModel();

						jSONModel.setData(oData);
						that.getView().setModel(jSONModel, "periodoModel");
					},
					function _OnError(oError) {}
				);

				var periodo = this.getView().getModel("periodoModel");
				var periodo2 = this.getView().getModel("periodoModel").getProperty("/");

				$.map(periodo2, function (obj, index) {

				});

				//oModel.read("/CABECALHO_PERFILSet('1')", { success : (oData, response) => { debugger; } });

			} catch (ex) {}
			that.getView().setBusy(false);
		},

		onUpdateFinished: function (oEvent) {
			// update the worklist's object counter after the table update
			var sTitle,
				oTable = oEvent.getSource(),
				iTotalItems = oEvent.getParameter("total");
			// only update the counter if the length is final and
			// the table is not empty
			/*if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
				sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
			} else {
				sTitle = this.getResourceBundle().getText("worklistTableTitle");
			}
			this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
			*/
			//VIES
			var oTable,
				lv_selected,
				globalMotivoModel,
				globalInserirModel;

			oTable = this.byId("table").getItems();
			globalMotivoModel = sap.ui.getCore().getModel("globalMotivoModel");
			globalInserirModel = sap.ui.getCore().getModel('global_inserir');
			var that = this;
			this._teste = [];

			/* Início Setar dados selecionados no botão Justificativa */
			if (globalMotivoModel != undefined) {

				for (var i = 0; i < iTotalItems; i++) {
					lv_selected = '';
					lv_selected = oTable[i].getSelected();

					oTable[i].getCells()[8].setText(i); // seta index da linha

					//this.byId("Time01").setText("Teste");
					if (lv_selected === true) {

						if (globalMotivoModel != undefined) {

							//oTable[i].getCells()[9].setText(globalMotivoModel.oData.motivo);
							oTable[i].getCells()[10].setText(globalMotivoModel.oData.justificativaEmp);

						}
					}
				}
			}
			/* Fim Setar dados selecionados no botão Justificativa */

			if (globalInserirModel != undefined) {
				//var x = this.getView().getModel().getProperty(oTable[i].getBindingContext().getPath());
				//x.ZlBeguz.ms = globalInserirModel.oData.hora_entrada;

				//this.getView().getModel().setProperty(oTable[i].getBindingContext().getPath(), x);
				//this.getView().getModel().refresh(true);

				var timeFormat = sap.ui.core.format.DateFormat.getTimeInstan10e({
					pattern: "KK:mm"
				});
				var TZOffsetMs = new Date(0).getTimezoneOffset() * 60 * 1000;

				var horaInicio = timeFormat.format(new Date(globalInserirModel.oData.hora_entrada + TZOffsetMs));
				var horaSaida = timeFormat.format(new Date(globalInserirModel.oData.hora_saida + TZOffsetMs));

				oTable[i].getCells()[3].getItems()[0].getItems()[0].setText(horaInicio);
				oTable[i].getCells()[3].getItems()[0].getItems()[4].setText(horaSaida);
				//oTable[i].getCells()[8].setText();

			}

			//VIES
		},

		/**
		 * Toggle between full and non full screen mode.
		 */
		toggleFullScreen: function () {
			var bFullScreen = this.getModel("appView").getProperty("/actionButtonsInfo/midColumn/fullScreen");
			this.getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", !bFullScreen);
			if (!bFullScreen) {
				// store current layout and go full screen
				this.getModel("appView").setProperty("/previousLayout", this.getModel("appView").getProperty("/layout"));
				this.getModel("appView").setProperty("/layout", "MidColumnFullScreen");
			} else {
				// reset to previous layout
				this.getModel("appView").setProperty("/layout", this.getModel("appView").getProperty("/previousLayout"));
			}
		}
	});

});