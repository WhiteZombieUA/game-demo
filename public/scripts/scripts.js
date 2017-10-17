/* JQuery sign in form validate */
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
                str += '<p>USERNAME is too short (3 or more chars)</p>';
                triger += 1;
            }
            if (username.length > 11) {
                str += '<p>USERNAME is too long (11 or less chars)</p>';
                triger += 1;
            }
            str += '</div>';
            if (triger > 0) {
                $('#usernamesignup').addClass('red-border');
                $($.parseHTML(str)).appendTo($('span#username').empty());
            } else {
                $('#usernamesignup').removeClass('red-border');
                $('span#username').empty();
            }
        });
        return false;
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
            $('#passwordsignup').addClass('red-border');
            $($.parseHTML(str)).appendTo($('span#password').empty());
        } else {
            $('#passwordsignup').removeClass('red-border');
            $('span#password').empty();
        }
    });
});

$(document).ready(function(){
    $('#passwordsignup_confirm').blur(function(){
        var str = '<div class="alert alert-danger" role="alert">',
            $pwrd = $('#passwordsignup'),
            pwrd = $pwrd.val(),
            $cfpwrd = $('#passwordsignup_confirm'),
            cfpwrd = $cfpwrd.val(),
            triger = 0;
        if (pwrd != cfpwrd) {
            str += '<p>PASSWORDs don&#39;t match</p>';
            triger += 1;
        }
        str += '</div>';
        if (triger > 0) {
            $cfpwrd.addClass('red-border');
            $pwrd.addClass('red-border');
            $($.parseHTML(str)).appendTo($('span#confirm_password').empty());
        } else {
            $cfpwrd.removeClass('red-border');
            $pwrd.removeClass('red-border');
            $('span#confirm_password').empty();
        }
    });
});

/*
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
*/


$(document).ready(function(){
    $('#r11').on('click', function(){
        $(this).parent().find('a').trigger('click')
    });

    $('#r12').on('click', function(){
        $(this).parent().find('a').trigger('click')
    });
    $('#r13').on('click', function(){
        $(this).parent().find('a').trigger('click')
    });
});