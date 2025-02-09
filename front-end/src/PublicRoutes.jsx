import React from 'react'
import Homepage from './pages/Homepage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import PasswordResetPage from './pages/PasswordResetPage'


const PublicRoutes = [
    
    
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