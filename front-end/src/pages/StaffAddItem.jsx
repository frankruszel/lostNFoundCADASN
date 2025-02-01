import React, { useState, useEffect, useRef } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Paper, Select, MenuItem, InputLabel, FormControl, TextField, Tabs, Stack, Tab, Dialog, Input, DialogTitle, Card, DialogContent, Avatar, CardContent, Divider, DialogContentText, DialogActions, Button, Typography, Box, IconButton, Chip, Grid } from '@mui/material';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { AccessTime, Search, Clear } from '@mui/icons-material';
import UserContext from '../contexts/UserContext';
import CircularProgress from '@mui/material/CircularProgress';
import { toast } from 'react-toastify';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom'
import PrintIcon from '@mui/icons-material/Print';
import qrcode from "qrcode";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import dayjs from 'dayjs';
import { useFormik } from "formik";
import * as Yup from "yup";
import LoadingButton from '@mui/lab/LoadingButton';
import Collapse from '@mui/material/Collapse';
import Alert from '@mui/material/Alert';
import CloseIcon from '@mui/icons-material/Close';


function StaffAddItem() {
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("")

    // bookingId
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
            // setLoading(true);
            data.email = data.email.trim();
            data.password = data.password.trim();

            handleAddEvent(data);
        }

    })
    const componentRef = useRef();

    const handleAddEvent = () => {
        console.log("handleAddEvent")
    }

    const [userList, setUserList] = useState([]);
    const [itemList, setItemList] = useState([{

        event: {
            imageFile: "https://i.ibb.co/jkKYxDxR/image-removebg-preview-2.png",
            title: "title",
            guest_Price: 10,
            purchased_Price: 10,
        },
        timeSlot: {
            event_StartTime: "2024-02-29T00:00:00.000Z",
            event_EndTime: "2024-02-29T00:00:00.000Z",
        },


    }]);
    const [open, setOpen] = useState(false);
    const [rowID, setRowID] = useState();
    const [search, setSearch] = useState('');
    const [user, setUser] = useState(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [activateOpen, setActivateOpen] = useState(false);
    const [imageQR, setImageQR] = useState();
    const navigate = useNavigate();
    const location = useLocation();
    const [qrOpen, setQrOpen] = useState(false)
    const [currentTicket, setCurrentTicket] = useState()
    const [tabState, setTabState] = useState('All')
    const [imageFile, setImageFile] = useState(null);
    const [imageError, setImageError] = useState(false);
    const [category, setCategory] = useState('');
    const handleCategoryChange = (event) => {
        // setCategoryError(false)
        setCategory(event.target.value);
    };
    const onFileChange = (e) => {
        let file = e.target.files[0];
        if (file) {
            if (file.size > 1024 * 1024) {
                toast.error('Maximum file size is 1MB');
                return;
            }

            let formData = new FormData();
            formData.append('file', file);
            // http.post('/file/upload', formData, {
            //     headers: {
            //         'Content-Type': 'multipart/form-data'
            //     }
            // })
            //     .then((res) => {
            //         setImageFile(res.data.filename);
            //     })
            //     .catch(function (error) {
            //         console.log(error.response);
            //     });
        }
    };



    return (


        <Box px={"30%"} >
            <Box pt={0} mt={0} sx={{ backgroundColor: "#f0f0f0", height: "150%", position: "absolute", zIndex: -1, left: 0, right: 0, top: 0 }}></Box>
            <Typography variant='h4' sx={{ py: 2 }}> </Typography>
            <Box px={10}>
                <Card sx={{}}>
                    <CardContent sx={{ mb: 4, px: 5, py: 5 }}>
                        <Grid container direction='row' display="flex" justifyContent="center" alignItems="center">

                            <Typography fontSize={26}>
                                Add Lost Item
                            </Typography>


                        </Grid>
                        <Divider sx={{ borderBottomWidth: 3, py: 0 }} />
                        <Card sx={{ minHeight: 450, pt: 2, border: "0px solid", boxShadow: 0 }}>


                            <Grid container direction={'column'} spacing={2} sx={{ px: 2 }}  >

                                <Grid>
                                    <Box sx={{ textAlign: 'center', mt: 2 }} >
                                        {

                                            imageFile && (
                                                <Button className="aspect-ratio-container" variant="outlined" component="label" sx={{ height: 250, width: "100%" }}>

                                                    <img alt="tutorial"
                                                        src={`${import.meta.env.VITE_FILE_BASE_URL}${imageFile}`}>
                                                    </img>
                                                    <input hidden accept="image/*" multiple type="file" onChange={onFileChange} />
                                                </Button>

                                            )
                                        }
                                        {
                                            (!imageFile && imageError) && (



                                                <Box>
                                                    <Button className="aspect-ratio-container" variant="outlined-error" component="label" sx={{ height: 250, width: "100%" }}>

                                                        <img alt="tutorial"

                                                            src="https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png">

                                                        </img>


                                                        <input hidden accept="image/*" multiple type="file" onChange={onFileChange} />
                                                    </Button>
                                                    <Typography textAlign={"start"} fontSize={16} sx={{ color: "#d9534f", pl: 1 }}>Image is required</Typography>
                                                </Box>
                                            )
                                        }
                                        {
                                            (!imageFile && !imageError) && (

                                                <Button className="aspect-ratio-container" variant="outlined-striped" component="label" sx={{ height: 250, width: "100%" }}>

                                                    <img alt="tutorial"

                                                        src="https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png">

                                                    </img>


                                                    <input hidden accept="image/*" multiple type="file" onChange={onFileChange} />
                                                </Button>
                                            )
                                        }




                                    </Box>
                                </Grid>
                                <Grid>
                                    <Stack spacing={2} sx={{ marginTop: 2, overflow: "auto" }}>
                                        <TextField
                                            type="email"
                                            fullWidth
                                            label="E-mail Address"
                                            variant="outlined"
                                            name="email"
                                            value={formik.values.email}
                                            onChange={formik.handleChange}
                                            error={formik.touched.email && Boolean(formik.errors.email)}
                                            helperText={formik.touched.email && formik.errors.email}
                                        />
                                        <FormControl fullWidth>
                                            <InputLabel id="eventType">Category</InputLabel>
                                            <Select
                                                labelId="category"
                                                id="category-select"
                                                value={category}
                                                label="category"
                                                onChange={handleCategoryChange}
                                            >
                                                <MenuItem value={'Personal Items'}>Personal Items</MenuItem>
                                                <MenuItem value={'Electronics'}>Electronics</MenuItem>
                                                <MenuItem value={'Bags & Luggage'}>Bags & Luggage</MenuItem>
                                                <MenuItem value={'Miscellaneous'}>Miscellaneous</MenuItem>
                                            </Select>
                                        </FormControl>
                                        <TextField
                                            type="email"
                                            fullWidth
                                            label="Description"
                                            multiline
                                            rows={3}
                                            variant="outlined"
                                            name="email"
                                            value={formik.values.email}
                                            onChange={formik.handleChange}
                                            error={formik.touched.email && Boolean(formik.errors.email)}
                                            helperText={formik.touched.email && formik.errors.email}
                                        />
                                        <Box sx={{
                                            display: "flex",
                                            alignItems: "center",
                                        }}>
                                            <Grid container direction={'column'} display={'flex'} >

                                                <Grid container direction={'column'} mt={2}  >
                                                    <Grid item display={'flex'} >
                                                        <LoadingButton type="submit" loadingPosition="start" loading={loading} fullWidth variant="contained" sx={{ backgroundColor: 'primaryColor', height: 45 }} >Add Item</LoadingButton>
                                                    </Grid>
                                                    {/* <Grid item display={'flex'} >
                                    <Button fullWidth variant="contained" color="primary" href="/" startIcon={<AddIcon />} LinkComponent={Link} to="/register">Register</Button>
                                </Grid> */}



                                                </Grid>
                                                <Grid my={3}>

                                                    <Divider />

                                                </Grid>


                                            </Grid>


                                            {/* <Button sx={{ marginTop: 1, fontSize: "0.8rem" }} variant="outlined" color="primary" onClick={handleResetPasswordDialog}>Reset Password</Button> */}

                                        </Box>

                                        <Collapse in={open}>
                                            <Alert
                                                severity="error"
                                                action={
                                                    <IconButton
                                                        aria-label="close"
                                                        color="inherit"
                                                        size="small"
                                                        onClick={() => {
                                                            setOpen(false);
                                                        }}
                                                    >
                                                        <CloseIcon fontSize="inherit" />
                                                    </IconButton>
                                                }
                                            >
                                                {errorMessage}
                                            </Alert>
                                        </Collapse>
                                    </Stack>
                                </Grid>



                            </Grid>
                        </Card>







                    </CardContent>

                </Card>
            </Box>



        </Box>





    )


}

export default StaffAddItem