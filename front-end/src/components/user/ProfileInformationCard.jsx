import React, { useState, useEffect } from 'react';
import { Container,Backdrop,Paper, Card, Button, CardContent, CardActions, Grid, TextField, Box, Stack, Typography, Avatar, Switch } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import FileUploadIcon from '@mui/icons-material/UploadFile';
import BadgeIcon from '@mui/icons-material/Badge';
import EditIcon from '@mui/icons-material/Edit';
import CardTitle from '../common/CardTitle';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { useUserContext } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import Divider from '@mui/material/Divider';
import { enqueueSnackbar } from "notistack";
import * as yup from 'yup';
import { UserSubscriptionApi } from '../../api/item/UserSubscriptionApi';
import DeleteUserModal from './DeleteUserModal';
import { GetUserNotificationApi } from '../../api/item/GetUserNotificationApi';
import CircularProgress from '@mui/material/CircularProgress';

const schema = yup.object({
  email: yup.string().email("Invalid email address").required("Email is required"),
});

const categoryArray = ["Personal Belongings", "Electronics", "Health", "Recreational", "Miscellaneous"]



const ProfileInformationCard = () => {
  const { user, accessToken, refreshToken, RefreshUser, SessionRefreshError, DeleteUser } = useUserContext();
  const [formData, setFormData] = useState({
    email: '',
  });
  const [errors, setErrors] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [isModified, setIsModified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [openModal, setOpenModal] = useState(false)
  const [init, setInit] = useState(false)

  const navigate = useNavigate();

  // Populate form data from user context
  useEffect(() => {
    
    if (user?.UserAttributes) {
      
      setFormData({
        email: user.UserAttributes.email || '',
      });
      GetUserNotificationApi(user.Username).then((res) => {
        console.log(`res.data: FOR GETUSER NOTIFIACTION ${JSON.stringify(res.data)}`)
        let notifications = res.data[0].notificationSubList
        setNotifications(notifications)
        setInit(true)
      }).catch((error) => {
        
        let defaultNotifications = [{"notificationSubList":[],"userId":user.Username}]
        console.log(`defaultNotifications: FOR GETUSER NOTIFIACTION ${JSON.stringify(defaultNotifications)}`)
        setInit(true)
        setNotifications(defaultNotifications[0].notificationSubList)


        console.error("Error getting user notification:", error);
      });
    }
  }, [user]);

  const handleNotificationChange = (event) => {
    const {
      target: { value },
    } = event;
    setIsModified(true);
    setNotifications(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  const validateForm = async () => {
    try {
      await schema.validate(formData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (validationErrors) {
      const validationIssues = {};
      validationErrors.inner.forEach((err) => {
        validationIssues[err.path] = err.message;
      });
      setErrors(validationIssues);
      return false;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    setIsModified(true);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(URL.createObjectURL(file));
      setIsModified(true);
    }
  };

  const handleEditProfile = async () => {
    if (!(await validateForm())) {
      return;
    }

    setIsLoading(true);

    const requestObj = {
      email: formData.email,
      notificationSubList: notifications,
      userId: user.Username
    };
    console.log(`requrestObjk: ${JSON.stringify(requestObj)}`)
    UserSubscriptionApi(requestObj)
      .then((res) => {

        enqueueSnackbar("Updated Succesfully succesfully.", { variant: "success" });
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error updating user:", error);
        enqueueSnackbar(`Error updating user: ${error}`, { variant: "error" });
        setIsLoading(false);
      });

    setIsModified(false);
  };
  return (<>

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
    <Container maxWidth="xl" sx={{ marginTop: "2rem", marginBottom: "1rem" }}>



      <Stack direction="column" spacing={2} sx={{ mx: 30 }}>



        <DeleteUserModal
          deleteUser={DeleteUser}
          openModal={openModal}
          setOpenModal={setOpenModal}
        />
        <Card>
          <CardContent>
            <CardTitle icon={<BadgeIcon />} title="Profile Information" />
            <Grid container spacing={2} marginTop="1rem">

              <Grid item xs={12} sm={5} md={5} lg={5} textAlign="center">
                <Avatar

                  alt="Profile Picture"
                  sx={{ width: 150, height: 150, margin: '0 auto' }}
                />
                <Button variant='contained' onClick={() => setOpenModal(true)} sx={{ marginTop: "1rem", backgroundColor: "#d9534f", color: "white" }}>Delete my account</Button>



              </Grid>
              <Divider orientation="vertical" flexItem />


              <Grid item container spacing={0} xs={12} sm={6} md={6} lg={6} display={'flex'} sx={{ ml: 3 }}    >
                <Grid item xs={12}>
                  <TextField
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    fullWidth
                    disabled
                    error={!!errors.email}
                    helperText={errors.email}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography>
                    Notification Settings
                  </Typography>
                </Grid>
                <Grid item xs={12} sx={{}}>
                  <FormControl fullWidth>
                    <Select
                      value={notifications}
                      onChange={handleNotificationChange}
                      multiple

                    >
                      {
                        categoryArray.map((notification, index) => {
                          return (
                            <MenuItem key={index} value={notification}>
                              {notification}
                            </MenuItem>
                          )
                        })
                      }

                    </Select>
                  </FormControl>
                </Grid>

              </Grid>
            </Grid>
          </CardContent>
          <CardActions sx={{ paddingX: '16px', display: "flex", justifyContent: "end" }}>
            <LoadingButton
              loading={isLoading}
              variant="claimit_primary"
              
              startIcon={<EditIcon />}
              onClick={handleEditProfile}
              disabled={!isModified}
            >
             Save
            </LoadingButton>
          </CardActions>

        </Card>
      </Stack>
    </Container>
  </>

  );
};

export default ProfileInformationCard;
