function t_restoredb(params) {
	
}

function t_addreport(params) {
	try { console.log("addreport",params); } catch (e) {}
	try {
		if (!JSONDB.jsondb.hasOwnProperty("reports")) {
			JSONDB.jsondb["reports"] = {};
		}
		JSONDB.jsondb["reports"][params["id"]] = params;
	} catch (e) {
		try { console.error("addreport problem",e,params); } catch (e2) {}
	}
}

/*function t_modifyreport(params) {
	if (JSONDB.jsondb.hasOwnProperty("reports")) {
		if (typeof params["id"] != 'undefined') {
			if (JSONDB.jsondb["reports"].hasOwnProperty(params["id"])) {
				for (p in params) {
					if (p != "id") {
						JSONDB.jsondb["reports"][params["id"]][p] = params[p];	
					}
				}
			}
		}
	}
}*/

function t_removereport(params) {
	try { console.log("removereport",params); } catch (e) {}
	try {
		delete JSONDB.jsondb["reports"][params["id"]];
	} catch (e) {
		try { console.error("removereport problem",e,params); } catch (e2) {}
	}
}


function t_batchsetreimbersed(params) {
	try { console.log("batchsetreimbersed",params); } catch (e) {}
	try {
		for (i in params["elist"]) {
			try {
				JSONDB.jsondb["expenseitems"][params["elist"][i]]["reimbersed"] = "1";	
			} catch (e2) { }
		}
	} catch (e) {
		try { console.error("batchsetreimbersed problem",e,params); } catch (e2) {}
	}
}

function t_addbudgetitem(params) {
	try { console.log("addbudgetitem",params); } catch (e) {}
	try {
		if (!JSONDB.jsondb.hasOwnProperty("budgetitems")) {
			JSONDB.jsondb["budgetitems"] = {};
		}
		JSONDB.jsondb["budgetitems"][params["id"]] = params;
	} catch (e) {
		try { console.error("addbudgetitem problem",e,params); } catch (e2) {}
	}
}

function t_modifybudgetitem(params) {
	if (JSONDB.jsondb.hasOwnProperty("budgetitems")) {
		if (typeof params["id"] != 'undefined') {
			if (JSONDB.jsondb["budgetitems"].hasOwnProperty(params["id"])) {
				for (p in params) {
					if (p != "id") {
						JSONDB.jsondb["budgetitems"][params["id"]][p] = params[p];	
					}
				}
//				try { console.log("Spender modified",JSONDB.jsondb); } catch (e) {}
			}
		}
	}
}

function t_removebudgetitem(params) {
	try { console.log("removebudgetitems",params); } catch (e) {}
	try {
		delete JSONDB.jsondb["budgetitems"][params["id"]];
	} catch (e) {
		try { console.error("removebudgetitems problem",e,params); } catch (e2) {}
	}
}

function t_addexpenseitem(params) {
	try { console.log("addexpenseitem",params); } catch (e) {}
	try {
		if (!JSONDB.jsondb.hasOwnProperty("expenseitems")) {
			JSONDB.jsondb["expenseitems"] = {};
		}
		JSONDB.jsondb["expenseitems"][params["id"]] = params;
	} catch (e) {
		try { console.error("addexpenseitem problem",e,params); } catch (e2) {}
	}
}

function t_modifyexpenseitem(params) {
	if (JSONDB.jsondb.hasOwnProperty("expenseitems")) {
		if (typeof params["id"] != 'undefined') {
			if (JSONDB.jsondb["expenseitems"].hasOwnProperty(params["id"])) {
				for (p in params) {
					if (p != "id") {
						JSONDB.jsondb["expenseitems"][params["id"]][p] = params[p];	
					}
				}
//				try { console.log("Spender modified",JSONDB.jsondb); } catch (e) {}
			}
		}
	}
}

function t_removeexpenseitem(params) {
	try { console.log("removeexpenseitem",params); } catch (e) {}
	try {
		delete JSONDB.jsondb["expenseitems"][params["id"]];
	} catch (e) {
		try { console.error("removeexpenseitem problem",e,params); } catch (e2) {}
	}
}

function t_addspender(params) {
	try { console.log("addspender",params); } catch (e) {}
	try {
		if (!JSONDB.jsondb.hasOwnProperty("spenders")) {
			JSONDB.jsondb["spenders"] = {};
		}
		JSONDB.jsondb["spenders"][params["id"]] = params;
	} catch (e) {
		try { console.error("addspender problem",e,params); } catch (e2) {}
	}
}

function t_modifyspender(params) {
	if (JSONDB.jsondb.hasOwnProperty("spenders")) {
		if (typeof params["id"] != 'undefined') {
			if (JSONDB.jsondb["spenders"].hasOwnProperty(params["id"])) {
				for (p in params) {
					if (p != "id") {
						JSONDB.jsondb["spenders"][params["id"]][p] = params[p];	
					}
				}
//				try { console.log("Spender modified",JSONDB.jsondb); } catch (e) {}
			}
		}
	}
}

function t_removespender(params) {
	try { console.log("removespender",params); } catch (e) {}
	try {
		delete JSONDB.jsondb["spenders"][params["id"]];
	} catch (e) {
		try { console.error("removespender problem",e,params); } catch (e2) {}
	}
}

function t_modifymoneyin(params) {
	// id / description / total / isvoucher / voucheraffiliation / allocation[]
	try { console.log("modifymoneyin",params); } catch (e) {}
	try {
		if (!JSONDB.jsondb.hasOwnProperty("moneyin")) {
			JSONDB.jsondb["moneyin"] = {};
		}
		JSONDB.jsondb["moneyin"][params["id"]] = params;
	} catch (e) {
		try { console.error("modifymoneyin problem",e,params); } catch (e2) {}
	}
}


function t_removemoneyin(params) {
	// id
	try { console.log("removemoneyin",params); } catch (e) {}
	try {
		delete JSONDB.jsondb["moneyin"][params["id"]];
	} catch (e) {
		try { console.error("removemoneyin problem",e,params); } catch (e2) {}
	}
}

function t_addmoneyin(params) {
	// id / description / total / isvoucher / voucheraffiliation / allocation[]
	try { console.log("addmoneyin",params); } catch (e) {}
	try {
		if (!JSONDB.jsondb.hasOwnProperty("moneyin")) {
			JSONDB.jsondb["moneyin"] = {};
		}
		JSONDB.jsondb["moneyin"][params["id"]] = params;
	} catch (e) {
		try { console.error("addmoneyin problem",e,params); } catch (e2) {}
	}
}

function t_removeshopspend(params) {
	// id / personid
	try { console.log("removeshopspend",params); } catch (e) {}
	try {
		for (i in JSONDB.jsondb["people"][params["personid"]]["shopspend"]) {
			var item = JSONDB.jsondb["people"][params["personid"]]["shopspend"][i];
			if (item["id"] == params["id"]) {
				JSONDB.jsondb["people"][item["personid"]]["shopspend"].splice(i,1);
				break;
			}
		}
	} catch (e) {
		try { console.error("removeshopspend problem",e,params); } catch (e2) {}
	}
}

function t_addshopspend(params) {
	try { console.log("addshopspend",params); } catch (e) {}
	try {
		for (i in params["spendlist"]) {
			try {
				var item = params["spendlist"][i]
				//id, personid, spend, stamp
				if (!JSONDB.jsondb["people"][item["personid"]].hasOwnProperty("shopspend")) {
					JSONDB.jsondb["people"][item["personid"]]["shopspend"] = [];
				}
				JSONDB.jsondb["people"][item["personid"]]["shopspend"].push(item);
			} catch (e3) {
				try { console.error("addshopspend problem p",e,item); } catch (e2) {}
			}
		}
	} catch (e) {
		try { console.error("addshopspend problem",e,params); } catch (e2) {}
	}
}

function t_modifypoints(params) {
	try { console.log("modifypoints",params); } catch (e) {}
	try {
		if (JSONDB.jsondb.hasOwnProperty("points") && JSONDB.jsondb["points"].hasOwnProperty(params["originalgroupid"])) {
			for (p in JSONDB.jsondb["points"][params["groupid"]]) {
				if (JSONDB.jsondb["points"][params["originalgroupid"]][p]["id"] == params["id"]) {
					JSONDB.jsondb["points"][params["originalgroupid"]].splice(p,1);
					break;
				}
			}
		}
		if (!JSONDB.jsondb.hasOwnProperty("points")) {
			JSONDB.jsondb["points"] = {};
		}
		if (!JSONDB.jsondb["points"].hasOwnProperty(params["groupid"])) {
			JSONDB.jsondb["points"][params["groupid"]] = [];
		}
		JSONDB.jsondb["points"][params["groupid"]].push({"id":params["id"],"points":params["points"],"reason":params["reason"]});
	} catch (e) {
		try { console.error("modifypoints problem",e,params); } catch (e2) {}
	}
}

function t_addpoints(params) {
	// id / groupid / points / reason
	try { console.log("addpoints",params); } catch (e) {}
	try {
		if (!JSONDB.jsondb.hasOwnProperty("points")) {
			JSONDB.jsondb["points"] = {};
		}
		if (!JSONDB.jsondb["points"].hasOwnProperty(params["groupid"])) {
			JSONDB.jsondb["points"][params["groupid"]] = [];
		}
		JSONDB.jsondb["points"][params["groupid"]].push({"id":params["id"],"points":params["points"],"reason":params["reason"]});
	} catch (e) {
		try { console.error("addpoints problem",e,params); } catch (e2) {}
	}
}

function t_removepoints(params) {
	//id / groupid
	try { console.log("removepoints",params); } catch (e) {}
	try {
		if (JSONDB.jsondb.hasOwnProperty("points") && JSONDB.jsondb["points"].hasOwnProperty(params["groupid"])) {
			for (p in JSONDB.jsondb["points"][params["groupid"]]) {
				if (JSONDB.jsondb["points"][params["groupid"]][p]["id"] == params["id"]) {
					// remove it
					JSONDB.jsondb["points"][params["groupid"]].splice(p,1);
					break;
				}
			}
		}
	} catch (e) {
		try { console.error("removepoints problem",e,params); } catch (e2) {}
	}
}

function t_reassignmultigroup(params) {
	// params["togaid"]
	// params["assignments"] = [{personid,togid}]
	try { console.log("reassignmultigroup",params); } catch (e) {}
	try {
		for (x in params["assignments"]) {
			var personid = params["assignments"][x]["personid"];
			var togid = params["assignments"][x]["togid"];
			if (!JSONDB.jsondb["people"][personid].hasOwnProperty("groupselection")) {
				JSONDB.jsondb["people"][personid]["groupselection"] = {};
			}
			JSONDB.jsondb["people"][personid]["groupselection"][params["togaid"]] = {"groupid":togid,"isleader":false};
		}
	} catch (e) {
		try { console.error("re-assign multi problem",e,params); } catch (e2) {}
	}
}

function t_reassigngroups(params) {
	// params["togid"]
	// params["togaid"]
	// params["isleader"]
	// params["people"] = [peopleidarray]
	try { console.log("reassigngroups",params); } catch (e) {}
	try {
		var isleader = false;
		if (params["isleader"] == true) {
			isleader = true;
		}
		for (x in params["people"]) {
			var personid = params["people"][x];
			if (!JSONDB.jsondb["people"][personid].hasOwnProperty("groupselection")) {
				JSONDB.jsondb["people"][personid]["groupselection"] = {};
			}
			JSONDB.jsondb["people"][personid]["groupselection"][params["togaid"]] = {"groupid":params["togid"],"isleader":isleader};
		}
	} catch (e) {
		try { console.error("re-assign problem",e,params); } catch (e2) {}
	}
}

function t_processreg(params) {
	try { console.log("processreg",params); } catch (e) {}
	try {
		JSONDB.jsondb["registrations"][params["id"]]["isprocessed"] = true;
		try { console.log("Registration Processed",JSONDB.jsondb); } catch (e) {}
	} catch (e) {
		try { console.error("Registration process issue",e,params); } catch (e2) {}
	}
}

function t_removeregistration(params) {
	try { console.log("removeregistration",params); } catch (e) {}
	try {
		delete JSONDB.jsondb["registrations"][params["id"]];
		try { console.log("Registration Removed",JSONDB.jsondb); } catch (e) {}
	} catch (e) {
		try { console.error("Registration removal problem",e,params); } catch (e2) {}
	}
}

function t_addregistration(params) {
	try { console.log("addregistration",params); } catch (e) {}
	if (!JSONDB.jsondb.hasOwnProperty("registrations")) {
		JSONDB.jsondb["registrations"] = {};
	}
	if (typeof params["id"] != 'undefined') {
		JSONDB.jsondb["registrations"][params["id"]] = params;
		try { console.log("Registration added",JSONDB.jsondb); } catch (e) {}
	} else {
		try { console.error("ID parameter missing for adding registration"); } catch (e) {}
	}
}

function t_savesettings(params) {
	try { console.log("savesettings",params); } catch (e) {}
	if (!JSONDB.jsondb.hasOwnProperty("settings")) {
		JSONDB.jsondb["settings"] = {};
	}
	for (p in params) {
		JSONDB.jsondb["settings"][p] = params[p];
	}
	try { console.log("Settings saved",JSONDB.jsondb); } catch (e) {}
}

function t_addcustomfield(params) {
	try { console.log("addcustomfield",params); } catch (e) {}
	
	if (!JSONDB.jsondb.hasOwnProperty("settings")) {
		JSONDB.jsondb["settings"] = {};
	}
	if (!JSONDB.jsondb["settings"].hasOwnProperty("customfields")) {
		JSONDB.jsondb["settings"]["customordering"] = [];
		JSONDB.jsondb["settings"]["customfields"] = {};
	}
	
	if (typeof params["id"] != 'undefined') {
		JSONDB.jsondb["settings"]["customfields"][params["id"]] = params;
		JSONDB.jsondb["settings"]["customordering"].push(params["id"]);
		try { console.log("Custom field Added",JSONDB.jsondb); } catch (e) {}
	}
}

function t_modifycustomfield(params) {
	try { console.log("modifycustomfield",params); } catch (e) {}
	try {
		if (JSONDB.jsondb["settings"]["customfields"].hasOwnProperty(params["id"])) {
			for (p in params) {
				if (p != "id") {
					JSONDB.jsondb["settings"]["customfields"][params["id"]][p] = params[p];	
				}
			}
			try { console.log("Custom field modified",JSONDB.jsondb); } catch (e) {}
		}
	} catch (e) {
		try { console.error("Custom field modify problem",e,params); } catch (e2) {}
	}
}

function t_removecustomfield(params) {
	try { console.log("removecustomfield",params); } catch (e) {}
	try {
		delete JSONDB.jsondb["settings"]["customfields"][params["id"]];
		for (i in JSONDB.jsondb["settings"]["customordering"]) {
			if (JSONDB.jsondb["settings"]["customordering"][i] == params["id"]) {
				JSONDB.jsondb["settings"]["customordering"].splice(i,1);
				break;
			}
		}
		try { console.log("Custom field Removed",JSONDB.jsondb); } catch (e) {}
	} catch (e) {
		try { console.error("Custom field removal problem",e,params); } catch (e2) {}
	}
}

function t_movecustomfield(params) {
	try { console.log("movecustomfield",params); } catch (e) {}
	if (typeof params["id"] != 'undefined' && typeof params["newindex"] != 'undefined') {
		if (JSONDB.jsondb.hasOwnProperty("settings") && JSONDB.jsondb["settings"].hasOwnProperty("customordering")) {
			// Remove from array
			for (i in JSONDB.jsondb["settings"]["customordering"]) {
				if (JSONDB.jsondb["settings"]["customordering"][i] == params["id"]) {
					JSONDB.jsondb["settings"]["customordering"].splice(i,1);
					break;
				}
			}
			// Put in at new location
			if (JSONDB.jsondb["settings"]["customordering"].length > params["newindex"]) {
				JSONDB.jsondb["settings"]["customordering"].splice(params["newindex"],0,params["id"]);	
			} else {
				JSONDB.jsondb["settings"]["customordering"].push(params["id"]);
			}
			try { console.log("Custom field moved",JSONDB.jsondb); } catch (e) {}
		}
	} else {
		try { console.error("id or newindex parameters missing",params); } catch (e) {}
	}
}


function t_addaffiliation(params) {
	try { console.log("addaffiliation",params); } catch (e) {}
	if (!JSONDB.jsondb.hasOwnProperty("affiliation")) {
		JSONDB.jsondb["affiliation"] = {};
	}
	if (typeof params["id"] != 'undefined') {
		JSONDB.jsondb["affiliation"][params["id"]] = params;
		try { console.log("Affiliation added",JSONDB.jsondb); } catch (e) {}
	} else {
		try { console.error("ID parameter missing for adding affiliation"); } catch (e) {}
	}
}

function t_removeaffiliation(params) {
	try { console.log("removeaffiliation",params); } catch (e) {}
	if (JSONDB.jsondb.hasOwnProperty("affiliation")) {
		if (typeof params["id"] != 'undefined') {
			if (JSONDB.jsondb["affiliation"].hasOwnProperty(params["id"])) {
				delete JSONDB.jsondb["affiliation"][params["id"]];
				try { console.log("Affiliation removed",JSONDB.jsondb); } catch (e) {}
			}
		}
	}
}

function t_modifyaffiliation(params) {
	try { console.log("modaffiliation",params); } catch (e) {}
	if (JSONDB.jsondb.hasOwnProperty("affiliation")) {
		if (typeof params["id"] != 'undefined') {
			if (JSONDB.jsondb["affiliation"].hasOwnProperty(params["id"])) {
				for (p in params) {
					if (p != "id") {
						JSONDB.jsondb["affiliation"][params["id"]][p] = params[p];	
					}
				}
				try { console.log("Affiliation modified",JSONDB.jsondb); } catch (e) {}
			}
		}
	}
}

function t_addgroup(params) {
	try { console.log("addgroup",params); } catch (e) {}
	
	if (JSONDB.jsondb.hasOwnProperty("groupareas") && typeof params["id"] != 'undefined' && typeof params["groupareaid"] != 'undefined') {
		if (JSONDB.jsondb["groupareas"].hasOwnProperty(params["groupareaid"])) {
			if (!JSONDB.jsondb["groupareas"][params["groupareaid"]].hasOwnProperty("groups")) {
				JSONDB.jsondb["groupareas"][params["groupareaid"]]["groups"] = {};
			}
			if (!JSONDB.jsondb["groupareas"][params["groupareaid"]].hasOwnProperty("groupordering")) {
				JSONDB.jsondb["groupareas"][params["groupareaid"]]["groupordering"] = [];
			}
			JSONDB.jsondb["groupareas"][params["groupareaid"]]["groups"][params["id"]] = params;
			JSONDB.jsondb["groupareas"][params["groupareaid"]]["groupordering"].push(params["id"]);
			try { console.log("Group Added",JSONDB.jsondb); } catch (e) {}
		}
	}
}

function t_modifygroup(params) {
	try { console.log("modifygroup",params); } catch (e) {}
	if (JSONDB.jsondb.hasOwnProperty("groupareas") && typeof params["id"] != 'undefined' && typeof params["groupareaid"] != 'undefined') {
		if (JSONDB.jsondb["groupareas"].hasOwnProperty(params["groupareaid"])) {
			if (JSONDB.jsondb["groupareas"][params["groupareaid"]].hasOwnProperty("groups")) {
				if (JSONDB.jsondb["groupareas"][params["groupareaid"]]["groups"][params["id"]]) {
					//JSONDB.jsondb["groupareas"][params["groupareaid"]]["groups"][params["id"]] = params;
					for (p in params) {
						if (p != "id" && p != "groupareaid") {
							JSONDB.jsondb["groupareas"][params["groupareaid"]]["groups"][params["id"]][p] = params[p];	
						}
					}
					try { console.log("Group Modified",JSONDB.jsondb); } catch (e) {}
				}
			}
		}
	}
}

function t_removegroup(params) {
	try { console.log("removegroup",params); } catch (e) {}
	try {
		delete JSONDB.jsondb["groupareas"][params["groupareaid"]]["groups"][params["id"]];
		try { console.log("Group Removed",JSONDB.jsondb); } catch (e) {}
	} catch (e) {
		try { console.log("Group removal problem",e,params); } catch (e2) {}
	}
	try {
		for (i in JSONDB.jsondb["groupareas"][params["groupareaid"]]["groupordering"]) {
			if (JSONDB.jsondb["groupareas"][params["groupareaid"]]["groupordering"][i] == params["id"]) {
				JSONDB.jsondb["groupareas"][params["groupareaid"]]["groupordering"].splice(i,1);
				break;
			}
		}
	} catch (e) {
		try { console.log("Group removal problem",e,params); } catch (e2) {}
	}
}

function t_movegroup(params) {
	try { console.log("movegroup",params); } catch (e) {}
	if (JSONDB.jsondb.hasOwnProperty("groupareas") && typeof params["id"] != 'undefined' && typeof params["groupareaid"] != 'undefined') {
		if (JSONDB.jsondb["groupareas"].hasOwnProperty(params["groupareaid"])) {
			if (JSONDB.jsondb["groupareas"][params["groupareaid"]].hasOwnProperty("groupordering")) {
				
				for (i in JSONDB.jsondb["groupareas"][params["groupareaid"]]["groupordering"]) {
					if (JSONDB.jsondb["groupareas"][params["groupareaid"]]["groupordering"][i] == params["id"]) {
						JSONDB.jsondb["groupareas"][params["groupareaid"]]["groupordering"].splice(i,1);
						break;
					}
				}
				// Put in at new location
				if (JSONDB.jsondb["groupareas"][params["groupareaid"]]["groupordering"].length > params["newindex"]) {
					JSONDB.jsondb["groupareas"][params["groupareaid"]]["groupordering"].splice(params["newindex"],0,params["id"]);	
				} else {
					JSONDB.jsondb["groupareas"][params["groupareaid"]]["groupordering"].push(params["id"]);
				}
				try { console.log("Group moved",JSONDB.jsondb); } catch (e) {}
			}
		}
	}
}

function t_addgrouparea(params) {
	try { console.log("addgrouparea",params); } catch (e) {}
	if (!JSONDB.jsondb.hasOwnProperty("groupareas")) {
		JSONDB.jsondb["groupareas"] = {};
	}
	if (typeof params["id"] != 'undefined') {
		if (!JSONDB.jsondb["groupareas"].hasOwnProperty("orderarray")) {
			JSONDB.jsondb["groupareas"]["orderarray"] = [];
		}
		JSONDB.jsondb["groupareas"]["orderarray"].push(params["id"]);

		JSONDB.jsondb["groupareas"][params["id"]] = params;
		try { console.log("Group Area added",JSONDB.jsondb); } catch (e) {}
	} else {
		try { console.error("ID parameter missing for adding grouparea"); } catch (e) {}
	}
}

function t_removegrouparea(params) {
	try { console.log("removegrouparea",params); } catch (e) {}
	if (JSONDB.jsondb.hasOwnProperty("groupareas")) {
		if (typeof params["id"] != 'undefined') {
			if (JSONDB.jsondb["groupareas"].hasOwnProperty(params["id"])) {
				delete JSONDB.jsondb["groupareas"][params["id"]];
				
				for (i in JSONDB.jsondb["groupareas"]["orderarray"]) {
					if (JSONDB.jsondb["groupareas"]["orderarray"][i] == params["id"]) {
						JSONDB.jsondb["groupareas"]["orderarray"].splice(i,1);
						break;
					}
				}
				
				try { console.log("Grouparea removed",JSONDB.jsondb); } catch (e) {}
			}
		}
	}
}

function t_movegrouparea(params) {
	try { console.log("movegrouparea",params); } catch (e) {}
	if (typeof params["id"] != 'undefined' && typeof params["newindex"] != 'undefined') {
		if (JSONDB.jsondb.hasOwnProperty("groupareas") && JSONDB.jsondb["groupareas"].hasOwnProperty("orderarray")) {
			// Remove from array
			for (i in JSONDB.jsondb["groupareas"]["orderarray"]) {
				if (JSONDB.jsondb["groupareas"]["orderarray"][i] == params["id"]) {
					JSONDB.jsondb["groupareas"]["orderarray"].splice(i,1);
					break;
				}
			}
			// Put in at new location
			if (JSONDB.jsondb["groupareas"]["orderarray"].length > params["newindex"]) {
				JSONDB.jsondb["groupareas"]["orderarray"].splice(params["newindex"],0,params["id"]);	
			} else {
				JSONDB.jsondb["groupareas"]["orderarray"].push(params["id"]);
			}
			try { console.log("Grouparea moved",JSONDB.jsondb); } catch (e) {}
		}
	} else {
		try { console.error("id or newindex parameters missing",params); } catch (e) {}
	}
}

function t_modifygrouparea(params) {
	try { console.log("modifygrouparea",params); } catch (e) {}
	if (JSONDB.jsondb.hasOwnProperty("groupareas")) {
		if (typeof params["id"] != 'undefined') {
			if (JSONDB.jsondb["groupareas"].hasOwnProperty(params["id"])) {
				for (p in params) {
					if (p != "id") {
						JSONDB.jsondb["groupareas"][params["id"]][p] = params[p];	
					}
				}
				try { console.log("Group area modified",JSONDB.jsondb); } catch (e) {}
			}
		}
	}
}

function t_addperson(params) {
	try { console.log("addperson",params); } catch (e) {}
	if (!JSONDB.jsondb.hasOwnProperty("people")) {
		JSONDB.jsondb["people"] = {};
	}
	if (typeof params["id"] != 'undefined') {
		JSONDB.jsondb["people"][params["id"]] = params;
		try { console.log("Person added",JSONDB.jsondb); } catch (e) {}
	} else {
		try { console.error("ID parameter missing for adding person"); } catch (e) {}
	}
}

function t_removeperson(params) {
	try { console.log("removeperson",params); } catch (e) {}
	if (!JSONDB.jsondb.hasOwnProperty("unpeople")) {
		JSONDB.jsondb["unpeople"] = {};
	}
	if (JSONDB.jsondb.hasOwnProperty("people")) {
		if (typeof params["id"] != 'undefined') {
			if (JSONDB.jsondb["people"].hasOwnProperty(params["id"])) {
				JSONDB.jsondb["unpeople"][params["id"]] = JSONDB.jsondb["people"][params["id"]];
				delete JSONDB.jsondb["people"][params["id"]];
				try { console.log("Person removed",JSONDB.jsondb); } catch (e) {}
			}
		}
	}
}

function t_unremoveperson(params) {
	try { console.log("unremoveperson",params); } catch (e) {}
	if (JSONDB.jsondb.hasOwnProperty("unpeople")) {
		if (typeof params["id"] != 'undefined') {
			if (JSONDB.jsondb["unpeople"].hasOwnProperty(params["id"])) {
				JSONDB.jsondb["people"][params["id"]] = JSONDB.jsondb["unpeople"][params["id"]];
				delete JSONDB.jsondb["unpeople"][params["id"]];
				try { console.log("Person unremoved",JSONDB.jsondb); } catch (e) {}
			}
		}
	}
}

function t_modperson(params) {
	try { console.log("modperson",params); } catch (e) {}
	if (JSONDB.jsondb.hasOwnProperty("people")) {
		if (typeof params["id"] != 'undefined') {
			if (JSONDB.jsondb["people"].hasOwnProperty(params["id"])) {
				for (p in params) {
					if (p != "id") {
						JSONDB.jsondb["people"][params["id"]][p] = params[p];	
					}
				}
				try { console.log("Person modified",JSONDB.jsondb); } catch (e) {}
			}
		}
	}
}
