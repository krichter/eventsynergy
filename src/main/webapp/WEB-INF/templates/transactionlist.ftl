<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<#setting time_zone="America/Vancouver">
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
	<title>Event Manager Transaction List</title>
	<script src="/assets/jquery-1.7.1.min.js" type="text/javascript" charset="utf-8"></script>
	<script src="/jsondb/dbutils" type="text/javascript" charset="utf-8"></script>
	<link rel="stylesheet" type="text/css" media="screen" href="/assets/main.css">
	<script>
	<!--//
		function getmore() {
			var lastsid = $("#transactiontable tbody tr:last .sid").text();
			var dataString = new Object;
			dataString.dbid = "${dbid}";
			dataString.toval = lastsid;
			//dataString.fromval = t["localid"];
			$.ajax({
				async: true,
				type: "GET",
				url: "/manage/tlist_more",
				data: dataString,
				success: getmore_success,
				error: ajax_error,
				dataType: "json"
			});
		}
		
		function getmorerecent() {
			var topsid = $("#transactiontable tbody tr:first .sid").text();
			var dataString = new Object;
			dataString.dbid = "${dbid}";
			//dataString.toval = lastsid;
			dataString.fromval = topsid;
			$.ajax({
				async: true,
				type: "GET",
				url: "/manage/tlist_more",
				data: dataString,
				success: getmorerecent_success,
				error: ajax_error,
				dataType: "json"
			});
		}
	
		function getmore_success(jsondata,textstatus,request) {
			try { console.log("getmore success: ",jsondata,textstatus,request); } catch (e) {}
			if (jsondata["success"]) {
				for (i in jsondata["tlist"]) {
					$("#transactiontable tbody").append(processrow(jsondata["tlist"][i]));
				}
			}
		}
		
		function getmorerecent_success(jsondata,textstatus,request) {
			try { console.log("getmore success: ",jsondata,textstatus,request); } catch (e) {}
			if (jsondata["success"]) {
				for (i in jsondata["tlist"]) {
					$("#transactiontable tbody").prepend(processrow(jsondata["tlist"][i]));
				}
			}
		}
		
		function ajax_error(request,status,error) {
			try { console.error("Ajax Error: ",error,request,error); } catch (e) {}
		}
		
		function processrow(t) {
			var row = $("<tr>\
				<td class='titem sid'></td>\
				<td class='titem who'></td>\
				<td class='titem stamp'></td>\
				<td class='titem backup'></td>\
				<td class='titem json'></td>\
			</tr>");
			row.children(".sid").text(t["tid"]);
			row.children(".who").text(t["who"]);
			row.children(".stamp").text(t["stamp"]);
			row.children(".json").text(JSON.stringify(t["t"]));
			if (t["isbackup"]) {
				row.children(".backup").html("<a href='/jsondb/recover?dbid=${dbid}&sid="+t["tid"]+"'>Yes</a>");
			} else {
				row.children(".backup").text("No");
			}
			return row;
		}
				
	//-->
	</script>
</head>
<body bgcolor='#92929D'>

	<input type='button' value='Get More Recent' onClick='getmorerecent();'/>
	<table border='1' width="100%" id='transactiontable'>
	<thead>
		<tr>
			<th class='thead'>ID</th>
			<th class='thead'>Who</th>
			<th class='thead'>Stamp</th>
			<th class='thead'>Back.</th>
			<th class='thead'>JSON</th>
		</tr>
	</thead>
	<tbody>
		<#list tlist as t>
			<tr>
				<td class='titem sid'>${t.id()?string.computer}</td>
				<td class='titem'>${t.who()}</td>
				<td class='titem'>${t.datestamp()?datetime?string.short_long}</td>
				<td class='titem'><#if t.containsbackup()><a href='/jsondb/recover?dbid=${dbid}&sid=${t.id()?string.computer}'>Yes</a><#else>No</#if></td>
				<td class='titem'>${t.json()}</td>
			</tr>
		</#list>
	</tbody>
	</table>
	<input type='button' value='Get More' onClick='getmore();'/>
</body>
</html>