'use client'
import axios from "axios";
import { useEffect } from "react"
import { useDispatch } from "react-redux";

function useGetMe(enabled: boolean) {
    const dispatch = useDispatch();
    useEffect(() => {
            if (!enabled) {
              return;
            }
        const getMe = async () => {
            try {
                const { data } = await axios.get("/api/user/me");
                dispatch({ type: "user/setUserData", payload: data });
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

            getMe();
        
    }, [enabled])
}

export default useGetMe

