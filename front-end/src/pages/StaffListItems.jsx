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
import { DeleteItemApi } from '../api/item/DeleteItemApi';

const IMAGE_BUCKET_NAME = process.env.IMAGE_BUCKET_NAME ? process.env.IMAGE_BUCKET_NAME : "prod-lostnfound-store-item-images"

function StaffListItems() {
    // bookingId

    const componentRef = useRef();
    const [userList, setUserList] = useState([]);
    const [itemList, setItemList] = useState([]);
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

    const accessToken = localStorage.getItem('access_token');
    const expiresIn = localStorage.getItem('expires_in');





    function handleOpenDirectionsTab(url) {

        window.open(url, '_blank', 'noopener,noreferrer');
    }

    const handleCloseDelete = () => {
        setDeleteOpen(false);
    };
    const deleteItem = (id) => {
        console.log("delete id")
        console.log(id)
        DeleteItemApi(id).then((res) => {
            console.log(`res.data: ${JSON.stringify(res.data)}`)
            // toast.success('Form submitted successfully');
            enqueueSnackbar("Deleted item succesfully.", { variant: "success" });
            setDeleteOpen(false)

        }).catch((error) => {
            console.error("Error deleting Item:", error);
            enqueueSnackbar('Failed to delete item', { variant: "error" })

        });

    };
    const handleOpenDelete = (id) => {
        setDeleteOpen(true);
        setRowID(id)
    };
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
    useEffect(() => {
        console.log('itemchanged')
    }, [itemList]);
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

    function handleClaim(item) {
        // console.log(`handleClaim: ${JSON.stringify(item)}`)
        let newItem = {
            ...item
        }
        newItem.itemStatus = "claimed"
        console.log(`newItem: ${newItem.itemStatus}`)
        UpdateItemApi(newItem).then((res) => {
            console.log(`res.data: ${JSON.stringify(res)}`)
            // toast.success('Form submitted successfully');
            enqueueSnackbar("Claimed item succesfully.", { variant: "success" });
            GetItemApi()
                .then((res) => {
                    console.log(`res.data ITEM LIST:${JSON.stringify(res.data)}`)
                    setItemList(res.data)
                }).catch((error) => {
                    console.error("Error fetching Items:", error);
                    enqueueSnackbar('Failed to fetch Items', { variant: "error" })
                })
        }).catch((error) => {
            console.error("Error claiming Item:", error);
            enqueueSnackbar('Failed to claim item', { variant: "error" })
        });
        // CreateItemApi(data)
        //     .then((res) => {
        //         console.log(`res.data: ${JSON.stringify(res.data)}`)
        //         // toast.success('Form submitted successfully');
        //         enqueueSnackbar("Created item succesfully.", { variant: "success" });
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


                    {/* if timeslot == today then show Item options */}
                    {/* if attended show tick */}
                    {/* if not attended show QR code action */}

                    {
                        dayjs().isBefore(dayjs(params.row.timeSlot.event_StartTime))
                            ? <Button variant="uplay_secondary" onClick={() => generateQRCode(params.row)}> View Ticket</Button>
                            : dayjs().isAfter(dayjs(params.row.timeSlot.event_EndTime))
                                ? <Button variant="claimit_primary" href={`/event/${params.row.event.id}/rate/${params.row.id}`}>Rate</Button>
                                : params.row.attended
                                    ? <Button variant="claimit_primary" href={`/event/${params.row.event.id}/rate/${params.row.id}`}>{console.log("attended")}Rate</Button>
                                    : <Button variant="uplay_secondary" onClick={() => generateQRCode(params.row)}> View Ticket</Button>
                    }
                    {/* : dayjs("2024-02-29").hour(1).minute(0).second(0).isBetween(dayjs(params.row.timeSlot.event_StartTime),dayjs(params.row.timeSlot.event_EndTime)) 
                            ? <Typography>Its NOW</Typography>
                            :<Typography>so now add actions rate / Item / tick</Typography> */}
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
    const handleCompleted = () => {
        console.log("handleCompleted")
        console.log(itemList.filter((item) => item.itemStatus == "claimed"))
        setItemList(itemList.filter((item) => item.itemStatus == "claimed"))
        setTabState("Completed")
    }
    const handleAll = () => {
        GetItemApi()
            .then((res) => {
                console.log(`res.data ITEM LIST:${JSON.stringify(res.data)}`)
                setItemList(res.data)
            }).catch((error) => {
                console.error("Error fetching Items:", error);
                enqueueSnackbar('Failed to fetch Items', { variant: "error" })
            })
        setTabState("All")
    }

    const handleUpdateItem = (itemId) => {
        navigate(`/staff/list/update/${itemId}`)
    }
    if (user == null) {
        return (


            <Box px={12} >
                <Box pt={0} mt={0} sx={{ backgroundColor: "#f0f0f0", height: "150%", position: "absolute", zIndex: -1, left: 0, right: 0, top: 0 }}></Box>
                <Typography variant='h4' sx={{ py: 2 }}> </Typography>
                <Box px={10}>
                    <Card sx={{ minWidth: 600 }}>
                        <CardContent sx={{ mb: 4, px: 5, py: 5 }}>
                            <Grid container direction='row' sx={{ flexGrow: 1, display: 'flex' }} justifyContent={'space-between'}>

                                <Grid sx={{ flexGrow: 1 }} display={'flex'} justifyContent={'space-between'} >
                                    <Grid>
                                        <Tabs
                                            value={tabState}
                                            onChange={handleTabChange}
                                            textColor="secondary"

                                        >
                                            <Tab value="All" label="All" onClick={() => handleAll()} />
                                            <Tab value="Completed" label="Completed" onClick={() => handleCompleted()} />
                                        </Tabs>
                                    </Grid>
                                    <Grid >
                                        <Button alignSelf="flex-end" variant="claimit_primary" onClick={handleAddItem}  >Add Item</Button>
                                    </Grid>

                                </Grid>


                            </Grid>
                            <Divider sx={{ borderBottomWidth: 3, py: 0 }} />
                            <Dialog open={deleteOpen} onClose={handleCloseDelete}>
                                                                <DialogTitle>
                                                                    Delete item?
                                                                </DialogTitle>
                                                                <DialogContent>
                                                                    <DialogContentText>
                                                                        Are you sure you want to delete this item?

                                                                    </DialogContentText>
                                                                </DialogContent>
                                                                <DialogActions>
                                                                    <Button variant="contained" color="inherit"
                                                                        onClick={handleCloseDelete}>
                                                                        Cancel
                                                                    </Button>
                                                                    <Button variant="contained" color="error"
                                                                        onClick={() => deleteItem(rowID)}>
                                                                        Delete
                                                                    </Button>
                                                                </DialogActions>
                                                            </Dialog>
                            <Card sx={{ minHeight: 450, maxHeight: 450, overflow: "auto", pt: 2, border: "0px solid", boxShadow: 0 }}>


                                <Grid container direction={'column'} spacing={2} sx={{ px: 2 }}  >


                                    {
                                        (itemList.length > 0)
                                            ? itemList.map((item, i) => {
                                                return (
                                                    <>
                                                        <Grid sx={{ flexGrow: 1 }} item>
                                                            <Link style={{ textDecoration: 'none' }} onClick={() => handleUpdateItem(item.itemId)}>

                                                                <Paper pt={3} sx={{
                                                                    display: "flex", borderRadius: 3.5, borderBottomLeftRadius: 0, borderBottomRightRadius: 0, height: "140px", boxShadow: 2,

                                                                }} >
                                                                    <Grid container spacing={2}>
                                                                        <Grid lg={0.4} item>

                                                                        </Grid>
                                                                        <Grid item>
                                                                            {item.image_url && (
                                                                                <img style={{ paddingTop: "25%" }} height="90px" width="100px" alt="test" src={`https://${IMAGE_BUCKET_NAME}.s3.amazonaws.com/${item.image_url}`} sx={{ display: 'flex' }} />

                                                                            )}
                                                                            {
                                                                                !item.image_url && (
                                                                                    <>

                                                                                        <img alt="tutorial"
                                                                                            style={{ paddingTop: "25%" }} height="90px" width="100px" alt="test" src={`${item.image_url}`} sx={{ display: 'flex' }}
                                                                                            src="https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png" />




                                                                                    </>
                                                                                )
                                                                            }
                                                                            {/* <img style={{ paddingTop: "25%" }} height="90px" width="100px" src="https://cdn.peatix.com/event/3809236/cover-emZ6HSFyivsV6F0lkmWGmqcxSeZX87w9.jpeg" alt="" /> */}
                                                                        </Grid>
                                                                        <Grid lg={6.2} item >
                                                                            <Box sx={{ mt: 3 }}>
                                                                                <Typography sx={{ fontWeight: "bold", fontSize: 20 }}>
                                                                                    {item.title}
                                                                                </Typography>
                                                                                <Typography sx={{ fontSize: 15, color: "grey", pl: 0 }}>
                                                                                    {/* 16 January 2024 */}
                                                                                    {/* {console.log(item.timeSlot.event_StartTime)} */}
                                                                                    {dayjs(item.dateFound).format('DD MMM YYYY')}
                                                                                </Typography>
                                                                                <Typography sx={{ fontSize: 15, color: "grey", pl: 0.37 }}>
                                                                                    {item.category}
                                                                                </Typography>
                                                                            </Box>

                                                                        </Grid>
                                                                        <Grid item sx={{ flexGrow: 1, display: "flex", justifyContent: 'end', mt: 3.2, mr: 2 }}>
                                                                            {
                                                                                item.itemStatus == "claimed"
                                                                                    ? <Chip label=" Claimed" color="success" />
                                                                                    : <Chip label="Not Claimed" sx={{ backgroundColor: "#DC3545", color: "#FFFFFF" }} />
                                                                            }


                                                                        </Grid>



                                                                    </Grid>

                                                                </Paper>
                                                            </Link>
                                                            
                                                            <Paper style={{ boxShadow: "0px 3px 10px -2px rgba(0,0,0,0.2), 0px 3px 1px 1px rgba(0,0,0,0.0.3), 0px 1px 3px 3px rgba(0,0,0,0.12)" }} sx={{ borderRadius: 3.5, borderTopLeftRadius: 0, borderTopRightRadius: 0, }}>
                                                                <Grid container display={"flex"} sx={{ height: "50px", }} >
                                                                    {
                                                                        (tabState != "Completed")
                                                                        &&
                                                                        <>
                                                                            <Grid item flexGrow={0} align={'end'} pl={4} pt={1.7} >
                                                                                <a
                                                                                   onClick={() => handleOpenDelete(item.itemId)}
                                                                                    style={{ textDecoration: 'none' }} ><Typography sx={{ fontWeight: "", fontSize: 16, color: "#dc3545" }}>Delete Item</Typography></a> </Grid>
                                                                            <Grid item flexGrow={0} align={'end'} pl={4} pt={1.7} >
                                                                                <a
                                                                                    href={`/staff/list/update/${item.itemId}`}
                                                                                    //  href={`/event/${item.event.id}/rate/${item.id}/edit`} 
                                                                                    style={{ textDecoration: 'none' }} ><Typography sx={{ fontWeight: "", fontSize: 16, color: "#2F8FFF" }}>Edit Item</Typography></a> </Grid>

                                                                        </>

                                                                    }

                                                                    <Grid item flexGrow={1} align={'end'} px={3} pt={1} >
                                                                        {
                                                                            item.itemStatus == "claimed"
                                                                                ? <></>
                                                                                : <Button alignSelf="flex-end" variant="claimit_primary" onClick={() => handleClaim(item)}  >Claim</Button>

                                                                        }

                                                                    </Grid>
                                                                </Grid>
                                                            </Paper>

                                                        </Grid>
                                                    </>
                                                )
                                            })
                                            : <><Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', mt: "05%" }}>
                                                <Box>
                                                    <Grid>
                                                        <img style={{ opacity: 0.3, pt: 0 }} width="200px" src="https://cdn-icons-png.flaticon.com/128/2298/2298173.png" />
                                                    </Grid>
                                                    <Grid><Typography sx={{ fontSize: 26, opacity: 0.7, textAlign: "center", mb: 1, mt: 1, color: 'text.secondary' }}>There is no items</Typography></Grid>
                                                    <Grid sx={{ flexGrow: 1, display: "flex", justifyContent: "center", mt: 4 }}><Button href='/' sx={{ fontSize: 18, maxWidth: '70%', textAlign: 'center', backgroundColor: 'primaryColor' }} fullWidth variant="contained">Explore</Button></Grid>
                                                </Box>


                                            </Box>

                                            </>
                                    }


                                    {/* <Dialog open={qrOpen} onClose={handleCloseQR} PaperProps={{
                                        style: {

                                            maxWidth: 350, maxHeight: 700
                                        },
                                    }}>
                                        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'none', letterSpacing: 1 }}>
                                            <Typography sx={{ fontWeight: 'none', letterSpacing: 1, fontSize: 20 }}>
                                                {currentTicket?.event.title}
                                            </Typography>

                                        </DialogTitle>
                                        <Box >
                                            {currentTicket?.event.imageFile && (
                                                <img style={{ maxWidth: "100%", height: 170 }} height="100%" width="100%" alt="test" src={`${import.meta.env.VITE_FILE_BASE_URL}${currentTicket?.event.imageFile}`} sx={{ display: 'flex' }} />

                                            )}
                                        </Box>
                                        <DialogContent sx={{ pt: 0, mt: 0 }}>

                                            <DialogContentText>
                                                {imageQR
                                                    ?
                                                    <>
                                                        <a href={imageQR} download style={{ justifyContent: 'center', display: 'flex', flexGrow: 1 }}><img src={imageQR} alt="" style={{ width: "60%" }} /></a>
                                                        <Button sx={{ mt: 3 }} fullWidth variant='claimit_primary' onClick={() => handleSendEmailQR(imageQR)}>Send</Button>
                                                    </>
                                                    : <Typography>Something went wrong with the Ticket</Typography>
                                                }

                                            </DialogContentText>
                                        </DialogContent>
                                        <DialogActions>


                                        </DialogActions>
                                    </Dialog> */}
                                </Grid>
                            </Card>
                            {/* <Box sx={{ maxWidth: "100%", pt: 2 }} >
                                <Box flexDirection="column" pb={1}>
                                    <Grid container direction={"row"}  >
                                        <Grid item lg={6}>
                                            <Box flexDirection="column" sx={{ display: "flex", alignItems: "start" }}>



                                            </Box>
                                        </Grid>



                                    </Grid>

                                    <Box flexDirection="column" sx={{ display: "flex", alignItems: "end" }}>


                                        <Box sx={{}}>



                                        </Box>
                                    </Box>
                                </Box>

                                <div ref={componentRef}>
                                    <Box sx={{
                                        width: "100%",
                                        "& .MuiDataGrid-root": {
                                            border: "solid",
                                            borderColor: "#d3d3d3 "
                                        },
                                        "& .MuiDataGrid-cell": {
                                            borderBottom: "none",
                                        },

                                        "& .MuiDataGrid-columnHeaders": {
                                            backgroundColor: "#FFFFF",
                                            borderBottom: "solid",
                                            borderBottomColor: "#d3d3d3"
                                        },

                                        "& .MuiDataGrid-footerContainer": {
                                            borderTop: "solid",
                                            borderTopColor: "#d3d3d3",
                                            backgroundColor: "#FFFFF",
                                        },
                                        "& .MuiDataGrid-columnHeaderTitle": {
                                            color: "#E8533F",
                                        },
                                        "& .MuiDataGrid-menuIconButton": {
                                            color: "#FFFFFF",
                                        },
                                        "& .MuiTablePagination-displayedRows ": {
                                            color: "#FFFFFF",
                                        },
                                        "& .MuiIconButton-root ": {
                                            color: "#FFFFFF",
                                        },
                                        "& .MuiDataGrid-virtualScroller": {
                                            borderColor: "#FFFFF",
                                            borderStyle: "inset"
                                        },
                                        //    MuiDataGrid-virtualScroller
                                    }}>
                                        <DataGrid
                                            rows={rows}
                                            columns={columns}
                                            initialState={{
                                                pagination: {
                                                    paginationModel: {
                                                        pageSize: 5,
                                                    },
                                                },
                                            }}
                                            pageSizeOptions={[5]}
                                            disableRowSelectionOnClick
                                        />
                                    </Box>
                                </div>

                            </Box> */}







                        </CardContent>

                    </Card>
                </Box>



            </Box>





        )
    }

}

export default StaffListItems