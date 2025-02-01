import React, {useEffect, useState} from 'react';
import { useLocation } from 'react-router-dom';

const ShowNavBar = ({ children }) => {

    const location = useLocation();

    const [showNavBar, setShowNavBar] = useState(false)

    useEffect(()=> {
        console.log('this is current location: ', location)
        console.log(`location.pathname.slice(0,6):${location.pathname.slice(0,6)}`)
        if ( location.pathname.slice(0,6) !== '/staff' || location.pathname === '/login' || location.pathname ==='/register' || location.pathname ==='/forgot' ||location.pathname ==='/forgot/otp' ||location.pathname ==='/forgot/password' || '' ){
            setShowNavBar(false)
        }else{
            
            setShowNavBar(true)
        }
    }, [location])


    return (
        <div>{showNavBar && children}</div>
    )
}

export default ShowNavBar