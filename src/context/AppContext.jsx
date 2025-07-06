import { createContext, useEffect, useState } from "react";
import { reviewData } from "../assets/assets";
import axios from 'axios'
import { toast } from "react-toastify";
export const AppContext = createContext()

const AppContextProvider = (props)=>{


    const currencySymbol = "$"
    const backendUrl = import.meta.env.VITE_BACKEND_URL 

    const [psychicExperts,setPsychicExperts] = useState([])
    const [token,setToken] = useState(localStorage.getItem('token')?localStorage.getItem('token'):false)
    const [userData,setUserData] = useState(false)



    const getExpertsData = async () => {
        try {
            const {data} = await axios.get(backendUrl + '/api/expert/list')
            if(data.success){
                setPsychicExperts(data.experts)
            }else{
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const loadUserProfileData = async () => {
        try {
            const {data} = await axios.get(backendUrl+'/api/user/get-profile',{headers:{token}})
            if(data.success){
                setUserData(data.userData)
            }else{
                toast.error(data.message)
            }
            
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

     const value = {
        psychicExperts,currencySymbol,reviewData,token,setToken,backendUrl,userData,setUserData,loadUserProfileData
    }

    useEffect(()=>{
        getExpertsData()
    },[])

    useEffect(()=>{
        if(token){
            loadUserProfileData()
        }else{
            setUserData(false)
        }
    },[token])

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider 