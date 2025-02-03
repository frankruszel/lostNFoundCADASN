import { useState, useEffect } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import MuiAppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { Menu,MenuItem,Avatar } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import { useUserContext } from '../../contexts/UserContext';
import SignOutApi from "../../api/auth/SignOutApi";

const drawerWidth = 240;

const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme) => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0,),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        position: 'relative',
        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
        }),
    }),
);


export default function SideNav() {
    const theme = useTheme();
    const [open, setOpen] = useState(false);    
    const { user, RefreshUser, accessToken, refreshToken,UserLogOut } = useUserContext()
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    
    function handleLogout() {
        window.location.href = '/'
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
    const handleManageEvents = () => {
        window.location.href = "/staff/list"
    }
    const handleClickHome = () => {
        window.location.href = "/staff/dashboard"
    }
    


    return (

        <>
            <Box sx={{ display: 'flex' }}>
                <CssBaseline />
                <AppBar position="fixed" sx={{ backgroundColor: 'secondaryColor' }}  >
                    <Toolbar sx={{ display: 'flex', ml: 0, pl: 0 }} style={{ paddingLeft: "0.5%" }}>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            onClick={() => { setOpen(!open) }}
                            edge="start"
                            sx={{ ml: 1, mr: 4 }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <a href="/staff/dashboard">
                            {/* <img src="https://i.ibb.co/jkKYxDxR/image-removebg-preview-2.png" alt="ClaimIt" height={'32'} /> */}
                            <img src="https://jobtech-images.s3-ap-southeast-1.amazonaws.com/logo/nyp/nyp-white.png" alt="ClaimIt" height={'32'} />
                        </a>
                        {/*} <Typography variant="h6" noWrap component="div">
              Uplay
            </Typography>*/}
                        <Box sx={{ flexGrow: 1 }}></Box>
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
                                        <MenuItem><a href={`/profile`} style={{ textDecoration: 'none' }}><Typography style={{ color: "MenuText" }}>Profile</Typography></a></MenuItem>
                                        <MenuItem ><a onClick={handleLogout} style={{ textDecoration: 'none' }}><Typography style={{ color: "MenuText" }}>Logout</Typography></a></MenuItem>
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
                                    </IconButton>
                                 

                                </>
                            )
                            }
                            {!user && (
                                <>
                                    <a href="/register" ><Typography>Register</Typography></a>
                                    <a href="/login" ><Typography>Login</Typography></a>
                                </>
                            )}
                    </Toolbar>
                </AppBar>
                <Drawer variant="permanent" open={open} sx={{ backgroundColor: 'secondaryColor' }} >
                    <DrawerHeader>
                        <IconButton onClick={() => { setOpen(!open) }}>
                            {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                        </IconButton>
                    </DrawerHeader>
                    <Divider sx={{ backgroundColor: 'secondaryColor' }} />
                    <List sx={{ backgroundColor: 'secondaryColor', height: '100%' }} >

                        <ListItem onClick={handleClickHome} disablePadding sx={{ display: 'block' }}>
                            <ListItemButton
                                sx={{
                                    minHeight: 48,
                                    justifyContent: open ? 'initial' : 'center',
                                    px: 2.5,
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: open ? 3 : 'auto',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <HomeIcon style={{ color: '#ffffff' }} />
                                </ListItemIcon>
                                {open && (
                                    <>
                                        <ListItemText primary="Overview" sx={{ color: '#ffffff' }} />
                                    </>
                                )}
                            </ListItemButton>
                        </ListItem>

                        <ListItem onClick={handleManageEvents} disablePadding sx={{ display: 'block' }}>
                            <ListItemButton
                                sx={{
                                    minHeight: 48,
                                    justifyContent: open ? 'initial' : 'center',
                                    px: 2.5,
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: open ? 3 : 'auto',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <SettingsIcon style={{ color: '#ffffff' }} />
                                </ListItemIcon>
                                {open && (
                                    <>
                                        <ListItemText primary="Manage Items" sx={{ color: '#ffffff' }} />
                                    </>
                                )}
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Drawer>
            </Box>

        </>
    );
}