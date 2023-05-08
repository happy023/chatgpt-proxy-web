<?php
session_start();
$user_agent = $_SERVER['HTTP_USER_AGENT'];
if (preg_match('/(Mobile|Android|iPhone|iPad|Windows Phone)/i', $user_agent)) {
    // 访问网页的是手机，暂时不校验手机访问
} else {
    // 访问网页的是电脑,需要校验
    if(!isset($_SESSION['user_id'])){  
        echo '{"success":false,"login":false}';
        exit();
    } 
}
$context = json_decode($_POST['context'] ?: "[]") ?: [];
$postData = [
    "model" => "gpt-3.5-turbo",
    "temperature" => 0,
    "stream" => true,
    "messages" => [],
];
if (!empty($context)) {
    $context = array_slice($context, -5);
    foreach ($context as $message) {
        $postData['messages'][] = ['role' => 'user', 'content' => str_replace("\n", "\\n", $message[0])];
        $postData['messages'][] = ['role' => 'assistant', 'content' => str_replace("\n", "\\n", $message[1])];
    }
}
$postData['messages'][] = ['role' => 'user', 'content' => $_POST['message']];
$postData = json_encode($postData);
$_SESSION['data'] = $postData;
if ((isset($_POST['key'])) && (!empty($_POST['key']))) {
    $_SESSION['key'] = $_POST['key'];
}
echo '{"success":true}';
