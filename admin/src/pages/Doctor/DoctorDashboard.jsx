import React, { useContext, useEffect, useState } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import CreatePrescriptionModal from './CreatePrescriptionModal';

const DoctorDashboard = () => {
  const { dToken, dashData, getDashData, cancelAppointment, completeAppointment } = useContext(DoctorContext);
  const { currency } = useContext(AppContext);
  const navigate = useNavigate();

  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    if (dToken) {
      getDashData();
    }
  }, [dToken]);

  return dashData && (
    <div className='p-2 sm:p-5 w-full max-w-6xl'>
      {/* Stat Cards */}
      <div className="flex flex-wrap gap-3 sm:gap-4">
        <div className="flex items-center gap-3 bg-white p-4 sm:p-5 flex-1 min-w-[200px] rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all">
          <img className="w-12 sm:w-14" src={assets.earning_icon} alt="" />
          <div>
            <p className="text-lg sm:text-xl font-bold text-gray-900">{currency}{dashData.earnings}</p>
            <p className="text-xs text-gray-500 font-medium">Earnings</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white p-4 sm:p-5 flex-1 min-w-[200px] rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all">
          <img className="w-12 sm:w-14" src={assets.appointments_icon} alt="" />
          <div>
            <p className="text-lg sm:text-xl font-bold text-gray-900">{dashData.appointments}</p>
            <p className="text-xs text-gray-500 font-medium">Appointments</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white p-4 sm:p-5 flex-1 min-w-[200px] rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-all">
          <img className="w-12 sm:w-14" src={assets.patients_icon} alt="" />
          <div>
            <p className="text-lg sm:text-xl font-bold text-gray-900">{dashData.patients}</p>
            <p className="text-xs text-gray-500 font-medium">Patients</p>
          </div>
        </div>
      </div>

      {/* Latest Bookings List */}
      <div className="bg-white rounded-2xl border border-gray-200 mt-6 sm:mt-8 overflow-hidden shadow-xs">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-slate-50 border-b">
          <div className="flex items-center gap-2.5">
            <img src={assets.list_icon} alt="" />
            <p className="font-bold text-gray-800 text-xs sm:text-sm">Latest Appointments & Consultations</p>
          </div>
          <button
            onClick={() => navigate('/doctor-appointments')}
            className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
          >
            View All →
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          {dashData.latestAppointments.map((item, index) => (
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-between px-3 sm:px-6 py-3.5 gap-2 sm:gap-4 hover:bg-gray-50 transition" key={index}>
              <div className="flex items-center gap-3 min-w-[160px]">
                <img className="rounded-full w-9 h-9 sm:w-10 sm:h-10 object-cover border" src={item.userData?.image} alt="" />
                
                <div className="text-xs">
                  <p className="text-gray-900 font-bold">{item.userData?.name}</p>
                  <p className="text-gray-500">{item.slotDate} | {item.slotTime}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 ml-auto">
                {!item.cancelled && (
                  <>
                    <button
                      onClick={() => navigate(`/doctor-consultation/${item._id}`)}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition flex items-center gap-1 cursor-pointer"
                      title="Join Video Call"
                    >
                      <span>📹</span> Call
                    </button>

                    <button
                      onClick={() => setSelectedAppointment(item)}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition flex items-center gap-1 cursor-pointer"
                      title="Create Prescription"
                    >
                      <span>📝</span> Rx
                    </button>
                  </>
                )}

                {item.cancelled ? (
                  <span className='text-red-500 text-xs font-semibold bg-red-50 px-2 py-0.5 rounded'>Cancelled</span>
                ) : item.isCompleted ? (
                  <span className='text-emerald-700 text-xs font-semibold bg-emerald-50 px-2 py-0.5 rounded'>Completed</span>
                ) : (
                  <div className='flex items-center gap-1 ml-1'>
                    <img onClick={() => cancelAppointment(item._id)} className='w-7 cursor-pointer hover:scale-110 transition' src={assets.cancel_icon} alt="" />
                    <img onClick={() => completeAppointment(item._id)} className='w-7 cursor-pointer hover:scale-110 transition' src={assets.tick_icon} alt="" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prescription Modal */}
      {selectedAppointment && (
        <CreatePrescriptionModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onSuccess={() => getDashData()}
        />
      )}
    </div>
  );
};

export default DoctorDashboard;
