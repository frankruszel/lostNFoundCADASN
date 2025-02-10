import React, {useEffect, useState} from 'react';
import { useLocation } from 'react-router-dom';

const ShowActualNavBar = ({ children }) => {

    const location = useLocation();

    const [ShowActualNavBar, setShowActualNavBar] = useState(false)

    useEffect(()=> {
        console.log('this is current location: ', location)
        console.log(`location.pathname.slice(0,6):${location.pathname.slice(0,6)}`)
        if ( location.pathname.slice(0,15) !== "/password-reset"  && location.pathname.slice(0,6) !== '/staff' && location.pathname !== '/login' && location.pathname !=='/register' && location.pathname !=='/forgot' &&location.pathname !=='/forgot/otp' &&location.pathname !=='/forgot/password' ){
            setShowActualNavBar(true)
        }else{
            
            setShowActualNavBar(false)
        }
    }, [location])


    return (
        <div>{ShowActualNavBar && children}</div>
    )
}

export default ShowActualNavBar