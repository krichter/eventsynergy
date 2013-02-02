<html>
<head>
	<title>Registration Submitted - Event Synergy</title>
	<style>
	    #outerbox {
	    	width: 100%;
	    	text-align: center;
	    }
	    #contentbox {
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
	<div id="outerbox"><div id="contentbox">
	<center><h1>Success!</h1></center>
	<#if settings.publicsuccessmessage.isDefined()>${settings.publicsuccessmessage.get()}</#if>
	<br/>
	<hr/>
	<b>Summary of registration:</b><br/>
	<b>Name:</b> ${submission.firstname.get()?html} ${submission.lastname.get()?html}<br/>
	<br/>
	<center>
	<table>
	<tr><th class='groupselectioncell'>Selection Option</th><th class='groupselectioncell'>Your Choice</th><th class='groupselectioncell'>Cost</th></tr>
	<#list groupselection as selection>
		<tr>
			<td class='groupselectioncell'>${selection.groupareaname()}</td>
			<td class='groupselectioncell'>${selection.selectedgroupname()}</td>
			<td class='groupselectioncell currencycell'>${selection.selectedgroupmodifier()}</td>
		</tr>
	</#list>
	<#if shopamount != "$0.00">
		<tr>
			<td colspan="2" class='groupselectioncell' align='right'>Candy Cabin:</td>
			<td class='groupselectioncell currencycell'>${shopamount}</td>
		</tr>
	</#if>
	<tr><td colspan='2' class='groupselectioncell' align='right'>Total:</td><td class='groupselectioncell currencycell'>${totalcost}</td></tr>
	</table></center>
	</div></div>
</body>
</html>