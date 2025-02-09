import React from 'react'
import ProfileInformationCard from './components/user/ProfileInformationCard'
import StaffDashboard from './pages/StaffDashboard'
import StaffListItems from './pages/StaffListItems'
import StaffAddItem from './pages/StaffAddItem'
import StaffUpdateItem from './pages/StaffUpdateItem'
import FindItem from './pages/FindItem'
import ClaimScanner from './pages/ClaimScanner'

const ProtectedRoutes = [
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
        path: "profile/*",
        element: <ProfileInformationCard />,
    }
]



export default ProtectedRoutes