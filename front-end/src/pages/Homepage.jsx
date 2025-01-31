import React, { useEffect, useState, useContext, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom'
import { Box, Chip, Stack, Checkbox, CardContent, IconButton, InputBase, Paper, Divider, Typography, Grid, Card } from '@mui/material';
import { AccessTime, Favorite, FavoriteBorder, LocationOn, Clear, Room, KeyboardArrowDown } from '@mui/icons-material';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { jwtDecode } from 'jwt-decode';
import SearchIcon from '@mui/icons-material/Search';
import DepartureBoardIcon from '@mui/icons-material/DepartureBoard';
import CalendarToday from '@mui/icons-material/CalendarToday';
import { useUserContext } from '../contexts/UserContext';


function Homepage() {
  const { user, RefreshUser } = useUserContext()
  const [categorySelected, setCategorySelected] = useState('All Activities')

  const handleCategoryChange = (e) => {
    if (e != categorySelected) {
        setCategorySelected(e)
    }
    else {
        setCategorySelected('All Activities')
    }

};
  return (
    <>
      <Paper

        sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: '52.5%', height: "58px", position: "absolute", borderRadius: 3, mx: 'auto', left: 0, right: 0, top: 102 }}
      >
        <IconButton type="button" sx={{ pl: '20px', pt: "10px" }} aria-label="search"
        // onClick={onClickSearch}
        >
          <SearchIcon />
        </IconButton>
        <InputBase
          sx={{ ml: 1, flex: 1 }}
          placeholder=""
          inputProps={{ 'aria-label': 'search google maps' }}
        // value={search}
        // onChange={onSearchChange}
        // onKeyDown={onSearchKeyDown}
        // onClick={onClickSearch}
        />
        <IconButton type="button" sx={{ p: '10px' }}
        // onClick={onClickClear}
        >
          <Clear />
        </IconButton>
        <Divider sx={{ height: 34, m: 0.5 }} orientation="vertical" />


        {/* <DatePicker
          // value={dateRangeValues}
          // onChange={setDateRangeValues}

          multiple
          range
          // onClose={handleOnCloseDateRange}
          plugins={[

            <Toolbar position="bottom" sort={["", "deselect", "close"]} names={{
              today: "",
              deselect: "Reset",
              close: "Close"
            }} />
          ]}



          render={<IconButton >
            <CalendarTodayRounded color="primary" sx={{ pt: '10px', pb: '10px', pl: 1 }} /><Typography color={'black'} sx={{ pl: 1.4, pr: 1 }}>When</Typography> <KeyboardArrowDown />
          </IconButton>}
        /> */}


        <Divider sx={{ height: 34, mr: 0.2 }} orientation="vertical" />
        <IconButton color="primary" sx={{ p: '10px' }} aria-label="directions" onClick={() => { }
          // handleOpenLocationMap()
        }>
          <Room /><Typography color={'black'} pr={1} sx={{ pt: '10px', pb: '10px', pl: 1 }}>Location</Typography><KeyboardArrowDown />
        </IconButton>


      </Paper>
      <Typography sx={{ textAlign: 'center', fontSize: '42px', pb: 3, ml: 5 }}>{categorySelected}</Typography>
      <Grid container direction="column" alignItems={"center"} justifyContent={"center"} >
        <Stack direction="row" spacing={2}>
          {/* <Chip label="All Activities" onClick variant="uplay_primary" sx={{}} /> */}
          {/* <Chip label="Dine & Wine" onClick variant="uplay_secondary" sx={{}} /> */}
          { }
          {/* if a true then 'a' else 'd' */}
          {/* a === true ? 'a' : 'd' */}
          <Chip label="Dine & Wine" onClick={() => handleCategoryChange("Dine & Wine")} variant={categorySelected === 'Dine & Wine' ? "uplay_primary" : "uplay_secondary"} sx={{}} />
          <Chip label="Family Bonding" onClick={() => handleCategoryChange("Family Bonding")} variant={categorySelected === 'Family Bonding' ? "uplay_primary" : "uplay_secondary"} sx={{}} />
          <Chip label="Hobbies & Wellness" onClick={() => handleCategoryChange("Hobbies & Wellness")} variant={categorySelected === 'Hobbies & Wellness' ? "uplay_primary" : "uplay_secondary"} sx={{}} />
          <Chip label="Sports & Adventure" onClick={() => handleCategoryChange("Sports & Adventure")} variant={categorySelected === 'Sports & Adventure' ? "uplay_primary" : "uplay_secondary"} sx={{}} />
          <Chip label="Travel" onClick={() => handleCategoryChange("Travel")} variant={categorySelected === 'Travel' ? "uplay_primary" : "uplay_secondary"} sx={{}} />
        </Stack>
      </Grid>


      <Grid container spacing={4} px={10} mb={10}>

        <Grid item xs={12} md={6} lg={4} sx={{ height: 330 }} >

          <Box sx={{
            color: "#FFFFFF",
            opacity: 1,
            position: 'relative',

            top: "13%",
            zIndex: 10,
            left: "72%",
            display: 'table',
            margin: 0,
            padding: 0,


            background: 'rgba(0, 0, 0, 0.7)',
            opacity: 1,
            borderRadius: 3,
            height: 28,
            pr: 1.5,
            pl: 1,






          }}>

            <DepartureBoardIcon fontSize="20px" sx={{ pr: 0.7, pt: 0.85, }} />

            <Typography sx={{ display: "inline", verticalAlign: '07%' }} fontSize={15} textAlign={"center"}>
              23
            </Typography>

          </Box>



          <Link to={`/event/}`} style={{ textDecoration: 'none' }}>





            <Card sx={{ borderColor: '#D3D3D3', borderStyle: 'solid', borderWidth: 0.3 }}>

              <Box sx={{ borderColor: '#D3D3D3', borderBottomStyle: 'solid', borderWidth: 0.3, minHeight: 300 }}>
                test
                {/* {event.imageFile && (
                  <img alt="test" src={`${import.meta.env.VITE_FILE_BASE_URL}${event.imageFile}`} sx={{ display: 'flex' }}
                  />
                )} */}









              </Box>




              <CardContent sx={{ pb: 0, pt: 1 }}>
                <Box sx={{ display: 'flex', mb: 1 }}>


                  <Typography sx={{ flexGrow: 1, fontSize: 20, fontWeight: 'bold', letterSpacing: 0.4 }} noWrap>
                    test

                  </Typography>


                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.3 }}
                  color="text.secondary">
                  <CalendarToday sx={{ mr: 1 }} />




                  <Typography>Multiple Dates</Typography>


                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.3 }}
                  color="text.secondary" >
                  <LocationOn sx={{ mr: 1 }} />

                  <Typography noWrap>
                    testlocation
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                  color="text.secondary">
                  <AccessTime sx={{ mr: 1 }} />
                  <Typography>
                    12:00pm to 1:00pm
                  </Typography>
                </Box>


              </CardContent>
              <Grid container sx={{ px: 2.5, display: "flex" }}>
                <Grid item>


                  <Typography sx={{ pb: 1, fontSize: 28 }}>$23</Typography>


                </Grid>


              </Grid>



            </Card>
          </Link>


          <Checkbox
            checked={null}
            // onChange={(change) => handleFavoriteChange({ checked: change.target.checked, event: event })}
            sx={{ position: "relative", left: '81%', bottom: "19%" }}
            icon={<FavoriteBorder
              style={{ fontSize: '2rem' }} />}
            checkedIcon={<Favorite style={{ fontSize: '2rem' }} />} />

        </Grid>
      </Grid>


    </>
  )
}

export default Homepage