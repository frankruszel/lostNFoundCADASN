import { useState, useEffect, React } from 'react';
import { Container, AppBar, Toolbar, Typography, Box, Button, IconButton, Avatar, MenuItem } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Menu from '@mui/material/Menu';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useUserContext } from '../contexts/UserContext';


function ActualNavbar() {
    const { IsLoggedIn } = useUserContext();
  const { user, RefreshUser } = useUserContext()


    return (
        <AppBar position="static" className="AppBar" >

            {
                (!user || user.role != "Staff" && user.role != "Company") &&
                <Container sx={{}}>
                    <Toolbar disableGutters={true}>
                        <Link to="/" >
                            <img src="https://img001.prntscr.com/file/img001/7-Ntv6f3RSi0eGd8Ck80ew.png" alt="UPlay" width="110px" />
                        </Link>
                        {
                            user &&
                            <Box sx={{ flexGrow: 0.56 }}></Box>
                        }
                        {
                            !user &&
                            <Box sx={{ flexGrow: 0.37 }}></Box>
                        }

                        <Link to="/events" ><Typography variant='navbar'>Browse Activites</Typography></Link>
                        <Box sx={{ flexGrow: 0.1 }}></Box>
                        <Link to="/posts" ><Typography variant='navbar'>Forum</Typography></Link>
                        <Box sx={{ flexGrow: 0.1 }}></Box>
                        <Link to="/faq" ><Typography variant='navbar'>Contact Us </Typography></Link>
                        <Box sx={{ flexGrow: 0.1 }}></Box>
                        <Link to="/membership" ><Typography variant='navbar'>Membership </Typography></Link>
                        <Box sx={{ flexGrow: 0.35 }}></Box>


                        {user && (
                            <>


                                <IconButton onClick={cart} sx={{ mx: 0, px: 0 }}>
                                    <img height="25px" src="https://cdn-icons-png.flaticon.com/128/1170/1170678.png" alt="" />

                                </IconButton>
                                <IconButton onClick={favorites} sx={{ mx: 0, px: 0 }}>
                                    <img height="24px" src="https://cdn-icons-png.flaticon.com/128/1077/1077035.png" alt="" />
                                </IconButton>
                                <IconButton onClick={notifications} sx={{ mx: 0, px: 0 }}>
                                    <img height="24px" src="https://cdn-icons-png.flaticon.com/512/2529/2529521.png" alt="" />
                                </IconButton>
                                <IconButton onClick={camera} sx={{ mx: 0, px: 0 }}>
                                    <img height="25px" src="https://cdn-icons-png.flaticon.com/128/685/685655.png" alt="" />

                                </IconButton>


                                <Menu
                                    id="simple-menu"
                                    anchorEl={anchorEl}
                                    keepMounted
                                    open={Boolean(anchorEl)}
                                    onClose={handleClose}
                                >
                                    <MenuItem><Link to={`/profile/${user.id}`} style={{ textDecoration: 'none' }}><Typography style={{ color: "MenuText" }}>Profile</Typography></Link></MenuItem>
                                    <MenuItem onClick={logout}>Logout</MenuItem>
                                </Menu>
                                <IconButton aria-label="menu" onClick={handleClick} sx={{ mr: 2 }}>
                                    {/* <MenuIcon /> */}
                                    {/* <Avatar alt="" /> */}
                                    {
                                        user.profilePicture && user.profilePicture != "null" && (
                                            <img alt="Profile Picture"
                                                src={`${import.meta.env.VITE_FILE_BASE_URL}${profilePicture}`} style={{ height: '40px', width: '40px', borderRadius: '50%' }}
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
                </Container>
            }

            {
                user && user.role == "Staff" &&
                <Sidenav />
            }
            {
                user && user.role == "Company" &&
                <CompanySideNav />
            }

        </AppBar>
    );
}

export default ActualNavbar;


