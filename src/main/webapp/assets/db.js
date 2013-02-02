// This is a general multi-user library to accompany the server-side components for
// writing a javascript app utilizing this distributed database concept

(function() {

var db = null;
var dbid = "";
var dbmode = "";
var dbhost = "";
var internal_dbschema = null;

var localtoptransactionid = -1;
var isonline = true;
var lookaheadtidlist = new Array();

var mrdb_channeltoken = "";
var mrdb_clientid = "";

var blockcatchup = false;
var catchuppolltime = 10000;
var isonline = true;
var currenttransaction = null;
var catchupbulkthreshold = 10;

var channel = null;
var socket = null;
var logqueries = false;

window.MRDB = {

	init: function(setdbid,sethost,schemaobject,setchanneltoken,setclientid) {
		mrdb_channeltoken = setchanneltoken;
		mrdb_clientid = setclientid;
		dbinternal_init(setdbid,sethost,schemaobject);
	},
	querywindow: function() {
		var rawquery = prompt("Enter Query","");
		if (rawquery != null && rawquery != "") {
			var newwindow = window.open('','ReportWindow','status=1,toolbar=1,location=1,menubar=1,statusbar=1');
			newwindow.document.write('<html><head><title></title><link rel="stylesheet" type="text/css" href="/assets/printable.css"/></head><body><table></table></body></html>');
			MRDB.executeSQLWithCallback(rawquery,[],
				function(success,result,sqlquery) {
					for (var i in result) {
						$("table",newwindow.document).append("<tr></tr>");
						for (var x in result[i]) {
							$("tr:last",newwindow.document).append("<td>"+result[i][x]+"</td>");
						}
					}
				}
			,null);
		}
	},
	showbar: function() {
		$("body").append("<div id='dbstatusbar' class='hidewhenprinting'>\n\
			Online Status: <span id='onlinestatus'>Online</span> Pending: <span id='tcount'>0</span> Current Action: <span id='currentaction'>None</span> Progress: <span id='progress'>None</span> Top Transaction ID: <span id='topiddisplay'>0</span> Look ahead T List Size: <span id='lookaheaddisplay'>0</span> <input type='button' value='Reload Local DB from scratch' onClick='MRDB.forcereload();'/><input type='button' value='Reload Schema+Data from scratch' onClick='MRDB.forcecompletereload();'/><input type='button' value='Clean Local Transaction Backlog' onClick='MRDB.clearlocaltransactions();'/> <input type='button' value='Query Window' onClick='MRDB.querywindow();'/></div>")
	},
	executeSQLWithCallback: function(sqlquery,parameters,callback,passthrough) {
		executeSQLWithCallback(sqlquery,parameters,callback,true,passthrough);
	},
	queuequery: function(queryqueue,sql,parameters,subcallback,passthrough) {
		queuequery(queryqueue,sql,parameters,0,subcallback,passthrough);
	},
	executeSQLOffQueue: function(queryqueue,callback) {
		executeSQLOffQueue(queryqueue,callback);
	},
	db_changedata: function(tablename,rowid,colname,newvalue) {
		var t = {"action":"changedata","tablename":tablename,"rowid":rowid,"colname":colname,"newvalue":newvalue};
		processtransaction(t,0,true);
	},
	db_delrow: function(tablename,rowid) {
		var t = {"action":"delrow","tablename":tablename,"rowid":rowid};
		processtransaction(t,0,true);
	},
	db_addrow: function(tablename,data) {
		var t = {"action":"addrow","tablename":tablename,"data":data};
		processtransaction(t,0,true);
	},
	generateid: function() {
		return randomid();
	},
	forcereload: function() {
		startmessagewindow();
		reloaddata(forcereload_2);
	},
	clearlocaltransactions: function() {
		executeSQLWithCallback("delete from transactionstore",[],null);
	},
	forcecompletereload: function() {
		startmessagewindow();
		//console.assert(false, 'Full reload requested');
		//comet_stop();
		updatemessagewindow("Forcing complete reload...");
		//try { console.log('Schema is out of date, updating...'); } catch (e) {}
		$("#currentaction").html("Reloading database schema...");
		loadschemafromobject();
	},
	forcecatchup: function() {
		catchup();
		setTimeout("MRDB.forcecatchup()",catchuppolltime);
	},
	retrysend: function() {
		sendtransaction();
	}
};

function dbinternal_init(setdbid,sethost,schemaobject) {
	if (sethost != null && sethost != "") {
		dbhost = "http://"+sethost;
	}
	internal_dbschema = schemaobject;
	startmessagewindow();
	updatemessagewindow("Initializing Database... Please Wait...");
	dbid = setdbid;
	//BrowserDetect.browser == "Safari" && 
	if (window.openDatabase) {
		dbmode = "html5";
	} else {
		location.href = "/manage/";
	}
	
	/*else if (!window.google || !google.gears) {
		 location.href = "http://gears.google.com/?action=install&message=Your browser is not HTML5 enabled. The fallback is use of Google Gears, which your browser does not have." +
							  "&return=http://localhost:9000";
	} else {
		dbmode = "gears";
	}*/

	if (dbmode == "gears") {
		db = google.gears.factory.create('beta.database');
		db.open("db_"+setdbid);
	} else if (dbmode == "html5") {
		try {
			db = openDatabase("db_"+setdbid, "1.0", "Internal DB", 5242880);
		} catch (e) {
			alert(e);
		}
	}
	try { console.log('DB Mode: '+dbmode); } catch (e) {}

	function init_stage2(success,result) {
		// Load Registry
		executeSQLWithCallback("select * from metadata",[],init_stage3);
	}
	var q = new Array();
	//queuequery(q,"drop table metadata",[]);
	queuequery(q,"create table if not exists metadata (varname text,varvalue text)",[]);
	queuequery(q,"create table if not exists transactionstore (internalcount integer primary key autoincrement,tid text unique,transactionjson text)",[]);
	executeSQLOffQueue(q,init_stage2);
}

var registry = new Array();
//registry["lasttransactioncount"] = "-1";
registry["localtoptransactionid"] = localtoptransactionid;
registry["schemaversion"] = "0";
function init_stage3(success,result) {
	for (var x in result) {
		var row = result[x];
		registry[row["varname"]] = row["varvalue"];
	}

	localtoptransactionid = registry["localtoptransactionid"];
	var localschemaversion = registry["schemaversion"];

	try { console.log('Top Local Transaction ID: '+localtoptransactionid); } catch (e) {}

	if (localtoptransactionid == -1) {
		executeSQLWithCallback("insert into metadata (varname, varvalue) VALUES (?, ?)", ['localtoptransactionid','0']);
		localtoptransactionid = 0;
	}

	executeSQLWithCallback("select * from transactionstore order by internalcount",[],init_stage35);
}

function init_stage35(success,result) {
	if (result.length > 0) {
		//updatemessagewindow("Pending transactions in the local DB");
		messagewindowprompt("There are saved un-sent transactions. Try to continue sending?","Yes","No",function() {
			for (var x in result) {
				processtransaction(eval("("+result[x]["transactionjson"]+")"),0,false,true);
			}
			init_stage36();
		},function() {
			executeSQLWithCallback("delete from transactionstore",[]);
			init_stage36b();
		});
	} else {
		init_stage36();
	}
}

function init_stage36b() {
	var localschemaversion = registry["schemaversion"];
	if (parseInt(localschemaversion) != parseInt(internal_dbschema["version"])) {
		updatemessagewindow("Local Schema is out of date, updating...");
		//try { console.log('Schema is out of date, updating... Local version: '+localschemaversion+", App: "+internal_dbschema["version"]); } catch (e) {}
		$("#currentaction").html("Reloading database schema...");
		loadschemafromobject();
	} else {
		reloaddata(init_stage4);
	}
}

function init_stage36() {
	var localschemaversion = registry["schemaversion"];
	if (parseInt(localschemaversion) != parseInt(internal_dbschema["version"])) {
		updatemessagewindow("Local Schema is out of date, updating...");
		//try { console.log('Schema is out of date, updating... Local version: '+localschemaversion+", App: "+internal_dbschema["version"]); } catch (e) {}
		$("#currentaction").html("Reloading database schema...");
		loadschemafromobject();
	} else {
		catchup(init_stage4)
	}
}

function init_stage4() {
	//try { console.log('init_stage4: localtoptransactionid: '+localtoptransactionid); } catch (e) {}
	cb_generalrefresh();
	hidemessagewindow();
	startlisten();
	setTimeout("MRDB.forcecatchup()",catchuppolltime);
}

function catchup(callback) {
	if (!blockcatchup) {
		//try { console.log("Catchup2 T: "+lookaheadtidlist.join(", ")); } catch (e) {}
		updatemessagewindow("Synchronizing Local Database with server...");
		$("#currentaction").html("Synchronizing local database via streaming transactions");
		function catchupsuccess(jsondata,textstatus,request)
		{
			internal_setonline();
			//try { console.log("Catchup: Processing Result"); } catch (e) {}
			var responsedata = eval(jsondata);
			if (responsedata['success'])
			{
				if (responsedata['dbreload']) {
					//try { console.log("Catchup: Server suggested a reload instead"); } catch (e) {}
					reloaddata(callback);
				} else {
					//var q = new Array();
					//var catchupbulkmode = false;
					
					
					if (responsedata['transactions'].length > catchupbulkthreshold) {
						// Bulk mode
						try { console.log("Bulk Catchup Mode used"); } catch (e) {}
						startmessagewindow();
						updatemessagewindow("Catching up db...");

						var q = new Array();
						for (var i in responsedata['transactions']) {
							var tdata = responsedata['transactions'][i];
							var tid = parseInt(tdata['tid']);
							var t = tdata['t'];
							//processtransaction(transaction,tid,updateui,donotstore)
							processtransaction(t,tid,false,false,q);
						}
						
						function donequeue() {
							cb_generalrefresh();
							hidemessagewindow();
							try { console.log("Bulk Catchup done"); } catch (e) {}
						}
						executeSQLOffQueue(q,donequeue);
					} else {
						for (var i in responsedata['transactions']) {
							var tdata = responsedata['transactions'][i];
							var tid = parseInt(tdata['tid']);
							var t = tdata['t'];
							//processtransaction(transaction,tid,updateui,donotstore)
							processtransaction(t,tid,true);
						}
					}
		
					if (responsedata['ismore']) {
						//executeSQLOffQueue(q);
						var dataString = new Object;
						dataString.dbid = dbid;
						dataString.clientid = mrdb_clientid;
						dataString.lasttid = localtoptransactionid;
						dataString.rowlimit = 20;
						$.ajax({
							async: true,
							type: "GET",
							url: dbhost+"/db/catchup",
							data: dataString,
							success: catchupsuccess,
							dataType: "json",
							error: ajaxerror
						});
					} else {
						//executeSQLOffQueue(q,callback);
						try {callback();} catch (e) { }
					}
				}
			}
			else
			{
			  alert(responsedata['error']);
			}
		}
		
		var dataString = new Object;
		dataString.dbid = dbid;
		dataString.lasttid = localtoptransactionid;
		dataString.clientid = mrdb_clientid;
		dataString.rowlimit = 20;
		$.ajax({
			async: true,
			type: "GET",
			url: dbhost+"/db/catchup",
			data: dataString,
			success: catchupsuccess,
			dataType: "json",
			error: ajaxerror
		});
	} else {
		try { console.log("Catchup blocked, executing callback"); } catch (e) {}
		try { callback() } catch (e) {};
	}
}

// This is called from the server as a comet response when the client is deemed too far behind
function forcereload() {
	alert("Manually forcing a data reload...");

	//comet_stop();
	reloaddata(forcereload_2);
	//cb_generalrefresh();
	//Comet.start();
}

function forcereload_2() {
	hidemessagewindow();
	cb_generalrefresh();
	comet_start();
}


function updatelastid(setsetid,setastop) {
	var nextid = parseInt(localtoptransactionid) + 1;
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
	} else if (setid > localtoptransactionid) {
		// Add to lookahead list
		lookaheadtidlist.push(setsetid);
		$("#lookaheaddisplay").html(lookaheadtidlist.join(", "));
	}
}

function settopid(setid) {
	localtoptransactionid = setid;
	internal_executeSQLWithNoResult("update metadata set varvalue=? where varname=?",[setid,"localtoptransactionid"]);
	$("#topiddisplay").html(setid);
	//alert("setting top id: "+setid+" to "+stripnulls(setid));
}

function loadschemafromobject()
{
	//try { console.log('Loading schema from scratch'); } catch (e) {}
	function clearsuccess2_go() {
		//try { console.log('clearsuccess2_go'); } catch (e) {}
		var q = new Array();
		for (var i in internal_dbschema['tables'])
		{
			var tabledef = internal_dbschema['tables'][i];

			var buildquery = "create table "+tabledef['tablename']+" (";
			var foundrowid = false;
			for (var x in tabledef['columns'])
			{
				var col = tabledef['columns'][x];
				if (col['colname'] == "rowid") {
					foundrowid = true;
				}
			}
			if (!foundrowid) {
				buildquery = buildquery+"rowid text primary key asc,";
				//buildquery = buildquery+"rowid VARCHAR(50) UNIQUE,";
			}
			for (var x in tabledef['columns'])
			{
				var col = tabledef['columns'][x];
				if (x != 0) {
					buildquery += ",";
				}
				buildquery += col['colname']+" "+col['coltype'];
				if (col['colname'] == "rowid") {
					//foundrowid = true;
					buildquery += " primary key asc";
				}
			}
			
			buildquery += ")";
			try { console.log(buildquery); } catch (e) {}
			//internal_executeSQLWithNoResult(buildquery);
			queuequery(q,buildquery,[],0);
		}
		executeSQLOffQueue(q,clearsuccess3);
	}

	function clearsuccess3(success) {
		//try { console.log('clearsuccess3: '+success); } catch (e) {}
		//serverschemaversion = internal_dbschema['version'];
		//alert("From load: "+serverschemaversion);
		executeSQLWithCallback("delete from metadata where varname=?",['schemaversion']);
		executeSQLWithCallback("insert or replace into metadata (varname,varvalue) VALUES (?,?)",['schemaversion',internal_dbschema["version"]]);

		$("#currentaction").html("Nothing (Schema Loaded)");
		//updatelastid(serverlasttcount,serverlasttid,true);
		reloaddata(init_stage4);
	}

	function clearsuccess2(success,result,sqlquery) {
		//try { console.log('clearsuccess2'); } catch (e) {}
		var q = new Array();
		for (var x in result) {
			var row = result[x];
			var tname = row["name"];
			if (tname != "metadata" && tname != "sqlite_sequence" && tname != "transactionstore" && tname != "__WebKitDatabaseInfoTable__") {
				queuequery(q,"drop table "+tname,[],0);
			}
		}
		executeSQLOffQueue(q,clearsuccess2_go);
	}

	executeSQLWithCallback("select * from sqlite_master where type='table' order by name",[],clearsuccess2);
}

var tlistqueue = new Array();
function reloaddata(callback) {
	try { console.log('Reloading all data'); } catch (e) {}
	updatemessagewindow("Loading Database Information From Server...");
	$("#currentaction").html("Synchronizing DB (DB Load)");
	//updatelastid(0,true);
	localtoptransactionid = 0;

	var dataString = new Object;
	dataString.dbid = dbid;

	$.ajax({
		 async: false,
		 type: "GET",
		 url: dbhost+"/db/toptransactionid",
		 data: dataString,
		 success: getid,
		 dataType: "json",
		 error: ajaxerror
	});
	
	function getid(jsondata,textstatus,request) {
		var responsedata = eval(jsondata);
		
		settopid(responsedata["transaction"]);
		//localtoptransactionid = parseInt(responsedata["transaction"]);
		//try { console.log('Got server top transaction id: '+localtoptransactionid); } catch (e) {}
		
		tlistqueue = new Array();
		for (var i in internal_dbschema["tables"]) {
			
			tlistqueue.push(internal_dbschema["tables"][i]);
		}
		reloadatable();
	}
	
	function reloadatable() {
		if (tlistqueue.length > 0) {
			table = tlistqueue.shift();
			//try { console.log('Reloading a table: '+table["tablename"]); } catch (e) {}

			//var table = internal_dbschema["tables"][i];
		
			var collist = new Array();
			for (var c in table["columns"]) {
				collist.push(table["columns"][c]["colname"]);
			}
			
			var dataString = new Object;
			dataString.tablename = table["tablename"];
			dataString.chunksize = 30;
			dataString.dbid = dbid;
			dataString.cols = collist.join(",");
		
			$.ajax({
				 async: false,
				 type: "GET",
				 url: dbhost+"/db/loaddata",
				 data: dataString,
				 success: dataloadsuccess,
				 dataType: "text",
				 error: ajaxerror
			});
		} else {
			try { console.log('Done reloading tables'); } catch (e) {}
			updatemessagewindow("");
			try { catchup(callback()); } catch (e) { }
		}
	}

	function subtest(success,result,sql,params,passthrough) {
		//try { console.log("Sub Test: "+passthrough); } catch (e) {}
		updatemessagewindow("Loading Database Information From Server... ("+passthrough+")");
	}
	
	function dataloadsuccess(jsondata,textstatus,request) {
		//alert(jsondata);
		//var responsedata = JSON.parse("("+jsondata+")");
		
		//alert(responsedata);
		//var responsedata = eval(jsondata);
		var responsedata = eval("("+jsondata+")");
		if (responsedata['success'])
		{
			//alert("Load Success");
			// Need indicaters of "start of load", "continuing", "there is more to come"
			//if (responsedata['isstart']) {
			internal_executeSQLWithNoResult("delete from "+responsedata['tablename']);
//			}
			var startrow = responsedata['startrow'];
			var endrow = responsedata['endrow'];
			$("#currentaction").html("Loading DB Table: "+responsedata['tablename']+")");
			//+" ("+startrow+"-"+endrow+" of "+responsedata['totalrows']
			updatemessagewindow("Loading Database Information From Server... (Table "+responsedata['tablename']+")");
			//("+startrow+"-"+endrow+" of "+responsedata['rowdata']+")

			var rowcount = 0;
			var q = new Array();
			var resultlength = responsedata['rowdata'].length;
			for (var i in responsedata['rowdata'])
			{
				var row = responsedata['rowdata'][i];

				var colsql = "";
				var values = new Array();
				var qsql = "";
				var first = true;
				for (var x in row)
				{
					if (x == "rowid") {
						if (!first) {
							qsql += ",";
							colsql = "rowid,"+colsql;
							//colsql = "rowid"+colsql;
						} else {
							colsql = "rowid"+colsql;
						}
						
						values.unshift(row[x]);
						
					} else {
						
						if (!first) {
							colsql += ",";
							qsql += ",";
						}

						colsql += x;
						values.push(row[x]);
						
					}
					qsql += "?";
					//qsql = "?";
					if (first) {
						first = false;
					}
				}
				var buildquery = "insert into "+responsedata['tablename']+" ("+colsql+") VALUES ("+qsql+")";
				//try { console.log('Loading: '+buildquery+" VALUES: "+values); } catch (e) {}
				//alert(buildquery);
				//for (var x=0;x < values.length;x++) {
				//	values[x] = stripnulls(values[x]);
				//}
				queuequery(q,buildquery,values,0,subtest,"Table "+responsedata['tablename']+" ("+i+" of "+resultlength+")");
				//internal_executeSQLWithNoResult(buildquery,values);
				rowcount++;
			}
			executeSQLOffQueue(q,reloadatable);
			/*
			if (responsedata['ismore']) {
				var dataString = new Object;
				dataString.chunksize = 30;
				dataString.loadid = responsedata['loadid'];
				dataString.startrow = endrow + 1;
				dataString.dbid = dbid;

				$.ajax({
					 async: false,
					 type: "GET",
					 url: dbhost+"/db/loaddata",
					 data: dataString,
					 success: dataloadsuccess,
					 dataType: "json",
					 error: ajaxerror
				});
			} else {
				
			}*/
			//reloaddata_stage3();
			//updatelastid(responsedata['servertcount'],responsedata['servertid'],true);
			//serverlasttid = responsedata['servertid'];
			//serverlasttcount = responsedata['servertcount'];
			//alert("Table "+responsedata['tablename']+" Loaded ("+rowcount+" rows)");
		}
		else
		{
			alert(responsedata['error']);
		}
	}
}





var transactionqueue = new Array();
var currenttransaction = null;

function db_execute(t,ignorestorage) {
	if (!ignorestorage) {
		var tempid = randomid()
		t.tid = tempid
		internal_executeSQLWithNoResult("insert into transactionstore (transactionjson,tid) VALUES (?,?)",[JSON.stringify(t),tempid]);
	}
	transactionqueue.push(t);
	$("#tcount").html(transactionqueue.length);
	runtransactions();
}

var isrunning = false;
function runtransactions()
{
	 if (!isrunning && transactionqueue.length > 0)
	 {
		  isrunning = true;
		  var t = transactionqueue.shift();
		  currenttransaction = t;
		  sendtransaction();
	 } else {
		 try { console.log("runtransaction call ignored: Already Running: "+isrunning+", Queue Length: "+transactionqueue.length); } catch (e) {}
	 }
}

function sendtransaction()
{
	$("#currentaction").html("Uploading Transaction...");
	//currenttransaction = tosend;
	//try { console.log("Send T: "+currenttransaction); } catch (e) {}
	if (isonline) {
		var dataString = new Object;
		dataString.transaction = JSON.stringify(currenttransaction);
		dataString.clientid = mrdb_clientid;
		dataString.dbid = dbid;
		//dataString.topclienttcount = topclienttransactioncount;
		//dataString.topclienttid = topclienttransactionid;

		$.ajax({
			async: true,
			type: "POST",
			url: dbhost+"/db/transaction",
			data: dataString,
			success: runt_success,
			error: runt_error
		});
	} else {
		isrunning = false;
		transactionqueue.unshift(currenttransaction);
		//setTimeout("MRDB.retrysend();",10000);
	}
}

function runt_success(jsondata,textstatus,request) {
	//comet_setonline();
	//alert("Transaction Success");
	internal_setonline();
	var responsedata = eval(jsondata);
	if (responsedata['success']) {
		var tid = responsedata['tid'];
		$("#currentaction").html("Nothing (Transaction successfully uploaded: Temp ID: "+responsedata["tempid"]+", Server TID: "+tid+")");
		//var tcount = responsedata['tcount'];
		updatelastid(tid,false);
		internal_executeSQLWithNoResult("delete from transactionstore where tid=?",[responsedata["tempid"]])
		$("#tcount").html(transactionqueue.length);
	} else {
		$("#tcount").html(transactionqueue.length);
		$("#currentaction").html("Nothing (Transaction error)");
		alert(responsedata['error']);
	}
	
	//try { console.log("RUN T: "+lookaheadtidlist.join(", ")); } catch (e) {}

	if (transactionqueue.length == 0) {
		isrunning = false;
	} else {
		currenttransaction = transactionqueue.shift();
		sendtransaction();
	}
}

function runt_error(request,status,error)
{
	try { console.log("Transaction Error: "+error); } catch (e) {}
	isrunning = false;
	transactionqueue.unshift(currenttransaction);
	internal_setoffline();
}

function ajaxerror(request,status,error) {
	if (status == "error" && error == "") {
		//alert("I think we're offline now");
		internal_setoffline();
	} else {
		alert("Error caught: "+status+","+error);	
	}
}

function processtransaction(transaction,tid,updateui,donotstore,queryqueue) {
	queryqueue = typeof(queryqueue) != 'undefined' ? queryqueue : null;
	/*if (queryqueue != null) {
		try { console.log("processtransaction - queue "+queryqueue); } catch (e) {}
	} else {
		try { console.log("processtransaction - direct "+queryqueue); } catch (e) {}
	}*/
	//try { console.log("Processing Transaction: "+transaction+", "+tid); } catch (e) {}
	// If it has no transaction id, execute internally
	// If it has an id but it's not in the look-ahead list, execute
	if ((tid > 0 && tid != "" && $.inArray(tid,lookaheadtidlist) == -1 && tid > localtoptransactionid) || tid <= 0) {
		if (transaction["action"] == "addrow") {
			dbcallback_addrow(transaction["tablename"],transaction["data"],updateui,queryqueue);
		} else if (transaction["action"] == "delrow") {
			dbcallback_delrow(transaction["tablename"],transaction["rowid"],updateui,queryqueue);
		} else if (transaction["action"] == "changedata") {
			dbcallback_changedata(transaction["tablename"],transaction["rowid"],transaction["colname"],transaction["newvalue"],updateui,queryqueue);
		}
	}
	
	// Send it to server
	if (tid <= 0) {
		//alert("1");
		donotstore = typeof(donotstore) != 'undefined' ? donotstore : false;
		db_execute(transaction,donotstore);
	} else {
		//alert("2 "+tid);
		updatelastid(tid,false);
	}
}

function dbcallback_addrow(tablename,data,updateui,queryqueue) {
	function addrow_querycallback(success,result,sqlquery,params,passthrough) {
		if (passthrough) {
			cb_addrow(tablename,data);
		}
	}

	var collist = "";
	var valuelist = Array();
	var qlist = "";
	var first = true;
	for (var i in data) {
		if (first) {
			first = false;
		} else {
			collist += ",";
			qlist += ",";
		}
		collist += i;
		valuelist.push(data[i]);
		qlist += "?";
	}
	queryqueue = typeof(queryqueue) != 'undefined' ? queryqueue : null;
	if (queryqueue != null) {
		//try { console.log("dbcallback_addrow - queue"); } catch (e) {}
		queuequery(queryqueue,"insert or ignore into "+tablename+" ("+collist+") VALUES ("+qlist+")",valuelist,0,addrow_querycallback,updateui);
	} else {
		//try { console.log("dbcallback_addrow - direct"); } catch (e) {}
		executeSQLWithCallback("insert or ignore into "+tablename+" ("+collist+") VALUES ("+qlist+")",valuelist,addrow_querycallback,true,updateui);	
	}
}

function dbcallback_delrow(tablename,rowid,updateui,queryqueue) {
	function delrow_querycallback(success,result,sqlquery,params,passthrough) {
		if (passthrough) {
			cb_delrow(tablename,rowid);
		}
		//try { passthrough.callback(tablename,rowid,colname,newvalue,updateui); } catch (e) { }
	}

	queryqueue = typeof(queryqueue) != 'undefined' ? queryqueue : null;
	if (queryqueue != null) {
		//try { console.log("dbcallback_delrow - queue"); } catch (e) {}
		queuequery(queryqueue,"delete from "+tablename+" where rowid=?",[rowid],0,delrow_querycallback,updateui);
	} else {
		//try { console.log("dbcallback_delrow - direct"); } catch (e) {}
		executeSQLWithCallback("delete from "+tablename+" where rowid=?",[rowid],delrow_querycallback,true,updateui);
	}
}

function dbcallback_changedata(tablename,rowid,colname,newvalue,updateui,queryqueue) {
	function changedata_querycallback(success,result,sqlquery,params,passthrough) {
		if (passthrough) {
			cb_changedata(tablename,rowid,colname,newvalue);
		}
		//try { passthrough.callback(tablename,rowid,colname,newvalue,updateui); } catch (e) { }
	}
	queryqueue = typeof(queryqueue) != 'undefined' ? queryqueue : null;
	if (queryqueue != null) {
		//try { console.log("dbcallback_changedata - queue"); } catch (e) {}
		queuequery(queryqueue,"update or ignore "+tablename+" set "+colname+"=? where rowid=?",[newvalue,rowid],0,changedata_querycallback,updateui);
	} else {
		//try { console.log("dbcallback_changedata - direct"); } catch (e) {}
		executeSQLWithCallback("update or ignore "+tablename+" set "+colname+"=? where rowid=?",[newvalue,rowid],changedata_querycallback,true,updateui);
	}
}


var sqlrunning = true;

function internal_executeSQLWithNoResult(sqlquery,parameters) {
	if (dbmode == "gears") {
		db.execute(sqlquery,parameters);
	} else if (dbmode == "html5") {
		if (logqueries) {
			try { console.log("Executing Direct SQL (No Result): "+sqlquery+"; ["+parameters+"]"); } catch (e) {}
		}
		sqlrunning = true;
		db.transaction(function(t) {
			t.executeSql(sqlquery+";", stripnullsfromvaluelist(parameters), null, function(transaction,error) { try { console.log("HTML5 DB Error "+sqlquery+": "+error.message); } catch (e) {} });
		});
	}
}

// Callback is (success,result,query,params,passthrough)
function executeSQLWithCallback(sqlquery,parameters,callback,ignoreerrors,passthrough) {
	try {
		if (dbmode == "gears") {
			var toreturn = new Array();
			var rs = db.execute(sqlquery,parameters);
			while (rs.isValidRow()) {
				var row = Array();
				for (i=0;i < rs.fieldCount();i++) {
					row[rs.fieldName(i)] = rs.field(i);
				}
				rs.next();
				toreturn.push(row);
			}
			try { callback(true,toreturn,sqlquery); } catch (e) { }
		} else if (dbmode == "html5") {
			db.transaction(
				function(transaction) {
					if (logqueries) {
						try { console.log("Executing SQL with callback: "+sqlquery+"; ["+parameters+"]"); } catch (e) {}
					}
					transaction.executeSql(sqlquery+";",stripnullsfromvaluelist(parameters),function(t,r) {
						var toreturn = new Array();
						for (var i=0; i <r.rows.length;i++) {
							var row = r.rows.item(i);
							toreturn.push(row);
						}
						try { callback(true,toreturn,sqlquery,parameters,passthrough); } catch (err) {
							try { console.log("Error calling callback from query: "+err.message); } catch (e) {}
						}
					},function(transaction,error) { try { console.log('HTML5 SQL Error '+sqlquery+' '+error.message); } catch (e) {} try { callback(false,toreturn,sqlquery); } catch (e) { } });
				}
			);
		}
	} catch (e) {
		if (!ignoreerrors) {
			throw(e);
		} else {
			try { console.log(e.message); } catch (e) {}
		}
	}
}

function executeSQLOffQueue(queryqueue,callback) {
	if (queryqueue.length > 0) {
		q = queryqueue.shift();
		if (dbmode == "gears") {
			try {
				db.execute(q[0],q[1]);
				if (q[2] > 0) {
					updatelastid(q[2],q[3],false);
				}
			} catch (e) {
				try { console.log(e.message); } catch (e) {}
			}
			executeSQLOffQueue(queryqueue,callback);
		} else if (dbmode == "html5") {
			db.transaction(
				function(transaction) {
					if (logqueries) {
						try { console.log("Executing SQL from Queue: "+q[0]+", "+q[1]+", "+q[2]); } catch (e) {}
					}
					
					transaction.executeSql(q[0]+";",stripnullsfromvaluelist(q[1]),function(t,r) {
						var toreturn = new Array();
						for (var i=0; i <r.rows.length;i++) {
							var row = r.rows.item(i);
							toreturn.push(row);
						}
						try {
							//try { console.log(q[2]); } catch (e) {}
							//console.assert(false, q[2]);
							if (q[2] > 0) {
								updatelastid(q[2],false);
							}
						} catch (e) {}
						if (typeof(q[3]) != 'undefined') {
							try {
								q[3](true,toreturn,q[0],q[1],q[4]);
							} catch (err) {
								try { console.log("Error calling callback from queued query: "+err.message); } catch (e) {}
							}
						}
						executeSQLOffQueue(queryqueue,callback);
					},function(transaction,error) {
						try { console.log('HTML5 SQL Error on '+q[0]+' ('+q[1]+') --> '+error.message); } catch (e) {}
						executeSQLOffQueue(queryqueue,callback);
					});
				}
			);
		}
	} else {
		try {callback();} catch (e) { }
	}
}

function queuequery(queryqueue,sql,parameters,settransactionid,subcallback,passthrough) {
	if (logqueries) {
		try { console.log('Queue Query: '+sql+', '+parameters+', '+settransactionid); } catch (e) {}
		//for (var i=0; i < parameters.length; i++) {
			//try { console.log('P: '+parameters[i]+' to '+stringToAscii(stripnulls(parameters[i]))); } catch (e) {}
		//}
	}
	queryqueue.push([sql,parameters,settransactionid,subcallback,passthrough]);
}

function internal_setonline() {
	$("#onlinestatus").html("Online");
	if (!isonline) {
		isonline = true;
		runtransactions();
		catchup(restartlisten);
	}
}
function internal_setoffline() {
	$("#onlinestatus").html("Offline");
	if (isonline) {
		isonline = false;
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


function randomid()
{
	 var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
	 var string_length = 20;
	 var randomstring = '';
	 for (var i=0; i < string_length; i++) {
		  var rnum = Math.floor(Math.random() * chars.length);
		  randomstring += chars.substring(rnum,rnum+1);
	 }
	 return randomstring;
}

function stripnullsfromvaluelist(values) {
	values = typeof(values) != 'undefined' ? values : null;
	if (values != null) {
		for (var x=0;x<values.length;x++) {
			values[x] = stripnulls(values[x]);
		}
	}
	return values;
}

function stripnulls(s) {
	var newstring = "";
	if (isNaN(s)) {
		if(s.length>0) {
			for(i=0; i<s.length; i++) {
				if (s.charCodeAt(i) > 0) {
					newstring = newstring + s[i]
				}
			}
		}
	} else {
		newstring = s;
	}
	if (s != newstring) {
		try { console.log("Stripping "+s+" to "+newstring); } catch (e) {}	
	}
	
	return(newstring);
}

function stringToAscii(s)
{
  var ascii="";
  if(s.length>0)
    for(i=0; i<s.length; i++)
    {
      var c = ""+s.charCodeAt(i);
      while(c.length < 3)
       c = "0"+c;
      ascii += c;
    }
  return(ascii);
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
	channel = new goog.appengine.Channel(mrdb_channeltoken);
	socket = channel.open();
	socket.onopen = onChannelOpened;
	socket.onmessage = onChannelMessage;
	socket.onerror = onChannelError;
	socket.onclose = onChannelClose;
}

onChannelOpened = function() {
	//try { console.log("Channel: onChannelOpened"); } catch (e) {}
};

onChannelMessage = function(message) {
	//try { console.log("Channel: onChannelMessage: "+message.data); } catch (e) {}
	//try {
		var data = eval("("+message.data+")");
		//,"tid":1000,"data":{"action":"addrow","tablename":"testtable","data":{"rowid":"6kTRg1glcpZLeGwyDMoa","col1":"test description","col2":"asdfasdf"},"tid":"TsfiTawTl70e9lF6JAl2"}}');
		
		if (data["messageaction"] == "transaction") {
			processtransaction(data["data"],data["tid"],true);
		} else {
			try { console.log("onChannel Transaction was not found, ignoring"); } catch (e) {}
		}
	//} catch (e) {}
}

onChannelError = function() {
	try { console.log("Channel: onChannelError"); } catch (e) {}
}

onChannelClose = function() {
	try { console.log("Channel: onChannelClose"); } catch (e) {}
}

})();
