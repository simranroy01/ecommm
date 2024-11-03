// Importing AWS SDK
import AWS from 'https://sdk.amazonaws.com/js/aws-sdk-2.1691.0.min.js';

// Importing the Cognito Identity SDK from the specified URL
import * as amazonCognitoIdentityJs from 'https://esm.run/amazon-cognito-identity-js'; // Updated import

// Importing configuration
import { _config } from './config.js'; // Ensure the path to your config is correct

!function($) {
    var userPool;

    // Ensure userPool configuration is defined
    if (_config.cognito.userPoolId && _config.cognito.userPoolClientId && _config.cognito.region) {
        // Set up the Cognito User Pool
        userPool = new amazonCognitoIdentityJs.CognitoUserPool({
            UserPoolId: _config.cognito.userPoolId,
            ClientId: _config.cognito.userPoolClientId
        });
        
        // Set the region for AWSCognito
        if (typeof AWSCognito !== 'undefined') {
            AWSCognito.config.region = _config.cognito.region;
        }

        // Document Ready
        $(function() {
            $("#signinForm").submit(handleSignin);
            $("#registrationForm").submit(handleRegister);
            $("#verifyForm").submit(handleVerify);
        });
    } else {
        $("#noCognitoMessage").show(); // Show error message if config is not available
    }

    function createCognitoUser(username) {
        return new amazonCognitoIdentityJs.CognitoUser({
            Username: username,
            Pool: userPool
        });
    }

    function toUsername(email) {
        return email.replace("@", "-at-");
    }

    function handleSignin(event) {
        event.preventDefault();
        const email = $("#emailInputSignin").val();
        const password = $("#passwordInputSignin").val();

        const authenticationDetails = new amazonCognitoIdentityJs.AuthenticationDetails({
            Username: toUsername(email),
            Password: password
        });

        const cognitoUser = createCognitoUser(email);
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function() {
                console.log("Successfully Logged In");
                window.location.href = "/index.html";
            },
            onFailure: function(err) {
                alert(err.message || JSON.stringify(err));
            }
        });
    }

    function handleRegister(event) {
        event.preventDefault();
        const email = $("#emailInputRegister").val();
        const password = $("#passwordInputRegister").val();
        const password2 = $("#password2InputRegister").val();

        if (password === password2) {
            const attributeEmail = new amazonCognitoIdentityJs.CognitoUserAttribute({
                Name: "email",
                Value: email
            });

            userPool.signUp(toUsername(email), password, [attributeEmail], null, function(err, result) {
                if (err) {
                    alert(err.message || JSON.stringify(err));
                } else {
                    const cognitoUser = result.user;
                    console.log("User name is " + cognitoUser.getUsername());
                    alert("Registration successful. Please check your email for the verification code.");
                    window.location.href = "verify.html";
                }
            });
        } else {
            alert("Passwords do not match");
        }
    }

    function handleVerify(event) {
        event.preventDefault();
        const email = $("#emailInputVerify").val();
        const code = $("#codeInputVerify").val();

        const cognitoUser = createCognitoUser(email);
        cognitoUser.confirmRegistration(code, true, function(err, result) {
            if (err) {
                alert(err.message || JSON.stringify(err));
            } else {
                console.log("Successfully verified");
                alert("Verification successful. You will now be redirected to the login page.");
                window.location.href = "/signin.html";
            }
        });
    }

}(jQuery);



