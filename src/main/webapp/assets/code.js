var initrun = false;
jQuery(document).ready(function() {
	if (!initrun) {
		initrun = true;
		function c() {
			$("#tabs").tabs({
				show: function(event, ui) { try { reacttoshow(ui.panel.id); } catch (e) {
					try { console.error("Tab error",e); } catch (e2) {}
				}; }
			});
		}
		JSONDB.init(c,master_eventid,master_channeltoken,master_clientid);
		$("#people_datalist_master").tablesorter({
			headers: {
				4: { sorter: false}
			}
		});
		$("#unpeople_datalist_master").tablesorter({
			headers: {
				2: { sorter: false}
			}
		});
		$("#affiliation_datalist_master").tablesorter({
			headers: {
				2: { sorter: false}
			}
		});
		$("#regtable_new_master").tablesorter({
			headers: {
				3: { sorter: false}
			}
		});
		$("#regtable_old_master").tablesorter({
			headers: {
				3: { sorter: false}
			}
		});
		$("#peoplefinancetable").tablesorter({
			headers: {
				0: { sorter: false}
			}
		});
		$("#vouchers_vouchertable").tablesorter();
		$("#vouchers_affiliationsummary").tablesorter();
		$("#registration-accordion").accordion({
			collapsible: true
		});
		$("#people-accordion").accordion({
			collapsible: true
		});
	}
});

function reacttoshow(tab) {
	//JSONDB.unregister_transaction_listener_by_id("people");
	//JSONDB.unregister_transaction_listener_by_id("groups");
	if (tab == "tab-people") {
		//JSONDB.register_transaction_listener("people","addperson",function() {people_load();});
		//JSONDB.register_transaction_listener("people","modperson",function() {people_load();});
		//JSONDB.register_transaction_listener("people","removeperson",function() {people_load();});
		people_load();
	}
	if (tab == "tab-groups") {
		groups_load();
	}
	if (tab == "tab-affiliation") {
		affiliationgroup_load();
	}
	if (tab == "tab-settings") {
		settings_load();
	}
	if (tab == "tab-registration") {
		reg_load();
	}
	if (tab == "tab-points") {
		points_load();
	}
	if (tab == "tab-moneyin") {
		moneyin_load();
	}
	if (tab == "tab-vouchers") {
		vouchers_load();
	}
	if (tab == "tab-peoplefinance") {
		peoplefinance_load();
	}
	if (tab == "tab-spenders") {
		spenders_load();
	}
	if (tab == "tab-budget") {
		budget_load();
	}
	if (tab == "tab-matrix") {
		matrix_load();
	}
	if (tab == "tab-reports") {
		reports_load();
	}
}

function closecheck(func) {
	$.modal.close();
	setTimeout(func,250);
}

function parsedate(datestring) {
	var thedate = null;
	try {
		var datedata = datestring.split("/");
		if (datedata.length == 3) {
			thedate = new Date(datedata[2],datedata[0]-1,datedata[1])
		}
	} catch(err) {
		//alert(err);
	}
	return thedate;
}

function getage(thedate) {
	if (thedate == null) {
		return "Unknown";
	} else {
		var bday=thedate.getDate();
		var bmo=thedate.getMonth();
		var byr=thedate.getFullYear();
		var now = new Date();
		tday=now.getDate();
		tmo=(now.getMonth());
		tyr=(now.getFullYear());

		if((tmo > bmo)||(tmo==bmo & tday>=bday)) {
			age=byr;
		} else {
			age=byr+1;
		}
		return tyr - age;
	}
}

function plist_sort(a, b) {
	if (a["lastname"].toUpperCase() < b["lastname"].toUpperCase()) {
		return -1;
	} else if (a["lastname"].toUpperCase() == b["lastname"].toUpperCase()) {
		if (a["firstname"].toUpperCase() < b["firstname"].toUpperCase()) {
			return -1;
		} else if (a["firstname"].toUpperCase() == b["firstname"].toUpperCase()) {
			return 0;	
		} else {
			return 1;
		}
	} else {
		return 1;
	}
}

//Format Dollar strings
function fd(value) {
	if (value == "" || isNaN(value) || value == null) {
		return "$0.00";
	} else {
		//var sval = ""+value;
		var sval = ""+Math.round(value*100)/100;
		if (sval.substr(0,1) == "-") {
			sval = sval.substr(1);
		}
		if (sval.indexOf(".") != -1) {
			//sval = sval;
			if (sval.indexOf(".") == sval.length-2) {
				sval = sval+"0";
			}
		} else {
			sval = sval+".00";
		}
		sval = "$"+sval;
		if (value < 0) {
			sval = "-"+sval;
		}
		return sval;
	}
}

function getnowstamp() {
	var ct = new Date();
	return ct.getFullYear()+"-"+zerofill(ct.getMonth()+1,2)+"-"+zerofill(ct.getDate(),2)+"-"+zerofill(ct.getHours(),2)+"-"+zerofill(ct.getMinutes(),2)+"-"+zerofill(ct.getSeconds(),2);
	//return "stamp";
}

function parsef(value) {
	if (value == null || value == "" || isNaN(value-0)) {
		value = 0;
	}
	return parseFloat(value);
}

function zerofill(val,length) {
	var amount = (length - (val+'').length);
	var newval = val+'';
	for (i=0;i<amount;i=i+1) {
		newval = "0" + newval;
	}
	return newval;
}

function nl2br(text) {
	return text.replace("\n","<br/>");
}

function safeforhtml(data) {
	var g_oHtmlEncodeElement = g_oHtmlEncodeElement || document.createElement("div");
	g_oHtmlEncodeElement.innerText = g_oHtmlEncodeElement.textContent = data;
	return g_oHtmlEncodeElement.innerHTML;
	//return data.replace("<","&lt;").replace(">","&gt;");
}

function getsortedpeople() {
	var plist = [];
	for (personid in JSONDB.jsondb["people"]) {
		var p = JSONDB.jsondb["people"][personid];
		plist.push(p)
	}
	plist.sort(plist_sort);
	return plist;
}

function getsortedaffiliations() {
	var alist = []
	for (id in JSONDB.jsondb["affiliation"]) {
		var a = JSONDB.jsondb["affiliation"][id];
		alist.push(a);
	}
	
	function alist_sort(a, b) {
		if (a["groupname"].toUpperCase() < b["groupname"].toUpperCase()) {
			return -1;
		} else if (a["groupname"].toUpperCase() == b["groupname"].toUpperCase()) {
			return 0;
		} else {
			return 1;
		}
	}
	
	alist.sort(alist_sort);
	return alist;
}

/*function grouparea_switchdisplay(button) {
	if ($(button).val() == "Hide") {
		$(button).val("Show");
		$(button).parents("tr").next().css("display","none");
	} else {
		$(button).val("Hide");
		$(button).parents("tr").next().css("display","");
	}
}*/
function people_switchsignedin(button) {
	var sivalue = $(button).parents("td").children(".sivalue").text();
	var personid = $(button).parents("tr").attr("personid");
	//try { console.log(personid); } catch (e) {}
	var t = {"action":"modperson","params":{"id":personid}};
	if (sivalue == "Yes") {
		t["params"]["signedin"] = "0";
		$(button).parents("td").children(".sivalue").text("No");
	} else {
		t["params"]["signedin"] = "1";
		$(button).parents("td").children(".sivalue").text("Yes");
	}
	JSONDB.dotransaction(t);
	//try { console.log(sivalue); } catch (e) {}
}

var people_sortset = false;
var unpeople_sortset = false;
function people_load() {
	//try { console.log("people_load"); } catch (e) {}
	$("#people_datalist").empty();
	var pcount = 0;
	for (id in JSONDB.jsondb["people"]) {
		var person = JSONDB.jsondb["people"][id];
		pcount = pcount + 1;
		var row = $("<tr>\n\
			<td class='firstname'></td>\n\
			<td class='lastname'></td>\n\
			<td class='affiliation'></td>\n\
			<td class='signedin'></td>\n\
			<td class='centerit'><input type='button' value='View' onClick='people_processrowaction(this,\"view\");'/></td>\n\
			<td class='centerit'><input type='button' value='Mod' onClick='people_processrowaction(this,\"mod\");'/></td>\n\
			<td class='centerit'><input type='button' value='Remove' onClick='people_processrowaction(this,\"delete\");'/></td>\n\
		</tr>");
		row.attr("personid",id);
		row.children(".firstname").text(person["firstname"]);
		row.children(".lastname").text(person["lastname"]);
		row.children(".affiliation").text(report_getaffiliationname(person["affiliation"]));
		
		if (person["signedin"] == "1") {
			row.children(".signedin").html("<span class='sivalue'>Yes</span> (<a href='#' onClick='return people_switchsignedin(this);'>Switch</a>)");
		} else {
			row.children(".signedin").html("<span class='sivalue'>No</span> (<a href='#' onClick='return people_switchsignedin(this);'>Switch</a>)");
		}
		
		$("#people_datalist").append(row);
	}
	$("#people_peoplecount").text("("+pcount+")");
	
	if (!jQuery.isEmptyObject(JSONDB.jsondb["people"]) && !people_sortset) {
		$("#people_datalist_master").trigger("update",[[[1,0],[0,0]]]);
		people_sortset = true;
	} else if (!jQuery.isEmptyObject(JSONDB.jsondb["people"])) {
		$("#people_datalist_master").trigger("update");
	}
	
	$("#unpeople_datalist").empty();
	var upcount = 0;
	for (id in JSONDB.jsondb["unpeople"]) {
		var p = JSONDB.jsondb["unpeople"][id];
		upcount = upcount + 1;
		var row = $("<tr>\n\
			<td class='firstname'></td>\n\
			<td class='lastname'></td>\n\
			<td class='centerit'><input type='button' value='Unremove' onClick='people_processrowaction(this,\"undelete\");'/></td>\n\
		</tr>");
		row.attr("personid",id);
		row.children(".firstname").text(p["firstname"]);
		row.children(".lastname").text(p["lastname"]);
		$("#unpeople_datalist").append(row);
	}
	$("#people_unpeoplecount").text("("+upcount+")");
	
	if (!jQuery.isEmptyObject(JSONDB.jsondb["unpeople"]) && !unpeople_sortset) {
		$("#unpeople_datalist_master").trigger("update",[[[0,0],[1,0]]]);
		unpeople_sortset = true;
	} else if (!jQuery.isEmptyObject(JSONDB.jsondb["unpeople"])) {
		$("#unpeople_datalist_master").trigger("update");
	}
	$("#people-accordion").accordion("resize");
}

function people_generateform() {
	$("#modal_personform").modal({containerCss: {width:"95%",height:"90%"}});
	for (id in JSONDB.jsondb["affiliation"]) {
		var a = JSONDB.jsondb["affiliation"][id];
		$("#modal_personform_affiliation").append($("<option></option>").attr("value",id).text(a["groupname"]));
	}

	for (var x in settings_get("customordering",[])) {
		var cfieldid = JSONDB.jsondb["settings"]["customordering"][x];
		var cfield = JSONDB.jsondb["settings"]["customfields"][cfieldid];

		var crow = $("<tr><td class='fieldname modal_fieldlabelcell'></td><td class='fieldhtml'></td></tr>");
		if (cfield["fieldtype"] == "largetext") {
			crow.children(".fieldhtml").append("<textarea id='goform_"+cfield["id"]+"'/>");
		} else if (cfield["fieldtype"] == "list") {
			var sitem = $("<select id='goform_"+cfield["id"]+"'></select>");
			sitem.append("<option value=\"\">Nothing Selected</option>");
			for (var z in cfield["fielddata"]) {
				if (cfield["fielddata"][z] != "") {
					sitem.append($("<option></option>").attr("value",cfield["fielddata"][z]).text(cfield["fielddata"][z]));
				}
			}
			crow.children(".fieldhtml").append(sitem);
		} else {
			crow.children(".fieldhtml").append("<input type='text' size='15' id='goform_"+cfield["id"]+"'/>");
		}
		crow.children(".fieldname").text(cfield["fieldname"]);
		$("#modal_personform_fieldtable").append(crow);
	}
	
	if (JSONDB.jsondb.hasOwnProperty("groupareas") && JSONDB.jsondb["groupareas"].hasOwnProperty("orderarray")) {
		for (id in JSONDB.jsondb["groupareas"]["orderarray"]) {
			var gaid = JSONDB.jsondb["groupareas"]["orderarray"][id];
			var ga = JSONDB.jsondb["groupareas"][gaid];
			var grow = $("<tr><td class='modal_fieldlabelcell label'></td><td><select id='groupmembership_"+gaid+"'></select></td><td class='modal_fieldlabelcell leaderoption'></td></tr>")
			grow.children(".label").text(ga["label"]);
			grow.find("select").append("<option value=''>Not Selected</option>");
			
			if (ga.hasOwnProperty("groupordering")) {
				for (gindex in ga["groupordering"]) {
					var groupid = ga["groupordering"][gindex];
					var group = ga["groups"][groupid];
					grow.find("select").append($("<option></option>").attr("value",groupid).text(group["label"]));
				}
			}
			
			if (ga["hasleaders"] == "1") {
				grow.children(".leaderoption").append("<input type='checkbox' id='isleader_"+ga["id"]+"'/> Leader?")
			}

			$("#modal_personform_grouptable").append(grow);
		}
	}

	if (settings_get("useshop") != "yes") {
		$("#modal_personform_shoparea").css("display","none");
	}
}

function people_add() {
	people_generateform();
	$("#model_personform_btn_new").attr("value","Add Person");
	$("#model_personform_btn_delete").css("display","none");
	$("#model_personform_btn_new").click(function() {
		reg_regtouser(0);
		people_load();
		$.modal.close();
	});
	return false;
}

function people_processrowaction(button,action) {
	var personid = $(button).parents("tr").attr("personid");
	if (action == "mod") {
		people_mod(personid);
	} else if (action == "view") {
		people_view(personid);
	} else if (action == "undelete") {
		people_undelete(personid);
	} else if (action == "delete") {
		people_delete(personid);
	}
}

function people_mod(personid) {
	var p = JSONDB.jsondb["people"][personid];
	people_generateform();
	
	$("#modal_personform_firstname").val(p["firstname"]);
	$("#modal_personform_lastname").val(p["lastname"]);
	$("#modal_personform_homephone").val(p["homephone"]);
	$("#modal_personform_mobilephone").val(p["mobilephone"]);
	$("#modal_personform_email").val(p["email"]);
	$("#modal_personform_parents_name").val(p["parents_name"]);
	$("#modal_personform_parents_phone").val(p["parents_phone"]);
	$("#modal_personform_emergencyinfo").val(p["emergencyinfo"]);
	$("#modal_personform_carecard").val(p["carecard"]);
	$("#modal_personform_birthdate").val(p["birthdate"]);
	$("#modal_personform_gender option[value='"+p["gender"]+"']").attr('selected', 'selected');
	$("#modal_personform_address_street").val(p["address_street"]);
	$("#modal_personform_address_city").val(p["address_city"]);
	$("#modal_personform_address_postal").val(p["address_postal"]);
	$("#modal_personform_comments").val(p["comments"]);
	showimage($("#modal_personform_image"),p["picturefileid"],"small",true);
	
	$("#modal_personform_affiliation option[value='"+p["affiliation"]+"']").attr('selected', 'selected');

	if (p["signedin"] == "1") {
		$('#modal_perseonform_signedin').attr('checked',true);
	}
	
	try {
		for (var x in p["customfields"]) {
			$("#goform_"+x).val(p["customfields"][x]);
		}
	} catch (e) {
		try { console.error("cfield error ",e); } catch (e2) {}
	}
	
	try {
		for (var x in p["groupselection"]) {
			$("#groupmembership_"+x).val(p["groupselection"][x]["groupid"]);
			if (p["groupselection"][x]["isleader"] == "1") {
				$('#isleader_'+x).attr('checked',true);
			}
		}
	} catch (e) {
		try { console.error("cfield error ",e); } catch (e2) {}
	}

	$("#modal_personform_field_shopamount").val(p["shopvouch"]);
	
	$("#model_personform_btn_new").attr("value","Save Modifications");
	$("#model_personform_btn_delete").css("display","none");
	$("#model_personform_btn_new").click(function() {
		people_processmod(personid);
		people_load();
		$.modal.close();
	});
	
	return false;
}

function people_processmod(personid) {
	var p = JSONDB.jsondb["people"][personid];
	// This function assumes the process interface is showing, and filled out
	var t = {"action":"modperson","params":{"id":personid}};
	if (p["firstname"] != $("#modal_personform_firstname").val()) { t["params"]["firstname"] = $("#modal_personform_firstname").val(); }
	if (p["lastname"] != $("#modal_personform_lastname").val()) { t["params"]["lastname"] = $("#modal_personform_lastname").val(); }
	if (p["homephone"] != $("#modal_personform_homephone").val()) { t["params"]["homephone"] = $("#modal_personform_homephone").val(); }
	if (p["mobilephone"] != $("#modal_personform_mobilephone").val()) { t["params"]["mobilephone"] = $("#modal_personform_mobilephone").val(); }
	if (p["email"] != $("#modal_personform_email").val()) { t["params"]["email"] = $("#modal_personform_email").val(); }
	if (p["parents_name"] != $("#modal_personform_parents_name").val()) { t["params"]["parents_name"] = $("#modal_personform_parents_name").val(); }
	if (p["parents_phone"] != $("#modal_personform_parents_phone").val()) { t["params"]["parents_phone"] = $("#modal_personform_parents_phone").val(); }
	if (p["emergencyinfo"] != $("#modal_personform_emergencyinfo").val()) { t["params"]["emergencyinfo"] = $("#modal_personform_emergencyinfo").val(); }
	if (p["carecard"] != $("#modal_personform_carecard").val()) { t["params"]["carecard"] = $("#modal_personform_carecard").val(); }
	if (p["birthdate"] != $("#modal_personform_birthdate").val()) { t["params"]["birthdate"] = $("#modal_personform_birthdate").val(); }
	if (p["gender"] != $("#modal_personform_gender").val()) { t["params"]["gender"] = $("#modal_personform_gender").val(); }
	if (p["address_street"] != $("#modal_personform_address_street").val()) { t["params"]["address_street"] = $("#modal_personform_address_street").val(); }
	if (p["address_city"] != $("#modal_personform_address_city").val()) { t["params"]["address_city"] = $("#modal_personform_address_city").val(); }
	if (p["address_postal"] != $("#modal_personform_address_postal").val()) { t["params"]["address_postal"] = $("#modal_personform_address_postal").val(); }
	if (p["comments"] != $("#modal_personform_comments").val()) { t["params"]["comments"] = $("#modal_personform_comments").val(); }
	if (p["affiliation"] != $("#modal_personform_affiliation").val()) { t["params"]["affiliation"] = $("#modal_personform_affiliation").val(); }
	if (p["picturefileid"] != $("#modal_personform_image").attr("picturefileid")) { t["params"]["picturefileid"] = $("#modal_personform_image").attr("picturefileid"); }
	
	var signedin = "0"; if ($("#modal_perseonform_signedin").is(':checked')) { signedin = "1"; }
	if (p["signedin"] != signedin) {
		t["params"]["signedin"] = signedin;	
	}
	
	t["params"]["customfields"] = {};
	for (var x in settings_get("customordering",[])) {
		var cfieldid = JSONDB.jsondb["settings"]["customordering"][x];
		var cfield = JSONDB.jsondb["settings"]["customfields"][cfieldid];
		var cvalue = $("#goform_"+cfieldid).val();
		t["params"]["customfields"][cfieldid] = cvalue;
	}
	
	t["params"]["groupselection"] = {};
	if (JSONDB.jsondb.hasOwnProperty("groupareas") && JSONDB.jsondb["groupareas"].hasOwnProperty("orderarray")) {
		for (id in JSONDB.jsondb["groupareas"]["orderarray"]) {
			var gaid = JSONDB.jsondb["groupareas"]["orderarray"][id];
			var ga = JSONDB.jsondb["groupareas"][gaid];
			var leaderval = false;
			if ($("#isleader_"+gaid).is(':checked')) {
				leaderval = true;
			}
			var selectedgroupid = $("#groupmembership_"+gaid).val();
			t["params"]["groupselection"][gaid] = {"groupid":selectedgroupid,"isleader":leaderval};
		}
	}

	if (settings_get("useshop") == "yes") {
		t["params"]["shopvouch"] = $("#modal_personform_field_shopamount").val();
	} else {
		t["params"]["shopvouch"] = "0";
	}
	//try { console.log("t ",t,JSON.stringify(t)); } catch (e2) {}
	JSONDB.dotransaction(t);
}

function people_view(id) {
	var persondata = JSONDB.jsondb["people"][id];
	$("#modal_person").modal({containerCss: {width:"95%",height:"90%"}});
	$("#modal_person_reportbutton").click(function() {
		//report_person(persondata["rowid"]);
	});
	$("#modal_person_removebutton").click(function() {
		closecheck("people_delete(\""+persondata["id"]+"\");");
	});

	$("#modal_person_field_firstname").text(persondata["firstname"]);
	$("#modal_person_field_lastname").text(persondata["lastname"]);
	$("#modal_person_field_homephone").text(persondata["homephone"]);
	$("#modal_person_field_mobilephone").text(persondata["mobilephone"]);
	$("#modal_person_field_email").text(persondata["email"]);
	$("#modal_person_field_parents_name").text(persondata["parents_name"]);
	$("#modal_person_field_parents_phone").text(persondata["parents_phone"]);
	$("#modal_person_field_emergencyinfo").text(persondata["emergencyinfo"]);
	$("#modal_person_field_carecard").text(persondata["carecard"]);
	$("#modal_person_field_birthdate").text(persondata["birthdate"]);
	$("#modal_person_field_age").text(getage(parsedate(persondata["birthdate"])));
	$("#modal_person_field_gender").text(persondata["gender"]);
	$("#modal_person_field_address_street").text(persondata["address_street"]);
	$("#modal_person_field_address_city").text(persondata["address_city"]);
	$("#modal_person_field_address_postal").text(persondata["address_postal"]);
	$("#modal_person_field_comments").html("<div>"+nl2br(safeforhtml(persondata["comments"]))+"</div>");
	showimage($("#modal_person_field_image"),persondata["picturefileid"],"small",false);

	$("#modal_person_field_affiliation").text(report_getaffiliationname(persondata["affiliation"]));
	
	if (settings_get("useshop") != "yes") {
		$("#modal_person_shoparea").css("display","none");
	} else {
		$("#modal_person_field_shopvouch").text(persondata["shopvouch"]);
	}
	
	$("#modal_person_customtable").empty();
	if (JSONDB.jsondb.hasOwnProperty("settings") && JSONDB.jsondb["settings"].hasOwnProperty("customordering")) {
		for (var i in JSONDB.jsondb["settings"]["customordering"]) {
			var cfield = JSONDB.jsondb["settings"]["customfields"][JSONDB.jsondb["settings"]["customordering"][i]];
			var thevalue = "";
			try {
				thevalue = persondata["customfields"][cfield["id"]];
			} catch (e) {}
			
			var row = $("<tr><td class='modal_person_customtable_fieldname fieldname'></td><td class='modal_person_customtable_value value'></td></tr>")
			row.children(".fieldname").text(cfield["fieldname"]+":");
			row.children(".value").text(thevalue)
			$("#modal_person_customtable").append(row);
		}
	}

	$("#modal_person_financetable").empty();
	$("#modal_person_grouptable").empty();
	var moneybalance = 0.00;
	
	for (i in JSONDB.jsondb["groupareas"]["orderarray"]) {
		var ga = JSONDB.jsondb["groupareas"][JSONDB.jsondb["groupareas"]["orderarray"][i]];
		var selectedgroup = "Nothing Chosen";
		var viewhtml = "";
		var leaderhtml = "";
		var thismodifier = 0.00;
		
		for (x in persondata["groupselection"]) {
			if (x == ga["id"]) {
				var gs = persondata["groupselection"][x];
				if (ga["groups"].hasOwnProperty(gs["groupid"])) {
					selectedgroup = ga["groups"][gs["groupid"]]["label"];
					thismodifier = ga["groups"][gs["groupid"]]["modifier"];
					if (gs["isleader"] == true) {
						leaderhtml = " (Leader)";
					}
					viewhtml = " <input type='button' value='View' onClick='closecheck(\"groups_view(\\\""+ga["id"]+"\\\",\\\""+gs["groupid"]+"\\\")\");'/>";
				}
				break;
			}
		}
		
		var row1 = $("<tr><td class='modal_person_grouptable_label label'></td><td class='modal_person_grouptable_group'><span class='grouplabel'></span><span class='viewhtml'></span></td></tr>")
		row1.children(".label").text(ga["label"]+":");
		row1.find(".grouplabel").text(selectedgroup+leaderhtml);
		row1.find(".viewhtml").html(viewhtml);
		$("#modal_person_grouptable").append(row1);
		
		var row2 = $("<tr><td class='modal_person_financetable_type'>Cost</td><td class='modal_person_financetable_label label'></td><td class='modal_person_financetable_modifier thecost'></td></tr>");
		row2.children(".label").text(ga["label"]+": "+selectedgroup);
		row2.children(".thecost").text(fd(thismodifier));
		$("#modal_person_financetable").append(row2);
		moneybalance = moneybalance + parsef(thismodifier);
	}
	
	if (settings_get("useshop") == "yes") {
		var row = $("<tr><td class='modal_person_financetable_type'>Cost</td><td class='modal_person_financetable_label'>Shop Vouch</td><td class='modal_person_financetable_modifier vouchvalue'></td></tr>")
		row.children(".vouchvalue").text(fd(persondata["shopvouch"]))
		$("#modal_person_financetable").append(row);
		moneybalance = moneybalance + parsef(persondata["shopvouch"]);
	}
	
	// Money in
	for (i in JSONDB.jsondb["moneyin"]) {
		for (x in JSONDB.jsondb["moneyin"][i]["allocation"]) {
			var desc = JSONDB.jsondb["moneyin"][i]["description"]
			var alloc = JSONDB.jsondb["moneyin"][i]["allocation"][x];
			if (alloc["type"] == "person" && alloc["refid"] == persondata["id"]) {
				var row = $("<tr><td class='modal_person_financetable_type'>In</td><td class='modal_person_financetable_label desc'></td><td class='modal_person_financetable_modifier amount'></td></tr>");
				row.children(".desc").text(desc);
				row.children(".amount").text(fd(parsef(alloc["amount"])));
				$("#modal_person_financetable").append(row);
				moneybalance = moneybalance - parsef(alloc["amount"]);
			}
		}
	}
	
	$("#modal_person_modbutton").click(function() {
		closecheck("people_mod(\""+persondata["id"]+"\");");
	});

	var sumrow = $("<tr><td colspan='2' class='modal_person_financetable_total'>Total Owing:</td><td class='modal_person_financetable_modifier balance'></td></tr>");
	sumrow.children(".balance").text(fd(moneybalance));
	$("#modal_person_financetable").append(sumrow);
}

function people_delete(id) {
	//var id = $(button).parents("tr").attr("personid");
	$("#modal_areyousure").modal();
	$("#confirm_submit").click(function() {
		var t = {"action":"removeperson","params":{"id":id}};
		JSONDB.dotransaction(t);
		people_load();
		$.modal.close();
	});
	return false;
}

function people_undelete(id) {
	//var id = $(button).parents("tr").attr("personid");
	$("#modal_areyousure").modal();
	$("#confirm_submit").click(function() {
		var t = {"action":"unremoveperson","params":{"id":id}};
		JSONDB.dotransaction(t);
		people_load();
		$.modal.close();
	});
	return false;
}

function groups_view(gaid,gid) {
	if (gid == "null") {
		gid = null;
	}
	//try { console.log("groups_view ",gaid,gid); } catch (e2) {}
	$("#modal_groupviewer").modal({containerCss: {width:"95%",height:"90%"}});
	$("#modal_groupview_datalist").empty();
	
	var ga = JSONDB.jsondb["groupareas"][gaid];

	var hasleaders = false;
	if (ga["hasleaders"] == "1") {
		hasleaders = true;
	}
	
	if (hasleaders) {
		$(".modal_groupview_datalist_view").before("<th class='modal_groupview_datalist modal_groupview_datalist_type'>Type</th>");
	}

	var glist = [];
	var groupselection = "<option value=''>Not Assigned</option>";
	if (ga.hasOwnProperty("groupordering")) {
		for (var x in ga["groupordering"]) {
			var temp_gid = ga["groupordering"][x]; 
			groupselection = groupselection + "<option value='"+temp_gid+"'>" + ga["groups"][temp_gid]["label"] + "</option>";
			if (hasleaders) {
				groupselection = groupselection + "<option value='l_"+temp_gid+"'>" + ga["groups"][temp_gid]["label"] + " (Leader)</option>";
			}
			glist.push(temp_gid);
		}
	}
	
	var viewcount = 0;
	for (personid in JSONDB.jsondb["people"]) {
		var isview = false;
		var p = JSONDB.jsondb["people"][personid]
		var isleader = false;
		if (gid != "" && gid != null && p.hasOwnProperty("groupselection") && p["groupselection"].hasOwnProperty(gaid) && p["groupselection"][gaid]["groupid"] == gid) {
			isview = true;
			if (p["groupselection"][gaid]["isleader"]) {
				isleader = true;
			}
		} else if (gid == null) {
			if (!p.hasOwnProperty("groupselection") || !p["groupselection"].hasOwnProperty(gaid) || p["groupselection"][gaid]["groupid"] == "" || p["groupselection"][gaid]["groupid"] == null) {
				isview = true;
			} else {
				if ($.inArray(p["groupselection"][gaid]["groupid"],glist) == -1) {
					isview = true;
					//try { console.log("notfound ",p["groupselection"][gaid]["groupid"],glist); } catch (e2) {}
				}
			}
		}
		
		if (isview) {
			var leaderdata = "";
			var groupsel = gid;
			if (hasleaders) {
				if (isleader) {
					leaderdata = "<td class='modal_groupview_datalist modal_groupview_datalist_type'>Leader</td>"
					groupsel = "l_"+gid;
				} else {
					leaderdata = "<td class='modal_groupview_datalist modal_groupview_datalist_type'>Member</td>"
				}
			}
			viewcount = viewcount + 1;
			$("#modal_groupview_datalist").append("<tr>\n\
				<td class='modal_groupview_datalist modal_groupview_datalist_check'><input class='modal_groupview_masscheck' personid='"+p["id"]+"' type='checkbox'/></td>\n\
				<td class='modal_groupview_datalist' id='modal_groupview_datalist_"+p["id"]+"_firstname'></td>\n\
				<td class='modal_groupview_datalist' id='modal_groupview_datalist_"+p["id"]+"_lastname'></td>\n\
				"+leaderdata+"\n\
				<td class='modal_groupview_datalist modal_groupview_datalist_view'><input type='button' value='View' onClick='closecheck(\"people_view(\\\""+p["id"]+"\\\")\")'/></td>\n\
				<td class='modal_groupview_datalist modal_groupview_datalist_reassign'><select id='modal_groupview_reassign_"+p["id"]+"'>"+groupselection+"</select><input type='button' value='Reassign' onClick='groups_quickreassign(\""+p["id"]+"\",\""+gid+"\",\""+gaid+"\");'/></td></tr>");
			$("#modal_groupview_datalist_"+p["id"]+"_firstname").text(p["firstname"]);
			$("#modal_groupview_datalist_"+p["id"]+"_lastname").text(p["lastname"]);
			$("#modal_groupview_reassign_"+p["id"]).val(groupsel);
		}
	}
	
	$("#modal_groupview_datalist_master").tablesorter({
		headers: {
			//3: { sorter: false}
		}
	});	
	if (viewcount > 0) {
		$("#modal_groupview_datalist_master").trigger("update",[[[2,0],[1,0]]]);
	}	
	
	$("#modal_groupview_datalist_footer").append("<tr><td colspan='5'><input type='button' value='All' onClick='groups_checkall();'/><input type='button' value='None' onClick='groups_uncheckall();'/><select id='modal_groupview_massreassign'>"+groupselection+"</select><input type='button' value='Mass Reassign' onClick='groups_massreassign(\""+gaid+"\",\""+gid+"\");'/></td></tr>");
	$("#modal_groupview_massreassign").val(gid);
	return false;
}

function groups_massreassign(originalgaid,originalgid) {
	var newid = $("#modal_groupview_massreassign").val();
	var t = {"action":"reassigngroups","params":{}};
	t["params"]["togaid"] = originalgaid;
	if (newid.substring(0,2) == "l_") {
		newid = newid.substring(2);
		t["params"]["isleader"] = true;
	} else {
		t["params"]["isleader"] = false;
	}
	t["params"]["people"] = [];

	$(".modal_groupview_masscheck").each(function(i,element) {
		if ($(this).is(':checked')) {
			var personid = $(this).attr("personid");
			t["params"]["people"].push(personid);
		}
	});
	t["params"]["togid"] = newid;
	JSONDB.dotransaction(t);
	groups_load(originalgaid);	
	closecheck("groups_view('"+originalgaid+"','"+originalgid+"');");
}

function groups_quickreassign(personid,originalgid,originalgaid) {
	var newid = $("#modal_groupview_reassign_"+personid).val();
	var t = {"action":"reassigngroups","params":{}};
	t["params"]["togaid"] = originalgaid;
	if (newid.substring(0,2) == "l_") {
		newid = newid.substring(2);
		t["params"]["isleader"] = true;
	} else {
		t["params"]["isleader"] = false;
	}
	t["params"]["togid"] = newid;
	t["params"]["people"] = [];
	t["params"]["people"].push(personid);
	JSONDB.dotransaction(t);
	groups_load(originalgaid);
	closecheck("groups_view('"+originalgaid+"','"+originalgid+"');");
}

function groups_checkall() {
	$(".modal_groupview_masscheck").each(function(i,element) {
		$(this).attr('checked',true);
	});
}

function groups_uncheckall() {
	$(".modal_groupview_masscheck").each(function(i,element) {
		$(this).attr('checked',false);
	});
}


function groups_load(openedid) {
	var openedindex = 0;
	var tofind = "";
	if (typeof openedid != 'undefined') {
		tofind = openedid;
		//try { console.log("group indexing chosen ",openedid); } catch (e) {}
	}

	//try { console.log("groups_load"); } catch (e) {}
	
	var gcounthash = {}
	var personcount = 0;
	
	if (JSONDB.jsondb.hasOwnProperty("groupareas") && JSONDB.jsondb["groupareas"].hasOwnProperty("orderarray")) {
		for (x in JSONDB.jsondb["groupareas"]["orderarray"]) {
			var gaid = JSONDB.jsondb["groupareas"]["orderarray"][x];
			var ga = JSONDB.jsondb["groupareas"][gaid];
			gcounthash[gaid] = {};
			if (ga.hasOwnProperty("groupordering")) {
				for (gindex in ga["groupordering"]) {
					var groupid = ga["groupordering"][gindex];
					gcounthash[gaid][groupid] = {};
					gcounthash[gaid][groupid]["member"] = 0;
					gcounthash[gaid][groupid]["leader"] = 0;
				}
			}
		}
	}
	
	for (personid in JSONDB.jsondb["people"]) {
		personcount = personcount + 1;
		var p = JSONDB.jsondb["people"][personid]
		if (p.hasOwnProperty("groupselection")) {
			for (gaid in p["groupselection"]) {
				var gid = p["groupselection"][gaid]["groupid"];
				var isleader = p["groupselection"][gaid]["isleader"];
				if (gid != "" && gid != null && JSONDB.jsondb["groupareas"].hasOwnProperty(gaid) && JSONDB.jsondb["groupareas"][gaid].hasOwnProperty("groups") && JSONDB.jsondb["groupareas"][gaid]["groups"].hasOwnProperty(gid)) {
					if (isleader) {
						gcounthash[gaid][gid]["leader"] = gcounthash[gaid][gid]["leader"] + 1;
					} else {
						gcounthash[gaid][gid]["member"] = gcounthash[gaid][gid]["member"] + 1;	
					}
				} else {
					//try { console.log("moo",gaid,gid); } catch (e) {}
				}
			}
		}
	}
	//try { console.log("ghash ",gcounthash); } catch (e) {}
	
	
	$("#accordian_grouparea").accordion("destroy");
	$("#accordian_grouparea").empty();
	if (JSONDB.jsondb.hasOwnProperty("groupareas") && JSONDB.jsondb["groupareas"].hasOwnProperty("orderarray")) {
		for (id in JSONDB.jsondb["groupareas"]["orderarray"]) {
			var gaid = JSONDB.jsondb["groupareas"]["orderarray"][id];
			var ga = JSONDB.jsondb["groupareas"][gaid];
			var hasleaders = false;
			if (ga["hasleaders"] == "1") {
				hasleaders = true;
			}
			//try { console.log("groups_load",gaid,ga); } catch (e) {}
			$("#accordian_grouparea").append("\
					<div class='grouparea' groupareaid='"+gaid+"'>\
						<h3><a href='#'>dynamiclabel</a></h3>\
						<div>\
							<a href='#' onClick='return groups_addgroup(\""+gaid+"\");'>Add Group</a> - <a href='#' onClick='return groups_modifygrouparea(\""+gaid+"\");'>Modify</a> - <a href='#' onClick='return groups_removegrouparea(\""+gaid+"\");'>Remove</a> - <span class='groups_unassignedcount'></span> <input type='button' value='View' onClick='return groups_view(\""+gaid+"\",null);'/> <input type='button' value='Distribute' onClick='return groups_distribute(\""+gaid+"\");'/><br/><span class=''></span>\
							<ul class='grouplist'></ul>\
						</div>\
					</div>");
			$("#accordian_grouparea > div:last > h3 > a").text(ga["label"]);
			var acount = 0;
			if (ga.hasOwnProperty("groupordering")) {
				for (gindex in ga["groupordering"]) {
					var groupid = ga["groupordering"][gindex];
					var group = ga["groups"][groupid];
					var countlabel = gcounthash[gaid][groupid]["leader"]+"L / "+gcounthash[gaid][groupid]["member"]+"m";
					var gtotal = gcounthash[gaid][groupid]["leader"] + gcounthash[gaid][groupid]["member"];
					acount = acount + gtotal;
					if (!hasleaders) {
						countlabel = gtotal+"m";
					}
					$("#accordian_grouparea > div:last ul.grouplist").append("<li class='groupitem' groupid='"+groupid+"'><span class='grouplabel'></span> - <a href='#' onClick='return groups_modifygroup(\""+gaid+"\",\""+groupid+"\");'>Modify</a> - <a href='#' onClick='return groups_removegroup(\""+gaid+"\",\""+groupid+"\");'>Remove</a> - <a href='#' onClick='return groups_view(\""+gaid+"\",\""+groupid+"\");'>View</a> - <a href='#' onClick='return shop_input(\""+gaid+"\",\""+groupid+"\");'>Shop Input</a> - <a href='#' onClick='return shop_sheet(\""+gaid+"\",\""+groupid+"\");'>Shop Sheet</a> - <a href='#' onClick='return report_fulldata(\""+gaid+"\",\""+groupid+"\",false);'>Full Data Report</a></li>");
					$("#accordian_grouparea > div:last ul.grouplist > li:last > span.grouplabel").text(group["label"]+" ("+countlabel+")");
				}
			}
			var unassignedcount = personcount - acount;
			$("#accordian_grouparea > div:last .groups_unassignedcount").text(unassignedcount+" unassigned");
			if (tofind == gaid) {
				openedindex = parseInt(id);
			}
			$("#accordian_grouparea > div:last ul.grouplist").sortable({
				update: function(event, ui) {
					var groupid = $(ui.item).attr("groupid");
					var groupareaid = $(ui.item).parents("div.grouparea").attr("groupareaid");
					var newindex = $(ui.item).index();
					//try { console.log("group moved",groupid,groupareaid); } catch (e) {}
					var t = {"action":"movegroup","params":{"id":groupid,"groupareaid":groupareaid,"newindex":newindex}};
					JSONDB.dotransaction(t);
				}
			});
		}
	}
	//try { console.log("indexing ",openedindex,tofind,typeof openedindex); } catch (e) {}

	
	$("#accordian_grouparea").accordion({
		header: "> div > h3",
		active: openedindex,
		autoHeight: false,
		collapsible: true
	}).sortable({
		axis: "y",
		handle: "h3",
		stop: function( event, ui ) {
			ui.item.children( "h3" ).triggerHandler( "focusout" );
		},
		update: function(event, ui) {
			// groupareaid moved $(ui.item).attr("groupid")
			// new position $(ui.item).index()
			//try { console.log("You just moved ",ui,$(ui.item).index()); } catch (e2) {}
			var t = {"action":"movegrouparea","params":{"id":$(ui.item).attr("groupareaid"),"newindex":$(ui.item).index()}};
			JSONDB.dotransaction(t);
			settings_publish()
		}
	});
}

function groups_distribute(groupareaid) {
	$("#modal_groupdistributer").modal();
	for (i in JSONDB.jsondb["groupareas"]["orderarray"]) {
		var gaid = JSONDB.jsondb["groupareas"]["orderarray"][i];
		var ga = JSONDB.jsondb["groupareas"][gaid];
		
		for (x in ga["groupordering"]) {
			var gid = ga["groupordering"][x];
			var g = ga["groups"][gid];
			
			//$("#modal_groupdistributer_filter").append("<option value='"+gid+"'>"+ga["label"]+": "+g["label"]+"</option>");
			$("#modal_groupdistributer_filter").append($("<option></option>").attr("value",gaid+":"+gid).text(ga["label"]+": "+g["label"]));
		}
	}
	$("input:radio[name='modal_groupdistributer_sortmethod']").filter("[value='genderage']").attr('checked', true);
	
	for (i in JSONDB.jsondb["groupareas"][groupareaid]["groupordering"]) {
		var gid = JSONDB.jsondb["groupareas"][groupareaid]["groupordering"][i];
		var g = JSONDB.jsondb["groupareas"][groupareaid]["groups"][gid];
		$("#model_groupdistributer_target").append("<input type='checkbox' id='modal_distributer_target_"+gid+"' checked value='"+gid+"'/> "+g["label"]+"<br/>");
	}
	
	$("#modal_groupdistribute_confirm").click(function() {
		var filter = $("#modal_groupdistributer_filter").val();
		var filter_gaid = "";
		var filter_gid = "";
		if (filter != "") {
			var t = filter.split(":")
			filter_gaid = t[0];
			filter_gid = t[1];
			//try { console.log("df ",t,filter_gaid,filter_gid); } catch (e2) {}
		}
		var mode = $("input:radio[name=modal_groupdistributer_sortmethod]:checked").val();
		
		var todistribute = [];
		for (personid in JSONDB.jsondb["people"]) {
			var p = JSONDB.jsondb["people"][personid]
			if (filter == "" || (p["groupselection"].hasOwnProperty(filter_gaid) && p["groupselection"][filter_gaid]["groupid"] == filter_gid)) {
				if (!p.hasOwnProperty("groupselection") || !p["groupselection"].hasOwnProperty(groupareaid) || p["groupselection"][groupareaid]["groupid"] == "" || p["groupselection"][groupareaid]["groupid"] == null) {
					//isview = true;
					todistribute.push(p["id"]);
				} else {
					if (!JSONDB.jsondb["groupareas"][groupareaid]["groups"].hasOwnProperty(p["groupselection"][groupareaid]["groupid"])) {
						//isview = true;
						todistribute.push(p["id"]);
					}
				}
			}
		}
		//try { console.log("dlist ",todistribute); } catch (e2) {}
		
		function distsort(a, b) {
			// gender then age.
			var a_gender = JSONDB.jsondb["people"][a]["gender"]
			var b_gender = JSONDB.jsondb["people"][b]["gender"]
			var a_age = getage(parsedate(JSONDB.jsondb["people"][a]["birthdate"]));
			var b_age = getage(parsedate(JSONDB.jsondb["people"][b]["birthdate"]));
			if (a_age == "Unknown") { a_age = 0; }
			if (b_age == "Unknown") { b_age = 0; }
			//try { console.log("s ",a,b,a_gender,b_gender,a_age,b_age); } catch (e2) {}
			
			if (a_gender.toUpperCase() < b_gender.toUpperCase()) {
				return -1;
			} else if (a_gender.toUpperCase() == b_gender.toUpperCase()) {
				if (a_age < b_age) {
					return -1;
				} else if (a_age == b_age) {
					return 0;	
				} else {
					return 1;
				}
			} else {
				return 1;
			}
		}
		if (mode == "genderage") {
			todistribute.sort(distsort);
		}
		
		var targetlist = [];
		for (i in JSONDB.jsondb["groupareas"][groupareaid]["groupordering"]) {
			var gid = JSONDB.jsondb["groupareas"][groupareaid]["groupordering"][i];
			if ($("#modal_distributer_target_"+gid).is(':checked')) { targetlist.push(gid); }
		}
		//try { console.log("targetlist ",targetlist); } catch (e2) {}
		
		//var targetlist = JSONDB.jsondb["groupareas"][groupareaid]["groupordering"];
		var numgroups = targetlist.length;
		var t = {"action":"reassignmultigroup","params":{"togaid":groupareaid,"assignments":[]}};
		for (i in todistribute) {
			var personid = todistribute[i];
			var gindex = i % numgroups;
			var togid = targetlist[gindex];
			//try { console.log("index ",gindex,togid); } catch (e2) {}
			t["params"]["assignments"].push({"personid":personid,"togid":togid})
		}
		
		//try { console.log("dlist t ",t); } catch (e2) {}
		JSONDB.dotransaction(t);
		groups_load(groupareaid);
		$.modal.close();
	});
}

function groups_addgrouparea() {
	$("#modal_grouparea").modal();
	$("#modal_grouparea_save").click(function() {
		var rid = JSONDB.generateid();
		var hasleaders = "0"; if ($("#modal_grouparea_leaders").is(':checked')) { hasleaders = "1"; }
		//var definesreg = "0"; if ($("#modal_grouparea_regarea").is(':checked')) { definesreg = "1"; }
		var isregchoice = "0"; if ($("#modal_grouparea_publicchoice").is(':checked')) { isregchoice = "1"; }
		var ismanditory = "0"; if ($("#modal_grouparea_choicemanditory").is(':checked')) { ismanditory = "1"; }
		var haspoints = "0"; if ($("#modal_grouparea_haspoints").is(':checked')) { haspoints = "1"; }
		//var data = {"label":$("#modal_grouparea_labelinput").val(),"rowid":rid,"hasleaders":hasleaders,"definesreg":definesreg,"isregchoice":isregchoice,"ismanditory":ismanditory,"trackspoints":trackspoints}
		//var data = {"label":$("#modal_grouparea_labelinput").val(),"publicdescription":$("#modal_grouparea_publicdescription").val(),"rowid":rid,"hasleaders":hasleaders,"isregchoice":isregchoice,"ismanditory":ismanditory,"ordering":grouparea_nextordering(),"haspoints":haspoints}
		//MRDB.db_addrow("groupareas",data);
		//"ordering":grouparea_nextordering(),
		var t = {"action":"addgrouparea","params":{"label":$("#modal_grouparea_labelinput").val(),"publicdescription":$("#modal_grouparea_publicdescription").val(),"id":rid,"hasleaders":hasleaders,"isregchoice":isregchoice,"ismanditory":ismanditory,"haspoints":haspoints}};
		JSONDB.dotransaction(t);
		groups_load(rid);
		settings_publish()
		$.modal.close();
	});
}

function groups_removegrouparea(id) {
	$("#modal_areyousure").modal();
	$("#confirm_submit").click(function() {
		var t = {"action":"removegrouparea","params":{"id":id}};
		JSONDB.dotransaction(t);
		groups_load();
		settings_publish()
		$.modal.close();
	});
	return false;
}

function groups_modifygrouparea(id) {
	$("#modal_grouparea").modal();
	var grouparea = JSONDB.jsondb["groupareas"][id];
	$("#modal_grouparea_labelinput").val(grouparea["label"]);
	$("#modal_grouparea_publicdescription").val(grouparea["publicdescription"]);
	if (grouparea["hasleaders"] == "1") {
		$('#modal_grouparea_leaders').attr('checked',true);
	}
	if (grouparea["isregchoice"] == "1") {
		$('#modal_grouparea_publicchoice').attr('checked',true);
	}
	if (grouparea["ismanditory"] == "1") {
		$('#modal_grouparea_choicemanditory').attr('checked',true);
	}
	if (grouparea["haspoints"] == "1") {
		$('#modal_grouparea_haspoints').attr('checked',true);
	}
	
	$("#modal_grouparea_save").click(function() {
		var t = {"action":"modifygrouparea","params":{"id":id}};
		if ($("#modal_grouparea_labelinput").val() != grouparea["label"]) {
			t["params"]["label"] = $("#modal_grouparea_labelinput").val();
		}
		
		if ($("#modal_grouparea_publicdescription").val() != grouparea["publicdescription"]) {
			t["params"]["publicdescription"] = $("#modal_grouparea_publicdescription").val();
		}
		
		var hasleaders = "0"; if ($("#modal_grouparea_leaders").is(':checked')) { hasleaders = "1"; }
		if (hasleaders != grouparea["hasleaders"]) {
			t["params"]["hasleaders"] = hasleaders;
		}

		var isregchoice = "0"; if ($("#modal_grouparea_publicchoice").is(':checked')) { isregchoice = "1"; }
		if (isregchoice != grouparea["isregchoice"]) {
			t["params"]["isregchoice"] = isregchoice;
		}

		var ismanditory = "0"; if ($("#modal_grouparea_choicemanditory").is(':checked')) { ismanditory = "1"; }
		if (ismanditory != grouparea["ismanditory"]) {
			t["params"]["ismanditory"] = ismanditory;
		}

		var haspoints = "0"; if ($("#modal_grouparea_haspoints").is(':checked')) { haspoints = "1"; }
		if (haspoints != grouparea["haspoints"]) {
			t["params"]["haspoints"] = haspoints;
		}
		
		JSONDB.dotransaction(t);
		groups_load(id);
		settings_publish()
		$.modal.close();
	});
	return false;
}

function groups_addgroup(groupareaid) {
	$("#modal_group").modal();
	$("#modal_group_save").click(function () {
		var groupid = JSONDB.generateid();
		var t = {"action":"addgroup","params":{"label":$("#modal_group_labelinput").val(),"id":groupid,"groupareaid":groupareaid,"modifier":$("#modal_group_modifier").val()}};
		var hidereg = "0"; if ($("#modal_group_hidereg").is(':checked')) { hidereg = "1"; }
		t["params"]["hidereg"] = hidereg;
		JSONDB.dotransaction(t);
		groups_load(groupareaid);
		settings_publish()
		$.modal.close();
	});
	return false;
}

function groups_removegroup(groupareaid,groupid) {
	$("#modal_areyousure").modal();
	$("#confirm_submit").click(function() {
		var t = {"action":"removegroup","params":{"id":groupid,"groupareaid":groupareaid}};
		JSONDB.dotransaction(t);
		groups_load(groupareaid);
		settings_publish()
		$.modal.close();
	});
	return false;
}

function groups_modifygroup(groupareaid,groupid) {
	$("#modal_group").modal();
	var grouparea = JSONDB.jsondb["groupareas"][groupareaid];
	var group = grouparea["groups"][groupid];
	$("#modal_group").modal();
	$("#modal_group_labelinput").val(group["label"]);
	$("#modal_group_modifier").val(group["modifier"]);
	if (group["hidereg"] == "1") {
		$('#modal_group_hidereg').attr('checked',true);
	}
	$("#modal_group_save").click(function() {
		var t = {"action":"modifygroup","params":{"id":groupid,"groupareaid":groupareaid}};
		var hidereg = "0"; if ($("#modal_group_hidereg").is(':checked')) { hidereg = "1"; }
		if (hidereg != group["hidereg"]) {
			t["params"]["hidereg"] = hidereg;
		}
		if ($("#modal_group_labelinput").val() != group["label"]) {
			t["params"]["label"] = $("#modal_group_labelinput").val();
		}
		if ($("#modal_group_modifier").val() != group["modifier"]) {
			t["params"]["modifier"] = $("#modal_group_modifier").val()
		}
		JSONDB.dotransaction(t);
		groups_load(groupareaid);
		settings_publish()
		$.modal.close();
	});
	return false;
}




function affiliationgroup_modify(aid) {
	$("#modal_affiliationgroup").modal();
	var a = JSONDB.jsondb["affiliation"][aid];
	$("#modal_affiliationgroup_groupname").val(a["groupname"]);
	$("#modal_affiliationgroup_confirm_submit").click(function() {
		if (a["groupname"] != $("#modal_affiliationgroup_groupname").val() && $("#modal_affiliationgroup_groupname").val() != "") {
			//MRDB.db_changedata("affiliationgroups",rowid,"groupname",$("#modal_affiliationgroup_groupname").val());
			var t = {"action":"modifyaffiliation","params":{"groupname":$("#modal_affiliationgroup_groupname").val(),"id":aid}};
			JSONDB.dotransaction(t);
			affiliationgroup_load();
			settings_publish()
		}
		$.modal.close();
	});
}

function affiliationgroup_delete(aid) {
	$("#modal_areyousure").modal();
	$("#confirm_submit").click(function() {
		var t = {"action":"removeaffiliation","params":{"id":aid}};
		JSONDB.dotransaction(t);
		affiliationgroup_load();
		settings_publish()
		$.modal.close();
	});
}

function affiliationgroup_add() {
	$("#modal_affiliationgroup").modal();
	$("#modal_affiliationgroup_confirm_submit").click(function() {
		var rid = JSONDB.generateid();
//		var data = {"rowid":rid,"groupname":$("#modal_affiliationgroup_groupname").val()}
		if ($("#modal_affiliationgroup_groupname").val() != "") {
			var t = {"action":"addaffiliation","params":{"groupname":$("#modal_affiliationgroup_groupname").val(),"id":rid}};
			JSONDB.dotransaction(t);
			affiliationgroup_load();
		}
		settings_publish()
		$.modal.close();
	});
}

affiliation_sortset = false;
function affiliationgroup_load() {
	try { console.log("affiliationgroup_load"); } catch (e) {}
	$("#affiliation_datalist").empty();
	
	var phash = {};
	for (i in JSONDB.jsondb["moneyin"]) {
		var m = JSONDB.jsondb["moneyin"][i];
		for (x in m["allocation"]) {
			var aitem = m["allocation"][x];
			if (aitem["type"] == "person") {
				if (!phash.hasOwnProperty(aitem["refid"])) {
					phash[aitem["refid"]] = 0;
				}
				phash[aitem["refid"]] = phash[aitem["refid"]] + parsef(aitem["amount"]);
			}
		}
	}
	
	var vhash = {};
	var ahash = {};
	var acounthash = {};
	for (i in JSONDB.jsondb["moneyin"]) {
		var m = JSONDB.jsondb["moneyin"][i];
		for (x in m["allocation"]) {
			var aitem = m["allocation"][x];
			if (aitem["type"] == "voucher") {
				if (!vhash.hasOwnProperty(aitem["refid"])) {
					vhash[aitem["refid"]] = 0;
				}
				vhash[aitem["refid"]] = vhash[aitem["refid"]] + parsef(aitem["amount"]);
			}
		}
	}
	
	var vcount = 0;
	for (i in JSONDB.jsondb["moneyin"]) {
		var m = JSONDB.jsondb["moneyin"][i];
		if (m["isvoucher"] == "1") {
			var a = JSONDB.jsondb["affiliation"][m["voucheraffiliation"]];
			var vbalance = parsef(m["total"]) - parsef(vhash[m["id"]]);
			if (!ahash.hasOwnProperty(m["voucheraffiliation"])) {
				ahash[m["voucheraffiliation"]] = 0;
				acounthash[m["voucheraffiliation"]] = 0;
			}
			ahash[m["voucheraffiliation"]] = ahash[m["voucheraffiliation"]] + vbalance;
			if (vbalance > 0.00) {
				acounthash[m["voucheraffiliation"]] = acounthash[m["voucheraffiliation"]] + 1; 
			}
			vcount = vcount + 1;
		}
	}	
	
	var counthash = {};
	counthash["other"] = {"count":0,"balance":0.00,"unpaidpersoncount":0,"voucherbalance":0.00,"unpaidvouchercount":0};
	if (JSONDB.jsondb.hasOwnProperty("affiliation")) {
		for (personid in JSONDB.jsondb["people"]) {
			var p = JSONDB.jsondb["people"][personid];
			
			var thiscost = 0;
			for (x in p["groupselection"]) {
				thiscost = thiscost + report_getgroupcost(x,p["groupselection"][x]["groupid"]);
			}
			try {
				thiscost = thiscost + parsef(p["shopvouch"]);
			} catch (e) {}
			
			var thispaid = parsef(phash[p["id"]]);
			var balance = thiscost - thispaid;
			
			
			if (p.hasOwnProperty("affiliation")) {
				if (JSONDB.jsondb["affiliation"].hasOwnProperty(p["affiliation"])) {
					if (!counthash.hasOwnProperty(p["affiliation"])) {
						counthash[p["affiliation"]] = {"count":0,"balance":0.00,"unpaidpersoncount":0,"voucherbalance":0.00,"unpaidvouchercount":0};
					}
					counthash[p["affiliation"]]["count"] = counthash[p["affiliation"]]["count"] + 1;
					counthash[p["affiliation"]]["balance"] = counthash[p["affiliation"]]["balance"] + balance;
					if (balance > 0) {
						counthash[p["affiliation"]]["unpaidpersoncount"] = counthash[p["affiliation"]]["unpaidpersoncount"] + 1;
					}
				} else {
					if (!counthash.hasOwnProperty("other")) {
						counthash["other"] = {"count":0,"balance":0.00,"unpaidpersoncount":0,"voucherbalance":0.00,"unpaidvouchercount":0};
					}
					counthash["other"]["count"] = counthash["other"]["count"] + 1;
					counthash["other"]["balance"] = counthash["other"]["balance"] + balance;
					if (balance > 0) {
						counthash["other"]["unpaidpersoncount"] = counthash["other"]["unpaidpersoncount"] + 1;
					}
				}
			} else {
				if (!counthash.hasOwnProperty("other")) {
					counthash["other"] = {"count":0,"balance":0.00,"unpaidpersoncount":0,"voucherbalance":0.00,"unpaidvouchercount":0};
				}
				counthash["other"]["count"] = counthash["other"]["count"] + 1;
				counthash["other"]["balance"] = counthash["other"]["balance"] + balance;
				if (balance > 0) {
					counthash["other"]["unpaidpersoncount"] = counthash["other"]["unpaidpersoncount"] + 1;
				}
			}
		}
	}
	try { console.log("counthash",counthash); } catch (e) {}
	
	for (id in JSONDB.jsondb["affiliation"]) {
		$("#affiliation_datalist").append("<tr class='affiliation_datalist' id='affiliationrow_"+id+"'>\n\
			<td class='affiliation_datalist' id='affiliation_row_"+id+"_label'></td>\n\
			<td class='affiliation_datalist' id='affiliation_row_"+id+"_count'></td>\n\
			<td class='affiliation_datalist' id='affiliation_row_"+id+"_unpaidpeople'></td>\n\
			<td class='affiliation_datalist' id='affiliation_row_"+id+"_unpaidpeopleamount'></td>\n\
			<td class='affiliation_datalist' id='affiliation_row_"+id+"_unpaidvouchers'></td>\n\
			<td class='affiliation_datalist' id='affiliation_row_"+id+"_unpaidvoucheramount'></td>\n\
			<td class='affiliation_datalist' id='affiliation_row_"+id+"_totalowing'></td>\n\
			<td class='affiliation_datalist centerit'><input type='button' value='View' onClick='affiliationgroup_view(\""+id+"\");'/></td>\n\
			<td class='affiliation_datalist centerit'><input type='button' value='Mod' onClick='affiliationgroup_modify(\""+id+"\");'/></td>\n\
			<td class='affiliation_datalist centerit'><input type='button' value='Delete' onClick='affiliationgroup_delete(\""+id+"\");'/></td>\n\
		</tr>");
		$("#affiliation_row_"+id+"_label").text(JSONDB.jsondb["affiliation"][id]["groupname"]);
		
		var thecount = 0;
		var thebalance = 0;
		var unpaidpeoplecount = 0;
		if (counthash.hasOwnProperty(id)) {
			thecount = counthash[id]["count"];
			thebalance = counthash[id]["balance"];
			unpaidpeoplecount = counthash[id]["unpaidpersoncount"];
		}
		$("#affiliation_row_"+id+"_count").text(thecount);
		$("#affiliation_row_"+id+"_unpaidpeopleamount").text(fd(thebalance));
		$("#affiliation_row_"+id+"_unpaidpeople").text(parsef(unpaidpeoplecount));
		$("#affiliation_row_"+id+"_unpaidvoucheramount").text(fd(parsef(ahash[id])));
		$("#affiliation_row_"+id+"_unpaidvouchers").text(parsef(acounthash[id]));
		$("#affiliation_row_"+id+"_totalowing").text(fd(parsef(thebalance) + parsef(ahash[id])));
	}
	
	$("#affiliationgroup_viewunaffiliatedbutton").attr("value"," View Unaffiliated ("+counthash["other"]["count"]+" People) ");
	
	if (!jQuery.isEmptyObject(JSONDB.jsondb["affiliation"]) && !affiliation_sortset) {
		$("#affiliation_datalist_master").trigger("update",[[[0,0]]]);
		affiliation_sortset = true;
		//try { console.log("sort update 1"); } catch (e) {}
	} else if (!jQuery.isEmptyObject(JSONDB.jsondb["affiliation"])) {
		$("#affiliation_datalist_master").trigger("update");
		//try { console.log("sort update 2"); } catch (e) {}
	}
}

function affiliationgroup_view(aid) {
	$("#modal_affiliationgroupviewer").modal({containerCss: {width:"95%",height:"90%"}});
	$("#modal_affiliationgroupviewer_datalist").empty();
	var viewcount = 0;
	for (personid in JSONDB.jsondb["people"]) {
		var toview = false;
		var p = JSONDB.jsondb["people"][personid];
		if (p.hasOwnProperty("affiliation")) {
			if (p["affiliation"] == aid) {
				toview = true;
			} else if (!JSONDB.jsondb["affiliation"].hasOwnProperty(p["affiliation"]) && aid == null) {
				toview = true;
			}
		} else if (aid == null) {
			toview = true;
		}
		
		if (toview) {
			viewcount = viewcount + 1;
			$("#modal_affiliationgroupviewer_datalist").append("<tr id='affiliationviewerrow_"+p["id"]+"'>\n\
				<td class='modal_affiliationgroupviewer_datalist' id='affiliationviewerrow_"+p["id"]+"_firstname'></td>\n\
				<td class='modal_affiliationgroupviewer_datalist' id='affiliationviewerrow_"+p["id"]+"_lastname'></td>\n\
				<td class='modal_affiliationgroupviewer_datalist' id='affiliationviewerrow_"+p["id"]+"_gender'></td>\n\
				<td class='modal_affiliationgroupviewer_datalist' id='affiliationviewerrow_"+p["id"]+"_age'></td>\n\
				<td class='modal_affiliationgroupviewer_datalist'><input type='button' value='View' onClick='closecheck(\"people_view(\\\""+p["id"]+"\\\")\")''/></td>\n\
			</tr>");
			$("#affiliationviewerrow_"+p["id"]+"_firstname").text(p["firstname"]);
			$("#affiliationviewerrow_"+p["id"]+"_lastname").text(p["lastname"]);
			$("#affiliationviewerrow_"+p["id"]+"_gender").text(p["gender"]);
			$("#affiliationviewerrow_"+p["id"]+"_age").text(getage(parsedate(p["birthdate"])));
		}
	}
	$("#modal_affiliationgroupviewer_datalist_master").tablesorter({
		headers: {
			4: { sorter: false}
		}
	});	
	if (viewcount > 0) {
		$("#modal_affiliationgroupviewer_datalist_master").trigger("update",[[[1,0],[0,0]]]);
	}	
}

function processbirthdate(datestring) {
	
}



function settings_get(setting,defaultsetting) {
	if (!JSONDB.jsondb.hasOwnProperty("settings")) {
		return defaultsetting;
	} else if (JSONDB.jsondb["settings"].hasOwnProperty(setting)) {
		return JSONDB.jsondb["settings"][setting];
	} else {
		return defaultsetting;
	}
}

var settings_quicklist = [
	"firstname",
	"lastname",
	"homephone",
	"mobilephone",
	"email",
	"parents_name",
	"parents_phone",
	"emergencyinfo",
	"carecard",
	"birthdate",
	"gender",
	"address_street",
	"address_city",
	"address_prov",
	"address_country",
	"address_postal",
	"affiliation"
 ];

var customfields_sortset = false;
function settings_load() {
	try { console.log("settings_load"); } catch (e) {}
	$("#public_customfields").sortable("destroy");
	//$("#public_statustoggle").unbind();
	//JSONDB.jsondb["settings"]["publicstatus"]
	
	if (settings_get("isonline","false") == "true") {
		$("#settings_onlinestatus").html("This event is currently ONLINE. <input type='button' value='Go Offline' onClick='settings_gooffline();'/>");
		/*$("#public_statusfield").text("Registration is currently ONLINE");
		$("#public_statustoggle").val("Take Offline");
		$("#public_statustoggle").click(function () {
			//setsetting("publicstatus","disabled");
		});*/
	} else {
		$("#settings_onlinestatus").html("This event is currently OFFLINE. <input type='button' value='Go Online' onClick='settings_goonline();'/>");
		/*
		$("#public_statusfield").text("Registration is currently OFFLINE");
		$("#public_statustoggle").val("Take Online");
		$("#public_statustoggle").click(function () {
			//setsetting("publicstatus","enabled");
		});*/
	}
	$("#public_description").val(settings_get("publicdescription",""));
	$("#public_url").val(settings_get("publicurl",""));
	$("#public_headerinstructions").val(settings_get("publicheaderinstructions",""));
	$("#public_footerinstructions").val(settings_get("publicfooterinstructions",""));
	$("#public_regsuccess").val(settings_get("publicsuccessmessage",""));
	$("#public_emailsuccess").val(settings_get("publicemailmessage",""));
	$("#public_notifyemail").val(settings_get("emailnotificationaddress",""));
	if (settings_get("useshop") == "yes") { $("#public_useshop").attr('checked',true); } else { $("#public_useshop").attr('checked',false); }

	for (i in settings_quicklist) {
		var l = settings_quicklist[i];
		settings_get("public_fieldmanditory_"+l,"") == "yes" ? $("#public_fieldmanditory_"+l).attr('checked',true) : $("#public_fieldmanditory_"+l).attr('checked',false);
	}
	
	$("#public_customfields").empty();
	for (var x in settings_get("customordering",[])) {
		var cfieldid = JSONDB.jsondb["settings"]["customordering"][x];
		var cfield = JSONDB.jsondb["settings"]["customfields"][cfieldid];
		$("#public_customfields").append("<tr customfieldid='"+cfieldid+"'>\
			<td class='public_customfields customfield_fieldname'></td>\
			<td class='public_customfields centerit customfield_fieldtype'></td>\
			<td class='public_customfields centerit customfield_isonreg'></td>\
			<td class='public_customfields centerit'><input type='button' value='Modify' onClick='settings_customfield_modify(\""+cfieldid+"\");'/></td>\
			<td class='public_customfields centerit'><input type='button' value='Remove' onClick='settings_customfield_remove(\""+cfieldid+"\");'/></td>\
		</tr>");
		$("#public_customfields > tr:last > td.customfield_fieldname").text(cfield["fieldname"]);
		$("#public_customfields > tr:last > td.customfield_fieldtype").text(cfield["fieldtype"]);
		var regenum = Array();
		regenum["0"] = "No";
		regenum["1"] = "Yes";
		$("#public_customfields > tr:last > td.customfield_isonreg").text(regenum[cfield["isonreg"]]);
	}
	
	
	$("#public_customfields").sortable({
		update: function(event, ui) {
			var fieldid = $(ui.item).attr("customfieldid");
			var newindex = $(ui.item).index();
			//try { console.log("group moved",groupid,groupareaid); } catch (e) {}
			var t = {"action":"movecustomfield","params":{"id":fieldid,"newindex":newindex}};
			JSONDB.dotransaction(t);
			settings_publish()
		}
	});
}

function settings_save() {
	var t = {"action":"savesettings","params":{}};
	t["params"]["publicdescription"] = $("#public_description").val();
	t["params"]["publicurl"] = $("#public_url").val();
	t["params"]["publicheaderinstructions"] = $("#public_headerinstructions").val();
	t["params"]["publicfooterinstructions"] = $("#public_footerinstructions").val();
	t["params"]["publicsuccessmessage"] = $("#public_regsuccess").val();
	var useshop = "no"; if ($("#public_useshop").is(':checked')) { useshop = "yes"; }
	t["params"]["useshop"] = useshop;
	t["params"]["publicemailmessage"] = $("#public_emailsuccess").val();
	t["params"]["emailnotificationaddress"] = $("#public_notifyemail").val();
	
	for (var p in settings_quicklist) {
		var fieldval = "no";
		if ($("#public_fieldmanditory_"+settings_quicklist[p]).is(':checked')) {
			fieldval = "yes";
		}
		t["params"]["public_fieldmanditory_"+settings_quicklist[p]] = fieldval;
	}
	JSONDB.dotransaction(t);
	settings_publish()
	alert("Settings saved...");
}

function settings_customfield_add() {
	$("#modal_customfield").modal();
	$("#modal_customfield_fieldtype").change(function() {
		if ($("#modal_customfield_fieldtype").val() == "list") {
			$("#modal_customfield_listfields").css("display","");
		} else {
			$("#modal_customfield_listfields").css("display","none");
		}
	});
	$("#modal_customfield_listfields_add").click(function() {
		var row = $("<tr><td class='listfield_val theval'></td><td><input type='button' value='Rem' class='modal_customfield_delbutton'/></td></tr>");
		row.children(".theval").text($("#modal_customfield_listfields_text").val());
		$("#modal_customfield_listfields_table").append(row);
		$("#modal_customfield_listfields_text").val("");
		$(".modal_customfield_delbutton").unbind("click");
		$(".modal_customfield_delbutton").click(function() {
			$(this).parents("tr").remove();
		});
	})
	$("#modal_customfield_confirm_submit").click(function() {
		var rid = JSONDB.generateid();
		var ispub = "0"; if ($("#modal_customfield_isreg").is(':checked')) { ispub = "1"; }
		var isman = "0"; if ($("#modal_customfield_ismanditory").is(':checked')) { isman = "1"; }
		var t = {"action":"addcustomfield","params":{"id":rid,"fieldname":$("#modal_customfield_label").val(),"fieldtype":$("#modal_customfield_fieldtype").val(),"isonreg":ispub,"ismanditory":isman,"publicinstructions":$("#modal_customfield_instructions").val()}};

		if ($("#modal_customfield_fieldtype").val() == "list") {
			var fielddata = []
			$("#modal_customfield_listfields_table tr").each(function() {
				fielddata.push($(this).children(".listfield_val").text());
			});
			t["params"]["fielddata"] = fielddata;
		}
		JSONDB.dotransaction(t);
		settings_load();
		settings_publish()
		$.modal.close();
	});
}

function settings_customfield_modify(fieldid) {
	$("#modal_customfield").modal();
	$("#modal_customfield_fieldtype").change(function() {
		if ($("#modal_customfield_fieldtype").val() == "list") {
			$("#modal_customfield_listfields").css("display","");
		} else {
			$("#modal_customfield_listfields").css("display","none");
		}
	});
	$("#modal_customfield_listfields_add").click(function() {
//		$("#modal_customfield_listfields_table").append("<tr><td class='listfield_val'>"+$("#modal_customfield_listfields_text").val()+"</td><td><input type='button' value='Rem' class='modal_customfield_delbutton'/></td></tr>");
		var row = $("<tr><td class='listfield_val theval'></td><td><input type='button' value='Rem' class='modal_customfield_delbutton'/></td></tr>");
		row.children(".theval").text($("#modal_customfield_listfields_text").val());
		$("#modal_customfield_listfields_table").append(row);

		$("#modal_customfield_listfields_text").val("");
		$(".modal_customfield_delbutton").unbind("click");
		$(".modal_customfield_delbutton").click(function() {
			$(this).parents("tr").remove();
		});
		settings_publish()
	})
	
	var cfield = JSONDB.jsondb["settings"]["customfields"][fieldid];
	$("#modal_customfield_label").val(cfield["fieldname"]);
	$("#modal_customfield_fieldtype").val(cfield["fieldtype"]);
	if (cfield["fieldtype"] == "list") {
		$("#modal_customfield_listfields").css("display","");
		for (var z in cfield["fielddata"]) {
			if (cfield["fielddata"][z] != "") {
				var row = $("<tr><td class='listfield_val theval'></td><td><input type='button' value='Rem' class='modal_customfield_delbutton'/></td></tr>");
				row.children(".theval").text(cfield["fielddata"][z]);
				//$("#modal_customfield_listfields_table").append("<tr><td class='listfield_val'>"+cfield["fielddata"][z]+"</td><td><input type='button' value='Rem' class='modal_customfield_delbutton'/></td></tr>");
				$("#modal_customfield_listfields_table").append(row);
			}
		}
		$(".modal_customfield_delbutton").click(function() {
			$(this).parents("tr").remove();
		});
	}
	$("#modal_customfield_instructions").val(cfield["publicinstructions"]);
	if (cfield["isonreg"] != "1") {
		$('#modal_customfield_isreg').attr('checked',false);
	}
	if (cfield["ismanditory"] == "1") {
		$('#modal_customfield_ismanditory').attr('checked',true);
	}
	
	$("#modal_customfield_confirm_submit").click(function () {
		var t = {"action":"modifycustomfield","params":{"id":fieldid}};
		var ispub = "0"; if ($("#modal_customfield_isreg").is(':checked')) { ispub = "1"; }
		var isman = "0"; if ($("#modal_customfield_ismanditory").is(':checked')) { isman = "1"; }
		
		var fielddata = [];
		if ($("#modal_customfield_fieldtype").val() == "list") {
			$("#modal_customfield_listfields_table tr").each(function() {
				fielddata.push($(this).children(".listfield_val").text());
			});
			t["params"]["fielddata"] = fielddata;
		}
		if (isman != cfield["ismanditory"]) {
			t["params"]["ismanditory"] = isman;
		}
		if (ispub != cfield["isonreg"]) {
			t["params"]["isonreg"] = ispub;
		}
		if ($("#modal_customfield_label").val() != cfield["fieldname"]) {
			t["params"]["fieldname"] = $("#modal_customfield_label").val();
		}
		if ($("#modal_customfield_fieldtype").val() != cfield["fieldtype"]) {
			t["params"]["fieldtype"] = $("#modal_customfield_fieldtype").val();
		}
		t["params"]["fielddata"] = fielddata;
		if ($("#modal_customfield_instructions").val() != cfield["publicinstructions"]) {
			t["params"]["publicinstructions"] = $("#modal_customfield_instructions").val();
		}
		
		JSONDB.dotransaction(t);
		settings_load();
		$.modal.close();
	});
}

function settings_customfield_remove(fieldid) {
	$("#modal_areyousure").modal();
	$("#confirm_submit").click(function() {
		var t = {"action":"removecustomfield","params":{"id":fieldid}};
		JSONDB.dotransaction(t);
		settings_load();
		settings_publish()
		$.modal.close();
	});
}


var reg_new_sortset = false;
var reg_old_sortset = false;
function reg_load() {
	$("#regtable_new").empty();
	$("#regtable_old").empty();
	var newcount = 0;
	var oldcount = 0;
	for (id in JSONDB.jsondb["registrations"]) {
		var appendtarget = "#regtable_new";
		if (JSONDB.jsondb["registrations"][id].hasOwnProperty("isprocessed") && JSONDB.jsondb["registrations"][id]["isprocessed"]) {
			appendtarget = "#regtable_old";
			oldcount = oldcount + 1;
		} else {
			newcount = newcount + 1;
		}
		
		$(appendtarget).append("<tr>\n\
			<td class='firstname'></td>\n\
			<td class='lastname'></td>\n\
			<td class='submitstamp'></td>\n\
			<td class='centerit'><input type='button' value='Process' onClick='reg_process(\""+id+"\");'/></td>\n\
		</tr>");
		/*if (JSONDB.jsondb["registrations"][id].hasOwnProperty("isprocessed") && JSONDB.jsondb["registrations"][id]["isprocessed"]) {
			$("#regtable_old").append(toappend);
		} else {
			$("#regtable_new").append(toappend);
		}*/
		
		$(appendtarget+" > tr:last > td.firstname").text(JSONDB.jsondb["registrations"][id]["firstname"]);
		$(appendtarget+" > tr:last > td.lastname").text(JSONDB.jsondb["registrations"][id]["lastname"]);
		$(appendtarget+" > tr:last > td.submitstamp").text(JSONDB.jsondb["registrations"][id]["submitstamp"]);
	}
	
	if (newcount > 0 && !reg_new_sortset) {
		$("#regtable_new_master").trigger("update",[[[2,0]]]);
		reg_new_sortset = true;
	} else if (newcount > 0) {
		$("#regtable_new_master").trigger("update");
	}
	
	if (oldcount > 0 && !reg_old_sortset) {
		$("#regtable_old_master").trigger("update",[[[2,0]]]);
		reg_old_sortset = true;
	} else if (oldcount > 0) {
		$("#regtable_old_master").trigger("update");
	}
	$("#registration-accordion").accordion("resize");
}

function showimage(parentobject,fileid,size,removable) {
	parentobject.empty();
	removable = typeof(removable) != 'undefined' ? removable : false;
	if (fileid != null && fileid != "" && fileid != "undefined") {
		parentobject.append("<img src='/manageapp/image?imageid="+fileid+"&size="+size+"'/>");
		parentobject.attr("picturefileid",fileid);
		if (removable) {
			parentobject.append("<br/><input type='button' value='Remove Image' class='removeimagebutton'/>");
			$(".removeimagebutton").unbind("click");
			$(".removeimagebutton").click(function() {
				$(this).parent().empty();
				parentobject.attr("picturefileid","")
				parentobject.append("<div class='noimage'></div>");
			});
		}
	} else {
		parentobject.append("<div class='noimage'></div><br/><br/>");
	}
}

function reg_process(regid) {
	var regitem = JSONDB.jsondb["registrations"][regid];
	people_generateform();

	$("#modal_personform_firstname").val(regitem["firstname"]);
	$("#modal_personform_lastname").val(regitem["lastname"]);
	$("#modal_personform_homephone").val(regitem["homephone"]);
	$("#modal_personform_mobilephone").val(regitem["mobilephone"]);
	$("#modal_personform_email").val(regitem["email"]);
	$("#modal_personform_parents_name").val(regitem["parents_name"]);
	$("#modal_personform_parents_phone").val(regitem["parents_phone"]);
	$("#modal_personform_emergencyinfo").val(regitem["emergencyinfo"]);
	$("#modal_personform_carecard").val(regitem["carecard"]);
	$("#modal_personform_birthdate").val(regitem["birthdate"]);
	$("#modal_personform_gender option[value='"+regitem["gender"]+"']").attr('selected', 'selected');
	$("#modal_personform_address_street").val(regitem["address_street"]);
	$("#modal_personform_address_city").val(regitem["address_city"]);
	$("#modal_personform_address_postal").val(regitem["address_postal"]);
	$("#modal_personform_comments").val(regitem["comments"]);
	showimage($("#modal_personform_image"),regitem["picturefileid"],"small",true);
	
	$("#modal_personform_affiliation option[value='"+regitem["affiliation"]+"']").attr('selected', 'selected');

	try {
		for (var x in regitem["customfields"]) {
			$("#goform_"+x).val(regitem["customfields"][x]["entry"]);
		}
	} catch (e) {
		try { console.error("cfield error ",e); } catch (e2) {}
	}
	
	try {
		for (var x in regitem["groupselection"]) {
			$("#groupmembership_"+x).val(regitem["groupselection"][x]);
		}
	} catch (e) {
		try { console.error("cfield error ",e); } catch (e2) {}
	}

	$("#modal_personform_field_shopamount").val(regitem["shopamount"]);
	
	$("#model_personform_btn_delete").click(function() {
		closecheck(function() { reg_delete(regid);});
	});
	
	$("#model_personform_btn_new").click(function() {
		reg_regtouser(regid);
		reg_load();
		$.modal.close();
	});
}

function reg_delete(regid) {
	$("#modal_areyousure").modal();
	$("#confirm_submit").click(function() {
		var t = {"action":"removeregistration","params":{"id":regid}};
		JSONDB.dotransaction(t);
		reg_load();
		$.modal.close();
	});
}

function reg_regtouser(regid) {
	// This function assumes the process interface is showing, and filled out
	var t = {"action":"addperson","params":{"id":JSONDB.generateid()}};
	//var data = {"rowid":newpersonid,"registrationid":currentregid,"archived":"0"};
	t["params"]["firstname"] = $("#modal_personform_firstname").val();
	t["params"]["lastname"] = $("#modal_personform_lastname").val();
	t["params"]["homephone"] = $("#modal_personform_homephone").val();
	t["params"]["mobilephone"] = $("#modal_personform_mobilephone").val();
	t["params"]["email"] = $("#modal_personform_email").val();
	t["params"]["parents_name"] = $("#modal_personform_parents_name").val();
	t["params"]["parents_phone"] = $("#modal_personform_parents_phone").val();
	t["params"]["emergencyinfo"] = $("#modal_personform_emergencyinfo").val();
	t["params"]["carecard"] = $("#modal_personform_carecard").val();
	t["params"]["birthdate"] = $("#modal_personform_birthdate").val();
	t["params"]["gender"] = $("#modal_personform_gender").val();
	t["params"]["address_street"] = $("#modal_personform_address_street").val();
	t["params"]["address_city"] = $("#modal_personform_address_city").val();
	t["params"]["address_postal"] = $("#modal_personform_address_postal").val();
	t["params"]["comments"] = $("#modal_personform_comments").val();
	t["params"]["affiliation"] = $("#modal_personform_affiliation").val();
	
	var signedin = "0"; if ($("#modal_perseonform_signedin").is(':checked')) { signedin = "1"; }
	t["params"]["signedin"] = signedin;
	
	t["params"]["picturefileid"] = $("#modal_personform_image").attr("picturefileid");
	
	t["params"]["customfields"] = {};
	for (var x in settings_get("customordering",[])) {
		var cfieldid = JSONDB.jsondb["settings"]["customordering"][x];
		var cfield = JSONDB.jsondb["settings"]["customfields"][cfieldid];
		var cvalue = $("#goform_"+cfieldid).val();
		t["params"]["customfields"][cfieldid] = cvalue;
	}
	
	t["params"]["groupselection"] = {};
	if (JSONDB.jsondb.hasOwnProperty("groupareas") && JSONDB.jsondb["groupareas"].hasOwnProperty("orderarray")) {
		for (id in JSONDB.jsondb["groupareas"]["orderarray"]) {
			var gaid = JSONDB.jsondb["groupareas"]["orderarray"][id];
			var ga = JSONDB.jsondb["groupareas"][gaid];
			var leaderval = false;
			if ($("#isleader_"+gaid).is(':checked')) {
				leaderval = true;
			}
			var selectedgroupid = $("#groupmembership_"+gaid).val();
			t["params"]["groupselection"][gaid] = {"groupid":selectedgroupid,"isleader":leaderval};
		}
	}

	if (settings_get("useshop") == "yes") {
		t["params"]["shopvouch"] = $("#modal_personform_field_shopamount").val();
	} else {
		t["params"]["shopvouch"] = "0";
	}
	t["params"]["registrationid"] = regid;
	//try { console.log("t ",t,JSON.stringify(t)); } catch (e2) {}
	JSONDB.dotransaction(t);
	if (regid != 0) {
		var t2 = {"action":"processreg","params":{"id":regid}};
		JSONDB.dotransaction(t2);
	}
}

function points_load(openedindex) {
	var gbox = [];
	for (groupid in JSONDB.jsondb["points"]) {
		var sum = 0;
		for (x in JSONDB.jsondb["points"][groupid]) {
			sum = sum + parseInt(JSONDB.jsondb["points"][groupid][x]["points"]);
		}
		gbox.push({"groupid":groupid,"sum":sum});
	}
	function gbox_sort(a, b) {
		if (a["sum"] < b["sum"]) {
			return -1;
		} else if (a["sum"] == b["sum"]) {
			return 0;
		} else {
			return 1;
		}
	}
	
	gbox.sort(gbox_sort);
	gbox.reverse();
	
	if (JSONDB.jsondb.hasOwnProperty("groupareas") && JSONDB.jsondb["groupareas"].hasOwnProperty("orderarray")) {
		for (x in JSONDB.jsondb["groupareas"]["orderarray"]) {
			var gaid = JSONDB.jsondb["groupareas"]["orderarray"][x];
			var ga = JSONDB.jsondb["groupareas"][gaid];
			if (ga.hasOwnProperty("haspoints") && ga["haspoints"] == "1") {
				if (ga.hasOwnProperty("groupordering")) {
					for (gindex in ga["groupordering"]) {
						var groupid = ga["groupordering"][gindex];
						var g = ga["groups"][groupid];
						var found = false;
						for (i in gbox) {
							if (gbox[i]["groupid"] == groupid) {
								found = true;
								gbox[i]["label"] = g["label"]
							}
						}
						if (!found) {
							gbox.push({"groupid":groupid,"sum":0,"label":g["label"]});
						}
					}
				}
			}
		}
	}
	
//	try { console.log("gbox ",gbox); } catch (e2) {}
	
	$("#accordian_points").accordion("destroy");
	$("#accordian_points").empty();

	for (i in gbox) {
		var p = gbox[i];
		var divarea = $("\
				<div class='pointsarea' groupid='"+p["groupid"]+"'>\
					<h3><a href='#'>dynamiclabel</a></h3>\
					<div>\
						<input type='button' value='  Add Points Here  ' onClick='points_add(\""+p["groupid"]+"\");'/>\
						<table><tbody class='points_detailtable'></tbody></table>\
					</div>\
				</div>");
		//$("#accordian_points > div:last > h3 > a").text(p["label"]+" ("+p["sum"]+" Points)");
		divarea.find("a").text(p["label"]+" ("+p["sum"]+" Points)");
		
		for (x in JSONDB.jsondb["points"][p["groupid"]]) {
			var subp = JSONDB.jsondb["points"][p["groupid"]][x]
			//try { console.log("moo ",subp); } catch (e2) {}
			var thisrow = $("<tr>\
				<td class='reason'></td>\
				<td class='points'></td>\
				<td><input type='button' value='Modify' onClick='points_modify(\""+p["groupid"]+"\",\""+subp["id"]+"\");'/></td>\
				<td><input type='button' value='Remove' onClick='points_remove(\""+p["groupid"]+"\",\""+subp["id"]+"\");'/></td>\
			</tr>");
			thisrow.children(".reason").text(subp["reason"]);
			thisrow.children(".points").text(subp["points"])
			divarea.find(".points_detailtable").append(thisrow);
		}
		$("#accordian_points").append(divarea);
	}
	
	$("#accordian_points").accordion({
		header: "> div > h3",
		collapsible: true
	})
}

function points_modify(pointsgroupid,pointsid) {
	//try { console.log("mod",pointsgroupid,pointsid); } catch (e2) {}
	$("#modal_points").modal();
	$("#modal_points_groupselect").empty();
	for (x in JSONDB.jsondb["groupareas"]["orderarray"]) {
		var gaid = JSONDB.jsondb["groupareas"]["orderarray"][x];
		var ga = JSONDB.jsondb["groupareas"][gaid];
		if (ga.hasOwnProperty("haspoints") && ga["haspoints"] == "1") {
			$("#modal_points_groupselect").append($("<option></option>").attr("value","").text(ga["label"]));
			if (ga.hasOwnProperty("groupordering")) {
				for (gindex in ga["groupordering"]) {
					var groupid = ga["groupordering"][gindex];
					var g = ga["groups"][groupid];
					$("#modal_points_groupselect").append($("<option></option>").attr("value",groupid).html("&nbsp;&nbsp;&nbsp;"+g["label"]));
				}
			}
		}
	}
	$("#modal_points_groupselect").val(pointsgroupid);
	var thisp = null;
	for (x in JSONDB.jsondb["points"][pointsgroupid]) {
		var item = JSONDB.jsondb["points"][pointsgroupid][x];
		if (item["id"] == pointsid) {
			thisp = item;
			break;
		}
	}
	$("#modal_points_value").val(thisp["points"])
	$("#modal_points_reason").val(thisp["reason"])
	
	$("#modal_points_savebutton").click(function() {
		if ($("#modal_points_groupselect").val() != "" && $("#modal_points_value").val() != "") {
			var t = {"action":"modifypoints","params":{"id":pointsid}};
			t["params"]["originalgroupid"] = pointsgroupid;
			t["params"]["groupid"] = $("#modal_points_groupselect").val();
			t["params"]["points"] = $("#modal_points_value").val();
			t["params"]["reason"] = $("#modal_points_reason").val();
			JSONDB.dotransaction(t);
			points_load(pointsgroupid);
			$.modal.close();
		} else {
			alert("The form is not filled out properly");
		}
	});
}

function points_remove(groupid,pointsid) {
	$("#modal_areyousure").modal();
	$("#confirm_submit").click(function() {
		var t = {"action":"removepoints","params":{"id":pointsid,"groupid":groupid}};
		JSONDB.dotransaction(t);
		points_load(groupid);
		$.modal.close();
	});
	return false;
}

function points_add(selgroupid) {
	$("#modal_points").modal();
	$("#modal_points_groupselect").empty();
	if (JSONDB.jsondb.hasOwnProperty("groupareas") && JSONDB.jsondb["groupareas"].hasOwnProperty("orderarray")) {
		for (x in JSONDB.jsondb["groupareas"]["orderarray"]) {
			var gaid = JSONDB.jsondb["groupareas"]["orderarray"][x];
			var ga = JSONDB.jsondb["groupareas"][gaid];
			if (ga.hasOwnProperty("haspoints") && ga["haspoints"] == "1") {
				$("#modal_points_groupselect").append("<option value=''>"+ga["label"]+"</option>");
				if (ga.hasOwnProperty("groupordering")) {
					for (gindex in ga["groupordering"]) {
						var groupid = ga["groupordering"][gindex];
						var g = ga["groups"][groupid];
						$("#modal_points_groupselect").append("<option value='"+groupid+"'>&nbsp;&nbsp;&nbsp;"+g["label"]+"</option>");
					}
				}
			}
		}
	}
	
	if (selgroupid != null && selgroupid != "null") {
		$("#modal_points_groupselect").val(selgroupid);
	}
	$("#modal_points_savebutton").click(function() {
		if ($("#modal_points_groupselect").val() != "" && $("#modal_points_value").val() != "") {
			var t = {"action":"addpoints","params":{"id":JSONDB.generateid()}};
			t["params"]["groupid"] = $("#modal_points_groupselect").val();
			t["params"]["points"] = $("#modal_points_value").val();
			t["params"]["reason"] = $("#modal_points_reason").val();
			JSONDB.dotransaction(t);
			points_load($("#modal_points_groupselect").val());
			$.modal.close();
		} else {
			alert("The form is not filled out properly");
		}
	});
}

function shop_input(groupareaid,groupid) {
	$("#modal_shopinput").modal({containerCss: {width:"90%",height:"90%"}});
	
	var plist = [];
	for (personid in JSONDB.jsondb["people"]) {
		var p = JSONDB.jsondb["people"][personid];
		try {
			if (p["groupselection"][groupareaid]["groupid"] == groupid) {
				plist.push(p)
			}
		} catch (e) {}

	}
	plist.sort(plist_sort);
	
	//try { console.log("plist ",plist); } catch (e2) {}
	
	for (x in plist) {
		var p = plist[x];
		$("#modal_shopinput_table").append("<tr id='modal_shopinput_row_"+p["id"]+"' personid='"+p["id"]+"'>\
				<td class='firstname modal_generalcell'></td>\
				<td class='lastname modal_generalcell'></td>\
				<td class='vouch currencycell'></td>\
				<td class='totalremaining currencycell'></td>\
				<td><input type='text' size='6' class='spendamountinput'/></td>\
				<td class='history modal_generalcell'></td></tr>");
		$("#modal_shopinput_row_"+p["id"]+" > .firstname").text(p["firstname"]);
		$("#modal_shopinput_row_"+p["id"]+" > .lastname").text(p["lastname"]);
		$("#modal_shopinput_row_"+p["id"]+" > .vouch").text(fd(p["shopvouch"]));
		var psum = 0;
		if (p.hasOwnProperty("shopspend")) {
			for (i in p["shopspend"]) {
				var s = p["shopspend"][i];
				psum = psum + parsef(s["spend"]);
				var hitem = "<span class='inputtransaction' onClick='shop_removetransaction(\""+s["personid"]+"\",\""+s["id"]+"\");' id='shopt_"+s["id"]+"'>"+fd(s["spend"])+"</span>";
				var old = $("#modal_shopinput_row_"+p["id"]+" > .history").html();
				var between = "";
				if (old != "") {
					between = ", ";
				}
				$("#modal_shopinput_row_"+p["id"]+" > .history").html(old+between+hitem);
			}
		}
		
		var remaining = parsef(p["shopvouch"]) - psum;
		$("#modal_shopinput_row_"+p["id"]+" > .totalremaining").text(fd(remaining));
	}
	$("#modal_shopinput_savebutton").click(function() {
		var t = {"action":"addshopspend","params":{"spendlist":[]}};
		$("#modal_shopinput_table > tr").each(function() {
			var personid = $(this).attr("personid");
			var amount = $("#"+$(this).attr("id")+" .spendamountinput").val();
			if (amount != "") {
				t["params"]["spendlist"].push({"id":JSONDB.generateid(),"personid":personid,"spend":amount,"stamp":getnowstamp()});
			}
		});
		JSONDB.dotransaction(t);
		$.modal.close();
	});
	return false;
}

function shop_removetransaction(personid,transactionid) {
	var t = {"action":"removeshopspend","params":{"personid":personid,"id":transactionid}};
	JSONDB.dotransaction(t);
	$("#shopt_"+transactionid).remove();
	return false;
}

function shop_sheet(groupareaid,groupid) {
	
	var groupname = JSONDB.jsondb["groupareas"][groupareaid]["groups"][groupid]["label"];
	
	var newwindow = window.open('','_blank','status=1,toolbar=1,location=1,menubar=1,statusbar=1');
	newwindow.document.write('<html><head><title>Spending Sheet Report</title></head><body><h3>'+groupname+'</h3><table id="spendsheettable"><thead><tr><th>First Name</th><th>Last Name</th><th>Starting</th><th>Remaining</th><th>History</th></tr></thead><tbody id="datatable"></tbody></table><br/><br/>Total Amount Vouched: <span id="mastervouch"></span><br/>Total Spent: <span id="masterspend"></span></body></html>');
	$("head",newwindow.document).append('<link rel="stylesheet" type="text/css" href="/assets/printable.css"/>');
	
	var mastervouch = 0.00;
	var masterspend = 0.00;

	var plist = [];
	for (personid in JSONDB.jsondb["people"]) {
		var p = JSONDB.jsondb["people"][personid];
		try {
			if (p["groupselection"][groupareaid]["groupid"] == groupid) {
				plist.push(p)
			}
		} catch (e) {}

	}
	plist.sort(plist_sort);
	
	for (x in plist) {
		var p = plist[x];
		$('#datatable',newwindow.document).append("<tr id='modal_shopinput_row_"+p["id"]+"' personid='"+p["id"]+"'>\
				<td class='firstname modal_generalcell'></td>\
				<td class='lastname modal_generalcell'></td>\
				<td class='vouch currencycell'></td>\
				<td class='totalremaining currencycell'></td>\
				<td class='history spend_history modal_generalcell'></td>\
				<td class='spend_blankcell'>&nbsp;</td>\
				<td class='spend_blankcell'>&nbsp;</td>\
				<td class='spend_blankcell'>&nbsp;</td>\
				<td class='spend_blankcell'>&nbsp;</td>\
			</tr>");
		$("#modal_shopinput_row_"+p["id"]+" > .firstname",newwindow.document).text(p["firstname"]);
		$("#modal_shopinput_row_"+p["id"]+" > .lastname",newwindow.document).text(p["lastname"]);
		$("#modal_shopinput_row_"+p["id"]+" > .vouch",newwindow.document).text(fd(p["shopvouch"]));
		mastervouch = mastervouch + parsef(p["shopvouch"]);
		var psum = 0;
		if (p.hasOwnProperty("shopspend")) {
			for (i in p["shopspend"]) {
				var s = p["shopspend"][i];
				psum = psum + parsef(s["spend"]);
				var hitem = fd(s["spend"]);
				var old = $("#modal_shopinput_row_"+p["id"]+" > .history",newwindow.document).html();
				var between = "";
				if (old != "") {
					between = ",&nbsp;";
				}
				$("#modal_shopinput_row_"+p["id"]+" > .history",newwindow.document).html(old+between+hitem);
			}
		}
		masterspend = masterspend + psum;
		var remaining = parsef(p["shopvouch"]) - psum;
		$("#modal_shopinput_row_"+p["id"]+" > .totalremaining",newwindow.document).text(fd(remaining));
	}

	$("#mastervouch",newwindow.document).text(fd(mastervouch));
	$("#masterspend",newwindow.document).text(fd(masterspend));
}

function moneyin_load() {
	$("#finance_paymenttable").empty();
	$("#finance_paymenttable_general").empty();
	
	for (i in JSONDB.jsondb["moneyin"]) {
		var m = JSONDB.jsondb["moneyin"][i];
		
		$("#finance_paymenttable").append("<tr id='paymentrow_"+m["id"]+"'>\n\
			<td class='finance_paymenttable'>"+m["description"]+"</td>\n\
			<td class='finance_paymenttable_amount currencycell'>"+fd(m["total"])+"</td>\n\
			<td class='finance_paymenttable hidewhenprinting'>\
				<input class='hidewhenprinting' type='button' value='Mod' onClick='moneyin_mod(\""+m["id"]+"\");'/>\
				<input class='hidewhenprinting' type='button' value='Del' onClick='moneyin_delete(\""+m["id"]+"\");'/></td></tr>");
		$("#finance_paymenttable").append("<tr><td colspan='2'><table id='paymentrow_"+m["id"]+"_details' class='finance_paymentdetails'></table></td></tr>");
//		$("#paymentrow_"+m["id"]+"_details").empty();
		for (x in m["allocation"]) {
			var a = m["allocation"][x];
			var name = "<i>General Income</i>";
			if (a["type"] == "voucher") {
				name = "Against Voucher: "+JSONDB.jsondb["moneyin"][a["refid"]]["description"];
				//result2[x]["personid"] != "") {
			} else if (a["refid"] != "") {
				if (JSONDB.jsondb["people"].hasOwnProperty(a["refid"])) {
					var p = JSONDB.jsondb["people"][a["refid"]];
					name = p["firstname"]+" "+p["lastname"];
				}
				else {
					try { console.log(a); } catch (e) {}
				}
				//name = result2[x]["firstname"]+" "+result2[x]["lastname"];
				
			}
			$("#paymentrow_"+m["id"]+"_details").append("<tr>\n\
				<td class='finance_paymentrow'>"+name+"</td>\n\
				<td class='finance_paymentrow_amount currencycell'>"+fd(a["amount"])+"</td></tr>");
			if (name == "<i>General Income</i>") {
				$("#finance_paymenttable_general").append("<tr><td>"+m["description"]+"</td><td>"+fd(a["amount"])+"</td></tr>");
			}
		}
	}
}

function removeallocation(buttonobject) {
	document.getElementById("model_moneyin_allocationtable").removeChild(buttonobject.parentNode.parentNode);
}

function moneyin_show() {
	$("#modal_moneyin").modal();
	var selectlist = "<option value=''>General Income (No allocation)</option>";
	var plist = getsortedpeople();
//	try { console.log("getsortedlist ",plist); } catch (e2) {}
	for (x in plist) {
		var p = plist[x];
		selectlist = selectlist + "<option value='p_"+p["id"]+"'>"+p["lastname"]+", "+p["firstname"]+"</option>";
	}
	
	var vlist = [];
	for (x in JSONDB.jsondb["moneyin"]) {
		var m = JSONDB.jsondb["moneyin"][x];
		if (m.hasOwnProperty("isvoucher") && m["isvoucher"] == "1") {
			vlist.push(m);
		}
	}
	
	function vlist_sort(a, b) {
		if (a["description"].toUpperCase() < b["description"].toUpperCase()) {
			return -1;
		} else if (a["description"].toUpperCase() == b["description"].toUpperCase()) {
			return 0;
		} else {
			return 1;
		}
	}
	
	vlist.sort(vlist_sort);
	
	for (x in vlist) {
		var v = vlist[x];
		selectlist = selectlist + "<option value='v_"+v["id"]+"'>Voucher: "+v["description"]+"</option>";
	}
	
	var alist = getsortedaffiliations();
	var aselect = "";
	for (x in alist) {
		var a = alist[x];
		aselect = aselect + "<option value='"+a["id"]+"'>"+a["groupname"]+"</option>";
	}
	
	$("#modal_moneyin_initalselect").append(selectlist);
	$("#modal_moneyin_voucheraffiliation").append(aselect);
	$("#model_moneyin_addallocationbutton").click(function() {
		$("#model_moneyin_allocationtable").append("<tr><td class='allocationrow'>Amount: $<input type='text' size='6' class='allocationamount' value='0.00'/> Apply to: <select class='allocationdirection'>"+selectlist+"</select><input type='button' value='Remove' onClick='removeallocation(this);'/></td></tr>");
		$(".allocationamount").unbind("change");
		$(".allocationamount").change(function(e) {moneyin_update_total();});
	});
}

function moneyin_update_total() {
	var temptotal = 0.00;
	$(".allocationrow").each(function(i,element) {
		var itemval = $(".allocationamount",this).val();
		//var itemdirection = $(".allocationdirection",this).val();
		if (itemval != "" && parseFloat(itemval) > 0) {
			temptotal = parseFloat(temptotal) + parseFloat(itemval);
		}
	});
	$("#modal_moneyin_total").text(fd(temptotal));
}

function moneyin_add() {
	moneyin_show();
	$(".allocationamount").unbind("change");
	$(".allocationamount").change(function(e) {moneyin_update_total();});
	moneyin_update_total();
	
/*	$("#model_moneyin_isvoucher").change(function() {
		try { console.log("check change"); } catch (e2) {}
		//var signedin = "0"; if ($("#modal_perseonform_signedin").is(':checked')) { signedin = "1"; }
		//if (settings_get("useshop") == "yes") { $("#public_useshop").attr('checked',true); } else { $("#public_useshop").attr('checked',false); }
	})*/
	
	$("#modal_moneyin_savebutton").click(function() {
		var goodtogo = false;
		var temptotal = 0.00;
		$(".allocationrow").each(function(i,element) {
			var itemval = $(".allocationamount",this).val();
			var itemdirection = $(".allocationdirection",this).val();
			if (itemval != "" && parseFloat(itemval) > 0) {
				temptotal = parseFloat(temptotal) + parseFloat(itemval);
			}
		});
		//if (temptotal != parseFloat($("#modal_moneyin_totalpayment").val())) {
		//	alert("Total of Allocation does not match total payment");
		//} else 
		if ($("#modal_moneyin_description").val() == "") {
			alert("No description given.");
		} else if (temptotal == 0) {
			alert("No amounts enterred");
		} else {
			var paymentid = JSONDB.generateid();
			var t = {"action":"addmoneyin","params":{"id":paymentid}};
			t["params"]["description"] = $("#modal_moneyin_description").val();
			//t["params"]["total"] = $("#modal_moneyin_totalpayment").val();
			t["params"]["total"] = temptotal;
			var isvoucher = "0"; if ($("#model_moneyin_isvoucher").is(':checked')) { isvoucher = "1"; }
			t["params"]["isvoucher"] = isvoucher;
			t["params"]["voucheraffiliation"] = $("#modal_moneyin_voucheraffiliation").val();
			t["params"]["allocation"] = [];
			//var data = {"rowid":paymentid,"description":$("#modal_moneyin_description").val(),"total":$("#modal_moneyin_totalpayment").val()};
			//MRDB.db_addrow("payments",data);
			$(".allocationrow").each(function(i,element) {
				var itemval = $(".allocationamount",this).val();
				var itemdirection = $(".allocationdirection",this).val();
				var itemrefid = itemdirection.substr(2);
				var itemtypeid = itemdirection.substr(0,1);
				if (itemval != "" && parseFloat(itemval) > 0) {
//					try { console.log("tcheck ",itemval,itemdirection,itemrefid,itemtypeid); } catch (e2) {}
					if (itemtypeid == "p") {
						var adata = {"type":"person","refid":itemrefid,"amount":parseFloat(itemval)};
						t["params"]["allocation"].push(adata);
					} else if (itemtypeid == "v") {
						var adata = {"type":"voucher","refid":itemrefid,"amount":parseFloat(itemval)};
						t["params"]["allocation"].push(adata);
					} else {
						var adata = {"type":"general","refid":"","amount":parseFloat(itemval)};
						t["params"]["allocation"].push(adata);
					}
				}
			});
			try { console.log("moneytransaction ",t); } catch (e2) {}
			JSONDB.dotransaction(t);
			moneyin_load();
			$.modal.close();
		}
	});
}

function moneyin_mod(transactionid) {
	moneyin_show();

	var m = JSONDB.jsondb["moneyin"][transactionid];
	$("#modal_moneyin_description").val(m["description"]);
	//$("#modal_moneyin_totalpayment").val(m["total"]);
	if (m["isvoucher"] == "1") { $("#model_moneyin_isvoucher").attr('checked',true); } else { $("#model_moneyin_isvoucher").attr('checked',false); }
	$("#modal_moneyin_voucheraffiliation").val(m["voucheraffiliation"]);
	var selectlist = $("#modal_moneyin_initalselect").html();
	$(".allocationrow").remove();
	var newrow = "<tr><td class='allocationrow'>Amount: $<input type='text' size='6' class='allocationamount' value='0.00'/> Apply to: <select class='allocationdirection'>"+selectlist+"</select><input type='button' value='Remove' onClick='removeallocation(this);'/></td></tr>";
	for (i in m["allocation"]) {
		var aitem = m["allocation"][i];
		var refid = "p_"+aitem["refid"];
		if (aitem["type"] == "voucher") {
			refid = "v_"+aitem["refid"];
		}
		$("#model_moneyin_allocationtable").append(newrow);
		$(".allocationrow:last > .allocationamount").val(aitem["amount"]);
		$(".allocationrow:last > .allocationdirection").val(refid);
//		$(".allocationrow:last").attr("allocationid",refid);
	}

	$(".allocationamount").unbind("change");
	$(".allocationamount").change(function(e) {moneyin_update_total();});
	moneyin_update_total();

/*	$("#model_moneyin_isvoucher").change(function() {
		try { console.log("check change"); } catch (e2) {}
		//var signedin = "0"; if ($("#modal_perseonform_signedin").is(':checked')) { signedin = "1"; }
		//if (settings_get("useshop") == "yes") { $("#public_useshop").attr('checked',true); } else { $("#public_useshop").attr('checked',false); }
	})*/
	
	$("#modal_moneyin_savebutton").click(function() {
		var goodtogo = false;
		var temptotal = 0.00;
		$(".allocationrow").each(function(i,element) {
			var itemval = $(".allocationamount",this).val();
			var itemdirection = $(".allocationdirection",this).val();
			if (itemval != "" && parseFloat(itemval) > 0) {
				temptotal = parseFloat(temptotal) + parseFloat(itemval);
			}
		});
		//if (temptotal != parseFloat($("#modal_moneyin_totalpayment").val())) {
		//	alert("Total of Allocation does not match total payment");
		//} else 
		if ($("#modal_moneyin_description").val() == "") {
			alert("No description given.");
		} else if (temptotal == 0) {
			alert("No amounts enterred");
		} else {
			var paymentid = transactionid;
			var t = {"action":"modifymoneyin","params":{"id":paymentid}};
			t["params"]["description"] = $("#modal_moneyin_description").val();
			//t["params"]["total"] = $("#modal_moneyin_totalpayment").val();
			t["params"]["total"] = temptotal;
			var isvoucher = "0"; if ($("#model_moneyin_isvoucher").is(':checked')) { isvoucher = "1"; }
			t["params"]["isvoucher"] = isvoucher;
			t["params"]["voucheraffiliation"] = $("#modal_moneyin_voucheraffiliation").val();
			t["params"]["allocation"] = [];
			//var data = {"rowid":paymentid,"description":$("#modal_moneyin_description").val(),"total":$("#modal_moneyin_totalpayment").val()};
			//MRDB.db_addrow("payments",data);
			$(".allocationrow").each(function(i,element) {
				var itemval = $(".allocationamount",this).val();
				var itemdirection = $(".allocationdirection",this).val();
				var itemrefid = itemdirection.substr(2);
				var itemtypeid = itemdirection.substr(0,1);
				if (itemval != "" && parseFloat(itemval) > 0) {
//					try { console.log("tcheck ",itemval,itemdirection,itemrefid,itemtypeid); } catch (e2) {}
					if (itemtypeid == "p") {
						var adata = {"type":"person","refid":itemrefid,"amount":parseFloat(itemval)};
						t["params"]["allocation"].push(adata);
					} else if (itemtypeid == "v") {
						var adata = {"type":"voucher","refid":itemrefid,"amount":parseFloat(itemval)};
						t["params"]["allocation"].push(adata);
					} else {
						var adata = {"type":"general","refid":"","amount":parseFloat(itemval)};
						t["params"]["allocation"].push(adata);
					}
				}
			});
			try { console.log("moneytransaction ",t); } catch (e2) {}
			JSONDB.dotransaction(t);
			moneyin_load();
			$.modal.close();
		}
	});
}

function moneyin_delete(transactionid) {
	$("#modal_areyousure").modal();
	$("#confirm_submit").click(function() {
		var t = {"action":"removemoneyin","params":{"id":transactionid}};
		JSONDB.dotransaction(t);
		moneyin_load();
		$.modal.close();
	});
}

var vouchers_vsort = false;
var vouchers_asort = false;
function vouchers_load() {
	//vouchers_datatable
	$("#vouchers_datatable").empty();
	//try { console.log("Loading Vouchers"); } catch (e) {}
	
	var vhash = {};
	var ahash = {};
	for (i in JSONDB.jsondb["moneyin"]) {
		var m = JSONDB.jsondb["moneyin"][i];
		for (x in m["allocation"]) {
			var aitem = m["allocation"][x];
			if (aitem["type"] == "voucher") {
				if (!vhash.hasOwnProperty(aitem["refid"])) {
					vhash[aitem["refid"]] = 0;
				}
				vhash[aitem["refid"]] = vhash[aitem["refid"]] + parsef(aitem["amount"]);
			}
		}
	}
	//try { console.log("vhash ",vhash); } catch (e2) {}
	
	var vcount = 0;
	for (i in JSONDB.jsondb["moneyin"]) {
		var m = JSONDB.jsondb["moneyin"][i];
		//try { console.log("Voucher Checking",m); } catch (e) {}
		if (m["isvoucher"] == "1") {
			var a = JSONDB.jsondb["affiliation"][m["voucheraffiliation"]];
			var balance = parsef(m["total"]) - parsef(vhash[m["id"]]);
			if (!ahash.hasOwnProperty(m["voucheraffiliation"])) {
				ahash[m["voucheraffiliation"]] = 0;
			}
			ahash[m["voucheraffiliation"]] = ahash[m["voucheraffiliation"]] + balance;
			var alloc = "";
			for (x in m["allocation"]) {
				var aitem = m["allocation"][x];
				var thistext= "";
				if (aitem["type"] == "person") {
					var p = JSONDB.jsondb["people"][aitem["refid"]];
					if ((typeof p != 'undefined')) {
						thistext = p["firstname"]+" "+p["lastname"];
					} else {
						thistext = "**UNKNOWN** (Deleted?)";
					}
				} else if (aitem["type"] == "voucher") {
					thistext = "Voucher: "+JSONDB.jsondb["moneyin"][aitem["refid"]]["description"];
				} else {
					thistext = "General Income";
				}
				alloc = alloc + thistext + " ("+fd(parsef(aitem["amount"]))+")<br/>";
			}
			$("#vouchers_datatable").append("<tr>\
					<td>"+m["description"]+"</td>\
					<td>"+a["groupname"]+"</td>\
					<td>"+alloc+"</td>\
					<td>"+fd(parsef(m["total"]))+"</td>\
					<td>"+fd(balance)+"</td>\
				</tr>");
			vcount = vcount + 1;
		}
	}
	
	var acount = 0;
	$("#vouchers_affiliationsdatatable").empty();
	for (i in JSONDB.jsondb["affiliation"]) {
		var a = JSONDB.jsondb["affiliation"][i];
		$("#vouchers_affiliationsdatatable").append("<tr>\
				<td>"+a["groupname"]+"</td>\
				<td>"+fd(parsef(ahash[i]))+"</td>\
			</tr>")
		acount = acount + 1;
	}
	//$("#vouchers_vouchertable").tablesorter();
	//$("#vouchers_affiliationsummary").tablesorter();
	//var vouchers_vsort = false;
	//var vouchers_asort = false;
	
	if (vcount > 0 && !vouchers_vsort) {
		$("#vouchers_vouchertable").trigger("update",[[[0,0]]]);
		vouchers_vsort = true;
		//try { console.log("sort update 1"); } catch (e) {}
	} else if (vcount > 0) {
		$("#vouchers_vouchertable").trigger("update");
		//try { console.log("sort update 2"); } catch (e) {}
	}

	if (acount > 0 && !vouchers_asort) {
		$("#vouchers_affiliationsummary").trigger("update",[[[0,0]]]);
		vouchers_asort = true;
		//try { console.log("sort update 1"); } catch (e) {}
	} else if (acount > 0) {
		$("#vouchers_affiliationsummary").trigger("update");
		//try { console.log("sort update 2"); } catch (e) {}
	}
}

var peoplefinance_sortset = false;
function peoplefinance_load() {
	$("#peoplefinancetable_data").empty();
	var phash = {};
	for (i in JSONDB.jsondb["moneyin"]) {
		var m = JSONDB.jsondb["moneyin"][i];
		for (x in m["allocation"]) {
			var aitem = m["allocation"][x];
			if (aitem["type"] == "person") {
				if (!phash.hasOwnProperty(aitem["refid"])) {
					phash[aitem["refid"]] = 0;
				}
				phash[aitem["refid"]] = phash[aitem["refid"]] + parsef(aitem["amount"]);
			}
		}
	}
	
	var pcount = 0;
	for (i in JSONDB.jsondb["people"]) {
		var p = JSONDB.jsondb["people"][i];
		var thiscost = 0;
		for (x in p["groupselection"]) {
			thiscost = thiscost + report_getgroupcost(x,p["groupselection"][x]["groupid"]);
		}
		thiscost = thiscost + parsef(p["shopvouch"]);
		var thispaid = parsef(phash[p["id"]]);
		var balance = thiscost - thispaid;
		//try { console.log("p ",p); } catch (e2) {}
		var therow = $("<tr>\
				<td class='pf_view'><input type='button' onClick='people_view(\""+p["id"]+"\")' value='View'/></td>\
				<td class='pf_firstname'></td>\
				<td class='pf_lastname'></td>\
				<td class='pf_affiliation'></td>\
				<td class='pf_cost'></td>\
				<td class='pf_paid'></td>\
				<td class='pf_balance'></td>\
			</tr>");
		therow.children(".pf_firstname").text(p["firstname"]);
		therow.children(".pf_lastname").text(p["lastname"]);
		therow.children(".pf_affiliation").text(report_getaffiliationname(p["affiliation"]));
		therow.children(".pf_cost").text(fd(thiscost));
		therow.children(".pf_paid").text(fd(thispaid));
		therow.children(".pf_balance").text(fd(balance));
		$("#peoplefinancetable_data").append(therow);
		pcount = pcount + 1;
	}
	
	if (pcount > 0 && !peoplefinance_sortset) {
		$("#peoplefinancetable").trigger("update",[[[2,0],[1,0]]]);
		peoplefinance_sortset = true;
	} else if (pcount > 0) {
		$("#peoplefinancetable").trigger("update");
	}
}

function report_fulldata(groupareaid,groupid,showfinancial) {
	var newwindow = window.open('','_blank','status=1,toolbar=1,location=1,menubar=1,statusbar=1');
	
	newwindow.document.write('<html><head><title></title></head><body id="everythingcontainer"></body></html>');
	$("head",newwindow.document).append('<link rel="stylesheet" type="text/css" href="/assets/fulldata.css">');

	$("title",newwindow.document).text("Full Data Report");

	function report_fulldata_record(personid,target) {
		var persondata = JSONDB.jsondb["people"][personid];
		var record = $("<div style='page-break-after: always;' class='personrecord'><table width='100%'><tr><td width='50%' valign='top'>" +
				"<table>" +
				"<tr><td class='fieldlabel'>First Name: </td><td class='fielddata'><span class='firstname'></span></td></tr>" +
				"<tr><td class='fieldlabel'>Last Name: </td><td class='fielddata'><span class='lastname'></span></td></tr>" +
				"<tr><td class='fieldlabel'>Home Phone: </td><td class='fielddata'><span class='homephone'></span></td></tr>" +
				"<tr><td class='fieldlabel'>Mobile Phone: </td><td class='fielddata'><span class='mobilephone'></span></td></tr>" +
				"<tr><td class='fieldlabel'>Email: </td><td class='fielddata'><span class='email'></span></td></tr>" +
				"<tr><td class='fieldlabel'>Parents Name: </td><td class='fielddata'><span class='parents_name'></span></td></tr>" +
				"<tr><td class='fieldlabel'>Parents Phone: </td><td class='fielddata'><span class='parents_phone'></span></td></tr>" +
				"<tr><td class='fieldlabel'>Emergency Information: </td class='fielddata'><td><span class='emergencyinfo'></span></td></tr>" +
				"<tr><td class='fieldlabel'>Care Card: </td><td class='fielddata'><span class='carecard'></span></td></tr>" +
				"<tr><td class='fieldlabel'>Birthdate: </td><td class='fielddata'><span class='birthdate'></span></td></tr>" +
				"<tr><td class='fieldlabel'>Age: </td><td class='fielddata'><span class='age'></span></td></tr>" +
				"<tr><td class='fieldlabel'>Gender: </td><td class='fielddata'><span class='gender'></span></td></tr>" +
				"<tr><td class='fieldlabel'>Affiliation: </td><td class='fielddata'><span class='affiliation'></span></td></tr>" +
				"</table></td><td width='50%' valign='top'>" +
				"<span class='fieldlabel'>Address:</span><br/>" +
					"<table><tr><td class='fieldlabel'>Street: </td><td class='fielddata'><span class='address_street'></span></td></tr>" +
					"<tr><td class='fieldlabel'>City: </td><td class='fielddata'><span class='address_city'></span></td></tr>" +
					"<tr><td class='fieldlabel'>Postal: </td><td class='fielddata'><span class='address_postal'></span></td></tr>" +
					"<tr><td>&nbsp;</td></tr>" +
					"<tr><td valign='top' class='fieldlabel'>Comments: </td><td class='fielddata'><span class='comments'></span></td></tr>" +
					"<tr><td valign='top' class='fieldlabel'>Photo: </td><td><div id='personphoto'></div></td></tr>" +
					"</table>" +
				"</td></tr><tr><td valign='top'>" +
				"<table id='customdata'></table></td><td valign='top'>" +
				"<table id='grouptable'></table></td></tr></table>" +
				"</div>");
		
		$(".firstname",record).text(persondata["firstname"]);
		$(".lastname",record).text(persondata["lastname"]);
		$(".homephone",record).text(persondata["homephone"]);
		$(".mobilephone",record).text(persondata["mobilephone"]);
		$(".email",record).text(persondata["email"]);
		$(".parents_name",record).text(persondata["parents_name"]);
		$(".parents_phone",record).text(persondata["parents_phone"]);
		$(".emergencyinfo",record).text(persondata["emergencyinfo"]);
		$(".carecard",record).text(persondata["carecard"]);
		$(".birthdate",record).text(persondata["birthdate"]);
		$(".age",record).text(getage(parsedate(persondata["birthdate"])));
		$(".gender",record).text(persondata["gender"]);
		$(".address_street",record).text(persondata["address_street"]);
		$(".address_city",record).text(persondata["address_city"]);
		$(".address_postal",record).text(persondata["address_postal"]);
		$(".comments",record).html("<div>"+nl2br(safeforhtml(persondata["comments"]))+"</div>");
		
		showimage($("#personphoto",record),persondata["picturefileid"],"small",false);
		
		$(".affiliation",record).text(report_getaffiliationname(persondata["affiliation"]));
		
		record.children("#customtable").empty();
		if (JSONDB.jsondb.hasOwnProperty("settings") && JSONDB.jsondb["settings"].hasOwnProperty("customordering")) {
			for (var i in JSONDB.jsondb["settings"]["customordering"]) {
				var cfield = JSONDB.jsondb["settings"]["customfields"][JSONDB.jsondb["settings"]["customordering"][i]];
				var thevalue = "";
				try {
					thevalue = persondata["customfields"][cfield["id"]];
				} catch (e) {}
				
				var row = $("<tr><td class='fieldlabel fieldname'></td><td class='fielddata value'></td></tr>")
				row.children(".fieldname").text(cfield["fieldname"]+":");
				row.children(".value").text(thevalue)
				$("#customdata",record).append(row);
			}
		}
		/*
		if (settings_get("useshop") != "yes") {
			$("#modal_person_shoparea").css("display","none");
		} else {
			$("#modal_person_field_shopvouch").text(persondata["shopvouch"]);
		}

		$("#modal_person_financetable").empty();
		*/
		$("#grouptable",record).empty();
		var moneybalance = 0.00;
		
		for (i in JSONDB.jsondb["groupareas"]["orderarray"]) {
			var ga = JSONDB.jsondb["groupareas"][JSONDB.jsondb["groupareas"]["orderarray"][i]];
			var selectedgroup = "Nothing Chosen";
			var viewhtml = "";
			var leaderhtml = "";
			var thismodifier = 0.00;
			
			for (x in persondata["groupselection"]) {
				if (x == ga["id"]) {
					var gs = persondata["groupselection"][x];
					if (ga["groups"].hasOwnProperty(gs["groupid"])) {
						selectedgroup = ga["groups"][gs["groupid"]]["label"];
						thismodifier = ga["groups"][gs["groupid"]]["modifier"];
						if (gs["isleader"] == true) {
							leaderhtml = " (Leader)";
						}
						//viewhtml = " <input type='button' value='View' onClick='closecheck(\"groups_view(\\\""+ga["id"]+"\\\",\\\""+gs["groupid"]+"\\\")\");'/>";
						viewhtml = "";
					}
					break;
				}
			}
			
			var row1 = $("<tr><td class='fieldlabel label'></td><td><span class='grouplabel fielddata'></span><span class='viewhtml'></span></td></tr>")
			row1.children(".label").text(ga["label"]+":");
			row1.find(".grouplabel").text(selectedgroup+leaderhtml);
			row1.find(".viewhtml").html(viewhtml);
			$("#grouptable",record).append(row1);
			/*
			var row2 = $("<tr><td class='modal_person_financetable_type'>Cost</td><td class='modal_person_financetable_label label'></td><td class='modal_person_financetable_modifier thecost'></td></tr>");
			row2.children(".label").text(ga["label"]+": "+selectedgroup);
			row2.children(".thecost").text(fd(thismodifier));
			$("#modal_person_financetable").append(row2);
			moneybalance = moneybalance + parsef(thismodifier);
			*/
		}
		
		/*
		if (settings_get("useshop") == "yes") {
			var row = $("<tr><td class='modal_person_financetable_type'>Cost</td><td class='modal_person_financetable_label'>Shop Vouch</td><td class='modal_person_financetable_modifier vouchvalue'></td></tr>")
			row.children(".vouchvalue").text(fd(persondata["shopvouch"]))
			$("#modal_person_financetable").append(row);
			moneybalance = moneybalance + parsef(persondata["shopvouch"]);
		}
		
		// Money in
		for (i in JSONDB.jsondb["moneyin"]) {
			for (x in JSONDB.jsondb["moneyin"][i]["allocation"]) {
				var desc = JSONDB.jsondb["moneyin"][i]["description"]
				var alloc = JSONDB.jsondb["moneyin"][i]["allocation"][x];
				if (alloc["type"] == "person" && alloc["refid"] == persondata["id"]) {
					var row = $("<tr><td class='modal_person_financetable_type'>In</td><td class='modal_person_financetable_label desc'></td><td class='modal_person_financetable_modifier amount'></td></tr>");
					row.children(".desc").text(desc);
					row.children(".amount").text(fd(parsef(alloc["amount"])));
					$("#modal_person_financetable").append(row);
					moneybalance = moneybalance - parsef(alloc["amount"]);
				}
			}
		}

		var sumrow = $("<tr><td colspan='2' class='modal_person_financetable_total'>Total Owing:</td><td class='modal_person_financetable_modifier balance'></td></tr>");
		sumrow.children(".balance").text(fd(moneybalance));
		$("#modal_person_financetable").append(sumrow);
		*/
		
		$("body",target).append(record);
	}
	
	var ga = JSONDB.jsondb["groupareas"][groupareaid];
	var g = ga["groups"][groupid];
		
	for (i in JSONDB.jsondb["people"]) {
		try {
			var p = JSONDB.jsondb["people"][i];
			if (p["groupselection"][groupareaid]["groupid"] == groupid) {
				report_fulldata_record(i,newwindow.document);
			}
		} catch (e3) {}
	}
	$(".personrecord:last",newwindow.document).css("page-break-after","avoid");
}

function report_getaffiliationname(affiliationid) {
	var toreturn = "";
	try {
		toreturn = JSONDB.jsondb["affiliation"][affiliationid]["groupname"];
	} catch (e) {}
	return toreturn;
}

function report_getgroupcost(groupareaid,groupid) {
	var toreturn = 0;
	try {
		toreturn = parsef(JSONDB.jsondb["groupareas"][groupareaid]["groups"][groupid]["modifier"]);
	} catch (e) {}
	return toreturn;
}

function spenders_load() {
	$("#spendertable_data").empty();
	
	var shash = {};
	for (i in JSONDB.jsondb["expenseitems"]) {
		var exp = JSONDB.jsondb["expenseitems"][i];
		if (exp.hasOwnProperty("spenderid") && exp["spenderid"] != null && exp["spenderid"].length > 0) {
			if (!shash.hasOwnProperty(exp["spenderid"])) {
				shash[exp["spenderid"]] = [];
			}
			shash[exp["spenderid"]].push(exp);
		}
	}
	
	for (var i in JSONDB.jsondb["spenders"]) {
		var spender = JSONDB.jsondb["spenders"][i];
		var spenderid = spender["id"];
		var total = 0;
		var total_ur = 0;

		var row = $("<tr><td class='finance_spendertable'><span class='name'></span><br/><table id='spenderrow_"+spender["id"]+"' class='finance_spenderdetail'></table></td>\n\
			<td class='finance_spendertable hidewhenprinting'><input type='button' value='Mod' onClick='spenders_modify(\""+spender["id"]+"\");'/><input type='button' value='Del' onClick='spenders_remove(\""+spender["id"]+"\");'/></td></tr>");
		row.find(".name").text(spender["name"]);
		$("#spendertable_data").append(row);

		if (shash.hasOwnProperty(spenderid)) {
			for (x in shash[spenderid]) {
				var exp = shash[spenderid][x];
				total = total - parsef(exp["amount"]);
				var rvalue = " *";
				if (exp["reimbersed"] == "1") {
					rvalue = "";
				} else {
					total_ur = total_ur - parsef(exp["amount"]);
				}
				$("#spenderrow_"+spenderid).append("<tr><td class='finance_spenderdetail'>"+exp["description"]+rvalue+"</td><td class='finance_spenderdetail currencycell'>"+fd(0-parsef(exp["amount"]))+"</td></tr>");
			}
		}
		$("#spenderrow_"+spenderid).append("<tr><td class='finance_spenderdetail' colspan='2'>Total: "+fd(total)+" (Not Reimbersed: "+fd(total_ur)+") <input class='hidewhenprinting' type='button' value='Set Fully Reimbersed' onclick=\"spenders_setreimberse('"+spenderid+"');\"/></td></tr>");
	}
}

function spenders_setreimberse(spenderid) {
	$("#modal_areyousure").modal();
	$("#confirm_submit").click(function() {
		var t = {"action":"batchsetreimbersed","params":{"spenderid":spenderid,"elist":[]}};
		for (i in JSONDB.jsondb["expenseitems"]) {
			var exp = JSONDB.jsondb["expenseitems"][i];
			if (exp.hasOwnProperty("spenderid") && exp["spenderid"] != null && exp["spenderid"] == spenderid && exp["reimbersed"] != "1") {
				t["params"]["elist"].push(exp["id"]);
			}
		}
		//try { console.log("rt",t); } catch (e) {}
		JSONDB.dotransaction(t);
		spenders_load();
		$.modal.close();
	});
	return false;
}

function spenders_print() {
	var newwindow = window.open('','_blank','status=1,toolbar=1,location=1,menubar=1,statusbar=1');
	newwindow.document.write('<html><head><title></title>\
			<link rel="stylesheet" type="text/css" href="/assets/printable.css"/>\
			<link rel="stylesheet" type="text/css" media="screen" href="/assets/tablesorter/style.css"/>\
			<script src="/assets/jquery-1.7.1.min.js" type="text/javascript" charset="utf-8"></script>\
			<script src="/assets/jquery.tablesorter.js" type="text/javascript" charset="utf-8"></script>\
			</head><body id="everythingcontainer"><H1 id="reporttitle"></H1></body></html>');
	$("#reporttitle",newwindow.document).text("Spenders");
	$("title",newwindow.document).text("Spenders");
	//$("body",newwindow.document).append("<div>Moo</div>");
	$("#spendertable").clone().appendTo($("body",newwindow.document));
}

function spenders_add() {
	$("#modal_spender").modal();
	$("#modal_spender_savebutton").click(function() {
		var name = $("#modal_spender_name").val();
		if (name != "") {
			var t = {"action":"addspender","params":{"id":JSONDB.generateid(),"name":name}};
			JSONDB.dotransaction(t);
			spenders_load();
			$.modal.close();
		} else {
			alert("No name entered");
		}
	});
	return false;
}

function spenders_remove(spenderid) {
	$("#modal_areyousure").modal();
	$("#confirm_submit").click(function() {
		var t = {"action":"removespender","params":{"id":spenderid}};
		JSONDB.dotransaction(t);
		spenders_load();
		$.modal.close();
	});
	return false;
}

function spenders_modify(spenderid) {
	var spender = JSONDB.jsondb["spenders"][spenderid];
	$("#modal_spender").modal();
	$("#modal_spender_name").val(spender["name"]);
	$("#modal_spender_savebutton").click(function() {
		var name = $("#modal_spender_name").val();
		if (name != "") {
			if (name != spender["name"]) {
				var t = {"action":"modifyspender","params":{"id":spenderid,"name":name}};
				JSONDB.dotransaction(t);
				spenders_load();
			}
			$.modal.close();
		} else {
			alert("No name enterred");
		}
	});
}

function budget_print() {
	var newwindow = window.open('','_blank','status=1,toolbar=1,location=1,menubar=1,statusbar=1');
	newwindow.document.write('<html><head><title></title>\
			<link rel="stylesheet" type="text/css" href="/assets/printable.css"/>\
			<link rel="stylesheet" type="text/css" media="screen" href="/assets/tablesorter/style.css"/>\
			<script src="/assets/jquery-1.7.1.min.js" type="text/javascript" charset="utf-8"></script>\
			<script src="/assets/jquery.tablesorter.js" type="text/javascript" charset="utf-8"></script>\
			</head><body id="everythingcontainer"><H1 id="reporttitle"></H1></body></html>');
	$("#reporttitle",newwindow.document).text("Budget vs Actual Expenses");
	$("title",newwindow.document).text("Budget vs Actual Expenses");
	//$("body",newwindow.document).append("<div>Moo</div>");
	$("#finance_budgettable_head").clone().appendTo($("body",newwindow.document));
}

function budget_load() {
	//$("#finance_budgettable").empty();
	$("tr.baitem").remove();
	budgetedtotal = 0;
	actualtotal = 0;
	
	// Income (Budgeted and actual)
	// - Need to know number of people in each group that has a cost
	// - Need to know actual income versus budgeted (Frame out vouchers versus actually paid)
	
	var vtotal = 0;
	var intotal = 0;
	for (i in JSONDB.jsondb["moneyin"]) {
		var mi = JSONDB.jsondb["moneyin"][i];
		if (mi["isvoucher"] == "1") {
			vtotal = vtotal + parsef(mi["total"]);
		} else {
			intotal = intotal + parsef(mi["total"]);
			for (y in mi["allocation"]) {
				var alloc = mi["allocation"][y];
				if (alloc["type"] == "voucher") {
					vtotal = vtotal - parsef(alloc["amount"]);
				}
			}
		}
	}
	
	actualtotal = actualtotal + intotal;
	$("#finance_budget_totalallocated").text(fd(intotal));
	$("#finance_budget_vouchtotal").text(fd(vtotal));
	
	
	
	
	var gcounthash = {}
	var gacounthash = {}
	var personcount = 0;
	var shopvouchtotal = 0;
	
	for (personid in JSONDB.jsondb["people"]) {
		personcount = personcount + 1;
		var p = JSONDB.jsondb["people"][personid]
		shopvouchtotal = shopvouchtotal + parsef(p["shopvouch"])
		if (p.hasOwnProperty("groupselection")) {
			for (gaid in p["groupselection"]) {
				if (!gacounthash.hasOwnProperty(gaid)) {
					gacounthash[gaid] = 0;
				}
				gacounthash[gaid] = gacounthash[gaid] + 1; 
				var gid = p["groupselection"][gaid]["groupid"];
				if (!gcounthash.hasOwnProperty(gid)) {
					gcounthash[gid] = 0;
				}
				gcounthash[gid] = gcounthash[gid] + 1;
			}
		}
	}
	var totalpeoplecount = personcount;
	
	var bagrouphash = {};
	bagrouphash["other"] = [];
	for (eid in JSONDB.jsondb["expenseitems"]) {
		var exp = JSONDB.jsondb["expenseitems"][eid];
		if (exp.hasOwnProperty("budgetareaid") && JSONDB.jsondb.hasOwnProperty("budgetitems") && JSONDB.jsondb["budgetitems"].hasOwnProperty(exp["budgetareaid"])) {
			var baid = exp["budgetareaid"];
			if (!bagrouphash.hasOwnProperty(baid)) {
				bagrouphash[baid] = [];
			}
			bagrouphash[baid].push(exp);
		} else {
			bagrouphash["other"].push(exp);
		}
	}
	
	$("#finance_budget_expectedincome").empty();
	var expectedtotal = 0;
	if (JSONDB.jsondb.hasOwnProperty("groupareas") && JSONDB.jsondb["groupareas"].hasOwnProperty("orderarray")) {
		for (i in JSONDB.jsondb["groupareas"]["orderarray"]) {
			var gaid = JSONDB.jsondb["groupareas"]["orderarray"][i];
			var ga = JSONDB.jsondb["groupareas"][gaid];
			for (x in ga["groupordering"]) {
				var gid = ga["groupordering"][x];
				var g = ga["groups"][gid];
				if (parsef(g["modifier"]) > 0) {
					//$("#finance_budget_expectedincome").append
					var row = $("<tr>\
							<td class='grouparea'></td>\
							<td class='group'></td>\
							<td class='count'></td>\
							<td class='total currencycell'></td>\
						</tr>");
					//$("#finance_budget_expectedincome > tr:last > td.grouparea").text(ga["label"]);
					row.children(".grouparea").text(ga["label"]);
					//$("#finance_budget_expectedincome > tr:last > td.group").text(g["label"]);
					row.children(".group").text(g["label"]);
					var thiscount = 0;
					if (gcounthash.hasOwnProperty(gid)) {
						thiscount = gcounthash[gid];
					}
					var thistotal = thiscount * parsef(g["modifier"]);
					expectedtotal = expectedtotal + thistotal;
					//$("#finance_budget_expectedincome > tr:last > td.count").text(thiscount);
					row.children(".count").text(thiscount);
					//$("#finance_budget_expectedincome > tr:last > td.total").text(fd(thistotal));
					row.children(".total").text(fd(thistotal));
					$("#finance_budget_expectedincome").append(row);
				}
			}
		}
	}
	$("#finance_budget_totalexpected").text(fd(expectedtotal));
	budgetedtotal = budgetedtotal + expectedtotal;
	
	if (settings_get("useshop") == "yes") {
		var row = $("<tr class='baitem'>\
				<td class='barow'>Total Vouched Shop Income</td>\
				<td class='barow currencycell vouchtotal'></td>\
				<td class='barow'></td>\
			</tr>");
		row.children(".vouchtotal").text(fd(shopvouchtotal));
		$("#finance_budgettable").append(row);
		budgetedtotal = budgetedtotal + shopvouchtotal;
	}
	
	for (i in JSONDB.jsondb["budgetitems"]) {
		var bi = JSONDB.jsondb["budgetitems"][i];
		var biid = bi["id"]

		var budgetedamount = fd(parsef(bi["budgetedamount"]));
		var extra = "";
		if (bi["perpersonfilter"] != null && bi["perpersonfilter"] != "") {
			if (bi["perpersonfilter"] == "all") {
				budgetedamount = "<i>("+totalpeoplecount+"x"+fd(parsef(bi["budgetedamount"]))+")</i> "+fd(parsef(bi["budgetedamount"] * totalpeoplecount));
				budgetedtotal = budgetedtotal + (parsef(bi["budgetedamount"])*totalpeoplecount);
			} else if (bi["perpersonfilter"].substring(0,2) == "g:") {
				var groupid = bi["perpersonfilter"].substring(2);
				if (!gcounthash.hasOwnProperty(groupid)) {
					gcounthash[groupid] = 0;
				}
				budgetedamount = "<i>("+gcounthash[groupid]+"x"+fd(parsef(bi["budgetedamount"]))+")</i> "+fd(parsef(gcounthash[groupid])*parsef(bi["budgetedamount"]));
				budgetedtotal = budgetedtotal + (parsef(bi["budgetedamount"])*parsef(gcounthash[groupid]));
			} else if (bi["perpersonfilter"].substring(0,2) == "b:") {
				var gaid = bi["perpersonfilter"].substring(2);
				if (!gacounthash.hasOwnProperty(gaid)) {
					gacounthash[gaid] = 0;
				}
				budgetedamount = "<i>("+gacounthash[gaid]+"x"+fd(parsef(bi["budgetedamount"]))+")</i> "+fd(parsef(gacounthash[gaid])*parsef(bi["budgetedamount"]));
				budgetedtotal = budgetedtotal + (parsef(bi["budgetedamount"])*parsef(gacounthash[gaid]));
			}
		} else {
			budgetedtotal = budgetedtotal + parsef(bi["budgetedamount"]);
		}
			
		$("#finance_budgettable").append("<tr class='baitem'>\n\
			<td class='barow'>"+bi["description"]+"<br/><table id='budgetarea_"+biid+"' class='budget_subtable'></table></td>\n\
			<td class='barow currencycell'>"+budgetedamount+"</td>\n\
			<td class='barow currencycell' id='budgetarea_"+biid+"_total'></td>\n\
			<td class='hidewhenprinting'><input type='button' value='Mod' onClick='budget_modifybudgetitem(\""+biid+"\");' class='hidewhenprinting'/></td>\n\
			<td class='hidewhenprinting'><input type='button' value='Del' onClick='budget_removebudgetitem(\""+biid+"\");' class='hidewhenprinting'/></td></tr>");
		
		$("#budgetarea_"+biid).empty();
		var budgetareatotal = 0;
		for (i in bagrouphash[biid]) {
			var exp = bagrouphash[biid][i];
			var taxstring = "";
			if (parsef(exp["tax"]) > 0) {
				taxstring = " ("+fd(parsef(exp["tax"]))+" HST)";
			}
			actualtotal = actualtotal + parsef(exp["amount"]);
			$("#budgetarea_"+biid).append("<tr>\n\
				<td class='barow'>"+exp["description"]+taxstring+"</td>\n\
				<td class='barow currencycell'>"+fd(parsef(exp["amount"]))+"</td>\n\
				<td class='hidewhenprinting'><input type='button' value='Mod' onClick='budget_modifyexpenseitem(\""+exp["id"]+"\");' class='hidewhenprinting'/></td>\n\
				<td class='hidewhenprinting'><input type='button' value='Del' onClick='budget_removeexpenseitem(\""+exp["id"]+"\");' class='hidewhenprinting'/></td></tr>");
			budgetareatotal = budgetareatotal + parsef(exp["amount"]);
		}
		$("#budgetarea_"+biid+"_total").text(fd(budgetareatotal));
	}
	for (i in bagrouphash["other"]) {
		var exp = bagrouphash["other"][i];
		var taxstring = "";
		if (parsef(exp["tax"]) > 0) {
			taxstring = " ("+fd(parsef(exp["tax"]))+" HST)";
		}
		actualtotal = actualtotal + parsef(exp["amount"]);
		$("#finance_budgettable").append("<tr id='finance_budgettable_si_"+exp["id"]+"' class='baitem'>\n\
				<td class='barow'>"+exp["description"]+taxstring+"</td>\n\
				<td class='barow currencycell'></td>\n\
				<td class='barow currencycell'>"+fd(parsef(exp["amount"]))+"</td>\n\
				<td class='hidewhenprinting'><input type='button' value='Mod' onClick='budget_modifyexpenseitem(\""+exp["id"]+"\");'/></td>\n\
				<td class='hidewhenprinting'><input type='button' value='Del' onClick='budget_removeexpenseitem(\""+exp["id"]+"\");'/></td></tr>");
	}
	
	
	$("#batotal").remove();
	$("#finance_budgettable").append("<tr id='batotal'>\n\
		<td class='barow alignright'>Total:</td>\n\
		<td class='barow currencycell'>"+fd(budgetedtotal)+"</td>\n\
		<td class='barow currencycell'>"+fd(actualtotal)+"</td>\n\
	</tr>");
}

function budget_showbudgetinterface() {
	$("#modal_budgetitem").modal();
	$("#modal_budgetitem_perpersongroup").append($("<option></option>").attr("value","all").text("All People"));
	
	if (JSONDB.jsondb.hasOwnProperty("groupareas") && JSONDB.jsondb["groupareas"].hasOwnProperty("orderarray")) {
		for (i in JSONDB.jsondb["groupareas"]["orderarray"]) {
			var gaid = JSONDB.jsondb["groupareas"]["orderarray"][i];
			var ga = JSONDB.jsondb["groupareas"][gaid];
			$("#modal_budgetitem_perpersongroup").append($("<option></option>").attr("value","b:"+gaid).text(ga["label"])); 
			if (ga.hasOwnProperty("groupordering")) {
				for (y in ga["groupordering"]) {
					var gid = ga["groupordering"][y];
					var g = ga["groups"][gid];
					$("#modal_budgetitem_perpersongroup").append($("<option></option>").attr("value","g:"+gid).html("&nbsp;&nbsp;&nbsp;&nbsp;"+g["label"]));
				}
			}
		}
	}
}

function budget_addbudgetitem() {
	budget_showbudgetinterface();
	
	$("#modal_budgetitem_savebutton").click(function() {
		var description = $("#modal_budgetitem_description").val();
		var amount = parsef($("#modal_budgetitem_amount").val());
		var perpersonamount = parsef($("#modal_budgetitem_perperson").val());
		var perpersonfilter = "";
		
		var finalamount = amount;
		if (perpersonamount != 0) {
			finalamount = perpersonamount;
			perpersonfilter = $("#modal_budgetitem_perpersongroup").val();
		}
		
		if (description != "") {
			var budgetitemid = JSONDB.generateid();
			var t = {"action":"addbudgetitem","params":{"id":budgetitemid,"description":description,"budgetedamount":finalamount,"perpersonfilter":perpersonfilter}};
			JSONDB.dotransaction(t);
			budget_load();
			$.modal.close();
		} else {
			alert("No description entered");
		}
	});
}

function budget_modifybudgetitem(budgetitemid) {
	var bi = JSONDB.jsondb["budgetitems"][budgetitemid];
	budget_showbudgetinterface();
	$("#modal_budgetitem_perpersongroup").val(bi["perpersonfilter"]);
	$("#modal_budgetitem_description").val(bi["description"]);
	if (bi["perpersonfilter"] != null && bi["perpersonfilter"] != "") {
		$("#modal_budgetitem_amount").val("0.00");	
		$("#modal_budgetitem_perperson").val(bi["budgetedamount"]);
	} else {
		$("#modal_budgetitem_amount").val(bi["budgetedamount"]);
		$("#modal_budgetitem_perperson").val("0.00");
	}
	
	$("#modal_budgetitem_savebutton").click(function() {
		var t = {"action":"modifybudgetitem","params":{"id":budgetitemid}};
		var desc = $("#modal_budgetitem_description").val();
		var perpersonamount = parsef($("#modal_budgetitem_perperson").val());
		var perpersonfilter = "";
		var finalamount = parsef($("#modal_budgetitem_amount").val());
		if (perpersonamount != 0) {
			finalamount = perpersonamount;
			perpersonfilter = $("#modal_budgetitem_perpersongroup").val();
		}
		if (desc != "") {
			if (bi["perpersonfilter"] != perpersonfilter) {
				t["params"]["perpersonfilter"] = perpersonfilter;
			}
			if (desc != bi["description"]) {
				t["params"]["description"] = desc;
			}
			if (bi["budgetedamount"] != finalamount) {
				t["params"]["budgetedamount"] = finalamount;
			}
			JSONDB.dotransaction(t);
			budget_load();
			$.modal.close();
		} else {
			alert("No Description enterred");
		}
	});
}

function budget_removebudgetitem(budgetitemid) {
	$("#modal_areyousure").modal();
	$("#confirm_submit").click(function() {
		var t = {"action":"removebudgetitem","params":{"id":budgetitemid}};
		JSONDB.dotransaction(t);
		budget_load();
		$.modal.close();
	});
	return false;
}

function budget_showexpenseinterface() {
	$("#modal_expenseitem").modal();
	$("#modal_expenseitem_spenderid").empty();
	$("#modal_expenseitem_spenderid").append("<option value=''>No Spender Selected</option>");
	for (i in JSONDB.jsondb["spenders"]) {
		var s = JSONDB.jsondb["spenders"][i];
		//$("#modal_expenseitem_spenderid").append("<option value='"+i+"'>"+s["name"]+"</option>");
		$("#modal_expenseitem_spenderid").append($("<option></option>").attr("value",i).text(s["name"]));
	}
	$("#modal_expenseitem_budgetareaid").empty();
	$("#modal_expenseitem_budgetareaid").append("<option value=''>No Budget Area</option>");
	for (i in JSONDB.jsondb["budgetitems"]) {
		var ba = JSONDB.jsondb["budgetitems"][i];
		//$("#modal_expenseitem_budgetareaid").append("<option value='"+i+"'>"+ba["description"]+"</option>");
		$("#modal_expenseitem_budgetareaid").append($("<option></option>").attr("value",i).text(ba["description"]));
	}
}

function budget_addexpenseitem() {
	budget_showexpenseinterface();
	
	$("#modal_expenseitem_savebutton").click(function() {
		var description = $("#modal_expenseitem_description").val();
		var spenderid = $("#modal_expenseitem_spenderid").val();
		var amount = parsef($("#modal_expenseitem_amount").val());
		var isreimbersed = "0";
		var budgetareaid = $("#modal_expenseitem_budgetareaid").val();
		var tax = $("#modal_expenseitem_tax").val();
		if ($("#modal_expenseitem_isreimbersed").is(':checked')) {
			isreimbersed = "1";
		}
		if (description == "") {
			alert("No description given");
		} else {
			var expenseid = JSONDB.generateid();
			var t = {"action":"addexpenseitem","params":{"id":expenseid,"description":description,"amount":amount,"spenderid":spenderid,"reimbersed":isreimbersed,"budgetareaid":budgetareaid,"tax":tax}};
			JSONDB.dotransaction(t);
			budget_load();
			$.modal.close();
		}
	});
}

function budget_removeexpenseitem(expenseitemid) {
	$("#modal_areyousure").modal();
	$("#confirm_submit").click(function() {
		var t = {"action":"removeexpenseitem","params":{"id":expenseitemid}};
		JSONDB.dotransaction(t);
		budget_load();
		$.modal.close();
	});
	return false;
}

function budget_modifyexpenseitem(expenseitemid) {
	var exp = JSONDB.jsondb["expenseitems"][expenseitemid];
	budget_showexpenseinterface();
	$("#modal_expenseitem_budgetareaid").val(exp["budgetareaid"]);
	$("#modal_expenseitem_spenderid").val(exp["spenderid"]);
	$("#modal_expenseitem_description").val(exp["description"]);
	$("#modal_expenseitem_amount").val(exp["amount"]);
	$("#modal_expenseitem_tax").val(exp["tax"]);
	if (exp["reimbersed"] == "1") {
		$("#modal_expenseitem_isreimbersed").attr('checked',true);
	}
	$("#modal_expenseitem_savebutton").click(function() {
		var description = $("#modal_expenseitem_description").val();
		var spenderid = $("#modal_expenseitem_spenderid").val();
		var amount = $("#modal_expenseitem_amount").val();
		var tax = $("#modal_expenseitem_tax").val();
		var isreimbersed = "0";
		if ($("#modal_expenseitem_isreimbersed").is(':checked')) {
			isreimbersed = "1";
		}
		var budgetareaid = $("#modal_expenseitem_budgetareaid").val();
		if (description == "") {
			alert("No description given");
		} else {
			var t = {"action":"modifyexpenseitem","params":{"id":expenseitemid}};
			if (tax != exp["tax"]) {
				t["params"]["tax"] = tax;
			}
			if (description != exp["description"]) {
				t["params"]["description"] = description;
			}
			if (spenderid != exp["spenderid"]) {
				t["params"]["spenderid"] = spenderid;
			}
			if (parsef(amount) != exp["amount"]) {
				t["params"]["amount"] = parsef(amount);
			}
			if (isreimbersed != exp["reimbersed"]) {
				t["params"]["reimbersed"] = isreimbersed;
			}
			if (budgetareaid != exp["budgetareaid"]) {
				t["params"]["budgetareaid"] = budgetareaid;
			}
			JSONDB.dotransaction(t);
			budget_load();
			$.modal.close();
		}
	});
}


function spenders_hstreport() {
	var newwindow = window.open('','_blank','status=1,toolbar=1,location=1,menubar=1,statusbar=1');
	newwindow.document.write('<html><head><title>Report</title><link rel="stylesheet" type="text/css" href="/assets/printable.css"/></head><body></body></html>');
	
	$("body",newwindow.document).html("<H1>HST Report</H1><br/><table><thead><tr><th>Spender</th><th>Item</th><th>Budget Area</th><th>Net</th><th>Tax</th><th>Amount</th></tr></thead><tbody id='reporttable'></tbody></table>");
	
	var amounttotal = 0.00;
	var taxtotal = 0.00;
	for (i in JSONDB.jsondb["expenseitems"]) {
		var exp = JSONDB.jsondb["expenseitems"][i];
		amounttotal = amounttotal + (0 - parsef(exp["amount"]));
		taxtotal = taxtotal + parsef(exp["tax"]);
		var spendername = "N/A";
		try {
			spendername = JSONDB.jsondb["spenders"][exp["spenderid"]]["name"];
		} catch (e2) {}
		var budgetareaname = "N/A";
		try {
			budgetareaname = JSONDB.jsondb["budgetitems"][exp["budgetareaid"]]["description"]
		} catch (e2) {}
		var row = $("<tr>\
			<td class='name'></td>\
			<td class='description'></td>\
			<td class='baname'></td>\
			<td class='pretax currencycell'></td>\
			<td class='tax currencycell'></td>\
			<td class='total currencycell'></td>\
		</tr>");
		row.children(".name").text(spendername);
		row.children(".description").text(exp["description"]);
		row.children(".baname").text(budgetareaname);
		row.children(".pretax").text(fd(0-parsef(exp["amount"])-parsef(exp["tax"])));
		row.children(".tax").text(fd(parsef(exp["tax"])));
		row.children(".total").text(fd(0-parsef(exp["amount"])));
		
		$("#reporttable",newwindow.document).append(row);
	}
	var totalrow = $("<tr><td colspan='3'>Total:</td><td class='pretaxtotal currencycell'></td><td class='taxtotal currencycell'></td><td class='total currencycell'></td></tr>");
	totalrow.children(".pretaxtotal").text(fd(amounttotal - taxtotal));
	totalrow.children(".taxtotal").text(fd(taxtotal));
	totalrow.children(".total").text(fd(amounttotal));
	
	//$("#reporttable",newwindow.document).append("<tr><td colspan='3'>Total:</td><td class='currencycell'>"+fd(amounttotal - taxtotal)+"</td><td class='currencycell'>"+fd(taxtotal)+"</td><td class='currencycell'>"+fd(amounttotal)+"</td></tr>");
	$("#reporttable",newwindow.document).append(totalrow);
}

function matrix_moveleft() {
	var sourceval = $("#matrixchooser_right").val();
	if (sourceval != null && sourceval != "") {
		$("#matrixchooser_right option[value=\""+sourceval+"\"]").remove();
	}
}

function matrix_moveright() {
	//try { console.log("Move Right"); } catch (e) {}
	var sourceval = $("#matrixchooser_left").val();
	if (sourceval != null && sourceval != "") {
		var found = false;
		$("#matrixchooser_right option").each(function() {
			if ($(this).val() == sourceval) {
				found = true;
			}
		});
		var label = $("#matrixchooser_left option[value=\""+sourceval+"\"]").text();
		if (!found) {
			//$("#matrixchooser_right").append("<option value='"+sourceval+"'>"+label+"</option>");
			$("#matrixchooser_right").append($("<option></option>").attr("value",sourceval).text(label));
		}
	}
}

function matrix_moveup() {
	var sourceval = $("#matrixchooser_right").val();
	if (sourceval != null && sourceval != "") {
		var selectedOption = $("#matrixchooser_right option[value=\""+sourceval+"\"]");
		var prev = $(selectedOption).prev();
		$(selectedOption).insertBefore(prev);
	}
}

function matrix_movedown() {
	var sourceval = $("#matrixchooser_right").val();
	if (sourceval != null && sourceval != "") {
		var selectedOption = $("#matrixchooser_right option[value=\""+sourceval+"\"]");
		var next = $(selectedOption).next();
		$(selectedOption).insertAfter(next);
	}
}

function matrix_load() {
	$("#matrixchooser_right").empty();
	$("#matrixchooser_left").empty();
	$("#matrixchooser_left").append("<option value='age'>Age</option>");
	$("#matrixchooser_left").append("<option value='gender'>Gender</option>");
	$("#matrixchooser_left").append("<option value='affiliation'>Affiliation</option>");
	if (JSONDB.jsondb.hasOwnProperty("groupareas") && JSONDB.jsondb["groupareas"].hasOwnProperty("orderarray")) {
		for (i in JSONDB.jsondb["groupareas"]["orderarray"]) {
			var gaid = JSONDB.jsondb["groupareas"]["orderarray"][i];
			var ga = JSONDB.jsondb["groupareas"][gaid];
			//$("#matrixchooser_left").append("<option value='"+gaid+"'>"+ga["label"]+"</option>");
			$("#matrixchooser_left").append($("<option></option>").attr("value",gaid).text(ga["label"]));
		}
	}
}

function matrix_runreport() {
	$("#matrixtable tbody").empty();
	$("#matrixtable thead").empty();
	var reportdata = {};
	var treelist = new Array();
	var sourceval = $("#matrixchooser_right option").each(function() {
		treelist.push($(this).val());
	});
	var reporttype = $("input:radio[name=matrix_datatype]:checked").val();
	
	for (i in JSONDB.jsondb["people"]) {
		var personid = i;
		var person = JSONDB.jsondb["people"][personid];
		
		var max = treelist.length - 1;
		var currentlevel = reportdata;
		for (x in treelist) {
			var keyval = "";
			if (treelist[x] == "age") {
				keyval = getage(parsedate(person["birthdate"]));
			} else if (treelist[x] == "gender") {
				keyval = person["gender"];
			} else if (treelist[x] == "affiliation") {
				keyval = report_getaffiliationname(person["affiliation"]);
			} else {
				try {
					var gid = person["groupselection"][treelist[x]]["groupid"];
					keyval = JSONDB.jsondb["groupareas"][treelist[x]]["groups"][gid]["label"];	
				} catch (e2) {}
			}
			if (keyval == "") {
				keyval = "Unknown";
			}
			
			if (!currentlevel.hasOwnProperty(keyval)) {
				currentlevel[keyval] = {}
			}
			currentlevel = currentlevel[keyval];
			
			if (x >= max) {
				currentlevel[personid] = person;
			}
		}
	}
	//try { console.log("data ",reportdata); } catch (e) {}
	
	function displaynode(node,filler,level) {
		if (level >= treelist.length) {
			var thevalue = "";
			var thecount = 0;
			for (i in node) {
				if (thecount > 0) {
					thevalue = thevalue + ", ";
				}
				thevalue = thevalue + node[i]["firstname"]+" "+node[i]["lastname"];
				thecount = thecount + 1
			}
			if (reporttype == "count") {
				thevalue = thecount;
			}
			
			//$("#matrixtable tbody").append("<tr>"+filler+"<td class='matrixcell'>"+thevalue+"</td></tr>");
			filler.append($("<td class='matrixcell'></td>").text(thevalue));
			$("#matrixtable tbody").append(filler);
		} else {
			for (i in node) {
				//displaynode(node[i],filler+"<td class='matrixcell'>"+i+"</td>",level + 1);	
				displaynode(node[i],filler.clone().append($("<td class='matrixcell'></td>").text(i)),level + 1);
			}
		}
	}
	
	$("#matrixtable thead").append("<tr></tr>");
	for (x in treelist) {
		var title = "";
		if (treelist[x] == "age") {
			title = "Age";
		} else if (treelist[x] == "gender") {
			title = "Gender"
		} else if (treelist[x] == "affiliation") {
			title = "Affiliation";
		} else {
			title = JSONDB.jsondb["groupareas"][treelist[x]]["label"];
		}
		//$("#matrixtable thead tr").append("<th class='matrixcell'>"+title+"</th>");
		$("#matrixtable thead tr").append($("<th class='matrixcell'></th>").text(title));
	}
	if (reporttype == "count") {
		$("#matrixtable thead tr").append("<th class='matrixcell'>Count</th>");
	} else {
		$("#matrixtable thead tr").append("<th class='matrixcell'>Person List</th>");
	}
	
	//displaynode(reportdata,"",0);
	displaynode(reportdata,$("<tr></tr>"),0);
}

function reports_load() {
	$("#modal_createreport_filter").empty();
	$("#modal_createreport_title").val("");
	$('#modal_createreport_showfooter').attr('checked',false);
	$(".reportitem").remove();
	$("#modal_createreport_filter").append($("<option></option>").attr("value","").text("Everyone (No Filter)"));
	$("#modal_createreport_filter").append($("<option></option>").attr("value","a").text("Affiliations"));
	for (var i in JSONDB.jsondb["affiliation"]) {
		var a = JSONDB.jsondb["affiliation"][i];
		$("#modal_createreport_filter").append($("<option></option>").attr("value","a:"+a["id"]).html("&nbsp;&nbsp;&nbsp;&nbsp;"+a["groupname"])); 
	}
	
	$("#modal_createreport_right").empty();
	$("#modal_createreport_left").empty();
	$("#modal_createreport_left").append($("<option></option>").attr("value","r_firstname").text("First Name"));
	$("#modal_createreport_left").append($("<option></option>").attr("value","r_lastname").text("Last Name"));
	$("#modal_createreport_left").append($("<option></option>").attr("value","r_homephone").text("Home Phone"));
	$("#modal_createreport_left").append($("<option></option>").attr("value","r_mobilephone").text("Mobile Phone"));
	$("#modal_createreport_left").append($("<option></option>").attr("value","r_email").text("Email"));
	$("#modal_createreport_left").append($("<option></option>").attr("value","r_parents_name").text("Parent(s) Name"));
	$("#modal_createreport_left").append($("<option></option>").attr("value","r_parents_phone").text("Parent(s) Phone"));
	$("#modal_createreport_left").append($("<option></option>").attr("value","r_emergencyinfo").text("Emergency Info"));
	$("#modal_createreport_left").append($("<option></option>").attr("value","r_carecard").text("Carecard #"));
	$("#modal_createreport_left").append($("<option></option>").attr("value","r_birthdate").text("Birthdate (m/d/y)"));
	$("#modal_createreport_left").append($("<option></option>").attr("value","c_age").text("Age"));
	$("#modal_createreport_left").append($("<option></option>").attr("value","r_gender").text("Gender"));
	$("#modal_createreport_left").append($("<option></option>").attr("value","c_address").text("Address"));
	$("#modal_createreport_left").append($("<option></option>").attr("value","c_affiliation").text("Affiliation"));
	$("#modal_createreport_left").append($("<option></option>").attr("value","c_membership").text("Membership Summary"));
	$("#modal_createreport_left").append($("<option></option>").attr("value","r_comments").text("Comments"));
	$("#modal_createreport_left").append($("<option></option>").attr("value","c_shopamount").text("Shop Vouch Amount"));
	$("#modal_createreport_left").append($("<option></option>").attr("value","c_cost").text("Total Cost"));
	$("#modal_createreport_left").append($("<option></option>").attr("value","r_signedin").text("Signed-in Status"));
	$("#modal_createreport_left").append($("<option></option>").attr("value","c_regstamp").text("Registration Stamp"));
	$("#modal_createreport_left").append($("<option></option>").attr("value","c_paid").text("Total Paid"));
	$("#modal_createreport_left").append($("<option></option>").attr("value","c_owing").text("Total Owing"));
	$("#modal_createreport_left").append($("<option></option>").attr("value","c_shopspent").text("Total Shop Spent"));

	if (JSONDB.jsondb.hasOwnProperty("settings") && JSONDB.jsondb["settings"].hasOwnProperty("customordering")) {
		for (var i in JSONDB.jsondb["settings"]["customordering"]) {
			var cfid = JSONDB.jsondb["settings"]["customordering"][i];
			var cf = JSONDB.jsondb["settings"]["customfields"][cfid];
			$("#modal_createreport_left").append($("<option></option>").attr("value","v_"+cfid).text(cf["fieldname"]));
		}
	}

	if (JSONDB.jsondb.hasOwnProperty("groupareas") && JSONDB.jsondb["groupareas"].hasOwnProperty("orderarray")) {
		for (i in JSONDB.jsondb["groupareas"]["orderarray"]) {
			var gaid = JSONDB.jsondb["groupareas"]["orderarray"][i];
			var ga = JSONDB.jsondb["groupareas"][gaid];
			$("#modal_createreport_filter").append($("<option></option>").attr("value","b:"+gaid).text(ga["label"])); 
			$("#modal_createreport_left").append($("<option></option>").attr("value","a_"+gaid).text("Membership: "+ga["label"]));

			for (var y in ga["groupordering"]) {
				var gid = ga["groupordering"][y];
				var g = ga["groups"][gid];
				//report_personreport(\"group\",\""+group["rowid"]+"\")
				$("#modal_createreport_filter").append($("<option></option>").attr("value","g:"+gaid+","+gid).html("&nbsp;&nbsp;&nbsp;&nbsp;"+g["label"])); 
			}

			$("#modal_createreport_filter").append($("<option></option>").attr("value","c:"+gaid).html("&nbsp;&nbsp;&nbsp;&nbsp;Not Assigned")); 
		}
	}
	
	
	$("#savedreports tbody").empty();
	for (i in JSONDB.jsondb["reports"]) {
		var r = JSONDB.jsondb["reports"][i];
		var row = $("<tr></tr>")
		row.append($("<td></td>").text(r["title"]))
		row.append($("<td><input type='button' value='Load' onClick='reports_view(\""+r["id"]+"\");'/></td>"))
		row.append($("<td><input type='button' value='Del' onClick='reports_delete(\""+r["id"]+"\");'/></td>"))
		$("#savedreports tbody").append(row);
	}
}

function reports_save() {
	var reporttitle = $("#modal_createreport_title").val();
	if (reporttitle != "") {
		//try { console.log("Title is blank"); } catch (e) {}
		var t = {"action":"addreport","params":{"id":JSONDB.generateid()}};
		t["params"]["title"] = reporttitle;
		var showfooter = "0"; if ($("#modal_createreport_showfooter").is(':checked')) { showfooter = "1"; }
		t["params"]["showfooter"] = showfooter;
		var fieldlist = new Array();
		var sourceval = $("#modal_createreport_right option").each(function() {
			var theval = $(this).val();
			var preval = theval.substring(0,1);
			var fid = theval.substring(2);
			fieldlist.push({"id":fid,"label":$(this).text(),"type":preval});
		});
		t["params"]["fieldlist"] = fieldlist;
		var filterselection = $("#modal_createreport_filter").val();
		t["params"]["filter"] = filterselection;
		//try { console.log("save transaction ",t); } catch (e) {}
		JSONDB.dotransaction(t);
		reports_load();
	}
}

function reports_delete(reportid) {
	$("#modal_areyousure").modal();
	$("#confirm_submit").click(function() {
		var t = {"action":"removereport","params":{"id":reportid}};
		JSONDB.dotransaction(t);
		reports_load();
		$.modal.close();
	});
	return false;
}

function reports_view(reportid) {
	var r = JSONDB.jsondb["reports"][reportid];
	$("#modal_createreport_title").val(r["title"]);
	$("#modal_createreport_filter").val(r["filter"]);
	$('#modal_createreport_showfooter').attr('checked',false);
	if (r["showfooter"] == "1") {
		$('#modal_createreport_showfooter').attr('checked',true);
	}
	$("#modal_createreport_right").empty();
	for (i in r["fieldlist"]) {
		var f = r["fieldlist"][i];
		$("#modal_createreport_right").append($("<option></option>").attr("value",f["type"]+"_"+f["id"]).text(f["label"]))
	}
}

function reports_run() {
	var newwindow = window.open('','_blank','status=1,toolbar=1,location=1,menubar=1,statusbar=1');
	var reporttitle = $("#modal_createreport_title").val();
	if (reporttitle == "") {
		reporttitle = "Report";
	}
	
	var showfooter = "0"; if ($("#modal_createreport_showfooter").is(':checked')) { showfooter = "1"; }
	
	var fieldlist = new Array();
	var sourceval = $("#modal_createreport_right option").each(function() {
		var theval = $(this).val();
		var preval = theval.substring(0,1);
		var fid = theval.substring(2);
		fieldlist.push({"id":fid,"label":$(this).text(),"type":preval});
	});
	//try { console.log("fieldlist ",fieldlist); } catch (e) {}
	//newwindow.document.write('<html><head><title></title><link rel="stylesheet" type="text/css" href="/assets/printable.css"/><link rel="stylesheet" type="text/css" media="screen" href="/assets/tablesorter/style.css"/><script src="/assets/jquery-1.7.1.min.js" type="text/javascript" charset="utf-8"></script><script src="/assets/jquery.tablesorter.js" type="text/javascript" charset="utf-8"></script></head><body id="everythingcontainer"><h1 id="reporttitle"></h1></body></html>');
	newwindow.document.write('<html><head><title></title></head><body id="everythingcontainer"><h1 id="reporttitle"></h1></body></html>');
	$("#reporttitle",newwindow.document).text(reporttitle);
	$("title",newwindow.document).text(reporttitle);
	$("head",newwindow.document).append('<link rel="stylesheet" type="text/css" href="/assets/printable.css" media="print">');
	$("head",newwindow.document).append('<link rel="stylesheet" type="text/css" href="/assets/tablesorter/style.css" media="screen">');

	var phash = {};
	for (i in JSONDB.jsondb["moneyin"]) {
		var m = JSONDB.jsondb["moneyin"][i];
		for (x in m["allocation"]) {
			var aitem = m["allocation"][x];
			if (aitem["type"] == "person") {
				if (!phash.hasOwnProperty(aitem["refid"])) {
					phash[aitem["refid"]] = 0;
				}
				phash[aitem["refid"]] = phash[aitem["refid"]] + parsef(aitem["amount"]);
			}
		}
	}
	
	function reports_reportlist(plist,target) {
		var total_shopspent = 0;
		var total_paid = 0;
		var total_cost = 0;
		var total_owing = 0;
		var total_shopamount = 0;
		
		for (i in plist) {
			var p = JSONDB.jsondb["people"][plist[i]];
			var therow = $("<tr></tr>");

			var thiscost = 0;
			for (x in p["groupselection"]) {
				thiscost = thiscost + report_getgroupcost(x,p["groupselection"][x]["groupid"]);
			}
			try {
				thiscost = thiscost + parsef(p["shopvouch"]);
			} catch (e) {}
			
			var thispaid = parsef(phash[p["id"]]);
			var balance = thiscost - thispaid;
			
			for (x in fieldlist) {
				var f = fieldlist[x];
				var thevalue = "";
				
				if (f["type"] == "r") {
					thevalue = p[f["id"]];
				} else if (f["type"] == "v") {
					thevalue = "&nbsp;"; 
					try {
						thevalue = p["customfields"][f["id"]];
					} catch (e2) {}
				} else if (f["type"] == "a") {
					try {
						thevalue = JSONDB.jsondb["groupareas"][f["id"]]["groups"][p["groupselection"][f["id"]]["groupid"]]["label"]
					} catch (e2) {}
				} else if (f["type"] == "c") {
					thevalue = "";
					if (f["id"] == "age") {
						thevalue = getage(parsedate(p["birthdate"])); 
					} else if (f["id"] == "regstamp") {
						if (p["registrationid"] == "" || p["registrationid"] == 0) {
							thevalue = "N/A"
						} else {
							var regrecord = JSONDB.jsondb["registrations"][p["registrationid"]];
							thevalue = regrecord.submitstamp;
						}
					} else if (f["id"] == "address") {
						thevalue = p["address_street"]+", "+p["address_city"]+", "+p["address_postal"];
					} else if (f["id"] == "affiliation") {
						thevalue = report_getaffiliationname(p["affiliation"])
					} else if (f["id"] == "membership") {
						try {
							var mlist = [];
							for (y in p["groupselection"]) {
								try {
									var gaid = y;
									var gid = p["groupselection"][gaid]["groupid"];
									var isleader = p["groupselection"][gaid]["isleader"];
									var leadertext = "";
									if (isleader) {
										leadertext = "*";
									}
									var ganame = JSONDB.jsondb["groupareas"][gaid]["label"];
									var gname = JSONDB.jsondb["groupareas"][gaid]["groups"][gid]["label"];
									mlist.push(ganame+": "+gname+leadertext);
								} catch (e3) {
									//try { console.error("field error ",e3); } catch (e) {}
								}
							}
							thevalue = mlist.join(", ");
						} catch (e2) {}
					} else if (f["id"] == "shopamount") {
						thevalue = fd(parsef(p["shopvouch"]));
						total_shopamount = total_shopamount + parsef(p["shopvouch"]); 
					} else if (f["id"] == "cost") {
						//report_getgroupcost(groupareaid,groupid)
						thevalue = fd(thiscost);
						total_cost = total_cost + thiscost;
					} else if (f["id"] == "paid") {
						thevalue = fd(thispaid);
						total_paid = total_paid + thispaid;
					} else if (f["id"] == "owing") {
						thevalue = fd(balance);
						total_owing = total_owing + balance;
					} else if (f["id"] == "shopspent") {
						var shopspent = 0;
						try {
							for (i in p["shopspend"]) {
								try {
									shopspent = shopspent + parsef(p["shopspend"][i]["spend"])
								} catch (e3) {}
							}
						} catch (e) {}
						thevalue = fd(shopspent);
						total_shopspent = total_shopspent+shopspent;
					}
				}
				therow.append($("<td></td>").text(thevalue))	
			}
			target.append(therow);
		}
		if (showfooter == "1") {
			var footrow1 = $("<tr></tr>");
			for (x in fieldlist) {
				var f = fieldlist[x];
				if (f["type"] == "c") {
					var thevalue = "0";
					if (f["id"] == "shopspent") {
						thevalue = fd(total_shopspent);
					} else if (f["id"] == "regstamp") {
						thevalue = "";
					} else if (f["id"] == "paid") {
						thevalue = fd(total_paid);
					} else if (f["id"] == "cost") {
						thevalue = fd(total_cost);
					} else if (f["id"] == "owing") {
						thevalue = fd(total_owing);
					} else if (f["id"] == "shopamount") {
						thevalue = fd(total_shopamount);
					}
					footrow1.append($("<td></td>").text(thevalue));
				} else {
					footrow1.append("<td></td>");
				}
			}
			target.children("tfoot").append(footrow1);
			var footrow2 = $("<tr><td colspan='3'>Total People: "+plist.length+"</td></tr>");
			target.children("tfoot").append(footrow2);
		}
	}
	
	var filterselection = $("#modal_createreport_filter").val();
	var tablehtml = "<table class='cr_table tablesorter' id='reporttable'><thead class='cr_table'><tr class='cr_header'></tr></thead><tbody class='cr_table'></tbody><tfoot></tfoot></table>" 
	if (filterselection == "") { // All people, single report
		$("body",newwindow.document).append("<H1>Everyone</H1>");
		$("body",newwindow.document).append(tablehtml);

		var newlist = [];
		for (i in JSONDB.jsondb["people"]) {
			newlist.push(i);
		}
		reports_reportlist(newlist,$("body table.cr_table:last",newwindow.document));
	} else if (filterselection.substring(0,2) == "a:") { // Association group
		var itemid = filterselection.substring(2);
		//$("body",newwindow.document).append("<H1>"+report_getaffiliationname(itemid)+"</H1>");
		$("body",newwindow.document).append($("<H1></H1>").text(report_getaffiliationname(itemid)));
		$("body",newwindow.document).append(tablehtml);
		
		var newlist = []
		for (i in JSONDB.jsondb["people"]) {
			var p = JSONDB.jsondb["people"][i];
			if (p["affiliation"] == itemid) {
				newlist.push(p["id"]);
			}
		}
		
		reports_reportlist(newlist,$("body table.cr_table:last",newwindow.document));
	} else if (filterselection.substring(0,1) == "a") { // All affiliation groups (group print)
		var ahash = {};
		for (i in JSONDB.jsondb["people"]) {
			var p = JSONDB.jsondb["people"][i];
			if (p.hasOwnProperty("affiliation") && p["affiliation"] != "") {
				var aid = p["affiliation"]
				if (!ahash.hasOwnProperty(aid)) {
					ahash[aid] = [];
				}
				ahash[aid].push(p["id"]);
			}
		}
		
		for (var z in JSONDB.jsondb["affiliation"]) {
			var a = JSONDB.jsondb["affiliation"][z];
			//$("body",newwindow.document).append("<H1 style='page-break-before: always;'>"+a["groupname"]+"</H1>");
			$("body",newwindow.document).append($("<H1 style='page-break-before: always;'></H1>").text(a["groupname"]));
			$("body",newwindow.document).append(tablehtml);
			
			if (ahash.hasOwnProperty(a["id"])) {
				reports_reportlist(ahash[a["id"]],$("body table.cr_table:last",newwindow.document));
			} else {
				try { console.log("moo",a["id"]); } catch (e) {}
			}
		}
	} else if (filterselection.substring(0,2) == "b:") { // Group area id (all groups in area, group print)
		var groupareaid = filterselection.substring(2);
		var ga = JSONDB.jsondb["groupareas"][groupareaid];
		
		var ghash = {};
		for (i in JSONDB.jsondb["people"]) {
			var p = JSONDB.jsondb["people"][i];
			try {
				var gid = p["groupselection"][groupareaid]["groupid"]; 
				if (gid != "") {
					if (!ghash.hasOwnProperty(gid)) {
						ghash[gid] = [];
					}
					ghash[gid].push(p["id"]);
				}
			} catch (e3) {}
		}
		//try { console.log("ghash",ghash); } catch (e) {}
		
		for (var z in ga["groupordering"]) {
			var gid = ga["groupordering"][z];
			var g = ga["groups"][gid];
			//$("body",newwindow.document).append("<H1 style='page-break-before: always;'>"+ga["label"]+": "+g["label"]+"</H1>");
			$("body",newwindow.document).append($("<H1 style='page-break-before: always;'></H1>").text(ga["label"]+": "+g["label"]));
			$("body",newwindow.document).append(tablehtml);
			if (ghash.hasOwnProperty(gid)) {
				reports_reportlist(ghash[gid],$("body table.cr_table:last",newwindow.document));
			}
		}
	} else if (filterselection.substring(0,2) == "c:") { // All people NOT assigned to a group in a grouparea
		var groupareaid = filterselection.substring(2);
		var ga = JSONDB.jsondb["groupareas"][groupareaid];
		//$("body",newwindow.document).append("<H1>"+ga["label"]+": Unassigned</H1>");
		$("body",newwindow.document).append($("<H1></H1>").text(ga["label"]+": Unassigned"));
		$("body",newwindow.document).append(tablehtml);
		var newlist = []
		for (personid in JSONDB.jsondb["people"]) {
			var p = JSONDB.jsondb["people"][personid]
			if (!p.hasOwnProperty("groupselection") || !p["groupselection"].hasOwnProperty(groupareaid) || p["groupselection"][groupareaid]["groupid"] == "" || p["groupselection"][groupareaid]["groupid"] == null) {
				//isview = true;
				newlist.push(p["id"]);
			} else {
				if (!JSONDB.jsondb["groupareas"][groupareaid]["groups"].hasOwnProperty(p["groupselection"][groupareaid]["groupid"])) {
					//isview = true;
					newlist.push(p["id"]);
				}
			}
		}
		reports_reportlist(newlist,$("body table.cr_table:last",newwindow.document));
	} else if (filterselection.substring(0,2) == "g:") { // All people in a given group
		var itemid = filterselection.substring(2);
		var items = itemid.split(",");
		var gaid = items[0];
		var gid = items[1];
		var ga = JSONDB.jsondb["groupareas"][gaid];
		var g = ga["groups"][gid]
		
		$("body",newwindow.document).append($("<H1></H1>").text(ga["label"]+": "+g["label"]));
		$("body",newwindow.document).append(tablehtml);
		
		var newlist = []
		for (i in JSONDB.jsondb["people"]) {
			try {
				var p = JSONDB.jsondb["people"][i];
				if (p["groupselection"][gaid]["groupid"] == gid) {
					newlist.push(p["id"]);
				}
			} catch (e3) {}
		}
		reports_reportlist(newlist,$("body table.cr_table:last",newwindow.document));
	} else {
		alert("There was a problem generating the form. This is a bug");
	}
	
	// Generate column titles
	for (i in fieldlist) {
		$(".cr_header",newwindow.document).append($("<th></th>").text(fieldlist[i]["label"]))
	}
	
	try {
		$("body table.cr_table",newwindow.document).tablesorter();
		$("body table.cr_table",newwindow.document).trigger("update",[[[0,0],[1,0]]]);
	} catch (e2) {}
}

function reports_selection_moveleft() {
	var sourceval = $("#modal_createreport_right").val();
	if (sourceval != null && sourceval != "") {
		$("#modal_createreport_right option[value=\""+sourceval+"\"]").remove();
	}
}

function reports_selection_moveright() {
	//try { console.log("Move Right"); } catch (e) {}
	var sourceval = $("#modal_createreport_left").val();
	if (sourceval != null && sourceval != "") {
		var found = false;
		$("#modal_createreport_right option").each(function() {
			if ($(this).val() == sourceval) {
				found = true;
			}
		});
		var label = $("#modal_createreport_left option[value=\""+sourceval+"\"]").text();
		if (!found) {
			//$("#modal_createreport_right").append("<option value='"+sourceval+"'>"+label+"</option>");
			$("#modal_createreport_right").append($("<option></option>").attr("value",sourceval).text(label));
		}
	}
}

function reports_selection_moveup() {
	var sourceval = $("#modal_createreport_right").val();
	if (sourceval != null && sourceval != "") {
		var selectedOption = $("#modal_createreport_right option[value=\""+sourceval+"\"]");
		var prev = $(selectedOption).prev();
		$(selectedOption).insertBefore(prev);
	}
}

function reports_selection_movedown() {
	var sourceval = $("#modal_createreport_right").val();
	if (sourceval != null && sourceval != "") {
		var selectedOption = $("#modal_createreport_right option[value=\""+sourceval+"\"]");
		var next = $(selectedOption).next();
		$(selectedOption).insertAfter(next);
	}
}

function settings_goonline() {
	var t = {"action":"savesettings","params":{}};
	t["params"]["isonline"] = "true";
	JSONDB.dotransaction(t);
	var dataString = new Object;
	dataString.eventid = master_eventid;
	dataString.status = "online"
	$.ajax({
		async: false,
		type: "GET",
		url: "/manageapp/online",
		data: dataString
	});
	settings_publish();
	settings_load();
}

function settings_gooffline() {
	var t = {"action":"savesettings","params":{}};
	t["params"]["isonline"] = "false";
	JSONDB.dotransaction(t);
	var dataString = new Object;
	dataString.eventid = master_eventid;
	dataString.status = "offline"
	$.ajax({
		async: false,
		type: "GET",
		url: "/manageapp/online",
		data: dataString
	});
	settings_load();
}

function settings_publish() {
	function publish_success(jsondata,textstatus,request) {
		try { console.log("Publishing Success ",jsondata,textstatus,request); } catch (e) {}
	}
	
	function publish_error(request,status,error) {
		try { console.error("Publishing Error ",request,status,error); } catch (e) {}
	}
	
	if (settings_get("isonline","false") == "true") {
		var dataString = new Object;
		dataString.eventid = master_eventid;
		var newdata = {};
		newdata["affiliation"] = JSONDB.jsondb["affiliation"]
		newdata["groupareas"] = JSONDB.jsondb["groupareas"]
		newdata["settings"] = JSONDB.jsondb["settings"]
		dataString.jsondata = JSON.stringify(newdata);
		$.ajax({
			async: true,
			type: "POST",
			url: "/manageapp/publish",
			data: dataString,
			success: publish_success,
			error: publish_error,
			dataType: "json"
		});
	}
}

