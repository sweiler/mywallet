define(function (require, exports) {
	
	var entries_module = require("entries");
	var categories_module = require("categories");
	var app = require("main");
	
	var categories = [];
	var entries = [];
	var objects = new Object();
	var refs = new Object();
	
	var remote_url = "http://www.mywallet.de/server/";

	var initialized = false;
	
//	localStorage["objects"] = null;
//	localStorage["refs"] = null;
	
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
			return "";
		if(refs[name] == null)
			return "";
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
		var clonedEntries = JSON.parse(JSON.stringify(entries));
		var clonedCategories = JSON.parse(JSON.stringify(categories));
		var hash = saveObject({data: {entries: clonedEntries, categories: clonedCategories}, ref: ref});
		saveRef("head", hash);
	};
	
	var pull = function () {
		$.ajax({
			type: "GET",
			url: remote_url + "users/" + app.getUser().username,
			dataType: "json",
			success: function (d) {
				saveRef("origin", d.head);
				var head = getRef("head");
				if(d.head == head) {
					console.log("Already up-to-date.");
				} else {
					var originHeadObj = loadObject(d.head);
					if(originHeadObj != null || d.head == "") {
						console.log("Updated origin ref.");
					} else {
						console.log("Merge origin into head");
						fetchObject(head, function (obj) {
							if(obj == null && head != "") {
								
							} else {
								
								console.log("Fast-forward");
								
								function fetchNext(fetchHash) {
									fetchObject(fetchHash, function (obj) {
										saveObject(obj);
										if(obj.ref != head) {
											fetchNext(obj.ref);
										} else {
											saveRef("head", d.head);
											update();
										}
									});
								}
								
								fetchNext(d.head);
								
							}
						});
					}
				}
			}
		});
	};
	
	var fetchObject = function (hash, callback) {
		console.log("Fetch: " + hash);
		$.ajax({
			type: "GET",
			url: remote_url + "users/" + app.getUser().username + "/objects/" + hash,
			dataType: "json",
			success: callback,
			error: function (xhr, status, text) {
				console.log("fetch error: " + text);
				callback(null);
			}
		});
	};
	
	var push = function () {
		var origin = getRef("origin");
		var head = getRef("head");
		if(head == "")
			return;
		console.log("HEAD: " + head);
		console.log("ORIGIN: " + origin);
		var pushing = [];
		while(head != origin) {
			var state = loadObject(head);
			pushing.push(state);
			head = state.ref;
		}
		
		if(pushing.length == 0) {
			console.log("Nothing to push.");
			return;
		}
		
		var idx = pushing.length - 1;
		function pushI(i) {	
			console.log("Pushing:");
			console.log(pushing[i]);
			$.ajax({
				type: "POST",
				url: remote_url + "users/" + app.getUser().username + "/objects",
				data: JSON.stringify(pushing[i]),
				contentType: "application/json",
				dataType: "json",
				success: function (d) {
					saveRef("origin", d.hash);
					if(i > 0) {
						pushI(i - 1);
					}
				},
				error : function (xhr, status, text) {
					if(text == "Conflict") {
						alert("Pull before push!");
					} else {
						alert("Ein unerwarteter Fehler ist aufgetreten: " + text);
					}
				}
			});
		}
		
		pushI(idx);
	};
	
	exports.sync = function () {
		pull();
		push();
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
			if(ref != "") {
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
	
	var update = function () {
		var ref = getRef("head");
		if(ref != "") {
			var state = loadObject(ref);
			console.log("refresh view");
			entries = state.data.entries.slice();
			categories = state.data.categories.slice();
			console.log(categories);
			entries_module.clear();
			categories_module.clear();
			$.each(entries, function (i, e) {
				entries_module.addEntry(e.desc, e.date, e.amount);
			});
			$.each(categories, function (i, c) {
				console.log("Add cat: " + c);
				categories_module.addCategory(c);
			});
		}
	}
	
});