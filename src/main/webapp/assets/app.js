//var eventid = parent.window.eventid;
var eventid = master_eventid;
var initrun = false;

var peoplefieldlist = [
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

function printMe() {
	window.print();
}

var initrun = false;
jQuery(document).ready(function() {
	if (!initrun) {
		initrun = true;
		MRDB.showbar();
		//MRDB.init(eventid,null,dbschema,parent.window.channeltoken,parent.window.clientid);
		MRDB.init(eventid,null,dbschema,master_channeltoken,master_clientid);
		$("#btn_addgrouparea").click(function () {
			$("#modal_grouparea").modal();
			$("#modal_grouparea_save").click(function () {
				var rid = MRDB.generateid();
				var hasleaders = "0"; if ($("#modal_grouparea_leaders").is(':checked')) { hasleaders = "1"; }
				//var definesreg = "0"; if ($("#modal_grouparea_regarea").is(':checked')) { definesreg = "1"; }
				var isregchoice = "0"; if ($("#modal_grouparea_publicchoice").is(':checked')) { isregchoice = "1"; }
				var ismanditory = "0"; if ($("#modal_grouparea_choicemanditory").is(':checked')) { ismanditory = "1"; }
				var haspoints = "0"; if ($("#modal_grouparea_haspoints").is(':checked')) { haspoints = "1"; }
				//var data = {"label":$("#modal_grouparea_labelinput").val(),"rowid":rid,"hasleaders":hasleaders,"definesreg":definesreg,"isregchoice":isregchoice,"ismanditory":ismanditory,"trackspoints":trackspoints}
				var data = {"label":$("#modal_grouparea_labelinput").val(),"publicdescription":$("#modal_grouparea_publicdescription").val(),"rowid":rid,"hasleaders":hasleaders,"isregchoice":isregchoice,"ismanditory":ismanditory,"ordering":grouparea_nextordering(),"haspoints":haspoints}
				MRDB.db_addrow("groupareas",data);
				$.modal.close();
			});
		});
		$("#public_settingsave").click(function() {
			var p1 = $("#public_description").val();
			var p2 = $("#public_url").val();
			var p3 = $("#public_headerinstructions").val();
			var p4 = $("#public_footerinstructions").val();
			var p5 = $("#public_regsuccess").val();
			var useshop = "no"; if ($("#public_useshop").is(':checked')) { useshop = "yes"; }
			setsetting("publicdescription",p1);
			setsetting("publicurl",p2);
			setsetting("publicheaderinstructions",p3);
			setsetting("publicfooterinstructions",p4);
			setsetting("publicsuccessmessage",p5);
			setsetting("useshop",useshop);
			setsetting("publicemailmessage",$("#public_emailsuccess").val());
			setsetting("emailnotificationaddress",$("#public_notifyemail").val());
			
			for (var p in peoplefieldlist) {
				var fieldval = "no";
				if ($("#public_fieldmanditory_"+peoplefieldlist[p]).is(':checked')) {
					fieldval = "yes";
				}
				setsetting("manditory_"+peoplefieldlist[p],fieldval);
			}
		});
		$("#btn_reg_addfield").click(function() {
			$("#modal_customfield").modal();
			$("#modal_customfield_fieldtype").change(function() {
				if ($("#modal_customfield_fieldtype").val() == "list") {
					$("#modal_customfield_listfields").css("display","");
				} else {
					$("#modal_customfield_listfields").css("display","none");
				}
			});
			$("#modal_customfield_listfields_add").click(function() {
				$("#modal_customfield_listfields_table").append("<tr><td class='listfield_val'>"+$("#modal_customfield_listfields_text").val()+"</td><td><input type='button' value='Rem' class='modal_customfield_delbutton'/></td></tr>");
				$("#modal_customfield_listfields_text").val("");
				$(".modal_customfield_delbutton").unbind("click");
				$(".modal_customfield_delbutton").click(function() {
					$(this).parents("tr").remove();
				});
			})
			$("#modal_customfield_confirm_submit").click(function() {
				var rid = MRDB.generateid();
				var ispub = "0"; if ($("#modal_customfield_isreg").is(':checked')) { ispub = "1"; }
				var isman = "0"; if ($("#modal_customfield_ismanditory").is(':checked')) { isman = "1"; }
				var fielddata = "";
				if ($("#modal_customfield_fieldtype").val() == "list") {
					$("#modal_customfield_listfields_table tr").each(function() {
						fielddata = fielddata + "<>" + $(this).children(".listfield_val").text();
					});
				}
				var nextcustomorder = maxcustomorder + 1000;
				maxcustomorder = nextcustomorder;
				var data = {"rowid":rid,"fieldname":$("#modal_customfield_label").val(),"fieldtype":$("#modal_customfield_fieldtype").val(),"isonreg":ispub,"ismanditory":isman,"publicinstructions":$("#modal_customfield_instructions").val(),"fielddata":fielddata,"ordering":nextcustomorder}
				MRDB.db_addrow("customfields",data);
				$.modal.close();
			});
		});
		$("#btn_public_addgroup").click(function() {
			$("#modal_affiliationgroup").modal();
			$("#modal_affiliationgroup_confirm_submit").click(function() {
				var rid = MRDB.generateid();
				var data = {"rowid":rid,"groupname":$("#modal_affiliationgroup_groupname").val()}
				if ($("#modal_affiliationgroup_groupname").val() != "") {
					MRDB.db_addrow("affiliationgroups",data);	
				}
				$.modal.close();
			});
		});
	}
});

// Automatically hit when the affiliation button/tab is hit
function refresh_affiliation() {
	//try { console.log('Reloading affiliations...'); } catch (e) {}
	refresh_affiliationgroups();
}

var affiliationgrouplist = new Array();
function refresh_affiliationgroups() {
	function refresh_affiliationgroups2(success,result) {
		if (success) {
			affiliationgrouplist = new Array();
			$("#public_affiliationgrouptable").empty();
			for (var x in result) {
				var row = result[x];
				affiliationgrouplist[row["rowid"]] = row;
				//affiliationgrouplist.push(row);
				$("#public_affiliationgrouptable").append("<tr id='agrouptable_row"+row["rowid"]+"'>\n\
					<td class='affiliationrow' id='agrouptable_row"+row["rowid"]+"_groupname'></td>\n\
					<td class='affiliationrow' id='agrouptable_row"+row["rowid"]+"_count'>0</td>\n\
					<td class='affiliationrow affiliationbuttoncell'><input class='cbutton' type='button' value='View' onClick='viewaffiliationgroup(\""+row["rowid"]+"\");'/><input class='cbutton' type='button' value='Report' onClick='report_personreport(\"affiliation\",\""+row["rowid"]+"\");'/><input class='cbutton' type='button' value='Mod' onClick='affiliationgroup_modify(\""+row["rowid"]+"\");'/><input class='cbutton' type='button' value='Del' onClick='affiliationgroup_delete(\""+row["rowid"]+"\");'/></td>\n\
				</tr>");
				//viewaffiliationgroup(groupid)
				//reportaffiliationgroup(\""+row["rowid"]+"\")
				$("#agrouptable_row"+row["rowid"]+"_rowid").text(row["rowid"]);
				$("#agrouptable_row"+row["rowid"]+"_groupname").text(row["groupname"]);
				refresh_affiliationgroupcount(row["rowid"]);
			}
		}
	}
	MRDB.executeSQLWithCallback("select * from affiliationgroups order by groupname COLLATE NOCASE",[],refresh_affiliationgroups2);
}

function refresh_affiliationgroupcount(agroupid) {
	function refresh_affiliationgroupcount2(success,result) {
		var thecount = result[0]["thecount"];
		$("#agrouptable_row"+agroupid+"_count").text(thecount);
	}
	MRDB.executeSQLWithCallback("select count(*) as thecount from people where affiliation=? and (archived IS NULL or archived!=1)",[agroupid],refresh_affiliationgroupcount2);
}

function affiliationgroup_modify(rowid) {
	function affiliationgroup_modify2(success,result) {
		$("#modal_affiliationgroup").modal();
		$("#modal_affiliationgroup_groupname").val(result[0]["groupname"]);
		$("#modal_affiliationgroup_confirm_submit").click(function() {
			if (result[0]["groupname"] != $("#modal_affiliationgroup_groupname").val() && $("#modal_affiliationgroup_groupname").val() != "") {
				MRDB.db_changedata("affiliationgroups",rowid,"groupname",$("#modal_affiliationgroup_groupname").val());
			}
			$.modal.close();
		});
	}
	MRDB.executeSQLWithCallback("select * from affiliationgroups where rowid=?",[rowid],affiliationgroup_modify2);
}

function affiliationgroup_delete(rowid) {
	$("#modal_areyousure").modal();
	$("#confirm_submit").click(function() {
		MRDB.db_delrow("affiliationgroups",rowid);
		$.modal.close();
	});
}

var regsort = "processed,lastname,firstname";
function refresh_registrations_selectsort(sort) {
	//alert(sort);
	if (sort == "stamp") {
		regsort = "r.processed,r.submitstamp,UPPER(r.lastname),UPPER(r.firstname)";
	} else if (sort == "firstname") {
		regsort = "r.processed,UPPER(r.firstname),UPPER(r.lastname)";
	} else if (sort == "lastname") {
		regsort = "r.processed,UPPER(r.lastname),UPPER(r.firstname)";
	} else {
		regsort = "r.processed,UPPER(r.lastname),UPPER(r.firstname)";
	}
	refresh_registrations();
}

// Automatically hit when the registration button is hit
function refresh_registration() {
	refresh_registrations();
}

function refresh_registrations() {
	function refresh_registrations2(success,result) {
		if (success) {
			$("#regtable").empty();
			$("#oldregtable").empty();
			for (var x in result) {
				var row = result[x];
				var selector = "#regtable";
				if (row["processed"] == "1") {
					selector = "#oldregtable";
				}
				var persondata = row["personid"];
				//if (row["personid"] != "") {
				//	persondata = "Exists";
				//}
				$(selector).append("<tr id='regtable_row"+row["rowid"]+"'>\n\
					<td class='regrow' id='regtable_row"+row["rowid"]+"_firstname'></td>\n\
					<td class='regrow' id='regtable_row"+row["rowid"]+"_lastname'></td>\n\
					<td class='regrow centerit' id='regtable_row"+row["rowid"]+"_stamp'></td>\n\
					<td class='regrow' id='regtable_row"+row["rowid"]+"_regfirstname'></td>\n\
					<td class='regrow' id='regtable_row"+row["rowid"]+"_reglastname'></td>\n\
					<td class='regrow centerit'><input type='button' value='Process' onClick='processregistration(\""+row["rowid"]+"\");'/></td>\n\
				</tr>");
				$("#regtable_row"+row["rowid"]+"_firstname").text(row["firstname"]);
				$("#regtable_row"+row["rowid"]+"_lastname").text(row["lastname"]);
				$("#regtable_row"+row["rowid"]+"_stamp").text(row["submitstamp"]);
				$("#regtable_row"+row["rowid"]+"_regfirstname").text(row["reg_firstname"]);
				$("#regtable_row"+row["rowid"]+"_reglastname").text(row["reg_lastname"]);
			}
		}
	}
	//alert(regsort);
	MRDB.executeSQLWithCallback("select r.*,p.rowid as personid,p.firstname as reg_firstname,p.lastname as reg_lastname from registrations r LEFT OUTER JOIN people p on p.registrationid=r.rowid order by "+regsort,[],refresh_registrations2);
}

var customfieldlist = new Array();
var maxcustomorder = 0;
function refresh_customfields() {
	function refresh_customfields2(success,result) {
		if (success) {
			$("#public_customfields").empty();
			customfieldlist = new Array();
			for (var x in result) {
				var row = result[x];
				customfieldlist.push(row);
				$("#public_customfields").append("<tr id='public_customfields_row"+row["rowid"]+"'>\n\
					<td class='public_customfields' id='public_customfields_row"+row["rowid"]+"_fieldname'></td>\n\
					<td class='public_customfields centerit' id='public_customfields_row"+row["rowid"]+"_fieldtype'></td>\n\
					<td class='public_customfields centerit' id='public_customfields_row"+row["rowid"]+"_isonreg'></td>\n\
					<td class='public_customfields centerit'><input type='button' value='Modify' onClick='customfield_modify(\""+row["rowid"]+"\");'/></td>\n\
					<td class='public_customfields centerit'><input type='button' value='Remove' onClick='customfield_delete(\""+row["rowid"]+"\");'/></td>\n\
					<td class='public_customfields centerit'><input type='button' value='Up' onClick='customfield_moveup(\""+row["rowid"]+"\");'/></td>\n\
					<td class='public_customfields centerit'><input type='button' value='Down' onClick='customfield_movedown(\""+row["rowid"]+"\");'/></td>\n\
				</tr>");
				$("#public_customfields_row"+row["rowid"]+"_fieldname").text(row["fieldname"]);
				$("#public_customfields_row"+row["rowid"]+"_fieldtype").text(row["fieldtype"]);
				var regenum = Array();
				regenum["0"] = "No";
				regenum["1"] = "Yes";
				$("#public_customfields_row"+row["rowid"]+"_isonreg").text(regenum[row["isonreg"]]);
				maxcustomorder = row["ordering"];
			}
		}
	}
	MRDB.executeSQLWithCallback("select * from customfields order by ordering",[],refresh_customfields2);
}

var totalpeoplecount = 0;
var peoplesort = "lastname COLLATE NOCASE,firstname COLLATE NOCASE";
function refresh_people() {
	function refresh_people3(success,result) {
		if (success) {
			$("#peopletable").empty();
			totalpeoplecount = 0;
			for (var x in result) {
				totalpeoplecount = totalpeoplecount + 1;
				var row = result[x];
				$("#peopletable").append("<tr id='peopletable_row"+row["rowid"]+"'>\n\
					<td id='peopletable_row"+row["rowid"]+"_firstname' class='peoplerow'></td>\n\
					<td id='peopletable_row"+row["rowid"]+"_lastname' class='peoplerow'></td>\n\
					<td id='peopletable_row"+row["rowid"]+"_affiliation' class='peoplerow centerit'></td>\n\
					<td id='peopletable_row"+row["rowid"]+"_signedin' class='peoplerow centerit'></td>\n\
					<td class='peoplerow buttoncell'><input type='button' value='View' onClick='viewperson(\""+row["rowid"]+"\");'/></td>\n\
				</tr>");
				$("#peopletable_row"+row["rowid"]+"_rowid").text(row["rowid"]);
				$("#peopletable_row"+row["rowid"]+"_firstname").text(row["firstname"]);
				$("#peopletable_row"+row["rowid"]+"_lastname").text(row["lastname"]);
				$("#peopletable_row"+row["rowid"]+"_affiliation").text(row["groupname"]);
				if (row["signedin"] == "yes") {
					$("#peopletable_row"+row["rowid"]+"_signedin").html("Yes <a class='atoggle' onClick='togglesignin(\""+row["rowid"]+"\",\"no\");'>(Switch)</a>");
				} else {
					$("#peopletable_row"+row["rowid"]+"_signedin").html("No <a class='atoggle' onClick='togglesignin(\""+row["rowid"]+"\",\"yes\")'>(Switch)</a>");
				}
			}
		}
	}
	MRDB.executeSQLWithCallback("select p.*,g.groupname from people p LEFT OUTER JOIN affiliationgroups g on p.affiliation=g.rowid where (p.archived IS NULL or p.archived!=1) order by "+peoplesort,[],refresh_people3);
}

function togglesignin(personid,newvalue) {
	if (newvalue == "yes") {
		MRDB.db_changedata("people",personid,"signedin","yes");
	} else {
		MRDB.db_changedata("people",personid,"signedin","no");
	}
	refresh_people();
}

function refresh_people_sort(sortby) {
	if (sortby == "firstname") {
		peoplesort = "firstname COLLATE NOCASE,lastname COLLATE NOCASE";
	} else if (sortby == "affiliation") {
		peoplesort = "g.groupname COLLATE NOCASE,lastname COLLATE NOCASE,firstname COLLATE NOCASE"
	} else if (sortby == "signedin") {
		peoplesort = "signedin,lastname COLLATE NOCASE,firstname COLLATE NOCASE"
	} else {
		peoplesort = sortby+",firstname COLLATE NOCASE";
	}
	refresh_people();
}

function grouparea_switchdisplay(button) {
	if ($(button).val() == "Hide") {
		$(button).val("Show");
		$(button).parents("tr").next().css("display","none");
	} else {
		$(button).val("Hide");
		$(button).parents("tr").next().css("display","");
	}
}

// Automatic refresh when hitting the groups button
function refresh_groups() {
	//try { console.log('Reloading groups'); } catch (e) {}
	refresh_groupareas();
}

var lastordering_groupareas = 0;
var groupareadata = new Array();
var groupdata = new Array();
var lookuptable_groupdata = new Array();
function refresh_groupareas() {
	function refresh_groups2(success,result) {
		if (success) {
			$("#grouptable").empty();
			groupdata = new Array();
			groupareadata = new Array();
			for (var x in result) {
				var row = result[x];
				groupdata[row["rowid"]] = new Array();
				groupareadata[row["rowid"]] = row;
				$("#grouptable").append("<tr id='grouptable_row"+row["rowid"]+"'>\n\
					<td class='garow' id='grouptable_row"+row["rowid"]+"_label'></td>\n\
					<td class='garow_buttons'><input type='button' value='Modify' onClick='grouparea_mod(\""+row["rowid"]+"\");' class='garow_button'/><input type='button' value='Delete' onClick='grouparea_del(\""+row["rowid"]+"\");' class='garow_button'/><input type='button' value='Add Group' onClick='grouparea_addgroup(\""+row["rowid"]+"\");' class='garow_button'/><input type='button' value='Up' onClick='grouparea_moveup(\""+row["rowid"]+"\");' class='garow_button'/><input type='button' value='Down' onClick='grouparea_movedown(\""+row["rowid"]+"\");' class='garow_button'/><input type='button' value='Hide' onClick='grouparea_switchdisplay(this);' class='garow_button'/></td>\n\
				</tr>");
				//$("#grouptable_row"+row["rowid"]+"_rowid").text(row["rowid"]+" "+row["ordering"]);
				$("#grouptable_row"+row["rowid"]+"_label").text(row["label"]);
				$("#grouptable").append("<tr><td colspan='2' class='grouptablecell'><table class='grouptable'><thead><th class='grouptable_th'>Group</th><th class='grouptable_th'>Members</th></tr></thead><tbody id='groups_"+row["rowid"]+"'></tbody></table><br/><br/></td></tr>");
				lastordering_groupareas = row["ordering"];
				refresh_grouparea(row["rowid"]);
			}
		}
	}
	MRDB.executeSQLWithCallback("select * from groupareas order by ordering,label",[],refresh_groups2);
}

var lastordering_groups = new Array();
function refresh_grouparea(groupareaid) {
	function showgroup(success2,result2) {
		if (success2) {
			var gaid = groupareaid;
			$("#groups_"+gaid).empty();
			for (var m in result2) {
				var group = result2[m];
				groupdata[groupareaid][group["rowid"]] = group;
				lookuptable_groupdata[group["rowid"]] = group;
				gaid = group["groupareaid"];
				//alert(group["groupareaid"]);
				$("#groups_"+gaid).append("<tr id='group_row"+group["rowid"]+"'>\n\
					<td class='grow'>"+group["label"]+"</td>\n\
					<td class='grow' id='group_"+group["rowid"]+"_count'></td>\n\
					<td class='grow_buttons'><input type='button' class='grow_button' value='View' onClick='group_view(\""+group["rowid"]+"\");'/><input type='button' class='grow_button' value='Report' onClick='report_personreport(\"group\",\""+group["rowid"]+"\");'/><input type='button' class='grow_button' value='Mod' onClick='group_mod(\""+group["rowid"]+"\");'/><input type='button' class='grow_button' value='Del' onClick='group_del(\""+group["rowid"]+"\");'/><input type='button' class='grow_button' value='Up' onClick='group_moveup(\""+group["rowid"]+"\");'/><input type='button' class='grow_button' value='Down' onClick='group_movedown(\""+group["rowid"]+"\");'/><input type='button' class='grow_button' value='Shop Input' onClick='shop_input(\""+group["rowid"]+"\");'/><input type='button' class='grow_button' value='Spending Sheet' onClick='shop_sheet(\""+group["rowid"]+"\");'/></td>\n\
					</tr>");
				//<input type='button' class='grow_button' value='Report' onClick='group_report(\""+group["rowid"]+"\");'/>
				//report_personreport
				lastordering_groups[groupareaid] = group["ordering"];
				/*function updatecount(success3,result3,query,params) {
					$("#group_"+params[0]+"_count").text(result3[0]["thecount"]);
				}
				MRDB.executeSQLWithCallback("select groupid,count(*) as thecount from groupmembership where groupid=? and personid!=''",[group["rowid"]],updatecount);
				*/
				refresh_groupcount(group["rowid"]);
			}

			$("#groups_"+gaid).append("<tr><td>Unassigned</td><td id='"+groupareaid+"_unassignedcount'></td><td><input type='button' class='group_view' value='View' onClick='group_viewunassigned(\""+groupareaid+"\");'/><input type='button' class='group_view' value='Distribute' onClick='group_distribute(\""+groupareaid+"\");'/></td></tr>");
			function updateothercount(success4,result4) {
				$("#"+groupareaid+"_unassignedcount").text(result4[0]["thecount"]);
			}
			MRDB.executeSQLWithCallback("select count(distinct p2.rowid) as thecount from people p2 where (p2.archived IS NULL or p2.archived!=1) and p2.rowid NOT IN (select p.rowid from people p,groups g,groupmembership gm where (p.archived IS NULL or p.archived!=1) and gm.personid=p.rowid and gm.groupid=g.rowid and g.groupareaid=?)",[groupareaid],updateothercount);
		}
	}
	MRDB.executeSQLWithCallback("select * from groups where groupareaid=? order by ordering,label COLLATE NOCASE",[groupareaid],showgroup);
}

var groupcounts = new Array();
function refresh_groupcount(groupid) {
	function updatecount(success3,result3,query,params) {
		$("#group_"+params[0]+"_count").text(result3[0]["thecount"]);
		groupcounts[groupid] = result3[0]["thecount"];
	}
	MRDB.executeSQLWithCallback("select gm.groupid,count(distinct gm.personid) as thecount from groupmembership gm,people p where gm.groupid=? and gm.personid!='' and p.rowid=gm.personid and (p.archived IS NULL or p.archived!=1)",[groupid],updatecount);
}

function group_distribute(groupareaid) {
	$("#modal_groupdistributer").modal();
	for (var i in groupdata) {
		var ga_name = groupareadata[i]["label"];
		for (var x in groupdata[i]) {
			var g_name = groupdata[i][x]["label"];
			$("#modal_groupdistributer_filter").append("<option value='"+x+"'>"+ga_name+": "+g_name+"</option>");
		}
	}
	$("input:radio[name='modal_groupdistributer_sortmethod']").filter("[value='genderage']").attr('checked', true);
	$("#modal_groupdistribute_confirm").click(function() {
		var filter = $("#modal_groupdistributer_filter").val();

		function group_distribute2(success4,result4) {
			var mode = $("input:radio[name=modal_groupdistributer_sortmethod]:checked").val();

			var glist = new Array();
			// Groups to distribute into
			for (var x in groupdata[groupareaid]) {
				//var g_name = groupdata[i][x]["label"];
				glist.push(x);
			}
			var maxlength = glist.length;
			
			var newlist = result4;
			if (mode == "genderage") {
				newlist = result4.sort(genderagesort);
			}

			for (var y in newlist) {
				var person = newlist[y];
				var gindex = y % maxlength;
				//alert("Assigning person "+gindex+" "+glist[gindex]+" "+person["firstname"]+" ("+person["rowid"]+") "+person["gender"]+" "+person["birthdate"]);
				var mdata = {"rowid":MRDB.generateid(),"groupid":glist[gindex],"personid":person["rowid"],"isleader":"0"};
				MRDB.db_addrow("groupmembership",mdata);
			}
			$.modal.close();
		}
		if (filter == "") {
			MRDB.executeSQLWithCallback("select * from people p2 where (p2.archived!=1 or p2.archived IS NULL) and p2.rowid NOT IN (select p.rowid from people p,groups g,groupmembership gm where (p.archived IS NULL or p.archived!=1) and gm.personid=p.rowid and gm.groupid=g.rowid and g.groupareaid=?) order by p2.rowid",[groupareaid],group_distribute2);	
		} else {
			MRDB.executeSQLWithCallback("select * from people p2,groupmembership gm where gm.personid=p2.rowid and gm.groupid=? and (p2.archived IS NULL or p2.archived!=1) and p2.rowid NOT IN (select p.rowid from people p,groups g,groupmembership gm where (p.archived IS NULL or p.archived!=1) and gm.personid=p.rowid and gm.groupid=g.rowid and g.groupareaid=?) order by p2.rowid",[filter,groupareaid],group_distribute2);
		}
	});
}

/*
function refresh_group(groupid) {
	function refresh_group2(success,result) {
		var group = result[0];
		$("#group_row"+groupid).replaceWith("<tr id='group_row"+group["rowid"]+"'><td>"+group["rowid"]+" "+group["ordering"]+"</td><td>"+group["label"]+"</td><td><input type='button' class='group_mod' value='Mod' onClick='group_mod(\""+group["rowid"]+"\");'/></td><td><input type='button' class='group_del' value='Del' onClick='group_del(\""+group["rowid"]+"\");'/></td><td><input type='button' class='group_del' value='View' onClick='group_view(\""+group["rowid"]+"\");'/></td><td><input type='button' value='Up' onClick='group_moveup(\""+group["rowid"]+"\");'/></td></tr>");
	}

	MRDB.executeSQLWithCallback("select * from groups where rowid=?",[groupid],refresh_group2);
}
*/
function group_mod(groupid) {
	$("#modal_group").modal();
	function fillform(success,result) {
		var row = result[0];
		$("#modal_group").modal();
		$("#modal_group_labelinput").val(row["label"]);
		$("#modal_group_modifier").val(row["modifier"]);
		$("#modal_group_save").click(function() {
			if ($("#modal_group_labelinput").val() != row["label"]) {
				MRDB.db_changedata("groups",groupid,"label",$("#modal_group_labelinput").val());
			}
			if ($("#modal_group_modifier").val() != row["modifier"]) {
				MRDB.db_changedata("groups",groupid,"modifier",$("#modal_group_modifier").val());
			}

			$.modal.close();
		});
	}

	MRDB.executeSQLWithCallback("select * from groups where rowid=?",[groupid],fillform);
}

function group_view(groupid) {
	var groupareaid = getgroupareaid(groupid);
	var hasleaders = false;
	if (groupareadata[groupareaid]["hasleaders"] == "1") {
		hasleaders = true;
	}
	function group_view2(success,result) {
		$("#modal_groupviewer").modal({containerCss: {width:"95%",height:"90%"}});
		$("#modal_groupview_datalist").empty();
		if (hasleaders) {
			$(".modal_groupview_datalist_view").before("<th class='modal_groupview_datalist modal_groupview_datalist_type'>Type</th>");
		}
		var groupselection = "<option value=''>Not Assigned</option>";
		for (var x in groupdata[groupareaid]) {
			groupselection = groupselection + "<option value='"+groupdata[groupareaid][x]["rowid"]+"'>" + groupdata[groupareaid][x]["label"] + "</option>";
			if (hasleaders) {
				groupselection = groupselection + "<option value='l_"+groupdata[groupareaid][x]["rowid"]+"'>" + groupdata[groupareaid][x]["label"] + " (Leader)</option>";
			}
		}
		for (var i in result) {
			var persondata = result[i];
			var leaderdata = "";
			var groupsel = groupid;
			if (hasleaders) {
				if (persondata["isleader"] == "1") {
					leaderdata = "<td class='modal_groupview_datalist modal_groupview_datalist_type'>Leader</td>"
					var groupsel = "l_"+groupid;
				} else {
					leaderdata = "<td class='modal_groupview_datalist modal_groupview_datalist_type'>Member</td>"
				}
			}
			$("#modal_groupview_datalist").append("<tr>\n\
				<td class='modal_groupview_datalist modal_groupview_datalist_check'><input class='modal_groupview_masscheck' personid='"+persondata["rowid"]+"' membershipid='"+persondata["membershipid"]+"' type='checkbox'/></td>\n\
				<td class='modal_groupview_datalist' id='modal_groupview_datalist_"+persondata["rowid"]+"_firstname'></td>\n\
				<td class='modal_groupview_datalist' id='modal_groupview_datalist_"+persondata["rowid"]+"_lastname'></td>\n\
				"+leaderdata+"\n\
				<td class='modal_groupview_datalist modal_groupview_datalist_view'><input type='button' value='View' onClick='closecheck(\"viewperson(\\\""+persondata["rowid"]+"\\\")\")'/></td>\n\
				<td class='modal_groupview_datalist modal_groupview_datalist_reassign'><select id='modal_groupview_reassign_"+persondata["rowid"]+"'>"+groupselection+"</select><input type='button' value='Reassign' onClick='quickreassign(\""+persondata["rowid"]+"\",\"modal_groupview_reassign_"+persondata["rowid"]+"\",\""+groupid+"\",\""+persondata["membershipid"]+"\");'/></td></tr>");
			$("#modal_groupview_datalist_"+persondata["rowid"]+"_firstname").text(persondata["firstname"]);
			$("#modal_groupview_datalist_"+persondata["rowid"]+"_lastname").text(persondata["lastname"]);
			$("#modal_groupview_reassign_"+persondata["rowid"]).val(groupsel);
		}
		$("#modal_groupview_datalist").append("<tr><td colspan='5'><input type='button' value='All' onClick='groupview_checkall();'/><input type='button' value='None' onClick='groupview_uncheckall();'/><select id='modal_groupview_massreassign'>"+groupselection+"</select><input type='button' value='Mass Reassign' onClick='massreassign(\""+groupid+"\");'/></td></tr>");
		$("#modal_groupview_massreassign").val(groupid);
	}
	if (hasleaders) {
		MRDB.executeSQLWithCallback("select p.*,gm.isleader,gm.rowid as membershipid from people p,groupmembership gm where (p.archived IS NULL or p.archived!=1) and gm.personid=p.rowid and gm.groupid=? group by gm.personid order by gm.isleader desc,p.lastname COLLATE NOCASE,p.firstname COLLATE NOCASE",[groupid],group_view2);
	} else {
		MRDB.executeSQLWithCallback("select p.*,gm.isleader,gm.rowid as membershipid from people p,groupmembership gm where (p.archived IS NULL or p.archived!=1) and gm.personid=p.rowid and gm.groupid=? group by gm.personid order by p.lastname COLLATE NOCASE,p.firstname COLLATE NOCASE",[groupid],group_view2);
	}	
}

function group_report(groupid) {
	var groupareaid = getgroupareaid(groupid);
	var hasleaders = false;
	if (groupareadata[groupareaid]["hasleaders"] == "1") {
		hasleaders = true;
	}
	function group_view2(success,result) {
		var newwindow = window.open('','ReportWindow','status=1,toolbar=1,location=1,menubar=1,statusbar=1');
		newwindow.document.write('<html><head><title></title><link rel="stylesheet" type="text/css" href="/assets/printable.css"/></head><body><h1 id="header"></h1><table><thead><tr><th class="modal_groupview_datalist">First Name</th><th class="modal_groupview_datalist modal_groupview_datalist_last">Last Name</th></tr></thead><tbody id="modal_groupview_datalist"></tbody></table></body></html>');
		$("#header",newwindow.document).text(lookuptable_groupdata[groupid]["label"]);

		if (hasleaders) {
			$(".modal_groupview_datalist_last",newwindow.document).after("<th class='modal_groupview_datalist modal_groupview_datalist_type'>Type</th>");
		}
		for (var i in result) {
			var persondata = result[i];
			var leaderdata = "";
			var groupsel = groupid;
			if (hasleaders) {
				if (persondata["isleader"] == "1") {
					leaderdata = "<td class='modal_groupview_datalist modal_groupview_datalist_type'>Leader</td>"
					var groupsel = "l_"+groupid;
				} else {
					leaderdata = "<td class='modal_groupview_datalist modal_groupview_datalist_type'>Member</td>"
				}
			}
			$("#modal_groupview_datalist",newwindow.document).append("<tr>\n\
				<td class='modal_groupview_datalist' id='modal_groupview_datalist_"+persondata["rowid"]+"_firstname'></td>\n\
				<td class='modal_groupview_datalist' id='modal_groupview_datalist_"+persondata["rowid"]+"_lastname'></td>\n\
				"+leaderdata+"\n\
				</tr>");
			$("#modal_groupview_datalist_"+persondata["rowid"]+"_firstname",newwindow.document).text(persondata["firstname"]);
			$("#modal_groupview_datalist_"+persondata["rowid"]+"_lastname",newwindow.document).text(persondata["lastname"]);
		}
	}
	if (hasleaders) {
		MRDB.executeSQLWithCallback("select p.*,gm.isleader,gm.rowid as membershipid from people p,groupmembership gm where (p.archived IS NULL or p.archived!=1) and gm.personid=p.rowid and gm.groupid=? order by gm.isleader desc,p.lastname,p.firstname",[groupid],group_view2);
	} else {
		MRDB.executeSQLWithCallback("select p.*,gm.isleader,gm.rowid as membershipid from people p,groupmembership gm where (p.archived IS NULL or p.archived!=1) and gm.personid=p.rowid and gm.groupid=? order by p.lastname,p.firstname",[groupid],group_view2);
	}	
}

function group_viewunassigned(groupareaid) {
	var hasleaders = false;
	if (groupareadata[groupareaid]["hasleaders"] == "1") {
		hasleaders = true;
	}
	function viewunassigned(success4,result4) {
		$("#modal_groupviewer").modal({containerCss: {width:"95%",height:"90%"}});
		$("#modal_groupview_datalist").empty();
		var groupselection = "<option value=''>Not Assigned</option>";
		for (var x in groupdata[groupareaid]) {
			groupselection = groupselection + "<option value='"+groupdata[groupareaid][x]["rowid"]+"'>" + groupdata[groupareaid][x]["label"] + "</option>";
			if (hasleaders) {
				groupselection = groupselection + "<option value='l_"+groupdata[groupareaid][x]["rowid"]+"'>" + groupdata[groupareaid][x]["label"] + " (Leader)</option>";
			}
		}
		for (var i in result4) {
			var persondata = result4[i];
			$("#modal_groupview_datalist").append("<tr>\n\
				<td class='modal_groupview_datalist modal_groupview_datalist_check'><input class='modal_groupview_masscheck' personid='"+persondata["rowid"]+"' type='checkbox'/></td>\n\
				<td class='modal_groupview_datalist' id='modal_groupview_datalist_"+persondata["rowid"]+"_firstname'></td>\n\
				<td class='modal_groupview_datalist' id='modal_groupview_datalist_"+persondata["rowid"]+"_lastname'></td>\n\
				<td class='modal_groupview_datalist modal_groupview_datalist_view'><input type='button' value='View' onClick='closecheck(\"viewperson(\\\""+persondata["rowid"]+"\\\")\")'/></td>\n\
				<td class='modal_groupview_datalist modal_groupview_datalist_reassign'><select id='modal_groupview_reassign_"+persondata["rowid"]+"'>"+groupselection+"</select><input type='button' value='Reassign' onClick='quickreassignfromunassigned(\""+persondata["rowid"]+"\",\"modal_groupview_reassign_"+persondata["rowid"]+"\",\"\");'/></td></tr>");
			$("#modal_groupview_datalist_"+persondata["rowid"]+"_firstname").text(persondata["firstname"]);
			$("#modal_groupview_datalist_"+persondata["rowid"]+"_lastname").text(persondata["lastname"]);
		}
		$("#modal_groupview_datalist").append("<tr><td colspan='5'><input type='button' value='A' onClick='groupview_checkall();'/><input type='button' value='U' onClick='groupview_uncheckall();'/><select id='modal_groupview_massreassign'>"+groupselection+"</select><input type='button' value='Mass Reassign' onClick='massreassignfromunassigned();'/></td></tr>");
	}
	MRDB.executeSQLWithCallback("select p2.* from people p2 where (p2.archived IS NULL or p2.archived!=1) and p2.rowid NOT IN (select p.rowid from people p,groups g,groupmembership gm where (p.archived IS NULL or p.archived!=1) and gm.personid=p.rowid and gm.groupid=g.rowid and g.groupareaid=?) order by p2.lastname,p2.firstname",[groupareaid],viewunassigned);
}

function groupview_checkall() {
	$(".modal_groupview_masscheck").each(function(i,element) {
		$(this).attr('checked',true);
	});
}

function groupview_uncheckall() {
	$(".modal_groupview_masscheck").each(function(i,element) {
		$(this).attr('checked',false);
	});
}

/**
 * Problem 1 - How to confirm that every person can only be in 1 group in a grouparea while still allowing the sync system here?
 * Problem 2 - How to do moves in a somewhat atomic manner?
 * 
 */
function ungroupperson(personid,groupid) {
	
}

function addpersontogroup(personid,groupid) {
	
}

function massreassign(sourcegroupid) {
	var newid = $("#modal_groupview_massreassign").val();
	var leaderdata = "0";
	if (newid.substring(0,2) == "l_") {
		newid = newid.substring(2);
		leaderdata = "1";
	}
	$(".modal_groupview_masscheck").each(function(i,element) {
		if ($(this).is(':checked')) {
			var personid = $(this).attr("personid");
			var membershipid = $(this).attr("membershipid");
			if (newid == "") {
				MRDB.db_delrow("groupmembership",membershipid);
			} else {
				MRDB.db_changedata("groupmembership",membershipid,"isleader",leaderdata);
				MRDB.db_changedata("groupmembership",membershipid,"groupid",newid);
			}
		}
	});
	closecheck("group_view('"+sourcegroupid+"');");
}

function massreassignfromunassigned() {
	var newid = $("#modal_groupview_massreassign").val();
	var leaderdata = "0";
	if (newid.substring(0,2) == "l_") {
		newid = newid.substring(2);
		leaderdata = "1";
	}
	$(".modal_groupview_masscheck").each(function(i,element) {
		if ($(this).is(':checked') && newid != "") {
			var personid = $(this).attr("personid");
			var memberid = MRDB.generateid();
			var mdata = {"rowid":memberid,"groupid":newid,"personid":personid,"isleader":leaderdata};
			MRDB.db_addrow("groupmembership",mdata);
		}
	});
	if (newid != "") {
		closecheck("group_viewunassigned('"+getgroupareaid(newid)+"');");
	}
}

function quickreassignfromunassigned(personid,sourcedomid) {
	var newid = $("#"+sourcedomid).val();
	if (newid != "") {
		var memberid = MRDB.generateid();
		var leaderdata = "0";
		if (newid.substring(0,2) == "l_") {
			newid = newid.substring(2);
			leaderdata = "1";
		}
		var mdata = {"rowid":memberid,"groupid":newid,"personid":personid,"isleader":leaderdata};
		MRDB.db_addrow("groupmembership",mdata);
		closecheck("group_viewunassigned('"+getgroupareaid(newid)+"');");
	}
}

function quickreassign(personid,sourcedomid,originalgroupid,membershipid) {
	var newid = $("#"+sourcedomid).val();
	if (newid == "") {
		//deleting membership
		MRDB.db_delrow("groupmembership",membershipid);
	} else {
		if (newid.substring(0,2) == "l_") {
			newid = newid.substring(2);
			MRDB.db_changedata("groupmembership",membershipid,"isleader","1");
		} else {
			MRDB.db_changedata("groupmembership",membershipid,"isleader","0");
		}
		MRDB.db_changedata("groupmembership",membershipid,"groupid",newid);		
	}
	closecheck("group_view('"+originalgroupid+"');");
}

function getgroupareaid(groupid) {
	return lookuptable_groupdata[groupid]["groupareaid"];
}

function closecheck(func) {
	$.modal.close();
	setTimeout(func,250);
}

function group_del(groupid) {
	$("#modal_areyousure").modal();
	$("#confirm_submit").click(function() {
		MRDB.db_delrow("groups",groupid);
		$.modal.close();
	});
}

function group_moveup(groupid) {
	var currentcount = 0;
	var othercount = 0;
	var otherid = "";
	function selectresult(success,result) {
		var trigger = false;
		for (var x in result) {
			var row = result[x];
			var thisordering = row["ordering"];
			if (thisordering == null || thisordering == "") {
				thisordering = 0;
			}
			if (trigger) {
				if (otherid != "") {
					MRDB.db_changedata("groups",otherid,"ordering",thisordering);
					MRDB.db_changedata("groups",row["rowid"],"ordering",othercount);
				}
				trigger = false;
			}
			if (row["rowid"] == groupid) {
				trigger = true;
			}
			othercount = thisordering;
			otherid = row["rowid"];
		}
	}
	MRDB.executeSQLWithCallback("select g.* from groups g,groups g2 where g2.rowid=? and g2.groupareaid=g.groupareaid order by g.ordering DESC,g.label DESC",[groupid],selectresult);
}

function group_movedown(groupid) {
	var currentcount = 0;
	var othercount = 0;
	var otherid = "";
	function selectresult(success,result) {
		var trigger = false;
		for (var x in result) {
			var row = result[x];
			var thisordering = row["ordering"];
			if (thisordering == null || thisordering == "") {
				thisordering = 0;
			}
			if (trigger) {
				if (otherid != "") {
					MRDB.db_changedata("groups",otherid,"ordering",thisordering);
					MRDB.db_changedata("groups",row["rowid"],"ordering",othercount);
				}
				trigger = false;
			}
			if (row["rowid"] == groupid) {
				trigger = true;
			}
			othercount = thisordering;
			otherid = row["rowid"];
		}
	}
	MRDB.executeSQLWithCallback("select g.* from groups g,groups g2 where g2.rowid=? and g2.groupareaid=g.groupareaid order by g.ordering,g.label",[groupid],selectresult);
}

function grouparea_moveup(groupareaid) {
	var currentcount = 0;
	var othercount = 0;
	var otherid = "";
	function selectresult(success,result) {
		var trigger = false;
		for (var x in result) {
			var row = result[x];
			var thisordering = row["ordering"];
			if (thisordering == null || thisordering == "") {
				thisordering = 0;
			}
			if (trigger) {
				if (otherid != "") {
					MRDB.db_changedata("groupareas",otherid,"ordering",thisordering);
					MRDB.db_changedata("groupareas",row["rowid"],"ordering",othercount);
				}
				trigger = false;
			}
			if (row["rowid"] == groupareaid) {
				trigger = true;
			}
			othercount = thisordering;
			otherid = row["rowid"];
		}
	}
	MRDB.executeSQLWithCallback("select * from groupareas order by ordering DESC,label DESC",[],selectresult);
}

function grouparea_movedown(groupareaid) {
	var currentcount = 0;
	var othercount = 0;
	var otherid = "";
	function selectresult(success,result) {
		var trigger = false;
		for (var x in result) {
			var row = result[x];
			var thisordering = row["ordering"];
			if (thisordering == null || thisordering == "") {
				thisordering = 0;
			}
			if (trigger) {
				if (otherid != "") {
					MRDB.db_changedata("groupareas",otherid,"ordering",thisordering);
					MRDB.db_changedata("groupareas",row["rowid"],"ordering",othercount);
				}
				trigger = false;
			}
			if (row["rowid"] == groupareaid) {
				trigger = true;
			}
			othercount = thisordering;
			otherid = row["rowid"];
		}
	}
	MRDB.executeSQLWithCallback("select * from groupareas order by ordering,label",[],selectresult);
}

function grouparea_nextordering() {
	if (lastordering_groupareas == null || lastordering_groupareas == "") {
		return 1000;
	} else {
		return parseInt(lastordering_groupareas)+1000;
	}
}

function group_nextordering(groupareaid) {

	var v = lastordering_groups[groupareaid];
	if (v == null || v == "") {
		return 1000;
	} else {
		return parseInt(lastordering_groups[groupareaid])+1000;
	}
}

var currentregid = "";
function processregistration(regid) {
	currentregid = regid;

	function processregistration_load(success,result) {
		//alert(result[0]["groupselection"]);
		function processcustom_load(success2,result2) {
			$("#modal_processreg_firstname").val(result[0]["firstname"]);
			$("#modal_processreg_lastname").val(result[0]["lastname"]);
			$("#modal_processreg_homephone").val(result[0]["homephone"]);
			$("#modal_processreg_mobilephone").val(result[0]["mobilephone"]);
			$("#modal_processreg_email").val(result[0]["email"]);
			$("#modal_processreg_parents_name").val(result[0]["parents_name"]);
			$("#modal_processreg_parents_phone").val(result[0]["parents_phone"]);
			$("#modal_processreg_emergencyinfo").val(result[0]["emergencyinfo"]);
			$("#modal_processreg_carecard").val(result[0]["carecard"]);
			$("#modal_processreg_birthdate").val(result[0]["birthdate"]);
			$("#modal_processreg_gender option[value='"+result[0]["gender"]+"']").attr('selected', 'selected');
			$("#modal_processreg_address_street").val(result[0]["address_street"]);
			$("#modal_processreg_address_city").val(result[0]["address_city"]);
			$("#modal_processreg_address_postal").val(result[0]["address_postal"]);
			$("#modal_processreg_comments").val(result[0]["comments"]);
			showimage($("#modal_processreg_image"),result[0]["picturefileid"],"small",true);
			
			//modal_processreg_affiliation
			for (var i in affiliationgrouplist) {
				$("#modal_processreg_affiliation").append($("<option></option>").attr("value",affiliationgrouplist[i]["rowid"]).text(affiliationgrouplist[i]["groupname"])); 
			}
			$("#modal_processreg_affiliation option[value='"+result[0]["affiliation"]+"']").attr('selected', 'selected');

			for (var i in customfieldlist) {
				cfield = customfieldlist[i];
				var thevalue = "";
				for (var x in result2) {
					if (result2[x]["fieldname"] == cfield["fieldname"]) {
						thevalue = result2[x]["fieldvalue"];
					}
				}
				var fieldhtml = "";
				if (cfield["fieldtype"] == "largetext") {
					fieldhtml = "<textarea id='goform_"+cfield["rowid"]+"'/>";
				} else if (cfield["fieldtype"] == "list") {
					var sdata = cfield["fielddata"].split("<>");
					var slist = "<option value=\""+thevalue+"\">"+thevalue+"</option>";
					for (var z in sdata) {
						if (sdata[z] != "") {
							slist = slist + "<option value=\""+sdata[z]+"\">"+sdata[z]+"</option>";
						}
					}
					fieldhtml = "<select id='goform_"+cfield["rowid"]+"'>"+slist+"</select>";
				} else {
					fieldhtml = "<input type='text' size='15' id='goform_"+cfield["rowid"]+"'/>";
				}
				$("#modal_processreg_fieldtable").append("<tr>\n\
					<td class='modal_fieldlabelcell'>"+cfield["fieldname"]+"</td>\n\
					<td>"+fieldhtml+"</td>\n\
				</tr>");
				$("#goform_"+cfield["rowid"]).val(thevalue);
			}

			var selectionarray = result[0]["groupselection"].split(",");
			
			for (var i in groupareadata) {
				var grouparea = groupareadata[i];
				var foundit = "";
				
				for (var x in selectionarray) {
					var sdata = selectionarray[x].split(":");
					if (sdata[0] == grouparea["rowid"]) {
						foundit = sdata[1];
					}
				}
				
				var groupoptions = "";
				for (var x in groupdata[i]) {
					groupoptions = groupoptions + "<option value='"+groupdata[i][x]["rowid"]+"'";
					if (groupdata[i][x]["rowid"] == foundit) {
						groupoptions = groupoptions + " selected";
					}
					groupoptions = groupoptions + ">"+groupdata[i][x]["label"]+"</option>";
				}
				var leaderoption = "";
				if (grouparea["hasleaders"] == "1") {
					leaderoption = "<input type='checkbox' id='isleader_"+grouparea["rowid"]+"'/> Leader?";
				}
				
				$("#modal_processreg_grouptable").append("<tr>\n\
					<td class='modal_fieldlabelcell'>"+grouparea["label"]+"</td>\n\
					<td><select id='groupmembership_"+grouparea["rowid"]+"'><option value=''>Not Selected</option>"+groupoptions+"</select></td>\n\
					<td class='modal_fieldlabelcell'>"+leaderoption+"</td>\n\
				</tr>");
			}

			if (getsetting("useshop") != "yes") {
				$("#modal_processreg_shoparea").css("display","none");
			} else {
				$("#modal_processreg_field_shopamount").val(result[0]["shopamount"]);
			}
/*
			var dataString = new Object;
			dataString.data = JSON.stringify({"firstname":$("#goform_firstname").val(),"lastname":$("#goform_lastname").val()});
			dataString.dbid = MRDBdbid;
			$.ajax({
				async: true,
				type: "GET",
				url: "searchmaster",
				data: dataString,
				success: peoplesearchsuccess,
				dataType: "json",
				error: processerror
			});*/
		}

		MRDB.executeSQLWithCallback("select * from registrations_customdata where registrationid=?",[regid],processcustom_load);
	}

	$("#modal_processreg").modal({containerCss: {width:"95%",height:"90%"}});
	$("#modal_processreg_birthdate").datepicker({
		changeMonth: true,
		changeYear: true,
		yearRange: "c-80:c+100"
	});
	$("#model_processreg_btn_delete").click(function () {
		MRDB.db_delrow("registrations",regid);
		$.modal.close();
		//refresh_registrations();
	});
	$("#model_processreg_btn_new").click(function () {
		var newpersonid = MRDB.generateid();
		var data = {"rowid":newpersonid,"registrationid":currentregid,"archived":"0"};
		data["firstname"] = $("#modal_processreg_firstname").val();
		data["lastname"] = $("#modal_processreg_lastname").val();
		data["homephone"] = $("#modal_processreg_homephone").val();
		data["mobilephone"] = $("#modal_processreg_mobilephone").val();
		data["email"] = $("#modal_processreg_email").val();
		data["parents_name"] = $("#modal_processreg_parents_name").val();
		data["parents_phone"] = $("#modal_processreg_parents_phone").val();
		data["emergencyinfo"] = $("#modal_processreg_emergencyinfo").val();
		data["carecard"] = $("#modal_processreg_carecard").val();
		data["birthdate"] = $("#modal_processreg_birthdate").val();
		data["gender"] = $("#modal_processreg_gender").val();
		data["address_street"] = $("#modal_processreg_address_street").val();
		data["address_city"] = $("#modal_processreg_address_city").val();
		data["address_postal"] = $("#modal_processreg_address_postal").val();
		data["comments"] = $("#modal_processreg_comments").val();
		data["affiliation"] = $("#modal_processreg_affiliation").val();
		data["picturefileid"] = $("#modal_processreg_image").attr("picturefileid");
		
		for (var i in customfieldlist) {
			var cfield = customfieldlist[i];
			var cvalue = $("#goform_"+cfield["rowid"]).val();
			if (cvalue != "") {
				var addcustom = {"rowid":MRDB.generateid(),"personid":newpersonid,"fieldid":cfield["rowid"],"fieldvalue":cvalue}
				MRDB.db_addrow("people_customdata",addcustom);
			}
		}
		
		for (var i in groupareadata) {
			var grouparea = groupareadata[i];
			var leaderval = "0";
			if ($("#isleader_"+grouparea["rowid"]).is(':checked')) {
				leaderval = "1";
			}
			var groupid = $("#groupmembership_"+grouparea["rowid"]).val();
			if (groupid != "") {
				var addmember = {"rowid":MRDB.generateid(),"groupid":$("#groupmembership_"+grouparea["rowid"]).val(),"isleader":leaderval,"personid":newpersonid};
				MRDB.db_addrow("groupmembership",addmember);
			}
		}

		if (getsetting("useshop") == "yes") {
			data["shopvouch"] = $("#modal_processreg_field_shopamount").val();
		} else {
			data["shopvouch"] = "0";
		}
		MRDB.db_addrow("people",data);
		MRDB.db_changedata("registrations",currentregid,"processed","1");
		MRDB.db_changedata("registrations",currentregid,"personid",newpersonid);
		$.modal.close();
	});

	MRDB.executeSQLWithCallback("select * from registrations where rowid=?",[regid],processregistration_load);
}

var currentresults = new Array();
/*
function peoplesearchsuccess(jsondata,textstatus,request) {
	var responsedata = eval(jsondata);
	if (responsedata['success']) {
		currentresults = responsedata['results'];
		$("#modal_processreg_matches").empty();
		$("#modal_processreg_matches").html("<table border='1' id='modal_processreg_matches_table'></table>");
		for (var i in responsedata['results']) {
			var result = responsedata['results'][i];
			$("#modal_processreg_matches_table").append("<tr><td><input type='button' value='&#60;' onClick='viewresult(\""+result["rowid"]+"\");'/></td><td id='modal_processreg_matches_table_"+result["rowid"]+"'></td></tr>");
			$("#modal_processreg_matches_table_"+result["rowid"]).text(result["firstname"]+" "+result["lastname"]);
		}
	} else {
		alert(responsedata['error']);
	}
}
*/
/*
function viewresult(rowid) {
	for (var i in currentresults) {
		var result = currentresults[i];
		if (result["rowid"] == rowid) {
			$("#resultform_firstname").text(result["firstname"]);
			$("#resultform_lastname").text(result["lastname"]);

			$("#model_processreg_btn_exists").unbind();
			$("#model_processreg_btn_exists").click(function () {
				var dataString = new Object;
				dataString.data = JSON.stringify({"processaction":"merge","sourceid":currentregid,"mergeid":result["rowid"],"persondata":{"firstname":$("#goform_firstname").val(),"lastname":$("#goform_lastname").val()}});
				dataString.dbid = MRDBdbid;
				$.ajax({
					async: false,
					type: "GET",
					url: "processreg",
					data: dataString,
					success: processsuccess,
					dataType: "json",
					error: processerror
				});
				$.modal.close();
			});
		}
	}
}
*/
/*
function processreg_copy(location,field) {
	if (field == "") {
		var fieldlist = Array("firstname","lastname");
		for (var x in fieldlist) {
			processreg_copy(location,fieldlist[x]);
		}
		for (var x in customfieldlist) {
			processreg_copy(location,customfieldlist[x]["rowid"]);
		}
	}
	else if (location == "fromraw") {
		$("#goform_"+field).val($("#rawform_"+field).text());
	} else {
		$("#goform_"+field).val($("#resultform_"+field).text());
	}
}

function processsuccess(jsondata,textstatus,request)
{
	//alert("success");
}

function processerror(jsondata,textstatus,request)
{
	alert("No success");
}*/

function grouparea_mod(groupareaid) {
	function fillform(success,result) {
		var row = result[0];
		$("#modal_grouparea").modal();
		$("#modal_grouparea_labelinput").val(row["label"]);
		$("#modal_grouparea_publicdescription").val(row["publicdescription"]);
		if (row["hasleaders"] == "1") {
			$('#modal_grouparea_leaders').attr('checked',true);
		}
		/*if (row["definesreg"] == "1") {
			$('#modal_grouparea_regarea').attr('checked',true);
		}*/
		if (row["isregchoice"] == "1") {
			$('#modal_grouparea_publicchoice').attr('checked',true);
		}
		if (row["ismanditory"] == "1") {
			$('#modal_grouparea_choicemanditory').attr('checked',true);
		}
		if (row["haspoints"] == "1") {
			$('#modal_grouparea_haspoints').attr('checked',true);
		}

		$("#modal_grouparea_save").click(function() {
			if ($("#modal_grouparea_labelinput").val() != row["label"]) {
				MRDB.db_changedata("groupareas",groupareaid,"label",$("#modal_grouparea_labelinput").val());
			}
			
			if ($("#modal_grouparea_publicdescription").val() != row["publicdescription"]) {
				MRDB.db_changedata("groupareas",groupareaid,"publicdescription",$("#modal_grouparea_publicdescription").val());
			}
			
			var hasleaders = "0"; if ($("#modal_grouparea_leaders").is(':checked')) { hasleaders = "1"; }
			if (hasleaders != row["hasleaders"]) {
				MRDB.db_changedata("groupareas",groupareaid,"hasleaders",hasleaders);
			}

			/*var definesreg = "0"; if ($("#modal_grouparea_regarea").is(':checked')) { definesreg = "1"; }
			if (definesreg != row["definesreg"]) {
				MRDB.db_changedata("groupareas",groupareaid,"definesreg",definesreg);
			}*/

			var isregchoice = "0"; if ($("#modal_grouparea_publicchoice").is(':checked')) { isregchoice = "1"; }
			if (isregchoice != row["isregchoice"]) {
				MRDB.db_changedata("groupareas",groupareaid,"isregchoice",isregchoice);
			}

			var ismanditory = "0"; if ($("#modal_grouparea_choicemanditory").is(':checked')) { ismanditory = "1"; }
			if (ismanditory != row["ismanditory"]) {
				MRDB.db_changedata("groupareas",groupareaid,"ismanditory",ismanditory);
			}

			var haspoints = "0"; if ($("#modal_grouparea_haspoints").is(':checked')) { haspoints = "1"; }
			if (haspoints != row["haspoints"]) {
				MRDB.db_changedata("groupareas",groupareaid,"haspoints",haspoints);
			}

			$.modal.close();
		});
	}

	MRDB.executeSQLWithCallback("select * from groupareas where rowid=?",[groupareaid],fillform);
}

function grouparea_del(groupareaid) {
	$("#modal_areyousure").modal();
	$("#confirm_submit").click(function() {
		MRDB.db_delrow("groupareas",groupareaid);
		$.modal.close();
	});
}

function grouparea_addgroup(groupareaid) {
	$("#modal_group").modal();
	$("#modal_group_save").click(function () {
		var groupid = MRDB.generateid();
		var data = {"label":$("#modal_group_labelinput").val(),"rowid":groupid,"groupareaid":groupareaid,"modifier":$("#modal_group_modifier").val(),"ordering":group_nextordering(groupareaid)}
		MRDB.db_addrow("groups",data);
		$.modal.close();
	});
}

function cb_addrow(tablename,data) {
	if (tablename == "groups") {
		refresh_grouparea(data['groupareaid']);
		refresh_points();
		refresh_budget();
	}
	if (tablename == "groupmembership") {
		refresh_groupareas();
		refresh_peoplefinances();
	}
	if (tablename == "registrations") {
		refresh_registrations();
	}
	if (tablename == "people") {
		refresh_people();
		refresh_peoplefinances();
	}
	if (tablename == "settings") {
		loadsettings();
	}
	if (tablename == "customfields") {
		refresh_customfields();
	}
	if (tablename == "points") {
		refresh_points();
	}
	if (tablename == "payments" || tablename == "payments_allocation") {
		finance_refreshpayments();
		refresh_budget();
		refresh_peoplefinances();
	}
	if (tablename == "spenders" || tablename == "expenditures") {
		refresh_spenders();
	}
	if (tablename == "budgetareas" || tablename == "expenditures") {
		refresh_budget();
	}
	if (tablename == "groupareas") {
		refresh_groupareas();
	}
	if (tablename == "affiliationgroups") {
		refresh_affiliationgroups();
	}
}

function cb_delrow(tablename,rowid) {
	if (tablename == "groups") {
		//$("#group_row"+rowid).detach();
		refresh_points();
		refresh_groupareas();
		refresh_budget();
	}
	if (tablename == "groupmembership") {
		refresh_groupareas();
		refresh_peoplefinances();
	}
	if (tablename == "registrations") {
		refresh_registrations();
	}
	if (tablename == "people") {
		refresh_people();
		refresh_peoplefinances();
	}
	if (tablename == "settings") {
		loadsettings();
	}
	if (tablename == "customfields") {
		refresh_customfields();
	}
	if (tablename == "points") {
		refresh_points();
	}
	if (tablename == "payments" || tablename == "payments_allocation") {
		finance_refreshpayments();
		refresh_budget();
		refresh_peoplefinances();
	}
	if (tablename == "spenders" || tablename == "expenditures") {
		refresh_spenders();
	}
	if (tablename == "budgetareas" || tablename == "expenditures") {
		refresh_budget();
	}
	if (tablename == "groupareas") {
		refresh_groupareas();
	}
	if (tablename == "affiliationgroups") {
		refresh_affiliationgroups();
	}	
}

function cb_changedata(tablename,rowid,colname,newvalue) {
	if (tablename == "groups") {
		//refresh_group(rowid);
		refresh_groupareas();
		refresh_points();
		refresh_budget();
		refresh_peoplefinances();
	}
	if (tablename == "groupmembership") {
		refresh_groupareas();
		refresh_peoplefinances();
	}
	if (tablename == "registrations") {
		refresh_registrations();
	}
	if (tablename == "people") {
		refresh_people();
	}
	if (tablename == "settings") {
		loadsettings();
	}
	if (tablename == "customfields") {
		refresh_customfields();
	}
	if (tablename == "points") {
		refresh_points();
	}
	if (tablename == "payments" || tablename == "payments_allocation") {
		finance_refreshpayments();
		refresh_budget();
	}
	if (tablename == "spenders" || tablename == "expenditures") {
		refresh_spenders();
	}
	if (tablename == "budgetareas" || tablename == "expenditures") {
		refresh_budget();
	}
	if (tablename == "groupareas") {
		refresh_groupareas();
	}
	if (tablename == "affiliationgroups") {
		refresh_affiliationgroups();
	}
	if (tablename == "people" && colname == "archived") {
		//alert("changed to archive value detected");
		cb_generalrefresh();
	}
}

function cb_generalrefresh() {
	refresh_affiliationgroups();
	refresh_groupareas();
	refresh_registrations();
	refresh_people();
	loadsettings();
	refresh_customfields();
	refresh_points();
	finance_refreshpayments();
	refresh_spenders();
	refresh_budget();
	refresh_peoplefinances();
}

var eventsettings = new Array();
var eventsettings_lookup = new Array();
function loadsettings() {
	function settingsresult(success,result) {
		eventsettings = new Array();
		eventsettings_lookup = new Array();
		for (var x in result) {
			var row = result[x];
			eventsettings[row["varname"]] = row["varvalue"];
			eventsettings_lookup[row["varname"]] = row["rowid"];
		}
		loadpublicinterface();
	}
	MRDB.executeSQLWithCallback("select * from settings",[],settingsresult);
}

function getsetting(varname,valueifnotset) {
	if (varname in eventsettings) {
		return eventsettings[varname];
	} else {
		return valueifnotset;
	}
}

function setsetting(varname,varvalue) {
	//alert("Old setting: "+getsetting(varname,"NOTSET")+" to "+varvalue);
	if (getsetting(varname,"") != varvalue) {
		if (varname in eventsettings) {
			MRDB.db_changedata("settings",eventsettings_lookup[varname],"varvalue",varvalue);
		} else {
			var rid = MRDB.generateid();
			var data = {"varname":varname,"rowid":rid,"varvalue":varvalue}
			eventsettings_lookup[varname] = rid;
			MRDB.db_addrow("settings",data);
		}
		eventsettings[varname] = varvalue;
	} else {
		//alert(getsetting(varname,"")+" compared to "+varvalue);
	}
}

function showinterface(interfacename) {
	$(".primaryinterface").css("display","none");
	$("#interface_"+interfacename).css("display","");
	try { eval("refresh_"+interfacename+"();"); } catch(err) { }
}

function loadpublicinterface() {
	$("#public_statustoggle").unbind();
	if (getsetting("publicstatus","disabled") == "enabled") {
		$("#public_statusfield").text("Registration is currently ONLINE");
		$("#public_statustoggle").val("Take Offline");
		$("#public_statustoggle").click(function () {
			setsetting("publicstatus","disabled");
		});
	} else {
		$("#public_statusfield").text("Registration is currently OFFLINE");
		$("#public_statustoggle").val("Take Online");
		$("#public_statustoggle").click(function () {
			setsetting("publicstatus","enabled");
		});
	}
	$("#public_description").val(getsetting("publicdescription",""));
	$("#public_url").val(getsetting("publicurl",""));
	$("#public_headerinstructions").val(getsetting("publicheaderinstructions",""));
	$("#public_footerinstructions").val(getsetting("publicfooterinstructions",""));
	$("#public_regsuccess").val(getsetting("publicsuccessmessage",""));
	$("#public_emailsuccess").val(getsetting("publicemailmessage",""));
	$("#public_notifyemail").val(getsetting("emailnotificationaddress",""));
	if (getsetting("useshop") == "yes") { $("#public_useshop").attr('checked',true); } else { $("#public_useshop").attr('checked',false); }
	for (var p in peoplefieldlist) {
		if (getsetting("manditory_"+peoplefieldlist[p]) == "yes") {
			$("#public_fieldmanditory_"+peoplefieldlist[p]).attr('checked',true);
		} else {
			$("#public_fieldmanditory_"+peoplefieldlist[p]).attr('checked',false);
		}
	}
}

function customfield_modify(fieldid) {
	//alert("Mod "+fieldid);
	$("#modal_customfield").modal();
	$("#modal_customfield_fieldtype").change(function() {
		if ($("#modal_customfield_fieldtype").val() == "list") {
			$("#modal_customfield_listfields").css("display","");
		} else {
			$("#modal_customfield_listfields").css("display","none");
		}
	});
	$("#modal_customfield_listfields_add").click(function() {
		$("#modal_customfield_listfields_table").append("<tr><td class='listfield_val'>"+$("#modal_customfield_listfields_text").val()+"</td><td><input type='button' value='Rem' class='modal_customfield_delbutton'/></td></tr>");
		$("#modal_customfield_listfields_text").val("");
		$(".modal_customfield_delbutton").unbind("click");
		$(".modal_customfield_delbutton").click(function() {
			$(this).parents("tr").remove();
		});
	})
	
	function customfield_modify2(success,result,sql,params) {
		var thefieldid = params[0];
		var row = result[0];
		$("#modal_customfield_label").val(row["fieldname"]);
		$("#modal_customfield_fieldtype").val(row["fieldtype"]);
		if (row["fieldtype"] == "list") {
			$("#modal_customfield_listfields").css("display","");
			var sdata = row["fielddata"].split("<>");
			for (var z in sdata) {
				if (sdata[z] != "") {
					$("#modal_customfield_listfields_table").append("<tr><td class='listfield_val'>"+sdata[z]+"</td><td><input type='button' value='Rem' class='modal_customfield_delbutton'/></td></tr>");
				}
			}
			$(".modal_customfield_delbutton").click(function() {
				$(this).parents("tr").remove();
			});
		}
		$("#modal_customfield_instructions").val(row["publicinstructions"]);
		if (row["isonreg"] != "1") {
			$('#modal_customfield_isreg').attr('checked',false);
		}
		if (row["ismanditory"] == "1") {
			$('#modal_customfield_ismanditory').attr('checked',true);
		}
		
		$("#modal_customfield_confirm_submit").click(function () {
			var ispub = "0"; if ($("#modal_customfield_isreg").is(':checked')) { ispub = "1"; }
			var isman = "0"; if ($("#modal_customfield_ismanditory").is(':checked')) { isman = "1"; }
			var fielddata = "";
			if ($("#modal_customfield_fieldtype").val() == "list") {
				$("#modal_customfield_listfields_table tr").each(function() {
					fielddata = fielddata + "<>" + $(this).children(".listfield_val").text();
				});
			}
			if (isman != row["ismanditory"]) {
				MRDB.db_changedata("customfields",thefieldid,"ismanditory",isman);	
			}
			if (ispub != row["isonreg"]) {
				MRDB.db_changedata("customfields",thefieldid,"isonreg",ispub);	
			}
			if ($("#modal_customfield_label").val() != row["fieldname"]) {
				MRDB.db_changedata("customfields",thefieldid,"fieldname",$("#modal_customfield_label").val());
			}
			if ($("#modal_customfield_fieldtype").val() != row["fieldtype"]) {
				MRDB.db_changedata("customfields",thefieldid,"fieldtype",$("#modal_customfield_fieldtype").val());
			}
			if (fielddata != row["fielddata"]) {
				MRDB.db_changedata("customfields",thefieldid,"fielddata",fielddata);
			}
			if ($("#modal_customfield_instructions").val() != row["publicinstructions"]) {
				MRDB.db_changedata("customfields",thefieldid,"publicinstructions",$("#modal_customfield_instructions").val());
			}
			
			$.modal.close();
		});
	}
	MRDB.executeSQLWithCallback("select * from customfields where rowid=?",[fieldid],customfield_modify2);
}

function customfield_delete(fieldid) {
	$("#modal_areyousure").modal();
	$("#confirm_submit").click(function () {
		MRDB.db_delrow("customfields",fieldid);
		$.modal.close();
	});
}

function customfield_moveup(fieldid) {
	//alert(fieldid);
	var currentcount = 0;
	var othercount = 0;
	var otherid = "";
	function selectresultup(success,result,sql,params,passedid) {
		var trigger = false;
		lastordering = 0;
		for (var x in result) {
			var row = result[x];
			var thisordering = row["ordering"];
			if (thisordering == null || thisordering == "") {
				thisordering = lastordering + 1000;
				MRDB.db_changedata("customfields",row["rowid"],"ordering",thisordering);
				lastordering = thisordering;
			} else {
				lastordering = thisordering;
			}
			if (trigger) {
				if (otherid != "") {
					MRDB.db_changedata("customfields",otherid,"ordering",thisordering);
					MRDB.db_changedata("customfields",row["rowid"],"ordering",othercount);
				}
				trigger = false;
			}
			if (row["rowid"] == passedid) {
				trigger = true;
			}
			othercount = thisordering;
			otherid = row["rowid"];
		}
	}
	MRDB.executeSQLWithCallback("select * from customfields order by ordering DESC",[],selectresultup,fieldid);
}

function customfield_movedown(fieldid) {
	var currentcount = 0;
	var othercount = 0;
	var otherid = "";
	function selectresultdown(success,result,sql,params,passedid) {
		var trigger = false;
		lastordering = 0;
		for (var x in result) {
			var row = result[x];
			var thisordering = row["ordering"];
			if (thisordering == null || thisordering == "") {
				thisordering = lastordering + 1000;
				MRDB.db_changedata("customfields",row["rowid"],"ordering",thisordering);
				lastordering = thisordering;
			} else {
				lastordering = thisordering;
			}
			if (trigger) {
				if (otherid != "") {
					MRDB.db_changedata("customfields",otherid,"ordering",thisordering);
					MRDB.db_changedata("customfields",row["rowid"],"ordering",othercount);
				}
				trigger = false;
			}
			if (row["rowid"] == passedid) {
				trigger = true;
			}
			othercount = thisordering;
			otherid = row["rowid"];
		}
	}
	MRDB.executeSQLWithCallback("select * from customfields order by ordering",[],selectresultdown,fieldid);
}

function viewaffiliationgroup(groupid) {
	function viewaffiliationgroup_step2(success,result) {
		function viewaffiliationgroup_step3(success2,result2) {
			$("#modal_affiliationgroupviewer").modal({containerCss: {width:"95%",height:"90%"}});
			$("#modal_affiliationgroupviewer_datalist").empty();
			for (var i in result2) {
				var person = result2[i];
				$("#modal_affiliationgroupviewer_datalist").append("<tr id='affiliationviewerrow_"+person["rowid"]+"'>\n\
					<td class='modal_affiliationgroupviewer_datalist' id='affiliationviewerrow_"+person["rowid"]+"_firstname'></td>\n\
					<td class='modal_affiliationgroupviewer_datalist' id='affiliationviewerrow_"+person["rowid"]+"_lastname'></td>\n\
					<td class='modal_affiliationgroupviewer_datalist' id='affiliationviewerrow_"+person["rowid"]+"_gender'></td>\n\
					<td class='modal_affiliationgroupviewer_datalist' id='affiliationviewerrow_"+person["rowid"]+"_birthdate'></td>\n\
					<td class='modal_affiliationgroupviewer_datalist'><input type='button' value='View' onClick='closecheck(\"viewperson(\\\""+person["rowid"]+"\\\")\")''/></td>\n\
				</tr>");
				$("#affiliationviewerrow_"+person["rowid"]+"_firstname").text(person["firstname"]);
				$("#affiliationviewerrow_"+person["rowid"]+"_lastname").text(person["lastname"]);
				$("#affiliationviewerrow_"+person["rowid"]+"_gender").text(person["gender"]);
				$("#affiliationviewerrow_"+person["rowid"]+"_birthdate").text(person["birthdate"]+" ("+getage(parsedate(person["birthdate"]))+")");
			}
			if (result2.length == 0) {
				$("#modal_affiliationgroupviewer_datalist").append("<tr><td>There are no people in this group</td></tr>");
			}
		}
		MRDB.executeSQLWithCallback("select * from people where affiliation=? and (archived IS NULL or archived!=1) order by lastname COLLATE NOCASE,firstname COLLATE NOCASE",[groupid],viewaffiliationgroup_step3);
	}
	MRDB.executeSQLWithCallback("select * from affiliationgroups where rowid=?",[groupid],viewaffiliationgroup_step2);
}

function viewunaffiliatedgroup() {
	//function viewunaffilitatedgroup_step2(success,result) {
		function viewunaffilitatedgroup_step3(success2,result2) {
			$("#modal_affiliationgroupviewer").modal({containerCss: {width:"95%",height:"90%"}});
			$("#modal_affiliationgroupviewer_datalist").empty();
			for (var i in result2) {
				var person = result2[i];
				$("#modal_affiliationgroupviewer_datalist").append("<tr id='affiliationviewerrow_"+person["rowid"]+"'>\n\
					<td class='modal_affiliationgroupviewer_datalist' id='affiliationviewerrow_"+person["rowid"]+"_firstname'></td>\n\
					<td class='modal_affiliationgroupviewer_datalist' id='affiliationviewerrow_"+person["rowid"]+"_lastname'></td>\n\
					<td class='modal_affiliationgroupviewer_datalist' id='affiliationviewerrow_"+person["rowid"]+"_gender'></td>\n\
					<td class='modal_affiliationgroupviewer_datalist' id='affiliationviewerrow_"+person["rowid"]+"_birthdate'></td>\n\
					<td class='modal_affiliationgroupviewer_datalist'><input type='button' value='View' onClick='closecheck(\"viewperson(\\\""+person["rowid"]+"\\\")\")''/></td>\n\
				</tr>");
				$("#affiliationviewerrow_"+person["rowid"]+"_firstname").text(person["firstname"]);
				$("#affiliationviewerrow_"+person["rowid"]+"_lastname").text(person["lastname"]);
				$("#affiliationviewerrow_"+person["rowid"]+"_gender").text(person["gender"]);
				$("#affiliationviewerrow_"+person["rowid"]+"_birthdate").text(person["birthdate"]+" ("+getage(parsedate(person["birthdate"]))+")");
			}
			if (result2.length == 0) {
				$("#modal_affiliationgroupviewer_datalist").append("<tr><td>There are no people in this group</td></tr>");
			}
		}
		MRDB.executeSQLWithCallback("select * from people where (archived IS NULL or archived!=1) and affiliation NOT IN (select rowid from affiliationgroups) order by lastname COLLATE NOCASE,firstname COLLATE NOCASE",[],viewunaffilitatedgroup_step3);
		//select p2.* from people p2 where (p2.archived IS NULL or p2.archived!=1) and p2.rowid NOT IN (select p.rowid from people p,groups g,groupmembership gm where (p.archived IS NULL or p.archived!=1) and gm.personid=p.rowid and gm.groupid=g.rowid and g.groupareaid=?) order by p2.lastname,p2.firstname
	//}
	//MRDB.executeSQLWithCallback("select * from affiliationgroups where rowid=?",[groupid],viewunaffilitatedgroup_step2);
}

function reportaffiliationgroup(groupid) {
	function viewaffiliationgroup_step2(success,result) {
		function viewaffiliationgroup_step3(success2,result2) {
			var newwindow = window.open('','ReportWindow','status=1,toolbar=1,location=1,menubar=1,statusbar=1');
			newwindow.document.write('<html><head><title></title><link rel="stylesheet" type="text/css" href="/assets/printable.css"/></head><body><h1 id="header"></h1><table><thead><tr><th class="modal_groupview_datalist">First Name</th><th class="modal_groupview_datalist modal_groupview_datalist_last">Last Name</th><th>Gender</th><th>Birthdate (Age)</th></tr></thead><tbody id="modal_affiliationgroupviewer_datalist"></tbody></table></body></html>');
			$("#header",newwindow.document).text(affiliationgrouplist[groupid]["groupname"]);

			for (var i in result2) {
				var person = result2[i];
				$("#modal_affiliationgroupviewer_datalist",newwindow.document).append("<tr id='affiliationviewerrow_"+person["rowid"]+"'>\n\
					<td class='modal_affiliationgroupviewer_datalist' id='affiliationviewerrow_"+person["rowid"]+"_firstname'></td>\n\
					<td class='modal_affiliationgroupviewer_datalist' id='affiliationviewerrow_"+person["rowid"]+"_lastname'></td>\n\
					<td class='modal_affiliationgroupviewer_datalist' id='affiliationviewerrow_"+person["rowid"]+"_gender'></td>\n\
					<td class='modal_affiliationgroupviewer_datalist' id='affiliationviewerrow_"+person["rowid"]+"_birthdate'></td>\n\
				</tr>");
				$("#affiliationviewerrow_"+person["rowid"]+"_firstname",newwindow.document).text(person["firstname"]);
				$("#affiliationviewerrow_"+person["rowid"]+"_lastname",newwindow.document).text(person["lastname"]);
				$("#affiliationviewerrow_"+person["rowid"]+"_gender",newwindow.document).text(person["gender"]);
				$("#affiliationviewerrow_"+person["rowid"]+"_birthdate",newwindow.document).text(person["birthdate"]+" ("+getage(parsedate(person["birthdate"]))+")");
			}
			if (result2.length == 0) {
				$("#modal_affiliationgroupviewer_datalist",newwindow.document).append("<tr><td>There are no people in this group</td></tr>");
			}
		}
		MRDB.executeSQLWithCallback("select * from people where affiliation=? and (archived IS NULL or archived!=1) order by lastname,firstname",[groupid],viewaffiliationgroup_step3);
	}
	MRDB.executeSQLWithCallback("select * from affiliationgroups where rowid=?",[groupid],viewaffiliationgroup_step2);
}

function delperson(personid) {
	$("#modal_areyousure").modal();
	$("#confirm_submit").click(function() {
		MRDB.db_changedata("people",personid,"archived","1");
		$.modal.close();
	});
}

function viewperson(personid) {
	function viewperson_step2(success2,result2) {
		function viewperson_step3(success3,result3) {
			function viewperson_step4(success4,result4) {
				function viewperson_step5(success5,result5) {
					function viewperson_step6(success6,result6) {
						$("#modal_person").modal({containerCss: {width:"95%",height:"90%"}});
						$("#modal_person_reportbutton").click(function() {
							report_person(persondata["rowid"]);
						});
						$("#modal_person_removebutton").click(function() {
							closecheck("delperson(\""+persondata["rowid"]+"\");");
						});
						var persondata = result2[0];
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

						var affilvalue = "None";
						for (var i in affiliationgrouplist) {
							if (affiliationgrouplist[i]["rowid"] == persondata["affiliation"]) {
								affilvalue = affiliationgrouplist[i]["groupname"];
							}
						}
						$("#modal_person_field_affiliation").text(affilvalue);
						
						if (getsetting("useshop") != "yes") {
							$("#modal_person_shoparea").css("display","none");
						} else {
							$("#modal_person_field_shopvouch").text(persondata["shopvouch"]);
						}
						$("#modal_person_customtable").empty();
						for (var i in customfieldlist) {
							var thevalue = "";
							for (var x in result4) {
								if (result4[x]["fieldid"] == customfieldlist[i]["rowid"]) {
									thevalue = result4[x]["fieldvalue"];
								}
							}
							$("#modal_person_customtable").append("<tr><td class='modal_person_customtable_fieldname'>"+customfieldlist[i]["fieldname"]+":</td><td class='modal_person_customtable_value'>"+thevalue+"</td></tr>");
						}

						$("#modal_person_financetable").empty();
						// Money in
						var moneybalance = 0.00;
						for (var i in result6) {
							$("#modal_person_financetable").append("<tr><td class='modal_person_financetable_type'>In</td><td class='modal_person_financetable_label'>Desc</td><td class='modal_person_financetable_modifier'>"+fd(result6[i]["amount"])+"</td></tr>");
							moneybalance = moneybalance + parsef(result6[i]["amount"]);
						}

						$("#modal_person_grouptable").empty();
						for (i in groupareadata) {
							var membergroup = "None";
							var chosengroupdata = {"label":"Nothing Chosen","modifier":0};
							for (var y in groupdata[i]) {
								for (x in result3) {
									if (result3[x]["groupid"] == y) {
										var leadervar = "";
										if (result3[x]["isleader"] == "1") {
											leadervar = " (Leader)";
										}
										membergroup = groupdata[i][y]["label"]+leadervar+" <input type='button' value='View' onClick='closecheck(\"group_view(\\\""+y+"\\\")\");'/>";
										chosengroupdata = groupdata[i][y];
									}
								}
							}
							$("#modal_person_grouptable").append("<tr><td class='modal_person_grouptable_label'>"+groupareadata[i]["label"]+":</td><td class='modal_person_grouptable_group'>"+membergroup+"</td></tr>");
							$("#modal_person_financetable").append("<tr><td class='modal_person_financetable_type'>Cost</td><td class='modal_person_financetable_label'>"+groupareadata[i]["label"]+" - "+chosengroupdata["label"]+"</td><td class='modal_person_financetable_modifier'>"+fd(chosengroupdata["modifier"])+"</td></tr>");
							moneybalance = moneybalance - parsef(chosengroupdata["modifier"]);
						}
						$("#modal_person_modbutton").click(function() {
							closecheck("modperson(\""+personid+"\");");
						});

						if (getsetting("useshop") == "yes") {
							$("#modal_person_financetable").append("<tr><td class='modal_person_financetable_type'>Cost</td><td class='modal_person_financetable_label'>Shop Vouch</td><td class='modal_person_financetable_modifier'>"+fd(persondata["shopvouch"])+"</td></tr>");
							moneybalance = moneybalance - parsef(persondata["shopvouch"]);
						}

						$("#modal_person_financetable").append("<tr><td colspan='2' class='modal_person_financetable_total'>Total:</td><td class='modal_person_financetable_modifier'>"+fd(moneybalance)+"</td></tr>");
					}
					MRDB.executeSQLWithCallback("select * from payments_allocation where personid=?",[personid],viewperson_step6);
				}
				MRDB.executeSQLWithCallback("select * from shoptransaction where personid=?",[personid],viewperson_step5);
			}
			MRDB.executeSQLWithCallback("select * from people_customdata where personid=?",[personid],viewperson_step4);
		}
		MRDB.executeSQLWithCallback("select * from groupmembership where personid=?",[personid],viewperson_step3);
	}
	MRDB.executeSQLWithCallback("select * from people where rowid=?",[personid],viewperson_step2);
}

function report_person(personid) {
	function viewperson_step2(success2,result2) {
		function viewperson_step3(success3,result3) {
			function viewperson_step4(success4,result4) {
				function viewperson_step5(success5,result5) {
					function viewperson_step6(success6,result6) {
						var newwindow = window.open('','ReportWindow','status=1,toolbar=1,location=1,menubar=1,statusbar=1');
						newwindow.document.write('<html><head><title></title><link rel="stylesheet" type="text/css" href="/assets/printable.css"/></head><body></body></html>');
						$("body",newwindow.document).html($("#modal_person").html());
						//modal_person
//						$("#header",newwindow.document).text(persondata["firstname"]+" "+persondata["lastname"]);

//						$("#modal_person").modal({containerCss: {width:"95%",height:"90%"}});
						var persondata = result2[0];
						$("#modal_person_field_firstname",newwindow.document).text(persondata["firstname"]);
						$("#modal_person_field_lastname",newwindow.document).text(persondata["lastname"]);
						$("#modal_person_field_homephone",newwindow.document).text(persondata["homephone"]);
						$("#modal_person_field_mobilephone",newwindow.document).text(persondata["mobilephone"]);
						$("#modal_person_field_email",newwindow.document).text(persondata["email"]);
						$("#modal_person_field_parents_name",newwindow.document).text(persondata["parents_name"]);
						$("#modal_person_field_parents_phone",newwindow.document).text(persondata["parents_phone"]);
						$("#modal_person_field_emergencyinfo",newwindow.document).text(persondata["emergencyinfo"]);
						$("#modal_person_field_carecard",newwindow.document).text(persondata["carecard"]);
						$("#modal_person_field_birthdate",newwindow.document).text(persondata["birthdate"]);
						$("#modal_person_field_age",newwindow.document).text(getage(parsedate(persondata["birthdate"])));
						$("#modal_person_field_gender",newwindow.document).text(persondata["gender"]);
						$("#modal_person_field_address_street",newwindow.document).text(persondata["address_street"]);
						$("#modal_person_field_address_city",newwindow.document).text(persondata["address_city"]);
						$("#modal_person_field_address_postal",newwindow.document).text(persondata["address_postal"]);
						$("#modal_person_field_comments",newwindow.document).text(persondata["comments"]);
						showimage($("#modal_person_field_image",newwindow.document),persondata["picturefileid"],"small",false);

						var affilvalue = "None";
						for (var i in affiliationgrouplist) {
							if (affiliationgrouplist[i]["rowid"] == persondata["affiliation"]) {
								affilvalue = affiliationgrouplist[i]["groupname"];
							}
						}
						$("#modal_person_field_affiliation",newwindow.document).text(affilvalue);
						
						if (getsetting("useshop") != "yes") {
							$("#modal_person_shoparea",newwindow.document).css("display","none");
						} else {
							$("#modal_person_field_shopvouch",newwindow.document).text(persondata["shopvouch"]);
						}
						$("#modal_person_customtable",newwindow.document).empty();
						for (var i in customfieldlist) {
							var thevalue = "";
							for (var x in result4) {
								if (result4[x]["fieldid"] == customfieldlist[i]["rowid"]) {
									thevalue = result4[x]["fieldvalue"];
								}
							}
							$("#modal_person_customtable",newwindow.document).append("<tr><td class='modal_person_customtable_fieldname'>"+customfieldlist[i]["fieldname"]+":</td><td class='modal_person_customtable_value'>"+thevalue+"</td></tr>");
						}

						$("#modal_person_financetable",newwindow.document).empty();
						// Money in
						var moneybalance = 0.00;
						for (var i in result6) {
							$("#modal_person_financetable",newwindow.document).append("<tr><td class='modal_person_financetable_type'>In</td><td class='modal_person_financetable_label'>Desc</td><td class='modal_person_financetable_modifier'>"+fd(result6[i]["amount"])+"</td></tr>");
							moneybalance = moneybalance + parsef(result6[i]["amount"]);
						}

						$("#modal_person_grouptable",newwindow.document).empty();
						for (i in groupareadata) {
							var membergroup = "None";
							var chosengroupdata = {"label":"Nothing Chosen","modifier":0};
							for (var y in groupdata[i]) {
								for (x in result3) {
									if (result3[x]["groupid"] == y) {
										var leadervar = "";
										if (result3[x]["isleader"] == "1") {
											leadervar = " (Leader)";
										}
										membergroup = groupdata[i][y]["label"]+leadervar+" <input type='button' value='View' onClick='closecheck(\"group_view(\\\""+y+"\\\")\");'/>";
										chosengroupdata = groupdata[i][y];
									}
								}
							}
							$("#modal_person_grouptable",newwindow.document).append("<tr><td class='modal_person_grouptable_label'>"+groupareadata[i]["label"]+":</td><td class='modal_person_grouptable_group'>"+membergroup+"</td></tr>");
							$("#modal_person_financetable",newwindow.document).append("<tr><td class='modal_person_financetable_type'>Cost</td><td class='modal_person_financetable_label'>"+groupareadata[i]["label"]+" - "+chosengroupdata["label"]+"</td><td class='modal_person_financetable_modifier'>"+fd(chosengroupdata["modifier"])+"</td></tr>");
							moneybalance = moneybalance - parsef(chosengroupdata["modifier"]);
						}
						$("#modal_person_modbutton",newwindow.document).click(function() {
							closecheck("modperson(\""+personid+"\");");
						});

						if (getsetting("useshop") == "yes") {
							$("#modal_person_financetable",newwindow.document).append("<tr><td class='modal_person_financetable_type'>Cost</td><td class='modal_person_financetable_label'>Shop Vouch</td><td class='modal_person_financetable_modifier'>"+fd(persondata["shopvouch"])+"</td></tr>");
							moneybalance = moneybalance - parsef(persondata["shopvouch"]);
						}

						$("#modal_person_financetable",newwindow.document).append("<tr><td colspan='2' class='modal_person_financetable_total'>Total:</td><td class='modal_person_financetable_modifier'>"+fd(moneybalance)+"</td></tr>");
						$(":button",newwindow.document).remove();
					}
					MRDB.executeSQLWithCallback("select * from payments_allocation where personid=?",[personid],viewperson_step6);
				}
				MRDB.executeSQLWithCallback("select * from shoptransaction where personid=?",[personid],viewperson_step5);
			}
			MRDB.executeSQLWithCallback("select * from people_customdata where personid=?",[personid],viewperson_step4);
		}
		MRDB.executeSQLWithCallback("select * from groupmembership where personid=?",[personid],viewperson_step3);
	}
	MRDB.executeSQLWithCallback("select * from people where rowid=?",[personid],viewperson_step2);
}

function modperson(personid) {
	function viewperson_step2(success2,result2) {
		function viewperson_step3(success3,result3) {
			function viewperson_step4(success4,result4) {
				$("#modal_modperson").modal({containerCss: {width:"800",height:"600"}});
				$("#modal_modperson_field_birthdate").datepicker({
					changeMonth: true,
					changeYear: true,
					yearRange: "c-80:c+100"
				});
				var persondata = result2[0];
				$("#modal_modperson_field_firstname").val(persondata["firstname"]);
				$("#modal_modperson_field_lastname").val(persondata["lastname"]);
				$("#modal_modperson_field_homephone").val(persondata["homephone"]);
				$("#modal_modperson_field_mobilephone").val(persondata["mobilephone"]);
				$("#modal_modperson_field_email").val(persondata["email"]);
				$("#modal_modperson_field_parents_name").val(persondata["parents_name"]);
				$("#modal_modperson_field_parents_phone").val(persondata["parents_phone"]);
				$("#modal_modperson_field_emergencyinfo").val(persondata["emergencyinfo"]);
				$("#modal_modperson_field_carecard").val(persondata["carecard"]);
				$("#modal_modperson_field_birthdate").val(persondata["birthdate"]);
				$("#modal_modperson_field_gender option[value='"+persondata["gender"]+"']").attr('selected', 'selected');
				$("#modal_modperson_field_address_street").val(persondata["address_street"]);
				$("#modal_modperson_field_address_city").val(persondata["address_city"]);
				$("#modal_modperson_field_address_postal").val(persondata["address_postal"]);
				$("#modal_modperson_field_comments").val(persondata["comments"]);
				showimage($("#modal_modperson_field_image"),persondata["picturefileid"],"small",true);
				//modal_processreg_affiliation
				for (var i in affiliationgrouplist) {
					$("#modal_modperson_field_affiliation").append($("<option></option>").attr("value",affiliationgrouplist[i]["rowid"]).text(affiliationgrouplist[i]["groupname"])); 
				}
				$("#modal_modperson_field_affiliation option[value='"+persondata["affiliation"]+"']").attr('selected', 'selected');
				
				if (getsetting("useshop") != "yes") {
					$("#modal_modperson_shoparea").css("display","none");
				} else {
					$("#modal_modperson_field_shopamount").val(persondata["shopvouch"]);
				}
				$("#modal_modperson_customtable").empty();
				for (var i in customfieldlist) {
					var thevalue = "";
					for (var x in result4) {
						if (result4[x]["fieldid"] == customfieldlist[i]["rowid"]) {
							thevalue = result4[x]["fieldvalue"];
						}
					}
					var inputfield = "";
					if (customfieldlist[i]["fieldtype"] == "largetext") {
						inputfield = "<textarea id='modal_modperson_customtable_"+i+"'></textarea>";
					} else if (customfieldlist[i]["fieldtype"] == "list") {
						var sdata = customfieldlist[i]["fielddata"].split("<>");
						var slist = "<option value=\""+thevalue+"\">"+thevalue+"</option>";
						for (var z in sdata) {
							if (sdata[z] != "") {
								slist = slist + "<option value=\""+sdata[z]+"\">"+sdata[z]+"</option>";
							}
						}
						inputfield = "<select id='modal_modperson_customtable_"+i+"'>"+slist+"</select>";
					} else {
						inputfield = "<input type='text' size='25' id='modal_modperson_customtable_"+i+"'/>";
					}
					$("#modal_modperson_customtable").append("<tr><td class='modal_fieldlabelcell'>"+customfieldlist[i]["fieldname"]+"</td><td>"+inputfield+"</td></tr>");
					$("#modal_modperson_customtable_"+i).val(thevalue);
				}
				$("#modal_modperson_grouptable").empty();
				for (i in groupareadata) {
					var membergroup = "None";
					var groupoptions = "<option value=''>None Selected</option>";
					for (var y in groupdata[i]) {
						groupoptions = groupoptions + "<option value='"+y+"'>"+groupdata[i][y]["label"]+" ("+fd(groupdata[i][y]["modifier"])+")</option>";
					}
					var leaderoption = "";
					if (groupareadata[i]["hasleaders"] == "1") {
						leaderoption = "<input type='checkbox' id='modal_modperson_grouptable_isleader_"+i+"'/> Leader";
					}
					$("#modal_modperson_grouptable").append("<tr><td class='modal_fieldlabelcell'>"+groupareadata[i]["label"]+"</td>\n\
						<td><select id='modal_modperson_grouptable_options_"+i+"'>"+groupoptions+"</select></td>\n\
						<td class='modal_fieldlabelcell'>"+leaderoption+"</td></tr>");
					for (var y in groupdata[i]) {
						for (x in result3) {
							if (result3[x]["groupid"] == y) {
								if (result3[x]["isleader"] == "1") {
									$("#modal_modperson_grouptable_isleader_"+i).attr('checked',true);
								}
								$("#modal_modperson_grouptable_options_"+i).val(y);
							}
						}
					}
				}
				$("#modal_modperson_savebutton").click(function() {
					if ($("#modal_modperson_field_image").attr("picturefileid") != persondata["picturefileid"]) {
						MRDB.db_changedata("people",personid,"picturefileid",$("#modal_modperson_field_image").attr("picturefileid"));
					}
					if ($("#modal_modperson_field_firstname").val() != persondata["firstname"]) {
						MRDB.db_changedata("people",personid,"firstname",$("#modal_modperson_field_firstname").val());
					}
					if ($("#modal_modperson_field_lastname").val() != persondata["lastname"]) {
						MRDB.db_changedata("people",personid,"lastname",$("#modal_modperson_field_lastname").val());
					}
					if ($("#modal_modperson_field_homephone").val() != persondata["homephone"]) {
						MRDB.db_changedata("people",personid,"homephone",$("#modal_modperson_field_homephone").val());
					}
					if ($("#modal_modperson_field_mobilephone").val() != persondata["mobilephone"]) {
						MRDB.db_changedata("people",personid,"mobilephone",$("#modal_modperson_field_mobilephone").val());
					}
					if ($("#modal_modperson_field_email").val() != persondata["email"]) {
						MRDB.db_changedata("people",personid,"email",$("#modal_modperson_field_email").val());
					}
					if ($("#modal_modperson_field_parents_name").val() != persondata["parents_name"]) {
						MRDB.db_changedata("people",personid,"parents_name",$("#modal_modperson_field_parents_name").val());
					}
					if ($("#modal_modperson_field_parents_phone").val() != persondata["parents_phone"]) {
						MRDB.db_changedata("people",personid,"parents_phone",$("#modal_modperson_field_parents_phone").val());
					}
					if ($("#modal_modperson_field_emergencyinfo").val() != persondata["emergencyinfo"]) {
						MRDB.db_changedata("people",personid,"emergencyinfo",$("#modal_modperson_field_emergencyinfo").val());
					}
					if ($("#modal_modperson_field_carecard").val() != persondata["carecard"]) {
						MRDB.db_changedata("people",personid,"carecard",$("#modal_modperson_field_carecard").val());
					}
					if ($("#modal_modperson_field_birthdate").val() != persondata["birthdate"]) {
						MRDB.db_changedata("people",personid,"birthdate",$("#modal_modperson_field_birthdate").val());
					}
					if ($("#modal_modperson_field_gender").val() != persondata["gender"]) {
						MRDB.db_changedata("people",personid,"gender",$("#modal_modperson_field_gender").val());
					}
					if ($("#modal_modperson_field_address_street").val() != persondata["address_street"]) {
						MRDB.db_changedata("people",personid,"address_street",$("#modal_modperson_field_address_street").val());
					}
					if ($("#modal_modperson_field_address_city").val() != persondata["address_city"]) {
						MRDB.db_changedata("people",personid,"address_city",$("#modal_modperson_field_address_city").val());
					}
					if ($("#modal_modperson_field_address_postal").val() != persondata["address_postal"]) {
						MRDB.db_changedata("people",personid,"address_postal",$("#modal_modperson_field_address_postal").val());
					}
					if ($("#modal_modperson_field_comments").val() != persondata["comments"]) {
						MRDB.db_changedata("people",personid,"comments",$("#modal_modperson_field_comments").val());
					}
					if ($("#modal_modperson_field_affiliation").val() != persondata["affiliation"]) {
						MRDB.db_changedata("people",personid,"affiliation",$("#modal_modperson_field_affiliation").val());
					}

					if (getsetting("useshop") == "yes") {
						var shopvouch = $("#modal_modperson_field_shopamount").val();
						if (shopvouch != persondata["shopvouch"]) {
							MRDB.db_changedata("people",personid,"shopvouch",shopvouch);
						}
					}

					for (var i in customfieldlist) {
						var thevalue = "";
						var theid = MRDB.generateid();
						var foundcustom = false;
						for (var x in result4) {
							if (result4[x]["fieldid"] == customfieldlist[i]["rowid"]) {
								thevalue = result4[x]["fieldvalue"];
								theid = result4[x]["rowid"];
								foundcustom = true;
							}
						}
						if ($("#modal_modperson_customtable_"+i).val() != thevalue) {
							if (foundcustom) {
								MRDB.db_changedata("people_customdata",theid,"fieldvalue",$("#modal_modperson_customtable_"+i).val());
							} else {
								var cdata = {"rowid":theid,"personid":personid,"fieldid":customfieldlist[i]["rowid"],"fieldvalue":$("#modal_modperson_customtable_"+i).val()};
								MRDB.db_addrow("people_customdata",cdata);
							}
						}
					}

					for (i in groupareadata) {
						var invalue = "";
						var isleader = "0";
						var memberid = MRDB.generateid();
						for (var y in groupdata[i]) {
							for (x in result3) {
								if (result3[x]["groupid"] == y) {
									invalue = y;
									memberid = result3[x]["rowid"];
									if (result3[x]["isleader"] == "1") {
										isleader = "1";
									}
								}
							}
						}
						if ($("#modal_modperson_grouptable_options_"+i).val() == "" && invalue != "") {
							MRDB.db_delrow("groupmembership",memberid);
						} else if ($("#modal_modperson_grouptable_options_"+i).val() != invalue) {
							if (invalue != "") {
								MRDB.db_changedata("groupmembership",memberid,"groupid",$("#modal_modperson_grouptable_options_"+i).val());
							} else {
								var data = {"rowid":memberid,"groupid":$("#modal_modperson_grouptable_options_"+i).val(),"personid":personid,"isleader":"0"};
								MRDB.db_addrow("groupmembership",data);
							}
						}

						if ($("#modal_modperson_grouptable_options_"+i).val() != "") {
							if ($("#modal_modperson_grouptable_isleader_"+i).is(':checked')) {
								if (isleader == "0") {
									MRDB.db_changedata("groupmembership",memberid,"isleader","1");
								}
							} else {
								if (isleader == "1") {
									MRDB.db_changedata("groupmembership",memberid,"isleader","0");
								}
							}
						}
					}
					
					$.modal.close();
				});
			}
			MRDB.executeSQLWithCallback("select * from people_customdata where personid=?",[personid],viewperson_step4);
		}
		MRDB.executeSQLWithCallback("select * from groupmembership where personid=?",[personid],viewperson_step3);
	}
	MRDB.executeSQLWithCallback("select * from people where rowid=?",[personid],viewperson_step2);
}

function addperson() {
	$("#modal_newperson").modal({containerCss: {width:"800",height:"600"}});
	$("#modal_newperson_field_birthdate").datepicker({
		changeMonth: true,
		changeYear: true,
		yearRange: "c-100:c+100"
	});
	for (var i in affiliationgrouplist) {
		$("#modal_newperson_field_affiliation").append($("<option></option>").attr("value",affiliationgrouplist[i]["rowid"]).text(affiliationgrouplist[i]["groupname"])); 
	}

	$("#modal_newperson_customtable").empty();
	if (getsetting("useshop") != "yes") {
		$("#modal_newperson_shoparea").css("display","none");
	}
	for (var i in customfieldlist) {
		var inputfield = "";
		if (customfieldlist[i]["fieldtype"] == "largetext") {
			inputfield = "<textarea id='modal_newperson_customtable_"+i+"'></textarea>";
		} else if (customfieldlist[i]["fieldtype"] == "list") {
			var sdata = customfieldlist[i]["fielddata"].split("<>");
			var slist = "";
			for (var z in sdata) {
				if (sdata[z] != "") {
					slist = slist + "<option value=\""+sdata[z]+"\">"+sdata[z]+"</option>";
				}
			}
			inputfield = "<select id='modal_newperson_customtable_"+i+"'>"+slist+"</select>";
		} else {
			inputfield = "<input type='text' size='25' id='modal_newperson_customtable_"+i+"'/>";
		}
		$("#modal_newperson_customtable").append("<tr><td class='modal_fieldlabelcell'>"+customfieldlist[i]["fieldname"]+"</td><td>"+inputfield+"</td></tr>");
	}
	$("#modal_newperson_grouptable").empty();
	for (i in groupareadata) {
		var membergroup = "None";
		var groupoptions = "<option value=''>None Selected</option>";
		for (var y in groupdata[i]) {
			groupoptions = groupoptions + "<option value='"+y+"'>"+groupdata[i][y]["label"]+" ("+fd(groupdata[i][y]["modifier"])+")</option>";
		}
		var leaderoption = "";
		if (groupareadata[i]["hasleaders"] == "1") {
			leaderoption = "<input type='checkbox' id='modal_newperson_grouptable_isleader_"+i+"'/> Leader";
		}
		$("#modal_newperson_grouptable").append("<tr><td class='modal_fieldlabelcell'>"+groupareadata[i]["label"]+"</td>\n\
			<td><select id='modal_newperson_grouptable_options_"+i+"'>"+groupoptions+"</select></td>\n\
			<td class='modal_fieldlabelcell'>"+leaderoption+"</td></tr>");
	}
	$("#modal_newperson_savebutton").click(function() {
		var personid = MRDB.generateid();
		var data = {"rowid":personid};
		//"firstname":$("#modal_newperson_field_firstname").val(),"lastname":$("#modal_newperson_field_lastname").val()
		data["firstname"] = $("#modal_newperson_field_firstname").val();
		data["lastname"] = $("#modal_newperson_field_lastname").val();
		data["homephone"] = $("#modal_newperson_field_homephone").val();
		data["mobilephone"] = $("#modal_newperson_field_mobilephone").val();
		data["email"] = $("#modal_newperson_field_email").val();
		data["parents_name"] = $("#modal_newperson_field_parents_name").val();
		data["parents_phone"] = $("#modal_newperson_field_parents_phone").val();
		data["emergencyinfo"] = $("#modal_newperson_field_emergencyinfo").val();
		data["carecard"] = $("#modal_newperson_field_carecard").val();
		data["birthdate"] = $("#modal_newperson_field_birthdate").val();
		data["gender"] = $("#modal_newperson_field_gender").val();
		data["address_street"] = $("#modal_newperson_field_address_street").val();
		data["address_city"] = $("#modal_newperson_field_address_city").val();
		data["address_postal"] = $("#modal_newperson_field_address_postal").val();
		data["comments"] = $("#modal_newperson_field_comments").val();
		data["affiliation"] = $("#modal_newperson_field_affiliation").val();
		MRDB.db_addrow("people",data);

		for (var i in customfieldlist) {
			var cid = MRDB.generateid();
			var cdata = {"rowid":cid,"personid":personid,"fieldid":customfieldlist[i]["rowid"],"fieldvalue":$("#modal_newperson_customtable_"+i).val()};
			MRDB.db_addrow("people_customdata",cdata);
		}

		for (i in groupareadata) {
			var memberid = MRDB.generateid();
			var isleader = "0";
			if ($("#modal_newperson_grouptable_isleader_"+i).is(':checked')) {
				isleader = "1";
			}

			var mdata = {"rowid":memberid,"groupid":$("#modal_newperson_grouptable_options_"+i).val(),"personid":personid,"isleader":isleader};
			MRDB.db_addrow("groupmembership",mdata);
		}

		if (getsetting("useshop") == "yes") {
			var shopvouch = $("#modal_newperson_field_shopamount").val();
			MRDB.db_changedata("people",personid,"shopvouch",shopvouch);
		}

		$.modal.close();
	});
}

function addpoints() {
	$("#modal_points").modal();
	$("#modal_points_groupselect").empty();
	for (var i in groupareadata) {
		if (groupareadata[i]["haspoints"] == "1") {
			$("#modal_points_groupselect").append("<option value=''>"+groupareadata[i]["label"]+"</option>");
			for (var x in groupdata[i]) {
				$("#modal_points_groupselect").append("<option value='"+x+"'>&nbsp;&nbsp;&nbsp;"+groupdata[i][x]["label"]+"</option>");
			}
		}
	}
	$("#modal_points_savebutton").click(function() {
		if ($("#modal_points_groupselect").val() != "" && $("#modal_points_value").val() != "") {
			var pointsid = MRDB.generateid();
			var data = {"rowid":pointsid,"groupid":$("#modal_points_groupselect").val(),"value":$("#modal_points_value").val(),"reason":$("#modal_points_reason").val()};
			MRDB.db_addrow("points",data);
			$.modal.close();
		} else {
			alert("The form is not filled out properly");
		}
	});
}

function refresh_points() {
	//try { console.log("Refreshing Points"); } catch (e) {}
	function refresh_points2(success,result) {
		function refresh_points3(success2,result2) {
			//$("#interface_points_stuff").empty();
			$("#pointstable").empty();
			for (var i in result2) {
				var total = result2[i]["pointtotal"];
				if (total == null) {
					total = 0;
				}
				var group_id = result2[i]["groupid"];
				var group_label = lookuptable_groupdata[result2[i]["groupid"]]["label"];
				var group_pointtotal = total;
				//$("#interface_points_stuff").append(lookuptable_groupdata[result2[i]["groupid"]]["label"]+" Total: "+total+"<br/>");
				$("#pointstable").append("<tr><td id='pointstable_"+group_id+"_label' class='pointsheaderrow alignleft'></td><td id='pointstable_"+group_id+"_total' class='pointsheaderrow alignright'></td></tr><tr><td colspan='2' class='pointsdatacell'><table id='pointstable_"+group_id+"_details' class='pointsdatatable'></table></td></tr>");
				$("#pointstable_"+group_id+"_label").text(group_label);
				$("#pointstable_"+group_id+"_total").text("Total: "+group_pointtotal);
				for (var x in result) {
					if (result[x]["groupid"] == result2[i]["groupid"]) {
						$("#pointstable_"+group_id+"_details").append("<tr><td class='pointsdatatable_value'>"+result[x]["value"]+"</td><td class='pointsdatatable_reason'>"+result[x]["reason"]+"</td><td class='pointsdatatable_buttons'><input type='button' value='Mod' onClick='points_mod(\""+result[x]["rowid"]+"\");'/><input type='button' value='Del' onClick='points_del(\""+result[x]["rowid"]+"\");'/></td></tr>");
					}
				}
			}
		}
		MRDB.executeSQLWithCallback("select sum(value) as pointtotal,g.rowid as groupid,g.groupareaid as groupareaid from groups g,groupareas ga LEFT OUTER JOIN points p on g.rowid=p.groupid where g.groupareaid=ga.rowid and ga.haspoints=1 group by g.rowid order by sum(p.value) desc",[],refresh_points3);
	}
	MRDB.executeSQLWithCallback("select * from points order by groupid",[],refresh_points2);
}

function points_mod(pointsid) {
	function points_mod2(success,result) {
		var pointdata = result[0];
		$("#modal_points").modal();
		$("#modal_points_groupselect").empty();
		for (var i in groupareadata) {
			$("#modal_points_groupselect").append("<option value=''>"+groupareadata[i]["label"]+"</option>");
			for (var x in groupdata[i]) {
				$("#modal_points_groupselect").append("<option value='"+x+"'>&nbsp;&nbsp;&nbsp;"+groupdata[i][x]["label"]+"</option>");
			}
		}
		$("#modal_points_groupselect").val(pointdata["groupid"]);
		$("#modal_points_value").val(pointdata["value"]);
		$("#modal_points_reason").val(pointdata["reason"]);
		$("#modal_points_savebutton").click(function() {
			if ($("#modal_points_groupselect").val() != "" && $("#modal_points_value").val() != "") {
				if ($("#modal_points_groupselect").val() != pointdata["groupid"]) {
					MRDB.db_changedata("points",pointsid,"groupid",$("#modal_points_groupselect").val());
				}
				if ($("#modal_points_value").val() != pointdata["value"]) {
					MRDB.db_changedata("points",pointsid,"value",$("#modal_points_value").val());
				}
				if ($("#modal_points_reason").val() != pointdata["reason"]) {
					MRDB.db_changedata("points",pointsid,"reason",$("#modal_points_reason").val());
				}
				$.modal.close();
			} else {
				alert("The form is not filled out properly");
			}
		});
	}
	MRDB.executeSQLWithCallback("select * from points where rowid=?",[pointsid],points_mod2);
}

function points_del(pointsid) {
	$("#modal_areyousure").modal();
	$("#confirm_submit").click(function() {
		MRDB.db_delrow("points",pointsid);
		$.modal.close();
	});
}

function addmoneyin() {
	function addmoneyin2(success,result) {
		if (success) {
			$("#modal_moneyin").modal();
			var selectlist = "<option value=''>General Income (No allocation)</option>";
			for (var x in result) {
				var row = result[x];
				selectlist = selectlist + "<option value='"+row["rowid"]+"'>"+row["lastname"]+", "+row["firstname"]+"</option>";
			}
			$("#modal_moneyin_initalselect").append(selectlist);
			$("#model_moneyin_addallocationbutton").click(function() {
				$("#model_moneyin_allocationtable").append("<tr><td class='allocationrow'>Amount: $<input type='text' size='6' class='allocationamount' value='0.00'/> Apply to: <select class='allocationdirection'>"+selectlist+"</select><input type='button' value='Remove' onClick='removeallocation(this);'/></td></tr>");
			});
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
				if (temptotal != parseFloat($("#modal_moneyin_totalpayment").val())) {
					alert("Total of Allocation does not match total payment");
				} else if ($("#modal_moneyin_description").val() == "") {
					alert("No description given.");
				} else if (temptotal == 0) {
					alert("No amounts enterred");
				} else {
					var paymentid = MRDB.generateid();
					var data = {"rowid":paymentid,"description":$("#modal_moneyin_description").val(),"total":$("#modal_moneyin_totalpayment").val()};
					MRDB.db_addrow("payments",data);
					$(".allocationrow").each(function(i,element) {
						var itemval = $(".allocationamount",this).val();
						var itemdirection = $(".allocationdirection",this).val();
						if (itemval != "" && parseFloat(itemval) > 0) {
							var allocationid = MRDB.generateid();
							var adata = {"rowid":allocationid,"personid":itemdirection,"amount":parseFloat(itemval),"paymentid":paymentid};
							MRDB.db_addrow("payments_allocation",adata);
						}
					});
					$.modal.close();
				}
			});
		}
	}
	MRDB.executeSQLWithCallback("select * from people where (archived IS NULL or archived!=1) order by lastname,firstname",[],addmoneyin2);
}

function removeallocation(buttonobject) {
	document.getElementById("model_moneyin_allocationtable").removeChild(buttonobject.parentNode.parentNode);
}

function finance_refreshpayments() {
	function finance_refreshpayments2(success,result) {
		$("#finance_paymenttable").empty();
		for (var i in result) {
			$("#finance_paymenttable").append("<tr id='paymentrow_"+result[i]["rowid"]+"'>\n\
				<td class='finance_paymenttable'>"+result[i]["description"]+"</td>\n\
				<td class='finance_paymenttable_amount currencycell'>"+fd(result[i]["total"])+"</td>\n\
				<td class='finance_paymenttable hidewhenprinting'><input class='hidewhenprinting' type='button' value='Mod' onClick='finance_modpayment(\""+result[i]["rowid"]+"\");'/><input class='hidewhenprinting' type='button' value='Del' onClick='finance_delpayment(\""+result[i]["rowid"]+"\");'/></td></tr>");
			$("#finance_paymenttable").append("<tr><td colspan='2'><table id='paymentrow_"+result[i]["rowid"]+"_details' class='finance_paymentdetails'></table></td></tr>");
			function finance_refreshpayments3(success2,result2,sql2,params2) {
				$("#paymentrow_"+params2+"_details").empty();
				for (var x in result2) {
					var name = "<i>General Income</i>";
					if (result2[x]["personid"] != "") {
						name = result2[x]["firstname"]+" "+result2[x]["lastname"];
					}
					$("#paymentrow_"+params2+"_details").append("<tr>\n\
						<td class='finance_paymentrow'>"+name+"</td>\n\
						<td class='finance_paymentrow_amount currencycell'>"+fd(result2[x]["amount"])+"</td></tr>");
					//$("#paymentrow_"+result2[x]["paymentid"]).after(
				}
			}
			MRDB.executeSQLWithCallback("select pa.*,p.firstname,p.lastname from payments_allocation pa LEFT OUTER JOIN people p on pa.personid=p.rowid where pa.paymentid=?",[result[i]["rowid"]],finance_refreshpayments3);
		}
		function finance_refreshpayments4(success3,result3) {
			if (result3.length > 0) {
				try { console.assert(false, result3.length+" Orphan payments found, removing..."); } catch (e) {}
			}
			for (var i in result3) {
				MRDB.db_delrow("payments_allocation",result3[i]["rowid"]);
			}
		}
		MRDB.executeSQLWithCallback("select pa.* from payments_allocation pa LEFT OUTER JOIN payments p on pa.paymentid=p.rowid where p.rowid IS NULL",[],finance_refreshpayments4);
	}
	MRDB.executeSQLWithCallback("select * from payments",[],finance_refreshpayments2);
}

function finance_modpayment(paymentid) {
	function finance_modpayment2(success,result) {
		function finance_modpayment3(success2,result2) {
			function finance_modpayment4(success3,result3) {
				$("#modal_moneyin").modal();
				$("#modal_moneyin_description").val(result[0]["description"]);
				$("#modal_moneyin_totalpayment").val(result[0]["total"]);
				var selectlist = "<option value=''>General Income (No allocation)</option>";
				for (var x in result3) {
					var row = result3[x];
					selectlist = selectlist + "<option value='"+row["rowid"]+"'>"+row["lastname"]+", "+row["firstname"]+"</option>";
				}
				$(".allocationrow").remove();
				var newrow = "<tr><td class='allocationrow'>Amount: $<input type='text' size='6' class='allocationamount' value='0.00'/> Apply to: <select class='allocationdirection'>"+selectlist+"</select><input type='button' value='Remove' onClick='removeallocation(this);'/></td></tr>";
				for (var i in result2) {
					$("#model_moneyin_allocationtable").append(newrow);
					$(".allocationrow:last > .allocationamount").val(result2[i]["amount"]);
					$(".allocationrow:last > .allocationdirection").val(result2[i]["personid"]);
					$(".allocationrow:last").attr("allocationid",result2[i]["rowid"]);
				}
				$("#model_moneyin_addallocationbutton").click(function() {
					$("#model_moneyin_allocationtable").append(newrow);
				});
				$("#modal_moneyin_savebutton").click(function() {
					var temptotal = 0.00;
					$(".allocationrow").each(function(i,element) {
						var itemval = $(".allocationamount",this).val();
						var itemdirection = $(".allocationdirection",this).val();
						if (itemval != "" && parseFloat(itemval) > 0) {
							temptotal = parseFloat(temptotal) + parseFloat(itemval);
						}
					});
					if (temptotal != parseFloat($("#modal_moneyin_totalpayment").val())) {
						alert("Total of Allocation does not match total payment");
					} else if ($("#modal_moneyin_description").val() == "") {
						alert("No description given.");
					} else if (temptotal == 0) {
						alert("No amounts enterred");
					} else {
						if ($("#modal_moneyin_description").val() != result[0]["description"]) {
							MRDB.db_changedata("payments",paymentid,"description",$("#modal_moneyin_description").val());
						}
						if (parseFloat($("#modal_moneyin_totalpayment").val()) != result[0]["total"]) {
							MRDB.db_changedata("payments",paymentid,"total",parseFloat($("#modal_moneyin_totalpayment").val()));
						}
						for (var i in result2) {
							var afound = false;
							$(".allocationrow").each(function(zug,element) {
								var allocationid = $(this).attr("allocationid");
								var itemval = $(".allocationamount",this).val();
								var itemdirection = $(".allocationdirection",this).val();
								//alert("Comparing "+allocationid+" to "+result2[i]["rowid"]);
								if (allocationid == result2[i]["rowid"]) {
									//alert(allocationid);
									afound = true;
									if (parseFloat(itemval) != result2[i]["amount"]) {
										MRDB.db_changedata("payments_allocation",allocationid,"amount",parseFloat(itemval));
									}
									if (itemdirection != result2[i]["personid"]) {
										MRDB.db_changedata("payments_allocation",allocationid,"personid",itemdirection);
									}
								}
							});
							if (afound == false) {
								//alert("not found, removing");
								MRDB.db_delrow("payments_allocation",result2[i]["rowid"]);
							}
						}
						$(".allocationrow").each(function(zug,element) {
							var itemval = $(".allocationamount",this).val();
							var itemdirection = $(".allocationdirection",this).val();
							var allocationid = $(this).attr("allocationid");
							if (itemval != "" && parseFloat(itemval) > 0 && allocationid == null) {
								var newallocationid = MRDB.generateid();
								var adata = {"rowid":newallocationid,"personid":itemdirection,"amount":parseFloat(itemval),"paymentid":paymentid};
								MRDB.db_addrow("payments_allocation",adata);
							}
						});
						$.modal.close();
					}
				});
			}
			MRDB.executeSQLWithCallback("select * from people where (archived IS NULL or archived!=1) order by lastname,firstname",[],finance_modpayment4);
		}
		MRDB.executeSQLWithCallback("select * from payments_allocation where paymentid=?",[paymentid],finance_modpayment3);
	}
	MRDB.executeSQLWithCallback("select * from payments where rowid=?",[paymentid],finance_modpayment2);
}

function finance_delpayment(paymentid) {
	$("#modal_areyousure").modal();
	$("#confirm_submit").click(function() {
		function finance_delpayment2(success,result) {
			for (var i in result) {
				MRDB.db_delrow("payments_allocation",result[i]["rowid"]);
			}
			MRDB.db_delrow("payments",paymentid);
			$.modal.close();
		}
		MRDB.executeSQLWithCallback("select * from payments_allocation where paymentid=?",[paymentid],finance_delpayment2);
	});
}

function finance_showinterface(interfacename) {
	$(".interface_finance_subinterface").css("display","none");
	$("#interface_finance_"+interfacename).css("display","");
	try { eval("refresh_"+interfacename+"();"); } catch(err) { }
}

function finance_addspender() {
	$("#modal_spender").modal();
	$("#modal_spender_savebutton").click(function() {
		var name = $("#modal_spender_name").val();
		if (name != "") {
			var spenderid = MRDB.generateid();
			var data = {"rowid":spenderid,"name":name};
			MRDB.db_addrow("spenders",data);
			$.modal.close();
		} else {
			alert("No name enterred");
		}
	});
}

var lookuptable_spenders = new Array();
function refresh_spenders() {
	//finance_spendertable
	function refresh_spenders2(success,result) {
		$("#finance_spendertable").empty();
		lookuptable_spenders = new Array();
		for (var i in result) {
			var spender = result[i];
			lookuptable_spenders[spender["rowid"]] = result[i];
			$("#finance_spendertable").append("<tr><td class='finance_spendertable'>"+spender["name"]+"<br/><table id='spenderrow_"+spender["rowid"]+"' class='finance_spenderdetail'></table></td>\n\
				<td class='finance_spendertable hidewhenprinting'><input type='button' value='Mod' onClick='finance_modspender(\""+spender["rowid"]+"\");'/><input type='button' value='Del' onClick='finance_delspender(\""+spender["rowid"]+"\");'/></td></tr>");
			function refresh_spenders3(success2,result2,sql2,params2) {
				var total_ur = 0;
				var total = 0;
				var spenderid = params2;
				$("#spenderrow_"+spenderid).empty();
				for (var x in result2) {
					//reimbersed
					total = total - parsef(result2[x]["amount"]);
					var rvalue = " *";
					if (result2[x]["reimbersed"] == "1") {
						rvalue = "";
					} else {
						total_ur = total_ur - parsef(result2[x]["amount"]);
					}
					$("#spenderrow_"+spenderid).append("<tr><td class='finance_spenderdetail'>"+result2[x]["description"]+rvalue+"</td><td class='finance_spenderdetail currencycell'>"+fd(0-parsef(result2[x]["amount"]))+"</td></tr>");
				}
				$("#spenderrow_"+spenderid).append("<tr><td class='finance_spenderdetail' colspan='2'>Total: "+fd(total)+" (Not Reimbersed: "+fd(total_ur)+") <input class='hidewhenprinting' type='button' value='Set Fully Reimbersed' onclick=\"finance_spender_reimberse('"+spenderid+"');\"/></td></tr>");
			}
			MRDB.executeSQLWithCallback("select * from expenditures where spenderid=?",[spender["rowid"]],refresh_spenders3);
		}
	}
	MRDB.executeSQLWithCallback("select * from spenders order by name",[],refresh_spenders2);
}

function finance_spender_reimberse(spenderid) {
	$("#modal_areyousure").modal();
	function finance_spender_reimberse2(success,result,sql,params,passthrough) {
		for (var x in result) {
			if (result[x]["reimbersed"] != "1") {
				MRDB.db_changedata("expenditures",result[x]["rowid"],"reimbersed","1");
			}
		}
	}
	$("#confirm_submit").click(function() {
		MRDB.executeSQLWithCallback("select * from expenditures where spenderid=?",[spenderid],finance_spender_reimberse2,spenderid);
		//alert(spenderid);		
		$.modal.close();
	});
	
}

function finance_delspender(spenderid) {
	$("#modal_areyousure").modal();
	$("#confirm_submit").click(function() {
		MRDB.db_delrow("spenders",spenderid);
		$.modal.close();
	});
}

var lookuptable_budgetareas = new Array();
function refresh_budget() {
	function refresh_budget2(success,result) {
		//$("#finance_budgettable").empty();
		$("tr.baitem").remove();
		lookuptable_budgetareas = new Array();
		budgetedtotal = 0;
		actualtotal = 0;
		var q = new Array();
		for (var i in result) {
			lookuptable_budgetareas[result[i]["rowid"]] = result[i];
			var budgetedamount = fd(parsef(result[i]["budgetedamount"]));
			var extra = "";
			if (result[i]["perpersonfilter"] != null && result[i]["perpersonfilter"] != "") {
				if (result[i]["perpersonfilter"] == "all") {
					budgetedamount = "<i>("+totalpeoplecount+"x"+fd(parsef(result[i]["budgetedamount"]))+")</i> "+fd(parsef(result[i]["budgetedamount"] * totalpeoplecount));
					budgetedtotal = budgetedtotal + (parsef(result[i]["budgetedamount"])*totalpeoplecount);
				} else if (result[i]["perpersonfilter"].substring(0,2) == "g:") {
					var groupid = result[i]["perpersonfilter"].substring(2);
					//alert(groupid);
					budgetedamount = "<i>("+groupcounts[groupid]+"x"+fd(parsef(result[i]["budgetedamount"]))+")</i> "+fd(parsef(groupcounts[groupid])*parsef(result[i]["budgetedamount"]));
					budgetedtotal = budgetedtotal + (parsef(result[i]["budgetedamount"])*parsef(groupcounts[groupid]));
				}
			} else {
				budgetedtotal = budgetedtotal + parsef(result[i]["budgetedamount"]);
			}
			
			$("#finance_budgettable").append("<tr class='baitem'>\n\
				<td class='barow'>"+result[i]["description"]+"<br/><table id='budgetarea_"+result[i]["rowid"]+"' class='budget_subtable'></table></td>\n\
				<td class='barow currencycell'>"+budgetedamount+"</td>\n\
				<td class='barow currencycell' id='budgetarea_"+result[i]["rowid"]+"_total'></td>\n\
				<td class='hidewhenprinting'><input type='button' value='Mod' onClick='finance_modbudget(\""+result[i]["rowid"]+"\");' class='hidewhenprinting'/></td>\n\
				<td class='hidewhenprinting'><input type='button' value='Del' onClick='finance_delbudget(\""+result[i]["rowid"]+"\");' class='hidewhenprinting'/></td></tr>");
			function refresh_budgetarea2(success2,result2,sql2,params2) {
				var budgetareatotal = 0;
				$("#budgetarea_"+params2).empty();
				for (var x in result2) {
					var taxstring = "";
					if (parsef(result2[x]["tax"]) > 0) {
						taxstring = " ("+fd(parsef(result2[x]["tax"]))+" HST)";
					}
					actualtotal = actualtotal + parsef(result2[x]["amount"]);
					$("#budgetarea_"+params2).append("<tr>\n\
						<td class='barow'>"+result2[x]["description"]+taxstring+"</td>\n\
						<td class='barow currencycell'>"+fd(parsef(result2[x]["amount"]))+"</td>\n\
						<td class='hidewhenprinting'><input type='button' value='Mod' onClick='finance_modexpense(\""+result2[x]["rowid"]+"\");' class='hidewhenprinting'/></td>\n\
						<td class='hidewhenprinting'><input type='button' value='Del' onClick='finance_delexpense(\""+result2[x]["rowid"]+"\");' class='hidewhenprinting'/></td></tr>");
					budgetareatotal = budgetareatotal + parsef(result2[x]["amount"]);
				}
				$("#budgetarea_"+params2+"_total").text(fd(budgetareatotal));
			}
			
			//MRDB.executeSQLWithCallback("select * from expenditures where budgetareaid=?",[result[i]["rowid"]],refresh_budgetarea2);
			MRDB.queuequery(q,"select * from expenditures where budgetareaid=?",[result[i]["rowid"]],refresh_budgetarea2);
		}
		
		function refresh_budget3(success3,result3,sql3,params3) {
			for (var i in result3) {
				$("#finance_budgettable_si_"+result3[i]["rowid"]).remove();
				var taxstring = "";
				if (parsef(result3[i]["tax"]) > 0) {
					taxstring = " ("+fd(parsef(result3[i]["tax"]))+" HST)";
				}
				actualtotal = actualtotal + parsef(result3[i]["amount"]);
				$("#finance_budgettable").append("<tr id='finance_budgettable_si_"+result3[i]["rowid"]+"'>\n\
					<td class='barow'>"+result3[i]["description"]+taxstring+"</td>\n\
					<td class='barow currencycell'></td>\n\
					<td class='barow currencycell'>"+fd(parsef(result3[i]["amount"]))+"</td>\n\
					<td><input type='button' value='Mod' onClick='finance_modexpense(\""+result3[i]["rowid"]+"\");'/></td>\n\
					<td><input type='button' value='Del' onClick='finance_delexpense(\""+result3[i]["rowid"]+"\");'/></td></tr>");
			}
			
		}
		//MRDB.executeSQLWithCallback("select e.* from expenditures e left outer join budgetareas b on e.budgetareaid=b.rowid where b.rowid IS NULL",[],refresh_budget3);
		MRDB.queuequery(q,"select e.* from expenditures e left outer join budgetareas b on e.budgetareaid=b.rowid where b.rowid IS NULL",[],refresh_budget3);
		
		function refresh_budget4(success4,result4,sql4,param4,pass4) {
			function refresh_budgetarea_vouchtotal(s5,r5,sql5,p5,pass) {
				$("#totalvouchcell").text(fd(parsef(r5[0]["totalvouch"])))
				$("#finance_budget_totalexpected").text(fd(pass+parsef(r5[0]["totalvouch"])));
				budgetedtotal = budgetedtotal + pass+parsef(r5[0]["totalvouch"]);
				
				$("#batotal").remove();
				$("#finance_budgettable").append("<tr id='batotal'>\n\
					<td class='barow alignright'>Total:</td>\n\
					<td class='barow currencycell'>"+fd(budgetedtotal)+"</td>\n\
					<td class='barow currencycell'>"+fd(actualtotal)+"</td>\n\
				</tr>");
			}
			$("#finance_budget_expectedincome").empty();
			var expectedtotal = 0;
			//$("#finance_budgettable").prepend("<tr id='budget_incomerow'><td>Income:<br/><table border='1' id='budget_incometable'></table></td></tr>");
			for (var i in result4) {
				var modifier = 0;
				if (result4[i]["modifier"] != "") {
					modifier = parsef(result4[i]["modifier"]);
				}
				var total = parseInt(result4[i]["membercount"]) * modifier;
				if (modifier > 0) {
					$("#finance_budget_expectedincome").append("<tr>\n\
						<td class='expectedincomerow'>"+result4[i]["grouplabel"]+"</td>\n\
						<td class='expectedincomerow currencycell'>"+result4[i]["membercount"]+" x "+fd(modifier)+"</td>\n\
						<td class='expectedincomerow currencycell'>"+fd(total)+"</td></tr>");
				}
				
				expectedtotal = expectedtotal + parsef(total);
			}
			$("#finance_budget_expectedincome").append("<tr>\n\
				<td class='expectedincomerow'>Shop</td>\n\
				<td class='expectedincomerow currencycell'>&nbsp;</td>\n\
				<td class='expectedincomerow currencycell' id='totalvouchcell'>Loading...</td></tr>");
			
			//MRDB.executeSQLWithCallback("select sum(shopvouch) as totalvouch from people",[],refresh_budgetarea_vouchtotal,expectedtotal);
			MRDB.queuequery(pass4,"select sum(shopvouch) as totalvouch from people",[],refresh_budgetarea_vouchtotal,expectedtotal);
		}
		//MRDB.executeSQLWithCallback("select count(distinct gm.personid) as membercount,g.label as grouplabel,g.modifier as modifier from groupmembership gm, groups g where gm.groupid=g.rowid group by gm.groupid",[],refresh_budget4);
		MRDB.queuequery(q,"select count(distinct gm.personid) as membercount,g.label as grouplabel,g.modifier as modifier from groupmembership gm, groups g, groupareas ga, people p where (p.archived IS NULL or p.archived!=1) and p.rowid=gm.personid and gm.groupid=g.rowid and ga.rowid=g.groupareaid group by gm.groupid order by ga.label",[],refresh_budget4,q);
		
		function refresh_budget5(success4,result4) {
			//$("#budget_incomerow").after("<tr><td>General Income</td><td></td><td>$"+parsef(result4[0]["thesum"])+"</td></tr>");
			$("#finance_budget_totalgeneral").text(fd(parsef(result4[0]["thesum"])));
			actualtotal = actualtotal + parsef(result4[0]["thesum"]);
		}
		//MRDB.executeSQLWithCallback("select sum(amount) as thesum from payments_allocation where personid='' and paymentid!=''",[],refresh_budget5);
		MRDB.queuequery(q,"select sum(amount) as thesum from payments_allocation where personid='' and paymentid!=''",[],refresh_budget5);

		function refresh_budget6(success5,result5) {
			//$("#budget_incomerow").after("<tr><td>Allocated Income</td><td></td><td>$"+parsef(result5[0]["thesum"])+"</td></tr>");
			$("#finance_budget_totalallocated").text(fd(parsef(result5[0]["thesum"])));
			actualtotal = actualtotal + parsef(result5[0]["thesum"]);
		}
		//MRDB.executeSQLWithCallback("select sum(amount) as thesum from payments_allocation where personid!='' and paymentid!=''",[],refresh_budget6);
		MRDB.queuequery(q,"select sum(amount) as thesum from payments_allocation where personid!='' and paymentid!=''",[],refresh_budget6);

		//queryqueue,sql,parameters,subcallback,passthrough
		//MRDB.queuequery(q,"select sum(amount) as moneyin from payments_allocation where personid=?",[row["rowid"]],refresh_peoplefinances3,row["rowid"]);
		MRDB.executeSQLOffQueue(q,null);
	}
	MRDB.executeSQLWithCallback("select * from budgetareas",[],refresh_budget2);
}

function finance_modspender(spenderid) {
	function finance_modspender2(success,result) {
		$("#modal_spender").modal();
		$("#modal_spender_name").val(result[0]["name"]);
		$("#modal_spender_savebutton").click(function() {
			var name = $("#modal_spender_name").val();
			if (name != "") {
				if (name != result[0]["name"]) {
					MRDB.db_changedata("spenders",spenderid,"name",name);
				}
				$.modal.close();
			} else {
				alert("No name enterred");
			}
		});
	}
	MRDB.executeSQLWithCallback("select * from spenders where rowid=?",[spenderid],finance_modspender2);
}

function finance_addbudget() {
	$("#modal_budgetitem").modal();
	$("#modal_budgetitem_perpersongroup").append($("<option></option>").attr("value","all").text("All People"));
	
	for (i in groupareadata) {
		$("#modal_budgetitem_perpersongroup").append($("<option></option>").attr("value","b:"+i).text(groupareadata[i]["label"])); 

		for (var y in groupdata[i]) {
			$("#modal_budgetitem_perpersongroup").append($("<option></option>").attr("value","g:"+y).html("&nbsp;&nbsp;&nbsp;&nbsp;"+groupdata[i][y]["label"])); 
		}
	}
	
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
			var budgetitemid = MRDB.generateid();
			var data = {"rowid":budgetitemid,"description":description,"budgetedamount":finalamount,"perpersonfilter":perpersonfilter};
			MRDB.db_addrow("budgetareas",data);
			$.modal.close();
		} else {
			alert("No description enterred");
		}
	});
}

function finance_modbudget(budgetid) {
	function finance_modbudget2(success,result) {
		$("#modal_budgetitem").modal();
		$("#modal_budgetitem_perpersongroup").append($("<option></option>").attr("value","all").text("All People"));
		
		for (i in groupareadata) {
			$("#modal_budgetitem_perpersongroup").append($("<option></option>").attr("value","b:"+i).text(groupareadata[i]["label"])); 

			for (var y in groupdata[i]) {
				$("#modal_budgetitem_perpersongroup").append($("<option></option>").attr("value","g:"+y).html("&nbsp;&nbsp;&nbsp;&nbsp;"+groupdata[i][y]["label"])); 
			}
		}
		
		$("#modal_budgetitem_perpersongroup").val(result[0]["perpersonfilter"]);
		$("#modal_budgetitem_description").val(result[0]["description"]);
		if (result[0]["perpersonfilter"] != null && result[0]["perpersonfilter"] != "") {
			$("#modal_budgetitem_amount").val("0.00");	
			$("#modal_budgetitem_perperson").val(result[0]["budgetedamount"]);
		} else {
			$("#modal_budgetitem_amount").val(result[0]["budgetedamount"]);
			$("#modal_budgetitem_perperson").val("0.00");
		}
		
		$("#modal_budgetitem_savebutton").click(function() {
			var desc = $("#modal_budgetitem_description").val();
			var perpersonamount = parsef($("#modal_budgetitem_perperson").val());
			var perpersonfilter = "";
			var finalamount = parsef($("#modal_budgetitem_amount").val());
			if (perpersonamount != 0) {
				finalamount = perpersonamount;
				perpersonfilter = $("#modal_budgetitem_perpersongroup").val();
			}
			if (desc != "") {
				if (result[0]["perpersonfilter"] != perpersonfilter) {
					MRDB.db_changedata("budgetareas",budgetid,"perpersonfilter",perpersonfilter);
				}
				if (desc != result[0]["description"]) {
					MRDB.db_changedata("budgetareas",budgetid,"description",desc);
				}
				if (result[0]["budgetedamount"] != finalamount) {
					MRDB.db_changedata("budgetareas",budgetid,"budgetedamount",finalamount);
				}
				$.modal.close();
			} else {
				alert("No Description enterred");
			}
		});
	}
	MRDB.executeSQLWithCallback("select * from budgetareas where rowid=?",[budgetid],finance_modbudget2);
}

function finance_delbudget(budgetid) {
	$("#modal_areyousure").modal();
	$("#confirm_submit").click(function() {
		MRDB.db_delrow("budgetareas",budgetid);
		$.modal.close();
	});
}

function finance_addexpense() {
	$("#modal_expenseitem").modal();
	$("#modal_expenseitem_spenderid").empty();
	$("#modal_expenseitem_spenderid").append("<option value=''>No Spender Selected</option>");
	for (var i in lookuptable_spenders) {
		$("#modal_expenseitem_spenderid").append("<option value='"+i+"'>"+lookuptable_spenders[i]["name"]+"</option>");
	}
	$("#modal_expenseitem_budgetareaid").empty();
	$("#modal_expenseitem_budgetareaid").append("<option value=''>No Budget Area</option>");
	for (var i in lookuptable_budgetareas) {
		$("#modal_expenseitem_budgetareaid").append("<option value='"+i+"'>"+lookuptable_budgetareas[i]["description"]+"</option>");
	}
	$("#modal_expenseitem_savebutton").click(function() {
		var description = $("#modal_expenseitem_description").val();
		var spenderid = $("#modal_expenseitem_spenderid").val();
		var amount = $("#modal_expenseitem_amount").val();
		var isreimbersed = "0";
		var budgetareaid = $("#modal_expenseitem_budgetareaid").val();
		var tax = $("#modal_expenseitem_tax").val();
		if ($("#modal_expenseitem_isreimbersed").is(':checked')) {
			isreimbersed = "1";
		}
		if (description == "") {
			alert("No description given");
		} else {
			var expenseid = MRDB.generateid();
			var data = {"rowid":expenseid,"description":description,"amount":parseFloat(amount),"spenderid":spenderid,"reimbersed":isreimbersed,"budgetareaid":budgetareaid,"tax":tax};
			MRDB.db_addrow("expenditures",data);
			$.modal.close();
		}
	});
}

function finance_modexpense(expenseid) {
	function finance_modexpense2(success,result) {
		$("#modal_expenseitem").modal();
		$("#modal_expenseitem_spenderid").empty();
		$("#modal_expenseitem_spenderid").append("<option value=''>No Spender Selected</option>");
		for (var i in lookuptable_spenders) {
			$("#modal_expenseitem_spenderid").append("<option value='"+i+"'>"+lookuptable_spenders[i]["name"]+"</option>");
		}
		$("#modal_expenseitem_budgetareaid").empty();
		$("#modal_expenseitem_budgetareaid").append("<option value=''>No Budget Area</option>");
		for (var i in lookuptable_budgetareas) {
			$("#modal_expenseitem_budgetareaid").append("<option value='"+i+"'>"+lookuptable_budgetareas[i]["description"]+"</option>");
		}
		$("#modal_expenseitem_budgetareaid").val(result[0]["budgetareaid"]);
		$("#modal_expenseitem_spenderid").val(result[0]["spenderid"]);
		$("#modal_expenseitem_description").val(result[0]["description"]);
		$("#modal_expenseitem_amount").val(result[0]["amount"]);
		$("#modal_expenseitem_tax").val(result[0]["tax"]);
		if (result[0]["reimbersed"] == "1") {
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
				if (tax != result[0]["tax"]) {
					MRDB.db_changedata("expenditures",expenseid,"tax",tax);
				}
				if (description != result[0]["description"]) {
					MRDB.db_changedata("expenditures",expenseid,"description",description);
				}
				if (spenderid != result[0]["spenderid"]) {
					MRDB.db_changedata("expenditures",expenseid,"spenderid",spenderid);
				}
				if (parseFloat(amount) != result[0]["amount"]) {
					MRDB.db_changedata("expenditures",expenseid,"amount",parseFloat(amount));
				}
				if (isreimbersed != result[0]["reimbersed"]) {
					MRDB.db_changedata("expenditures",expenseid,"reimbersed",isreimbersed);
				}
				if (budgetareaid != result[0]["budgetareaid"]) {
					MRDB.db_changedata("expenditures",expenseid,"budgetareaid",budgetareaid);
				}
				$.modal.close();
			}
		});
	}
	MRDB.executeSQLWithCallback("select * from expenditures where rowid=?",[expenseid],finance_modexpense2);
}

function finance_delexpense(expenseid) {
	$("#modal_areyousure").modal();
	$("#confirm_submit").click(function() {
		MRDB.db_delrow("expenditures",expenseid);
		$.modal.close();
	});
}

function viewperson_showprofile() {
	$("#modal_person_view").css("display","");
	$("#modal_person_finances").css("display","none");
}

function viewperson_showfinances() {
	$("#modal_person_view").css("display","none");
	$("#modal_person_finances").css("display","");
}

function refresh_peoplefinances() {
	function refresh_peoplefinances2(success,result) {
		$("#finance_peopletable").empty();
		function refresh_peoplefinances3(success2,result2,sql,param,passthrough) {
			var moneyin = parsef(result2[0]["moneyin"]);
			$("#moneyin_"+passthrough).text(fd(moneyin));
			var cost = parsef($("#cost_"+passthrough).text().substring(1));
			$("#difference_"+passthrough).text(fd(cost - moneyin));
		}
		var q = new Array();
		for (var i in result) {
			var row = result[i];
			var moneyin = row["moneyin"];
			var cost = parsef(row["cost"]);
			cost = cost + parsef(row["shopvouch"]);
			var difference = cost - moneyin;
			$("#finance_peopletable").append("<tr>\n\
				<td class='finance_peopletable'>"+row["firstname"]+"</td>\n\
				<td class='finance_peopletable'>"+row["lastname"]+"</td>\n\
				<td class='finance_peopletable currencycell' id='moneyin_"+row["rowid"]+"'>Loading...</td>\n\
				<td class='finance_peopletable currencycell' id='cost_"+row["rowid"]+"'>"+fd(cost)+"</td>\n\
				<td class='finance_peopletable currencycell' id='difference_"+row["rowid"]+"'>Loading...</td></tr>");
			MRDB.queuequery(q,"select sum(amount) as moneyin from payments_allocation where personid=?",[row["rowid"]],refresh_peoplefinances3,row["rowid"]);
		}
		MRDB.executeSQLOffQueue(q,null);
	}
	MRDB.executeSQLWithCallback("select p.*,sum(g.modifier) as cost from people p left outer join groupmembership gm on gm.personid=p.rowid left outer join groups g on g.rowid=gm.groupid where (p.archived IS NULL or p.archived!=1) group by p.rowid order by p.lastname COLLATE NOCASE,p.firstname COLLATE NOCASE",[],refresh_peoplefinances2);
	//sum(pa.amount) as moneyin
	//left outer join payments_allocation pa on pa.personid=p.rowid
}

function shop_input(groupid) {
	MRDB.executeSQLWithCallback("select p.*,st.amount,st.rowid as transactionid from people p,groupmembership gm left outer join shoptransaction st on p.rowid=st.personid where gm.personid=p.rowid and gm.groupid=? and (p.archived IS NULL or p.archived!=1) order by p.lastname COLLATE NOCASE,p.firstname COLLATE NOCASE,st.inputstamp",[groupid],function (success2,result2,query2,params2) {
		$("#modal_shopinput").modal({containerCss: {width:"800px",height:"90%"}});
		var previd = "";
		for (var i in result2) {
			var row = result2[i];
			if (previd != row["rowid"]) {
				$("#modal_shopinput_table").append("<tr id='modal_shopinput_row_"+row["rowid"]+"'><td class='firstname modal_generalcell'></td><td class='lastname modal_generalcell'></td><td class='vouch currencycell'></td><td class='totalremaining currencycell'></td><td><input type='text' size='6' class='spendamountinput'/></td><td class='history modal_generalcell'></td></tr>");
				$("#modal_shopinput_row_"+row["rowid"]+" > .firstname").text(row["firstname"]);
				$("#modal_shopinput_row_"+row["rowid"]+" > .lastname").text(row["lastname"]);
				if (row["amount"] != null) {
					$("#modal_shopinput_row_"+row["rowid"]+" > .history").html("<span class='inputtransaction' onClick='shop_removetransaction(\""+row["transactionid"]+"\");' id='shopt_"+row["transactionid"]+"'>"+fd(row["amount"])+"</span>");	
				}
				$("#modal_shopinput_row_"+row["rowid"]+" > .vouch").text(fd(row["shopvouch"]));
				var remain = row["shopvouch"] - row["amount"];
				$("#modal_shopinput_row_"+row["rowid"]+" > .totalremaining").text(fd(remain));
				$("#modal_shopinput_row_"+row["rowid"]+" > .totalremaining").attr("val",remain);
				previd = row["rowid"];
			} else {
				$("#modal_shopinput_row_"+row["rowid"]+" > .history").html($("#modal_shopinput_row_"+row["rowid"]+" > .history").html()+", "+"<span class='inputtransaction' onClick='shop_removetransaction(\""+row["transactionid"]+"\");' id='shopt_"+row["transactionid"]+"'>"+fd(row["amount"])+"</span>");
				//$("#modal_shopinput_row_"+row["rowid"]+" > .totalremaining").text(parseFloat($("#modal_shopinput_row_"+row["rowid"]+" > .totalremaining").text()) - parseFloat(row["amount"]));
				var remain = parseFloat($("#modal_shopinput_row_"+row["rowid"]+" > .totalremaining").attr("val")) - parseFloat(row["amount"]);
				$("#modal_shopinput_row_"+row["rowid"]+" > .totalremaining").attr("val",remain);
				$("#modal_shopinput_row_"+row["rowid"]+" > .totalremaining").text(fd(remain));
			}
		}
		$("#modal_shopinput_savebutton").click(function() {
			$("#modal_shopinput_table > tr").each(function() {
				var personid = $(this).attr("id").substr(20);
				var amount = $("#"+$(this).attr("id")+" .spendamountinput").val();
				if (amount != "") {
					var transid = MRDB.generateid();
					var data = {"rowid":transid,"personid":personid,"amount":amount,"inputstamp":getnowstamp()};
					MRDB.db_addrow("shoptransaction",data);
				}
			});
			$.modal.close();
		});
	});
}

function shop_removetransaction(transactionid) {
	$("#shopt_"+transactionid).remove();
	MRDB.db_delrow("shoptransaction",transactionid);
}

function shop_sheet(groupid) {
	var newwindow = window.open('','ReportWindow','status=1,toolbar=1,location=1,menubar=1,statusbar=1');
	newwindow.document.write('<html><head><title>Spending Sheet Report</title><link rel="stylesheet" type="text/css" href="/assets/printable.css"/></head><body><table id="spendsheettable"><thead><tr><th>First Name</th><th>Last Name</th><th>Starting</th><th>Remaining</th><th>History</th></tr></thead><tbody id="datatable"></tbody></table><br/><br/>Total Amount Vouched: <span id="mastervouch"></span><br/>Total Spent: <span id="masterspend"></span></body></html>');
	var mastervouch = 0.00;
	var masterspend = 0.00;

	MRDB.executeSQLWithCallback("select p.*,st.amount from people p,groupmembership gm left outer join shoptransaction st on p.rowid=st.personid where gm.personid=p.rowid and gm.groupid=? and (p.archived IS NULL or p.archived!=1) order by p.lastname COLLATE NOCASE,p.firstname COLLATE NOCASE,st.inputstamp",[groupid],function (success2,result2,query2,params2) {
		var previd = "";
		for (var i in result2) {
			var row = result2[i];
			if (previd != row["rowid"]) {
				$('#datatable',newwindow.document).append("<tr id='modal_shopinput_row_"+row["rowid"]+"'><td class='spend_firstname'></td><td class='spend_lastname'></td><td class='spend_vouch'></td><td class='spend_totalremaining'></td><td class='spend_history'></td><td class='spend_blankcell'>&nbsp;</td><td class='spend_blankcell'>&nbsp;</td><td class='spend_blankcell'>&nbsp;</td><td class='spend_blankcell'>&nbsp;</td></tr>");
				$("#modal_shopinput_row_"+row["rowid"]+" > .spend_firstname",newwindow.document).text(row["firstname"]);
				$("#modal_shopinput_row_"+row["rowid"]+" > .spend_lastname",newwindow.document).text(row["lastname"]);
				if (row["amount"] != null) {
					$("#modal_shopinput_row_"+row["rowid"]+" > .spend_history",newwindow.document).text(fd(row["amount"]));
				}
				$("#modal_shopinput_row_"+row["rowid"]+" > .spend_vouch",newwindow.document).text(fd(row["shopvouch"]));
				var remain = row["shopvouch"] - row["amount"];
				$("#modal_shopinput_row_"+row["rowid"]+" > .spend_totalremaining",newwindow.document).text(fd(remain));
				$("#modal_shopinput_row_"+row["rowid"]+" > .spend_totalremaining",newwindow.document).attr("val",remain);
				previd = row["rowid"];
				if (row["shopvouch"] != "") {
					mastervouch = mastervouch + parseFloat(row["shopvouch"]);
				}
				if (row["amount"] != null) {
					masterspend = masterspend + parseFloat(row["amount"]);
				}
			} else {
				$("#modal_shopinput_row_"+row["rowid"]+" > .spend_history",newwindow.document).text($("#modal_shopinput_row_"+row["rowid"]+" > .spend_history",newwindow.document).text()+", "+fd(row["amount"]));
				//$("#modal_shopinput_row_"+row["rowid"]+" > .totalremaining",newwindow.document).text(parseFloat($("#modal_shopinput_row_"+row["rowid"]+" > .totalremaining",newwindow.document).text()) - parseFloat(row["amount"]));
				var remain = parseFloat($("#modal_shopinput_row_"+row["rowid"]+" > .spend_totalremaining",newwindow.document).attr("val")) - parseFloat(row["amount"]);
				$("#modal_shopinput_row_"+row["rowid"]+" > .spend_totalremaining",newwindow.document).attr("val",remain);
				$("#modal_shopinput_row_"+row["rowid"]+" > .spend_totalremaining",newwindow.document).text(fd(remain));
				masterspend = masterspend + parseFloat(row["amount"]);
			}
		}
		$("#mastervouch",newwindow.document).text(fd(mastervouch));
		$("#masterspend",newwindow.document).text(fd(masterspend));
	});
}

function report_points() {
	var newwindow = window.open('','ReportWindow','status=1,toolbar=1,location=1,menubar=1,statusbar=1');
	newwindow.document.write('<html><head><title>Points</title><link rel="stylesheet" type="text/css" href="/assets/printable.css"/></head><body><H1>Points</H1><table id="summarypointstable"></table><hr/><table id="pointstable"></table></body></html>');
	
	function refresh_points2(success,result) {
		function refresh_points3(success2,result2) {
			//$("#interface_points_stuff").empty();
			$("#pointstable",newwindow.document).empty();
			for (var i in result2) {
				var total = result2[i]["pointtotal"];
				if (total == null) {
					total = 0;
				}
				var group_id = result2[i]["groupid"];
				var group_label = lookuptable_groupdata[result2[i]["groupid"]]["label"];
				var group_pointtotal = total;
				//$("#interface_points_stuff").append(lookuptable_groupdata[result2[i]["groupid"]]["label"]+" Total: "+total+"<br/>");
				$("#pointstable",newwindow.document).append("<tr><td id='pointstable_"+group_id+"_label' class='pointsheaderrow alignleft'></td><td id='pointstable_"+group_id+"_total' class='pointsheaderrow alignright'></td></tr><tr><td colspan='2' class='pointsdatacell'><table id='pointstable_"+group_id+"_details' class='pointsdatatable'></table></td></tr>");
				$("#pointstable_"+group_id+"_label",newwindow.document).text(group_label);
				$("#pointstable_"+group_id+"_total",newwindow.document).text("Total: "+group_pointtotal);
				$("#summarypointstable",newwindow.document).append("<tr><td>"+group_label+"</td><td>Total: "+group_pointtotal+"</td></tr>");
				for (var x in result) {
					if (result[x]["groupid"] == result2[i]["groupid"]) {
						$("#pointstable_"+group_id+"_details",newwindow.document).append("<tr><td class='pointsdatatable_value'>"+result[x]["value"]+"</td><td class='pointsdatatable_reason'>"+result[x]["reason"]+"</td></tr>");
					}
				}
			}
		}
		MRDB.executeSQLWithCallback("select sum(value) as pointtotal,g.rowid as groupid,g.groupareaid as groupareaid from groups g,groupareas ga LEFT OUTER JOIN points p on g.rowid=p.groupid where g.groupareaid=ga.rowid and ga.haspoints=1 group by g.rowid order by sum(p.value) desc",[],refresh_points3);
	}
	MRDB.executeSQLWithCallback("select * from points order by groupid",[],refresh_points2);
}

function report_personreport(filtertype,filterid) {
	$("#modal_createreport").modal({containerCss: {width:"800px",height:"500"}});
	
	//modal_createreport_filter
	//{containerCss: {width:"800px",height:"90%"}}
	
	$("#modal_createreport_filter").append($("<option></option>").attr("value","").text("Everyone (No Filter)"));
	
	$("#modal_createreport_filter").append($("<option></option>").attr("value","a").text("Affiliations"));
	for (var i in affiliationgrouplist) {
		$("#modal_createreport_filter").append($("<option></option>").attr("value","a:"+affiliationgrouplist[i]["rowid"]).html("&nbsp;&nbsp;&nbsp;&nbsp;"+affiliationgrouplist[i]["groupname"])); 
	}
	
	for (i in groupareadata) {
		$("#modal_createreport_filter").append($("<option></option>").attr("value","b:"+i).text(groupareadata[i]["label"])); 

		for (var y in groupdata[i]) {
			//report_personreport(\"group\",\""+group["rowid"]+"\")
			$("#modal_createreport_filter").append($("<option></option>").attr("value","g:"+y).html("&nbsp;&nbsp;&nbsp;&nbsp;"+groupdata[i][y]["label"])); 
		}

		$("#modal_createreport_filter").append($("<option></option>").attr("value","c:"+i).html("&nbsp;&nbsp;&nbsp;&nbsp;Not Assigned")); 
	}

	if (filtertype == "group") {
		$("#modal_createreport_filter").val("g:"+filterid);
	} else if (filtertype == "affiliation") {
		$("#modal_createreport_filter").val("a:"+filterid);
	}

	var ccount = 0;
	var currentrow = "";
	for (var i in customfieldlist) {
		currentrow = currentrow + "<td class='modal_fieldinputcell_checkbox'><input type='checkbox' value='v_"+customfieldlist[i]["rowid"]+"' label=\""+customfieldlist[i]["fieldname"]+"\" class='pr_checkbox'/></td><td class='modal_fieldinputcell'>"+customfieldlist[i]["fieldname"]+"</td>";
		//id='pr_custom_"+customfieldlist[i]["rowid"]+"'
		if (ccount%3 == 2) {
			$("table.modal_createreport_table").append("<tr>"+currentrow+"</tr>");
			currentrow = "";
		}
		ccount = ccount + 1;
	}
	if (currentrow != "") {
		$("table.modal_createreport_table").append("<tr>"+currentrow+"</tr>");
	}
	
	$("#modal_createreport_savebutton").click(function() {
		var newwindow = window.open('','ReportWindow','status=1,toolbar=1,location=1,menubar=1,statusbar=1');
		var reporttitle = $("#modal_createreport_title").val();
		if (reporttitle == "") {
			reporttitle = "Report";
		}
		try {
			newwindow.document.getElementById("everythingcontainer").innerHTML = "<H1>"+reporttitle+"</H1>";
		} catch (e) {
			newwindow.document.write('<html><head><title>'+reporttitle+'</title><link rel="stylesheet" type="text/css" href="/assets/printable.css"/></head><body id="everythingcontainer"><H1>'+reporttitle+'</H1></body></html>');
		}

		var temp_costtracker = new Array();
		var temp_shoptracker = new Array();
		function report_personreport_membership(success2,result2,sql2,parameters2,passthrough2) {
			var memlist = new Array();
			var costtotal = 0.00;
			for (var z in result2) {
				var mrow = result2[z];
				var mod = mrow["modifier"];
				if (mod == "") {
					mod = 0;
				}
				memlist.push(mrow["arealabel"]+": "+mrow["grouplabel"]);
				costtotal = costtotal + parseFloat(mod);
			}
			
			//var shopamount = parseFloat($("#personid_"+parameters2[0]+" .c_shopamount",newwindow.document).text().substring(1));
			var shopamount = parsef(temp_shoptracker[parameters2[0]]);
			costtotal = costtotal + shopamount;
			$("#personid_"+parameters2[0]+" .c_membership",newwindow.document).text(memlist.join(", "));
			$("#personid_"+parameters2[0]+" .c_cost",newwindow.document).text(fd(costtotal));
			temp_costtracker[parameters2[0]] = costtotal;
		}
		
		function report_personreport_shop(success3,result3,sql3,params3,passthrough3) {
			$("#personid_"+params3[0]+" .c_shopspent",newwindow.document).text(fd(result3[0]["spentamount"]));
		}
		
		function report_personreport_paid(success4,result4,sql4,params4,passthrough4) {
			$("#personid_"+params4[0]+" .c_paid",newwindow.document).text(fd(result4[0]["totalpaid"]));
			//var cost = parseFloat($("#personid_"+params4[0]+" .c_cost",newwindow.document).text().substring(1));
			var cost = parsef(temp_costtracker[params4[0]]); 
			var owing = cost - parsef(result4[0]["totalpaid"]);
			$("#personid_"+params4[0]+" .c_owing",newwindow.document).text(fd(owing));
		}
		
		function report_personreport_custom(success5,result5,sql5,params5,passthrough5) {
			for (var z in result5) {
				$("#personid_"+params5[0]+" .v_"+result5[z]["fieldid"],newwindow.document).text(result5[z]["fieldvalue"]);	
			}
		}
		
		function report_personreportresultsingle1(success,result,sql,params,passthrough) {
			//try { console.log('Report SQL: '+sql+" "+params); } catch (e) {}
			var tableid = MRDB.generateid();
			passthrough.append("<table id='cr_"+tableid+"' class='cr_table'><thead class='cr_table'><tr class='cr_header'></tr></thead><tbody class='cr_table'></tbody></table>");
			var pr_fieldlist = new Array();
			var q = new Array();
			$(".pr_checkbox:checked").each(function(index) {
				$("#cr_"+tableid+" .cr_header",newwindow.document).append("<th>"+$(this).attr("label")+"</th>");
				pr_fieldlist.push($(this).val());
			});
			
			for (var i in result) {
				var row = result[i];
				$("#cr_"+tableid+" tbody",newwindow.document).append($("<tr></tr>").attr("id","personid_"+row["rowid"]));
				var sentcustom = false;
				for (var z in pr_fieldlist) {
					var cellvalue = "";
					var checkvalue = pr_fieldlist[z];
					if (checkvalue.substring(0,2) == "r_") {
						cellvalue = row[pr_fieldlist[z].substring(2)];
					} else if (checkvalue.substring(0,2) == "v_") {
						if (!sentcustom) {
							sentcustom = true;
							MRDB.queuequery(q,"select * from people_customdata where personid=?",[row["rowid"]],report_personreport_custom,tableid);
						}
						cellvalue = "";
					} else if (checkvalue == "c_age") {
						cellvalue = getage(parsedate(row["birthdate"]));
					} else if (checkvalue == "c_address") {
						cellvalue = row["address_street"]+", "+row["address_city"]+", "+row["address_postal"];
					} else if (checkvalue == "c_affiliation") {
						cellvalue = row["groupname"];
						if (cellvalue == "" || cellvalue == null) {
							cellvalue = "Unknown";
						}
					} else if (checkvalue == "c_membership") {
						//queryqueue,sql,parameters,subcallback,passthrough
//						MRDB.queuequery(q,"select g.modifier as modifier,g.label as grouplabel,ga.label as arealabel from groupmembership m,groups g,groupareas ga where m.personid=? and m.groupid=g.rowid and g.groupareaid=ga.rowid",[row["rowid"]],report_personreport_membership,tableid);
						cellvalue = "Loading...";
					} else if (checkvalue == "c_shopamount") {
						cellvalue = fd(row["shopvouch"]);
					} else if (checkvalue == "c_signedin") {
						cellvalue = "No";
					} else if (checkvalue == "c_paid") {
//						MRDB.queuequery(q,"select sum(amount) as totalpaid from payments_allocation where personid=?",[row["rowid"]],report_personreport_paid,tableid)
						cellvalue = "Loading...";
					} else if (checkvalue == "c_owing") {
						cellvalue = "Loading...";
					} else if (checkvalue == "c_shopspent") {
//						MRDB.queuequery(q,"select sum(st.amount) as spentamount from shoptransaction st where st.personid=?",[row["rowid"]],report_personreport_shop,tableid)
						cellvalue = "Loading...";
					} else if (checkvalue == "c_cost") {
						cellvalue = "Loading...";
					} else {
						cellvalue = "";
					}
					$("#cr_"+tableid+" tbody tr:last",newwindow.document).append($("<td></td>").attr("class",checkvalue).text(cellvalue+" "));
				}
				temp_shoptracker[row["rowid"]] = parsef(row["shopvouch"]);
				MRDB.queuequery(q,"select g.modifier as modifier,g.label as grouplabel,ga.label as arealabel from groupmembership m,groups g,groupareas ga where m.personid=? and m.groupid=g.rowid and g.groupareaid=ga.rowid",[row["rowid"]],report_personreport_membership,tableid);
				MRDB.queuequery(q,"select sum(amount) as totalpaid from payments_allocation where personid=?",[row["rowid"]],report_personreport_paid,tableid)
				MRDB.queuequery(q,"select sum(st.amount) as spentamount from shoptransaction st where st.personid=?",[row["rowid"]],report_personreport_shop,tableid)
			}
			MRDB.executeSQLOffQueue(q,null);
		}
		
		var filterselection = $("#modal_createreport_filter").val();
		if (filterselection == "") { // All people, single report
			$("body",newwindow.document).append("<H1>Everyone</H1>");
			MRDB.executeSQLWithCallback("select p.*,g.groupname from people p LEFT OUTER JOIN affiliationgroups g on p.affiliation=g.rowid where (p.archived IS NULL or p.archived!=1) order by lastname,firstname",[],report_personreportresultsingle1,$("body",newwindow.document));
		} else if (filterselection.substring(0,2) == "a:") { // Association group
			var itemid = filterselection.substring(2);
			$("body",newwindow.document).append("<H1>"+affiliationgrouplist[itemid]["groupname"]+"</H1>");
			MRDB.executeSQLWithCallback("select *,g.groupname from people p LEFT OUTER JOIN affiliationgroups g on p.affiliation=g.rowid where p.affiliation=? and (p.archived IS NULL or p.archived!=1) order by lastname,firstname",[itemid],report_personreportresultsingle1,$("body",newwindow.document));
		} else if (filterselection.substring(0,1) == "a") { // All affiliation groups (group print)
			for (var z in affiliationgrouplist) {
				$("body",newwindow.document).append("<H1 style='page-break-before: always;'>"+affiliationgrouplist[z]["groupname"]+"</H1><div id='reportarea_"+z+"'></div>");
				MRDB.executeSQLWithCallback("select *,g.groupname from people p LEFT OUTER JOIN affiliationgroups g on p.affiliation=g.rowid where p.affiliation=? and (p.archived IS NULL or p.archived!=1) order by lastname,firstname",[z],report_personreportresultsingle1,$("#reportarea_"+z,newwindow.document));
			}
		} else if (filterselection.substring(0,2) == "b:") { // Group area id (all groups in area, group print)
			var itemid = filterselection.substring(2);
			for (var z in groupdata[itemid]) {
				$("body",newwindow.document).append("<H1 style='page-break-before: always;'>"+groupareadata[itemid]["label"]+": "+groupdata[itemid][z]["label"]+"</H1><div id='reportarea_"+z+"'></div>");
				MRDB.executeSQLWithCallback("select p.*,g.groupname from people p,groupmembership gm LEFT OUTER JOIN affiliationgroups g on p.affiliation=g.rowid where gm.personid=p.rowid and gm.groupid=? and (p.archived IS NULL or p.archived!=1) order by p.lastname,p.firstname",[z],report_personreportresultsingle1,$("#reportarea_"+z,newwindow.document));
			}
			$("body",newwindow.document).append("<H1 style='page-break-before: always;'>"+groupareadata[itemid]["label"]+": Unassigned</H1><div id='reportarea_unassigned'></div>");
			MRDB.executeSQLWithCallback("select p2.*,g.groupname from people p2 LEFT OUTER JOIN affiliationgroups g on p2.affiliation=g.rowid where p2.archived!=1 and p2.rowid NOT IN (select p.rowid from people p,groups g,groupmembership gm where (p.archived IS NULL or p.archived!=1) and gm.personid=p.rowid and gm.groupid=g.rowid and g.groupareaid=?) order by p2.lastname,p2.firstname",[itemid],report_personreportresultsingle1,$("#reportarea_unassigned",newwindow.document));
		} else if (filterselection.substring(0,2) == "c:") { // All people NOT assigned to a group in a grouparea
			var itemid = filterselection.substring(2);
			$("body",newwindow.document).append("<H1>People not assigned in "+groupareadata[itemid]["label"]+"</H1>");
			MRDB.executeSQLWithCallback("select p2.*,g.groupname from people p2 LEFT OUTER JOIN affiliationgroups g on p2.affiliation=g.rowid where p2.archived!=1 and p2.rowid NOT IN (select p.rowid from people p,groups g,groupmembership gm where (p.archived IS NULL or p.archived!=1) and gm.personid=p.rowid and gm.groupid=g.rowid and g.groupareaid=?) order by p2.lastname,p2.firstname",[itemid],report_personreportresultsingle1,$("body",newwindow.document));
		} else if (filterselection.substring(0,2) == "g:") { // All people in a given group
			var itemid = filterselection.substring(2);
			$("body",newwindow.document).append("<H1>"+groupareadata[lookuptable_groupdata[itemid]["groupareaid"]]["label"]+": "+lookuptable_groupdata[itemid]["label"]+"</H1>");
			MRDB.executeSQLWithCallback("select p.*,g.groupname from people p,groupmembership gm LEFT OUTER JOIN affiliationgroups g on p.affiliation=g.rowid where gm.personid=p.rowid and gm.groupid=? and (p.archived IS NULL or p.archived!=1) order by p.lastname,p.firstname",[itemid],report_personreportresultsingle1,$("body",newwindow.document));
		} else {
			alert("There was a problem generating the form. This is a bug");
		}
	});
}

function refresh_matrix() {
	//try { console.log("Refreshing Matrix"); } catch (e) {}
	function refresh_matrix2(success,result) {
		$("#matrixchooser_right").empty();
		$("#matrixchooser_left").empty();
		$("#matrixchooser_left").append("<option value='age'>Age</option>");
		$("#matrixchooser_left").append("<option value='gender'>Gender</option>");
		$("#matrixchooser_left").append("<option value='affiliation'>Affiliation</option>");
		for (var i in result) {
			var row = result[i];
			$("#matrixchooser_left").append("<option value='"+row["rowid"]+"'>"+row["label"]+"</option>");
		}
	}
	MRDB.executeSQLWithCallback("select * from groupareas order by ordering,label",[],refresh_matrix2);
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
			$("#matrixchooser_right").append("<option value='"+sourceval+"'>"+label+"</option>");
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

function hstreport() {
	var newwindow = window.open('','ReportWindow','status=1,toolbar=1,location=1,menubar=1,statusbar=1');
	newwindow.document.write('<html><head><title>Report</title><link rel="stylesheet" type="text/css" href="/assets/printable.css"/></head><body></body></html>');
	$("body",newwindow.document).html("<table><thead><tr><th>Spender</th><th>Item</th><th>Budget Area</th><th>Net</th><th>Tax</th><th>Amount</th></tr></thead><tbody id='reporttable'></tbody></table>");
	function hstreport_results(success,result) {
		var amounttotal = 0.00;
		var taxtotal = 0.00;
		for (var i in result) {
			var row = result[i];
			amounttotal = amounttotal + (0 - parsef(row["amount"]));
			taxtotal = taxtotal + parsef(row["tax"]);
			$("#reporttable",newwindow.document).append("<tr><td>"+row["name"]+"</td><td>"+row["description"]+"</td><td>"+row["budgetareaname"]+"</td><td class='currencycell'>"+fd(0-parsef(row["amount"])-parsef(row["tax"]))+"</td><td class='currencycell'>"+fd(parsef(row["tax"]))+"</td><td class='currencycell'>"+fd(0-parsef(row["amount"]))+"</td></tr>");
//			$("#matrixchooser_left").append("<option value='"+row["rowid"]+"'>"+row["label"]+"</option>");
		}
		$("#reporttable",newwindow.document).append("<tr><td colspan='3'>Total:</td><td class='currencycell'>"+fd(amounttotal - taxtotal)+"</td><td class='currencycell'>"+fd(taxtotal)+"</td><td class='currencycell'>"+fd(amounttotal)+"</td></tr>");
	}
	
	//$("body",newwindow.document).html("<p>zug</p>");
	MRDB.executeSQLWithCallback("select *,b.description as budgetareaname from spenders s left outer join expenditures e on s.rowid=e.spenderid left outer join budgetareas b on e.budgetareaid=b.rowid",[],hstreport_results);
}

function matrix_runreport() {
	var reportdata = new Array();
	var treelist = new Array();
	var sourceval = $("#matrixchooser_right option").each(function() {
		treelist.push($(this).val());
	});
	var reporttype = $("input:radio[name=matrix_datatype]:checked").val();

	function matrix_showreport() {
		//try { console.log("Show Report"); } catch (e) {}
		$("#matrixtable tbody").empty();
		$("#matrixtable thead").empty();
		$("#matrixtable thead").append("<tr></tr>");
		for (var i in treelist) {
			var header = "";
			if (treelist[i] == "age") {
				header = "Age";
			} else if (treelist[i] == "affiliation") {
				header = "Affiliation";
			} else if (treelist[i] == "gender") {
				header = "Gender";
			} else {
				header = groupareadata[treelist[i]]["label"];
			}
			$("#matrixtable thead tr").append("<th class='matrixcell'>"+header+"</th>");
		}
		if (reporttype == "list") {
			$("#matrixtable thead tr").append("<th class='matrixcell'>People</th>");
		} else {
			$("#matrixtable thead tr").append("<th class='matrixcell'>Count</th>");
		}
		matrix_showreport_level(reportdata,"");
	}
	
	function matrix_showreport_level(leveldata,celldata) {
		for (var i in leveldata) {
			if ($.isArray(leveldata[i])) {
				//try { console.log("L: "+i); } catch (e) {}
				matrix_showreport_level(leveldata[i],celldata+"<td class='matrixcell'>"+i+"</td>");
			} else {
				//try { console.log("End: "+leveldata[i]); } catch (e) {}
				var datavalue = "";
				if (reporttype == "list") {
					datavalue = leveldata[i].slice(0,-2);
				} else {
					datavalue = leveldata[i];
				}
				$("#matrixtable tbody").append("<tr>"+celldata+"<td class='matrixcell'>"+i+"</td><td class='matrixcell'>"+datavalue+"</td></tr>");
			}
		}
	}
	
	function matrix_runreport2(success,result) {
		function matrix_runreport3(success2,result2,sql,params,passthrough) {
			
			var thisdata = reportdata;
			var lastindex = treelist.length - 1;
			for (var y in treelist) {
				//try { console.log(treelist[y]); } catch (e) {}
				var datapoint = "";
				if (treelist[y] == "age") {
					datapoint = getage(parsedate(passthrough["birthdate"]));
				} else if (treelist[y] == "gender") {
					datapoint = passthrough["gender"];
				} else if (treelist[y] == "affiliation") {
					datapoint = passthrough["groupname"];
					if (datapoint == "" || datapoint == null) {
						datapoint = "No Affiliation";
					}
				} else {
					for (var z in result2) {
						if (result2[z]["groupareaid"] == treelist[y]) {
							datapoint = result2[z]["grouplabel"];
						}
					}
					if (datapoint == "") {
						datapoint = "Not assigned";
					}
				}
				//try { console.log(datapoint); } catch (e) {}
				if (thisdata[datapoint] == null) {
					if (y == lastindex) {
						//try { console.log("zug"); } catch (e) {}
						if (reporttype == "list") {
							thisdata[datapoint] = "";
						} else {
							thisdata[datapoint] = 0;	
						}
					} else {
						thisdata[datapoint] = new Array();	
					}
				}
				
				if (y == lastindex) {
					if (reporttype == "list") {
						thisdata[datapoint] = thisdata[datapoint] + passthrough["firstname"]+" "+passthrough["lastname"]+", ";
					} else {
						thisdata[datapoint] = thisdata[datapoint] + 1;	
					}
				} else {
					thisdata = thisdata[datapoint];
				}
			}
			
			runtracker[params[0]] = false;
			var done = true;
			for (var x in runtracker) {
				if (runtracker[x]) {
					done = false;
				}
			}
			if (done) {
				matrix_showreport();
			}
		}
		var runtracker = new Array();
		for (var i in result) {
			var person = result[i];
			runtracker[person["rowid"]] = true;
			MRDB.executeSQLWithCallback("select m.personid as personid,g.label as grouplabel,ga.label as grouparealabel,g.rowid as groupid,ga.rowid as groupareaid from groupmembership m,groups g,groupareas ga where m.personid=? and m.groupid=g.rowid and g.groupareaid=ga.rowid",[person["rowid"]],matrix_runreport3,person);
		}
	}
	MRDB.executeSQLWithCallback("select p.*,g.groupname from people p LEFT OUTER JOIN affiliationgroups g on p.affiliation=g.rowid where (p.archived IS NULL or p.archived!=1)",[],matrix_runreport2);
}

function parsef(value) {
	if (value == null || value == "" || isNaN(value-0)) {
		value = 0;
	}
	return parseFloat(value);
}

// Format Dollar strings
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

function getnowstamp() {
	var ct = new Date();
	return ct.getFullYear()+"-"+zerofill(ct.getMonth()+1,2)+"-"+zerofill(ct.getDate(),2)+"-"+zerofill(ct.getHours(),2)+"-"+zerofill(ct.getMinutes(),2)+"-"+zerofill(ct.getSeconds(),2);
	//return "stamp";
}

function zerofill(val,length) {
	var amount = (length - (val+'').length);
	var newval = val+'';
	for (i=0;i<amount;i=i+1) {
		newval = "0" + newval;
	}
	return newval;
}

function genderagesort(a,b) {
	var a_gender = a["gender"];
	var b_gender = b["gender"];
	if (a_gender != b_gender) {
		if (a_gender == "male") {
			return -1;
		} else {
			return 1;
		}
	} else {
		var a_date = parsedate(a);
		var b_date = parsedate(b);
		if (a_date == null) {
			a_date = new Date();
		}
		if (b_date == null) {
			b_date = new Date();
		}
		if (a_date.getTime() > b_date.getTime()) {
			return 1;
		} else if (a_date.getTime() < b_date.getTime()) {
			return -1;
		} else {
			return 0;
		}
	}
}

function showimage(parentobject,fileid,size,removable) {
	parentobject.empty();
	removable = typeof(removable) != 'undefined' ? removable : false;
	if (fileid != null && fileid != "" && fileid != "undefined") {
		parentobject.append("<img src='/db/image?imageid="+fileid+"&size="+size+"'/>");
		parentobject.attr("picturefileid",fileid);
		if (removable) {
			//alert("moo");
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

function nl2br(text) {
	return text.replace("\n","<br/>");
}

function safeforhtml(data) {
	var g_oHtmlEncodeElement = g_oHtmlEncodeElement || document.createElement("div");
	g_oHtmlEncodeElement.innerText = g_oHtmlEncodeElement.textContent = data;
	return g_oHtmlEncodeElement.innerHTML;
	//return data.replace("<","&lt;").replace(">","&gt;");
}

function cleanupdb() {
	MRDB.executeSQLWithCallback("select * from groupmembership where groupid IS NULL or groupid=''",[],function(success,result,sql,params,passthrough) {
		for (var i in result) {
			var row = result[i];
			MRDB.db_delrow("groupmembership",row["rowid"]);
		}
	});

	MRDB.executeSQLWithCallback("select *,count(rowid) as thecount from groupmembership where (groupid NOT NULL and groupid!='') group by groupid,personid",[],function(success,result,sql,params,passthrough) {
		for (var i in result) {
			var row = result[i];
			if (row["thecount"] > 1) {
				//try { console.log(row["thecount"]+","+row["rowid"]+","+row["personid"]+","+row["groupid"]); } catch (e) {}	
				MRDB.executeSQLWithCallback("select * from groupmembership where personid=? and groupid=? order by rowid limit 1,1000",[row["personid"],row["groupid"]],function(success2,result2) {
					for (var x in result2) {
						var row2 = result2[x];
						//try { console.log("2:"+row2["rowid"]+","+row2["personid"]+","+row2["groupid"]); } catch (e) {}
						MRDB.db_delrow("groupmembership",row2["rowid"]);
					}
				});
			}
		}
	});
	
	/*
	MRDB.executeSQLWithCallback("select count(rowid) as thecount,rowid,personid,groupid from groupmembership group by groupid,personid",[],function(success,result,sql,params,passthrough) {
		for (var i in result) {
			var row = result[i];
			if (row["thecount"] > 1) {
				try { console.log(row["thecount"]+","+row["rowid"]+","+row["personid"]+","+row["groupid"]); } catch (e) {}	
			}
			
//			eventsettings[row["varname"]] = row["varvalue"];
//			eventsettings_lookup[row["varname"]] = row["rowid"];
		}
	});*/
}
