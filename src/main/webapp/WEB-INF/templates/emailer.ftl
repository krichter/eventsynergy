<html>
<body>
<form method='POST' action='/manage/emailit'>
<H2>Emailer</H2>
<input type='hidden' name='eventid' value='${eventid}'/>
Group to send to: <select name='to'>
<#list sendlist as senditem>
	<option value='${senditem.itemid()}'>${senditem.label()}</option>
</#list>
</select><br/>
From (Name): <input type='text' size='30' name='from_name'/><br/>
From (Email): <input type='text' size='30' name='from_email'/><br/>
Subject: <input type='text' size='30' name='subject'/><br/>
<br/>
Message:<br/>
<textarea name='message' cols='80' rows='15'></textarea>

<br/><br/>
<input type='submit' value='Send'>

</form>
</body>
</html>