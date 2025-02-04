import React, { useState, useEffect, useRef } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Paper, Tabs, Tab, Dialog, Input, DialogTitle, Card, DialogContent, Avatar, CardContent, Divider, DialogContentText, DialogActions, Button, Typography, Box, IconButton, Chip, Grid } from '@mui/material';
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

import {
    BrowserQRCodeReader,
    NotFoundException,
    ChecksumException,
    FormatException
} from "@zxing/library";
function ClaimScanner() {
    // bookingId

    const [webcamResult, setWebcamResult] = useState()
    const [result, setResult] = useState("");

    function handleClaim(item) {
        // console.log(`handleClaim: ${JSON.stringify(item)}`)
        let newItem = {
            ...item
        }
        newItem.itemStatus = "claimed"
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

                }
                else {
                    console.log("ITEM NOT BEEN CLAIMEDCLAIMED")

                    UpdateItemApi(newItem).then((res) => {
                        console.log(`res.data: ${JSON.stringify(res)}`)
                        // toast.success('Form submitted successfully');

                        enqueueSnackbar("Claimed item succesfully.", { variant: "success" });

                    }).catch((error) => {
                        console.error("Error claiming Item:", error);
                        enqueueSnackbar('Failed to claim item', { variant: "error" })
                    });
                }
            }).catch((error) => {
                console.error("Error fetching Items:", error);
                enqueueSnackbar('Failed to fetch Items', { variant: "error" })
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
                    handleClaim(newItemData)
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


    );
}



export default ClaimScanner