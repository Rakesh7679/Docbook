import dotenv from 'dotenv';
import connectDB from './config/mongodb.js';
import doctorModel from './models/doctorModel.js';

dotenv.config();

async function checkDoctors() {
    try {
        await connectDB();
        
        const allDoctors = await doctorModel.find({});
        const availableDoctors = await doctorModel.find({ available: true });
        
        console.log('Total doctors in DB:', allDoctors.length);
        console.log('Available doctors:', availableDoctors.length);
        
        if (allDoctors.length > 0) {
            console.log('\nFirst 3 doctors:');
            allDoctors.slice(0, 3).forEach((doc, index) => {
                console.log(`${index + 1}. ${doc.name} - ${doc.speciality} - Available: ${doc.available}`);
            });
        } else {
            console.log('No doctors found in database!');
        }
        
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkDoctors();
