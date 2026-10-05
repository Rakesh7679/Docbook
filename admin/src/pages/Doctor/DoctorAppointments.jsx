import React, { useContext, useEffect, useState } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import { AppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';
import CreatePrescriptionModal from './CreatePrescriptionModal';

const DoctorAppointments = () => {
  const { dToken, appointments, getAppointments, completeAppointment, cancelAppointment, backendUrl } = useContext(DoctorContext);
  const { calculateAge, currency } = useContext(AppContext);
  const navigate = useNavigate();

  const [selectedAppointment, setSelectedAppointment] = useState(null);

  useEffect(() => {
    if (dToken) {
      getAppointments();
    }
  }, [dToken]);

  return (
    <div className='w-full max-w-6xl m-5'>
      <div className="flex items-center justify-between mb-3">
        <p className='text-lg font-medium'>Doctor Appointments & Video Consultations</p>
        <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-semibold">
          Total: {appointments.length}
        </span>
      </div>

      <div className='bg-white border rounded text-sm max-h-[80vh] min-h-[50vh] overflow-y-scroll shadow-xs'>
        <div className='max-sm:hidden grid grid-cols-[0.4fr_2.2fr_1fr_1fr_2.2fr_1fr_2.5fr] gap-2 py-3 px-6 border-b font-bold bg-slate-50 text-gray-700'>
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Video & Prescription Actions</p>
        </div>

        {appointments.slice().reverse().map((item, index) => (
          <div
            key={index}
            className='flex flex-wrap justify-between max-sm:text-base sm:grid grid-cols-[0.4fr_2.2fr_1fr_1fr_2.2fr_1fr_2.5fr] gap-2 items-center text-gray-600 py-3 px-6 border-b hover:bg-gray-50'
          >
            <p className='max-sm:hidden font-medium text-gray-400'>{index + 1}</p>

            <div className='flex items-center gap-2'>
              <img className='w-9 h-9 rounded-full object-cover border' src={item.userData?.image} alt="" />
              <div>
                <p className="font-bold text-gray-900 text-xs sm:text-sm">{item.userData?.name}</p>
              </div>
            </div>

            <div>
              <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border ${
                item.payment ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {item.payment ? 'Paid Online' : 'CASH'}
              </span>
            </div>

            <p className='max-sm:hidden font-medium text-xs'>{calculateAge(item.userData?.dob)}</p>

            <p className="text-xs font-medium text-gray-800">{item.slotDate} | {item.slotTime}</p>

            <p className="font-semibold text-xs">{currency}{item.amount}</p>

            <div className="flex flex-wrap items-center gap-1.5">
              {item.cancelled ? (
                <span className='text-red-500 text-xs font-semibold bg-red-50 px-2 py-1 rounded-md'>Cancelled</span>
              ) : (
                <>
                  {/* Join Video Call Button */}
                  <button
                    onClick={() => navigate(`/doctor-consultation/${item._id}`)}
                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition shadow-2xs flex items-center gap-1 cursor-pointer"
                    title="Join Video Consultation Room"
                  >
                    <span>📹</span> Call
                  </button>

                  {/* Prescription Button */}
                  <button
                    onClick={() => setSelectedAppointment(item)}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition shadow-2xs flex items-center gap-1 cursor-pointer"
                    title="Create Digital Prescription"
                  >
                    <span>📝</span> Rx
                  </button>

                  {/* Actions for Complete / Cancel */}
                  {!item.isCompleted && (
                    <div className='flex items-center gap-1 ml-1'>
                      <img
                        onClick={() => cancelAppointment(item._id)}
                        className='w-7 cursor-pointer hover:scale-110 transition'
                        src={assets.cancel_icon}
                        alt="Cancel"
                        title="Cancel Appointment"
                      />
                      <img
                        onClick={() => completeAppointment(item._id)}
                        className='w-7 cursor-pointer hover:scale-110 transition'
                        src={assets.tick_icon}
                        alt="Complete"
                        title="Mark Completed"
                      />
                    </div>
                  )}

                  {item.isCompleted && (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Completed
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Prescription Modal */}
      {selectedAppointment && (
        <CreatePrescriptionModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onSuccess={() => {
            getAppointments();
          }}
        />
      )}
    </div>
  );
};

export default DoctorAppointments;
