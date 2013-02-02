<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
	<title>Event Manager</title>
	<script src="/assets/jquery-1.6.1.min.js" type="text/javascript" charset="utf-8"></script>
	<link rel="stylesheet" type="text/css" media="screen" href="/assets/main.css">
</head>
<body>
	<div id="outerbox"><div id="contentbox">
	<center><h1>Event Management</h1></center>
	<form action="createevent" method="POST">
		Title: <input type="text" size="15" name="title"/> <input type="submit" value="Create New Event"/>
	</form><br/>
	<table border='1' width="100%">
	<thead>
		<tr>
			<th>Title</th>
			<th>Manage</th>
			<th>Emailer</th>
			<th>Backup</th>
			<th>Restore</th>
			<th>Log</th>
		</tr>
	</thead>
	<tbody id='table_eventlist'>
		<#list eventlist as event>
			<tr>
				<td class='eventlist_title'>${event.title()}</td>
				<td class='managecol'><a href='/manage/event2?id=${event.id()}'>Manage</a></td>
				<td class='managecol'><a href='/manage/emailer?eventid=${event.id()}'>Emailer</a></td>
				<td class='backupcol'><a href='/jsondb/backup?dbid=${event.id()}'>Download Backup</a></td>
				<!--//<td class='backupcol'><input type='button' value='Download Backup' onClick='getbackup("${event.id()}");'/></td>//-->
				<td class='restorecol'><form action="/manage/restoredb" method="POST" enctype="multipart/form-data"><input type='hidden' name='dbid' value='${event.id()}'/><input type='file' name='dbfile'><input type="submit" value="Restore"/></form></td>
				<td class='backupcol'><a href='/manage/tlist?dbid=${event.id()}'>Transactions</a></td>
			</tr>
		</#list>
	</tbody>
	</table>
	<hr/>
	<h2>User List</h2>
	<form action="adduser" method="POST">
		Google Email: <input type="text" size="15" name="email"/> <input type="submit" value="Add to allowed list"/>
	</form><br/>
	<table border='1'>
	<thead>
		<tr>
			<th>Email</th>
			<th>Operation</th>
		</tr>
	</thead>
	<tbody id='table_userlist'>
		<#list userlist as user>
			<tr>
				<td class='userlist_email'>${user}</td>
				<td><a href='/manage/removeuser?email=${user}'>Remove</a></td>
			</tr>
		</#list>
	</tbody>
	</table>
	<form action='/db/backup' method='POST' id='backupform'>
		<input type='hidden' name='dbid' id='backupform_dbid'/>
		<input type='hidden' name='schemajson' id='backupform_schemajson'/>
	</form>
	<br/><br/>
	<hr/>
	<form action='/manage/translatebackup' method='POST'  enctype="multipart/form-data">
		Version 1 Backup File: <input type='file' name='dbfile'> <input type="submit" value="Translate"/>
	</form>
	</div></div>
</body>
</html>