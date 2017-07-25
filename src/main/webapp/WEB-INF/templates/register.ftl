<html>
<head>
	<title>Register for ${eventtitle} - Event Synergy</title>
	<link rel="stylesheet" type="text/css" media="screen" href="/assets/ui-lightness/jquery-ui-1.8.13.custom.css"/>
	<script src="/assets/jquery-1.7.1.min.js" type="text/javascript" charset="utf-8"></script>
	<script src="/assets/jquery-ui-1.8.18.custom.min.js" type="text/javascript" charset="utf-8"></script>
	<script>
/*	$(function() {
		$( "#birthdate" ).datepicker({
			changeMonth: true,
			changeYear: true,
			yearRange: "c-80:c+100",
			buttonImage: "images/calendar.gif"
		});
	});*/
	
	function checkit() {
		var isok = true;
		var bad_fields = [];
		$(".manditoryfield").each(function(i) {
			//try { console.log("check",$(this),i); } catch (e) {}
			if ($(this).attr("type") == "radio") {
				checkfieldname = $(this).attr("name");
				checkval = $('input[name='+checkfieldname+']').filter(':checked').val();
				//console.log(checkval);
				if(typeof checkval === 'undefined'){
					isok = false;
					label = $(this).attr("manditory_label");
					if ($.inArray(label, bad_fields) == -1) {
						bad_fields.push(label);
					}
				};
			} else if ($(this).val() == "") {
				isok = false;
				bad_fields.push($(this).attr("manditory_label"));
			}
		});
		if (!isok) {
			alert("There are manditory fields not filled out. Please fill the fields out and retry.\n" + bad_fields.join("\n"));
		}
		if ($("#input_email").val() != $("#input_email_confirm").val()) {
			isok = false;
			alert("Email does not match email confirmation. Please fix and re-submit.");
		}
		return isok;
	}
	</script>
	<style>
	    #outerbox {
	    	width: 100%;
	    	text-align: center;
	    }
	    #formbox {
		    border:solid black 1px;
		    right:25%;
		    left:25%;
		    padding:15px;
		    -webkit-border-radius: 10px;
		    -moz-border-radius: 10px;
		    border-radius: 10px;
		    width: 800px;
			margin-left:auto;
			margin-right:auto;
			text-align: left;
	    }
	    body,td,tr {
	    	font-family: Verdana;
			font-size: 9pt;
	    }
	    
	    .groupselectioncell {
	    	padding: 10px;
	    	background-color: #cccccc;
	    }
	    
	    .currencycell {
	    	text-align: right;
	    }
	</style>
</head>
<body>
	<#if isallowed>
		<div id="outerbox">
		<div id="formbox">
		<H1>Register for ${eventtitle}</H1>
		<#if settings.publicheaderinstructions.isDefined()>${settings.publicheaderinstructions.get()}</#if>
		<hr/>
		<form action='/register' method='POST' onSubmit="return checkit();" enctype="multipart/form-data">
		<input type='hidden' name='eventid' value='${eventid}'/>
		First Name: <input type='text' size='15' name='firstname' manditory_label='First Name' <#if settings.public_fieldmanditory_firstname.isDefined() && settings.public_fieldmanditory_firstname.get() == "yes"> class='manditoryfield'</#if>/> <#if settings.public_fieldmanditory_firstname.isDefined() && settings.public_fieldmanditory_firstname.get() == "yes"><span class='manditorytag'>*</span></#if>&nbsp;&nbsp;&nbsp;&nbsp;
		Last Name: <input type='text' size='15' name='lastname' manditory_label='Last Name' <#if settings.public_fieldmanditory_lastname.isDefined() && settings.public_fieldmanditory_lastname.get() == "yes"> class='manditoryfield'</#if>/> <#if settings.public_fieldmanditory_lastname.isDefined() && settings.public_fieldmanditory_lastname.get() == "yes"><span class='manditorytag'>*</span></#if><br/>
		<br/>
		Home Phone Number: <input type='text' size='15' name='homephone' manditory_label='Home Phone Number' <#if settings.public_fieldmanditory_homephone.isDefined() && settings.public_fieldmanditory_homephone.get() == "yes"> class='manditoryfield'</#if>/> <#if settings.public_fieldmanditory_homephone.isDefined() && settings.public_fieldmanditory_homephone.get() == "yes"><span class='manditorytag'>*</span></#if>&nbsp;&nbsp;&nbsp;&nbsp;
		Mobile Phone: <input type='text' size='15' name='mobilephone' manditory_label='Mobile Phone' <#if settings.public_fieldmanditory_mobilephone.isDefined() && settings.public_fieldmanditory_mobilephone.get() == "yes"> class='manditoryfield'</#if>/> <#if settings.public_fieldmanditory_mobilephone.isDefined() && settings.public_fieldmanditory_mobilephone.get() == "yes"><span class='manditorytag'>*</span></#if><br/>
		Email Address: <input type='text' size='30' id='input_email' name='email' manditory_label='Email Address' <#if settings.public_fieldmanditory_email.isDefined() && settings.public_fieldmanditory_email.get() == "yes"> class='manditoryfield'</#if>/> <#if settings.public_fieldmanditory_email.isDefined() && settings.public_fieldmanditory_email.get() == "yes"><span class='manditorytag'>*</span></#if><br/>
		Confirm Email Address: <input type='text' size='30' id='input_email_confirm' name='email_confirm' manditory_label='Email Address Confirmation' <#if settings.public_fieldmanditory_email.isDefined() && settings.public_fieldmanditory_email.get() == "yes"> class='manditoryfield'</#if>/> <#if settings.public_fieldmanditory_email.isDefined() && settings.public_fieldmanditory_email.get() == "yes"><span class='manditorytag'>*</span></#if><br/>
		Picture: <input type='file' name='picture'/><br/>
		<br/>
		Birthdate: <select name="DateOfBirth_Month" manditory_label='Birthdate Month' <#if settings.public_fieldmanditory_birthdate.isDefined() && settings.public_fieldmanditory_birthdate.get() == "yes"> class='manditoryfield'</#if>/>>
	<option value=""> - Month - </option>
	<option value="01">January</option>
	<option value="02">Febuary</option>
	<option value="03">March</option>
	<option value="04">April</option>
	<option value="05">May</option>
	<option value="06">June</option>
	<option value="07">July</option>
	<option value="08">August</option>
	<option value="09">September</option>
	<option value="10">October</option>
	<option value="11">November</option>
	<option value="12">December</option>
</select>

<select name="DateOfBirth_Day" manditory_label='Birthdate Day' <#if settings.public_fieldmanditory_birthdate.isDefined() && settings.public_fieldmanditory_birthdate.get() == "yes"> class='manditoryfield'</#if>/>>
	<option value=""> - Day - </option>
	<option value="01">1</option>
	<option value="02">2</option>
	<option value="03">3</option>
	<option value="04">4</option>
	<option value="05">5</option>
	<option value="06">6</option>
	<option value="07">7</option>
	<option value="08">8</option>
	<option value="09">9</option>
	<option value="10">10</option>
	<option value="11">11</option>
	<option value="12">12</option>
	<option value="13">13</option>
	<option value="14">14</option>
	<option value="15">15</option>
	<option value="16">16</option>
	<option value="17">17</option>
	<option value="18">18</option>
	<option value="19">19</option>
	<option value="20">20</option>
	<option value="21">21</option>
	<option value="22">22</option>
	<option value="23">23</option>
	<option value="24">24</option>
	<option value="25">25</option>
	<option value="26">26</option>
	<option value="27">27</option>
	<option value="28">28</option>
	<option value="29">29</option>
	<option value="30">30</option>
	<option value="31">31</option>
</select>

<select name="DateOfBirth_Year" manditory_label='Birthdate Year' <#if settings.public_fieldmanditory_birthdate.isDefined() && settings.public_fieldmanditory_birthdate.get() == "yes"> class='manditoryfield'</#if>/>>
	<option value=""> - Year - </option>
	<#list available_years as y>
		<option value='${y?string.computer}'>${y?string.computer}</option>
	</#list>	
</select>
<#if settings.public_fieldmanditory_birthdate.isDefined() && settings.public_fieldmanditory_birthdate.get() == "yes"><span class='manditorytag'>*</span></#if>
<br/>		
		<!--//<input type='text' id='birthdate' name='birthdate'<#if settings.public_fieldmanditory_birthdate.isDefined() && settings.public_fieldmanditory_birthdate.get() == "yes"> class='manditoryfield'</#if>/> <#if settings.public_fieldmanditory_birthdate.isDefined() && settings.public_fieldmanditory_birthdate.get() == "yes"><span class='manditorytag'>*</span></#if><br/>//-->
		
		Gender: <select name='gender' manditory_label='Gender' <#if settings.public_fieldmanditory_gender.isDefined() && settings.public_fieldmanditory_gender.get() == "yes"> class='manditoryfield'</#if>/>><option value=''>Please Select...</option><option value='male'>Male</option><option value='female'>Female</option></select> <#if settings.public_fieldmanditory_gender.isDefined() && settings.public_fieldmanditory_gender.get() == "yes"><span class='manditorytag'>*</span></#if><br/>
		<br/>
		Parents or Guardian's Name(s): <input type='text' size='30' name='parents_name' manditory_label='Parents Name' <#if settings.public_fieldmanditory_parents_name.isDefined() && settings.public_fieldmanditory_parents_name.get() == "yes"> class='manditoryfield'</#if>/> <#if settings.public_fieldmanditory_parents_name.isDefined() && settings.public_fieldmanditory_parents_name.get() == "yes"><span class='manditorytag'>*</span></#if><br/>
		Parents or Guardian's Phone #: <input type='text' size='30' name='parents_phone' manditory_label='Parents Phone Number' <#if settings.public_fieldmanditory_parents_phone.isDefined() && settings.public_fieldmanditory_parents_phone.get() == "yes"> class='manditoryfield'</#if>/> <#if settings.public_fieldmanditory_parents_phone.isDefined() && settings.public_fieldmanditory_parents_phone.get() == "yes"><span class='manditorytag'>*</span></#if><br/>
		<br/>
		Emergency Contact Information (Name(s), Relation(s), and phone #):<br/>
		<input type='text' size='60' name='emergencyinfo' manditory_label='Emergency Contact Info' <#if settings.public_fieldmanditory_emergencyinfo.isDefined() && settings.public_fieldmanditory_emergencyinfo.get() == "yes"> class='manditoryfield'</#if>/> <#if settings.public_fieldmanditory_emergencyinfo.isDefined() && settings.public_fieldmanditory_emergencyinfo.get() == "yes"><span class='manditorytag'>*</span></#if><br/>
		Provincial Health #: <input type='text' size='15' name='carecard' manditory_label='BC Care Card' <#if settings.public_fieldmanditory_carecard.isDefined() && settings.public_fieldmanditory_carecard.get() == "yes"> class='manditoryfield'</#if>/> <#if settings.public_fieldmanditory_carecard.isDefined() && settings.public_fieldmanditory_carecard.get() == "yes"><span class='manditorytag'>*</span></#if><br/>
		<br/>
		Youth Group Affiliation: <select name='affiliation' manditory_label='Youth Group Affiliation' <#if settings.public_fieldmanditory_affiliation.isDefined() && settings.public_fieldmanditory_affiliation.get() == "yes"> class='manditoryfield'</#if>>
			<option value=''>Please Select...</option>
			<option value='nothing'>Not on the list</option>
			<#list affiliationgroups as g>
				<option value='${g.groupid()}'>${g.label()}</option>
			</#list>
		</select> <#if settings.public_fieldmanditory_affiliation.isDefined() && settings.public_fieldmanditory_affiliation.get() == "yes"><span class='manditorytag'>*</span></#if><br/>
		<i>You must select your youth group from the drop-down list. If your group is not listed, select "Not on the List" and enter the name of your group in the box right below. If you do not have a regular group, enter "None"</i><br/><br/>
		
		<#list customfields as cf>
			  <#if cf.ismanditory() == "1"><span class='manditorytag'>* </span></#if> ${cf.label()}: 
			  <#if cf.fieldtype()=="text">
			  	<input type="text" name="customfield_${cf.fieldid()}" size="30" manditory_label="${cf.label()?html}" <#if cf.ismanditory() == "1"> class='manditoryfield'</#if>/>
			  <#elseif cf.fieldtype()=="list">
			  	<select name="customfield_${cf.fieldid()}" manditory_label="${cf.label()?html}" <#if cf.ismanditory() == "1"> class='manditoryfield'</#if>>
			  		<option value="">Please Select...</option>
			  		<#list cf.fieldoptions() as op>
			  			<#if op == "">
			  			<#else>
			  				<option value="${op}">${op}</option>
			  			</#if>
			  		</#list>
			  	</select>
			  <#else>
			  	<br/><textarea cols="60" rows="3" name="customfield_${cf.fieldid()}" manditory_label="${cf.label()?html}" <#if cf.ismanditory() == "1"> class='manditoryfield'</#if>></textarea>
			  </#if>
			  <br/><i>${cf.description()}</i><br/><br/>
		</#list>
		<br/>
		Address (Where you live):<br/>
		Street: <input type='text' size='25' name='address_street' manditory_label='Address - Street' <#if settings.public_fieldmanditory_address_street.isDefined() && settings.public_fieldmanditory_address_street.get() == "yes"> class='manditoryfield'</#if>/> <#if settings.public_fieldmanditory_address_street.isDefined() && settings.public_fieldmanditory_address_street.get() == "yes"><span class='manditorytag'>*</span></#if><br/>
		City: <input type='text' size='20' name='address_city' manditory_label='Address - City' <#if settings.public_fieldmanditory_address_city.isDefined() && settings.public_fieldmanditory_address_city.get() == "yes"> class='manditoryfield'</#if>/> <#if settings.public_fieldmanditory_address_city.isDefined() && settings.public_fieldmanditory_address_city.get() == "yes"><span class='manditorytag'>*</span></#if><br/>
		Postal Code: <input type='text' size='10' name='address_postal' manditory_label='Address - Postal Code' <#if settings.public_fieldmanditory_address_postal.isDefined() && settings.public_fieldmanditory_address_postal.get() == "yes"> class='manditoryfield'</#if>/> <#if settings.public_fieldmanditory_address_postal.isDefined() && settings.public_fieldmanditory_address_postal.get() == "yes"><span class='manditorytag'>*</span></#if><br/>
		<br/>
		
		<hr/>
		<#list groupmap as grouparea>
			<h3>${grouparea.label()} <#if grouparea.ismanditory() == "1">*</#if></h3>
			${grouparea.description()}<br/>
			<table>
			<#if grouparea.ismanditory() == "0">
				<tr>
					<td class='groupselectioncell'><input type='radio' name='grouparea_${grouparea.groupareaid()}' value='' checked/></td>
					<td class='groupselectioncell'>Nothing Selected</td>
					<td class='groupselectioncell currencycell'>$0.00</td>
				</tr>
			</#if>
			<#list grouparea.groups() as group>
				<tr>
					<td class='groupselectioncell'><input type='radio' name='grouparea_${grouparea.groupareaid()}' manditory_label="Selection for: ${grouparea.label()?html}" value='${group.groupid()}'<#if grouparea.ismanditory() == "1"> class='manditoryfield'</#if>/></td>
					<td class='groupselectioncell'>${group.label()}</td>
					<td class='groupselectioncell currencycell'>${group.modifier()}</td>
					</tr> 
			</#list>
			</table>
		</#list>
		<#if settings.useshop.isDefined() && settings.useshop.get() == "yes"><br/>Amount to add for Candy Cabin: $<input type="text" size="10" name="shopamount" value="20.00"/><br/><i>Our recommended amount is $20 for snacks throughout the week.  You can change this number to increase or decrease the amount.</i><br/><br/></#if>
		<hr/>
		Comments/Special Instructions/Medications/Requests/Allergies:<br/>
		<textarea name='comments' cols='60' rows='5'></textarea>
		<hr/>
		<#if settings.publicfooterinstructions.isDefined()>${settings.publicfooterinstructions.get()}</#if>
		<br/><br/>
		<input type='submit' value='  Register  '/>  
		</form>
		</div>
		</div>
	<#else>
		<h3>This event is not open for registrations</h3>
	</#if>
</body>
</html>