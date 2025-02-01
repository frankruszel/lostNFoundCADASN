import React, { useEffect, useState, useContext, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom'
import { Box, TextField, Button, Autocomplete as AutocompleteMUI, Chip, Stack, Checkbox, CardContent, IconButton, InputBase, Paper, Divider, Typography, Grid, Card } from '@mui/material';
import { AccessTime, CalendarTodayRounded, Favorite, FavoriteBorder, LocationOn, Clear, Room, KeyboardArrowDown } from '@mui/icons-material';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { jwtDecode } from 'jwt-decode';
import SearchIcon from '@mui/icons-material/Search';
import DepartureBoardIcon from '@mui/icons-material/DepartureBoard';
import CalendarToday from '@mui/icons-material/CalendarToday';
import { useUserContext } from '../contexts/UserContext';
import DatePicker, { DateObject } from "react-multi-date-picker";
import Toolbar from "react-multi-date-picker/plugins/toolbar";
import CategoryIcon from '@mui/icons-material/Category';



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

        sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: '52.5%', height: "65px", position: "absolute", borderRadius: 3, mx: 'auto', left: 0, right: 0, top: 102 }}
      >
        <IconButton type="button" sx={{ pl: '20px', pt: "10px" }} aria-label="search"
        // onClick={onClickSearch}
        >
          <SearchIcon />
        </IconButton>
        <AutocompleteMUI
          freeSolo
          id="free-solo-2-demo"
          inputProps={{ 'aria-label': 'search google maps' }}
          sx={{
            ml: 1, flex: 1, "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
              border: "0px solid #eee"
            }, "& .MuiAutocomplete-inputFocused": { border: "0px solid #eee" }, '& .MuiOutlinedinput-inputFocused': { border: "0px solid #eee" }, '& .Mui-focused': { border: "0px solid #eee" },
            "& .MuiOutlinedInput-root": { border: "0px solid #eee" }, "& .MuiInputBase-root-MuiOutlinedInput": { border: "0px solid #eee" }, "& .MuiInput-underline:after": {
              border: "0px solid #eee"
            }, "& .MuiOutlinedInput-root": {
              "&.Mui-focused fieldset": {
                border: "0px solid #eee"
              }
            }
          }}
          style={{ border: "0px solid #eee" }}
          // placeholder=""
          // options={eventListForAutocomplete.map((option) => option.title)}
          // value={search}
          // onChange={onSearchChange}
          // onKeyDown={onSearchKeyDown}
          // onClick={onClickSearch}
          disableClearable

          renderInput={(params) => (
            <TextField
              {...params}
              sx={{ '& MuiInputBase-fullWidth ': { border: "0px solid #eee" }, '& .Mui-focused': { border: "0px solid #eee" }, "& .MuiOutlinedInput-root": { border: "0px solid #eee" } }}

            />
          )}

        />
        <IconButton type="button" sx={{ p: '10px' }}
        // onClick={onClickClear}
        >
          <Clear />
        </IconButton>
        <Divider sx={{ height: 34, m: 0.5 }} orientation="vertical" />


        <DatePicker
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
        />

        {/* 
        <Divider sx={{ height: 34, mr: 0.2 }} orientation="vertical" />
        <IconButton color="primary" sx={{ p: '10px' }} aria-label="directions" onClick={() => { }
          // handleOpenLocationMap()
        }>
          <Room /><Typography color={'black'} pr={1} sx={{ pt: '10px', pb: '10px', pl: 1 }}>Date</Typography><KeyboardArrowDown />
        </IconButton> */}


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

        <Grid item xs={12} md={6} lg={3} sx={{ height: 330, mb: 2 }} >

          {/* <Box sx={{
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
              Duration
            </Typography>

          </Box> */}


          <Link to={`/event/`} style={{ textDecoration: 'none' }}>





            <Card sx={{ borderColor: '#D3D3D3', borderStyle: 'solid', borderWidth: 0.3, height: 400, borderRadius:4 }}>
                          
              <Box className="aspect-ratio-container" sx={{ borderColor: '#D3D3D3', borderBottomStyle: 'solid', borderWidth: 0.3 }}>



                <img alt="test" src="https://avionrx.blob.core.windows.net/avalon/74444e4c-0331-418a-bf7b-87043a002c0b?v=20231017064750" sx={{ display: 'flex' }}
                />







              </Box>




              <CardContent sx={{ pb: 0, pt: 1, mb:10 }}>
                <Box sx={{ display: 'flex', mb: 1 }}>


                  <Typography sx={{ flexGrow: 1, fontSize: 20, fontWeight: 'bold', letterSpacing: 0.4 }} noWrap>
                    title

                  </Typography>


                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.3 }}
                  color="text.secondary">
                  <CategoryIcon sx={{ mr: 1 }} />
                  <Typography>
                    Category
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.3 }}
                  color="text.secondary">
                  <CalendarToday sx={{ mr: 1 }} />


                  <Typography>Multiple Dates</Typography>


                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center'}}
                  color="text.secondary" >
                  <LocationOn sx={{ mr: 1 }} />

                  <Typography noWrap>
                    location
                  </Typography>
                </Box>
                


              </CardContent>
              
              <Grid justifySelf={'end'} container direction={'row'} display={'flex'} justifyContent={'space-between'} px={3}  >
                <Grid item lg={12}>
                  <Button sx={{wdith:"100%", height:50, borderRadius:4, backgroundColor:'primaryColor'}} variant='contained' fullWidth >
                    Claim
                  </Button>
                </Grid>



              </Grid>



            </Card>
          </Link>



          {/* <Checkbox
            checked={true}
            onChange={(change) => { }}
            sx={{ position: "relative", left: '81%', bottom: "19%" }}
            icon={<FavoriteBorder
              style={{ fontSize: '2rem' }} />}
            checkedIcon={<Favorite style={{ fontSize: '2rem' }} />} /> */}
          {/* 
                                        </>
                                    )
                                } */}


          {/* maybe put outside and absoultely position it */}
          {/* <Checkbox icon={<FavoriteBorder />} checkedIcon={<Favorite />} /> */}
        </Grid>

        <Grid>
          <Card>
            <Typography>
              test
            </Typography>
          </Card>
        </Grid>
      </Grid>


    </>
  )
}

export default Homepage