let loaded = false;
function initIntellisense() {
    $('#kw-target').on('input', function (e) {
        let inputValue = e.target.value || '';
        if (inputValue.startsWith('/')) {
            if (loaded) {
                $('#prompt-list-holder').show();
                $('#article-wrapper').css('height', 'calc(100vh - 470px)');
            } else {
                $("#prompt-list-holder").load("/prompts.html");
                loaded = true;
                $('#prompt-list-holder').show();
                $('#article-wrapper').css('height', 'calc(100vh - 470px)');
            }
            filter(inputValue.substring(1));
        } else {
            $(".prompt-container li").each((_, item) => $(item).show());
            $('#prompt-list-holder').hide();
            $('#article-wrapper').css('height', 'calc(100vh - 160px)');
        }
    });
}

function filter(inputValue) {
    if (!inputValue) {
        return;
    }
    let array = $(".prompt-container li");

    let regex = new RegExp(inputValue, "i");

    for (let i = 0; i < array.length; i++) {
        $(array[i]).show();
    }

    for (let i = 0; i < array.length; i++) {
        const me = $(array[i]);
        let promptText = $.trim(me.children('.prompt-content').text());
        if (!promptText.match(regex)) {
            me.hide();
        }
    }
}

initIntellisense();