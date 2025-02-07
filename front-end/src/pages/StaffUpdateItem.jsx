import React, { useState, useEffect, useRef } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Paper, Select, MenuItem, InputLabel, FormControl, TextField, Tabs, Stack, Tab, Dialog, Input, DialogTitle, Card, DialogContent, Avatar, CardContent, Divider, DialogContentText, DialogActions, Button, Typography, Box, IconButton, Chip, Grid } from '@mui/material';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { AccessTime, Search, Clear, ErrorRounded, CollectionsBookmarkRounded } from '@mui/icons-material';
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
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { UpdateItemApi } from '../api/item/UpdateItemApi';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { enqueueSnackbar } from "notistack";
import { UploadImageApi } from '../api/item/UploadImageApi';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Uploader } from '../components/Uploader';
import { findBestMatch } from 'string-similarity'
import * as tf from '@tensorflow/tfjs';
import * as sentenceEncoder from "@tensorflow-models/universal-sentence-encoder";
import { GetItemApi } from '../api/item/GetItemApi';

const IMAGE_BUCKET_NAME = process.env.IMAGE_BUCKET_NAME ? process.env.IMAGE_BUCKET_NAME : "prod-lostnfound-store-item-images"


const model = sentenceEncoder.load()


const getSimilarity = async (mainString, stringListToCompare) => {
    return model.then((model) => model.embed([mainString, ...stringListToCompare])).then((res) => {
        // console.log(res.unstack())

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
const categoryList = ["Personal Belongings", "Electronics", "Health", "Recreational", "Miscellaneous"]

function StaffUpdateItem() {
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
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
    const [imageLabels, setImageLabels] = useState(null);
    const [filename, setFilename] = useState(null);
    const [imageError, setImageError] = useState(false);
    const [category, setCategory] = useState('');
    const [title, setTitle] = useState('');
    const [userList, setUserList] = useState([]);
    const [item, setItem] = useState({
        title: '',
        description: '',
        dateFound: dayjs(),
        image_url: '',
        category: '',        
    });



    // START
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: UploadImageApi,
        onSuccess: (response) => {
            // queryClient.invalidateQueries({queryKey:["photos"]})
            console.log(`UPLOADER RESP::$$`)
            console.log(response)
            setImageError(false)
            let resultsArray = response.results
            let value = resultsArray[0].value
            let fileUrl = value.savedFile
            let labels = value.labels.Labels
            console.log(`lables:`)
            console.log(labels)
            setImageLabels(labels)
            console.log(`fileUrl:${fileUrl}`)
            setImageFile(fileUrl)



        },
        onError: (error) => {
            console.log(error)
            setImageError(true)
        }
    })
    const uploadFile = (e) => {
        const files = e.target.files
        const file = e.target.files[0]
        const formData = new FormData();
        Object.values(files).forEach(file => {
            formData.append('file', file);
        });
        console.log("filename:")
        console.log(file)
        setFilename(file.name)
        setLoading(true)
        mutation.mutate(formData)
    }

    useEffect(() => {
        console.log("useEffect triggered")
        
    }, [imageFile])
    useEffect(() => {
        GetItemApi(null,id)
        .then((res) => {
          console.log(`res.data:${JSON.stringify(res.data[0])}`)
          // setitemList(res.data)
          let currentItem = res.data[0]
          setItem(currentItem)
          setCategory(currentItem.category)
          console.log(`currentItem.description`)
          console.log(currentItem.description)
          setImageFile(`https://${IMAGE_BUCKET_NAME}.s3.amazonaws.com/${currentItem.image_url}`)
          setImageLabels(currentItem.image_labels)
          setFilename(currentItem.image_url)
  
        }).catch((error) => {
          console.error("Error fetching Items:", error);
          enqueueSnackbar('Failed to fetch Items', { variant: "error" })
        })
    }, [])
    //END
    // bookingId
    const formik = useFormik({
        initialValues: {
            title: item.title,            
            date: dayjs(item.dateFound),
            description: item.description,
        },
        enableReinitialize: true,
        validationSchema: Yup.object({
            title: Yup.string().trim()
                .min(3, 'Title must be at least 3 characters')
                .max(100, 'Title must be at most 100 characters')
                .required('Title is required'),
            description: Yup.string().trim()
                .min(3, 'Description must be at least 3 characters')
                .max(500, 'Description must be at most 500 characters')
                .required('Description is required'),
            date: Yup.date().typeError('Invalid date').required('Date is required'),
        }),
        onSubmit: (data) => {
            setLoading(true)
            console.log(`submitStart: ${JSON.stringify(data)}`)
            console.log(`typeof imageFile: ${imageFile}`)
            if (imageFile) {
                data.image_url = imageFile;

            }


            console.log(`key: ${typeof (filename)}`)
            console.log(filename)
            // create a new object for submission

            let dataToSubmit = {};
            dataToSubmit["userId"] = "testUser" // user
            dataToSubmit = { ...data };
            dataToSubmit["itemId"] = id;
            dataToSubmit["title"] = data.title.trim();
            dataToSubmit["description"] = data.description.trim();
            dataToSubmit["category"] = category
            dataToSubmit["dateFound"] = new Date(data.date).toISOString();
            dataToSubmit["image_url"] = filename;
            dataToSubmit["image_labels"] = imageLabels;
            dataToSubmit["itemStatus"] = "lost"
            console.log(`dataToSubmASDASDASDit:${JSON.stringify(dataToSubmit)}`)
            handleUpdateEvent(dataToSubmit)
            // toast.success('Form submitted successfully');
        }

    })
    const componentRef = useRef();

    const handleUpdateEvent = (data) => {
        console.log(`handleUpdateEvent: ${JSON.stringify(data)}`)
        UpdateItemApi(data)
            .then((res) => {
                console.log(`res.data: ${JSON.stringify(res.data)}`)
                // toast.success('Form submitted successfully');
                enqueueSnackbar("Updated item succesfully.", { variant: "success" });
                setLoading(false)


            })
            .catch((error) => {
                console.error("Error creating Item:", error);
                enqueueSnackbar('Failed to update item', { variant: "error" })
                setLoading(false)
            });
        // CreateItemApi
    }


    const handleCategoryChange = (event) => {
        // setCategoryError(false)
        setCategory(event.target.value);

    };
    console.log()
    const onFileChange = (e) => {
        console.log("e")
        console.log(e)
        let file = e.target.files[0];
        console.log("file")
        console.log(file)
        if (file) {
            if (file.size > 1024 * 1024) {
                enqueueSnackbar('Maximum file size is 1MB', { variant: "error" });
                return;
            }

            let formData = new FormData();
            formData.append('file', file);
            formData.append('userId', "testUser1");
            console.log("OUTOUTE HERE")
            console.log(formData.get('userId'))

            // UploadImageApi(formData)
            //     .then((res) => {
            //         console.log(`res.data: ${JSON.stringify(res.data)}`)
            //         // toast.success('Form submitted successfully');
            //         enqueueSnackbar("Image uploaded successfully", { variant: "success" });
            //     })
            //     .catch((error) => {
            //         console.error("Error uploading HERE:", error);
            //         let reqBody = error.response.data.error
            //         console.log(reqBody.file.)

            //         enqueueSnackbar('Failed to upload image', { variant: "error" })
            //     });
            // uplaod function to s3 with userId 
            //userId + formData



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
                <Card sx={{minWidth:600}}>
                    <CardContent sx={{ mb: 4, px: 5, py: 5 }}>
                        <Grid container direction='row' display="flex" justifyContent="center" alignItems="center">

                            <Typography fontSize={26}>
                                Update Lost Item
                            </Typography>


                        </Grid>
                        <Divider sx={{ borderBottomWidth: 3, py: 0 }} />
                        <Box component="form" onSubmit={formik.handleSubmit}>


                            <Card sx={{ minHeight: 450, pt: 2, border: "0px solid", boxShadow: 0 }} >


                                <Grid container direction={'column'} spacing={2} sx={{ px: 2 }}  >

                                    <Grid>
                                        <Box sx={{ textAlign: 'center', mt: 2 }} >

                                            {imageError && (
                                                <>
                                                    <Box>
                                                        <Button className="aspect-ratio-container" variant="outlined-error" component="label" sx={{ height: 250, width: "100%" }}>

                                                            <img alt="tutorial"

                                                                src="https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png">

                                                            </img>


                                                            <input hidden accept="image/*" multiple type="file" onChange={uploadFile} />
                                                        </Button>
                                                        <Typography textAlign={"start"} fontSize={16} sx={{ color: "#d9534f", pl: 1 }}>Image is required</Typography>
                                                    </Box>
                                                </>

                                            )
                                            }
                                            {
                                                !imageError && imageFile && (
                                                    <>
                                                        <Button className="aspect-ratio-container" variant="outlined-striped" component="label" sx={{ height: 250, width: "100%" }}>

                                                            <img alt="tutorial"

                                                                src={`${imageFile}`}>

                                                            </img>


                                                            <input hidden accept="image/*" multiple type="file" onChange={uploadFile} />
                                                        </Button>
                                                    </>
                                                )
                                            }
                                            {
                                                !imageError && !imageFile && (
                                                    <>
                                                        <Button className="aspect-ratio-container" variant="outlined-striped" component="label" sx={{ height: 250, width: "100%" }}>

                                                            <img alt="tutorial"

                                                                src="https://storage.googleapis.com/proudcity/mebanenc/uploads/2021/03/placeholder-image.png">

                                                            </img>


                                                            <input hidden accept="image/*" multiple type="file" onChange={uploadFile} />
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
                                                variant="outlined"
                                                name="title"
                                                value={formik.values.title}
                                                onChange={formik.handleChange}
                                                error={formik.touched.title && Boolean(formik.errors.title)}
                                                helperText={formik.touched.title && formik.errors.title}
                                            />
                                            <Grid container direction={'row'} display={'flex'} >
                                                <Grid lg={5.75}>
                                                    <FormControl fullWidth margin="dense" sx={{ position: 'relative', bottom: 7 }}>
                                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                            <DatePicker format="DD/MM/YYYY"
                                                                label="Date Lost"
                                                                name="date"
                                                                value={formik.values.date}
                                                                onChange={(date) => formik.setFieldValue('date', date)}
                                                                onBlur={() => formik.setFieldTouched('date', true)}
                                                                slotProps={{
                                                                    textField: {
                                                                        error: formik.touched.date && Boolean(formik.errors.date),
                                                                        helperText: formik.touched.date && formik.errors.date
                                                                    }
                                                                }}
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
                                                            value={category}
                                                            label="category"
                                                            onChange={handleCategoryChange}
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
                                                label="description"
                                                multiline
                                                rows={3}
                                                variant="outlined"
                                                name="description"
                                                value={formik.values.description}
                                                onChange={formik.handleChange}
                                                error={formik.touched.description && Boolean(formik.errors.description)}
                                                helperText={formik.touched.description && formik.errors.description}
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
                                                                type="submit" loadingPosition="start" loading={loading} fullWidth variant="claimit_primary" sx={{  height: 45 }} >
                                                                Update Item
                                                            </LoadingButton>
                                                        </Grid>
                                                        {/* <Grid item display={'flex'} >
                                    <Button fullWidth variant="contained" color="primary" href="/" startIcon={<AddIcon />} LinkComponent={Link} to="/register">Register</Button>
                                </Grid> */}



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
                                                    test
                                                </Alert>
                                            </Collapse>
                                        </Stack>
                                    </Grid>



                                </Grid>
                            </Card>

                        </Box>





                    </CardContent>

                </Card>

            </Box>



        </Box >





    )


}

export default StaffUpdateItem