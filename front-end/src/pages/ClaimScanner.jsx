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
import { QrReader } from "react-qr-reader";

function ClaimScanner() {
    // bookingId

    const componentRef = useRef();

    const [userList, setUserList] = useState([]);
    const [itemList, setItemList] = useState([{

        event: {
            imageFile: "https://i.ibb.co/4R8WzBs/ecowise.png",
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
    const [webcamResult, setWebcamResult] = useState()

    const accessToken = localStorage.getItem('access_token');
    const expiresIn = localStorage.getItem('expires_in');





    function handleOpenDirectionsTab(url) {

        window.open(url, '_blank', 'noopener,noreferrer');
    }


    const handleMultipleCalendarClick = (ticketInfo) => {
        console.log(ticketInfo)
        // dayjs(myTimeslotObj.event_StartTime).toISOString()
        var myEventInfo = {
            'kind': 'calendar#event',
            'summary': `${JSON.stringify(ticketInfo.event.title)}`,
            'location': `${JSON.stringify(ticketInfo.event.location)}`,
            'description': `${JSON.stringify(ticketInfo.event.details)}`,
            'start': {
                'dateTime': `${dayjs(ticketInfo.timeSlot.event_StartTime).toISOString()}`,
                'timeZone': 'UTC'
            },
            'end': {
                'dateTime': `${dayjs(ticketInfo.timeSlot.event_StartTime).toISOString()}`,
                'timeZone': 'UTC'
            },
            'recurrence': [
                'RRULE:FREQ=DAILY;COUNT=1'
            ],
            'attendees': [
                { 'email': 'fruszels@gmail.com', 'responseStatus': 'needsAction' },
            ],
            'reminders': {
                'useDefault': false,
                'overrides': [
                    { 'method': 'email', 'minutes': 24 * 60 },
                    { 'method': 'popup', 'minutes': 10 }
                ]
            },
            "guestsCanSeeOtherGuests": true,
        }


    };


    const from = location.state?.from?.pathname || "/";
    useEffect(() => {
        GetItemApi()
            .then((res) => {
                console.log(`res.data ITEM LIST:${JSON.stringify(res.data)}`)
                setItemList(res.data)
            }).catch((error) => {
                console.error("Error fetching Items:", error);
                enqueueSnackbar('Failed to fetch Items', { variant: "error" })
            })
    }, []);
    const handleTabChange = (event, newValue) => {

    };

    const generateQRCode = async (ticketInfo) => {
        // console.log(JSON.parse(JSON.stringify(myNewInfo)))
        // console.log("test")
        // console.log(ticketInfo)
        var myNewInfo = {
            companyId: ticketInfo.event.companyID,
            ticketId: ticketInfo.id,
            eventId: ticketInfo.event.id,
            timeSlotId: ticketInfo.timeSlot.id
        }
        console.log(myNewInfo)
        const image = await qrcode.toDataURL(JSON.stringify(myNewInfo))
        setImageQR(image);
        setCurrentTicket(ticketInfo);
        setQrOpen(true)
    }

    function handleCloseQR() {
        setQrOpen(false)
    }
    function handleSendEmailQR(imageQR) {
        console.log('sending email')
        // EmailService/TicketQR/{user.email}
        var data = {}
        data.imageQR = imageQR
        // http.post(`/TicketQR/${user.email}`, data)
        //     .then((res) => {
        //         toast.success("Emai has been sent!")


        //     });

    }


    const columns = [
        { field: 'id', headerName: 'ID', width: 50 },


        {
            field: 'event',
            headerName: 'Event',
            width: 180,
            editable: false,
            renderCell: (params) => (
                <div>

                    {params.row.event.title}
                </div>
            ),
        },



        // {
        //     field: 'createdAt',
        //     headerName: 'Created At',
        //     width: 110,
        //     editable: false,
        // },
        {
            field: 'purchased_Price',
            headerName: 'Price',
            width: 110,
            editable: false,
            width: 90,
            renderCell: (params) => (
                <div>

                    $ {params.row.purchased_Price.toFixed(2)}


                </div>
            ),
        },
        {
            field: 'Date',
            headerName: 'Date',

            width: 120,
            renderCell: (params) => (
                <div>

                    {dayjs(params.row.timeSlot.event_StartTime).format('DD MMM YYYY')}
                </div>
            ),
            textAlign: 'right',
        },
        // dayjs(params.row.timeSlot.event_StartTime).format('h:mm A')
        {
            field: 'Time',
            headerName: 'Time',

            width: 140,
            renderCell: (params) => (
                <div>

                    {dayjs(params.row.timeSlot.event_StartTime).format('h:mm A')} - {dayjs(params.row.timeSlot.event_EndTime).format('h:mm A')}
                </div>
            ),
            textAlign: 'right',
        },
        {
            field: 'attended',
            headerName: 'Attended',

            width: 80,
            renderCell: (params) => (
                <div style={{ display: 'flex', flexGrow: 1, justifyContent: 'center' }}>


                    {
                        params.row.attended
                            ? <img width="23px" src="data:image/webp;base64,UklGRn4EAABXRUJQVlA4WAoAAAAQAAAAfwAAfwAAQUxQSA4DAAANkERt2/E4b/OPbddtktruGKtiFdS2zZ1tDGrbtm0ntd1mzD9d8X2ftLueiJgA+m9rTRmtzs/T34tyvuV+s1pf2h1KQGx8tJZ+6OXv6a/VhljPHD/91TFEtjWXod/opo9OaP5i4/q36JwNnfT0+zV1zKb7q7aUAHMxj6I/rSR1arggPR+U0mc4sSw7pMXsNBVRvQXENmJcowEX4PjMrE2cay+8OyIbS50MYq7p0aP7TSQdexJ/7aqN82AoqS4k0W2qWz8Vg+sqktorpX0+Ap8tJLd1L3OWPLctJDluqLFAmrKKZMf2bVciLJWkt0rpL6sfye/1PV1SzQ4AaN7KG3K8lhNCt1U9ssTMJoyVu4+S0qAmCOp5+6IMZTGh1MwfpIroQzjr1c2Q4DoUCI2bWSigGyGNSlzFz3kwFBo1q4SdgbBWqLuVXWcw1HE1twg9mpTb75l1ILSKaT0zAxwybeIVUBZPvSc2VnGEV2l2mlU8IIo/wao5opjTnDSVEemtdkZlCLGH/xtGOkikszCqjElrZRSAKeArI29M3tl/UV4Oz/HneEHK5pTt/a/3JRDSV06PK0GycrLoIFk4vQx2B5T7jZP9kQ6QhVifiQZ0mteJeEDHeZ2K1sBRz/P6+qIOnKvEfJMJziZu68wKmJIt3N4+SARzhNiv7AxmFb/NdStBeXqDnzp3GJQpJHBFSiSQ18clFM4aC2QCiUyt2xDG1Vsy7AMWaEDYB5DQqzd6gEglscO76yE8WiYnp+sqdwAFHUnwnRWzAfQn0amleolbTML7xhuE7Tomzd6xU7Kok6kkvqht/zhBJ+YSwCxjV6OYnekEsbBLbC8hi48RSLVf/hIPAQWjiwnn6gUrq7GzdCSo97t27qlhpaYtJ7A5I64ubMTo+kACfH1AzfGRTF5NvE6Q1Yzp0eO0DJ7P3U+wizZOq9kpWfkj6uFV1wh6ydZVd42mespvUq9u2kwO8N2GTU+aJUTrPX4h7+GZ42fJYdpOHz9jCdRp/bz9vCjHlm2zWL+Qw/3+ymK1Zdty6L+PAVZQOCBKAQAAsAwAnQEqgACAAD7dbq9Qv6ckoqgY+SvwG4ljbuDAAGV5TFYAcRtgOec02anyiFQnm1eZtFYGsZpb8e2fn4HI4/dB3xrxSIWsKUWsbZWPbXoOdgxjNshWePwTtmzNDY0Wn1at3NTb1X+D3tmymAAA/mvzAPOR/ZPOlOqZUnV6LkSJ5bxpWhI7tFLmGsD9aiXay+wxw1mhkPdAE2319yzBcbxQRP+c3C0kalgku38wlNxjkYQl4ZMKo9oUI9p9lPwcC9oQMLE5mZFW2bHCxthP0dJK/0HE6ut/hw40AlSzdUX3812tybcq3gAGSD3iDeSy0rVv39RXyNJVmfqur+Q74Duz+rArAV/EFyBEvgkWA0P5e9Z5UWEfURIouRxUL4jEwHVd0vt0czTzaQXlK82gBUiv1KT/Gf/kOHNRESOHDeOQrVYz6noAAAAA" alt="" />
                            : <><><img width="23px" src="data:image/webp;base64,UklGRpoEAABXRUJQVlA4WAoAAAAQAAAAfwAAfwAAQUxQSA4DAAANkERt2/E4b/OPbddtktruGKtiFdS2zZ1tDGrbtm0ntd1mzD9d8X2ftLueiJgA+m9rTRmtzs/T34tyvuV+s1pf2h1KQGx8tJZ+6OXv6a/VhljPHD/91TFEtjWXod/opo9OaP5i4/q36JwNnfT0+zV1zKb7q7aUAHMxj6I/rSR1arggPR+U0mc4sSw7pMXsNBVRvQXENmJcowEX4PjMrE2cay+8OyIbS50MYq7p0aP7TSQdexJ/7aqN82AoqS4k0W2qWz8Vg+sqktorpX0+Ap8tJLd1L3OWPLctJDluqLFAmrKKZMf2bVciLJWkt0rpL6sfye/1PV1SzQ4AaN7KG3K8lhNCt1U9ssTMJoyVu4+S0qAmCOp5+6IMZTGh1MwfpIroQzjr1c2Q4DoUCI2bWSigGyGNSlzFz3kwFBo1q4SdgbBWqLuVXWcw1HE1twg9mpTb75l1ILSKaT0zAxwybeIVUBZPvSc2VnGEV2l2mlU8IIo/wao5opjTnDSVEemtdkZlCLGH/xtGOkikszCqjElrZRSAKeArI29M3tl/UV4Oz/HneEHK5pTt/a/3JRDSV06PK0GycrLoIFk4vQx2B5T7jZP9kQ6QhVifiQZ0mteJeEDHeZ2K1sBRz/P6+qIOnKvEfJMJziZu68wKmJIt3N4+SARzhNiv7AxmFb/NdStBeXqDnzp3GJQpJHBFSiSQ18clFM4aC2QCiUyt2xDG1Vsy7AMWaEDYB5DQqzd6gEglscO76yE8WiYnp+sqdwAFHUnwnRWzAfQn0amleolbTML7xhuE7Tomzd6xU7Kok6kkvqht/zhBJ+YSwCxjV6OYnekEsbBLbC8hi48RSLVf/hIPAQWjiwnn6gUrq7GzdCSo97t27qlhpaYtJ7A5I64ubMTo+kACfH1AzfGRTF5NvE6Q1Yzp0eO0DJ7P3U+wizZOq9kpWfkj6uFV1wh6ydZVd42mespvUq9u2kwO8N2GTU+aJUTrPX4h7+GZ42fJYdpOHz9jCdRp/bz9vCjHlm2zWL+Qw/3+ymK1Zdty6L+PAVZQOCBmAQAAUA0AnQEqgACAAD7dbqxQP6ckIqgWCivwG4lAGpjD55X+ov6zpO295570Abyr6AHS75F0XQS2JUQt82rT2g5Amu+JOfZBKMmL5+22ZBU7beoqMjKTXFGL4TdoK1EUeJLuQS86DnM75jIgdDFQ3K6ETnn4AAD+9jx7BY7X8K0pfxInrT1drvSg9nPz5zaicx+eb5X8T3n1boq2hCD437CnJKELKUriKpso1EG8JI/1ov8hFst/jh9DKdso9o62AEMU5NtnRaxoZ5it5g+nuXovQbhsbIXqgAPABA87firgZGIkl+WrQWNI2Q9fSIdkWTTZAPqgoD/Ekm5pLqMLtADwcfw1+qSk9/bBChKf2Lstvsr9kNZRRvSN26IXRX83wbVQIDS6SzhuS67n6jcbdOih3McfdeB1oAaLdkZS0WmjWQFlYf+xv9ztf//EHgADFhZmSWgGn++gcrLmLd7/ceUELXAAAAAAAA==" alt="" /></></>
                    }
                </div>
            ),

        },
        {
            field: 'actions',
            headerName: 'Actions',

            width: 150,
            renderCell: (params) => (
                <div>


                    {/* if timeslot == today then show attendance options */}
                    {/* if attended show tick */}
                    {/* if not attended show QR code action */}

                    {
                        dayjs().isBefore(dayjs(params.row.timeSlot.event_StartTime))
                            ? <Button variant="uplay_secondary" onClick={() => generateQRCode(params.row)}> View Ticket</Button>
                            : dayjs().isAfter(dayjs(params.row.timeSlot.event_EndTime))
                                ? <Button variant="uplay_primary" href={`/event/${params.row.event.id}/rate/${params.row.id}`}>Rate</Button>
                                : params.row.attended
                                    ? <Button variant="uplay_primary" href={`/event/${params.row.event.id}/rate/${params.row.id}`}>{console.log("attended")}Rate</Button>
                                    : <Button variant="uplay_secondary" onClick={() => generateQRCode(params.row)}> View Ticket</Button>
                    }
                    {/* : dayjs("2024-02-29").hour(1).minute(0).second(0).isBetween(dayjs(params.row.timeSlot.event_StartTime),dayjs(params.row.timeSlot.event_EndTime)) 
                            ? <Typography>Its NOW</Typography>
                            :<Typography>so now add actions rate / attendance / tick</Typography> */}
                </div>
            ),
            textAlign: 'right',
        },
    ];

    const rows = itemList;
    const handleAddItem = () => {
        console.log("handleAddItem")
        navigate("/staff/list/add")
    }
    const webCamError = (error) => {
        if (error) {
            console.log(error);
        }
    }
    const webcamScan = (result) => {
        if (result) {
            setWebcamResult(result)

        }
    }

    return (
        <Grid container direction="column" sx={{}} >
            <Grid item lg={12} sx={{ flexGrow: 1, alignContent: 'center' }}>
                <Box sx={{ ml: "30%" }} width="500px
            " height="500px">
                    <QrReader
                        delay={1000}
                        onError={webCamError}
                        onScan={webcamScan}
                        legacyMode={false}
                        facingMode='user'
                    />
                </Box>
                <Typography>{webcamResult}</Typography>
            </Grid>
        </Grid>


    )
}



export default ClaimScanner