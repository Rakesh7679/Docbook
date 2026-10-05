import React from "react";
import { useContext } from "react";
import { AdminContext } from "../../context/AdminContext";
import { useEffect } from "react";
import { assets } from "../../assets/assets";

const Dashboard = () => {
  const { aToken, getDashData, cancelAppointment, dashData } =
    useContext(AdminContext);

  useEffect(() => {
    if (aToken) {
      getDashData();
    }
  }, [aToken]);

  return (
    dashData && (
      <div className="p-2 sm:p-5 w-full max-w-6xl">
        <div className="flex flex-wrap gap-3 sm:gap-4">
          <div className="flex items-center gap-3 bg-white p-4 flex-1 min-w-[200px] rounded-xl border border-gray-100 shadow-xs hover:scale-105 transition-all cursor-pointer">
            <img className="w-12 sm:w-14" src={assets.doctor_icon} alt="" />
            <div>
              <p className="text-lg font-bold text-gray-900">{dashData.doctors}</p>
              <p className="text-xs text-gray-500 font-medium">Doctors</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white p-4 flex-1 min-w-[200px] rounded-xl border border-gray-100 shadow-xs hover:scale-105 transition-all cursor-pointer">
            <img className="w-12 sm:w-14" src={assets.appointments_icon} alt="" />
            <div>
              <p className="text-lg font-bold text-gray-900">{dashData.appointments}</p>
              <p className="text-xs text-gray-500 font-medium">Appointments</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white p-4 flex-1 min-w-[200px] rounded-xl border border-gray-100 shadow-xs hover:scale-105 transition-all cursor-pointer">
            <img className="w-12 sm:w-14" src={assets.patients_icon} alt="" />
            <div>
              <p className="text-lg font-bold text-gray-900">{dashData.patients}</p>
              <p className="text-xs text-gray-500 font-medium">Patients</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 mt-6 sm:mt-10 overflow-hidden shadow-xs">
          <div className="flex items-center gap-2.5 px-4 py-4 bg-slate-50 border-b">
            <img src={assets.list_icon} alt="" />
            <p className="font-semibold text-sm">Latest Booking</p>
          </div>
          <div className="divide-y divide-gray-100">
            {dashData.latestAppointments.map((item, index) => (
              <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 gap-3 hover:bg-gray-50 transition" key={index}>
                <div className="flex items-center gap-3">
                  <img className="rounded-full w-9 h-9 sm:w-10 sm:h-10 object-cover border" src={item.docData.image} alt="" />
                  <div className="text-xs">
                    <p className="text-gray-800 font-medium">{item.docData.name}</p>
                    <p className="text-gray-500">{item.slotDate}</p>
                  </div>
                </div>
               {item.cancelled ? 
                             <p className='text-red-400 text-xs font-medium bg-red-50 px-2 py-0.5 rounded'>Cancelled</p>
                             : item.isCompleted
                             ? <p className='text-green-500 text-xs font-medium bg-green-50 px-2 py-0.5 rounded'>Completed</p>
                             :
                              <img onClick={()=>cancelAppointment(item._id)} className='w-8 sm:w-10 cursor-pointer hover:scale-110 transition' src={assets.cancel_icon} alt="" />
                              }
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  );
};

export default Dashboard;
