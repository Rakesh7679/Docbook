import PDFDocument from 'pdfkit';

/**
 * Generates a professional medical digital prescription PDF buffer
 */
export const generatePrescriptionPDF = (prescription, doctor, patient, appointment) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers = [];

      doc.on('data', buffer => buffers.push(buffer));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', err => reject(err));

      // Color Palette
      const primaryColor = '#4F46E5'; // Indigo
      const secondaryColor = '#1F2937'; // Dark Gray
      const lightBg = '#F3F4F6';
      const borderColor = '#E5E7EB';

      // --- HEADER ---
      doc.rect(40, 40, 515, 65).fill(primaryColor);

      doc.fillColor('#FFFFFF')
         .fontSize(22)
         .font('Helvetica-Bold')
         .text('DocBook Medical Center', 55, 52);

      doc.fontSize(10)
         .font('Helvetica')
         .text('Official Digital Telemedicine & Clinical Prescription', 55, 78);

      doc.fontSize(9)
         .text(`Rx ID: ${prescription._id.toString().substring(0, 10).toUpperCase()}`, 400, 55, { align: 'right' })
         .text(`Date: ${new Date(prescription.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`, 400, 72, { align: 'right' });

      doc.moveDown(2);
      let currentY = 120;

      // --- DOCTOR & PATIENT DETAILS BOX ---
      // Doctor Box (Left)
      doc.rect(40, currentY, 250, 90).fillAndStroke(lightBg, borderColor);
      doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold').text('DOCTOR DETAILS', 50, currentY + 10);
      doc.fillColor(secondaryColor).fontSize(10).font('Helvetica-Bold').text(`Dr. ${doctor.name || 'N/A'}`, 50, currentY + 28);
      doc.fontSize(9).font('Helvetica')
         .text(`Speciality: ${doctor.speciality || 'General Medicine'}`, 50, currentY + 43)
         .text(`Degree: ${doctor.degree || 'MBBS'}`, 50, currentY + 57)
         .text(`Email: ${doctor.email || ''}`, 50, currentY + 71);

      // Patient Box (Right)
      doc.rect(305, currentY, 250, 90).fillAndStroke(lightBg, borderColor);
      doc.fillColor(primaryColor).fontSize(11).font('Helvetica-Bold').text('PATIENT DETAILS', 315, currentY + 10);
      doc.fillColor(secondaryColor).fontSize(10).font('Helvetica-Bold').text(patient.name || 'N/A', 315, currentY + 28);
      doc.fontSize(9).font('Helvetica')
         .text(`Gender: ${patient.gender || 'Not specified'}`, 315, currentY + 43)
         .text(`DOB: ${patient.dob || 'N/A'}`, 315, currentY + 57)
         .text(`Appt Slot: ${appointment.slotDate || ''} (${appointment.slotTime || ''})`, 315, currentY + 71);

      currentY += 105;

      // --- DIAGNOSIS SECTION ---
      doc.rect(40, currentY, 515, 45).fillAndStroke('#FEF3C7', '#FCD34D'); // Soft amber
      doc.fillColor('#92400E').fontSize(11).font('Helvetica-Bold').text('DIAGNOSIS / CLINICAL IMPRESSION:', 50, currentY + 8);
      doc.fillColor(secondaryColor).fontSize(10).font('Helvetica').text(prescription.diagnosis || 'General Health Checkup', 50, currentY + 24, { width: 495 });

      currentY += 60;

      // --- RX SYMBOL & MEDICINES TABLE ---
      doc.fillColor(primaryColor).fontSize(24).font('Helvetica-Bold').text('Rx', 40, currentY);
      doc.fillColor(secondaryColor).fontSize(14).font('Helvetica-Bold').text('Prescribed Medications', 75, currentY + 6);

      currentY += 32;

      // Table Header
      doc.rect(40, currentY, 515, 22).fill(primaryColor);
      doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold');
      doc.text('#', 45, currentY + 6, { width: 25, align: 'center' });
      doc.text('Medicine Name', 75, currentY + 6, { width: 140 });
      doc.text('Dosage', 220, currentY + 6, { width: 80 });
      doc.text('Frequency', 305, currentY + 6, { width: 85 });
      doc.text('Duration', 395, currentY + 6, { width: 65 });
      doc.text('Instructions', 465, currentY + 6, { width: 85 });

      currentY += 22;

      // Table Rows
      const medicines = prescription.medicines || [];
      medicines.forEach((med, idx) => {
        const rowBg = idx % 2 === 0 ? '#FFFFFF' : '#F9FAFB';
        doc.rect(40, currentY, 515, 24).fillAndStroke(rowBg, borderColor);

        doc.fillColor(secondaryColor).fontSize(9).font('Helvetica');
        doc.text((idx + 1).toString(), 45, currentY + 7, { width: 25, align: 'center' });
        doc.font('Helvetica-Bold').text(med.name || '', 75, currentY + 7, { width: 140 });
        doc.font('Helvetica').text(med.dosage || '', 220, currentY + 7, { width: 80 });
        doc.text(med.frequency || '', 305, currentY + 7, { width: 85 });
        doc.text(med.duration || '', 395, currentY + 7, { width: 65 });
        doc.text(med.instructions || 'After food', 465, currentY + 7, { width: 85 });

        currentY += 24;
      });

      currentY += 15;

      // --- NOTES & FOLLOW-UP ---
      if (prescription.notes || prescription.followUpDate) {
        doc.rect(40, currentY, 515, 50).fillAndStroke(lightBg, borderColor);
        doc.fillColor(primaryColor).fontSize(10).font('Helvetica-Bold').text('ADDITIONAL INSTRUCTIONS & FOLLOW-UP:', 50, currentY + 8);
        
        let notesText = prescription.notes ? `Notes: ${prescription.notes}` : '';
        let followUpText = prescription.followUpDate ? `Follow-up Date: ${prescription.followUpDate}` : '';
        
        doc.fillColor(secondaryColor).fontSize(9).font('Helvetica')
           .text(`${notesText} ${followUpText}`.trim(), 50, currentY + 24, { width: 495 });

        currentY += 65;
      }

      // --- SIGNATURE & FOOTER ---
      const footerY = 730;
      doc.lineBetween(40, footerY, 555, footerY).strokeColor(borderColor).stroke();

      doc.fillColor(secondaryColor).fontSize(10).font('Helvetica-Bold').text(`Dr. ${doctor.name}`, 380, footerY + 15, { align: 'right' });
      doc.fontSize(8).font('Helvetica').fillColor('#6B7280').text('Digitally Signed & Verified', 380, footerY + 30, { align: 'right' });

      doc.fillColor('#6B7280').fontSize(8).font('Helvetica')
         .text('This is an electronically generated digital prescription issued via DocBook Healthcare Platform.', 40, footerY + 25)
         .text('Valid for clinical & pharmacy fulfillment.', 40, footerY + 37);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
