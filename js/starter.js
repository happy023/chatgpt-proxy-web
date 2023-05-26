import * as common from "./common.js";
import * as chatmanager from "./chatmanager.js";
import * as chat from "./chat.js";

function initcode() {
    console.log("本站代码修改自http://github.com/dirk1983/chatgpt");
}

function initEvents() {
    let icons = document.querySelectorAll('.sidebar .icon');
    for (let i = 0; i < icons.length; i++) {
        icons[i].addEventListener('click', e => {
            switch (e.currentTarget.id) {
                case 'personal':
                    common.popupPanel('<div class="about-layer">个人信息</div>');
                    break;
                case 'about':
                    common.popupPanel(`
                        <div class="about-layer">关于<br><br>联系邮箱：admin@okcode.cn</div>
                    `);
                    break;
                case 'wechat-group':

                    break;
                case 'setting':
                    if (window.openSettingPanel) {
                        window.openSettingPanel();
                    } else {
                        $("#setting-wrapper").load("/setting-panel.html");
                        $('#setting-wrapper').show();
                    }
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

    $('#about-login-href').click(function () {
        common.popupPanel(`
            <div class="about-layer">关于微信扫码登录<br><br>
                <ul>
                    <li style='list-style: circle;'>扫描登录仅用于识别用户唯一性，系统不会获取您任何个人信息，请放心扫码</li>
                    <li style='list-style: circle;'>登录之后，后台会为您分配独立的api通道使用，AI的响应速度会更加快。</li>
                </ul>
            </div>
        `, [400, 200]);
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

    $('#kw-target').on('input', function (e) {
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

    $("#chat-new").click(chatmanager.newTalk);

    $('#preset-text').change(common.insertPresetText);

    initEvents();

    if (!common.isMobile()) {
        $('#sidebar').show();
        $('#layout-header').show();
    } else {
        $('#user-id').hide();
        $('.header-about').hide();
    }
});

//异步导入其它模块
await import('./theme.js');
await import('./login.js');
await import('./ext-manager.js');
await import('./prompts.json.js');