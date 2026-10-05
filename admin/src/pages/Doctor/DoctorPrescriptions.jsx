import React, { useEffect, useState, useContext } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const DoctorPrescriptions = () => {
  const { dToken, backendUrl } = useContext(DoctorContext);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDoctorPrescriptions = async () => {
    if (!dToken) return;
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/prescription/doctor`, {
        headers: { dtoken: dToken }
      });
      if (data.success) {
        setPrescriptions(data.prescriptions || []);
      }
    } catch (err) {
      console.error("Fetch doctor prescriptions error:", err);
      toast.error("Failed to load doctor prescriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorPrescriptions();
  }, [dToken]);

  return (
    <div className="w-full max-w-6xl m-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Issued Digital Prescriptions</h2>
          <p className="text-xs text-gray-500">View and download all digital medical prescriptions issued by you.</p>
        </div>
        <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
          Total: {prescriptions.length}
        </span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-24 bg-gray-100 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center text-gray-500">
          <p className="text-base font-semibold">No prescriptions generated yet</p>
          <p className="text-xs mt-1">You can create digital prescriptions from your appointment list or video calls.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-xl overflow-hidden shadow-xs">
          <div className="grid grid-cols-[0.5fr_2fr_3fr_2fr_1.5fr] gap-2 p-3 px-6 bg-slate-50 border-b text-xs font-bold text-gray-600">
            <p>#</p>
            <p>Patient Name</p>
            <p>Diagnosis</p>
            <p>Medicines Count</p>
            <p>Action</p>
          </div>

          <div className="divide-y divide-gray-200">
            {prescriptions.map((item, index) => (
              <div key={item._id} className="grid grid-cols-[0.5fr_2fr_3fr_2fr_1.5fr] gap-2 p-3 px-6 items-center text-xs text-gray-700 hover:bg-gray-50">
                <p className="font-semibold text-gray-500">{index + 1}</p>
                <div className="flex items-center gap-2">
                  <img
                    src={item.patientData?.image || 'https://via.placeholder.com/100'}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <p className="font-semibold text-gray-900">{item.patientData?.name || 'Patient'}</p>
                </div>
                <p className="font-medium text-amber-900 line-clamp-1">{item.diagnosis}</p>
                <p className="text-gray-600">{item.medicines?.length || 0} Prescribed</p>
                <div>
                  <button
                    onClick={() => window.open(`${backendUrl}/api/prescription/download/${item._id}`, '_blank')}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition cursor-pointer shadow-xs"
                  >
                    ⬇️ Download PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPrescriptions;
