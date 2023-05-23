import * as common from "./common.js";
import * as chatmanager from "./chatmanager.js";
import * as chat from "./chat.js";
// import { running } from "./chat.js";

function initcode() {
    console.log("本站代码修改自http://github.com/dirk1983/chatgpt");
}

function initEvents() {
    let icons = document.querySelectorAll('.sidebar .icon');
    for (let i = 0; i < icons.length; i++) {
        icons[i].addEventListener('click', async e => {
            switch (e.currentTarget.id) {
                case 'personal':
                    common.popupPanel('<div class="about-layer">个人信息</div>');
                    break;
                case 'about':
                    common.popupPanel('<div class="about-layer">关于</div>');
                    break;
                case 'wechat-group':

                    break;
                case 'setting':
                    document.getElementById("setting-container").style.display = 'block';
                    // popupPanel($('#setting-container'));
                    break;
            }
        });
    }
    //初始化二维码弹出事件
    $('#wechat-group').mouseover(function () {
        $('#wechat-popup').show();
    });
    $('#wechat-group').mouseleave(function () {
        $('#wechat-popup').hide();
    });
}

$(document).ready(function () {
    chat.setRunning(false);
    initcode();
    common.autoresize();
    $("#kw-target").on('keydown', function (event) {
        if (event.keyCode == 13 && event.ctrlKey) {
            chat.send_post();
            return false;
        }
    });

    $(window).resize(function () {
        common.autoresize();
    });

    $('#kw-target').on('input', function () {
        common.autoresize();
    });

    $("#ai-btn").click(function () {
        if ($("#kw-target").is(':disabled')) {
            chat.setRunning(false);
            $("#kw-target").val("");
            $("#kw-target").attr("disabled", false);
            common.autoresize();
            $("#ai-btn").html('<i class="iconfont icon-wuguan"></i>发送');
            if (!common.isMobile()) $("#kw-target").focus();
        } else {
            chat.send_post();
        }
        return false;
    });

    chatmanager.loadTalkList();

    $("#showlog").click(function () {
        let btnArry = ['已阅'];
        layer.open({ type: 1, title: '全部对话日志', area: ['80%', '80%'], shade: 0.5, scrollbar: true, offset: [($(window).height() * 0.1), ($(window).width() * 0.1)], content: '<iframe src="chat.txt?' + new Date().getTime() + '" style="width: 100%; height: 100%;"></iframe>', btn: btnArry });
        return false;
    });

    chatmanager.newTalk();

    $("#new-chat").click(chatmanager.newTalk);

    $('#preset-text').change(common.insertPresetText);

    initEvents();

    if (!common.isMobile()) {
        $('#sidebar').show();
        $('#layout-header').show();
    }
});