import React, { createContext, useContext, useState } from 'react';
import { enqueueSnackbar } from "notistack";
const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({ show: false, severity: 'success', message: '' });

  const showAlert = (severity, message) => {
    enqueueSnackbar(`${message}`, { variant: `${severity}` })
  };

  return (
    <AlertContext.Provider value={{ alert, showAlert }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => useContext(AlertContext);