define(function (require, exports) {

	var app = require("main");
	
	var form = $("<form class='form-signin' role='form'></form>");
	$("<h2 class='form-signin-heading'>Anmelden</h2>").appendTo(form);
	$("<label for='inputUser' class='sr-only'>Benutzername</label>").appendTo(form);
	var userInput = $("<input type='text' id='inputUser' class='form-control'"+
			" placeholder='Benutzername' required autofocus />").appendTo(form);
	$("<label for='inputPassword' class='sr-only'>Passwort</label>").appendTo(form);
	var pwdInput = $("<input type='password' id='inputPassword' " +
			"class='form-control' placeholder='Passwort' required />").appendTo(form);
	var btn = $("<button class='btn btn-lg btn-primary btn-block' " +
			"type='submit'>Anmelden</button>").appendTo(form);
	
	
	form.prepend("<h1>MyWallet Web</h1>");
	
	exports.view  = function () {
		return form;
	}
	
	form.submit(function () {
		var username = userInput.val();
		var password = userInput.val();
		
		app.setUser({username: username, password: password});
		return false;
	});
	
});