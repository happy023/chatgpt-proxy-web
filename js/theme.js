
function changeTheme() {
    var thistheme = localStorage.getItem('theme');
    if (thistheme == 'dark') {
        thistheme = 'light';
    } else {
        thistheme = 'dark';
    }
    localStorage.setItem('theme', thistheme);
    doChangeTheme(thistheme);
}

function doChangeTheme(nextTheme) {
    if (nextTheme == 'dark') {
        $('.style-dark').prop("disabled", false);
        $('.style-light').prop("disabled", true);
        $('#theme-switcher-light').show();
        $('#theme-switcher-dark').hide();
        $(document.body).addClass('theme-dark');
        $(document.body).removeClass('theme-light');
    } else {
        $('.style-light').prop("disabled", false);
        $('.style-dark').prop("disabled", true);
        $('#theme-switcher-dark').show();
        $('#theme-switcher-light').hide();
        $(document.body).addClass('theme-light');
        $(document.body).removeClass('theme-dark');
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