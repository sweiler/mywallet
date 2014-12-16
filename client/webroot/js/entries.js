define(function (require, exports) {
	
	entrytable = $("<table class='table' />");
	
	var widget = $("<div />");
	
	
	$("<div class='page-header'><h1>Einträge</h1></div>").appendTo(widget);
	
	var modalBtn = $("<button class='btn btn-default' type='button'>" +
			"<span class='glyphicon glyphicon-plus' />&nbsp;Eintrag" +
			" erstellen</button>").appendTo(widget);
	
	entrytable.appendTo(widget);
	
	var addEntryModal = $("<div class='modal fade' id='addEntryModal' " +
			"role='dialog' aria-labelledby='addEntryHeading'" +
			" aria-hidden='true' />").appendTo(widget);
	
	modalBtn.click(function () {
		addEntryModal.find(".clearInput").val("");
		addEntryModal.find("#add_date").datepicker('setDate', new Date());
		$(".has-error").removeClass("has-error");
		addEntryModal.modal();
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
	
	var form = $("<form role='form'></form>").appendTo(modal_body);
	var desc_grp = $("<div class='desc_grp'/>").appendTo(form);
	$("<label class='sr-only' for='add_desc'>Beschreibung</label>").appendTo(desc_grp);
	$("<input class='form-control clearInput' id='add_desc' type='text'" + 
			"placeholder='Beschreibung' />").appendTo(desc_grp);
	
	$("<label class='sr-only' for='add_date'>Datum</label>").appendTo(form);
	var date_input = $("<input class='form-control' id='add_date' type='text'" + 
			" />").appendTo(form);
	date_input.datepicker({
		todayBtn: "linked",
		language: "de",
		autoclose: true,
		todayHighlight: true
	});
	
	$("<label class='sr-only' for='add_desc'>Betrag</label>").appendTo(form);
	var inputgrp = $("<div class='input-group amount_grp'></div>").appendTo(form);
	$("<input class='form-control clearInput' id='add_amount' type='text'" + 
			"placeholder='Betrag' />").appendTo(inputgrp);
	$("<span class='input-group-addon'>€</span>").appendTo(inputgrp);
	
	var modal_footer = $("<div class='modal-footer' />").appendTo(wrap2);
	
	$("<button type='button' class='btn btn-default'" +
			" data-dismiss='modal'>Abbrechen</button>").appendTo(modal_footer);
	var save_btn = $("<button type='button' class='btn btn-primary'" +
	">Speichern</button>").appendTo(modal_footer);
	
	save_btn.click(function () {
		var desc = $("#add_desc").val();
		var date = $("#add_date").datepicker('getDate').toLocaleDateString();
		var amount = $("#add_amount").val();
		
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
		if (!isNaN(amount) && amount != 0 && desc.length > 0) {
			exports.addEntry(desc, date, amount);
			
			addEntryModal.modal('hide');
		}
		
		
	});
	
	
	var thead = $("<thead />").appendTo(entrytable);
	var headlines = $("<tr/>").appendTo(thead);
	$("<th>Beschreibung:</th>").appendTo(headlines);
	$("<th>Datum:</th>").appendTo(headlines);
	$("<th>Betrag:</th>").appendTo(headlines);
	
	
	
	exports.view = function () {
		return widget;
	};
	
	exports.addEntry = function (desc, date, amount) {
		var row = $("<tr />").appendTo(entrytable);
		$("<td>" + desc + "</td>").appendTo(row);
		$("<td>" + date + "</td>").appendTo(row);
		$("<td>" + amount + "</td>").appendTo(row);
	};
	
	exports.addEntry("Testeintrag", "16.12.2014 16:00 Uhr", "3,00€");
	
});