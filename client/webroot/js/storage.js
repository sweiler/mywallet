define(function (require, exports) {
	
	var entries_module = require("entries");
	var categories_module = require("categories");
	
	var categories = [];
	var entries = [];
	var objects = new Object();
	var refs = new Object();

	var initialized = false;
	
	
	if(localStorage["objects"] != null && localStorage["objects"] != "null") {
		objects = JSON.parse(localStorage["objects"]);
	}
	
	if(localStorage["refs"] != null && localStorage["refs"] != "null") {
		refs = JSON.parse(localStorage["refs"]);
	}
	
	var saveRef = function (name, hash) {
		refs[name] = hash;
		localStorage["refs"] = JSON.stringify(refs);
	};
	
	var getRef = function (name) {
		if(refs == null)
			return null;
		return refs[name];
	};
	
	var saveObject = function (obj) {
		var str = JSON.stringify(obj);
		var hash = CryptoJS.SHA1(str);
		objects[hash] = obj;
		localStorage["objects"] = JSON.stringify(objects);
		return hash.toString();
	};
	
	var loadObject = function (hash) {
		if(objects == null)
			return null;
		return objects[hash];
	};
	
	var commit = function () {
		var ref = getRef("head");
		var hash = saveObject({data: {entries: entries, categories: categories}, ref: ref});
		saveRef("head", hash);
	};
	
	
	exports.addCategory = function (name) {
		var found = false;
		$.each(categories, function (i, n) {
			if(n == name)
				found = true;
		});
		if(found)
			return;
		categories.push(name);
		commit();
		categories_module.addCategory(name);
	};
	
	exports.addEntry = function (desc, date, amount) {
		entries.push({desc: desc, date: date, amount: amount});
		commit();
		entries_module.addEntry(desc, date, amount);
	};
	
	exports.init = function () {
		if(!initialized) {
			initialized = true;
			
			var ref = getRef("head");
			if(ref != null) {
				var state = loadObject(ref);
				entries = state.data.entries;
				categories = state.data.categories;
				$.each(entries, function (i, e) {
					entries_module.addEntry(e.desc, e.date, e.amount);
				});
				$.each(categories, function (i, c) {
					categories_module.addCategory(c);
				});
			}
		}
	};
	
});