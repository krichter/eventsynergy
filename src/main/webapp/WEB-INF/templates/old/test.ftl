<html>
<head>
	<title>Template Test</title>
</head>
<body>
	This is a test:
	<hr/>
	${message?html}
	<hr/>
	<#list testlist as item>
		${item}<br/>
	</#list>
</body>
</html>