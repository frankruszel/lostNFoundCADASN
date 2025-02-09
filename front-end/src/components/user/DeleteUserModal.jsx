import * as React from 'react';
import Button from '@mui/material/Button';
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

export default function DeleteUserModal(props) {

    return (
        <BootstrapDialog
            onClose={() => props.setOpenModal(false)}
            aria-labelledby="Confirm Delete Account"
            open={props.openModal}
        >
            <DialogTitle sx={{ m: 0, p: 2, color:"red" }} id="customized-dialog-title">
                Confirm Delete Account
            </DialogTitle>
            <IconButton
                aria-label="close"
                onClick={() => props.setOpenModal(false)}
                sx={(theme) => ({
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: theme.palette.grey[500],
                })}
            >
                <CloseIcon />
            </IconButton>
            <DialogContent dividers>
                <Typography gutterBottom>
                    Are you sure you want to delete your account?
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button  color="error" variant='contained' autoFocus onClick={() => {
                    props.setOpenModal(false)
                    props.deleteUser()
                    }}>
                    Confirm Delete
                </Button>
            </DialogActions>
        </BootstrapDialog>
    );
}
