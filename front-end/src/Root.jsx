import { Outlet, ScrollRestoration } from 'react-router-dom';
import { Box, createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import './index.css';
import { AlertProvider } from './contexts/AlertContext';
import AlertComponenet from './components/common/Alert';
import Footer from './components/common/Footer';
import SideNav from './components/common/SideNav';
import { Navbar } from './components/common/Navbar/Navbar';
import { SnackbarProvider } from 'notistack';
import { UserProvider } from './contexts/UserContext';
import { GoogleSSOProvider } from './contexts/GoogleSSOContext';
import GreyBackground from './components/GreyBackground';
import ShowNavBar from './components/common/ShowNavBar';
import ActualNavbar from './components/common/ActualNavbar';

const theme = createTheme({
    typography: {
        fontFamily: 'Poppins, Arial, sans-serif'
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    fontFamily: 'Poppins, Arial, sans-serif',
                }
            }
        },
        TypographyNav: {
            variants: [
                {
                    props: { variant: 'navbarLink' },
                    style: {
                        '&::after': {
                            'content': '',
                            'position': 'absolute',
                            'height': '5px',
                            'left': 0,
                            'bottom': 0,
                            'width': 0,
                            'background': 'lightgreen',
                            'transition': 'width .2s'
                        },

                        '&:hover::after': {
                            'width': '50%'
                        }
                    },
                }
            ]
        },
        MuiButton: {
            variants: [
                {
                    props: { variant: 'claimit_secondary' },
                    style: {
                        textTransform: 'none',
                        backgroundColor: '#FFFFFF',
                        color: "#001f3f",
                        border: "1px solid #001f3f",
                    },
                },
                {
                    props: { variant: 'claimit_primary' },
                    style: {
                        textTransform: 'none',
                        backgroundColor: '#001f3f',
                        color: "#FFFFFF",
                        '&:hover': {


                            border: "1.5px solid #001f3f",
                            color: "#001f3f",

                            backgroundColor: "#FFFFFF",
                            '& .MuiChip-label':
                            {
                                fontSize: "14px"
                            }
                        },

                    },
                },
                {
                    props: { variant: 'outlined' },
                    style: {
                        textTransform: 'none',
                        backgroundColor: '#FFFFFF',
                        color: "#00000",
                        border: "1px solid #000000",

                    },

                },
                {
                    props: { variant: 'outlined-striped' },
                    style: {
                        textTransform: 'none',
                        backgroundColor: '#FFFFFF',
                        color: "#00000",
                        border: "1px solid #000000",
                        borderStyle: 'dashed'

                    },

                },
                {
                    props: { variant: 'outlined-error' },
                    style: {
                        textTransform: 'none',
                        backgroundColor: '#FFFFFF',
                        color: "#00000",
                        border: "2px solid #d9534f",
                        borderStyle: ''

                    },

                },
            ],
        },
        MuiChip: {
            variants: [

                {
                    props: { variant: 'claimit_primary' },
                    style: {
                        minWidth: "150px",
                        minWidth: '150px',
                        height: '38px',
                        borderRadius: 18,
                        '& .MuiChip-label':
                        {
                            fontSize: "14px"
                        },
                        textTransform: 'none',
                        backgroundColor: '#001f3f',
                        color: "#FFFFFF",
                        '&:hover': {
                            minWidth: "150px",
                            minWidth: '150px',
                            height: '38px',
                            border: "1.5px solid #001f3f",
                            color: "#001f3f",
                            borderRadius: 18,
                            backgroundColor: "#FFFFFF",
                            '& .MuiChip-label':
                            {
                                fontSize: "14px"
                            }
                        },

                    },
                },
                {
                    props: { variant: 'claimit_secondary' },
                    style: {
                        minWidth: "150px",
                        minWidth: '150px',
                        height: '38px',
                        border: "1.5px solid #BDBDBD",
                        borderRadius: 18,
                        backgroundColor: "#FFFFFF",
                        '& .MuiChip-label':
                        {
                            fontSize: "14px"
                        }
                    },
                },

            ],

        },
    },
    palette: {
        primaryColor: "#001f3f"
    },
});

function Root() {
    return (
        <>
            <GoogleSSOProvider>
                <ThemeProvider theme={theme}>
                    <AlertProvider>
                        <UserProvider>
                            <SnackbarProvider maxSnack={3}>
                                <CssBaseline />
                                <ShowNavBar>
                                    <SideNav />
                                </ShowNavBar>
                                <ActualNavbar />
                                <AlertComponenet />

                                <Box
                                    sx={{
                                        minHeight: "84vh",
                                        ml: 8.5,
                                        mt: 8,
                                        color: "#f0f0f0"
                                    }}
                                >
                                    <Outlet />
                                </Box>
                                <Footer />
                                <ScrollRestoration />

                            </SnackbarProvider>
                        </UserProvider>
                    </AlertProvider>
                </ThemeProvider>
            </GoogleSSOProvider>
        </>
    );
}

export default Root;