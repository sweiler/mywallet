define(function (require, exports) {

	var storage = require("storage");
	var app = require("main");
	
	var return_to_id = "";
	var return_to_params = {};
	
	var build = function (parent, closer) {
		var form = $("<form role='form' class='dialog-form'></form>").appendTo(parent);
		var desc_grp = $("<div class='desc_grp dialog-spacer'/>").appendTo(form);
		$("<label class='sr-only' for='add_desc'>Beschreibung</label>").appendTo(desc_grp);
		$("<input class='form-control clearInput' id='add_desc' name='add_desc' type='text'" + 
				"placeholder='Beschreibung' />").appendTo(desc_grp);
		
		$("<label class='sr-only' for='add_date'>Datum</label>").appendTo(form);
		var date_input = $("<input class='form-control dialog-spacer' id='add_date' type='text'" + 
				"name='add_date' />").appendTo(form);
		date_input.datepicker({
			todayBtn: "linked",
			language: "de",
			autoclose: true,
			todayHighlight: true
		});
		
		date_input.datepicker("setDate", new Date());
		
		$("<label class='sr-only' for='add_desc'>Betrag</label>").appendTo(form);
		var inputgrp = $("<div class='input-group amount_grp dialog-spacer'></div>").appendTo(form);
		$("<input class='form-control clearInput' name='add_amount' id='add_amount' type='text'" + 
				"placeholder='Betrag' />").appendTo(inputgrp);
		$("<span class='input-group-addon'>€</span>").appendTo(inputgrp);
		
		$("<label class='sr-only' for='add_cat'>Kategorie</label>").appendTo(form);
		var cat_input = $("<input class='form-control dialog-spacer' id='add_cat'" +
				" type='text' name='add_cat' placeholder='Kategorie'/>").appendTo(form);
		
		cat_input.autocomplete({
			source: storage.getCategories()
		});
		
		form.submit(function () {
			
			var desc = $("#add_desc").val();
			var date = $("#add_date").datepicker('getDate').toLocaleDateString();
			var amount = $("#add_amount").val();
			var cat = $("#add_cat").val();
			
			amount = amount.replace(",", ".");
			amount = parseFloat(amount);
			
			if(isNaN(amount) || amount == 0) {
				$(".amount_grp").addClass("has-error");
			} else {
				$(".amount_grp").removeClass("has-error");
			}
			if(desc.length == 0) {
				$(".desc_grp").addClass("has-error");
			} else {
				$(".desc_grp").removeClass("has-error");
			}
			if(cat == "") {
				cat = "Keine Kategorie";
			}
			if (!isNaN(amount) && amount != 0 && desc.length > 0) {
				storage.addEntry(desc, date, amount, cat);
				
				closer();
			}
			return false;
			
		});
		
		return form;
	};
	
	exports.view = function () {
		var dialog = $("<div class='entryDialog'>" +
				"<div class='page-header'>" +
				"<h1>Neuer Eintrag</h1>" +
				"</div>" +
				"</div>");
		
		var closer = function () {
			app.toUrl(return_to_id, return_to_params);
		};
		
		var form = build(dialog, closer);
		
		var dialog_footer = $("<div class='dialog-footer'></div>").appendTo(dialog);
		
		var cancel_button = $("<button type='button' class='btn btn-default'" +
		">Abbrechen</button>").appendTo(dialog_footer);
		var save_btn = $("<button type='button' class='btn btn-primary'" +
		">Speichern</button>").appendTo(dialog_footer);
		
		cancel_button.click(closer);
		
		save_btn.click(function () {form.submit()});
		return dialog;
	}
	
	exports.openPage = function () {
		return_to_id = app.currentId();
		return_to_params = app.currentParams();
		app.toUrl("entry", {"id" : -1});
	};
	
	exports.openModal = function () {
		var addEntryModal = $("<div class='modal fade' id='addEntryModal' " +
				"role='dialog' aria-labelledby='addEntryHeading'" +
				" aria-hidden='true' />").appendTo($("body"));
		
		addEntryModal.on("hidden.bs.modal", function() {
			addEntryModal.remove();
		});
		
		var wrap1 = $("<div class='modal-dialog' />").appendTo(addEntryModal);
		var wrap2 = $("<div class='modal-content' />").appendTo(wrap1);
		
		
		var modal_header = $("<div class='modal-header' />").appendTo(wrap2);
		$("<button type='button' class='close' data-dismiss='modal'>" +
				"<span aria-hidden='true'>&times;</span><span class='sr-only'>" +
				"Schließen</span>" + 
				"</button>").appendTo(modal_header);
		$("<h4 class='modal-title' id='addEntryHeading'>" + 
				"Neuer Eintrag</h4>").appendTo(modal_header);
		
		
		var modal_body = $("<div class='modal-body' />").appendTo(wrap2);
		
		var form = build(modal_body, function () {
			addEntryModal.modal('hide');
		});
		
		var modal_footer = $("<div class='modal-footer' />").appendTo(wrap2);
		
		$("<button type='button' class='btn btn-default'" +
				" data-dismiss='modal'>Abbrechen</button>").appendTo(modal_footer);
		var save_btn = $("<button type='button' class='btn btn-primary'" +
		">Speichern</button>").appendTo(modal_footer);
		
		save_btn.click(function () {form.submit()});
		
		
		
		addEntryModal.modal();
	};
	
});