import React, { useEffect, useState, useContext, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom'
import { Box, Paper, Divider, Typography, Grid, Card } from '@mui/material';
import { AccessTime } from '@mui/icons-material';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { jwtDecode } from 'jwt-decode';


function StaffDashboard() {
    const squareMeasurement = 48
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
                                <Card sx={{ borderRadius: 5, width: "100%", height: 340}}>
                                    <Grid container direction={"row"}>
                                        <Grid lg={4} md={3} sm={5} sx={{ display: "flex", pt: "11%", ml: "14%" }} item>
                                            <img style={{ width: 100, height:100,marginRight: 11 }} src="https://cdn-icons-png.flaticon.com/128/6521/6521815.png" alt="" />
                                            <Divider orientation="vertical" flexItem />
                                        </Grid>

                                        <Grid lg={6} md={3} sm={5} sx={{ display: "flex", pt: "11%" }} item>
                                            <Box >

                                                <Typography sx={{ fontSize: 40, fontWeight: 'bold' }}>
                                                    Scan Attendance
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
                            <Card sx={{ borderRadius: 5, width: "100%", height: 340 }}>
                                <Grid container direction={"column"} >
                                    <Grid>
                                        {/* title */}
                                        <Typography fontSize={24} sx={{ ml: 2, mt: 2 }}>
                                            Returned Today
                                        </Typography>

                                    </Grid>
                                    <Divider sx={{ mx: 2, mr: 5, mt: 1 }} />
                                    <Grid>
                                        test
                                    </Grid>
                                </Grid>

                            </Card>
                        </Grid>

                    </Grid>



                </Grid>
            </Box>

        </>
    )
}

export default StaffDashboard