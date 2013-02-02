function JSONDB_translate(inputobject) {
	/**
	 * Input is an array of table objects
	 * Each table object is "tablename","data"
	 * data is an array of objects. Each object is a "row"
	 * tables:
	 * -affiliationgroups
	 * -budgetareas
	 * - customfields
	 * - expenditures
	 * -groupareas
	 * -groups
	 * -payments
	 * -payments_allocation
	 * -groupmembership
	 * -people
	 * -people_customdata
	 * shoptransaction
	 * -registrations
	 * -registrations_customdata
	 * -points
	 *- settings
	 *- spenders
	 * -metadata
	 * 
	 * 
	 * New db has:
	 * affiliation
	 * budgetitems
	 * expenseitems
	 * groupareas
	 * moneyin
	 * people
	 * points
	 * registrations
	 * reports
	 * settings
	 * spenders
	 * unpeople
	 */
	var newdb = {};
	var ghash = {};
	
	for (i in inputobject) {
		var table = inputobject[i];
		if (table["tablename"] == "spenders") {
			newdb["spenders"] = {};
			for (r in table["data"]) {
				var row = table["data"][r];
				var id = row["rowid"];
				var newrow = {"id":id}
				//newrow["name"] = row["name"];
				for (x in row) {
					if (x != "rowid") {
						newrow[x] = row[x];
					}
				}
				newdb["spenders"][id] = newrow;
			}
		} else if (table["tablename"] == "settings") {
			
			newdb["settings"] = {};
			var temphash = {};
			for (r in table["data"]) {
				var row = table["data"][r];
				temphash[row["varname"]] = row["varvalue"];
			}
			newdb["settings"]["useshop"] = temphash["useshop"]
			newdb["settings"]["publicurl"] = temphash["publicurl"]
			//newdb["settings"]["publicstatus"] = temphash["publicstatus"]
			newdb["settings"]["publicheaderinstructions"] = temphash["publicheaderinstructions"]
			newdb["settings"]["publicfooterinstructions"] = temphash["publicfooterinstructions"]
			newdb["settings"]["emailnotificationaddress"] = temphash["emailnotificationaddress"]
			newdb["settings"]["publicmailmessage"] = temphash["publicmailmessage"]
			newdb["settings"]["publicsuccessmessage"] = temphash["publicsuccessmessage"]
			newdb["settings"]["public_fieldmanditory_birthdate"] = temphash["manditory_birthdate"]
			newdb["settings"]["public_fieldmanditory_address_city"] = temphash["manditory_address_city"]
			newdb["settings"]["public_fieldmanditory_emergencyinfo"] = temphash["manditory_emergencyinfo"]
			newdb["settings"]["public_fieldmanditory_parents_phone"] = temphash["manditory_parents_phone"]
			newdb["settings"]["public_fieldmanditory_address_prov"] = temphash["manditory_address_prov"]
			newdb["settings"]["public_fieldmanditory_carecard"] = temphash["manditory_carecard"]
			newdb["settings"]["public_fieldmanditory_mobilephone"] = temphash["manditory_mobilephone"]
			newdb["settings"]["public_fieldmanditory_lastname"] = temphash["manditory_lastname"]
			newdb["settings"]["public_fieldmanditory_homephone"] = temphash["manditory_homephone"]
			newdb["settings"]["public_fieldmanditory_address_street"] = temphash["manditory_address_street"]
			newdb["settings"]["public_fieldmanditory_gender"] = temphash["manditory_gender"]
			newdb["settings"]["public_fieldmanditory_address_postal"] = temphash["manditory_address_postal"]
			newdb["settings"]["public_fieldmanditory_email"] = temphash["manditory_email"]
			newdb["settings"]["public_fieldmanditory_firstname"] = temphash["manditory_firstname"]
			newdb["settings"]["public_fieldmanditory_address_country"] = temphash["manditory_address_country"]
			newdb["settings"]["public_fieldmanditory_affiliation"] = temphash["manditory_affiliation"]
			newdb["settings"]["public_fieldmanditory_parents_name"] = temphash["manditory_parents_name"]
			
		} else if (table["tablename"] == "points") {
			newdb["points"] = {};
			for (r in table["data"]) {
				var row = table["data"][r];
				var id = row["rowid"];
				var groupid = row["groupid"];
				if (!newdb["points"].hasOwnProperty(groupid)) {
					newdb["points"][groupid] = [];
				}
				newdb["points"][groupid].push({"id":id,"points":row["value"],"reason":row["reason"]})
			}
		} else if (table["tablename"] == "budgetareas") {
			newdb["budgetitems"] = {};
			for (r in table["data"]) {
				var row = table["data"][r];
				var id = row["rowid"];
				newdb["budgetitems"][id] = {"id":id,"description":row["description"],"budgetedamount":row["budgetedamount"],"perpersonfilter":row["perpersionfilter"]}
			}
		} else if (table["tablename"] == "affiliationgroups") {
			newdb["affiliation"] = {};
			for (r in table["data"]) {
				var row = table["data"][r];
				var id = row["rowid"];
				newdb["affiliation"][id] = {"id":id,"groupname":row["groupname"]}
			}
		} else if (table["tablename"] == "customfields") {
			newdb["settings"]["customfields"] = {};
			newdb["settings"]["customordering"] = [];
			for (r in table["data"]) {
				var row = table["data"][r];
				var id = row["rowid"];
				newdb["settings"]["customordering"].push(id);
				newdb["settings"]["customfields"][id] = {"id":id,"fieldname":row["fieldname"],"fieldtype":row["fieldtype"],"ismanditory":row["ismanditory"],"publicinstructions":row["publicinstructions"]}
			}
		} else if (table["tablename"] == "expenditures") {
			newdb["expenseitems"] = {};
			for (r in table["data"]) {
				var row = table["data"][r];
				var id = row["rowid"];
				newdb["expenseitems"][id] = {"id":id,"amount":row["amount"],"budgetareaid":row["budgetareaid"],"description":row["description"],"reimbersed":row["reimbersed"],"spenderid":row["spenderid"],"tax":row["tax"]}
			}
		} else if (table["tablename"] == "payments") {
			newdb["moneyin"] = {};
			for (r in table["data"]) {
				var row = table["data"][r];
				var id = row["rowid"];
				newdb["moneyin"][id] = {"id":id,"description":row["description"],"isvoucher":"0","total":row["total"],"allocation":[]}
			}
		} else if (table["tablename"] == "payments_allocation") {
			for (r in table["data"]) {
				var row = table["data"][r];
				var id = row["rowid"];
				var paymentid = row["paymentid"]
				var ptype = "general";
				if (row["personid"] != "") {
					ptype = "person";
				}
				if (newdb["moneyin"].hasOwnProperty(paymentid)) {
					newdb["moneyin"][paymentid]["allocation"].push({"id":id,"amount":row["amount"],"refid":row["personid"],"type":ptype})	
				}
			}
		} else if (table["tablename"] == "groupareas") {
			newdb["groupareas"] = {};
			newdb["groupareas"]["orderarray"] = [];
			for (r in table["data"]) {
				var row = table["data"][r];
				var id = row["rowid"];
				newdb["groupareas"][id] = {"id":id,"label":row["label"],"publicdescription":row["publicdescription"],"hasleaders":row["hasleaders"],"isregchoice":row["isregchoice"],"ismanditory":row["ismanditory"],"haspoints":row["haspoints"],"groups":{},"groupordering":[]}
				newdb["groupareas"]["orderarray"].push(id);
			}
		} else if (table["tablename"] == "groups") {
			for (r in table["data"]) {
				var row = table["data"][r];
				var id = row["rowid"];
				var gaid = row["groupareaid"];
				if (newdb["groupareas"].hasOwnProperty(gaid)) {
					ghash[id] = gaid
					newdb["groupareas"][gaid]["groupordering"].push(id);
					newdb["groupareas"][gaid]["groups"][id] = {"id":id,"label":row["label"],"modifier":row["modifier"],"groupareaid":gaid}
				}
			}
			//newdb["ghash"] = ghash;
		} else if (table["tablename"] == "registrations") {
			newdb["registrations"] = {};
			for (r in table["data"]) {
				var row = table["data"][r];
				var id = row["rowid"];
				var newrow = {"id":id,"groupselection":{},"customfields":{}}
				for (z in row) {
					if (z != "isprocessed" && z != "groupselection" && z != "rowid") {
						newrow[z] = row[z];
					} else if (z == "isprocessed") {
						if (row["processed"] == "1") {
							newrow["isprocessed"] = true;
						} else {
							newrow["isprocessed"] = false;
						}
					} else if (z == "groupselection") {
						var gdata = row["groupselection"].split(",");
						for (y in gdata) {
							var gsdata = gdata[y].split(":");
							var s_gaid = gsdata[0];
							var s_gid = gsdata[1];
							newrow["groupselection"][s_gaid] = s_gid;
						}
					}
				}
				
				newdb["registrations"][id] = newrow;
			}
		} else if (table["tablename"] == "registrations_customdata") {
			for (r in table["data"]) {
				var row = table["data"][r];
				var id = row["rowid"];
				var regid = row["registrationid"];
				if (newdb["registrations"].hasOwnProperty(regid)) {
					newdb["registrations"][regid]["customfields"][row["fieldid"]] = {"entry":row["fieldvalue"],"fieldlabel":row["fieldname"]};
				}
			}
		} else if (table["tablename"] == "groupmembership") {
			for (r in table["data"]) {
				var row = table["data"][r];
				var id = row["rowid"];
				var groupid = row["groupid"];
				var personid = row["personid"];
				var isleader = false;
				if (row["isleader"] == "1") {
					isleader = true;
				}

				if (newdb["people"].hasOwnProperty(personid)) {
					var gaid = ghash[row["groupid"]]
					newdb["people"][personid]["groupselection"][gaid] = {"groupid":row["groupid"],"isleader":isleader}
				}
			}
		} else if (table["tablename"] == "people") {
			newdb["people"] = {};
			newdb["unpeople"] = {};
			for (r in table["data"]) {
				var row = table["data"][r];
				var id = row["rowid"];
				var newrow = {"id":id,"groupselection":{},"customfields":{},"shopspend":[]}
				for (z in row) {
					if (z != "signedin" && z != "rowid") {
						newrow[z] = row[z];
					} else if (z == "signedin") {
						if (row["signedin"] == "yes") {
							newrow["signedin"] = true;
						} else {
							newrow["signedin"] = false;
						}
					}
				}
				
				if (row["archived"] == "1") {
					newdb["unpeople"][id] = newrow;
				} else {
					newdb["people"][id] = newrow;
				}
			}
		} else if (table["tablename"] == "people_customdata") {
			for (r in table["data"]) {
				var row = table["data"][r];
				var id = row["rowid"];
				var personid = row["personid"];
				if (newdb["people"].hasOwnProperty(personid)) {
					newdb["people"][personid]["customfields"][row["fieldid"]] = row["fieldvalue"]	
				}
			}
		} else if (table["tablename"] == "shoptransaction") {
			for (r in table["data"]) {
				var row = table["data"][r];
				var id = row["rowid"];
				var personid = row["personid"];
				if (newdb["people"].hasOwnProperty(personid)) {
					newdb["people"][personid]["shopspend"].push({"id":id,"personid":personid,"spend":row["amount"],"stamp":row["inputstamp"]})	
				}
			}
		}
	}
	
	return newdb;
}

