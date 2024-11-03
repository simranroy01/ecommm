// cognito.js
import AmazonCognitoIdentity from 'amazon-cognito-identity-js';
import AWSCognito from 'aws-sdk/global';
import $ from 'jquery'; // Assuming jQuery is installed in the project
// Assuming _config is globally defined or imported from a config module
// import _config from './config.js'; // Uncomment this if you're importing config.js

(function scopeWrapper() {
    const signinUrl = '/signin.html'; // Change this to your sign-in page
    const landingUrl = '/index.html'; // Change this to your landing page

    const poolData = {
        UserPoolId: _config.cognito.userPoolId,
        ClientId: _config.cognito.userPoolClientId,
    };

    let userPool;

    // Check if required configuration is available
    if (!(_config.cognito.userPoolId && _config.cognito.userPoolClientId && _config.cognito.region)) {
        $('#noCognitoMessage').show();
        return;
    }

    userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    AWSCognito.config.region = _config.cognito.region;

    function signOut() {
        const currentUser = userPool.getCurrentUser();
        if (currentUser) {
            currentUser.signOut();
        }
    }

    function fetchCurrentAuthToken() {
        return new Promise((resolve, reject) => {
            const cognitoUser = userPool.getCurrentUser();

            if (cognitoUser) {
                cognitoUser.getSession((err, session) => {
                    if (err) {
                        reject(err);
                    } else if (!session.isValid()) {
                        resolve(null);
                    } else {
                        resolve(session.getIdToken().getJwtToken());
                    }
                });
            } else {
                resolve(null);
            }
        });
    }

    /*
     * Cognito User Pool functions
     */

    function register(email, password, onSuccess, onFailure) {
        const dataEmail = {
            Name: 'email',
            Value: email,
        };
        const attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);

        userPool.signUp(
            toUsername(email),
            password,
            [attributeEmail],
            null,
            (err, result) => {
                if (!err) {
                    onSuccess(result);
                } else {
                    onFailure(err);
                }
            }
        );
    }

    function signin(email, password, onSuccess, onFailure) {
        const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: toUsername(email),
            Password: password,
        });

        const cognitoUser = createCognitoUser(email);
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess,
            onFailure,
        });
    }

    function verify(email, code, onSuccess, onFailure) {
        createCognitoUser(email).confirmRegistration(code, true, (err, result) => {
            if (!err) {
                onSuccess(result);
            } else {
                onFailure(err);
            }
        });
    }

    function createCognitoUser(email) {
        return new AmazonCognitoIdentity.CognitoUser({
            Username: toUsername(email),
            Pool: userPool,
        });
    }

    function toUsername(email) {
        return email.replace('@', '-at-');
    }

    /*
     * Event Handlers
     */

    $(function onDocReady() {
        $('#signinForm').submit(handleSignin);
        $('#registrationForm').submit(handleRegister);
        $('#verifyForm').submit(handleVerify);
    });

    function handleSignin(event) {
        const email = $('#emailInputSignin').val();
        const password = $('#passwordInputSignin').val();
        event.preventDefault();
        signin(
            email,
            password,
            function signinSuccess() {
                console.log('Successfully Logged In');
                window.location.href = landingUrl; // Redirect to the landing page after login
            },
            function signinError(err) {
                alert(err);
            }
        );
    }

    function handleRegister(event) {
        const email = $('#emailInputRegister').val();
        const password = $('#passwordInputRegister').val();
        const password2 = $('#password2InputRegister').val();

        const onSuccess = (result) => {
            const cognitoUser = result.user;
            console.log('User name is ' + cognitoUser.getUsername());
            alert('Registration successful. Please check your email for the verification code.');
            window.location.href = 'verify.html'; // Redirect to the verification page
        };

        const onFailure = (err) => {
            alert(err);
        };

        event.preventDefault();

        if (password === password2) {
            register(email, password, onSuccess, onFailure);
        } else {
            alert('Passwords do not match');
        }
    }

    function handleVerify(event) {
        const email = $('#emailInputVerify').val();
        const code = $('#codeInputVerify').val();
        event.preventDefault();
        verify(
            email,
            code,
            function verifySuccess() {
                console.log('Successfully verified');
                alert('Verification successful. You will now be redirected to the login page.');
                window.location.href = signinUrl; // Redirect to the login page
            },
            function verifyError(err) {
                alert(err);
            }
        );
    }
})();


