<html>
	<head>
		<title>Event Manager for ${eventid}</title>
		<script type="text/javascript">
			var master_eventid='${eventid}';
			var master_channeltoken='${channeltoken}'; 
			var master_clientid='${clientid}';
		</script>
		<link rel="stylesheet" type="text/css" media="screen" href="/assets/app.css"/>
		<link rel="stylesheet" type="text/css" media="print" href="/assets/printable.css"/>
		<link rel="stylesheet" type="text/css" media="screen" href="/assets/ui-lightness/jquery-ui-1.8.18.custom.css"/>
		<link rel="stylesheet" type="text/css" media="screen" href="/assets/tablesorter/style.css"/>
		<script src="/assets/jquery-1.7.1.min.js" type="text/javascript" charset="utf-8"></script>
		<script src="/assets/jquery-ui-1.8.18.custom.min.js" type="text/javascript" charset="utf-8"></script>
		<script src="/assets/jquery.ui.touch-punch.min.js" type="text/javascript" charset="utf-8"></script>
		<script src="/assets/jquery.simplemodal.1.4.1.min.js" type="text/javascript" charset="utf-8"></script>
		<script src="/_ah/channel/jsapi"></script>
		<script src="/assets/jsondb.js" type="text/javascript" charset="utf-8"></script>
		<script src="/jsondb/dbutils" type="text/javascript" charset="utf-8"></script>
		<script src="/jsondb/transactions" type="text/javascript" charset="utf-8"></script>
		<script src="/assets/code.js" type="text/javascript" charset="utf-8"></script>
		<script src="/assets/detect.js" type="text/javascript" charset="utf-8"></script>
		<script src="/assets/jquery.tablesorter.js" type="text/javascript" charset="utf-8"></script>
	</head>
	<body>
		<div id="tabs" class="tabs ui-tabs ui-widget ui-widget-content ui-corner-all">
			<ul class="ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all hidewhenprinting">
				<li class="ui-state-default ui-corner-top ui-tabs-selected ui-state-active"><a href="#tab-groups">Groups</a></li>
				<li class="ui-state-default ui-corner-top"><a href="#tab-people">People</a></li>
				<li class="ui-state-default ui-corner-top"><a href="#tab-affiliation">Affiliation</a></li>
				<li class="ui-state-default ui-corner-top"><a href="#tab-registration">Registration</a></li>
				<li class="ui-state-default ui-corner-top"><a href="#tab-settings">Settings</a></li>
				<li class="ui-state-default ui-corner-top"><a href="#tab-points">Points</a></li>
				<li class="ui-state-default ui-corner-top"><a href="#tab-moneyin">Money In</a></li>
				<li class="ui-state-default ui-corner-top"><a href="#tab-vouchers">Vouchers</a></li>
				<li class="ui-state-default ui-corner-top"><a href="#tab-peoplefinance">People Finance</a></li>
				<li class="ui-state-default ui-corner-top"><a href="#tab-spenders">Spenders</a></li>
				<li class="ui-state-default ui-corner-top"><a href="#tab-budget">Budget</a></li>
				<li class="ui-state-default ui-corner-top"><a href="#tab-matrix">Matrix</a></li>
				<li class="ui-state-default ui-corner-top"><a href="#tab-reports">Reports</a></li>
				<li class="ui-state-default ui-corner-top"><center><input type='button' value='Exit' onClick='window.location="/manage/";'/></center></li>
			</ul>
			<!--//
			------------------------------------------------------------------------------------------------------------------
			------------------------------------------------------------------------------------------------------------------
			------------------------------------------------------------------------------------------------------------------
			//-->
		 	<div id="tab-groups" class="ui-tabs-panel ui-widget-content ui-corner-bottom">
				<p>Groups</p>
				<input type="button" value="    Add Group Area    " onClick='groups_addgrouparea();' class='hidewhenprinting'/><input type="button" value="Refresh" onClick="groups_load();" class='hidewhenprinting'/>
				
				<div id="accordian_grouparea"></div>
				
				<div style="display:none" id="modal_grouparea">
					Group area: <input type="text" size="30" id="modal_grouparea_labelinput"/><br/><br/>
					Public Description:<br/><textarea id="modal_grouparea_publicdescription" cols="60" rows="5"></textarea><br/><br/>
					<div style="text-align:right;">
					Do groups in this area have leaders? <input type="checkbox" id="modal_grouparea_leaders"/><br/>
					<!--//Is this the registration group? Membership of this group defines primary classification of event membership? <input type="checkbox" id="modal_grouparea_regarea"/><br/> //-->
					Are the groups in this area available as a choice in the registration form? <input type="checkbox" id="modal_grouparea_publicchoice"/><br/>
					If this is a choice, is making a choice mandatory? <input type="checkbox" id="modal_grouparea_choicemanditory"/><br/>
					Do groups in this area collect points? <input type="checkbox" id="modal_grouparea_haspoints"/><br/>
					</div>
					<br/><br/>
					<center><input type="button" value="     Save     " id="modal_grouparea_save"/></center>
				</div>
				
				<div style="display:none" id="modal_group">
					Group Label: <input type="text" size="30" id="modal_group_labelinput"/><br/><br/>
					Hide from registration: <input type="checkbox" id="modal_group_hidereg"/><br/><br/>
					Cost Modifier: $<input type="text" size="10" id="modal_group_modifier"/><br/><br/>
					<input type="button" value="   Save   " id="modal_group_save"/>
				</div>
				
				<div style="display:none" id="modal_groupviewer">
					<table id="modal_groupview_datalist_master" class='tablesorter'>
						<thead><tr>
							<th class="modal_groupview_datalist"></th>
							<th class="modal_groupview_datalist">First Name</th>
							<th class="modal_groupview_datalist">Last Name</th>
							<th class="modal_groupview_datalist modal_groupview_datalist_view">View</th>
							<th class="modal_groupview_datalist modal_groupview_datalist_reassign">Reassign</th>
						</tr></thead>
						<tbody id="modal_groupview_datalist"></tbody>
						<tfoot id="modal_groupview_datalist_footer"></tfoot>
					</table>
				</div>
				
				<div style="display:none" id="modal_shopinput" >
					<table class='modal_shopinput_table'>
						<thead>
							<tr>
								<th class='modal_shopinput_table'>First Name</th>
								<th class='modal_shopinput_table'>Last Name</th>
								<th class='modal_shopinput_table'>Vouch</th>
								<th class='modal_shopinput_table'>Remain</th>
								<th class='modal_shopinput_table'>Input</th>
								<th class='modal_shopinput_table'>History</th>
							</tr>
						</thead>
						<tbody id="modal_shopinput_table"></tbody>
					</table>
					<input type="button" id="modal_shopinput_savebutton" value="Save Transactions"/> <input class='contact-cancel contact-button simplemodal-close' type='button' value='Cancel'/>
				</div>
				<div style="display:none" id="modal_groupdistributer">
					This will distribute people currently not in a group in this group area.<br/><br/>
					Filter: Only distribute people if they are in the following group:<br/>
					<select id="modal_groupdistributer_filter"><option value=''>Everyone</option></select><br/><br/>
					Target:<br/>
					<div id='model_groupdistributer_target'></div><br/>
					Sorting Technique:<br/>
					<input type="radio" value="genderage" name="modal_groupdistributer_sortmethod"/> Gender, then Birthdate/Age<br/>
					<input type="radio" value="regorder" name="modal_groupdistributer_sortmethod"/> Registration Order<br/>
					<br/>
					<input type="button" id="modal_groupdistribute_confirm" value="Distribute"/> <input class='contact-cancel contact-button simplemodal-close' type='button' value='Cancel'/>		
				</div>
			</div>
			<!--//
			------------------------------------------------------------------------------------------------------------------
			------------------------------------------------------------------------------------------------------------------
			------------------------------------------------------------------------------------------------------------------
			//-->
			<div id="tab-people" class="ui-tabs-panel ui-widget-content ui-corner-bottom">
				<input type="button" value="Add Person" onClick="people_add();"/><input type="button" value="Refresh" onClick="people_load();"/>
				
				<div id='people-accordion'>
					<h3><a href='#'>People <span id='people_peoplecount'></span></a></h3>
					<div>
						<table id='people_datalist_master' class="people_datalist tablesorter">
							<thead><tr>
								<th class="people_datalist">First Name</th>
								<th class="people_datalist">Last Name</th>
								<th class="people_datalist">Affiliation</th>
								<th class="people_datalist">Signed-in</th>
								<th class="people_datalist  {sorter: false}" colspan='3'>Options</th>
							</tr></thead>
							<tbody id="people_datalist"></tbody>
						</table>
					</div>
					<h3><a href='#'>Removed People <span id='people_unpeoplecount'></span></a></h3>
					<div>
						<table id='unpeople_datalist_master' class="unpeople_datalist tablesorter">
							<thead><tr>
								<th class="unpeople_datalist">First Name</th>
								<th class="unpeople_datalist">Last Name</th>
								<th class="unpeople_datalist  {sorter: false}" colspan='3'>Options</th>
							</tr></thead>
							<tbody id="unpeople_datalist"></tbody>
						</table>
					</div>
				</div>
				
				<!--//
				<div style="display:none" id="modal_people_view">
					<b>Name:</b> <span id="modal_people_view_field_firstname"></span> <span id="modal_people_view_field_lastname"></span><br/>
					<b>Description:</b><br/>
					<span id="modal_people_view_field_description"></span>
					<input type="button" id="modal_people_view_modbutton" value="  Modify  "/> <input class='contact-cancel contact-button simplemodal-close' type='button' value='  Close  '/>
				</div>//-->
			</div>
			<!--//
			------------------------------------------------------------------------------------------------------------------
			------------------------------------------------------------------------------------------------------------------
			------------------------------------------------------------------------------------------------------------------
			//-->
			<div id="tab-affiliation" class="ui-tabs-panel ui-widget-content ui-corner-bottom">
				<p>Affiliation management</p>
				<input type='button' value='Add' onClick='affiliationgroup_add();'/> <input type='button' value='Refresh' onClick='affiliationgroup_load();'/> <input type="button" id="affiliationgroup_viewunaffiliatedbutton" value="  View Unaffiliated People  " onClick="affiliationgroup_view();"/>
				<br/>
				<table id='affiliation_datalist_master' class="affiliation_datalist tablesorter">
					<thead><tr>
						<th class="affiliation_datalist">Label</th>
						<th class="affiliation_datalist">Count</th>
						<th class="affiliation_datalist" colspan='3'>Options</th>
					</tr></thead>
					<tbody id="affiliation_datalist"></tbody>
				</table>
				<div style="display:none" id="modal_affiliationgroup">
					Affiliation Label: <input type="text" size="30" id="modal_affiliationgroup_groupname"/><br/>
					<input type="button" id="modal_affiliationgroup_confirm_submit" value="Save"/> <input class='contact-cancel contact-button simplemodal-close' type='button' value='Cancel'/>
				</div>
				<div style="display:none" id="modal_affiliationgroupviewer">
					<table id="modal_affiliationgroupviewer_datalist_master" class="tablesorter">
						<thead>
							<tr>
								<th class="modal_affiliationgroupviewer_datalist">First Name</th>
								<th class="modal_affiliationgroupviewer_datalist">Last Name</th>
								<th class="modal_affiliationgroupviewer_datalist">Gender</th>
								<th class="modal_affiliationgroupviewer_datalist">Birthdate (Age)</th>
								<th class="modal_affiliationgroupviewer_datalist">View</th>
							</tr>
						</thead>
						<tbody id="modal_affiliationgroupviewer_datalist"></tbody>
					</table>
				</div>
			</div>
			<!--//
			------------------------------------------------------------------------------------------------------------------
			------------------------------------------------------------------------------------------------------------------
			------------------------------------------------------------------------------------------------------------------
			//-->
			<div id="tab-registration" class="ui-tabs-panel ui-widget-content ui-corner-bottom">
				<p>Registration</p>
				
				<div id='registration-accordion'>
					<h3><a href='#'>Unprocessed (New) Registrations</a></h3>
					<div>
						<table id='regtable_new_master' class='tablesorter'>
							<thead>
								<th>First Name</th>
								<th>Last Name</th>
								<th>Stamp</th>
								<th>Options</th>
							</thead>
							<tbody id='regtable_new'></tbody>
						</table>
					</div>
					<h3><a href='#'>Processed Registrations</a></h3>
					<div>
						<table id='regtable_old_master' class='tablesorter'>
							<thead>
								<th>First Name</th>
								<th>Last Name</th>
								<th>Stamp</th>
								<th>Options</th>
							</thead>
							<tbody id='regtable_old'></tbody>
						</table>
					</div>
				</div>
			</div>
			<!--//
			------------------------------------------------------------------------------------------------------------------
			------------------------------------------------------------------------------------------------------------------
			------------------------------------------------------------------------------------------------------------------
			//-->
			<div id="tab-settings" class="ui-tabs-panel ui-widget-content ui-corner-bottom">
				<p>Settings</p>
				<!--//Public Status: <span id="public_statusfield">Loading...</span><br/>
				<input type="button" id="public_statustoggle" value="Loading..."/>
				<a href='/manageapp/online?eventid=${eventid}&status=online' target='_blank'>Set Online</a> - <a href='/manageapp/online?eventid=${eventid}&status=offline' target='_blank'>Set Offline</a> - <a href='/manageapp/consolidate?eventid=${eventid}' target='_blank'>Published to registration form</a>
				<input type='button' value='Publish Test' onClick='publish();'/>//-->
				
				<div id='settings_onlinestatus'></div>
				<hr/>
				Event uses Shop: <input type="checkbox" id="public_useshop"/><br/><br/>
				Public Description of event:<br/>
				<textarea id="public_description" cols="80" rows="7">Loading...</textarea>
				<br/>
				URL For More Information: <input type="text" size="45" id="public_url"/><br/><br/>
				Registration Form Header Instructions:<br/>
				<textarea id="public_headerinstructions" cols="80" rows="7">Loading...</textarea><br/><br/>
				Registration Form Footer Instructions:<br/>
				<textarea id="public_footerinstructions" cols="80" rows="7">Loading...</textarea><br/><br/>
				Registration Message upon completion:<br/>
				<textarea id="public_regsuccess" cols="80" rows="7">Loading...</textarea><br/><br/>
				Email Message sent to person:<br/>
				<textarea id="public_emailsuccess" cols="80" rows="7">Loading...</textarea><br/><br/>
				Email Address to notify of new registrations: <input type="text" size="45" id="public_notifyemail"/><br/><br/>
	
				Fields to make manditory:<br/>
				<table>
					<tr>
						<td><input type='checkbox' id='public_fieldmanditory_firstname'/> First Name</td>
						<td><input type='checkbox' id='public_fieldmanditory_lastname'/> Last Name</td>
						<td><input type='checkbox' id='public_fieldmanditory_homephone'/> Home Phone #</td>
					</tr>
					<tr>
						<td><input type='checkbox' id='public_fieldmanditory_mobilephone'/> Mobile Phone #</td>
						<td><input type='checkbox' id='public_fieldmanditory_email'/> Email Address</td>
						<td><input type='checkbox' id='public_fieldmanditory_parents_name'/> Parents Name</td>
					</tr>
					<tr>
						<td><input type='checkbox' id='public_fieldmanditory_parents_phone'/> Parents Phone #</td>
						<td><input type='checkbox' id='public_fieldmanditory_emergencyinfo'/> Emergency Contact Info.</td>
						<td><input type='checkbox' id='public_fieldmanditory_carecard'/> BC Card Card</td>
					</tr>
					<tr>
						<td><input type='checkbox' id='public_fieldmanditory_birthdate'/> Birthdate</td>
						<td><input type='checkbox' id='public_fieldmanditory_gender'/> Gender</td>
						<td><input type='checkbox' id='public_fieldmanditory_address_street'/> Address: Street</td>
					</tr>
					<tr>
						<td><input type='checkbox' id='public_fieldmanditory_address_city'/> Address: City</td>
						<td><input type='checkbox' id='public_fieldmanditory_address_prov'/> Address: Province</td>
						<td><input type='checkbox' id='public_fieldmanditory_address_country'/> Address: Country</td>
					</tr>
					<tr>
						<td><input type='checkbox' id='public_fieldmanditory_address_postal'/> Address: Postal Code</td>
						<td><input type='checkbox' id='public_fieldmanditory_affiliation'/> Affiliation</td>
					</tr>
				</table>
				<input type="button" id="public_settingsave" value="Save Settings" onClick='settings_save();'/>
				<hr/>
				Additional Registration Fields: <input type="button" value="Add Field" id="btn_reg_addfield" onClick='settings_customfield_add();'/><br/>
				<table id='public_customfields_master' class="public_customfields tablesorter">
					<thead><tr>
						<th class="public_customfields">Label</th>
						<th class="public_customfields">Type</th>
						<th class="public_customfields">Is on Reg. Form</th>
						<th class="public_customfields {sorter: false}" colspan='4'>Options</th>
					</tr></thead>
					<tbody id="public_customfields"></tbody>
				</table>
				
				<div style="display:none" id="modal_customfield">
					Field Label: <input type="text" size="30" id="modal_customfield_label"/><br/>
					Field Type: <select id="modal_customfield_fieldtype"><option value="text">Text</option><option value="largetext">Multi-line text</option><option value="list">Selection List</option></select><br/>
					<div style="display:none" id="modal_customfield_listfields">
						<input type='text' size='20' id='modal_customfield_listfields_text'/><input type='button' value='Add Item' id='modal_customfield_listfields_add'/><br/>
						<table id='modal_customfield_listfields_table'></table>
					</div>
					<input type="checkbox" id="modal_customfield_isreg" checked/> Field available to be filled in upon registration.<br/>
					<input type="checkbox" id="modal_customfield_ismanditory"/> Field is manditory on registration form.<br/>
					Instructions for field (on public form):<br/>
					<textarea id="modal_customfield_instructions" cols="40" rows="5"></textarea><br/><br/>
					<input type="button" id="modal_customfield_confirm_submit" value="Save"/> <input class='contact-cancel contact-button simplemodal-close' type='button' value='Cancel'/>
				</div>
			</div>
			<!--//
			------------------------------------------------------------------------------------------------------------------
			------------------------------------------------------------------------------------------------------------------
			------------------------------------------------------------------------------------------------------------------
			//-->
		 	<div id="tab-points" class="ui-tabs-panel ui-widget-content ui-corner-bottom">
				<p>Points</p>
				<input type="button" value="    Add Points    " onClick='points_add();'/><input type="button" value="Refresh" onClick="points_load();"/>
				
				<div id="accordian_points"></div>
				
				<div style="display:none" id="modal_points">
					Group: <select id="modal_points_groupselect"></select><br/>
					Point Value: <input type="text" id="modal_points_value" size="6"/><br/>
					Reason: <input type="text" id="modal_points_reason" size="40"/><br/>
					<input type="button" id="modal_points_savebutton" value="Save"/> <input class='contact-cancel contact-button simplemodal-close' type='button' value='Cancel'/>
				</div>
			</div>
			<!--//
			------------------------------------------------------------------------------------------------------------------
			------------------------------------------------------------------------------------------------------------------
			------------------------------------------------------------------------------------------------------------------
			//-->
		 	<div id="tab-moneyin" class="ui-tabs-panel ui-widget-content ui-corner-bottom">
				<p>Money In</p>
				<input type="button" value="    Add Money In    " onClick='moneyin_add();'/><input type="button" value="Refresh" onClick="moneyin_load();"/>
				
				<table id="finance_paymenttable"></table>
				
				<div style="display:none" id="modal_moneyin">
					Description of Payment (Type, Cheque #, Made-out-to, from): <input type="text" size="60" id="modal_moneyin_description"/><br/>
					Total Payment: $<input type="text" id="modal_moneyin_totalpayment" size="7" value="0.00"/><br/>
					Is Voucher? <input type="checkbox" id="model_moneyin_isvoucher"/> <select id="modal_moneyin_voucheraffiliation"></select><br/>
					<br/><br/>
					Allocation:<br/>
					<table class="model_moneyin_allocationtable">
						<tbody id="model_moneyin_allocationtable">
							<tr><td class="allocationrow">Amount: $<input type="text" size="6" class="allocationamount" value="0.00"/> Apply to: <select id="modal_moneyin_initalselect" class="allocationdirection"></select><input type="button" value="Remove" onClick="removeallocation(this);"/></td></tr>
						</tbody>
					</table>
					<input type="button" value="Add Additional Allocation" id="model_moneyin_addallocationbutton"/>
					<br/><br/>
					<input type="button" id="modal_moneyin_savebutton" value="Save"/> <input class='contact-cancel contact-button simplemodal-close' type='button' value='Cancel'/>
				</div>
			</div>
			<!--//
			------------------------------------------------------------------------------------------------------------------
			------------------------------------------------------------------------------------------------------------------
			------------------------------------------------------------------------------------------------------------------
			//-->
		 	<div id="tab-vouchers" class="ui-tabs-panel ui-widget-content ui-corner-bottom">
				<p>Vouchers</p> <input type="button" value="Refresh" onClick="vouchers_load();"/>
				<table id="vouchers_vouchertable" class='tablesorter'>
					<thead>
						<tr>
							<th>Voucher Description</th>
							<th>Affiliation</th>
							<th>Allocation</th>
							<th>Amount</th>
							<th>Balance Owed</th>
						</tr>
					</thead>
					<tbody id="vouchers_datatable"></tbody>
				</table>
				
				<table id="vouchers_affiliationsummary" class="tablesorter">
					<thead>
						<tr>
							<th>Affiliation</th>
							<th>Total Balance Owed</th>
						</tr>
					</thead>
					<tbody id="vouchers_affiliationsdatatable"></tbody>
				</table>
			</div>
			<!--//
			------------------------------------------------------------------------------------------------------------------
			------------------------------------------------------------------------------------------------------------------
			------------------------------------------------------------------------------------------------------------------
			//-->
		 	<div id="tab-peoplefinance" class="ui-tabs-panel ui-widget-content ui-corner-bottom">
				<p>People-Finance Report</p> <input type="button" value="Refresh" onClick="peoplefinance_load();"/>

				<table id="peoplefinancetable" class='tablesorter'>
					<thead>
						<tr>
							<th>View</th>
							<th>First Name</th>
							<th>Last Name</th>
							<th>Affiliation</th>
							<th>Cost</th>
							<th>Paid</th>
							<th>Balance Owed</th>
						</tr>
					</thead>
					<tbody id="peoplefinancetable_data"></tbody>
				</table>
			</div>
			<!--//
			------------------------------------------------------------------------------------------------------------------
			------------------------------------------------------------------------------------------------------------------
			------------------------------------------------------------------------------------------------------------------
			//-->
		 	<div id="tab-spenders" class="ui-tabs-panel ui-widget-content ui-corner-bottom">
				<p>Spenders</p> <input type="button" value="Add Spender" onClick="spenders_add();"/> <input type="button" value="HST Report" onClick="spenders_hstreport();"/> <input type="button" value="Refresh" onClick="spenders_load();"/> <input type="button" value="Print" onClick="spenders_print();"/>

				<table id="spendertable">
					<tbody id="spendertable_data"></tbody>
				</table>
				* denotes has NOT been reimbersed
				<div style="display:none" id="modal_spender">
					Name: <input type="text" id="modal_spender_name" size="30"/><br/>
					<input type="button" id="modal_spender_savebutton" value="Save"/> <input class='contact-cancel contact-button simplemodal-close' type='button' value='Cancel'/>
				</div>
			</div>
			<!--//
			------------------------------------------------------------------------------------------------------------------
			------------------------------------------------------------------------------------------------------------------
			------------------------------------------------------------------------------------------------------------------
			//-->
		 	<div id="tab-budget" class="ui-tabs-panel ui-widget-content ui-corner-bottom">
				<p>Budget</p> <input type="button" value="Add Budget Item" onClick="budget_addbudgetitem();"/> <input type="button" value="Add Expense" onClick="budget_addexpenseitem();"/> <input type="button" value="Refresh" onClick="budget_load();"/> <input type="button" value="Print" onClick="budget_print();"/>

				<table class="finance_budgettable" id='finance_budgettable_head'>
					<thead>
						<tr>
							<th></th>
							<th>Budgeted</th>
							<th>Actual</th>
						</tr>
					</thead>
					<tbody id="finance_budgettable">
						<tr>
							<td class='barow'>
								Expected Income:<br/>
								<table class="finance_budget_expectedincome">
									<thead>
										<tr>
											<th>Group Area</th>
											<th>Group</th>
											<th>Count</th>
											<th>Total</th>
										</tr>
									</thead>
									<tbody id="finance_budget_expectedincome"></tbody>
								</table>
							</td>
							<td class='barow currencycell'><span id="finance_budget_totalexpected"></span></td>
							<td class='barow currencycell'></td>
						</tr>
						<tr>
							<td class='barow'>Total actual money in</td>
							<td class='barow currencycell'></td>
							<td class='barow currencycell'><span id="finance_budget_totalallocated"></span></td>
						</tr>
						<tr>
							<td class='barow'>Unpaid Voucher Total (not counted)</td>
							<td class='barow currencycell'></td>
							<td class='barow currencycell'><i>(<span id="finance_budget_vouchtotal"></span>)</i></td>
						</tr>
					</tbody>
				</table>
				<div style="display:none" id="modal_budgetitem">
					Description: <input type="text" id="modal_budgetitem_description" size="30"/><br/><br/>
					(Negative numbers for budgeted "loss", positive numbers of budgeted income)<br/>
					Budgeted Amount: $<input type="text" id="modal_budgetitem_amount" size="7" value="0.00"/><br/>
					OR Budgeted amount based on per-person:<br/>
					$<input type="text" id="modal_budgetitem_perperson" size="7" value="0.00"/> for each person in <select id="modal_budgetitem_perpersongroup"></select>
					<br/>
					<input type="button" id="modal_budgetitem_savebutton" value="Save"/> <input class='contact-cancel contact-button simplemodal-close' type='button' value='Cancel'/>
				</div>
				<div style="display:none" id="modal_expenseitem">
					Description: <input type="text" id="modal_expenseitem_description" size="30"/><br/>
					Spender: <select id="modal_expenseitem_spenderid"></select><br/>
					Budget Area: <select id="modal_expenseitem_budgetareaid"></select><br/>
					(Negative numbers for budgeted "loss", positive numbers of budgeted income)<br/>
					Amount: $<input type="text" id="modal_expenseitem_amount" size="7" value="0.00"/><br/><br/>
					HST (Positive number): $<input type="text" id="modal_expenseitem_tax" size="7" value="0.00"/><br/>
					Has been reimbersed: <input type="checkbox" id="modal_expenseitem_isreimbersed"/><br/><br/>
					<input type="button" id="modal_expenseitem_savebutton" value="Save"/> <input class='contact-cancel contact-button simplemodal-close' type='button' value='Cancel'/>
				</div>
			</div>
			<!--//
			------------------------------------------------------------------------------------------------------------------
			------------------------------------------------------------------------------------------------------------------
			------------------------------------------------------------------------------------------------------------------
			//-->
		 	<div id="tab-matrix" class="ui-tabs-panel ui-widget-content ui-corner-bottom">
				<p>Matrix Report</p> 

				<table class="hidewhenprinting">
					<tr>
						<td><select id='matrixchooser_left' size='6' ondblclick='matrix_moveright();'></select></td>
						<td>
							<input type='button' value='    <    ' onClick='matrix_moveleft();'/><br/>
							<input type='button' value='    >    ' onClick='matrix_moveright();'/><br/>
							<input type='button' value='   Up   ' onClick='matrix_moveup();'/><br/>
							<input type='button' value=' Down ' onClick='matrix_movedown();'/>
						</td>
						<td><select id='matrixchooser_right' size='6' ondblclick='matrix_moveleft();'></select></td>
					</tr>
				</table>
				<span class="hidewhenprinting">
					<input type='radio' name='matrix_datatype' value='count' checked/> Person Count<br/>
					<input type='radio' name='matrix_datatype' value='list'/> People List<br/>
					<input type='button' value='Show Data' onClick='matrix_runreport();'/><br/>
					<hr/>
				</span>
				<table id="matrixtable"><thead></thead><tbody></tbody></table>
			</div>
			<!--//
			------------------------------------------------------------------------------------------------------------------
			------------------------------------------------------------------------------------------------------------------
			------------------------------------------------------------------------------------------------------------------
			//-->
		 	<div id="tab-reports" class="ui-tabs-panel ui-widget-content ui-corner-bottom">
				<p>Reports</p> 

				Report Title: <input type='text' size='30' id='modal_createreport_title'/><br/>
				Filter: <select id="modal_createreport_filter"></select><br/><br/>
				Show Footer: <input type="checkbox" id="modal_createreport_showfooter"/><br/><br/>
				Select Columns to display:<br/>
				<table class="hidewhenprinting">
					<tr>
						<td><select id='modal_createreport_left' size='6' ondblclick='reports_selection_moveright();'></select></td>
						<td>
							<input type='button' value='    <    ' onClick='reports_selection_moveleft();'/><br/>
							<input type='button' value='    >    ' onClick='reports_selection_moveright();'/><br/>
							<input type='button' value='   Up   ' onClick='reports_selection_moveup();'/><br/>
							<input type='button' value=' Down ' onClick='reports_selection_movedown();'/>
						</td>
						<td><select id='modal_createreport_right' size='6' ondblclick='reports_selection_moveleft();'></select></td>
					</tr>
				</table>
				<br/><br/>
				<table id="savedreports"><thead></thead><tbody></tbody></table>
				<br/><br/>
				<input type="button" value="Save" onClick='reports_save();'/> <input type="button" id="modal_createreport_savebutton" value="Display" onClick='reports_run();'/>
			</div>	
		</div>
		<div id='footer'></div>
		<div style="display:none" id="modal_personform">
			<table id="modal_personform_fieldtable" class='modal_fieldtable'>
				<tr>
					<td class='modal_fieldlabelcell'>First Name:</td><td class='modal_fieldinputcell'><input type="text" size="15" id="modal_personform_firstname"/></td>
					<td class='modal_fieldlabelcell'>Last Name:</td><td class='modal_fieldinputcell'><input type="text" size="15" id="modal_personform_lastname"/></td>
				</tr>
				<tr>
					<td class='modal_fieldlabelcell'>Home Phone #:</td><td class='modal_fieldinputcell'><input type="text" size="15" id="modal_personform_homephone"/></td>
					<td class='modal_fieldlabelcell'>Mobile Phone #:</td><td class='modal_fieldinputcell'><input type="text" size="15" id="modal_personform_mobilephone"/></td>
				</tr>
				<tr>
					<td class='modal_fieldlabelcell'>Email Address:</td><td class='modal_fieldinputcell'><input type="text" size="15" id="modal_personform_email"/></td>
					<td class='modal_fieldlabelcell'>Parents Names:</td><td class='modal_fieldinputcell'><input type="text" size="15" id="modal_personform_parents_name"/></td>
				</tr>
				<tr>
					<td class='modal_fieldlabelcell'>Parents Phone #:</td><td class='modal_fieldinputcell'><input type="text" size="15" id="modal_personform_parents_phone"/></td>
					<td class='modal_fieldlabelcell'>Emergency Contact:</td><td class='modal_fieldinputcell'><input type="text" size="15" id="modal_personform_emergencyinfo"/></td>
				</tr>
				<tr>
					<td class='modal_fieldlabelcell'>Care Card #:</td><td class='modal_fieldinputcell'><input type="text" size="15" id="modal_personform_carecard"/></td>
					<td class='modal_fieldlabelcell'>Birthdate (MM/DD/YYYY):</td><td class='modal_fieldinputcell'><input type="text" size="15" id="modal_personform_birthdate"/></td>
				</tr>
				<tr>
					<td class='modal_fieldlabelcell'>Gender:</td><td class='modal_fieldinputcell'><select id="modal_personform_gender"><option value=''>Unknown</option><option value='male'>Male</option><option value='female'>Female</option></select></td>
					<td class='modal_fieldlabelcell'>Street:</td><td class='modal_fieldinputcell'><input type="text" size="15" id="modal_personform_address_street"/></td>
				</tr>
				<tr>
					<td class='modal_fieldlabelcell'>City:</td><td class='modal_fieldinputcell'><input type="text" size="15" id="modal_personform_address_city"/></td>
					<td class='modal_fieldlabelcell'>Postal Code:</td><td class='modal_fieldinputcell'><input type="text" size="15" id="modal_personform_address_postal"/></td>
				</tr>
				<tr>
					<td class='modal_fieldlabelcell'>Comments:</td><td class='modal_fieldinputcell' colspan='3'><textarea cols='60' rows='4' id="modal_personform_comments"></textarea></td>
				</tr>
				<tr>
					<td class='modal_fieldlabelcell'>Affiliation:</td><td class='modal_fieldinputcell'><select id="modal_personform_affiliation"><option value="">None</option></select></td>
				</tr>
				<tr>
					<td class='modal_fieldlabelcell'>Signed in:</td><td class='modal_fieldinputcell'><input type='checkbox' id='modal_perseonform_signedin' value='1'/></td>
				</tr>
			</table>
			Image: <div id="modal_personform_image"></div>
			<table id="modal_personform_grouptable" border="1"></table>
			<div id="modal_personform_shoparea">
				<hr/>
				Amount to vouch for in the shop: <input type="text" id="modal_personform_field_shopamount"/><br/>
			</div>
			<input type="button" value="Add Person to Event" id="model_personform_btn_new"/>
			<input type="button" value="Delete Registration" id="model_personform_btn_delete"/>
			<input class='contact-cancel contact-button simplemodal-close' type='button' value='Do Nothing (close)'/>
		</div>
		<div style="display:none" id="modal_person">
			<div style="position:relative;">
				<div style="float:left;width:180px;">
					<div id="modal_person_field_image"></div>	
				</div>
				<div style="float:left;">
					<b>Name:</b> <span id="modal_person_field_firstname"></span> <span id="modal_person_field_lastname"></span><br/>
					<b>Home Phone #:</b> <span id="modal_person_field_homephone"></span><br/>
					<b>Mobile Phone #:</b> <span id="modal_person_field_mobilephone"></span><br/>
					<b>Email Address:</b> <span id="modal_person_field_email"></span><br/>
		
					Address:<br/>
					<span id="modal_person_field_address_street"></span><br/>
					<span id="modal_person_field_address_city"></span><br/>
					<span id="modal_person_field_address_postal"></span><br/>
		
				</div>
				<div style="float:left;">
					Parents Names: <span id="modal_person_field_parents_name"></span><br/>
					Parents Phone #: <span id="modal_person_field_parents_phone"></span><br/>
					Emergency Info: <span id="modal_person_field_emergencyinfo"></span><br/>
					Care Card #: <span id="modal_person_field_carecard"></span><br/>
					Birthdate: <span id="modal_person_field_birthdate"></span> (Age: <span id="modal_person_field_age"></span>)<br/>
					Gender: <span id="modal_person_field_gender"></span><br/>
				</div>
				<div style="float:left;">
					<table id="modal_person_customtable"></table>
				</div>
				<div style="clear:both;width:100%;"></div>
			</div>
			<hr/>
			Affiliation: <span id="modal_person_field_affiliation"></span><br/>
			Comments: <span id="modal_person_field_comments"></span><br/>
			Amount to vouch for in the shop: <span id="modal_person_field_shopvouch"></span><br/>
			<hr/>
			<div style="position:relative;">
				<div style="float:left;width:50%;">
					Group Membership:<br/>
					<table id="modal_person_grouptable"></table>
				</div>
				<div style="float:left;width:50%;">
					<table id="modal_person_financetable"></table>	
				</div>
				<div style="clear:both;width:100%;"></div>
			</div>
			
			<input type="button" id="modal_person_modbutton" value="  Modify  "/> <input class='contact-cancel contact-button simplemodal-close' type='button' value='  Close  '/> <input type="button" id="modal_person_reportbutton" value="  Report  "/>
			&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type="button" id="modal_person_removebutton" value="Unregister (Remove from event)"/>
		</div>
		<div style="display:none" id="modal_areyousure">
			<br/><br/><center>Are you sure?<br/><br/><br/>
			<input type="button" id="confirm_submit" value="    Yes    "/> <input class='contact-cancel contact-button simplemodal-close' type='button' value='    No    '/>
			</center>
		</div>
		
	</body>
</html>
