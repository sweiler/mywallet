define(function (require, exports) {
	var application = require('main');

	
	
	var loadPage = function (pageId, params) {
		console.log("Loading page with id: " + pageId);
		console.log("Detected params: " + JSON.stringify(params));
		application.urlChange(pageId, params);
	};
	
	exports.loadPage = loadPage;
	
	var loadCurrentPage = function () {
		var qmIndex = location.hash.indexOf('?');
		var hashvalue = qmIndex == -1 ?
				location.hash.substr(1) : location.hash.substring(1,qmIndex);
		var params = {};
		if(qmIndex != -1) {
			var paramString = location.hash.substr(qmIndex + 1);
			var pairs = paramString.split("&");
			pairs.forEach(function (p) {
				var split = p.split("=");
				var key = split[0];
				var value = true;
				if(split.length > 1)
					value = split[1];
				params[key] = value;
			});
		}
		loadPage(hashvalue, params);
	};
	
	exports.update = loadCurrentPage;
	
	exports.init = function () {
		$(window).bind('hashchange', loadCurrentPage);
		loadCurrentPage();
	};
	
	
});