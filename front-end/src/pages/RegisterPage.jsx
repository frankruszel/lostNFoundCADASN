import React, { useState } from 'react';
import { Box, TextField, Card, CardContent, Stack, Button, Paper, Typography, Grid, List, ListItem, ListItemIcon, ListItemText, IconButton, InputAdornment, Divider } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ErrorIcon from '@mui/icons-material/Error';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import * as yup from 'yup';
import { useNavigate } from "react-router-dom";
import CardTitle from '../components/common/CardTitle';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SignUpUserApi from '../api/auth/SignUpApi';
import LoadingButton from '@mui/lab/LoadingButton';
import { enqueueSnackbar } from 'notistack';


const schema = yup.object({
    email: yup.string().email("Invalid email address").required("Email is required"),
    password: yup.string()
        .required('Password is required')
        .min(8, 'Password must be at least 8 characters long')
        .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
        .matches(/[0-9]/, 'Password must contain at least one number')
        .matches(/[\^$*.\[\]{}()?\-"!@#%&/\\,><':;|_~`]/, 'Password must contain at least one special character')
        .notOneOf([yup.ref('username'), null], 'Password cannot contain your username'),
    confirmPassword: yup.string()
        .oneOf([yup.ref('password'), null], 'Passwords do not match')
}).required();

function RegisterPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate();

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        yup.reach(schema, name).validate(value).then(() => {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }).catch(err => {
            setErrors(prev => ({ ...prev, [name]: err.message }));
        });

        if (name === 'password' || name === 'confirmPassword') {
            const passwordVal = name === 'password' ? value : formData.password;
            const confirmPasswordVal = name === 'confirmPassword' ? value : formData.confirmPassword;

            setTimeout(() => {
                if (passwordVal !== confirmPasswordVal) {
                    setErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match" }));
                } else {
                    setErrors(prev => ({ ...prev, confirmPassword: "" }));
                }
            }, 0);
        }
    };


    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        setLoading(true);
        schema.validate(formData, { abortEarly: false })
            .then(() => {
                setErrors({});
                SignUpUserApi(formData.email, formData.password)
                    .then((res) => {
                        // Handle successful sign-up
                        console.log('Sign-up successful:', res);
                        navigate('/login');
                        enqueueSnackbar("Sign up successfull. Please verify your email.", { variant: "success" });
                        setLoading(false);
                    })
                    .catch((err) => {
                        // Handle errors thrown by SignUpUserApi
                        console.error('Error caught in handleSubmit:', err);
                        if (err.name) {
                            console.error(`Error code: ${err.name}, message: ${err.message}`);
                        }
                        if (err.name === "UsernameExistsException") {
                            setErrors({ email: "Email has already been taken" })
                        }
                        else {
                            console.error('An unexpected error occurred:', err);
                            enqueueSnackbar('An unexpected error occured. Please try again later', { variant: "error" })
                        }
                        setLoading(false);
                    });
            })
            .catch(err => {
                const newErrors = err.inner.reduce((acc, curr) => {
                    acc[curr.path] = curr.message;
                    return acc;
                }, {});
                setErrors(newErrors);
                setLoading(false);
            });
    };

    const passwordValidationCriteria = [
        { test: (pwd) => pwd.length >= 8, text: "At least 8 characters" },
        { test: (pwd) => /[A-Z]/.test(pwd), text: "At least one uppercase letter" },
        { test: (pwd) => /[a-z]/.test(pwd), text: "At least one lowercase letter" },
        { test: (pwd) => /[0-9]/.test(pwd), text: "At least one number" },
        { test: (pwd) => /[\^$*.\[\]{}()?\-"!@#%&/\\,><':;|_~`]/.test(pwd), text: "At least one special character" },
    ];

    return (
        <>
            <Grid mt={-7} mb={2}>
                <a href="/">
                    <Box sx={{ margin: "auto",backgroundColor: "secondaryColor", height: 100, boxShadow: 5,maxWidth: 459 }} container direction={'row'} display={'flex'} justifyContent={'center'}  >
                        <img src="https://i.ibb.co/HTD2T9gF/image-removebg-preview-5.png" alt="EcoWise" height={'32'} style={{ margin: 'auto' }} />

                    </Box>
                </a>
                <Card sx={{ margin: "auto", boxShadow: 5, maxWidth: 459 }}>
                    <CardContent>
                        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                            <Stack spacing={2} sx={{ marginTop: 2 }}>



                                {Object.keys(formData).map(key => (
                                    <TextField
                                        key={key}
                                        margin="normal"
                                        required
                                        fullWidth
                                        id={key}
                                        label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                                        name={key}
                                        type={(key === "password" && !showPassword) || (key === "confirmPassword" && !showConfirmPassword) ? "password" : "text"}
                                        value={formData[key]}
                                        onChange={handleChange}
                                        error={!!errors[key]}
                                        helperText={errors[key]}
                                        autoComplete={key}
                                        InputProps={{
                                            endAdornment: (key === "password" || key === "confirmPassword") ? (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={key === "password" ? togglePasswordVisibility : toggleConfirmPasswordVisibility}
                                                        edge="end"
                                                    >
                                                        {(key === "password" && showPassword) || (key === "confirmPassword" && showConfirmPassword) ? <VisibilityOff /> : <Visibility />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ) : null
                                        }}
                                        sx={{
                                            '& .MuiInputBase-root': {
                                                height: '40px'
                                            },
                                            '& .MuiFormLabel-root': {
                                                fontSize: '0.9rem',
                                                top: '-7px'
                                            },
                                        }}
                                    />
                                ))}
                                <List dense sx={{ marginTop: -2 }}>
                                    {passwordValidationCriteria.map((criteria, index) => (
                                        <ListItem key={index}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                fontSize: '0.5rem',
                                                '& .MuiTypography-root': {
                                                    fontSize: '0.7rem',
                                                    marginLeft: '-35px'
                                                },
                                                '& .MuiSvgIcon-root': {
                                                    fontSize: '0.7rem'
                                                }
                                            }}
                                        >
                                            <ListItemIcon>
                                                {criteria.test(formData.password) ? <CheckIcon color="success" /> : <ErrorIcon color="error" />}
                                            </ListItemIcon>
                                            <ListItemText primary={criteria.text} sx={{ color: criteria.test(formData.password) ? 'green' : 'red' }} />
                                        </ListItem>
                                    ))}
                                </List>
                                <LoadingButton type="submit" loadingPosition="start" fullWidth loading={loading} variant="contained" color="primary" sx={{ backgroundColor: 'secondaryColor', height:45 }} >Sign up</LoadingButton>
                            </Stack>
                        </Box>
                    </CardContent>
                    <Box display={'flex'} justifyContent={'center'} backgroundColor="#f0f0f0" height={65}>
                        <Typography margin={'auto'}>
                            Already have an account? <a href="/login"> Log in</a>

                        </Typography>
                    </Box>
                </Card>
            </Grid>
        </>
    );
}

export default RegisterPage;