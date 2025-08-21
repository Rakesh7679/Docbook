import { createContext, useState } from "react";
import axios from "axios"
import { toast } from "react-toastify";

export const AdminContext = createContext()
const AdminContextProvider = (props)=>{

    const [aToken, setAToken] = useState(localStorage.getItem('aToken') ? localStorage.getItem('aToken') : "")
    const [doctors,setDoctors] = useState([])
    const [appoinments,setAppoinments] = useState([])
    const [dashData,setDashData] = useState(false)


    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const getAllDoctors = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/admin/all-doctors', { headers: { atoken: aToken } })
            console.log("API response:", data);
            if (data.success) {
                setDoctors(data.doctors)
                console.log(data.doctors);
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const changeAvailability = async (docId) => {
        try {
            const{data} = await axios.post(backendUrl + '/api/admin/change-avaiability',{docId},{headers:{atoken: aToken}})
            if(data.success ){
                toast.success(data.message)
                getAllDoctors()
            }else{
                toast.error(data.message)
            }
            
        } catch (error) {
        
            toast.error(error.message)
            
        }
    }

    const getAllAppointments = async () => {
        try {
            const{data} = await axios.get(backendUrl + '/api/admin/appoinments',{headers:{atoken: aToken}})
            if(data.success ){
                setAppoinments(data.appoinments)
                console.log(data.appoinments);
                
            }else{
                toast.error(data.message)
            }
            
        } catch (error) {
        
            toast.error(error.message)
            
        }

    }

    const cancelAppointment = async (appointmentId) => {
        try {
            const{data} = await axios.post(backendUrl + '/api/admin/cancel-appointment',{appointmentId},{headers:{atoken: aToken}})
            if(data.success ){
                toast.success(data.message)
                getAllAppointments()
            }else{
                toast.error(data.message)
            }
            
        } catch (error) {
        
            toast.error(error.message)
            
        }

    }

    const getDashData = async () => {
        try {
            console.log('Getting dashboard data with token:', aToken);
            const{data} = await axios.get(backendUrl + '/api/admin/dashboard',{headers:{atoken: aToken}})
            console.log('Dashboard API response:', data);
            if(data.success ){
                setDashData(data.dashData)
                console.log('Dashboard data set:', data.dashData);
               
                
            }else{
                toast.error(data.message)
            }
            
        } catch (error) {
        
            toast.error(error.message)
            
        }
    }

    const value = {
        aToken, setAToken,
        backendUrl,doctors,
        getAllDoctors,changeAvailability,
        appoinments,setAppoinments,getAllAppointments,
        cancelAppointment,
        getDashData,dashData
        

    } 
    return(
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    )
}
export default AdminContextProvider