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
		$(".manditoryfield").each(function(i) {
			//try { console.log("check"); } catch (e) {}
			if ($(this).val() == "") {
				isok = false;
			}
		});
		if (!isok) {
			alert("There are manditory fields not filled out. Please fill the fields out and retry.");
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
		First Name: <input type='text' size='15' name='firstname'<#if settings.public_fieldmanditory_firstname.isDefined() && settings.public_fieldmanditory_firstname.get() == "yes"> class='manditoryfield'</#if>/> <#if settings.public_fieldmanditory_firstname.isDefined() && settings.public_fieldmanditory_firstname.get() == "yes"><span class='manditorytag'>*</span></#if>&nbsp;&nbsp;&nbsp;&nbsp;
		Last Name: <input type='text' size='15' name='lastname'<#if settings.public_fieldmanditory_lastname.isDefined() && settings.public_fieldmanditory_lastname.get() == "yes"> class='manditoryfield'</#if>/> <#if settings.public_fieldmanditory_lastname.isDefined() && settings.public_fieldmanditory_lastname.get() == "yes"><span class='manditorytag'>*</span></#if><br/>
		<br/>
		Home Phone Number: <input type='text' size='15' name='homephone'<#if settings.public_fieldmanditory_homephone.isDefined() && settings.public_fieldmanditory_homephone.get() == "yes"> class='manditoryfield'</#if>/> <#if settings.public_fieldmanditory_homephone.isDefined() && settings.public_fieldmanditory_homephone.get() == "yes"><span class='manditorytag'>*</span></#if>&nbsp;&nbsp;&nbsp;&nbsp;
		Mobile Phone: <input type='text' size='15' name='mobilephone'<#if settings.public_fieldmanditory_mobilephone.isDefined() && settings.public_fieldmanditory_mobilephone.get() == "yes"> class='manditoryfield'</#if>/> <#if settings.public_fieldmanditory_mobilephone.isDefined() && settings.public_fieldmanditory_mobilephone.get() == "yes"><span class='manditorytag'>*</span></#if><br/>
		Email Address: <input type='text' size='30' id='input_email' name='email'<#if settings.public_fieldmanditory_email.isDefined() && settings.public_fieldmanditory_email.get() == "yes"> class='manditoryfield'</#if>/> <#if settings.public_fieldmanditory_email.isDefined() && settings.public_fieldmanditory_email.get() == "yes"><span class='manditorytag'>*</span></#if><br/>
		Confirm Email Address: <input type='text' size='30' id='input_email_confirm' name='email_confirm'<#if settings.public_fieldmanditory_email.isDefined() && settings.public_fieldmanditory_email.get() == "yes"> class='manditoryfield'</#if>/> <#if settings.public_fieldmanditory_email.isDefined() && settings.public_fieldmanditory_email.get() == "yes"><span class='manditorytag'>*</span></#if><br/>
		Picture: <input type='file' name='picture'/><br/>
		<br/>
		Birthdate: <select name="DateOfBirth_Month"<#if settings.public_fieldmanditory_birthdate.isDefined() && settings.public_fieldmanditory_birthdate.get() == "yes"> class='manditoryfield'</#if>/>>
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

<select name="DateOfBirth_Day"<#if settings.public_fieldmanditory_birthdate.isDefined() && settings.public_fieldmanditory_birthdate.get() == "yes"> class='manditoryfield'</#if>/>>
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

<select name="DateOfBirth_Year"<#if settings.public_fieldmanditory_birthdate.isDefined() && settings.public_fieldmanditory_birthdate.get() == "yes"> class='manditoryfield'</#if>/>>
	<option value=""> - Year - </option>
	<option value="2004">2004</option>
	<option value="2003">2003</option>
	<option value="2002">2002</option>
	<option value="2001">2001</option>
	<option value="2000">2000</option>
	<option value="1999">1999</option>
	<option value="1998">1998</option>
	<option value="1997">1997</option>
	<option value="1996">1996</option>
	<option value="1995">1995</option>
	<option value="1994">1994</option>
	<option value="1993">1993</option>
	<option value="1992">1992</option>
	<option value="1991">1991</option>
	<option value="1990">1990</option>
	<option value="1989">1989</option>
	<option value="1988">1988</option>
	<option value="1987">1987</option>
	<option value="1986">1986</option>
	<option value="1985">1985</option>
	<option value="1984">1984</option>
	<option value="1983">1983</option>
	<option value="1982">1982</option>
	<option value="1981">1981</option>
	<option value="1980">1980</option>
	<option value="1979">1979</option>
	<option value="1978">1978</option>
	<option value="1977">1977</option>
	<option value="1976">1976</option>
	<option value="1975">1975</option>
	<option value="1974">1974</option>
	<option value="1973">1973</option>
	<option value="1972">1972</option>
	<option value="1971">1971</option>
	<option value="1970">1970</option>
	<option value="1969">1969</option>
	<option value="1968">1968</option>
	<option value="1967">1967</option>
	<option value="1966">1966</option>
	<option value="1965">1965</option>
	<option value="1964">1964</option>
	<option value="1963">1963</option>
	<option value="1962">1962</option>
	<option value="1961">1961</option>
	<option value="1960">1960</option>
	<option value="1959">1959</option>
	<option value="1958">1958</option>
	<option value="1957">1957</option>
	<option value="1956">1956</option>
	<option value="1955">1955</option>
	<option value="1954">1954</option>
	<option value="1953">1953</option>
	<option value="1952">1952</option>
	<option value="1951">1951</option>
	<option value="1950">1950</option>
	<option value="1949">1949</option>
	<option value="1948">1948</option>
	<option value="1947">1947</option>
	<option value="1946">1946</option>
	<option value="1945">1945</option>
	<option value="1944">1944</option>
	<option value="1943">1943</option>
	<option value="1942">1942</option>
	<option value="1941">1941</option>
	<option value="1940">1940</option>
	<option value="1939">1939</option>
	<option value="1938">1938</option>
	<option value="1937">1937</option>
	<option value="1936">1936</option>
	<option value="1935">1935</option>
	<option value="1934">1934</option>
	<option value="1933">1933</option>
	<option value="1932">1932</option>
	<option value="1931">1931</option>
	<option value="1930">1930</option>
	<option value="1929">1929</option>
	<option value="1928">1928</option>
	<option value="1927">1927</option>
	<option value="1926">1926</option>
	<option value="1925">1925</option>
	<option value="1924">1924</option>
	<option value="1923">1923</option>
	<option value="1922">1922</option>
	<option value="1921">1921</option>
	<option value="1920">1920</option>
	<option value="1919">1919</option>
	<option value="1918">1918</option>
	<option value="1917">1917</option>
	<option value="1916">1916</option>
	<option value="1915">1915</option>
	<option value="1914">1914</option>
	<option value="1913">1913</option>
	<option value="1912">1912</option>
	<option value="1911">1911</option>
	<option value="1910">1910</option>
	<option value="1909">1909</option>
	<option value="1908">1908</option>
	<option value="1907">1907</option>
	<option value="1906">1906</option>
	<option value="1905">1905</option>
	<option value="1904">1904</option>
	<option value="1903">1903</option>
	<option value="1902">1902</option>
	<option value="1901">1901</option>
	<option value="1900">1900</option>	
</select>
<#if settings.public_fieldmanditory_birthdate.isDefined() && settings.public_fieldmanditory_birthdate.get() == "yes"><span class='manditorytag'>*</span></#if>
<br/>		
		<!--//<input type='text' id='birthdate' name='birthdate'<#if settings.public_fieldmanditory_birthdate.isDefined() && settings.public_fieldmanditory_birthdate.get() == "yes"> class='manditoryfield'</#if>/> <#if settings.public_fieldmanditory_birthdate.isDefined() && settings.public_fieldmanditory_birthdate.get() == "yes"><span class='manditorytag'>*</span></#if><br/>//-->
		
		Gender: <select name='gender'<#if settings.public_fieldmanditory_gender.isDefined() && settings.public_fieldmanditory_gender.get() == "yes"> class='manditoryfield'</#if>/>><option value=''>Please Select...</option><option value='male'>Male</option><option value='female'>Female</option></select> <#if settings.public_fieldmanditory_gender.isDefined() && settings.public_fieldmanditory_gender.get() == "yes"><span class='manditorytag'>*</span></#if><br/>
		<br/>
		Parents or Guardian's Name(s): <input type='text' size='30' name='parents_name'<#if settings.public_fieldmanditory_parents_name.isDefined() && settings.public_fieldmanditory_parents_name.get() == "yes"> class='manditoryfield'</#if>/> <#if settings.public_fieldmanditory_parents_name.isDefined() && settings.public_fieldmanditory_parents_name.get() == "yes"><span class='manditorytag'>*</span></#if><br/>
		Parents or Guardian's Phone #: <input type='text' size='30' name='parents_phone'<#if settings.public_fieldmanditory_parents_phone.isDefined() && settings.public_fieldmanditory_parents_phone.get() == "yes"> class='manditoryfield'</#if>/> <#if settings.public_fieldmanditory_parents_phone.isDefined() && settings.public_fieldmanditory_parents_phone.get() == "yes"><span class='manditorytag'>*</span></#if><br/>
		<br/>
		Emergency Contact Information (Name(s), Relation(s), and phone #):<br/>
		<input type='text' size='60' name='emergencyinfo'<#if settings.public_fieldmanditory_emergencyinfo.isDefined() && settings.public_fieldmanditory_emergencyinfo.get() == "yes"> class='manditoryfield'</#if>/> <#if settings.public_fieldmanditory_emergencyinfo.isDefined() && settings.public_fieldmanditory_emergencyinfo.get() == "yes"><span class='manditorytag'>*</span></#if><br/>
		BC Care Card #: <input type='text' size='15' name='carecard'<#if settings.public_fieldmanditory_carecard.isDefined() && settings.public_fieldmanditory_carecard.get() == "yes"> class='manditoryfield'</#if>/> <#if settings.public_fieldmanditory_carecard.isDefined() && settings.public_fieldmanditory_carecard.get() == "yes"><span class='manditorytag'>*</span></#if><br/>
		<br/>
		Youth Group Affiliation: <select name='affiliation'<#if settings.public_fieldmanditory_affiliation.isDefined() && settings.public_fieldmanditory_affiliation.get() == "yes"> class='manditoryfield'</#if>>
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
			  	<input type="text" name="customfield_${cf.fieldid()}" size="30"<#if cf.ismanditory() == "1"> class='manditoryfield'</#if>/>
			  <#elseif cf.fieldtype()=="list">
			  	<select name="customfield_${cf.fieldid()}"<#if cf.ismanditory() == "1"> class='manditoryfield'</#if>>
			  		<option value="">Please Select...</option>
			  		<#list cf.fieldoptions() as op>
			  			<#if op == "">
			  			<#else>
			  				<option value="${op}">${op}</option>
			  			</#if>
			  		</#list>
			  	</select>
			  <#else>
			  	<br/><textarea cols="60" rows="3" name="customfield_${cf.fieldid()}"<#if cf.ismanditory() == "1"> class='manditoryfield'</#if>></textarea>
			  </#if>
			  <br/><i>${cf.description()}</i><br/><br/>
		</#list>
		<br/>
		Address (Where you live):<br/>
		Street: <input type='text' size='25' name='address_street'<#if settings.public_fieldmanditory_address_street.isDefined() && settings.public_fieldmanditory_address_street.get() == "yes"> class='manditoryfield'</#if>/> <#if settings.public_fieldmanditory_address_street.isDefined() && settings.public_fieldmanditory_address_street.get() == "yes"><span class='manditorytag'>*</span></#if><br/>
		City: <input type='text' size='20' name='address_city'<#if settings.public_fieldmanditory_address_city.isDefined() && settings.public_fieldmanditory_address_city.get() == "yes"> class='manditoryfield'</#if>/> <#if settings.public_fieldmanditory_address_city.isDefined() && settings.public_fieldmanditory_address_city.get() == "yes"><span class='manditorytag'>*</span></#if><br/>
		Postal Code: <input type='text' size='10' name='address_postal'<#if settings.public_fieldmanditory_address_postal.isDefined() && settings.public_fieldmanditory_address_postal.get() == "yes"> class='manditoryfield'</#if>/> <#if settings.public_fieldmanditory_address_postal.isDefined() && settings.public_fieldmanditory_address_postal.get() == "yes"><span class='manditorytag'>*</span></#if><br/>
		<br/>
		
		<hr/>
		<#list groupmap as grouparea>
			<h3>${grouparea.label()}</h3>
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
					<td class='groupselectioncell'><#if group_index==0 && grouparea.ismanditory() == "1">
						<input type='radio' name='grouparea_${grouparea.groupareaid()}' value='${group.groupid()}' checked/>
					<#else>
						<input type='radio' name='grouparea_${grouparea.groupareaid()}' value='${group.groupid()}'/>
					</#if></td>
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