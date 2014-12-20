define(function (require, exports) {

	var app = require("main");
	var login_url = "/server/users";
	
	var form = $("<form class='form-signin' role='form'></form>");
	$("<h2 class='form-signin-heading'>Anmelden</h2>").appendTo(form);
	$("<label for='inputUser' class='sr-only'>Benutzername</label>").appendTo(form);
	var userInput = $("<input type='text' id='inputUser' class='form-control'"+
			" placeholder='Benutzername' required autofocus />").appendTo(form);
	$("<label for='inputPassword' class='sr-only'>Passwort</label>").appendTo(form);
	var pwdInput = $("<input type='password' id='inputPassword' " +
			"class='form-control' placeholder='Passwort' required />").appendTo(form);
	$("<button class='btn btn-lg btn-primary btn-block' " +
			"type='submit'>Anmelden</button>").appendTo(form);
	var signUp = $("<button class='btn btn-lg btn-default btn-block'" +
			" type='button'>Registrieren</button>").appendTo(form);
	
	var warning = $("<div class='alert alert-warning'>Login fehlerhaft!</div>");
	form.prepend(warning);
	warning.hide();
	
	form.prepend("<h1>MyWallet Web</h1>");
	
	
	exports.view  = function () {
		return form;
	};
	
	signUp.click(function () {
		var username = userInput.val();
		var password = pwdInput.val();
		warning.hide();
		if(username == "" || password == "") {
			warning.text("Bitte fülle beide Felder aus.");
			warning.show();
			return;
		}
		var usrObj = {username: username, password: password};
		$.ajax({
			type : "POST",
			url : login_url,
			data : JSON.stringify(usrObj),
			success : function () {
				form.submit();
			},
			error : function (xhr, status, text) {
				if(xhr.status == 409) {
					warning.text("Dieser Benutzername ist bereits vergeben.");
				} else {
					warning.text("Ein Fehler ist aufgetreten: " + text);
				}
				warning.show();
			}
		});
	});
	
	form.submit(function () {
		var username = userInput.val();
		var password = pwdInput.val();
		var usrObj = {username: username, password: password};
		warning.hide();
		$.ajax({
			type : "GET",
			url : login_url + "/" + username,
			headers : {
				"X-Mywallet-Auth" : JSON.stringify(usrObj)
			},
			dataType : "json",
			error : function (xhr, status, text) {
				if(xhr.status == 403) {
					warning.text("Anmeldedaten sind falsch!");
				} else {
					warning.text("Anmeldung nicht möglich: " + text);
				}
				warning.show();
				pwdInput.val("");
			},
			success : function (d) {
				app.setUser(usrObj);
				userInput.val("");
				pwdInput.val("");
			}
		});
		
		return false;
	});
	
});