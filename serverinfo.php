<!DOCTYPE html>
<html>
<head>
    <title>服务器状况查看</title>
    <meta charset="utf-8"> 
</head>
<body>
<h2>当前登录用户列表：</h2>
<?php
// 开启session
session_start();

if(isset($_SESSION['user_id']) && 'otwJc5G1MvprkT1X3nvRWOxYDREY'!=$_SESSION['user_id']){
    echo '<h1>您无权访问此页面</h1>';
    exit();
}

// 设置SESSION文件夹路径
$session_path = session_save_path();

// 获取SESSION文件夹中的所有文件
$session_files = scandir($session_path);

// 遍历所有SESSION文件，读取SESSION数据
$sessions = array();
$idx = 1;
foreach ($session_files as $file) {
    if ($file == '.' || $file == '..') {
        continue;
    }
    $session_file = $session_path . '/' . $file;
    
    $session_data = file_get_contents($session_file);
    
    if(!$session_data){
        continue;
    }
    
    session_decode($session_data); 
    
    echo($session_file."<hr>");
    echo($idx++." - ".$_SESSION['user_id']."<hr>");
    
    foreach($_SESSION as $key=>$value){
        if('user_id'==$key){ 
        }
        echo "<pre>".$value."</pre>";  
    }
}
?>
</body>
</html>