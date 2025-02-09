import React, { useEffect, useState, useContext, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom'
import { Box, Backdrop, TextField, Dialog, DialogTitle, DialogActions, DialogContentText, DialogContent, InputLabel, FormControl, MenuItem, Select, Button, Autocomplete as AutocompleteMUI, Chip, Stack, Checkbox, CardContent, IconButton, InputBase, Paper, Divider, Typography, Grid, Card } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
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
import { GetItemApi } from '../api/item/GetItemApi';
import dayjs from 'dayjs';
import { enqueueSnackbar } from "notistack";
import qrcode from "qrcode";
import * as tf from '@tensorflow/tfjs';
import * as sentenceEncoder from "@tensorflow-models/universal-sentence-encoder";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import LoadingButton from '@mui/lab/LoadingButton';
import Collapse from '@mui/material/Collapse';
import Alert from '@mui/material/Alert';
import CloseIcon from '@mui/icons-material/Close';
import { DatePicker as DatePickerMui} from '@mui/x-date-pickers/DatePicker';


const model = sentenceEncoder.load()
const categoryList = ["Personal Belongings", "Electronics", "Health", "Recreational", "Miscellaneous"]


const getSimilarity = async (mainString, stringListToCompare) => {
  return model.then((model) => model.embed([mainString, ...stringListToCompare])).then((res) => {


    let embeddings = res.unstack()
    let semanticDict = {}
    let closestMatch = null
    let smallestSemanticCloseness = 100
    for (let i = 1; i < embeddings.length; i++) {
      let semanticCloseness = tf.losses.cosineDistance(embeddings[0], embeddings[i], 0).dataSync()[0]
      semanticDict[stringListToCompare[i - 1]] = { "Name": stringListToCompare[i - 1], "ClosenessDistance": semanticCloseness }
      if (semanticCloseness < smallestSemanticCloseness) {
        smallestSemanticCloseness = semanticCloseness
        closestMatch = semanticDict[stringListToCompare[i - 1]]
      }
    }
    // closer distance for cosine MEANNS ===== more similar (close to the meaning)
    let returnItem = {
      "bestMatch": closestMatch,
      "rankings": semanticDict
    }
    console.log(`returnItem:`)
    console.log(returnItem)
    return returnItem
  }


  );

}

function sortItemsByBestMatch(itemList, bestMatchData) {
  const { rankings } = bestMatchData;

  // Create a mapping of item titles to their closeness distance
  const distanceMap = Object.fromEntries(
    Object.entries(rankings).map(([key, value]) => [value.Name, value.ClosenessDistance])
  );

  // Sort the item list based on the closeness distance, if available
  return itemList.sort((a, b) => {
    const distanceA = distanceMap[a.title] ?? Infinity;
    const distanceB = distanceMap[b.title] ?? Infinity;
    return distanceA - distanceB;
  });
}

const IMAGE_BUCKET_NAME = process.env.IMAGE_BUCKET_NAME ? process.env.IMAGE_BUCKET_NAME : "prod-lostnfound-store-item-images"
console.log(`IMAGE_BUCKET_NAME:${IMAGE_BUCKET_NAME}`)
const categoryArray = ["Personal Belongings", "Electronics", "Health", "Recreational", "Miscellaneous"]

function Homepage() {
  const { user, RefreshUser } = useUserContext()
  const [categorySelected, setCategorySelected] = useState('All Items')
  const [itemList, setitemList] = useState([])
  const [mainItemList, setMainItemList] = useState([])
  const [itemListForAutoComplete, setItemListForAutoComplete] = useState([])
  const [currentItem, setCurrentItem] = useState({
    "itemStatus": "lost",
    "dateFound": "2025-02-09T01:56:21.286Z",
    "dateClaimed": null,
    "userId": "testUser",
    "updatedAt": "2025-02-09T01:56:38.354Z",
    "image_labels": [
        {
            "Instances": [],
            "Aliases": [],
            "Confidence": 100,
            "Categories": [
                {
                    "Name": "Sports"
                }
            ],
            "Name": "Ball",
            "Parents": []
        },
        {
            "Instances": [],
            "Aliases": [],
            "Confidence": 100,
            "Categories": [
                {
                    "Name": "Sports"
                }
            ],
            "Name": "Football",
            "Parents": [
                {
                    "Name": "Sport"
                }
            ]
        },
        {
            "Instances": [
                {
                    "Confidence": 98.69540405273438,
                    "BoundingBox": {
                        "Height": 0.8122726678848267,
                        "Left": 0.08943954110145569,
                        "Top": 0.09587734937667847,
                        "Width": 0.8199071884155273
                    }
                }
            ],
            "Aliases": [],
            "Confidence": 100,
            "Categories": [
                {
                    "Name": "Sports"
                }
            ],
            "Name": "Soccer Ball",
            "Parents": [
                {
                    "Name": "Ball"
                },
                {
                    "Name": "Football"
                },
                {
                    "Name": "Soccer"
                },
                {
                    "Name": "Sport"
                }
            ]
        }
    ],
    "category": "Recreational",
    "createdAt": "2025-02-09T01:56:38.354Z",
    "itemId": "862e6d7e-6de4-4afd-aa9a-a9223153728d",
    "image_url": "footgball.jpeg",
    "description": "My description",
    "title": "Soccer Ball"
}
)
  const [imageQR, setImageQR] = useState();
  const [qrOpen, setQrOpen] = useState(false)
  const [dateRangeValues, setDateRangeValues] = useState([])
  const [init, setInit] = useState(false)
  const [search, setSearch] = useState('');
  const [currentSearch, setCurrentSearch] = useState('');
  const [relevantItems, setRelevantItems] = useState([]);
  const [isRelevantItems, setIsRelevantItems] = useState(false);
  const [itemDialog, setItemDialog] = useState(false);
    const [loading, setLoading] = useState(false);


  const handleOnCloseDateRange = () => {
    // algorithm to put all dates
    // then backend split dates
    // then backend chec whether it has dates
    let dateRange = dateRangeValues
    if (dateRange.length > 1) {
      console.log(dateRange)
      var allDates = []

      if (dateRange.length > 1) {
        var startDate = new Date(dateRange[0]);
        var endDate = new Date(dateRange[1]);
        if (startDate < endDate) {
          for (let currentLoopItem = startDate; currentLoopItem <= endDate; currentLoopItem.setDate(currentLoopItem.getDate() + 1)) {
            // console.log(`current loopitem:${currentLoopItem}`)
            allDates.push(new Date(currentLoopItem).toISOString())

          }
        }
        else {
          // console.log("this is same")
          allDates.push(startDate.toISOString())
        }


      }
      else {
        // only 1 value
        var startDate = new Date(dateRange[0]);
        allDates.push(startDate.toISOString())
      }

      console.log(`allDates:${allDates}`)
      if (allDates.length > 0) {
        let startDate = allDates[0]
        let endDate = allDates[allDates.length - 1]

        console.log(`endDate:${endDate}`)
        console.log(categorySelected)


        if (categorySelected == 'All Items') {
          let allItems = mainItemList
          //   let testData = allItems.map((item) => new Date(item.dateFound))
          //  for (let i = 0; i < testData.length; i++) {
          //   console.log(testData[i] )
          //   console.log(new Date("2022-01-01"))
          //    if (testData[i] >= new Date(startDate)) {
          //      console.log("date is greater or equal to than startDate")
          //    }
          //  }
          allItems = allItems.filter((item) => new Date(item.dateFound).getDate() >= new Date(startDate).getDate() && new Date(item.dateFound).getDate() <= new Date(endDate).getDate())
          setitemList(allItems)
          console.log(`allItems:${JSON.stringify(allItems)}`)
        }
        else {
          let filteredItemList = mainItemList.filter((item) => item.category == categorySelected)
          // allDates = [startDate,endDate]
          filteredItemList = filteredItemList.filter((item) => new Date(item.dateFound).getDate() >= new Date(startDate).getDate() && new Date(item.dateFound).getDate() <= new Date(endDate).getDate())
          setitemList(filteredItemList)
          console.log(`filteredItemList:${JSON.stringify(filteredItemList)}`)
        }
      }
    } else if (dateRange.length == 1) {
      // only 1 value
      var startDate = new Date(dateRange[0]);
      var endDate = new Date(dateRange[0]);
      if (categorySelected == 'All Items') {
        let allItems = mainItemList
        allItems = allItems.filter((item) => new Date(item.dateFound).getDate() >= new Date(startDate).getDate() && new Date(item.dateFound).getDate() <= new Date(endDate).getDate())
        setitemList(allItems)
        console.log(`allItems:${JSON.stringify(allItems)}`)
      }
      else {
        let filteredItemList = mainItemList.filter((item) => item.category == categorySelected)
        // allDates = [startDate,endDate]
        filteredItemList = filteredItemList.filter((item) => new Date(item.dateFound).getDate() >= new Date(startDate).getDate() && new Date(item.dateFound).getDate() <= new Date(endDate).getDate())
        setitemList(filteredItemList)
        console.log(`filteredItemList:${JSON.stringify(filteredItemList)}`)
      }
    }
    else {
      console.log("dont have anything in daterange")
      if (categorySelected == 'All Items') {
        let allItems = mainItemList
        setitemList(allItems)
      }
      else {
        let filteredItemList = mainItemList.filter((item) => item.category == categorySelected)
        setitemList(filteredItemList)
      }
    }


  };

  useEffect(() => {
    dateRangeValues.forEach((date, index) => {

      dateRangeValues[index] = new Date(date);


    });

    console.log(`I changed my dateRange: ${dateRangeValues}`)
  }, [dateRangeValues]);

  const generateQRCode = async (itemInfo) => {
    // console.log(JSON.parse(JSON.stringify(myNewInfo)))
    // console.log("test")
    // console.log(ticketInfo)
    console.log(itemInfo)
    var myNewInfo = {
      itemId: itemInfo.itemId,
      title: itemInfo.title,
      category: itemInfo.category,
      description: itemInfo.description,
    }
    console.log(myNewInfo)
    const image = await qrcode.toDataURL(JSON.stringify(myNewInfo))
    setImageQR(image);
    setCurrentItem(myNewInfo);
    setQrOpen(true)
  }
  function handleCloseQR() {
    setQrOpen(false)
  }
  const handleCategoryChange = (e) => {
    if (e != categorySelected) {
      setCategorySelected(e)
      // sort the list

    }
    else {
      setCategorySelected('All Items')
      // getEvents
    }

  };


  useEffect(() => {
    // getEvents();
    // filter list
    // This list is not good cause the date
    if (categorySelected == "All Items") {
      let allItems = mainItemList
      setitemList(allItems)
    }
    else {
      let filteredItemList = mainItemList.filter((item) => item.category == categorySelected)
      setitemList(filteredItemList)
    }


  }, [categorySelected]);

  const searchEvents = () => {
    console.log(`search GET EVENTS: ${search}`)
    setCurrentSearch(search);
    console.log(`currentSearch:${currentSearch}`)
    GetItemApi()
      .then((res) => {
        // console.log(`res.data:${JSON.stringify(res.data)}`)
        res.data = res.data.filter((item) => item.itemStatus != "claimed")
        let itemList = res.data
        console.log("getSimilarity below:")
        let itemListNameOnly = itemList.map((item) => item.title)
        console.log(itemListNameOnly)
        if (search != '') {
          getSimilarity(search, itemListNameOnly).then((res) => {
            console.log(`similarity:`)
            console.log(res)
            console.log(`clsoestname:`)
            let SortedRelevance = sortItemsByBestMatch(itemList, res)
            setIsRelevantItems(true)
            console.log(SortedRelevance)
            setRelevantItems(SortedRelevance)

            // Clothing
            // Electronics
            // Stationery
            // Jewelry
            // Wallet or ID

          }).catch((error) => {
            console.error("Error auto suggesting item:", error);
            enqueueSnackbar('Failed to auto suggesting item', { variant: "error" })
          })
        } else {
          setIsRelevantItems(false)
        }

        let filteredItemList = itemList.filter((item) => item.title.toLowerCase().includes(search.toLowerCase()));
        // console.log(`filteredItemList:${JSON.stringify(filteredItemList)}`)
        console.log(`searchValue: ${search}`)

        setitemList(filteredItemList)
      }).catch((error) => {
        if (error.response.status != 404) {
          console.error("Error fetching Items:", error);
          enqueueSnackbar('Failed to fetch Items', { variant: "error" })
        }
        setInit(true)

      })
  };
  const onSearchKeyDown = (e) => {
    if (e.key === "Enter") {

    }
  };
  const onSearchChange = (e) => {
    if (typeof e.target.value !== 'number') {
      console.log(`NTO NUMBER: onSearchChange fn: ${e.target.value}`)
      setSearch(e.target.value);
    } else {
      console.log(`NUMBER: onSearchChange fn: ${e.target.textContent}`)
      setSearch(e.target.textContent);
    }

  };

  const onClickSearch = () => {
    searchEvents();
  }
  useEffect(() => {


    searchEvents()
  }, [search])
  useEffect(() => {
    GetItemApi()
      .then((res) => {
        // console.log(`res.data:${JSON.stringify(res.data)}`)
        res.data = res.data.filter((item) => item.itemStatus != "claimed")
        setMainItemList(res.data)
        setInit(true)
        setitemList(res.data)
        setItemListForAutoComplete(res.data)
      }).catch((error) => {
        if (error.response.status != 404) {
          console.error("Error fetching Items:", error);
          enqueueSnackbar('Failed to fetch Items', { variant: "error" })
        }
        setInit(true)

      })
  }, [])



  function handleSendEmailQR(imageQR) {
    console.log('sending email')
    // EmailService/TicketQR/{user.email}
    var data = {}
    data.imageQR = imageQR


  }
  const onClickClear = () => {
    setSearch('');
    searchEvents();
  };

  const handleItemDialogClose = () => {
    setItemDialog(false);
  }
  const handleItemDialogOpen = (item) => {
    
    setItemDialog(true);
    setCurrentItem(item)
  }
  return (
    <>
      <Dialog open={itemDialog} onClose={handleItemDialogClose}   disableScrollLock sx={{position:"fixed"}} >

        <Box >                

            <Card sx={{ minHeight: 450,minWidth:300, border: "0px solid", boxShadow: 0, p:10 }} >


              <Grid container direction={'column'} spacing={2} sx={{ px: 2 }}  >

                <Grid>
                  <Box sx={{ textAlign: 'center'}} >

                    
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
                              type="submit" loadingPosition="start" loading={loading} fullWidth variant="contained" sx={{ backgroundColor: 'primaryColor', height: 45 }} >
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
      <Dialog open={qrOpen} onClose={handleCloseQR} PaperProps={{
        style: {

          maxWidth: 350, maxHeight: 700
        },
      }}>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'none', letterSpacing: 1 }}>
          <Typography sx={{ fontWeight: 'none', letterSpacing: 1, fontSize: 20 }}>
            {currentItem?.title}
          </Typography>

        </DialogTitle>
        <Box >
          {currentItem?.image_url && (
            <img style={{ maxWidth: "100%", height: 170 }} height="100%" width="100%" alt="test" src={`https://${IMAGE_BUCKET_NAME}.s3.amazonaws.com/${currentItem.image_url}`} sx={{ display: 'flex' }} />

          )}
        </Box>
        <DialogContent sx={{ pt: 0, mt: 0 }}>

          <DialogContentText>
            {imageQR
              ?
              <>
                <a href={imageQR} download style={{ justifyContent: 'center', display: 'flex', flexGrow: 1 }}><img src={imageQR} alt="" style={{ width: "60%" }} /></a>
                {user && user.email
                  ? <Button sx={{ mt: 3 }} fullWidth variant='claimit_primary' onClick={() => handleSendEmailQR(imageQR)}>Send</Button>
                  : <Button sx={{ mt: 3 }} fullWidth variant='claimit_primary' disable>Send</Button>
                }

              </>
              : <Typography>Something went wrong with the Ticket</Typography>
            }

          </DialogContentText>
        </DialogContent>
        <DialogActions>


        </DialogActions>
      </Dialog>
      <Box ml={-8.5}>


        <Paper

          sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: '52.5%', height: "65px", position: "absolute", borderRadius: 3, mx: 'auto', left: 0, right: 0, top: 102 }}
        >
          <IconButton type="button" sx={{ pl: '20px', pt: "10px" }} aria-label="search"
            onClick={onClickSearch}
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
            placeholder=""
            options={itemListForAutoComplete.map((option) => option.title)}
            value={search}
            onChange={onSearchChange}
            onKeyDown={onSearchKeyDown}
            onClick={onClickSearch}
            disableClearable

            renderInput={(params) => (
              <TextField
                {...params}
                sx={{ '& MuiInputBase-fullWidth ': { border: "0px solid #eee" }, '& .Mui-focused': { border: "0px solid #eee" }, "& .MuiOutlinedInput-root": { border: "0px solid #eee" } }}

              />
            )}

          />
          <IconButton type="button" sx={{ p: '10px' }}
            onClick={onClickClear}
          >
            <Clear />
          </IconButton>
          <Divider sx={{ height: 34, m: 0.5 }} orientation="vertical" />


          <DatePicker
            value={dateRangeValues}
            onChange={setDateRangeValues}
            // multiple
            range



            onClose={handleOnCloseDateRange}
            plugins={[

              <Toolbar position="bottom" sort={["", "deselect", "close"]} names={{
                today: "",
                deselect: "Reset",
                close: "Close"
              }} />
            ]}



            render={<IconButton >
              <CalendarTodayRounded color="primary" sx={{ pt: '10px', pb: '10px', pl: 1, fontSize: 42 }} /><Typography color={'black'} sx={{ pl: 0.3, pr: 1 }}>When</Typography> <KeyboardArrowDown />
            </IconButton>}
          />


        </Paper>

        <Typography sx={{ textAlign: 'center', fontSize: '42px', pb: 1.5, mt: -0.5 }} color="black">{categorySelected}</Typography>

        <Grid container direction="row" alignItems={"center"} justifyContent={"center"}
          px={23}

        >

          <Grid mb={3}>
            <Stack direction="row" spacing={2}>
              {
                categoryArray.map((category, index) => {
                  return (
                    <Chip label={`${category}`} onClick={() => handleCategoryChange(`${category}`)} variant={categorySelected === `${category}` ? "claimit_primary" : "claimit_secondary"} sx={{}} />

                  )
                })
              }
              ``            </Stack>
          </Grid>


        </Grid>


        <Grid container spacing={4} px={10} mb={10} ml={8.5} >

          {/* start grid  */}
          {
            init === false && (
              <>
                <Backdrop
                  sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                  open={true}

                >

                  <Paper sx={{ background: 'rgba(14,65,148, 0.4)', p: 6, borderRadius: 2, alignContent: 'center', alignItems: 'center', }}>
                    <Box sx={{ display: "flex", flexGrow: 1, textAlign: 'center', justifyContent: "center", mb: 3 }}>
                      <CircularProgress sx={{ color: "#ffffff", }} />
                    </Box>
                    <Typography sx={{ color: 'black', textAlign: 'center', letterSpacing: 2 }}>
                      Please wait <br />
                      it might take a few seconds
                    </Typography>
                  </Paper>
                </Backdrop>
              </>
            )


          }
          {
            (itemList.length > 0)
              ? itemList.map((item, i) => {
                return (
                  <>

                    <Grid item xs={12} md={6} lg={3.5} sx={{ height: 330, mb: 10 }} >


                      <Link style={{ textDecoration: 'none' }} onClick={() => handleItemDialogOpen(item)}>





                        <Card sx={{ position: "relative", borderColor: '#D3D3D3', borderStyle: 'solid', borderWidth: 0.3, minHeight: 390, maxHeight: 390, borderRadius: 4 }}>

                          <Box sx={{ borderColor: '#D3D3D3', borderBottomStyle: 'solid', borderWidth: 0.3, justifyContent: "center", display: "flex", alignItems: "center", height: "100%" }}>


                            {
                              item.image_url && (
                                <>
                                  <img alt="test" src={`https://${IMAGE_BUCKET_NAME}.s3.amazonaws.com/${item.image_url}`}
                                    style={{ display: 'flex', minHeight: 185, maxHeight: 185 }}
                                  />
                                </>
                              )
                            }
                            {
                              !item.image_url && (
                                <>
                                  <img alt="test" src="data:image/jpeg;base64,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"
                                    style={{ display: 'flex', minHeight: 185, maxHeight: 185 }}
                                  />
                                </>
                              )
                            }








                          </Box>




                          <CardContent sx={{ pb: 0, pt: 1 }}>
                            <Box sx={{ display: 'flex', mb: 1 }}>


                              <Typography sx={{ flexGrow: 1, fontSize: 24, fontWeight: 'bold', letterSpacing: 0.4 }} noWrap>
                                {item.title}

                              </Typography>


                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}
                              color="text.secondary">
                              <CategoryIcon sx={{ mr: 1 }} />
                              <Typography>
                                {item.category}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}
                              color="text.secondary">
                              <CalendarToday sx={{ mr: 1 }} />


                              <Typography>{dayjs(item.dateFound).format('DD/MM/YYYY')}</Typography>


                            </Box>



                          </CardContent>

                          <Grid sx={{
                            position: "absolute",
                            bottom: 0,
                            pb: 2.4
                          }} justifySelf={'end'} container direction={'row'} display={'flex'} justifyContent={'space-between'} px={3}  >
                            <Grid item lg={12}>
                              <Button sx={{ wdith: "100%", height: 50, borderRadius: 4, }} variant='claimit_primary' fullWidth
                                onClick={() => generateQRCode(item)}
                              >
                                Claim
                              </Button>
                            </Grid>



                          </Grid>



                        </Card>
                      </Link>





                    </Grid>


                  </>
                )
              })
              : <>
                {
                  init === false
                    ? (
                      <>


                      </>
                    )
                    : <>
                      <Grid container direction={'column'} >


                        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', mt: "05%", ml: -15 }}>
                          <Box>
                            <Grid>
                              <img style={{ opacity: 0.3, pt: 0 }} width="200px" src="https://cdn-icons-png.flaticon.com/128/2298/2298173.png" />
                            </Grid>
                            <Grid><Typography sx={{ fontSize: 26, opacity: 0.7, textAlign: "center", mb: 1, mt: 1, color: 'text.secondary' }}>There is no items</Typography></Grid>
                            <Grid sx={{ flexGrow: 1, display: "flex", justifyContent: "center", mt: 4, ml: -2 }}><Button href='/home' sx={{ fontSize: 18, maxWidth: '70%', textAlign: 'center', backgroundColor: 'primaryColor' }} fullWidth variant="contained">Explore</Button></Grid>
                          </Box>

                        </Box>

                      </Grid>




                    </>
                }


              </>
          }

          {/* end grid */}
        </Grid>
        <Grid>
          {
            isRelevantItems == true && relevantItems?.length > 0 &&
            <>
              <Box>
                <Typography color="black" px={24} fontSize={30} pt={2} pb={1}>
                  Relevant Items:
                </Typography>
              </Box>
            </>
          }
          {
            isRelevantItems == true && relevantItems?.length > 0
              ? <>


                <Grid container spacing={4} px={10} mb={10} ml={8.5} >
                  {
                    (itemList.length > 0)
                      ? relevantItems.slice(1).map((item, i) => {
                        return (
                          <>
                            <Grid item xs={12} md={6} lg={3.5} sx={{ height: 330, mb: 10 }} >


                              <Link style={{ textDecoration: 'none' }}>





                                <Card sx={{ position: "relative", borderColor: '#D3D3D3', borderStyle: 'solid', borderWidth: 0.3, minHeight: 390, maxHeight: 390, borderRadius: 4 }}>

                                  <Box sx={{ borderColor: '#D3D3D3', borderBottomStyle: 'solid', borderWidth: 0.3, justifyContent: "center", display: "flex", alignItems: "center", height: "100%" }}>


                                    {
                                      item.image_url && (
                                        <>
                                          <img alt="test" src={`https://${IMAGE_BUCKET_NAME}.s3.amazonaws.com/${item.image_url}`}
                                            style={{ display: 'flex', minHeight: 185, maxHeight: 185 }}
                                          />
                                        </>
                                      )
                                    }
                                    {
                                      !item.image_url && (
                                        <>
                                          <img alt="test" src="data:image/jpeg;base64,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"
                                            style={{ display: 'flex', minHeight: 185, maxHeight: 185 }}
                                          />
                                        </>
                                      )
                                    }








                                  </Box>




                                  <CardContent sx={{ pb: 0, pt: 1 }}>
                                    <Box sx={{ display: 'flex', mb: 1 }}>


                                      <Typography sx={{ flexGrow: 1, fontSize: 24, fontWeight: 'bold', letterSpacing: 0.4 }} noWrap>
                                        {item.title}

                                      </Typography>


                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}
                                      color="text.secondary">
                                      <CategoryIcon sx={{ mr: 1 }} />
                                      <Typography>
                                        {item.category}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}
                                      color="text.secondary">
                                      <CalendarToday sx={{ mr: 1 }} />


                                      <Typography>{dayjs(item.dateFound).format('DD/MM/YYYY')}</Typography>


                                    </Box>



                                  </CardContent>

                                  <Grid sx={{
                                    position: "absolute",
                                    bottom: 0,
                                    pb: 2.4
                                  }} justifySelf={'end'} container direction={'row'} display={'flex'} justifyContent={'space-between'} px={3}  >
                                    <Grid item lg={12}>
                                      <Button sx={{ wdith: "100%", height: 50, borderRadius: 4, }} variant='claimit_primary' fullWidth
                                        onClick={() => generateQRCode(item)}
                                      >
                                        Claim
                                      </Button>
                                    </Grid>



                                  </Grid>



                                </Card>
                              </Link>




                            </Grid>
                          </>
                        )
                      })
                      : <>
                        {
                          relevantItems.map((item, i) => {
                            return (
                              <>
                                <Grid item xs={12} md={6} lg={3.5} sx={{ height: 330, mb: 10 }} >


                                  <Link style={{ textDecoration: 'none' }}>





                                    <Card sx={{ position: "relative", borderColor: '#D3D3D3', borderStyle: 'solid', borderWidth: 0.3, minHeight: 390, maxHeight: 390, borderRadius: 4 }}>

                                      <Box sx={{ borderColor: '#D3D3D3', borderBottomStyle: 'solid', borderWidth: 0.3, justifyContent: "center", display: "flex", alignItems: "center", height: "100%" }}>


                                        {
                                          item.image_url && (
                                            <>
                                              <img alt="test" src={`https://${IMAGE_BUCKET_NAME}.s3.amazonaws.com/${item.image_url}`}
                                                style={{ display: 'flex', minHeight: 185, maxHeight: 185 }}
                                              />
                                            </>
                                          )
                                        }
                                        {
                                          !item.image_url && (
                                            <>
                                              <img alt="test" src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxITEhUTExMWFRUVGBcaFxgYGBUXFxgXFxcWFxYVFRUYHSggGBolHRYVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGxAQGi8lHyUyLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAQMAwgMBIgACEQEDEQH/xAAcAAABBQEBAQAAAAAAAAAAAAADAgQFBgcAAQj/xABGEAABAwIDBAYGBwYFAwUAAAABAAIRAyEEEjEFQVFhBiJxgZGxEzJyocHRByNCUmKy8BQzNIKS4RUkQ1PxJcLSFhdEc6L/xAAaAQADAQEBAQAAAAAAAAAAAAACAwQBAAUG/8QALhEAAgIBAwIFAwMFAQAAAAAAAAECEQMSITEEQRMiMlFhcYHRkaGxFGLB8PEj/9oADAMBAAIRAxEAPwCj9H3uDiYlu9Tb7uCj9g5TRzT6s/rwXbNxxqOJjqzAKmnu2yzGkope5KinDpHaO43Vm2LiOs08VAkQGu4GPH/hH2dUhxHA280iW6KIrsVXpNgvQ4mvT3B5c32X9ce5w8FGMdvVl+kAzWY7eabZ5w50KsN/XarcbuKZ5uSOmTQdhWmfR3s7JTNQjrVNOTRp46rO9lYY1ajWcTfs3rXNmPDAGiwAAHckdROlpGYY27JkyLhSmFqh4lRjHghe4Ov6N4+6dUnHPSxs42icZSKKmz8dTBgEniACfJNf2ok2Y4DnABVZMOnm+u5eRvTGq6s4mMtOP5ih06f3nvd4NHuWGj51tUJ5HEIQwlPXLJ5380UNAsFxtCXVBFs3cCm9N2YuEFtt8Se7gnU7k3e361p3FpB8QVxzQuiwRcSUT0BNzoNyJRcBuXoq5rblh1BXVgBYaKNqYgmx4p1UrWgXUfWutNYR77DeBp/ZJq1Cd6SwjnaLaIVWATGn6+C4yw/pm8Vya5SuWUbbPnanWc0ENdAcIPNXXY+DDWA7gFSoUvT264UXU4uRAdyNiTzhFki3wbhmo3ZJO2ma1TJT9RtyfvEWEcrqaDS1zXHQ2PaFVeibgKhadSBHd/ypjplj3UxRDHQSST2NgD3lJnHzaUU48lQ1yCdPKYLqNQfaYWnhLDP/AH+5VVgTjG7ZqV2ta/LDCSImbgC9+SkdgbGNQh7xDPzdnJNj5IeYlyVPI3Em+h+z8rTVcLusPZ496tVN6Y0YFhoFL4ShSaw1sS806QiD94k6WuPCTeNCpKllnsPuOOO44wmKT9zpCpmO6Z4XOSyi8N3RAHvdKEOntMaUneI+aZ/SzQr+ogaRs2tIynUJ/VpWWU0/pCAILaJndcXKlf8A1hj3C2Etu67B8FRCEoqmJnlhdl1m90J0qmO6S7RP/wAVo/nZ/wCKSdv7T/2WD+Zv/ii0i/Gj7l5YTwSi5UB229qf7bB3/wBkH/F9q/dpjx+SzSzfHgjSGlBqjM5oBAuSZIFo0Czw7Q2sftUx3v8AgmOJxW0GEVKrW1Q0h0NL5lt266gEAxv0XaDX1EHsjT3vFwua5Unon0l9KW0nOL3mYJ1mJyO4uAm+/nqbsI7ELVDYuxJcULFNIRMXWa0esB3hR3+I0z/qNdxhwKxGsOHyba711RwMACDHlb5Jq7F0xeSewE+9cMeHQQDImARrNolcYgt16gemqcGeJ+S5YFRgErxxS3BBeU8Qc2qWkFpII0IRMbjqlYg1HZsogWAsb7kABe1BAjiupXZtuqHOxMW1j4e0EHQnd/ZaFgsUCAs0Yyyl9ibXNOGPPV3HhyKTmx6t0MxTrY0H04AncFWulG1zWqBoBaxghrZcbmCTBJieAgWUnTrhzTzB8lW9oviq88LjtyiPeQi6VUmD1PKGlfFCnaA5/OCAd4ANjG8mRwG9NnbTqn7R7JdHZGnuUZVrQf1oLBKplxaY01jmJTxFE3gceMzXEAOa4HlbiBaOYWl4TpZhsoBseRYffmusbwdQ5xwt8virLsvY3pm5y/IJIaAA4nKYLjOgBWOu4ucFLk1nA7QpVfUdMajQjtBTstCyLA1qmErMM6OFxo5pjTkQZ7VrdB2YAriLLDQ9jwtCG8BHeEyxVWCATEyfWDTlBAIBOhJcO6VxmLG8kqQuyQ9qYtxJykzfNDYjrAVIh34iwOt+Em8iH1N0hdsMy4HjSdmfdJqRo4gGnILjmgfeEQQOMrQv8PL7mtUvwcVSek38Zh/bZ+dnzWll7ImO5Ly8no9LThbIxux6IMuYSeLiXT2o1LBsbo1oPIBOs88u1eZTw8EpsoUE+GCfTm2i79nIEzoZ8ERxkzqh1TII4rrMquT0VQb8VyjoqfdK5FpRmtmHVakIDil63QTcpooNSG9JmTKUdIXNauOOfYJDQl1mO4GNx3LqFFzjABJXWdRJbF2g9rwzVrjHZPBOdq+vU7vNqe7I2T6MF7/WgwOFvNR+0XdaoezzauxNO6OyxaqyIxmEiHbj5jUfHvQWEjQ/NSuaxBuDqDoUH9kZwPZJj5+9Mpi7G+Co3nh+gp7CY/0QAdfeAJkZrzbcdYnnvlR0bhYcArF0MwDK9eqajQ7LEA3HWLpt3LJbLcCTrcRsvDVMZXa8ghjCCT2RbtMAcgO86rg2w1BwmAYwQ1oA5CE6cYHDyA4lBu2R5J63SQ3x1YtAjVxDW9pv7gCvKNMNz9eC0S6BBiJBLjfc4XgQLABRO16npSz0bh1esHAmCS7LkbG838I3lOcNi21ABUpMzidXNYZIyuMHfcgwSukk+T0seLw4JP7nudtVudri4NJILoLwZDiGxoQC2ASQcwsErBvEW91xqQYO8SCmlNopjI3m6Ac8THXfUgCLafhF7BOsJTI4wBG/tsTc669i6kntwK6hf+dsp/SM/wCfw/t0/wA7FpDiCs2284DaOHzeqKtInsD6ZPulaxVp0GU/SPlgizT6x5wgy8j+lT8MjXBeF53JTKjXCWmQhE2S+R7VC85Sc3ikpI5LDFYg03ffK5Gkrl1m6T51cbQlU2whtuUVzlQTnBS/RzZTsRXZSaNTLjwbvKiqbZWt/Rzsj0FPO9v1lS/Y3cFknSCirZJbb2BSawejYMjQABHBVN9ENNgB2CFqFUBzS0qi9Itmmm6Rdp0PwUc13Lcb7Mhar+qew+Sq+0Dd/d+ZqsVd3VPYVW8Yes7u/M1U9N6WS9X6kR+MxmWw1/WiaU8W77x8fhogYgnMZ/U3S20xlmb/AKsnk5LYOvm11Cuv0a/vKx9j/vWd7OeS9sayB4mPitF+jEdasebP+5ZLgTk9LNMYEmtTBBBEgggjiCIIS2r0rDz03F2ipYrBMpva10tYYIcCS+WuDi1sggkkk3i2lwAHuE2YX5QKjg1js4a5xLzoYewQGAmZjWYPFSmJwgc4OjrAQDvA5eJ8ShOoZYN7Gd+8QQYIslzhfDo9SPVxnSb/AOgKGKqMIAyggFgkuA1ALiJOhaI0A62k2dbTxQAp02GRTFzIIzOicsWgRuTTD0TN+LjMQOsZhokwJ5nUpy+kESVKkIz5ot6VwZz0mr5cbTd91zT4FhUntbpU6vF5ebBo3Hj2KB6aO/zTuQH5WphsDAVq78tIQDZz9wHauyJPkq6eTjFaS39GtsNpuc17iQAJNz1lYmbbY4ZmMqPExYfNe7H2VTw9IU2jMdXOIuTvKetbGlkmTtlUYtIZ/wCJVSY/Zqn/AOfmjnFVP9vLzc4eQlLqPI1K9pmyGwqaBh1T7zfBy5GzLxcbZ8+MXrRKGXKT2Hs11eo1jbA6ngN5VJKlZYugPRz9oqZ3j6plzzO4LWmlrRut3Kp7K2YxgNFtWplZFgctzvJGqkaez2amXe04lTylbKIxpEu7alIHrPaO9BxWKwr2lrnZp3AEntTdlBjfst8AjteBpZcc7soO1cG5uaGuLYJmD6sxJ4aqrYlhJcQCY1gEwOJ4LcNphrdn4p7jepTe1vEwDHdJVM6AYcOZUJH+ofcGpuJaYk/VT4bMvxuCLuuwT94b+R/XzUbkPBbDt/oGHONTDO9GT9m4b/KRdvZcdir46JY6Yhnb1fcQJTrJo5Ysquz8IaYzu9Yjqjff7XYNx4gRYFa19H/R+rToB8N+sObUggaAERy96jNi9DcjvSVjnfryniZu4rQaLSynSa2R1BYcTCxLU6Alki0wrcJU4DxXhw1T7vvb81xq1BYkjtXpxFQakjtA+SZ4TJ3HH8gzh3/dPiPmhvou+6fBG/bH8fcEShiC5wBi/LkseNo5Qxt1bI8hJevA7rP9t3mUp6WJap0ZntnDNq7RFN2jnNB7MonyV9wFCnSptbTaGtjcqTUP/Vm+15Md8ldcHUlotEWS8vJ7PT7QQ8Lkj0gSalRNHPIN9CkPYsi0xyXSvIjsQmOS2vWWE42txeYcVybwOC5FYOle5hWBwrqjwxoJcVpuxNmNwzMpEuPrHifkgdEtitoU87h9Y7X8I4BTNRjSZCKWRN0DDC0rEYR5zvM7wFJNrFROD1JNgT5JzU2gzQEErDYuluODXJNlI4Cg6o4NGp15DeVE4Z+YaK67OwooUsx9dwl3L8PctBKt9JGMDaQpNs0CFE/Rz+7qf/Y7yamXTnFZj3jzSPo92k1rn0nGC5xc3nYSO2yZDeJP162Vexo8Jo6mM+79Apy1yEPX/XBGeOj1zbJ+R1qQ4BqZ1RZPK9QCq0H7vOLAnVHEPF3+xGbNlzwSSZJ3ne4fNLzk1HEucQHPtJiATAhe7Ebdvd5/2Q8E6STxzHxcFseUZe33Gh2Sx9KlWBrVqgYy7K0Q6oIc+CYaQJ0A7NSj9EMW6tSY90k9cSRBcGuc1riNxIAJi0yozFPwed4NI5y4l5aILiOrD3NIJbyNrhWTZzA02AAa2wFgAIgAbgmuLinY9ZIzaS9yNww1PEk+8oz0LCDqjsXmLrhjSSYAU6JXuzPqJ/6s32n+5lRW7B2BzG+Yqk7Orh+0sw4v8cjzHdMK0GrD3cClZeT2unXlRLPchOcY5ITall7O5IbsritLPKb4kcPJFa9N8QQIK5tQIeNxvqQ8DgvU0zlct1A+GwJbZCqixhCq4gh+VwAbuN/ek4pwDTvQpB3aGWMkgBogcELDYUTpCkcPWaGgwmzq/WhoMuMcddIHFPj8Es/ksnRbB5qgJFmdY9v2R437lMdJ8aWsgXT7YezP2egGu9c9Zx5nd3CB3KuberyTwCx7BY92Z30mxExxLh5qGwLyKzCCR9Y3T2gpDpS7rD2h5qKwx+sZ7bfzBOxekR1LuW5uFSqAzM2nJEdWXCeMmfcBuRnwC3QO1IGYgSAYv2oGCrdVmoiDpNxNzcTqvA3rSN51IIPOSXOkz2d6UtTyPZpfyefkcFj2qx291k6x7wHPJ3Nd+Ux7ymrNW8yPMJzjGtc6o1xgOBExMGBBjlr3KuC5J8b2+6GmyXBtyYDRJ7AHEn3IOzxbu+KPhcMAHNc4EOa5swRq0gb53oeGw5ZMkE6Ajvn4IoxdoGtkRPoWPrkHXM7dH3rT3AntG9WGiYbUPBp8j8lXKLA2s4yfXiL3vUgA+q5wJsNQJurBMUqp/D8Cm5n5Q8XN/UaYcdUdipX0iY97Gsa0xmDp8Wj4lXaloFnv0mnrU+x3m1TRMwq5og+hdFz8S0MLQ6H+uSG+qZ0V+qbIxIqAlmZgBuzreIGizXYFYsqgjW60bZe13gi5U2aTUj6LpcEZ47vcIHpTnhF25Va5zKggF7esPxAkZu+3eCmNMb5lKRr2dMWHIuYbkB64StozV7B8oXiTK5ZQWoHWZJLTrPiE1riAQQpbEskSNRp2KNxsWv2rAmq2ABxbaLHerh0K2HpiKgsP3YP5/l48FFdHtmiu+/7tkF3M/dHb5dqvVbFBrYA0/VkyHFicnOkBtjEwCAqJtV6sW0sXKqm0qtyhk7YyEaRSdvS5x5SfAKKwv7xntt/MFO4ikHNxDy4DJTdA+8SDYcNNear+FP1jB+Nv5gqMXpJOpW5tOysQ0sALiHdlo7dykmkFQuzAW3HCN+/s/VlLUQd6JHi5UhxQHXZ7Q85Xm0q5aXFpaHSYkTN7hokXjw1gwl4T94ztPkUnHAubUDYkwRO+HTE8U2PDo3H6f99hth67msJsSJjOTBhuYgRrABsvMDVc4HMZIi8AWO63YfFFFE+ie0hpdBI7QQbSNYBScMwhpkQZ0kcBwRxuzOyInBVZruIa6SSCCWnLLiSYFwJLtR3lT1a1Cp3D3j5qD2K5xq1M1jLpG4OlmYC8xP6KncR+4PNw82/JFn2X6BYu/wBxrTFlnX0l+vT7D5haOAs2+ks/Ws9n4lIR2D1lc2Eyag7/AIK3064bfgqt0bbNUCCZB03XF+fYrFtPDvp2IjM23AjcVNkVyPfwTccew7di88HlA5D9EpbKqYbOa54AAk+7vKdYjE0KPruzu+634lco9gJZO7H9IOOgJjglByhKnT6qxjqdKmxjXb4lyabJ6ROflpvE9b1t5niieOkAststGdchZlyXQ22dsjH525Cbt07EjHYc5hG9QeDBY4OBuPfyVow1YPyEWlzZ8RIQyjTGwlqjT5RcNkYcUaLWDUCXHi46n9bgF7iao3ps+tAUNj8fCOWyFQVuw+IqNJ1UBjmzKK2s53JKNIEQljyhbZIptqNP2mmO1RGBvUp+2z8wVq6ebPAol4+zE+IVV2TerS9tn5gqcXBF1PJs+GLWkCQLCMx9bqhxyW3dbwUq1MacZA0C0CDv5zbjOkbtU9ZoEZ42RLsOcAPrG9/kR8U5q4ICSXQBckiw7TKFs2Mx4gfJMsbUFeo5hP1bDEbnvHrF3EA2A4gngmRdbhRaWPdW+wCttOmPUz1ObW9Xuc4gHulIpbVpkw7NTnTOIH9QkDvUi3CsA4IdXAAiLEFGs8e6/IlxyXaf4/I4GDdqADO8EX4XScewtpNB1Lx8T8FHbLrOw9VtIz6KoYZP2H8ByPDj3qW20bMH4vIH5oct18MoxSjKDfDWzQ1LbLL/AKSz9cz2fiVqO5Zb9JX79vsjzclozAvOQfR2pFdnMrW3eiq0wyo0OAuLwQeII0KyLYI+taeErRMPiJAup8r3PoukSeOmMNrVP2V5aGtcwiQDYuaZgyN8gg8wVTdp4ptRxIbk96vm2MRhKgZTqO67Zhw3SbNJ7iY5qs7a6OVKTRWB6jvVJ+KZjlcdyHLFKbSKs9ynOjWE6+Y6N8ymQpsdJIyv3AaE71YNlDK0NHf2rMkqVG4o27JjOvU3zrlPZVsQpqFTPRau51drOJJ8ATPuQttbHdRrOpxvt8lJ9C8HFV9Qj1WwO1x+QPin1sSxbT2LViqYi/nHkoHF0xyUjjKpO9ReJsgY+CYyc7mnWHfZN3JeHKWxyIzpmP8AKVZ+78QqLsP99S9tn5grv04fGDqc8o8SAqR0fH19L22eYVGH0kXU8m34M2CebkzwosE/9CUw8Vqw+yx1z7PxCiNlGxnWTPaSSffKmdmNu6eA+KicXT9BWM+pUJc07g43c085k9h5Ji3i0vqbNNQjL6/uB26yqWfVkzN41jl3o+wqtRtMCpM89Y3ApwHgpLngLXkbx6K+fknUKya7GvSKr9XI1a5pHaCFMbY1p9rvIfNQtGmcRXawepTIdUO63qt7SVObUu5g5O+C7KtMIxfO7/UowXJTn22X6c/yNRost+kr+Ib7A/M5am5pWU/SMZxIHBo83JaG4PUQ+xMK+o4hmobMTBNwLc0+xG0X0wWy4HQ2MjkRqmvRXDPq4ltNhgkGewELTdrdDTUY0se30oH2rBw4EgHuS2990evCDcLi9zJald7jofAqSftCt6MUyXFg3GSAnONPoXup1QWPbqCPAyLEEXkWQhimnQg9hTKsnGWGb1pymNyl8I9wuAPFNRX5FKFZ3CEuWK2NjkpEv1/w+9cor9qeuQ+CwvFRqW0Wsx+Dp4ymOuB9YBqHD1v1whNdl0opz94z4W+Crv0W9IxQqmhVP1dXqnk7Rpj3eCuleAIaIA0HDgtkLgReKbCh8S+Snu0MVuUU56XIqge3RGIYCLSQMYQ3Tr+CqdrPztVR6J0wcXQB0NRk9mYSrf0+/gn+1T/O1B+jnY9P+Jq3NxTG4HQvPvA7zwTsXpIeqaTNZx1CjRa1rRLiJlRGFxXWgTPWzTPG39kEVL6kjdKK3CuY4EHqOBJEz1iQbcN89qOKPO180StHERJ1mEqvVbUaWvYHNOon+1jzTMJbXI91wKWV1XYY1Nmlv7uoQOD25o/ma4HxC5uzST9ZXgcGMdP9RmPBSOddmR+NJe36IV4eP2/d/kdYAUKbQymWtHbcniSbkoGPeDUbBnq7r70n0QKb14ZlJMZuAFm3EmSN48kmc+8ipNyjoihwXWWSfSGZxU/gH5nLWjSBaYdoQCCAIMA6iZ1Hisw+kTZTmvFYXZGU/huSCeRlFGg8cXGXmGX0cvDcWXH/AGzH9TVpVTaRlY3svaJw7w+JsQd1rK0U+mVDLLszeWWT3QUvIpPg9npckIrdkp0/YH0GVfttqZJ4sc1ziDyDmyPbdxVGbTad1+ItHeErb/SJ1d0ScoJLG2sLS50b/wDhQtTaZ9VlzvPx7EzFFxjTJc0lKbaJQ1HNdl9Jbd97sTotHM95UDQqin1j1nHx/sF5U227cEYosOUcPNcq3+24ngfBeLji7dGsPOKpHg6T/KC4e8BX3G4wiwTTAdH20abqjvXi34QSPf8ANN6tRTJ2VJVyArulAS3uKSVjGIW1HpFAajtsgYZBfSE//JxxezzUj0OH+Vp9/wCYqF6fOnDtH4wproh/DU+z4lOxek87rSxNEiDoU+oVZcA68Cx5W14JlTUrhKIyDcmUeenSYUNC8LEZmHcudTI1C0U0AhcEty8ELAaOzwmO0MNNVrjUa0tboS7XrA3iN390+cAozpJTe9pe30bpygmDmDSSCMo4ZgZ7eKVn06N1ZX0ilq2dAMdia1BgAl4fcOyyyL5WAAANJ9aYFgNZKkWZX0s1Sk24Iexw3jUGb6FK2ls6pUotEgOY4kkgiQM4kNAnQggRdCx+Cc+RSEsqRmF2ua6MudueGuBAuJGkoMepS+CmduRjuJ2YaxrPot6tNxcGb8jnOjKOQAsq2+rJncFcsE92HxLqbTJa57DzyOIQel/RV7QcTRbNNxmo0C9Mk3dH3Cd+6eGj1PzUyrwX4amilPeSY3m7jw5dgSy8MFtfeeZ+S8eMmtz8fkibPw2c53aD3lMEnUMI9/WcYHPepTC4VrNGyeJRW3R2LjGeX5LkVcuMNf21iuqWhV9xsneLM71HF8GCo4bF7EvK8BXVHBDlGzkELkptSU3leygYaKv02xE5W81bOjAYMLTDQS4tBlxgSbwAO3VVrb2ANRs7xcfJF6I7dDIo1CGxoSY7Gmd6bHeNEXUx3L9h/swfW3Hdpvjn7k+qYz0TT9osN8ug0vxI10jTVRuEqsDmSZuCNIgkWI3zEp7WpOcTld6N2YEOA7bGN19ByXQ1aN+REccPF34JHZuOa6HB4cCdwIA5dYkz4ap3jcZkcwbnGCbW7vte7tUPhmmnOctLnuDjlEAQAApLEVmktF5bJ/mIgDu80Xm07cgzhjWb+0csYM4tv7vem7KxfUe0MEsMS8k+AadO3+yK9pytAuHQIPIOJvvmQO5DqYd2cvpub1vWa6bneUOWUqVL6i444pNchQQWvPo5cCRFt24E6IOzsQx4kDKZgtBANtJ04jdvRdnUMoLS8OMzoYiwIm86e9AwuzAwuLsjpPVMEnW85uULoOWzkE40vKl9f8CNubTbSMCmXG2jss9lrlIxO1/Q1aTKjXj0hEHMCBcC9zMEidNUnpbgHVG03scA+mZGYwHXFp0BnLra8b1Ev9Pi61L0jGtFMg9WowiJBe4w4mIA7EqUpxb7+2x6uHFglCMpV3vff4opGEw846rvy1Kmt/8AUdqVesPXj9W7CN4Wb1dsGlXrVabRUDnvMTFi8kHQ7imWP6cYmoQ2llo8XAZneLrDwlHOEpOkbhzxhCmR3SfZLWY7EU2fumVDHIOAcGDszZe5JptsBoNw4LyjLpcSTckk3Libkk7yeKNpcqlLYhbCBLaUAPSw5cCGlchZ16uONQ2s19FwbUETo4XY7sPHkbqHrVBK0nEUmuBa5oc06giQe0Kj7b6JuaS7DOkf7bjf+R58neJWZOma3iMxdSntIig5KlQ9bGPpuLKjS1w1BBB7wUaljgVLTRapIkgUYCyY0cQHW3pzQfu4LjUzn05ULtLYTXyWmHHwPaFYCEhwWJtbo5xUuSCwvR5zRArPad+Ww7hKG/YTmCRiHD+U/BynqhIEgKMrOdJlc8sl3A8CD7EUP2gaYh/9T/KUVuJxjdK7/wCt6LXpkXCLRIdqiWZgT6aPZA6W2MeNK5/qPxCcM6QbRH+oT3sPmF4KAC8ARPMwF00QtPpZtC8XO+zZ9y9HS3Hjcf6T80wDix5tqk1K7lryP2Frp4kr/wC4GNHrDTizTndR+J6aYuo2oxpaA9uVzhTY05d7Q9okAixvomL6862QaYuYXeL8GrAvcbVa5Yw9Tv5nRReEoSY73FSW1qtgwXLj5INJuUQNTrzKZj4sGfNBSRoNAhEieJXlRwHrGOW9COL3MEeaMAdBp32XGoBvTNrHm5RW04XHDj0i5IlcuOo+jawhMKpT+uUxqquTJYkbtHA06zctVgcOeo5tdq09iqO0ehDhLsPU/kqfB4+I71enNSHBIlFPkdGco8GSYmjicO6atJ7QN8Zmx7TZHvUnhNoseA5rhPb7loFQqLGzWVarWejZme4DMWttJiSYSJYvYohn9yJovzAEItfDENmbqQx+DOGrvpPHNp4t3JjjKhSKGPIxuyqCJ4ppjKcGOOi5tQNffR3uO4p8WZmwddyXJUVQnrVkJXMFoOm9dXojUI2KpWjeClsaMqUtmNfAzptc6YkwJMTYDeeSSAU7a57A4tkNeIO6RwlAaTIR7Ac7AXtl57Ems2yITDx2FArORpiWhs5k2GqQaIaMxOgunQEfFMNo1oGXx+SKKt0BJpKyONyXu1Og4BBdXOjdeKU941Jjz7ghem+6I571WSMU3Db3FFBaNAg5SdUQU41XHCs5K5eZgFwqLjRUrkmVy6zD6Rrpq4LlypZMhBCE5cuQBDOoq/taoRlIJBzTbiLhcuQS4GQ5LV0+aHYXDVTd5DZdvu0E+9VCv6o7Fy5SocQu0fVKk8A8mkwk3IC5cgy8FPTcs7HtGdvOEyf60LlymlyVR4E5iRBM3SaQXq5b2MXI3jrt/mTSrvXq5NXAiXLETZV6u4k35+a5cnYe4jKMtTdOqTQuXJ4gLXMaJrK8XLjQjUsLly5mCguXLlhp/9k="
                                                style={{ display: 'flex', minHeight: 185, maxHeight: 185 }}
                                              />
                                            </>
                                          )
                                        }








                                      </Box>




                                      <CardContent sx={{ pb: 0, pt: 1 }}>
                                        <Box sx={{ display: 'flex', mb: 1 }}>


                                          <Typography sx={{ flexGrow: 1, fontSize: 24, fontWeight: 'bold', letterSpacing: 0.4 }} noWrap>
                                            {item.title}

                                          </Typography>


                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}
                                          color="text.secondary">
                                          <CategoryIcon sx={{ mr: 1 }} />
                                          <Typography>
                                            {item.category}
                                          </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}
                                          color="text.secondary">
                                          <CalendarToday sx={{ mr: 1 }} />


                                          <Typography>{dayjs(item.dateFound).format('DD/MM/YYYY')}</Typography>


                                        </Box>



                                      </CardContent>

                                      <Grid sx={{
                                        position: "absolute",
                                        bottom: 0,
                                        pb: 2.4
                                      }} justifySelf={'end'} container direction={'row'} display={'flex'} justifyContent={'space-between'} px={3}  >
                                        <Grid item lg={12}>
                                          <Button sx={{ wdith: "100%", height: 50, borderRadius: 4, }} variant='claimit_primary' fullWidth
                                            onClick={() => generateQRCode(item)}
                                          >
                                            Claim
                                          </Button>
                                        </Grid>



                                      </Grid>



                                    </Card>
                                  </Link>




                                </Grid>
                              </>
                            )
                          })
                        }
                      </>
                  }

                </Grid>


              </>
              : <>
                <Typography sx={{ fontSize: 26, opacity: 0.7, textAlign: "center", mb: 1, mt: 1, color: 'text.secondary' }}>

                </Typography>
              </>
          }
        </Grid>



      </Box>
    </>
  )

}



export default Homepage