sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/m/MessageBox",
	"./utilities",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel",
], function(ManagedObject, MessageBox, Utilities, History, JSONModel) {

	return ManagedObject.extend("whr.com.br.ZLARAbonoHorasGestor.controller.InserirRegistro", {
		constructor: function(oView) {
			this._oView = oView;
			this._oControl = sap.ui.xmlfragment(oView.getId(), "whr.com.br.ZLARAbonoHorasGestor.view.InserirRegistro", this);
			this._bInit = false;
		},

		exit: function() {
			delete this._oView;
		},

		getView: function() {
			return this._oView;
		},

		getControl: function() {
			return this._oControl;
		},

		getOwnerComponent: function() {
			return this._oView.getController().getOwnerComponent();
		},

		open: function() {
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

		close: function() {
			this._oControl.close();
		},

		setRouter: function(oRouter) {
			this.oRouter = oRouter;

		},
		getBindingParameters: function() {
			return {};

		},
		_onButtonPress: function() {

			var lv_hora_entrada,
				lv_hora_saida,
			    lv_motivo_entrada,
			    lv_motivo_saida,
			    lv_tipo_entrada,
			    lv_tipo_saida,
			    lv_data_ent,
			    lv_data_sai;
			    
			var globalModel = new sap.ui.model.json.JSONModel();
			
			lv_hora_entrada     = this.getView().byId("picker01").getValue();
			lv_hora_saida     = this.getView().byId("picker05").getValue();
			lv_motivo_entrada = this.getView().byId("Motivo00").getSelectedKey();
			lv_motivo_saida = this.getView().byId("Motivo01").getSelectedKey();
			lv_tipo_entrada = this.getView().byId("Tipo01").getSelectedKey();
			lv_tipo_saida = this.getView().byId("Tipo02").getSelectedKey();
			
			
			var TimezoneOffset = new Date(0).getTimezoneOffset();
			var TZOffsetMs = new Date(0).getTimezoneOffset()*60*1000;
			var timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({pattern: "KK:mm:ss a"}); 
			
			//var timeStr = timeFormat.format(new Date(lv_hora_entrada + TZOffsetMs));  //11:00 AM 

			var horaEntrada = timeFormat.parse(lv_hora_entrada).getTime()  - TZOffsetMs; //39600000 
			var horaSaida = timeFormat.parse(lv_hora_saida).getTime()  - TZOffsetMs; //39600000 
			
			globalModel.setData({
			    hora_entrada: horaEntrada,
			    hora_saida: horaSaida,
			    cdmot_entrada: lv_motivo_entrada,
			    cdmot_saida: lv_motivo_saida
			   
			});
			
			sap.ui.getCore().setModel(globalModel, 'global_inserir');
			this.getView().byId("table").getBinding("items").refresh();
			//VIES
			this.close();






			this.close();

		},
		_onButtonPress1: function() {

			this.close();

		},
		onInit: function() {

			this._oDialog = this.getControl();

	


		},
		onExit: function() {
			this._oDialog.destroy();

		},
		addRow : function(oArg){
			var row = new sap.m.ColumnListItem( {
		   cells : [
					        new sap.m.Text({
					            text : ""
					        }),
					        new sap.m.Text({
					            text : ""
					        }),
					        new sap.m.Text({
					            text : ""
					        }), 
					        new sap.m.Text({
					            text : ""
					        }),
					        new sap.m.Button({
					            icon : "sap-icon://delete",
					            press: function(oEvent) {
					             
					            }
					        })
					    ]
		  });
			
			this.byId("table1").addItem(row);
			this.byId("table1").getModel().refresh();
			
		this._data.Products.push({Name : '', size : ''});
		this.jModel.refresh();//which will add the new record
		}
	
	});
}, /* bExport= */ true);
