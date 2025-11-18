import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Cookies from 'js-cookie';

const authContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();

    const LogOut = () => {
        Cookies.remove("token");
        Cookies.remove("username");
        Cookies.remove("role");
        
        setIsLoggedIn(false);
        navigate("/");
        toast.success("Logout successful!");
    };

    const validateUser = () => {
        if (
            isLoggedIn &&
            !(
                Cookies.get("token") !== null &&
                Cookies.get("username") !== null && 
                Cookies.get("role") !== null 
            )
        ) {
            LogOut();
        }
    };

    useEffect(() => {
        setIsLoggedIn(Cookies.get("token") !== null);
    }, []);

    return (
        <authContext.Provider
            value={{
                isLoggedIn,
                setIsLoggedIn,
                LogOut,
                validateUser,
            }}
        >
            {children}
        </authContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(authContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};
