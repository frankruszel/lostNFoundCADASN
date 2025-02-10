import { useUserContext } from "../../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAlert } from "../../contexts/AlertContext";
import { enqueueSnackbar } from "notistack";

const AuthGuard = (props) => {
    const { children, type } = props;
    const navigate = useNavigate();
    const { IsLoggedIn } = useUserContext();
    const [redirected, setRedirected] = useState(false);

    useEffect(() => {
        if (type === 1 && !IsLoggedIn() && !redirected) {
            navigate('/login');
            setRedirected(true);  // update redirected status after redirection
            enqueueSnackbar("You have to be logged in to access this page. Please log in first.", { variant: "error " });
        }
    }, []);
    // Avoid rendering children if not logged in
    if (!IsLoggedIn()) {
        return null;
    }

    return children;
};

export default AuthGuard;
