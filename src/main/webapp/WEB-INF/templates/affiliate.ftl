<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
	<title>Event Manager - Affiliate portal</title>
	<script src="/assets/jquery-1.7.1.min.js" type="text/javascript" charset="utf-8"></script>
	<link rel="stylesheet" type="text/css" media="screen" href="/assets/main.css">
</head>
<body>
	<div id="outerbox"><div id="contentbox">
	<center><h1>Event Management - Affiliate Portal</h1></center>
	<table border='1' width="100%">
	<thead>
		<tr>
			<th>Title</th>
			<th>Manage</th>
		</tr>
	</thead>
	<tbody id='table_eventlist'>
		<#list eventlist as event>
			<tr>
				<td class='eventlist_title'>${event.title()}</td>
				<td class='managecol'><a href='/affiliate/event?id=${event.id()}'>Enter</a></td>
			</tr>
		</#list>
	</tbody>
	</table>	
	</div></div>
</body>
</html>