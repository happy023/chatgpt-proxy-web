<!DOCTYPE html>
<html>
<head>
    <title>当前用户Session</title>
    <meta charset="utf-8"> 
</head>
<body>
<h2>当前用户Session：</h2>
<?php
// 开启session
session_start();
foreach($_SESSION as $key=>$value){
    echo "<pre>".$value."</pre>";  
}
?>
</body>
</html>