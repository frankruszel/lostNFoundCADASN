import React, { useEffect, useState, useContext, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom'
import { Box, Paper, Divider, Typography, Grid, Card, Button,Chip } from '@mui/material';
import { AccessTime } from '@mui/icons-material';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { jwtDecode } from 'jwt-decode';
import { GetItemApi } from '../api/item/GetItemApi';
import { enqueueSnackbar } from "notistack";
import dayjs from 'dayjs';
import { UpdateItemApi } from '../api/item/UpdateItemApi';


const IMAGE_BUCKET_NAME = process.env.IMAGE_BUCKET_NAME ? process.env.IMAGE_BUCKET_NAME : "prod-lostnfound-store-item-images"


function StaffDashboard() {
    const squareMeasurement = 48
    const [itemList, setItemList] = useState([])
    useEffect(() => {
        GetItemApi()
            .then((res) => {
                console.log(`res.data ITEM LIST:${JSON.stringify(res.data)}`)
                setItemList(res.data.filter((item) => item.itemStatus == "claimed"))
            }).catch((error) => {
                console.error("Error fetching Items:", error);
                enqueueSnackbar('Failed to fetch Items', { variant: "error" })
            })
    }, []);
    const [tabState, setTabState] = useState('All')

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
    return (
        <>
            <Box sx={{ mt: 10, ml: 1 }}>
                <Breadcrumbs sx={{ mb: 1, px: 4 }} >
                    {/* <Link underline="hover" style={{ textDecoration: "none", color: "grey" }} href="/">
            Overview
          </Link> */}
                    <Link
                        aria-current="page"
                        underline="hover"
                        style={{ textDecoration: "underline", color: "black" }}
                        href="/"

                    >
                        Home
                    </Link>

                </Breadcrumbs>

                <Grid container direction="column" spacing={2} sx={{ height: "100%" }} px={4}>
                    <Grid lg={6} item container direction="row" spacing={2}>
                        <Grid item lg={3} sx={{ position: "relative" }}>
                            <Card sx={{ borderRadius: 5, width: "100%", height: 170, borderRadius: 5, px: 2 }}>
                                <Grid container direction="column">
                                    <Grid container direction="row" sx={{ marginTop: 3 }}>
                                        <Grid item lg={2}>
                                            <img style={{ width: 45, marginLeft: 24, }} src="https://cdn-icons-png.flaticon.com/128/1565/1565813.png" alt="" />
                                        </Grid>
                                        <Grid item lg={9}>
                                            <Typography fontSize={22} marginTop={1} marginLeft={3}> Lost Requests </Typography>
                                        </Grid>

                                    </Grid>
                                    <Grid container sx={{
                                        position: "absolute",
                                        bottom: 10,
                                        pb: 2.4,
                                        pl: 4,
                                        pr: 9
                                    }} direction="row" display={'flex'} justifyContent={'space-between'} >
                                        <Grid>
                                            <Typography fontSize={36}>
                                                12
                                            </Typography>
                                        </Grid>
                                        <Grid sx={{ pt: 1 }}>
                                            <Link>
                                                <img style={{ width: 35, opacity: "65%" }} src="https://cdn-icons-png.flaticon.com/128/54/54382.png" alt="" />
                                            </Link>
                                        </Grid>


                                    </Grid>



                                </Grid>
                            </Card>
                        </Grid>
                        <Grid item lg={3} sx={{ position: "relative" }}>
                            <Card sx={{ borderRadius: 5, width: "100%", height: 170, borderRadius: 5, px: 2 }}>
                                <Grid container direction="column">
                                    <Grid container direction="row" sx={{ marginTop: 3 }}>
                                        <Grid item lg={2}>
                                            <img style={{ width: 45, marginLeft: 24, }} src="https://cdn-icons-png.flaticon.com/128/4426/4426201.png" alt="" />
                                        </Grid>
                                        <Grid item lg={9}>
                                            <Typography fontSize={22} marginTop={1} marginLeft={3}> Items Inventory </Typography>
                                        </Grid>

                                    </Grid>
                                    <Grid container sx={{
                                        position: "absolute",
                                        bottom: 10,
                                        pb: 2.4,
                                        pl: 4,
                                        pr: 9
                                    }} direction="row" display={'flex'} justifyContent={'space-between'} >
                                        <Grid>
                                            <Typography fontSize={36}>
                                                12
                                            </Typography>
                                        </Grid>
                                        <Grid sx={{ pt: 1 }}>
                                            <Link>
                                                <img style={{ width: 35, opacity: "65%" }} src="https://cdn-icons-png.flaticon.com/128/54/54382.png" alt="" />
                                            </Link>
                                        </Grid>


                                    </Grid>



                                </Grid>
                            </Card>
                        </Grid>
                        <Grid item lg={3} sx={{ position: "relative" }}>
                            <Card sx={{ borderRadius: 5, width: "100%", height: 170, borderRadius: 5, px: 2 }}>
                                <Grid container direction="column">
                                    <Grid container direction="row" sx={{ marginTop: 3 }}>
                                        <Grid item lg={2}>
                                            <img style={{ width: 45, marginLeft: 24, }} src="https://cdn-icons-png.flaticon.com/128/18564/18564217.png" alt="" />
                                        </Grid>
                                        <Grid item lg={9}>
                                            <Typography fontSize={22} marginTop={1} marginLeft={3}> Claim Requests </Typography>
                                        </Grid>

                                    </Grid>
                                    <Grid container sx={{
                                        position: "absolute",
                                        bottom: 10,
                                        pb: 2.4,
                                        pl: 4,
                                        pr: 9
                                    }} direction="row" display={'flex'} justifyContent={'space-between'} >
                                        <Grid>
                                            <Typography fontSize={36}>
                                                12
                                            </Typography>
                                        </Grid>
                                        <Grid sx={{ pt: 1 }}>
                                            <Link>
                                                <img style={{ width: 35, opacity: "65%" }} src="https://cdn-icons-png.flaticon.com/128/54/54382.png" alt="" />
                                            </Link>
                                        </Grid>


                                    </Grid>



                                </Grid>
                            </Card>
                        </Grid>
                        <Grid item lg={3} sx={{ position: "relative" }}>
                            <Card sx={{ borderRadius: 5, width: "100%", height: 170, borderRadius: 5, px: 2 }}>
                                <Grid container direction="column">
                                    <Grid container direction="row" sx={{ marginTop: 3 }}>
                                        <Grid item lg={2}>
                                            <img style={{ width: 45, marginLeft: 24, }} src="https://cdn-icons-png.flaticon.com/128/595/595018.png" alt="" />
                                        </Grid>
                                        <Grid item lg={9}>
                                            <Typography fontSize={22} marginTop={1} marginLeft={3}> Items Returned </Typography>
                                        </Grid>

                                    </Grid>
                                    <Grid container sx={{
                                        position: "absolute",
                                        bottom: 10,
                                        pb: 2.4,
                                        pl: 4,
                                        pr: 9
                                    }} direction="row" display={'flex'} justifyContent={'space-between'} >
                                        <Grid>
                                            <Typography fontSize={36}>
                                                12
                                            </Typography>
                                        </Grid>
                                        <Grid sx={{ pt: 1 }}>

                                            <Link>
                                                <img style={{ width: 35, opacity: "65%" }} src="https://cdn-icons-png.flaticon.com/128/54/54382.png" alt="" />
                                            </Link>
                                        </Grid>


                                    </Grid>



                                </Grid>
                            </Card>
                        </Grid>
                    </Grid>
                    <Grid lg={6} item container direction="row" spacing={2}>
                        <Grid lg={6} item>
                            <Link style={{ textDecoration: "none" }} to="/staff/list/scan">
                                <Card sx={{ borderRadius: 5, width: "100%", height: 295 }}>
                                    <Grid container direction={"row"}>
                                        <Grid lg={4} md={3} sm={5} sx={{ display: "flex", pt: "11%", ml: "14%" }} item>
                                            <img style={{ width: 100, height: 100, marginRight: 11 }} src="https://cdn-icons-png.flaticon.com/128/6521/6521815.png" alt="" />
                                            <Divider orientation="vertical" flexItem />
                                        </Grid>

                                        <Grid lg={6} md={3} sm={5} sx={{ display: "flex", pt: "11%" }} item>
                                            <Box >

                                            <Typography sx={{ fontSize: 40, fontWeight: 'bold' }}>
                                                    Scan  
                                                </Typography><Typography sx={{ fontSize: 40, fontWeight: 'bold' }}>
                                                    Item  
                                                </Typography>

                                                <Typography >

                                                </Typography>

                                            </Box>



                                        </Grid>
                                    </Grid>
                                </Card>
                            </Link>
                        </Grid>
                        <Grid item lg={6}>
                            <Card sx={{ borderRadius: 5, width: "100%",maxHeight: 340,overflow: "auto", }}>
                                <Grid container direction={"column"} >
                                    <Grid>
                                        {/* title */}
                                        <Typography fontSize={24} sx={{ ml: 2, mt: 2 }}>
                                            Returned Today
                                        </Typography>

                                    </Grid>
                                    <Divider sx={{ mx: 2, mr: 5, mt: 1 }} />
                                    <Grid>
                                        {
                                            (itemList.length > 0)
                                                ? itemList.map((item, i) => {
                                                    return (
                                                        <>
                                                            <Grid sx={{ flexGrow: 1 }} item>
                                                                <Link style={{ textDecoration: 'none' }} >

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
                                                : <> <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', mt: "05%" }}>
                                                    <Box>
                                                        <Grid sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center'}}>
                                                            <img style={{ opacity: 0.3, pt: 0 }} width="100px" src="https://cdn-icons-png.flaticon.com/128/2298/2298173.png" />
                                                        </Grid>
                                                        <Grid><Typography sx={{ fontSize: 26, opacity: 0.7, textAlign: "center", mb: 1, mt: 1 }}>There is no items</Typography></Grid>
                                                        <Grid sx={{ flexGrow: 1, display: "flex", justifyContent: "center", mt: 4 }}><Button href='/' sx={{ fontSize: 18, maxWidth: '70%', textAlign: 'center' }} fullWidth variant="claimit_primary">Explore</Button></Grid>
                                                    </Box>

                                                </Box>

                                                </>

                                        }
                                    </Grid>
                                </Grid>

                            </Card>
                        </Grid>

                    </Grid>



                </Grid >
            </Box >

        </>
    )
}

export default StaffDashboard