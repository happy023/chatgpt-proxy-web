<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: text/event-stream");
header("X-Accel-Buffering: no");
session_start();
$postData = $_SESSION['data'];
$_SESSION['response'] = "";
$ch = curl_init();
$OPENAI_API_KEY = "sk-KEY";
if (isset($_SESSION['key'])) {
    $OPENAI_API_KEY = $_SESSION['key'];
}
$headers  = [
    'Accept: application/json',
    'Content-Type: application/json',
    'Authorization: Bearer ' . $OPENAI_API_KEY
];

setcookie("errcode", ""); //EventSource无法获取错误信息，通过cookie传递
setcookie("errmsg", "");

$curr_size = 0;

$callback = function ($ch, $data) {
    $complete = json_decode($data);
    if (isset($complete->error)) {
        setcookie("errcode", $complete->error->code);
        setcookie("errmsg", $data);
        if (strpos($complete->error->message, "Rate limit reached") === 0) { //访问频率超限错误返回的code为空，特殊处理一下
            setcookie("errcode", "rate_limit_reached");
        }
        if (strpos($complete->error->message, "Your access was terminated") === 0) { //违规使用，被封禁，特殊处理一下
            setcookie("errcode", "access_terminated");
        }
        if (strpos($complete->error->message, "You didn't provide an API key") === 0) { //未提供API-KEY
            setcookie("errcode", "no_api_key");
        }
        if (strpos($complete->error->message, "You exceeded your current quota") === 0) { //API-KEY余额不足
            setcookie("errcode", "insufficient_quota");
        }
        if (strpos($complete->error->message, "That model is currently overloaded") === 0) { //OpenAI服务器超负荷
            setcookie("errcode", "model_overloaded");
        }
    } else {
        $logfile = "/www/wwwroot/bot.okcode.cn/server_logs/ai_response.log"; 
            error_log("data - ". $data."\n", 3, $logfile);
        
        $answer = "";
        $done = false;
        //移除前面的“data: ”
        $str = trim($data);
        $str = substr($str,6);  
        if(substr($str, -6) == "[DONE]"){
            $done = true;
            $str = substr($str, 0, -6);
            $str = trim($str);
        }
        $responsearr = explode("\n\ndata:", $str);
    
        foreach ($responsearr as $msg) {
            $contentarr = json_decode(trim($msg) , true);
            if (isset($contentarr['choices'][0]['delta']['content'])) {
                $answer .= $contentarr['choices'][0]['delta']['content'];
            }
        } 
        // // 注意:这里有缓存问题，数据太少并不会立即发送，然后openai接口的响应很慢，反而导致界面数据显示有卡顿感
        // if($done){
        //     echo("data: ".str_replace("\n", "\\n", $answer)."\n\n");
        //     echo("data: [DONE]\n\n");
        // }else{
        //     echo("data: ".str_replace("\n", "\\n", $answer)."\n\n");
        // } 
        // $curr_size += strlen($answer);
        // $chunk_size = 10;
        // if($curr_size>=$chunk_size){
        //     error_log("开始推送 - ". $curr_size."-".$chunk_size."\n", 3, $logfile);
        //     $curr_size = 0;
        //     ob_flush();
        //     flush();
        // }
        echo $data;

        $_SESSION['response'] .= $answer;
    }
    return strlen($data);
};

curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, FALSE);
curl_setopt($ch, CURLOPT_URL, 'https://api.openai.com/v1/chat/completions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
curl_setopt($ch, CURLOPT_WRITEFUNCTION, $callback);
//curl_setopt($ch, CURLOPT_PROXY, "http://127.0.0.1:1081");

curl_exec($ch);
 

// $answer = "";
// if (substr(trim($_SESSION['response']), -6) == "[DONE]") {
//     $_SESSION['response'] = substr(trim($_SESSION['response']), 0, -6) . "{";
// }
// $responsearr = explode("}\n\ndata: {", $_SESSION['response']);

// foreach ($responsearr as $msg) {
//     $contentarr = json_decode("{" . trim($msg) . "}", true);
//     if (isset($contentarr['choices'][0]['delta']['content'])) {
//         $answer .= $contentarr['choices'][0]['delta']['content'];
//     }
// }
$answer = $_SESSION['response'];

$questionarr = json_decode($_SESSION['data'], true);
$filecontent = $_SERVER["REMOTE_ADDR"] . " | " . date("Y-m-d H:i:s") . "\n";
$filecontent .= "Q:" . end($questionarr['messages'])['content'] .  "\nA:" . trim($answer) . "\n----------------\n";
$user_id = $_SESSION['user_id'];
$myfile = fopen(__DIR__ . "/chat_logs/".$user_id.".txt", "a") or die("Writing file failed.");
fwrite($myfile, $filecontent);
fclose($myfile);
curl_close($ch);
