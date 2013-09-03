<!--//<html>
	<head>
		<title>Event Manager for ${eventid}</title>
	</head>
	<body style="margin: 0px;padding: 0px;"></body>

	<script type="text/javascript">
		var eventid='${eventid}';
		var channeltoken='${channeltoken}'; 
		var clientid='${clientid}';
		var iframe = document.createElement('iframe');
		iframe.setAttribute('src','/manage/app.html');
		iframe.setAttribute('style','height:100%;width:100%;border: 0px;scrolling: auto;');
		document.body.appendChild(iframe);
	</script>
</html>
//-->
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
		<link rel="stylesheet" type="text/css" media="screen" href="/assets/ui-lightness/jquery-ui-1.8.13.custom.css"/>
		<script src="/assets/jquery-1.6.1.min.js" type="text/javascript" charset="utf-8"></script>
		<script src="/_ah/channel/jsapi"></script>
		<script src="/assets/json2.js" type="text/javascript" charset="utf-8"></script>
		<script src="/assets/detect.js" type="text/javascript" charset="utf-8"></script>
		<script src="/assets/jquery.simplemodal.1.4.1.min.js" type="text/javascript" charset="utf-8"></script>
		<script src="/assets/schema.js" type="text/javascript" charset="utf-8"></script>
		<script src="/assets/db.js" type="text/javascript" charset="utf-8"></script>
		<script src="/assets/app.js" type="text/javascript" charset="utf-8"></script>
		<script src="/assets/jquery-ui-1.8.13.custom.min.js" type="text/javascript" charset="utf-8"></script>
	</head>
	<body>
		<div id='topheader'><input type="button" onClick="showinterface('groups');" value="Groups" class="topheader_button"/><input type="button" onClick="showinterface('affiliation');" value="Affiliation" class="topheader_button"/><input type="button" onClick="showinterface('people');" value="People" class="topheader_button"/><input type="button" onClick="showinterface('registration');" value="Registrations" class="topheader_button"/><input type="button" onClick="showinterface('public');" value="Settings" class="topheader_button"/><input type="button" onClick="showinterface('points');" value="Points" class="topheader_button"/><input type="button" onClick="showinterface('finance');" value="Finance" class="topheader_button"/><input type="button" onClick="showinterface('matrix');" value="Matrix" class="topheader_button"/><input type="button" onClick="top.location.href='/manage/';" value="Home" class="topheader_button" id="topheader_button_home"/></div>
		<div id="interface_groups" class="primaryinterface">
		<br/>
			<input type="button" value="    Add Group Area    " id="btn_addgrouparea"/>
		<br/><br/>
			<table id="grouptable"></table>

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
				Cost Modifier: $<input type="text" size="10" id="modal_group_modifier"/><br/><br/>
				<input type="button" value="   Save   " id="modal_group_save"/>
			</div>
		
			<div style="display:none" id="modal_areyousure">
				<br/><br/><center>Are you sure?<br/><br/><br/>
				<input type="button" id="confirm_submit" value="    Yes    "/> <input class='contact-cancel contact-button simplemodal-close' type='button' value='    No    '/>
				</center>
			</div>
		
			<div style="display:none" id="modal_groupviewer">
				<table class="modal_groupview_datalist">
					<thead><tr>
						<th class="modal_groupview_datalist"></th>
						<th class="modal_groupview_datalist">First Name</th>
						<th class="modal_groupview_datalist">Last Name</th>
						<th class="modal_groupview_datalist modal_groupview_datalist_view">View</th>
						<th class="modal_groupview_datalist modal_groupview_datalist_reassign">Reassign</th>
					</tr></thead>
					<tbody id="modal_groupview_datalist"></tbody>
				</table>
			</div>
			
			<div style="display:none" id="modal_groupdistributer">
				This will distribute people currently not in a group in this group area.<br/><br/>
				Filter: Only distribute people if they are in the following group:<br/>
				<select id="modal_groupdistributer_filter"><option value=''>Everyone</option></select><br/><br/>
				Sorting Technique:<br/>
				<input type="radio" value="genderage" name="modal_groupdistributer_sortmethod"/> Gender, then Birthdate/Age<br/>
				<input type="radio" value="regorder" name="modal_groupdistributer_sortmethod"/> Registration Order<br/>
				<br/>
				<input type="button" id="modal_groupdistribute_confirm" value="Distribute"/> <input class='contact-cancel contact-button simplemodal-close' type='button' value='Cancel'/>		
			</div>
		
			<div style="display:none" id="modal_processreg">
				<table id="modal_processreg_fieldtable" class='modal_fieldtable'>
					<tr><td class='modal_fieldlabelcell'>First Name:</td><td class='modal_fieldinputcell'><input type="text" size="15" id="modal_processreg_firstname"/></td></tr>
					<tr><td class='modal_fieldlabelcell'>Last Name:</td><td class='modal_fieldinputcell'><input type="text" size="15" id="modal_processreg_lastname"/></td></tr>
					<tr><td class='modal_fieldlabelcell'>Home Phone #:</td><td class='modal_fieldinputcell'><input type="text" size="15" id="modal_processreg_homephone"/></td></tr>
					<tr><td class='modal_fieldlabelcell'>Mobile Phone #:</td><td class='modal_fieldinputcell'><input type="text" size="15" id="modal_processreg_mobilephone"/></td></tr>
					<tr><td class='modal_fieldlabelcell'>Email Address:</td><td class='modal_fieldinputcell'><input type="text" size="15" id="modal_processreg_email"/></td></tr>
					<tr><td class='modal_fieldlabelcell'>Parents Names:</td><td class='modal_fieldinputcell'><input type="text" size="15" id="modal_processreg_parents_name"/></td></tr>
					<tr><td class='modal_fieldlabelcell'>Parents Phone #:</td><td class='modal_fieldinputcell'><input type="text" size="15" id="modal_processreg_parents_phone"/></td></tr>
					<tr><td class='modal_fieldlabelcell'>Emergency Contact:</td><td class='modal_fieldinputcell'><input type="text" size="15" id="modal_processreg_emergencyinfo"/></td></tr>
					<tr><td class='modal_fieldlabelcell'>Care Card #:</td><td class='modal_fieldinputcell'><input type="text" size="15" id="modal_processreg_carecard"/></td></tr>
					<tr><td class='modal_fieldlabelcell'>Birthdate:</td><td class='modal_fieldinputcell'><input type="text" size="15" id="modal_processreg_birthdate"/></td></tr>
					<tr><td class='modal_fieldlabelcell'>Gender:</td><td class='modal_fieldinputcell'><select id="modal_processreg_gender"><option value=''>Unknown</option><option value='male'>Male</option><option value='female'>Female</option></select></td></tr>
					<tr><td class='modal_fieldlabelcell'>Street:</td><td class='modal_fieldinputcell'><input type="text" size="15" id="modal_processreg_address_street"/></td></tr>
					<tr><td class='modal_fieldlabelcell'>City:</td><td class='modal_fieldinputcell'><input type="text" size="15" id="modal_processreg_address_city"/></td></tr>
					<tr><td class='modal_fieldlabelcell'>Postal Code:</td><td class='modal_fieldinputcell'><input type="text" size="15" id="modal_processreg_address_postal"/></td></tr>
					<tr><td class='modal_fieldlabelcell'>Comments:</td><td class='modal_fieldinputcell'><textarea cols='60' rows='4' id="modal_processreg_comments"></textarea></td></tr>
					<tr><td class='modal_fieldlabelcell'>Affiliation:</td><td class='modal_fieldinputcell'><select id="modal_processreg_affiliation"><option value="">None</option></select></td></tr>
				</table>
				Image: <div id="modal_processreg_image"></div>
				<table id="modal_processreg_grouptable" border="1"></table>
				<div id="modal_processreg_shoparea">
					<hr/>
					Amount to vouch for in the shop: <input type="text" id="modal_processreg_field_shopamount"/><br/>
				</div>
				<input type="button" value="Add Person to Event" id="model_processreg_btn_new"/>
				<input type="button" value="Delete Registration" id="model_processreg_btn_delete"/>
		
				<input class='contact-cancel contact-button simplemodal-close' type='button' value='Do Nothing (close)'/>
			</div>
		</div>
		<div id="interface_affiliation" style="display:none;" class="primaryinterface">
			<br/><input type="button" value="  Add Affiliation Group  " id="btn_public_addgroup"/> <input type="button" value="  View Unaffiliated People  " onClick="viewunaffiliatedgroup();"/><br/><br/>
			<table id="public_affiliationgrouptablecontainer"><thead><tr><th>Group Name</th><th># Members</th></tr></thead><tbody id="public_affiliationgrouptable"></tbody></table>
		
		</div>
		<div id="interface_people" style="display:none;" class="primaryinterface">
			<br/><input type="button" value="   Add Person   " onClick="addperson();"/><br/><br/>
			
			<table class="peopletable"><thead><tr><th class="peoplerow_header sortheader" onClick="refresh_people_sort('firstname');">First Name</th><th class="peoplerow_header sortheader" onClick="refresh_people_sort('lastname');">Last Name</th><th class="peoplerow_header sortheader" onClick="refresh_people_sort('affiliation');">Affiliation</th><th class="peoplerow_header sortheader" onClick="refresh_people_sort('signedin');">Signed In</th></tr></thead><tbody id="peopletable"></tbody></table>
		</div>
		<div id="interface_matrix" style="display:none;" class="primaryinterface">
			<br/>Matrix
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
		<div id="interface_registration" style="display:none;" class="primaryinterface">
			<h2>Unprocessed (New) Registrations</h2>
			<table class="regtable"><thead><tr><th class='sortheader' onClick='refresh_registrations_selectsort("firstname");'>First Name</th><th class='sortheader' onClick='refresh_registrations_selectsort("lastname");'>Last Name</th><th class='sortheader' onClick='refresh_registrations_selectsort("stamp");'>Submitted Stamp</th></tr></thead><tbody id="regtable"></tbody></table>
			<hr/>
			<h2>Processed Registrations</h2>
			<table class="regtable"><thead><tr><th class='sortheader' onClick='refresh_registrations_selectsort("firstname");'>First Name</th><th class='sortheader' onClick='refresh_registrations_selectsort("lastname");'>Last Name</th><th class='sortheader' onClick='refresh_registrations_selectsort("stamp");'>Submitted Stamp</th><th>Reg Firstname</th><th>Reg Lastname</th></tr></thead><tbody id="oldregtable"></tbody></table>
		</div>
		<div id="interface_public" style="display:none;" class="primaryinterface">
			Public Status: <span id="public_statusfield">Loading...</span><br/>
			<input type="button" id="public_statustoggle" value="Loading..."/>
			<hr/>
			<input type="button" onClick="cleanupdb();" value="DB Cleanup"/>
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
			<input type="button" id="public_settingsave" value="Save Settings"/>
			<hr/>
			Additional Registration Fields: <input type="button" value="Add Field" id="btn_reg_addfield"/><br/>
			<table class="public_customfields">
				<thead><tr>
					<th class="public_customfields">Label</th>
					<th class="public_customfields">Type</th>
					<th class="public_customfields">Is on Reg. Form</th>
					<th class="public_customfields" colspan='4'>Options</th>
				</tr></thead>
				<tbody id="public_customfields"></tbody>
			</table>
		</div>

		<div id="interface_points" style="display:none" class="primaryinterface">
			<br/><h2>Points Manager</h2><input type="button" value="Add Group Points" onClick="addpoints();"/> <input type="button" value="Report" onClick="report_points();"/><br/><br/>
			<table id="pointstable"></table>
		</div>
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

<div style="display:none" id="modal_affiliationgroup">
	Group: <input type="text" size="30" id="modal_affiliationgroup_groupname"/><br/>
	<input type="button" id="modal_affiliationgroup_confirm_submit" value="Save"/> <input class='contact-cancel contact-button simplemodal-close' type='button' value='Cancel'/>
</div>

<div style="display:none" id="modal_affiliationgroupviewer">
	<table class="modal_affiliationgroupviewer_datalist">
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

<div style="display:none" id="modal_modperson">
	<table class='modal_fieldtable'>
		<tr>
			<td class='modal_fieldlabelcell'>First Name:</td>
			<td class='modal_fieldinputcell'><input type="text" id="modal_modperson_field_firstname"/></td>
			<td class='modal_fieldlabelcell'>Last Name:</td>
			<td class='modal_fieldinputcell'><input type="text" id="modal_modperson_field_lastname"/></td>
		</tr>
		<tr>
			<td class='modal_fieldlabelcell'>Home Phone #:</td>
			<td class='modal_fieldinputcell'><input type="text" id="modal_modperson_field_homephone"/></td>
			<td class='modal_fieldlabelcell'>Mobile Phone #:</td>
			<td class='modal_fieldinputcell'><input type="text" id="modal_modperson_field_mobilephone"/></td>
		</tr>
		<tr>
			<td class='modal_fieldlabelcell'>Parents Names:</td>
			<td class='modal_fieldinputcell'><input type="text" id="modal_modperson_field_parents_name"/></td>
			<td class='modal_fieldlabelcell'>Parents Phone #:</td>
			<td class='modal_fieldinputcell'><input type="text" id="modal_modperson_field_parents_phone"/></td>
		</tr>
		<tr>
			<td class='modal_fieldlabelcell'>Email Address:</td>
			<td class='modal_fieldinputcell' colspan="3"><input type="text" id="modal_modperson_field_email"/></td>
		</tr>
		<tr>
			<td class='modal_fieldlabelcell'>Emergency Info:</td>
			<td class='modal_fieldinputcell' colspan="3"><input type="text" id="modal_modperson_field_emergencyinfo"/></td>
		</tr>
		<tr>
			<td class='modal_fieldlabelcell'>Care Card #:</td>
			<td class='modal_fieldinputcell'><input type="text" id="modal_modperson_field_carecard"/></td>
			<td class='modal_fieldlabelcell'>Birth Date:</td>
			<td class='modal_fieldinputcell'><input type="text" id="modal_modperson_field_birthdate"/></td>
		</tr>		
		<tr>
			<td class='modal_fieldlabelcell'>Gender:</td>
			<td class='modal_fieldinputcell'><select id="modal_modperson_field_gender"><option value=''>Unknown</option><option value='male'>Male</option><option value='female'>Female</option></select></td>
			<td class='modal_fieldlabelcell'>Affiliation:</td>
			<td class='modal_fieldinputcell'><select id="modal_modperson_field_affiliation"><option value="">None</option></select></td>
		</tr>		
	</table>
	<table class='modal_fieldtable'>
		<tr>
			<td class='modal_fieldgroupcell'>Image<br/><div id="modal_modperson_field_image"></div></td>
			<td class='modal_fieldgroupcell'>Address:<br/>
	Street: <input type="text" id="modal_modperson_field_address_street"/><br/>
	City: <input type="text" id="modal_modperson_field_address_city"/><br/>
	Postal: <input type="text" id="modal_modperson_field_address_postal"/></td>
			<td class='modal_fieldgroupcell'>Comments:<br/><textarea cols="40" rows="7" id="modal_modperson_field_comments"></textarea></td>
		</tr>
	</table>
	<hr/>
	Custom Data:<br/>
	<table id="modal_modperson_customtable" border="1"></table>
	<hr/>
	Group Membership:<br/>
	<table id="modal_modperson_grouptable" border="1"></table>
	<div id="modal_modperson_shoparea">
		<hr/>
		Amount to vouch for in the shop: <input type="text" id="modal_modperson_field_shopamount"/><br/>
	</div>
	<hr/>
	<input type="button" id="modal_modperson_savebutton" value="Save"/> <input class='contact-cancel contact-button simplemodal-close' type='button' value='Cancel'/>
</div>

<div style="display:none" id="modal_newperson">
<table class='modal_fieldtable'>
		<tr>
			<td class='modal_fieldlabelcell'>First Name:</td>
			<td class='modal_fieldinputcell'><input type="text" id="modal_newperson_field_firstname"/></td>
			<td class='modal_fieldlabelcell'>Last Name:</td>
			<td class='modal_fieldinputcell'><input type="text" id="modal_newperson_field_lastname"/></td>
		</tr>
		<tr>
			<td class='modal_fieldlabelcell'>Home Phone #:</td>
			<td class='modal_fieldinputcell'><input type="text" id="modal_newperson_field_homephone"/></td>
			<td class='modal_fieldlabelcell'>Mobile Phone #:</td>
			<td class='modal_fieldinputcell'><input type="text" id="modal_newperson_field_mobilephone"/></td>
		</tr>
		<tr>
			<td class='modal_fieldlabelcell'>Parents Names:</td>
			<td class='modal_fieldinputcell'><input type="text" id="modal_newperson_field_parents_name"/></td>
			<td class='modal_fieldlabelcell'>Parents Phone #:</td>
			<td class='modal_fieldinputcell'><input type="text" id="modal_newperson_field_parents_phone"/></td>
		</tr>
		<tr>
			<td class='modal_fieldlabelcell'>Email Address:</td>
			<td class='modal_fieldinputcell' colspan="3"><input type="text" id="modal_newperson_field_email"/></td>
		</tr>
		<tr>
			<td class='modal_fieldlabelcell'>Emergency Info:</td>
			<td class='modal_fieldinputcell' colspan="3"><input type="text" id="modal_newperson_field_emergencyinfo"/></td>
		</tr>
		<tr>
			<td class='modal_fieldlabelcell'>Care Card #:</td>
			<td class='modal_fieldinputcell'><input type="text" id="modal_newperson_field_carecard"/></td>
			<td class='modal_fieldlabelcell'>Birth Date:</td>
			<td class='modal_fieldinputcell'><input type="text" id="modal_newperson_field_birthdate"/></td>
		</tr>		
		<tr>
			<td class='modal_fieldlabelcell'>Gender:</td>
			<td class='modal_fieldinputcell'><select id="modal_newperson_field_gender"><option value=''>Unknown</option><option value='male'>Male</option><option value='female'>Female</option></select></td>
			<td class='modal_fieldlabelcell'>Affiliation:</td>
			<td class='modal_fieldinputcell'><select id="modal_newperson_field_affiliation"><option value="">None</option></select></td>
		</tr>		
	</table>
	<table class='modal_fieldtable'>
		<tr>
			<td class='modal_fieldgroupcell'>Address:<br/>
	Street: <input type="text" id="modal_newperson_field_address_street"/><br/>
	City: <input type="text" id="modal_newperson_field_address_city"/><br/>
	Postal: <input type="text" id="modal_newperson_field_address_postal"/></td>
			<td class='modal_fieldgroupcell'>Comments:<br/><textarea cols="40" rows="7" id="modal_newperson_field_comments"></textarea></td>
		</tr>
	</table>
	
	<hr/>
	Custom Data:<br/>
	<table id="modal_newperson_customtable" border="1"></table>
	<hr/>
	Group Membership:<br/>
	<table id="modal_newperson_grouptable" border="1"></table>
	<div id="modal_newperson_shoparea">
		<hr/>
		Amount to vouch for in the shop: <input type="text" id="modal_newperson_field_shopamount"/><br/>
	</div>

	<input type="button" id="modal_newperson_savebutton" value="Save"/> <input class='contact-cancel contact-button simplemodal-close' type='button' value='Cancel'/>
</div>



<div style="display:none" id="modal_points">
	Group: <select id="modal_points_groupselect"></select><br/>
	Point Value: <input type="text" id="modal_points_value" size="6"/><br/>
	Reason: <input type="text" id="modal_points_reason" size="40"/><br/>
	<input type="button" id="modal_points_savebutton" value="Save"/> <input class='contact-cancel contact-button simplemodal-close' type='button' value='Cancel'/>
</div>

<div id="interface_finance" style="display:none" class="primaryinterface">
	<div id="topheader_finance">
	Finance: 
	<input type="button" value="Money In" onClick="finance_showinterface('moneyin');"/>
	<input type="button" value="Spenders" onClick="finance_showinterface('spenders');"/>
	<input type="button" value="Budget" onClick="finance_showinterface('budget');"/>
	<input type="button" value="People Report" onClick="finance_showinterface('people');"/>
	</div>
	<div id="interface_finance_moneyin" class="interface_finance_subinterface">
		<div class='hidewhenprinting'>Payment Tracking: <input type="button" value="Add Money In" onClick="addmoneyin();"/><input type="button" value="Print" onClick="printMe();"/><br/></div>
		<table id="finance_paymenttable"></table>
	</div>
	<div id="interface_finance_spenders" class="interface_finance_subinterface" style="display:none">
		<div class='hidewhenprinting'>Spender Management: <input type="button" value="Add Spender" onClick="finance_addspender();"/><input type="button" value="Print" onClick="printMe();"/> <input type="button" value="HST Report" onClick="hstreport();"/><br/></div>
		<table id="finance_spendertable"></table>
		* denotes has NOT been reimbersed
	</div>
	<div id="interface_finance_budget" class="interface_finance_subinterface" style="display:none">
		<div class='hidewhenprinting'>Budget: <input type="button" value="Add Budget Item" onClick="finance_addbudget();"/> <input type="button" value="Add Expense" onClick="finance_addexpense();"/> <input type="button" value="Print" onClick="printMe();"/><br/></div>
		
		<table class="finance_budgettable">
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
									<th>Group</th>
									<th>Count</th>
									<th>Total</th>
								</tr>
							</thead>
							<tbody id="finance_budget_expectedincome"></tbody>
						</table>
					</td>
					<td class='barow currencycell'><span id="finance_budget_totalexpected"></span></td>
					<td class='barow currencycell'><span id="finance_budget_totalallocated"></span></td>
				</tr>
				<tr>
					<td class='barow'>General income</td>
					<td class='barow currencycell'></td>
					<td class='barow currencycell'><span id="finance_budget_totalgeneral"></span></td>
				</tr>
			</tbody>
		</table>
	</div>
	<div id="interface_finance_people" class="interface_finance_subinterface" style="display:none">
		<input type="button" value="Print" class="hidewhenprinting" onClick="printMe();"/>
		<table class='finance_peopletable'>
			<thead>
				<tr><th class='finance_peopletable'>First Name</th><th class='finance_peopletable'>Last Name</th><th class='finance_peopletable'>In</th><th class='finance_peopletable'>Cost</th><th class='finance_peopletable'>Owing</th></tr>
			</thead>
			<tbody id="finance_peopletable"></tbody>
		</table>
	</div>
</div>

<div style="display:none" id="modal_moneyin">
	Description of Payment (Type, Cheque #, Made-out-to, from): <input type="text" size="60" id="modal_moneyin_description"/><br/>
	Total Payment: $<input type="text" id="modal_moneyin_totalpayment" size="7" value="0.00"/><br/><br/>
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

<div style="display:none" id="modal_spender">
	Name: <input type="text" id="modal_spender_name" size="30"/><br/>
	<input type="button" id="modal_spender_savebutton" value="Save"/> <input class='contact-cancel contact-button simplemodal-close' type='button' value='Cancel'/>
</div>

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

<div style="display:none" id="modal_createreport">
	Report Title: <input type='text' size='30' id='modal_createreport_title'/><br/>
	Filter: <select id="modal_createreport_filter"></select><br/><br/>
	Select Columns to display:<br/>
	<table class='modal_createreport_table'>
		<tr>
			<td class='modal_fieldinputcell_checkbox'><input type='checkbox' value='r_firstname' label='First Name' class='pr_checkbox' checked/></td>
			<td class='modal_fieldinputcell'>First Name</td>
			<td class='modal_fieldinputcell_checkbox'><input type='checkbox' value='r_lastname' label='Last Name' class='pr_checkbox' checked/></td>
			<td class='modal_fieldinputcell'>Last Name</td>
			<td class='modal_fieldinputcell_checkbox'><input type='checkbox' value='r_homephone' label='Home Phone' class='pr_checkbox'/></td>
			<td class='modal_fieldinputcell'>Home Phone</td>
		</tr>
		<tr>
			<td class='modal_fieldinputcell_checkbox'><input type='checkbox' value='r_mobilephone' label='Mobile Phone' class='pr_checkbox'/></td>
			<td class='modal_fieldinputcell'>Mobile Phone</td>
			<td class='modal_fieldinputcell_checkbox'><input type='checkbox' value='r_email' label='Email' class='pr_checkbox'/></td>
			<td class='modal_fieldinputcell'>Email</td>
			<td class='modal_fieldinputcell_checkbox'><input type='checkbox' value='r_parents_name' label='Parent(s) Name' class='pr_checkbox'/></td>
			<td class='modal_fieldinputcell'>Parents Name(s)</td>
		</tr>
		<tr>
			<td class='modal_fieldinputcell_checkbox'><input type='checkbox' value='r_parents_phone' label='Parent(s) Phone' class='pr_checkbox'/></td>
			<td class='modal_fieldinputcell'>Parents Phone</td>
			<td class='modal_fieldinputcell_checkbox'><input type='checkbox' value='r_emergencyinfo' label='Emergency Info' class='pr_checkbox'/></td>
			<td class='modal_fieldinputcell'>Emergency Info</td>
			<td class='modal_fieldinputcell_checkbox'><input type='checkbox' value='r_carecard' label='Cardcard #' class='pr_checkbox'/></td>
			<td class='modal_fieldinputcell'>Carecard #</td>
		</tr>
		<tr>
			<td class='modal_fieldinputcell_checkbox'><input type='checkbox' value='r_birthdate' label='Birthdate (m/d/y)' class='pr_checkbox'/></td>
			<td class='modal_fieldinputcell'>Birthdate</td>
			<td class='modal_fieldinputcell_checkbox'><input type='checkbox' value='c_age' label='Age' class='pr_checkbox'/></td>
			<td class='modal_fieldinputcell'>Age</td>
			<td class='modal_fieldinputcell_checkbox'><input type='checkbox' value='r_gender' label='Gender' class='pr_checkbox'/></td>
			<td class='modal_fieldinputcell'>Gender</td>
		</tr>
		<tr>
			<td class='modal_fieldinputcell_checkbox'><input type='checkbox' value='c_address' label='Address' class='pr_checkbox'/></td>
			<td class='modal_fieldinputcell'>Address</td>
			<td class='modal_fieldinputcell_checkbox'><input type='checkbox' value='c_affiliation' label='Affiliation' class='pr_checkbox'/></td>
			<td class='modal_fieldinputcell'>Affiliation</td>
			<td class='modal_fieldinputcell_checkbox'><input type='checkbox' value='c_membership' label='Group(s)' class='pr_checkbox'/></td>
			<td class='modal_fieldinputcell'>Group Membership</td>
		</tr>
		<tr>
			<td class='modal_fieldinputcell_checkbox'><input type='checkbox' value='r_comments' label='comments' class='pr_checkbox'/></td>
			<td class='modal_fieldinputcell'>Comments</td>
			<td class='modal_fieldinputcell_checkbox'><input type='checkbox' value='c_shopamount' label='Shop Amount' class='pr_checkbox'/></td>
			<td class='modal_fieldinputcell'>Shop Vouch</td>
			<td class='modal_fieldinputcell_checkbox'><input type='checkbox' value='c_cost' label='Cost' class='pr_checkbox'/></td>
			<td class='modal_fieldinputcell'>Total Cost</td>
		</tr>
		<tr>
			<td class='modal_fieldinputcell_checkbox'><input type='checkbox' value='r_signedin' label='Signed In' class='pr_checkbox'/></td>
			<td class='modal_fieldinputcell'>Signed-in Status</td>
			<td class='modal_fieldinputcell_checkbox'><input type='checkbox' value='c_paid' label='Paid' class='pr_checkbox'/></td>
			<td class='modal_fieldinputcell'>Total Paid (All Allocation)</td>
			<td class='modal_fieldinputcell_checkbox'><input type='checkbox' value='c_owing' label='Owing' class='pr_checkbox'/></td>
			<td class='modal_fieldinputcell'>Total Owing</td>
		</tr>
		<tr>
			<td class='modal_fieldinputcell_checkbox'><input type='checkbox' value='c_shopspent' label='Shop Spent' class='pr_checkbox'/></td>
			<td class='modal_fieldinputcell'>Total Shop Spent</td>
<!-- // 			<td class='modal_fieldinputcell_checkbox'><input type='checkbox' value='c_birthdate' label='Birthdate' class='pr_checkbox' checked/></td>
			<td class='modal_fieldinputcell'>Total Paid</td>//-->
		</tr>
	</table>
	<br/><br/>
	<input type="button" id="modal_createreport_savebutton" value="Display"/> <input class='contact-cancel contact-button simplemodal-close' type='button' value='Close'/>
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
<div id="bottomspacer"><br/><br/><br/><br/></div>

	</body>
</html>