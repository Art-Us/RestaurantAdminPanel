import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from 'react-toastify';
import { io } from "socket.io-client";

export const AppContext = createContext();

export const AppContextProvider = (props) => {
    axios.defaults.withCredentials = true;

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [isLoggedin, setIsLoggedin] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pendingFeedback, setPendingFeedback] = useState(null);
    const [pendingOrder, setPendingOrder] = useState(null);

    const [hasNewFeedback, setHasNewFeedback] = useState(false);
    const [hasNewOrder, setHasNewOrder] = useState(false);

    useEffect(() => {
        const socket = io(backendUrl, {
            withCredentials: true,
        });

        socket.on("connect", () => {
            console.log("🟢 Connected to WebSocket");
        });

        socket.on("new-feedback", (feedback) => {
            if (loading) {
                setPendingFeedback(feedback);
            } else if (userData?.isAdmin) {
                toast.info(`📝 Nowa opinia od: ${feedback.firstName}`, {
                    position: "bottom-right",
                    autoClose: false,
                    closeOnClick: true,
                });
                setHasNewFeedback(true);
            }
        });

        socket.on("new-order", (order) => {
            if (loading) {
                setPendingOrder(order);
            } else if (userData) {
                toast.info(`🛒 Nowe zamówienie od: ${order.user.firstName}`, {
                    position: "bottom-right",
                    autoClose: false,
                    closeOnClick: true,
                });
                setHasNewOrder(true);
            }
        });

        socket.on("disconnect", () => {
            console.log("🔴 Disconnected from WebSocket");
        });

        return () => {
            socket.disconnect();
        };
    }, [backendUrl, loading, userData]);

    useEffect(() => {
        if (!loading && pendingFeedback && userData?.isAdmin) {
            toast.info(`📝 Nowa opinia od: ${pendingFeedback.firstName}`, {
                position: "bottom-right",
                autoClose: false,
                closeOnClick: true,
            });
            setPendingFeedback(null);
            setHasNewFeedback(true);
        }

        if (!loading && pendingOrder && userData) {
            toast.info(`🛒 Nowe zamówienie od: ${order.user.firstName}`, {
                position: "bottom-right",
                autoClose: false,
                closeOnClick: true,
            });
            setPendingOrder(null);
            setHasNewOrder(true);
        }
    }, [loading, pendingFeedback, pendingOrder, userData]);

    const getAuthState = async () => {
        try {
            const { data } = await axios.get(backendUrl + "/api/auth/is-auth");
            if (data.success) {
                setIsLoggedin(true);
                await getUserData();
            } else {
                setIsLoggedin(false);
                setUserData(null);
            }
        } catch (error) {
            setIsLoggedin(false);
            setUserData(null);
        } finally {
            setLoading(false);
        }
    };

    const getUserData = async () => {
        try {
            const { data } = await axios.get(backendUrl + "/api/user/data");
            if (data.success) {
                setUserData(data.userData);
            } else {
                setUserData(null);
                toast.error(data.message);
            }
        } catch (error) {
            setUserData(null);
            toast.error(error.message);
        }
    };

    useEffect(() => {
        getAuthState();
    }, []);

    const value = {
        backendUrl,
        isLoggedin, setIsLoggedin,
        userData, setUserData,
        getUserData,
        loading,
        hasNewFeedback, setHasNewFeedback,
        hasNewOrder, setHasNewOrder
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};
