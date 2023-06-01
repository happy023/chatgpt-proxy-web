<html lang="zh-CN">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
    <title>HiBot - 聊天日志</title>
    <style>
        pre {
            white-space: pre-line;
        }
    </style>
</head>

<?php
$dir = $_SERVER['DOCUMENT_ROOT'] . "/chat_logs/";
// 获取文件名参数
$filename = $dir . $_GET['name'];

// 打开文件
$file = fopen($filename, "r");

// 读取文件内容
$content = fread($file, filesize($filename));

// 关闭文件
fclose($file);

// 显示文件内容
?>

<body>
    <pre>
    <?php
    echo $content;
    ?>
</pre>
</body>

</html>