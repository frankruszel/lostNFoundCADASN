import React from 'react'
import Homepage from './pages/Homepage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PasswordResetPage from './pages/PasswordResetPage'
import StaffDashboard from './pages/StaffDashboard'
import StaffListItems from './pages/StaffListItems'
import StaffAddItem from './pages/StaffAddItem'

const PublicRoutes = [
    
    {
        path: "staff/list/add",
        element: <StaffAddItem />,
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