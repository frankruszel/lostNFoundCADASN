import { Container, Grid } from "@mui/material"
import { useEffect, useState, useContext } from "react";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import SignInApi from "../api/auth/SignInApi";
import ResendAuthCodeApi from "../api/auth/ResendAuthCodeApi";
import GetCurrentUserApi from "../api/auth/GetCurrentUserApi";
import SendPasswordResetApi from "../api/auth/SendPasswordResetApi";
import { useUserContext } from "../contexts/UserContext";
import ResendVerificationEmailDialog from "../components/login/ResendVerificationEmailDialog";
import LoginCard from "../components/login/LoginCard";
import { useLocation } from "react-router-dom"; // Import useLocation
import { Box, Button, TextField, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText } from "@mui/material"
import LoadingButton from '@mui/lab/LoadingButton';
import LockResetIcon from '@mui/icons-material/LockReset';
import CloseIcon from '@mui/icons-material/Close';

function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [resetPasswordDialog, setResetPasswordDialog] = useState(false);
    const [otpDialog, setOtpDialog] = useState(false);
    const [resendDialog, setResendDialog] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")
    const [showPassword, setShowPassword] = useState(false);
    const [mfaCode, setMfaCode] = useState('');
    const [session, setSession] = useState(null);
    const [isMfaRequired, setIsMfaRequired] = useState(false);
    const [otpEmail, setOtpEmail] = useState("")
    const { UserLogIn } = useUserContext();
    const location = useLocation(); // Access the current URL location

    useEffect(() => {
        const hash = window.location.hash.substring(1); // Remove the #
        const params = new URLSearchParams(hash);
        const idToken = params.get("id_token");
        const accessToken = params.get("access_token");

        // Store tokens securely
        if (idToken && accessToken) {
            localStorage.setItem("id_token", idToken);
            localStorage.setItem("access_token", accessToken);
            GetCurrentUserApi(accessToken)
                .then((user) => {
                    console.log('User data fetched:', user);
                    UserLogIn(user, accessToken, idToken, null); // Handle successful login
                    enqueueSnackbar('Log in successful', { variant: "success" });
                    navigate('/'); // Redirect to home page
                })
                .catch((error) => {
                    console.error('Error when fetching user data:', error);
                    enqueueSnackbar('Failed to fetch user data. Please log in again.', { variant: 'error' });
                });
        }

        // Clear hash to prevent duplicate parsing
        window.history.replaceState(null, null, " ");
    }, []);
    const togglePasswordVisibility = () => {
        console.log('test')
        setShowPassword(!showPassword);
    };

    const handleResetPasswordDialog = () => {
        setResetPasswordDialog(true);
    }

    const handleResetPasswordDialogClose = () => {
        setResetPasswordDialog(false);
    }
    const handleOtpDialog = () => {
        setOtpDialog(true);
    }

    const handleOtpDialogClose = () => {
        setOtpDialog(false);
    }

    const handleResendDialog = () => {
        setResendDialog(true);
    }

    const handleResendDialogClose = () => {
        setResendDialog(false);
    }

    const googleAuth = null;

    const handleSignIn = (email, password) => {
        setLoading(true);
        console.log("email", email)
        SignInApi(email, password, isMfaRequired ? mfaCode : null, session)
            .then((response) => {
                if (response.challengeName === 'SMS_MFA') {
                    // MFA challenge triggered
                    setSession(response.session);
                    setIsMfaRequired(true);
                    enqueueSnackbar('MFA required. Please enter the code sent to your phone.', { variant: "info" });
                } else {
                    // Successfully signed in
                    const { accessToken, idToken, refreshToken } = response;

                    // Fetch user details
                    GetCurrentUserApi(accessToken)
                        .then((user) => {
                            console.log('User data fetched:', user);
                            UserLogIn(user, accessToken, idToken, refreshToken); // Handle successful login
                            enqueueSnackbar("Log in successful", { variant: "success" });
                            navigate('/'); // Redirect to home page
                        })
                        .catch((error) => {
                            console.error('Error when fetching user data:', error);
                            enqueueSnackbar('Failed to fetch user data. Please log in again.', { variant: 'error' });
                        });
                }
            })
            .catch((error) => {
                console.error('Error during sign-in:', error);
                if (error.name === 'NotAuthorizedException') {
                    if (error.message == "Invalid session for the user, session is expired.") {
                        enqueueSnackbar('MFA code has expired, please try again.', { variant: "error" })
                        setIsMfaRequired(false);
                        setMfaCode("");
                        setSession("");
                    }
                    setErrorMessage('Incorrect username, password.');
                } else if (error.name === 'UserNotFoundException') {
                    setErrorMessage('User does not exist.');
                } else if (error.name === 'UserNotConfirmedException') {
                    setErrorMessage('User account has not been confirmed. Please check your email.');
                } else if (error.name === 'CodeMismatchException') {
                    setErrorMessage('Invalid MFA code. Please try again.');
                } else {
                    setErrorMessage('An error occurred during sign-in. Please try again later.');
                }
                setOpen(true);
            })
            .finally(() => setLoading(false));
    };

    const formik = useFormik({
        initialValues: {
            email: "",
            password: "",
        },
        validationSchema: Yup.object({
            email: Yup.string().email("Invalid email address").required("Required"),
            password: Yup.string().required("Password is required"),
        }),
        onSubmit: (data) => {
            setLoading(true);
            
            data.email = data.email.trim();
            data.password = data.password.trim();

            handleSignIn(data.email, data.password);
        }

    })
    const otpFormik = useFormik({
        initialValues: {
            email: "",
            otp: "",
        },
        validationSchema: Yup.object({
            email: Yup.string().email("Invalid email address").required("Required"),
            otp: Yup.string().required("OTP is required"),
        }),
        onSubmit: (data) => {
            data.email = data.email.trim();
            data.otp = data.otp.trim();
        }
    }
    )
    const resetFormik = useFormik({
        initialValues: {
            email: otpEmail,
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            email: Yup.string().email("Invalid email address").required("Required"),
        }),
        onSubmit: (data) => {
            setResetLoading(true);
            SendPasswordResetApi(data.email)
                .then((res) => {
                    console.log('success', res)
                    enqueueSnackbar('Reset password e-mail sent!', { variant: "success" });
                    setResetPasswordDialog(false);
                    setResetLoading(false)
                    setOtpEmail(data.email)
                    setOtpDialog(true)
                })
                .catch((error) => {
                    console.error('Error during password reset:', error);
                    enqueueSnackbar("Reset password e-mail failed! ", { variant: "error" });
                    setResetLoading(false)
                });
        }
    })

    const resendFormik = useFormik({
        initialValues: {
            email: "",
        },
        validationSchema: Yup.object({
            email: Yup.string().email("Invalid email address").required("Required"),
        }),
        onSubmit: (data) => {
            setResendLoading(true);
            data.email = data.email.trim();
            data.email = data.email.trim();
            ResendAuthCodeApi(data.email)
                .then((res) => {
                    console.log('success', res)
                    enqueueSnackbar('Verification e-mail sent!', { variant: "success" });
                    setResendDialog(false);
                    setResendLoading(false)
                })
                .catch((error) => {
                    console.error('Error during resend email:', error);
                    enqueueSnackbar("Verification e-mail failed! ", { variant: "error" });
                    setResendLoading(false)
                });
        }
    })
    useEffect(() => {
        console.log("otpEmail Changed")
        console.log(otpEmail)

    }, [otpEmail]);

    return (
        <>
            <Container maxWidth="xl" sx={{ marginY: "1rem", marginTop: '2rem', }}>
                <Grid container spacing={2} justifyContent="center">
                    <Grid item xs={12} sm={6} md={5} lg={4}>
                        <LoginCard
                            formik={formik}
                            togglePasswordVisibility={togglePasswordVisibility}
                            showPassword={showPassword}
                            mfaCode={mfaCode}
                            setMfaCode={setMfaCode}
                            errorMessage={errorMessage}
                            loading={loading}
                            handleResetPasswordDialog={handleResetPasswordDialog}
                            isMfaRequired={isMfaRequired}
                            open={open}
                            setOpen={setOpen}
                        />
                    </Grid>
                </Grid>
            </Container>
            <Dialog open={resetPasswordDialog} onClose={handleResetPasswordDialogClose}>
                <DialogTitle>Forgot Password</DialogTitle>
                <Box component="form" onSubmit={resetFormik.handleSubmit}>
                    <DialogContent sx={{ paddingTop: 0 }}>
                        <DialogContentText>
                            To reset your password, please enter your e-mail address below. We will send you a link to reset your password.
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="email"
                            label="E-mail"
                            type="email"
                            name="email"
                            fullWidth
                            variant="outlined"
                            value={resetFormik.values.email}
                            onChange={resetFormik.handleChange}
                            error={resetFormik.touched.email && Boolean(resetFormik.errors.email)}
                            helperText={resetFormik.touched.email && resetFormik.errors.email}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleResetPasswordDialogClose} startIcon={<CloseIcon />} color="error" variant="contained">Cancel</Button>
                        <LoadingButton type="submit" loadingPosition="start" loading={resetLoading} variant="claimit_primary" >Reset</LoadingButton>
                    </DialogActions>
                </Box>

            </Dialog>
            <Dialog open={otpDialog} onClose={handleOtpDialogClose}>
                <DialogTitle>OTP</DialogTitle>
                <Box component="form" onSubmit={otpFormik.handleSubmit}>
                    <DialogContent sx={{ paddingTop: 0 }}>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="email"
                            label="E-mail"
                            type="email"
                            name="email"
                            fullWidth
                            variant="outlined"
                            value={otpEmail}

                            disabled
                        />
                        <TextField
                            autoFocus
                            margin="dense"
                            id="otp"
                            label="OTP Code"
                            type="string"
                            name="otp"
                            fullWidth
                            variant="outlined"
                            value={otpFormik.values.otp}
                            onChange={otpFormik.handleChange}
                            error={otpFormik.touched.otp && Boolean(otpFormik.errors.otp)}
                            helperText={otpFormik.touched.otp && otpFormik.errors.otp}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleOtpDialogClose} startIcon={<CloseIcon />} color="error" variant="contained">Cancel</Button>
                        <LoadingButton type="submit" loadingPosition="start" loading={resetLoading} variant="claimit_primary" >Reset</LoadingButton>
                    </DialogActions>
                </Box>
            </Dialog>
        </>
    )
}

export default LoginPage