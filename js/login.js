(function () {

    function checkLogin() {
        if (isMobile()) {
            // 访问网页的是手机,不校验
            return;
        }
        // 访问网页的是电脑，需要校验
        $.ajax({
            cache: true,
            type: "POST",
            url: "/weixin/checklogin.php",
            dataType: "json",
            success: function (result) {
                if (!result.success) {
                    showqrcode();
                } else {
                    let popup = document.getElementById('login-wx');
                    popup.style.display = "none";
                    let userId = document.getElementById('user-id');
                    userId.innerText = result.user_id + '已登录';
                }
            }
        });
    }

    function showqrcode() {
        let loading = layer.msg('正准备登录...', {
            icon: 16,
            shade: 0.4,
            time: false //取消自动关闭
        });
        $.ajax({
            type: "POST",
            url: "/weixin/createqrcode_div.php",
            success: function (result) {
                layer.close(loading);
                let wxImg = document.getElementById('login-wx');
                wxImg.style.display = "flex";
                wxImg.innerHTML = result;
                timeOut = 0;
                setInterval(checkStatus, 1000);
            }
        });
    }

    // 从0秒开始轮询
    let timeOut = 0;
    let checklogin;

    // 查询扫码状态
    function checkStatus() {
        // 获取scene
        var sc = $('#sc').val();
        $.ajax({
            type: "POST",
            url: "/weixin/getstatus.php?scene=" + sc,
            success: function (data) {
                // code==200即授权登录成功
                if (data.code == 200) {
                    console.log(data.msg)
                    $('#lgtext').html('<span style="color:#07c160;">' + data.msg + '</span>')
                    $('#xcxqrcode').css('filter', 'blur(5px)')
                    clearTimeout(checklogin);
                    location.href = '/';
                } else {
                    console.log(data.msg)
                    if (data.code == 201) {
                        $('#lgtext').html('<span>' + data.msg + '</span>')
                    } else if (data.code == 202) {
                        $('#lgtext').html('<span style="color:#07c160;">' + data.msg + '</span>')
                    }
                }
                expires();
            },
            error: function (data) {
                console.log('服务器发生错误')
                $('#lgtext').text('服务器发生错误')
            }
        });
    }

    // 小程序码过期检测
    function expires() {
        timeOut += 1;
        // 60秒后过期
        if (timeOut >= 60) {
            // 过期后停止轮询
            clearTimeout(checklogin);
            $('#lgtext').text('已过期，请刷新页面')
            $('#xcxqrcode').css('filter', 'blur(5px)')
        }
    }

    $(document).ready(function () {
        //检查是否登录
        checkLogin();
    });
})();