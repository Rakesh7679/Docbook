import React, { useState, useContext } from 'react';
import { DoctorContext } from '../../context/DoctorContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const CreatePrescriptionModal = ({ appointment, onClose, onSuccess }) => {
  const { dToken, backendUrl } = useContext(DoctorContext);

  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [medicines, setMedicines] = useState([
    { name: '', dosage: '1 tablet', frequency: '2 times/day', duration: '5 days', instructions: 'After food' }
  ]);
  const [loading, setLoading] = useState(false);

  const handleAddMedicine = () => {
    setMedicines((prev) => [
      ...prev,
      { name: '', dosage: '1 tablet', frequency: '2 times/day', duration: '5 days', instructions: 'After food' }
    ]);
  };

  const handleRemoveMedicine = (index) => {
    if (medicines.length === 1) {
      toast.warn("At least one medicine is required");
      return;
    }
    setMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index, field, value) => {
    setMedicines((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!diagnosis.trim()) {
      toast.error("Please enter diagnosis");
      return;
    }

    // Validate medicines
    for (let i = 0; i < medicines.length; i++) {
      if (!medicines[i].name.trim()) {
        toast.error(`Please enter name for medicine #${i + 1}`);
        return;
      }
    }

    try {
      setLoading(true);
      const { data } = await axios.post(
        `${backendUrl}/api/prescription/create`,
        {
          appointmentId: appointment._id,
          diagnosis,
          medicines,
          notes,
          followUpDate
        },
        { headers: { dtoken: dToken } }
      );

      if (data.success) {
        toast.success(data.message || "Prescription created successfully!");
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(data.message || "Failed to create prescription");
      }
    } catch (err) {
      console.error("Create prescription error:", err);
      toast.error(err.response?.data?.message || "Server error creating prescription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl max-h-[92vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🩺</span>
            <div>
              <h3 className="font-bold text-base">Create Digital Prescription</h3>
              <p className="text-xs text-slate-300">
                Patient: {appointment.userData?.name} | Appt Date: {appointment.slotDate} ({appointment.slotTime})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold text-lg"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5 text-sm text-gray-700">
          
          {/* Diagnosis */}
          <div>
            <label className="block font-bold text-gray-800 mb-1">
              Diagnosis / Clinical Impression <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Acute Upper Respiratory Tract Infection / Seasonal Flu"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white text-sm"
            />
          </div>

          {/* Medicines Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-bold text-gray-800 flex items-center gap-1">
                <span>Prescribed Medicines</span>
                <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAddMedicine}
                className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-lg transition border border-indigo-200 flex items-center gap-1 cursor-pointer"
              >
                ➕ Add Medicine
              </button>
            </div>

            <div className="space-y-3">
              {medicines.map((med, index) => (
                <div key={index} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-600">Medicine #{index + 1}</span>
                    {medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(index)}
                        className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-0.5 rounded hover:bg-red-50 transition"
                      >
                        🗑️ Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="md:col-span-2">
                      <label className="text-[11px] font-semibold text-gray-500">Medicine Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Paracetamol 500mg"
                        value={med.name}
                        onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                        className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-gray-500">Dosage</label>
                      <input
                        type="text"
                        placeholder="1 tablet"
                        value={med.dosage}
                        onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                        className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-gray-500">Frequency</label>
                      <input
                        type="text"
                        placeholder="2 times/day"
                        value={med.frequency}
                        onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                        className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-gray-500">Duration</label>
                      <input
                        type="text"
                        placeholder="5 days"
                        value={med.duration}
                        onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                        className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-gray-500">Instructions</label>
                      <input
                        type="text"
                        placeholder="After food / Warm water"
                        value={med.instructions}
                        onChange={(e) => handleMedicineChange(index, 'instructions', e.target.value)}
                        className="w-full p-2 bg-white border border-gray-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes & Follow-up */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1 text-xs">Doctor Additional Notes</label>
              <textarea
                rows="2"
                placeholder="Drink warm liquids, get plenty of rest, avoid cold beverages..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1 text-xs">Follow-up Date (Optional)</label>
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => setFollowUpDate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-600 hover:bg-gray-100 rounded-xl font-medium text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              {loading ? "Generating Prescription..." : "Save & Issue Prescription"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreatePrescriptionModal;
