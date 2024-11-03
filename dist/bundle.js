// Importing the configuration
import _config from './config.js'; // Ensure this path is correct

!function(n) {
    var o, e = {
        UserPoolId: _config.cognito.userPoolId,
        ClientId: _config.cognito.userPoolClientId
    };

    function i(n) {
        return new AmazonCognitoIdentity.CognitoUser({ Username: t(n), Pool: o });
    }

    function t(n) {
        return n.replace("@", "-at-");
    }

    function r(o) {
        var e = n("#emailInputSignin").val(),
            r = n("#passwordInputSignin").val();
        o.preventDefault(),
        function(n, o) {
            var e = new AmazonCognitoIdentity.AuthenticationDetails({ Username: t(n), Password: o });
            i(n).authenticateUser(e, {
                onSuccess: function() {
                    console.log("Successfully Logged In"),
                    window.location.href = "/index.html"
                },
                onFailure: function(n) {
                    alert(n)
                }
            });
        }(e, r);
    }

    function a(e) {
        var i = n("#emailInputRegister").val(),
            r = n("#passwordInputRegister").val(),
            a = n("#password2InputRegister").val();
        e.preventDefault(),
        r === a ? function(n, e) {
            var i = { Name: "email", Value: n },
                r = new AmazonCognitoIdentity.CognitoUserAttribute(i);
            o.signUp(t(n), e, [r], null, function(n, o) {
                n ? function(n) { alert(n) }(n) : function(n) {
                    var o = n.user;
                    console.log("User name is " + o.getUsername()),
                    alert("Registration successful. Please check your email for the verification code."),
                    window.location.href = "verify.html";
                }(o);
            });
        }(i, r) : alert("Passwords do not match");
    }

    function l(o) {
        var e = n("#emailInputVerify").val(),
            t = n("#codeInputVerify").val();
        o.preventDefault(),
        function(n, o) {
            i(n).confirmRegistration(o, !0, function(n, o) {
                n ? function(n) { alert(n) }(n) : (console.log("Successfully verified"),
                alert("Verification successful. You will now be redirected to the login page."),
                window.location.href = "/signin.html");
            });
        }(e, t);
    }

    _config.cognito.userPoolId && _config.cognito.userPoolClientId && _config.cognito.region ? (o = new AmazonCognitoIdentity.CognitoUserPool(e),
        "undefined" != typeof AWSCognito && (AWSCognito.config.region = _config.cognito.region),
        n(function() {
            n("#signinForm").submit(r),
            n("#registrationForm").submit(a),
            n("#verifyForm").submit(l);
        })) : n("#noCognitoMessage").show();
}(jQuery);
