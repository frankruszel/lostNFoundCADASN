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
        }
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
                                <AlertComponenet />

                                <Box
                                    sx={{
                                        minHeight: "84vh",
                                        ml: 8.5,
                                        mt:  8,
                                        color: "#f0f0f0"
                                    }}
                                >
                                    <Outlet />
                                    <GreyBackground />
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