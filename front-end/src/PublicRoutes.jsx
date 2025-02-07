import React from 'react'
import Homepage from './pages/Homepage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PasswordResetPage from './pages/PasswordResetPage'
import StaffDashboard from './pages/StaffDashboard'
import StaffListItems from './pages/StaffListItems'
import StaffAddItem from './pages/StaffAddItem'
import StaffUpdateItem from './pages/StaffUpdateItem'
import FindItem from './pages/FindItem'
import ClaimScanner from './pages/ClaimScanner'

const PublicRoutes = [
    
    {
        path: "staff/list/scan",
        element: <ClaimScanner />,
    }, 
    {
        path: "staff/list/add",
        element: <StaffAddItem />,
    },
    {
        path: "staff/list/update/:id",
        element: <StaffUpdateItem />,
    },
    {
        path: "find",
        element: <FindItem />,
    },
    {
        path: "/staff/list",
        element: <StaffListItems />,
    },
    {
        path: "/staff/dashboard",
        element: <StaffDashboard />,
    },
    {
        path: "/home",
        element: <Homepage />,
    },
    {
        path: "/",
        element: <Homepage />,
    },
    {
        path:"/login",
        element: <LoginPage />
    },
    {
        path:"/register",
        element: <RegisterPage />
    },
    {
        path: "/password-reset/:email/:code",
        element: <PasswordResetPage />
    }
]



export default PublicRoutes