import * as common from "./common.js";
import * as chatmanager from "./chatmanager.js";
import { mdHtml } from "./markdown.js";

let _contextarray = [];
let _contextId = '';

let _running = false;

export function setRunning(running) {
    _running = running;
}
export function getRunning() {
    return _running;
}

export function setContextId(contextId) {
    _contextId = contextId;
}
export function getContextId() {
    return _contextId;
}

export function setContextarray(contextarray) {
    _contextarray = contextarray;
}
export function getContextarray() {
    return _contextarray;
}

export function send_post() {
    if (($('#key').length) && ($('#key').val().length != 51)) {
        layer.msg("请输入正确的API-KEY", { icon: 5 });
        return;
    }

    let prompt = $("#kw-target").val();

    if (prompt == "") {
        layer.msg("请输入您的问题", { icon: 5 });
        return;
    }

    let loading = layer.msg('正在组织语言，请稍等片刻...', {
        icon: 16,
        shade: 0.4,
        time: false //取消自动关闭
    });

    // $('#answer-loading').css('display','flex'); 

    function streaming() {
        let es = new EventSource("stream.php");
        let isstarted = true;
        let alltext = "";
        let isalltext = false;
        es.onerror = function (event) {
            layer.close(loading);
            let errcode = common.getCookie("errcode");
            switch (errcode) {
                case "invalid_api_key":
                    layer.msg("API-KEY不合法");
                    break;
                case "context_length_exceeded":
                    layer.msg("问题和上下文长度超限，请重新提问");
                    break;
                case "rate_limit_reached":
                    layer.msg("同时访问用户过多，请稍后再试");
                    break;
                case "access_terminated":
                    layer.msg("违规使用，API-KEY被封禁");
                    break;
                case "no_api_key":
                    layer.msg("未提供API-KEY");
                    break;
                case "insufficient_quota":
                    layer.msg("API-KEY余额不足");
                    break;
                case "account_deactivated":
                    layer.msg("账户已禁用");
                    break;
                case "model_overloaded":
                    layer.msg("OpenAI模型超负荷，请重新发起请求");
                    break;
                case null:
                    layer.msg("OpenAI服务器访问超时或未知类型错误");
                    break;
                default:
                    layer.msg("OpenAI服务器故障，错误类型：" + errcode);
            }
            es.close();
            if (!common.isMobile()) $("#kw-target").focus();
            return;
        }
        es.onmessage = function (event) {
            if (isstarted) {
                layer.close(loading);
                // $('#answer-loading').css('display','none');
                $("#kw-target").val("请耐心等待AI把话说完……");
                $("#kw-target").attr("disabled", true);
                common.autoresize();
                $("#ai-btn").html('<i class="iconfont icon-wuguan"></i>中止');

                isstarted = false;
                let chatId = common.randomString(16);
                let aChatId = 'ac-' + chatId;
                let qChatId = 'q-' + chatId;

                $("#article-wrapper").append('<li class="article-title"><div class="avatar">😃 :</div><pre id="' + qChatId + '"></pre></li>');
                for (let j = 0; j < prompt.length; j++) {
                    let qCmp = $("#" + qChatId);
                    qCmp.text(qCmp.text() + prompt[j]);
                }
                $("#article-wrapper").append('<li class="article-content" id="' + chatId
                    + '"><div class="avatar">🐶 :</div><div style="width:calc(100% - 30px)" id="' + aChatId + '"></div></li>');

                let str_ = '';
                let i = 0;
                const intervalTime = 15;
                let strforcode = '';
                let interval = () => {
                    let newalltext = alltext;
                    let islastletter = false;
                    //有时服务器错误地返回\\n作为换行符，尤其是包含上下文的提问时，这行代码可以处理一下。
                    if (newalltext.split("\n\n").length == newalltext.split("\n").length) {
                        newalltext = newalltext.replace(/\\n/g, '\n');
                    }
                    if (str_.length < newalltext.length) {
                        str_ += newalltext[i++];
                        strforcode = str_ + "_";
                        if ((str_.split("```").length % 2) == 0) strforcode += "\n```\n";
                    } else {
                        if (isalltext) {
                            _running = false;
                            strforcode = str_;
                            islastletter = true;
                            $("#kw-target").val("");
                            $("#kw-target").attr("disabled", false);
                            common.autoresize();
                            $("#ai-btn").html('<i class="iconfont icon-wuguan"></i>发送');
                            if (!common.isMobile()) $("#kw-target").focus();
                        }
                    }
                    newalltext = mdHtml.render(strforcode);
                    $("#" + aChatId).html(newalltext);
                    if (islastletter) MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
                    $("#" + chatId + " pre code").each(function () {
                        $(this).html("<button class='codebutton'>复制</button>" + $(this).html());
                        $(this).find('.codebutton').first().click(common.copycode);
                    });
                    document.getElementById("article-wrapper").scrollTop = 100000;

                    if (_running) {
                        setTimeout(interval, intervalTime);
                    }
                };
                _running = true;
                setTimeout(interval, intervalTime);
            }
            if (event.data == "[DONE]") {
                isalltext = true;

                console.log('<<---', alltext);

                _contextarray.push([prompt, alltext]);
                _contextarray = _contextarray.slice(-5); //只保留最近5次对话作为上下文，以免超过最大tokens限制

                //创建或者更新聊天记录
                chatmanager.updateContext(_contextarray);

                es.close();
                return;
            }
            if (event.data.startsWith('{')) {
                let json = eval("(" + event.data + ")");
                if (json.choices[0].delta.hasOwnProperty("content")) {
                    if (alltext == "") {
                        alltext = json.choices[0].delta.content.replace(/^\n+/, ''); //去掉回复消息中偶尔开头就存在的连续换行符
                    } else {
                        alltext += json.choices[0].delta.content;
                    }
                }
            } else {
                if (alltext == "") {
                    alltext = event.data.replaceAll('\\n', '\n'); //去掉回复消息中偶尔开头就存在的连续换行符
                } else {
                    alltext += event.data.replaceAll('\\n', '\n');
                }
            }
        }
    }

    $.ajax({
        cache: true,
        type: "POST",
        url: "setsession.php",
        data: {
            message: prompt,
            context: (!($("#keep").length) || ($("#keep").prop("checked"))) ? JSON.stringify(_contextarray) : '[]',
            key: ($("#key").length) ? ($("#key").val()) : '',
        },
        dataType: "json",
        success: function (result) {
            if (!result.success) {
                layer.close(loading);
                if (result.msg) {
                    layer.msg(result.msg);
                }
            } else {
                $('#login-wx').hide();
                streaming();
            }
        }
    });
}