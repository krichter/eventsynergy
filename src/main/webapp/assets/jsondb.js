(function() {

// Settings
var catchuppolltime = 60000;

// Leave this alone
var tlisteners = {};
var isonline = true;
var transactionqueue = new Array();
var currenttransaction = null;
var isrunning = false;
var lookaheadtidlist = new Array();
var mytopid = 0;
var dbid = "";
var channeltoken = "";
var clientid = "";

window.JSONDB = {
	init: function(contfunc,setdbid,setchanneltoken,setclientid) {
		//loadjscssfile("/jsondb/dbutils", "js");
		//loadjscssfile("/jsondb/transactions", "js");
		dbid = setdbid;
		channeltoken = setchanneltoken;
		clientid = setclientid;
		jsondbinit(contfunc)
	},
	register_transaction_listener: function(id,transactionname,func) {
		register_transaction_listener(id,transactionname,func);
	},
	unregister_transaction_listener_by_id: function(id) {
		unregister_transaction_listener_by_id(id);
	},
	unregister_transaction_listened_by_transaction: function(transactionname) {
		unregister_transaction_listened_by_transaction(transactionname);
	},
	internal_catchup: function() {
		catchup();
	},
/*	db: function() {
		return jsondb;
	},*/
	generateid: function() {
		return randomid();
	},
	dotransaction: function(t) {
		dotransaction(t);
	},
	clearstoredtransactions: function() {
		clearstoredtransactions();
	}
};

window.JSONDB.jsondb = {};

function processlocaltransaction(t) {
	//try { console.log("processlocaltransaction",t); } catch (e) {}
	try {
		//Create the function
		//try { console.log("local ",t); } catch (e) {}
		var fn = window["t_"+t["action"]];
		//Call the function
		fn(t['params']);
	} catch(err) {
		try { console.error(err); } catch (e) {}
	}
}

function processremotetransaction(sid,t) {
	processlocaltransaction(t);
	updatelastid(sid,false);
	for (l in tlisteners[t["action"]]) {
		//try { console.log("trying to execute function..."); } catch (e) {}
		tlisteners[t["action"]][l]();
	}
}


function register_transaction_listener(id,transactionname,func) {
	if (!tlisteners.hasOwnProperty(transactionname)) {
		tlisteners[transactionname] = {};
	}
	tlisteners[transactionname][id] = func;
}

function unregister_transaction_listener_by_id(id) {
	for (t in tlisteners) {
		try {
			delete tlisteners[t][id];	
		} catch (e) { }
	}
}

function unregister_transaction_listened_by_transaction(transactionname) {
	delete tlisteners[transactionname];
}

function randomid() {
	 var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
	 var string_length = 20;
	 var randomstring = '';
	 for (var i=0; i < string_length; i++) {
		  var rnum = Math.floor(Math.random() * chars.length);
		  randomstring += chars.substring(rnum,rnum+1);
	 }
	 return randomstring;
}

function updatelastid(setsetid,setastop) {
	var nextid = parseInt(mytopid) + 1;
	var setid = parseInt(setsetid);
	//alert(setid+" compared to "+nextid);
	if (setastop || setid == nextid) {
		settopid(setid);
		// Need to check if lookahead contains next items
		var cnum = setid + 1;
		var lastfound = $.inArray(cnum,lookaheadtidlist);
		while (lastfound > -1) {
			settopid(cnum);

			// Remove item from lookahead list
			lookaheadtidlist = jQuery.grep(lookaheadtidlist, function(value) {
				return (value != cnum);
			})

			cnum = cnum + 1;
			lastfound = $.inArray(cnum,lookaheadtidlist);
		}
		$("#lookaheaddisplay").html(lookaheadtidlist.join(", "));
	} else if (setid > mytopid) {
		// Add to lookahead list
		lookaheadtidlist.push(setsetid);
		$("#lookaheaddisplay").html(lookaheadtidlist.join(", "));
	}
}

function settopid(setid) {
	//localtoptransactionid = setid;
	mytopid = setid;
	//try { console.log("settopid: ",setid); } catch (e) {}
	$("#topiddisplay").html(setid);
}

function catchup_success(jsondata,textstatus,request) {
	internal_setonline();
	//try { console.log("Catchup: Processing Result"); } catch (e) {}
	var responsedata = eval(jsondata);
	if (responsedata['success']) {
		if (responsedata['dbreload']) {
			//try { console.log("Catchup: Server suggested a reload instead"); } catch (e) {}
			//reloaddata(callback);
			alert("Code not created - dbreload? Refresh the app manually");
		} else {
			for (var i in responsedata['transactions']) {
				var tdata = responsedata['transactions'][i];
				var tid = parseInt(tdata['tid']);
				var t = tdata['t'];
				//processtransaction(transaction,tid,updateui,donotstore)
				//processtransaction(t,tid,true);
				//try { console.log("test ",t,tid); } catch (e) {}
				processremotetransaction(tid,t);
			}
		}
	} else {
	  alert(responsedata['error']);
	}
}

function catchup() {
	//try { console.log("Executing Catchup"); } catch (e) {}
	runtransactions();
	var dataString = new Object;
	dataString.dbid = dbid;
	dataString.clientid = clientid;
	dataString.localtopid = mytopid;
	$.ajax({
		async: false,
		type: "GET",
		url: "/jsondb/catchup",
		data: dataString,
		success: catchup_success,
		error: ajaxerror,
		dataType: "json"
	});
	//setTimeout("catchup()",catchuppolltime);
	setTimeout("JSONDB.internal_catchup()",catchuppolltime);
}


function runtransactions() {
	 if (!isrunning) {
		  isrunning = true;
		  //var t = transactionqueue.shift();
		  //currenttransaction = t;
		  sendtransaction();
	 } else {
		 try { console.log("runtransaction call ignored: Already Running: "+isrunning+", Queue Length: "+transactionqueue.length); } catch (e) {}
	 }
}

function sendtransaction() {
	//$("#currentaction").html("Uploading Transaction...");
	//currenttransaction = tosend;
	
	if (isonline) {
		var t = gettoptransaction();
		if (t != null) {
			var dataString = new Object;
			dataString.dbid = dbid;
			dataString.clientid = clientid;
			dataString.transaction = JSON.stringify(t);
			dataString.localtransactionid = t["localid"];
//			dataString.lasttid = localtoptransactionid;
//			dataString.rowlimit = 20;
			$.ajax({
				async: true,
				type: "POST",
				url: "/jsondb/t",
				data: dataString,
				success: runt_success,
				error: runt_error,
				dataType: "json"
			});
		} else {
			//try { console.log("Sendtransaction fail - no pending transactions"); } catch (e) {}
			isrunning = false;
		}
	} else {
		isrunning = false;
		//transactionqueue.unshift(currenttransaction);
		//setTimeout("MRDB.retrysend();",10000);
	}
}

function runt_success(jsondata,textstatus,request) {
	//comet_setonline();
	//alert("Transaction Success");
	internal_setonline();
//	var responsedata = eval(jsondata);
	var responsedata = jsondata;
	if (responsedata['success']) {
		try { console.log("Transaction success",responsedata,responsedata["localtransactionid"]); } catch (e) {}
		unstoretransaction(responsedata["localtransactionid"]);
		var servertid = responsedata["sid"];
		updatelastid(servertid,false);
		//var tid = responsedata['tid'];
		//$("#currentaction").html("Nothing (Transaction successfully uploaded: Temp ID: "+responsedata["tempid"]+", Server TID: "+tid+")");
		//var tcount = responsedata['tcount'];
		//updatelastid(tid,false);
		//internal_executeSQLWithNoResult("delete from transactionstore where tid=?",[responsedata["tempid"]])
		//$("#tcount").html(transactionqueue.length);
	} else {
		//$("#tcount").html(transactionqueue.length);
		//$("#currentaction").html("Nothing (Transaction error)");
		alert(responsedata['error']);
	}
	
	//try { console.log("RUN T: "+lookaheadtidlist.join(", ")); } catch (e) {}

//	if (transactionqueue.length == 0) {
//		isrunning = false;
//	} else {
		//currenttransaction = transactionqueue.shift();
	sendtransaction();
//	}
}

function runt_error(request,status,error) {
	try { console.log("Transaction Error: "+error); } catch (e) {}
	isrunning = false;
	//transactionqueue.unshift(currenttransaction);
	internal_setoffline();
}


function dotransaction(t) {
	t["localid"] = randomid();
	processlocaltransaction(t);
	storetransaction(t);
	runtransactions();
}

function gettoptransaction() {
	var tlist;
	try {
		var rawtlist = localStorage.getItem("jsondb_"+dbid);
		tlist = {};
		tlist["tlist"] = [];
		if (rawtlist != null) {
			tlist = eval('(' + rawtlist + ')');
		}
		if (tlist["tlist"].length > 0) {
			return tlist["tlist"].shift();
		} else {
			return null;
		}
	} catch (e) {
		try { console.error("Storage fail",e,tlist); } catch (e2) {}
		//throw e;
		return null;
	}
}

function storetransaction(t) {
	// TODO: Need to serialize this
	var tlist;
	try {
		var rawtlist = localStorage.getItem("jsondb_"+dbid);
		tlist = {};
		tlist["tlist"] = [];
		if (rawtlist != null) {
			tlist = eval('(' + rawtlist + ')');
		}
		tlist["tlist"].push(t);
		localStorage.setItem("jsondb_"+dbid, JSON.stringify(tlist));
	} catch (e) {
		try { console.error("Storage fail",e,tlist); } catch (e2) {}
		//throw e;
	}
}

function unstoretransaction(tid) {
	// TODO: Need to serialize this
	try {
		var rawtlist = localStorage.getItem("jsondb_"+dbid);
		tlist = {};
		tlist["tlist"] = [];
		if (rawtlist != null) {
			tlist = eval('(' + rawtlist + ')');
		}
		for (t in tlist["tlist"]) {
			//try { console.log("ust",t); } catch (e) {}
			if (tlist["tlist"][t].hasOwnProperty("localid") && tlist["tlist"][t]["localid"] == tid) {
				//try { console.log("match",tlist["tlist"].splice(t,1)); } catch (e) {}
				tlist["tlist"].splice(t,1);
				break;
			}
		}
		localStorage.setItem("jsondb_"+dbid, JSON.stringify(tlist));
	} catch (e) {
		throw e;
	}
}

function clearstoredtransactions() {
	try {
	    localStorage.removeItem("jsondb_"+dbid);
	} catch (e) {
		throw e;
	}
}

function replaystoredtransactions() {
	try {
		var rawtlist = localStorage.getItem("jsondb_"+dbid);
		tlist = {};
		tlist["tlist"] = [];
		if (rawtlist != null) {
			tlist = eval('(' + rawtlist + ')');
		}
		for (t in tlist["tlist"]) {
			processlocaltransaction(tlist["tlist"][t]);
		}
	} catch (e) {
		throw e;
	}
}


function showbar() {
	//$("body").
	//id='dbstatusbar'
	$("#footer").append("<div class='hidewhenprinting'>\n\
		Online Status: <span id='onlinestatus'>Online</span> Pending: <span id='tcount'>0</span> Current Action: <span id='currentaction'>None</span> Progress: <span id='progress'>None</span> Top Transaction ID: <span id='topiddisplay'>0</span> Look ahead T List Size: <span id='lookaheaddisplay'>0</span> <input type='button' value='Clean Local Transaction Backlog' onClick='JSONDB.clearstoredtransactions();'/></div>");
}

function internal_setonline() {
	$("#onlinestatus").html("Online");
	if (!isonline) {
		isonline = true;
		runtransactions();
		//catchup(restartlisten);
	}
}
function internal_setoffline() {
	$("#onlinestatus").html("Offline");
	if (isonline) {
		isonline = false;
	}
}




function getdb() {
	startmessagewindow();
	updatemessagewindow("Loading db...");
	function getdb_success(jsondata,textstatus,request) {
		//jsondb = jsondata["db"];
		window.JSONDB.jsondb = jsondata["db"];
		//mytopid = jsondata["topid"];
		updatelastid(jsondata["topid"],true);
		//$("#topiddisplay") = mytopid;
		hidemessagewindow()
		try { console.log("db loaded",window.JSONDB.jsondb); } catch (e) {}
	}
	
	var dataString = new Object;
	dataString.dbid = dbid;
	dataString.clientid = clientid;
//	dataString.lasttid = localtoptransactionid;
//	dataString.rowlimit = 20;
	$.ajax({
		async: false,
		type: "GET",
		url: "/jsondb/get",
		data: dataString,
		success: getdb_success,
		dataType: "json",
		error: ajaxerror
	});
}

function jsondbinit(continueinit) {
	showbar();
	function jsondbinit_cont(replay) {
		getdb();
		catchup();
		if (replay) {
			replaystoredtransactions();
			runtransactions();
		}
		//setTimeout("catchup()",catchuppolltime);
		//setTimeout("JSONDB.internal_catchup()",catchuppolltime);
		startlisten();
		continueinit();
	}
	function jsondbinit_op1() {
		hidemessagewindow();
		jsondbinit_cont(true);
		
	}
	function jsondbinit_op2() {
		clearstoredtransactions();
		hidemessagewindow();
		jsondbinit_cont(false);
	}
	
	if (gettoptransaction() != null) {
		startmessagewindow();
		messagewindowprompt("You have pending transactions.","Submit","Clear",jsondbinit_op1,jsondbinit_op2);
	} else {
		jsondbinit_cont(false);
	}
}

var messageopencount = 0;
function startmessagewindow() {
	messageopencount = messageopencount + 1;
	if (messageopencount == 1) {
		$("body").append("<div id='mrdb_messaging' style='z-index:4000;position:absolute;top:0;bottom:0;left:0;width:100%;background:#000;opacity:0.45;-moz-opacity:0.45;filter:alpha(opacity=45);cursor:wait;'></div>");
		$("body").append("<div id='mrdb_messaging_message' style='z-index:4001;background-color:black; position: fixed; top: 50%;	left: 50%;	width:500px;	margin-top: -50px;	margin-left: -250px;	border-bottom-left-radius: 7px 7px;	border-bottom-right-radius: 7px 7px;	border-top-left-radius: 7px 7px;	border-top-right-radius: 7px 7px;	-moz-border-radius: 7px;	border: 1px black solid;	font-family: Verdana, Arial, Helvetica, sans-serif;	font-size: 10px;	padding: 20px; color: white; text-align:center;'></div>");
//		try { console.log("Showing message window"); } catch (e) {}
	}
}

function hidemessagewindow() {
	messageopencount = messageopencount - 1;
	if (messageopencount == 0) {
		$("#mrdb_messaging_message").remove();
		$("#mrdb_messaging").remove();
//		try { console.log("Hiding message window"); } catch (e) {}
	}
}

function updatemessagewindow(message) {
	if (messageopencount > 0) {
		$("#mrdb_messaging_message").empty();
		$("#mrdb_messaging_message").text(message);
//		try { console.log("Updating message window with "+message); } catch (e) {}
	}
}

function messagewindowprompt(message,button1label,button2label,button1function,button2function) {
	//$("#mrdb_messaging_message").text(message);
	$("#mrdb_messaging_message").html("<span>"+message+"</span><br/><br/><input type='button' id='prompt_b1' value='"+button1label+"'/><input id='prompt_b2' type='button' value='"+button2label+"'/>");
	$("#prompt_b1").click(button1function);
	$("#prompt_b2").click(button2function);
}




function restartlisten() {
	
	socket.close();
	function channelreconnectsuccess(jsondata,textstatus,request)
	{
		var responsedata = eval(jsondata);
		if (responsedata["success"]) {
			var mrdb_channeltoken = responsedata["channeltoken"];
			var mrdb_clientid = responsedata["clientid"];
			startlisten();
		}
	}
	var dataString = new Object;
	dataString.dbid = dbid;

	$.ajax({
		 async: false,
		 type: "GET",
		 url: dbhost+"/db/channelreconnect",
		 data: dataString,
		 success: channelreconnectsuccess,
		 dataType: "json",
		 error: ajaxerror
	});
}

function startlisten() {
	goog.appengine.Socket.POLLING_TIMEOUT_MS = 5000;
	channel = new goog.appengine.Channel(channeltoken);
	socket = channel.open();
	socket.onopen = onChannelOpened;
	socket.onmessage = onChannelMessage;
	socket.onerror = onChannelError;
	socket.onclose = onChannelClose;
}

onChannelOpened = function() {
	try { console.log("Channel: onChannelOpened"); } catch (e) {}
};

onChannelMessage = function(message) {
	try { console.log("Channel: onChannelMessage: "+message.data); } catch (e) {}
	try {
		var data = eval("("+message.data+")");
		if (data["type"] == "transaction") {
			processremotetransaction(parseInt(data["sid"]),data["t"]);
		}
		//	try { console.log("onChannel Transaction was not found, ignoring"); } catch (e) {}
		//}
	} catch (e) {
		try { console.error("Recieved channel message error",e); } catch (e2) {}
	}
}

onChannelError = function() {
	try { console.log("Channel: onChannelError"); } catch (e) {}
}

onChannelClose = function() {
	try { console.log("Channel: onChannelClose"); } catch (e) {}
}


function ajaxerror(request,status,error) {
	if (status == "error" && error == "") {
		//alert("I think we're offline now");
		internal_setoffline();
//		alert("Error caught: "+status+","+error);
		try { console.error("Ajax Error: ",request,status,error); } catch (e) {}
	} else {
		//alert("Error caught: "+status+","+error);
		try { console.error("Ajax Error: ",request,status,error); } catch (e) {}
	}
}

function loadjscssfile(filename, filetype){
	if (filetype=="js") { //if filename is a external JavaScript file
		var fileref=document.createElement('script')
		fileref.setAttribute("type","text/javascript")
		fileref.setAttribute("src", filename)
	} else if (filetype=="css") { //if filename is an external CSS file
		var fileref=document.createElement("link")
		fileref.setAttribute("rel", "stylesheet")
		fileref.setAttribute("type", "text/css")
		fileref.setAttribute("href", filename)
	}
	if (typeof fileref!="undefined") {
		document.getElementsByTagName("head")[0].appendChild(fileref)
	}
}

})();

