import { useContext, useEffect, createContext, useState } from 'react'
import { Route, Routes, useNavigate, Link, useLocation } from 'react-router-dom'
import { Container, Box, Card, Typography, Grid, List, ListItem, ListItemText, ListItemButton, ListItemIcon, Tooltip, IconButton, Dialog, DialogTitle, DialogActions, DialogContentText, Stack, DialogContent, Button } from '@mui/material'
import { LoadingButton } from '@mui/lab';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import KeyIcon from '@mui/icons-material/Key';
import HistoryIcon from '@mui/icons-material/History';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CloseIcon from '@mui/icons-material/Close';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import PublicIcon from '@mui/icons-material/Public';
import { useSnackbar } from 'notistack'
import { useUserContext } from '../../contexts/UserContext';
import ViewProfilePage from './ViewProfilePage';
import UserMFAPage from './UserMFAPage';
import PhoneLockedIcon from '@mui/icons-material/PhoneLocked';
import UserPasswordLoginPage from './UserPasswordLoginPage';
import NotFoundPage from '../NotFoundPage'


export const ProfileContext = createContext(null)
function UserProfileRoutesPage() {
    const { user } = useUserContext();
    const location = useLocation()
    const [profile, setProfile] = useState({
        id: 1,
        name: "",
        email: "",
        phone_number: "",
        profile_picture: "",
        profile_picture_type: "",
        is_active: false,
        is_email_verified: false,
        is_phone_verified: false,
        is_2fa_enabled: false,
        cash: 0,
        points: 0,
    },)
    const [changePictureDialog, setChangePictureDialog] = useState(false);
    const [loadingPicture, setLoadingPicture] = useState(false);
    const navigate = useNavigate()
    const { enqueueSnackbar } = useSnackbar()


    return (
        <>
            <Container maxWidth="xl" sx={{ marginTop: "2rem", marginBottom: "1rem" }}>
                
                <ViewProfilePage/>
            </Container>

        </>
    )
}

export default UserProfileRoutesPage