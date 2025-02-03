import { useState, useEffect, React } from 'react';
import { Container, Grid, AppBar, Toolbar, Typography, Box, Button, IconButton, Avatar, MenuItem } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Menu from '@mui/material/Menu';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useUserContext } from '../../contexts/UserContext';
import SideNav from './SideNav';
import SignOutApi from "../../api/auth/SignOutApi";

function ActualNavbar() {
    const { IsLoggedIn } = useUserContext();
    const { user, RefreshUser, accessToken, refreshToken,UserLogOut } = useUserContext()
    const [anchorEl, setAnchorEl] = useState(null);
    const navigate = useNavigate()

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    
    function handleLogout() {
        navigate('/')
        SignOutApi(accessToken, refreshToken)
            .then((res) => {
                UserLogOut();
            })
            .catch((error) => {
                console.error('Error when signing out:', error);
                if (error.name === 'NotAuthorizedException') {
                    if (error.message == "Refresh Token has expired" || error.message.includes('Refresh')) {
                        UserLogOut();
                    }
                } else {
                    console.error('Error fetching user data:', error.message);
                    UserLogOut();
                }
            })

    }

    return (
        <>
            <AppBar position="static" className="AppBar" sx={{ backgroundColor: "white", display: 'flex' }} >

                {
                    (!user || user.role != "Staff" && user.role != "Company") &&
                    <Grid sx={{ padding: 0, mr: 0, width: "inherit" }}>
                        <Toolbar disableGutters={true}>
                            <Link to="/" style={{ marginLeft: 150 }}>
                                {/* <img src="https://i.ibb.co/gMrcy0cr/download-10.png" alt="UPlay" width="110px" /> */}
                                <img src="https://i.ibb.co/tPcdxFmH/image-removebg-preview-4.png" alt="UPlay" width="80px" />

                            </Link>
                            {
                                user &&
                                <Box sx={{ flexGrow: 0.025 }}></Box>
                            }
                            {
                                !user &&
                                <Box sx={{ flexGrow: 0.025 }}></Box>
                            }

                            <Link to="/home" ><Typography color="grey" variant='navbarLink' className='navbarLink'>
                                <p class="navbarLink">
                                    Browse Items </p>
                            </Typography></Link>
                            <Box sx={{ flexGrow: 0.008 }}></Box>

                            <Link to="/find" ><Typography color="grey" variant='navbarLink' className='navbarLink'

                            >
                                <p class="navbarLink">
                                    Find my Item </p> </Typography></Link>
                            <Box sx={{ flexGrow: 0.9 }}></Box>


                            {user && (
                                <>                            
                                    <Menu
                                        sx={{ mr: 150 }}
                                        id="simple-menu"
                                        anchorEl={anchorEl}
                                        keepMounted
                                        open={Boolean(anchorEl)}
                                        onClose={handleClose}
                                    >
                                        <MenuItem><Link to={`/profile/${user.id}`} style={{ textDecoration: 'none' }}><Typography style={{ color: "MenuText" }}>Profile</Typography></Link></MenuItem>
                                        <MenuItem ><Link onClick={handleLogout} style={{ textDecoration: 'none' }}><Typography style={{ color: "MenuText" }}>Logout</Typography></Link></MenuItem>
                                    </Menu>
                                    <IconButton aria-label="menu" onClick={handleClick} sx={{ mr: 2 }}>
                                      
                                        {
                                            user.profilePicture && user.profilePicture != "null" && (
                                                <img alt="Profile Picture"
                                                    // src={`${import.meta.env.VITE_FILE_BASE_URL}${profilePicture}`} 
                                                    style={{ height: '40px', width: '40px', borderRadius: '50%' }}
                                                    onClick={handleClose}>
                                                </img>
                                            )
                                        }
                                        {
                                            (!user.profilePicture || user.profilePicture == "null") && (
                                                <Avatar alt="" />
                                            )
                                        }
                                        <ArrowDropDownIcon />
                                    </IconButton>
                                    {/* <Link to={`/profile/${user.id}`}>

                    </Link> */}

                                </>
                            )
                            }
                            {!user && (
                                <>
                                    <Link to="/register" ><Typography>Register</Typography></Link>
                                    <Link to="/login" ><Typography>Login</Typography></Link>
                                </>
                            )}
                        </Toolbar>
                    </Grid>
                }

                {
                    user && user.role == "Staff" &&
                    <SideNav />
                }

            </AppBar>
            <Box ><img sx={{ display: 'flex' }} src="https://i.ibb.co/GfSFJZLY/image.png" alt="" height='62px' width='100%' /></Box>


        </>
    );
}

export default ActualNavbar;


