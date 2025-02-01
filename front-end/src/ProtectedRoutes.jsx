import React from 'react'
import UserProfileRoutesPage from './pages/user/UserProfileRoutesPage'


const ProtectedRoutes = [

    {
        path: "profile/*",
        element: <UserProfileRoutesPage />,
    }
]



export default ProtectedRoutes