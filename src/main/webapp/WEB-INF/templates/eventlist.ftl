<html>
<head>
	<title>Event Synergy</title>
	<style>
		#eventbox {
		    border:solid black 1px;
		    right:25%;
		    left:25%;
		    padding:15px;
		    -webkit-border-radius: 10px;
		    -moz-border-radius: 10px;
		    border-radius: 10px;
		    width: 500px;
			margin-left:auto;
			margin-right:auto;
			text-align: left;
	    }
	    #outerbox {
	    	width: 100%;
	    	text-align: center;
	    }
	    #noregeventbox {
	    	border:solid black 1px;
		    right:25%;
		    left:25%;
		    padding:25px;
		    -webkit-border-radius: 10px;
		    -moz-border-radius: 10px;
		    border-radius: 10px;
		    width: 500px;
			margin-left:auto;
			margin-right:auto;
			text-align: center;
	    }
	    .eventbox_links {
	    	text-align:right;
	    }
	    body {
	    	font-family: Verdana;
			font-size: 9pt;
	    }
	</style>
</head>
<body>
<div id="outerbox">
	<H1>Open Registrations</H1>

	<#if eventlist?size==0>
		<div id="noregeventbox">
			There are currently no events open for registration
		</div>
	<#else>
		<#list eventlist as event>
			<div id="eventbox">
				<H2>${event.label()}</H2>
				<a href='/register?eventid=${event.id()}'>Register Now</a></div>			
			</div>
			<br/>
		</#list>
	</#if>
</div>
	
</body>
</html>