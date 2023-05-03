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
    $type = gettype($value);
    if($type=='string'){
        echo "<pre>".str_replace("\n","<br>",$value)."</pre>";  
    }else if($type == "Array"){
        foreach($value as $v){ 
            echo "<pre>".str_replace("\n","<br>",$v)."</pre>";  
        }
    }
}
?>
</body>
</html>