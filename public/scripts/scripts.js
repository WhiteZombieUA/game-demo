$(document).ready(function(){
    $('#usernamesignup').blur(function(event) {
        var $this = $(this),
            username = $this.val();
        $.post('/validate-username', {
            usernamesignup: username
        }, function(data) {
            var str = '<div class="alert alert-danger" role="alert">',
                triger = 0;
            if (data == true) {
                str += '<p>This username is already used</p>';
                triger += 1;
            }
            if (username.length < 3) {
                str += '<p>USERNAME is too short. Input USERNAME 3 or more chars.</p>';
                triger += 1;
            }
            if (username.length > 11) {
                str += '<p>USERNAME is too long. Input USERNAME 11 or less chars.</p>';
                triger += 1;
            }
            str += '</div>';
            if (triger > 0) {
                $($.parseHTML(str)).appendTo($('span#username').empty());
            } else {
                $('span#username').empty();
            }
        });
        return false;
    });
});

$(document).ready(function(){
    $('#emailsignup').blur(function(event) {
        var $this = $(this),
            email = $this.val();
        $.post('/validate-email', {
            emailsignup: email
        }, function(data) {
            var str = '<div class="alert alert-danger" role="alert">',
                frog_first = email.indexOf("@"),
                frog_last = email.lastIndexOf("@"),
                triger = 0;

            if (data == true) {
                str += '<p>This email is already used</p>';
                triger += 1;
            }
            if (frog_first != frog_last || frog_first == 0 || (frog_last + 1) == email.length) {
                str += '<p>Please enter a valid e-mail</p>';
                triger += 1;
            }
            str += '</div>';
            if (triger > 0) {
                $($.parseHTML(str)).appendTo($('span#email').empty());
            } else {
                $('span#email').empty();
            }

        });
        return false;
    });
});

$(document).ready(function(){
    $('#passwordsignup_confirm').blur(function(){
        var str = '<div class="alert alert-danger" role="alert">',
            pwrd = $('#passwordsignup').val(),
            cfpwrd = $('#passwordsignup_confirm').val(),
            triger = 0;
        if (pwrd != cfpwrd) {
            str += '<p>Password and Confirm Password must match</p>';
            triger += 1;
        }
        str += '</div>';
        if (triger > 0) {
            $($.parseHTML(str)).appendTo($('span#confirm_password').empty());
        } else {
            $('span#confirm_password').empty();
        }
    });
});

$(document).ready(function(){
    $('#passwordsignup').blur(function(){
        var str = '<div class="alert alert-danger" role="alert">',
            pwrd = $('#passwordsignup').val(),
            triger = 0;
        if (pwrd.length < 6) {
            str += '<p>Password must be minimum 6 characters</p>';
            triger += 1;
        }
        str += '</div>';
        if (triger > 0) {
            $($.parseHTML(str)).appendTo($('span#password').empty());
        } else {
            $('span#password').empty();
        }
    });
});

$(document).ready(function(){
    $('#fullnamesignup').blur(function(){
        var str = '<div class="alert alert-danger" role="alert">',
            fullname = $('#fullnamesignup').val(),
            triger = 0;
        if (fullname.length < 2) {
            str += '<p>Write your name and surname</p>';
            triger += 1;
        }
        str += '</div>';
        if (triger > 0) {
            $($.parseHTML(str)).appendTo($('span#fullname').empty());
        } else {
            $('span#fullname').empty();
        }
    });
});