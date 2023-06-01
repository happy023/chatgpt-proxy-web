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

<body>

    <?php
    // 指定要显示文件列表的目录
    $dir = $_SERVER['DOCUMENT_ROOT'] . "/chat_logs";

    // 获取目录中的所有文件和子目录
    $files = scandir($dir);

    // 过滤掉.和..目录
    $files = array_diff($files, array('.', '..'));

    // 输出文件列表
    echo "<ul>";
    foreach ($files as $file) {
        echo "<li><a href='/admin/chatcontent.php?name=$file'>$file</a></li>";
    }
    echo "</ul>";

    ?>

</body>

</html>