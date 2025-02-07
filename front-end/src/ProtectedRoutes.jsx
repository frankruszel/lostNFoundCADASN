import React from 'react'
import ProfileInformationCard from './components/user/ProfileInformationCard'


const ProtectedRoutes = [

    {
        path: "profile/*",
        element: <ProfileInformationCard />,
    }
]



export default ProtectedRoutes