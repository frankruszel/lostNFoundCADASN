import React, { useState, useEffect, useRef } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Paper, Tabs, Tab, Dialog, Input, DialogTitle, Card, Stack, TextField, FormControl, InputLabel, Select, MenuItem, DialogContent, Avatar, CardContent, Divider, DialogContentText, DialogActions, Button, Typography, Box, IconButton, Chip, Grid } from '@mui/material';
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
import { enqueueSnackbar } from "notistack";
import { GetItemApi } from '../api/item/GetItemApi';
import { UpdateItemApi } from '../api/item/UpdateItemApi';
import { useZxing } from "react-zxing";
import { useUserContext } from '../contexts/UserContext';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker as DatePickerMui } from '@mui/x-date-pickers/DatePicker';
import LoadingButton from '@mui/lab/LoadingButton';

import {
    BrowserQRCodeReader,
    NotFoundException,
    ChecksumException,
    FormatException
} from "@zxing/library";

const IMAGE_BUCKET_NAME = process.env.IMAGE_BUCKET_NAME ? process.env.IMAGE_BUCKET_NAME : "prod-lostnfound-store-item-images"
const categoryList = ["Personal Belongings", "Electronics", "Health", "Recreational", "Miscellaneous"]


function ClaimScanner() {
    // bookingId
    const { user, accessToken, refreshToken, RefreshUser, SessionRefreshError, DeleteUser } = useUserContext();
    const [loading, setLoading] = useState(false);

    const [webcamResult, setWebcamResult] = useState()
    const [result, setResult] = useState("");
    const [itemDialog, setItemDialog] = useState(false);
    const [currentItem, setCurrentItem] = useState({
        "itemStatus": "lost",
        "dateFound": "2025-02-09T01:56:21.286Z",
        "dateClaimed": null,
        "userId_CreatedBy": "testUser",
        "updatedAt": "2025-02-09T01:56:38.354Z",
        "category": "Recreational",
        "createdAt": "2025-02-09T01:56:38.354Z",
        "itemId": "862e6d7e-6de4-4afd-aa9a-a9223153728d",
        "image_url": "footgball.jpeg",
        "description": "My description",
        "title": "Soccer Ball"
    })

    const handleItemDialogClose = () => {
        setItemDialog(false);
    }
    const handleItemDialogOpen = (item) => {

        setItemDialog(true);
        setCurrentItem(item)
    }
    function handleClaim(item) {
        // console.log(`handleClaim: ${JSON.stringify(item)}`)
        setLoading(true)
        let newItem = {
            ...item
        }
        newItem.itemStatus = "claimed"
        newItem.userId_HandledClaim = user.Username
        console.log(`newItem: ${newItem.itemStatus}`)

        GetItemApi()
            .then((res) => {
                let myItemId = res.data.filter((item) => item.itemId == newItem.itemId)[0]
                console.log(`after filter function`)
                console.log(myItemId)
                if (myItemId.itemStatus == "claimed") {
                    console.log("ITEM HAS BEEN CLAIMED")
                    console.log(`item already claimed`)
                    enqueueSnackbar('item already claimed', { variant: "error" })
                    setLoading(false)

                }
                else {
                    console.log("ITEM NOT BEEN CLAIMEDCLAIMED")

                    UpdateItemApi(newItem).then((res) => {
                        console.log(`res.data: ${JSON.stringify(res)}`)
                        // toast.success('Form submitted successfully');
                        setCurrentItem(res.updatedData)
                        
                        enqueueSnackbar("Claimed item succesfully.", { variant: "success" });
                        setLoading(false)
                    }).catch((error) => {
                        console.error("Error claiming Item:", error);
                        enqueueSnackbar('Failed to claim item', { variant: "error" })
                        setLoading(false)
                    });
                }
            }).catch((error) => {
                console.error("Error fetching Items:", error);
                enqueueSnackbar('Failed to fetch Items', { variant: "error" })
                setLoading(false)
            })

        // CreateItemApi(data)
        //     .then((res) => {
        //         console.log(`res.data: ${JSON.stringify(res.data)}`)
        //         // toast.success('Form submitted successfully');
        //         enqueueSnackbar("Created item succesfully.", { variant: "success" });
    }
    function isValidJSON(jsonString) {
        try {
            JSON.parse(jsonString);
            return true;
        } catch (error) {
            return false;
        }
    }


    const [selectedDeviceId, setSelectedDeviceId] = useState("");
    const [code, setCode] = useState("");
    const [videoInputDevices, setVideoInputDevices] = useState([]);
    const [success, setSuccess] = useState(false)

    const updateFunction = (result) => {
        console.log(success)
        setSuccess(true)
        if (success != true) {
            console.log(`result: ${result}`)
            console.log("UpdateAPI")

        }

    }


    const codeReader = new BrowserQRCodeReader()
    console.log("ZXing code reader initialized");

    useEffect(() => {
        codeReader
            .getVideoInputDevices()
            .then(videoInputDevices => {
                setupDevices(videoInputDevices);
            })
            .catch(err => {
                console.error(err);
            });
    }, []);
    useEffect(() => {
        console.log("sucess changed")
        console.log(success)
    }, [success]);
    useEffect(() => {
        console.log("currentItem changed")
    }, [itemDialog]);

    function setupDevices(videoInputDevices) {
        const sourceSelect = document.getElementById("sourceSelect");

        // selects first device
        setSelectedDeviceId(videoInputDevices[0].deviceId);

        // setup devices dropdown
        if (videoInputDevices.length >= 1) {
            setVideoInputDevices(videoInputDevices)
        }
    }

    function resetClick() {
        codeReader.reset();
        setCode("");
        console.log("Reset.");
    }

    function decodeContinuously(selectedDeviceId) {
        codeReader.timeBetweenDecodingAttempts = 1500;
        codeReader.decodeFromInputVideoDeviceContinuously(
            selectedDeviceId,
            "video",
            (result, err) => {
                if (result) {
                    // properly decoded qr code
                    console.log("Found QR code!", result);
                    setCode(result.text);
                    setSuccess(true);
                    console.log(`validJSON: ${isValidJSON(result)}`)
                    console.log(JSON.parse(result.text))
                    updateFunction(JSON.parse(result.text))
                    // handleClaim(newItemData)
                    let newItem = JSON.parse(result.text)
                    let newItemData = {
                        itemId: newItem.itemId,
                        itemStatus: 'claimed'
                    }
                    // handleClaim(newItemData)
                    setCurrentItem(newItem)
                    setItemDialog(true)
                    codeReader.stopContinuousDecode();
                }

                if (err) {
                    setCode("");

                    // As long as this error belongs into one of the following categories
                    // the code reader is going to continue as excepted. Any other error
                    // will stop the decoding loop.
                    //
                    // Excepted Exceptions:
                    //
                    //  - NotFoundException
                    //  - ChecksumException
                    //  - FormatException

                    if (err instanceof NotFoundException) {
                        console.log("No QR code found.");
                    }

                    if (err instanceof ChecksumException) {
                        console.log("A code was found, but it's read value was not valid.");
                    }

                    if (err instanceof FormatException) {
                        console.log("A code was found, but it was in a invalid format.");
                    }
                }
            }
        );
    }

    useEffect(
        deviceId => {
            decodeContinuously(selectedDeviceId);
            console.log(`Started decode from camera with id ${selectedDeviceId}`);
        },
        [selectedDeviceId]
    );

    return (
        <>
            <Dialog open={itemDialog} onClose={handleItemDialogClose} disableScrollLock sx={{ position: "fixed" }} >
                <Box backgroundColor="primaryColor" minHeight={100} minWidth={300} >
                <Typography color="white" sx={{ fontSize: 26, opacity: 0.7, textAlign: "center", mb: 1, mt: 1, pt:1 }}>
ItemId:
                </Typography>
                <Typography color="white" sx={{ fontSize: 26, opacity: 0.7, textAlign: "center", mb: 1, mt: 1 }}>
{currentItem.itemId}
                </Typography>
                </Box>
                <Box >

                    <Card sx={{ minHeight: 450, minWidth: 300, border: "0px solid", boxShadow: 0, p: 10 }} >


                        <Grid container direction={'column'} spacing={2} sx={{ px: 2 }}  >

                            <Grid>
                                <Box sx={{ textAlign: 'center' }} >


                                    {
                                        currentItem.image_url && (
                                            <>
                                                <Button className="aspect-ratio-container" variant="outlined-striped" component="label" sx={{ height: 250, width: "100%" }}>
                                                    <img alt="tutorial"

                                                        src={`https://${IMAGE_BUCKET_NAME}.s3.amazonaws.com/${currentItem.image_url}`}>

                                                    </img>

                                                </Button>
                                            </>
                                        )
                                    }

                                </Box>
                            </Grid>
                            <Grid>
                                <Stack spacing={2} sx={{ marginTop: 2, overflow: "auto" }}>
                                    <TextField
                                        type="string"
                                        fullWidth
                                        label="Title"
                                        variant="filled"
                                        value={currentItem.title}
                                        disabled
                                    />
                                    <Grid container direction={'row'} display={'flex'} >
                                        <Grid lg={5.75}>
                                            <FormControl fullWidth margin="dense" sx={{ position: 'relative', bottom: 7 }}>
                                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                    <DatePickerMui format="DD/MM/YYYY"
                                                        label="Date Lost"
                                                        name="date"
                                                        value={dayjs(currentItem.dateFound)}
                                                        disabled
                                                        variant="filled"
                                                    />
                                                </LocalizationProvider>
                                            </FormControl>
                                        </Grid>
                                        <Grid lg={0.5}>

                                        </Grid>
                                        <Grid lg={5.75}>
                                            <FormControl fullWidth>
                                                <InputLabel id="eventType">Category</InputLabel>
                                                <Select
                                                    labelId="category"
                                                    id="category-select"
                                                    value={currentItem.category}
                                                    label="category"
                                                    disabled
                                                    variant="filled"
                                                >
                                                    {
                                                        categoryList.map((category, i) => {
                                                            return <MenuItem value={category}>{category}</MenuItem>
                                                        })
                                                    }

                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    </Grid>

                                    <TextField
                                        type="string"
                                        fullWidth
                                        label="Description"
                                        multiline
                                        rows={3}
                                        variant="filled"
                                        name="Description"
                                        value={currentItem.description}
                                    />
                                    <Box sx={{
                                        display: "flex",
                                        alignItems: "center",
                                    }}>
                                        <Grid container direction={'column'} display={'flex'} >

                                            <Grid container direction={'column'} mt={2}  >
                                                <Grid item display={'flex'} >
                                                    <LoadingButton
                                                        loading={loading}
                                                         loadingPosition="start" onClick={()=> handleClaim(currentItem)} fullWidth variant="claimit_primary" 
                                                         disabled={currentItem.itemStatus != "claimed" ? false : true}
                                                         >
                                                        Claim
                                                    </LoadingButton>
                                                </Grid>
                                                {/* <Grid item display={'flex'} >
                            <Button fullWidth variant="contained" color="primary" href="/" startIcon={<AddIcon />} LinkComponent={Link} to="/register">Register</Button>
                        </Grid> */}



                                            </Grid>


                                        </Grid>


                                        {/* <Button sx={{ marginTop: 1, fontSize: "0.8rem" }} variant="outlined" color="primary" onClick={handleResetPasswordDialog}>Reset Password</Button> */}

                                    </Box>
                                </Stack>
                            </Grid>



                        </Grid>
                    </Card>









                </Box>
            </Dialog>
            <Grid display={'flex'} >
                <Grid item>
                    <div id="sourceSelectPanel">
                        <label for="sourceSelect">Change video source:</label>

                    </div>

                </Grid>
                <Grid item>
                    <div>
                        <video id="video" width="600" height="700" />
                    </div>

                    <label>Result:</label>
                    <pre>
                        <code id="result">{code}</code>
                    </pre>

                    <button id="resetButton" onClick={() => resetClick()}>
                        Reset
                    </button>
                </Grid>



            </Grid>
        </>



    );
}



export default ClaimScanner