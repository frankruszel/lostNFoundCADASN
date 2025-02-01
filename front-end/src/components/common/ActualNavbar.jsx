import { useState, useEffect, React } from 'react';
import { Container, Grid, AppBar, Toolbar, Typography, Box, Button, IconButton, Avatar, MenuItem } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Menu from '@mui/material/Menu';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useUserContext } from '../../contexts/UserContext';
import SideNav from './SideNav';


function ActualNavbar() {
    const { IsLoggedIn } = useUserContext();
    const { user, RefreshUser } = useUserContext()
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <AppBar position="static" className="AppBar" sx={{ backgroundColor: "white", display: 'flex' }} >

            {
                (!user || user.role != "Staff" && user.role != "Company") &&
                <Grid sx={{ padding: 0, mr: 0, width: "inherit" }}>
                    <Toolbar disableGutters={true}>
                        <Link to="/" style={{ marginLeft: 150 }}>
                            <img src="https://i.ibb.co/gMrcy0cr/download-10.png" alt="UPlay" width="110px" />
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

                        <Link to="/faq" ><Typography color="grey" variant='navbarLink' className='navbarLink'

                        >
                            <p class="navbarLink">
                                Found Item </p> </Typography></Link>
                        <Box sx={{ flexGrow: 0.9 }}></Box>


                        {user && (
                            <>


                                {/* <IconButton sx={{ mx: 0, px: 0 }}>
                                    <img height="25px" src="https://cdn-icons-png.flaticon.com/128/1170/1170678.png" alt="" />

                                </IconButton>
                                <IconButton sx={{ mx: 0, px: 0 }}>
                                    <img height="24px" src="https://cdn-icons-png.flaticon.com/128/1077/1077035.png" alt="" />
                                </IconButton>
                                <IconButton sx={{ mx: 0, px: 0 }}>
                                    <img height="24px" src="https://cdn-icons-png.flaticon.com/512/2529/2529521.png" alt="" />
                                </IconButton>
                                <IconButton sx={{ mx: 0, px: 0 }}>
                                    <img height="25px" src="https://cdn-icons-png.flaticon.com/128/685/685655.png" alt="" />

                                </IconButton> */}


                                <Menu
                                    sx={{ mr: 150 }}
                                    id="simple-menu"
                                    anchorEl={anchorEl}
                                    keepMounted
                                    open={Boolean(anchorEl)}
                                    onClose={handleClose}
                                >
                                    <MenuItem><Link to={`/profile/${user.id}`} style={{ textDecoration: 'none' }}><Typography style={{ color: "MenuText" }}>Profile</Typography></Link></MenuItem>
                                    <MenuItem >Logout</MenuItem>
                                </Menu>
                                <IconButton aria-label="menu" onClick={handleClick} sx={{ mr: 2 }}>
                                    {/* <MenuIcon /> */}
                                    {/* <Avatar alt="" /> */}
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
    );
}

export default ActualNavbar;


