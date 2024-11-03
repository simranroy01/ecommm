// Importing AWS SDK
import AWS from 'https://sdk.amazonaws.com/js/aws-sdk-2.1691.0.min.js';

// Importing the Cognito Identity SDK from the specified URL
import * as amazonCognitoIdentityJs from 'https://esm.run/amazon-cognito-identity-js'; // Updated import

// Importing configuration
import { _config } from './config.js'; // Ensure the path to your config is correct

// Setting up the Cognito User Pool
const userPool = new amazonCognitoIdentityJs.CognitoUserPool({
    UserPoolId: _config.cognito.userPoolId,
    ClientId: _config.cognito.userPoolClientId
});

// Function to create a Cognito User
function createCognitoUser(username) {
    return new amazonCognitoIdentityJs.CognitoUser({
        Username: username,
        Pool: userPool
    });
}

// Function to handle user registration
export function handleRegister(event) {
    const email = $("#emailInputRegister").val();
    const password = $("#passwordInputRegister").val();
    const password2 = $("#password2InputRegister").val();

    if (password === password2) {
        const attributeEmail = new amazonCognitoIdentityJs.CognitoUserAttribute({
            Name: "email",
            Value: email
        });

        userPool.signUp(email.replace("@", "-at-"), password, [attributeEmail], null, function(err, result) {
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
