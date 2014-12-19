define(function (require, exports) {
	
	var entries_module = require("entries");
	var categories_module = require("categories");
	var app = require("main");
	
	var entries = [];
	var categories = [];
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
		console.log("Commit: " + entries.length + " entries");
		var ref = getRef("head");
		var clonedEntries = JSON.parse(JSON.stringify(entries));
		var hash = saveObject({data: {entries: clonedEntries}, ref: ref});
		saveRef("head", hash);
	};
	
	var fetch  = function (callback) {
		$.ajax({
			type: "GET",
			url: remote_url + "users/" + app.getUser().username,
			dataType: "json",
			error : function (xhr, status, text) {
				alert("Verbindungsfehler: " + text);
			},
			success: function (d) {
				var oldRef = getRef("origin");
				saveRef("origin", d.head);
				var head = getRef("head");
				if(d.head == head || d.head == "") {
					callback();
				} else {
					function fetchNext(fetchHash) {
						fetchObject(fetchHash, function (obj) {
							saveObject(obj);
							if(obj.ref != oldRef) {
								fetchNext(obj.ref);
							} else {
								callback();
							}
						});
					}
					if(d.head != oldRef)
						fetchNext(d.head);
					else
						callback();
				}
			}});
	}
	
	var entryEquals = function (entry1, entry2) {
		return entry1.desc == entry2.desc && 
		entry1.date == entry2.date &&
		entry1.amount == entry2.amount;
	};
	
	var find = function (arr, entry) {
		for (var i = 0; i < arr.length; i++) {
			var o = arr[i];
			if(entryEquals(o, entry)) {
				return i;
			}
		}
		return -1;
	};
	
	
	
	var diff = function (entriesA, entriesB) {
		var insertions = [];
		// find insertions
		for(var i = 0; i < entriesB.length; i++) {
			if(find(entriesA, entriesB[i]) == -1) {
				insertions.push(entriesB[i]);
			}
		}
		var deletions = [];
		// find deletions
		for(var i = 0; i < entriesA.length; i++) {
			if(find(entriesB, entriesA[i]) == -1) {
				deletions.push(entriesA[i]);
			}
		}
		
		console.log(insertions);
		console.log(deletions);
		
		return {insert: insertions, del: deletions};
	};
	
	var pull = function (callback) {
		
		fetch(function () {
			var head = getRef("head");
			var orig_head = getRef("origin");
			console.log("HEAD: " + head);
			console.log("ORIG_HEAD: " + orig_head);
			if(orig_head != head && orig_head != "") {
				
				// Rebuild origin history
				var orig_pointer = orig_head;
				var orig_history = [];
				while(orig_pointer != "") {
					orig_history.push(orig_pointer);
					var obj = loadObject(orig_pointer);
					orig_pointer = obj.ref;
				}
				
				// Find nearest common ancestor
				var head_pointer = head;
				var nca = "";
				while(head_pointer != "") {
					if(orig_history.indexOf(head_pointer) != -1) {
						nca = head_pointer;
						break;
					} else {
						var obj = loadObject(head_pointer);
						head_pointer = obj.ref;
					}
				}
				
				console.log("NCA: " + nca);
				
				if(nca == head) {
					console.log("Fast-forward");
					saveRef("head", orig_head);
					update();
				} else if(nca == orig_head) {
					console.log("Only unpublished changes");
				} else {
					console.log("Real-merge has to occur");
					
					var head_data = loadObject(head).data.entries;
					var orig_data = loadObject(orig_head).data.entries;
					var base = loadObject(nca).data.entries;
					
					var diff1 = diff(base, head_data);
					var diff2 = diff(base, orig_data);
					
					var insdiff = diff(diff1.insert, diff2.insert);
					var deldiff = diff(diff1.del, diff2.del);
					
					var newRemote = insdiff.insert;
					var newLocal = insdiff.del;
					
					var delRemote = deldiff.insert;
					var delLocal = deldiff.del;
					
					var merged = orig_data.slice();
					$.each(delLocal, function (i, d) {
						for(var j = 0; j < merged.length; j++) {
							if(entryEquals(d, merged[j])) {
								merged.splice(j, 1);
								break;
							}
						}
					});
					$.each(newLocal, function (i, n) {
						console.log("merge added new entry: " + n.desc);
						merged.push(n);
					});
					
					var commitObj = {data: {entries: merged},
							ref: orig_head};
					
					var hash = saveObject(commitObj);
					saveRef("head", hash);
					update();
				}
				
				
			} else {
				console.log("Already up-to-date.");
			}
			callback();
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
		pull(push);
	};
	
	
	exports.addEntry = function (desc, date, amount, category) {
		entries.push({desc: desc, date: date, amount: amount, category: category});
		if(categories.indexOf(category) == -1) {
			categories.push(category);
			categories_module.addCategory(category);
		}
		commit();
		entries_module.addEntry(desc, date, amount, category);
	};
	
	exports.removeEntry = function (idx) {
		var removedEntry = entries[idx];
		entries.splice(idx, 1);
		var categoryExisting = false;
		$.each(entries, function (i, e) {
			if(e.category == removedEntry.category) {
				categoryExisting = true;
				return false;
			}
		});
		if(!categoryExisting) {
			var catIdx = categories.indexOf(removedEntry.category);
			console.log(catIdx);
			categories.splice(catIdx, 1);
			categories_module.removeCategory(catIdx);
		}
		commit();
		entries_module.removeEntry(idx);
		
	};
	
	exports.init = function () {
		if(!initialized) {
			initialized = true;
			
			var ref = getRef("head");
			if(ref != "") {
				var state = loadObject(ref);
				entries = state.data.entries;
				categories = [];
				$.each(entries, function (i, e) {
					entries_module.addEntry(e.desc, e.date, e.amount, e.category);
					if(categories.indexOf(e.category) == -1)
						categories.push(e.category);
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
			categories = [];
			entries_module.clear();
			categories_module.clear();
			$.each(entries, function (i, e) {
				entries_module.addEntry(e.desc, e.date, e.amount, e.category);
				if(categories.indexOf(e.category) == -1)
					categories.push(e.category);
			});
			$.each(categories, function (i, c) {
				categories_module.addCategory(c);
			});
		}
	};
	
	exports.getCategories = function () {
		return categories;
	};
	
});