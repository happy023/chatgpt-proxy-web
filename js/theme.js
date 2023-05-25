
function changeTheme() {
    var thistheme = localStorage.getItem('theme');
    if (thistheme == 'light') {
        thistheme = 'dark';
    } else {
        thistheme = 'light';
    }
    localStorage.setItem('theme', thistheme);
    doChangeTheme(thistheme);
}

function doChangeTheme(nextTheme) {
    if (nextTheme == 'light') {
        $('.style-dark').prop("disabled", true);
        $('.style-light').prop("disabled", false);
        $('#theme-switcher-dark').show();
        $('#theme-switcher-light').hide();
        $(document.body).addClass('theme-light');
        $(document.body).removeClass('theme-dark');
    } else {
        $('.style-light').prop("disabled", true);
        $('.style-dark').prop("disabled", false);
        $('#theme-switcher-light').show();
        $('#theme-switcher-dark').hide();
        $(document.body).addClass('theme-dark');
        $(document.body).removeClass('theme-light');
    }
}

function loadTheme() {
    var thistheme = localStorage.getItem('theme');
    doChangeTheme(thistheme);
}

$(document).ready(function () {
    $('#theme-switcher-dark').click(changeTheme);
    $('#theme-switcher-light').click(changeTheme);
    loadTheme();
});