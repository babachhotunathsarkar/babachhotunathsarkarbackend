import DarbarBooking from '../models/DarbarBooking.js';
import TokenSetting from '../models/TokenSetting.js';
import { sendBookingConfirmationEmail } from '../utils/mailer.js';
import moment from 'moment';

// Utility to get the upcoming Sunday for cutoff calculation (in IST)
export const getUpcomingSunday = () => {
    let now = moment().utcOffset("+05:30");
    let day = now.day();
    let diff = (7 - day) % 7;
    
    // If it is Sunday after 1 PM, move to next Sunday
    if (day === 0 && now.hour() >= 13) {
        diff = 7;
    }
    
    let sunday = now.add(diff, 'days').toDate();
    sunday.setHours(0, 0, 0, 0);
    return sunday;
};

// Check if booking is currently open (in IST)
export const isBookingOpen = () => {
    const now = moment().utcOffset("+05:30");
    
    // Saturday is 6, Sunday is 0
    if (now.day() === 6 && now.hour() >= 16) {
        return true; // Sat >= 4 PM
    }
    
    if (now.day() === 0 && now.hour() < 13) {
        return true; // Sunday before 1 PM
    }
    
    return false;
};

// 1. Create a Booking
// 1. Create a Booking
export const createBooking = async (req, res) => {
    try {
        if (!isBookingOpen()) {
            return res.status(400).json({ message: "Booking opens on Saturday at 4:00 PM and closes on Sunday at 1:00 PM." });
        }

        const { devoteeName, phoneNumber, city, numberOfPeople, notes, email } = req.body;
        const darbarDate = getUpcomingSunday();
        darbarDate.setHours(0, 0, 0, 0);

        // ✅ Email se duplicate check
        if (email) {
            const existingEmail = await DarbarBooking.findOne({ email, darbarDate });
            if (existingEmail) {
                return res.status(400).json({ 
                    message: "Aapne is Sunday ke liye already token book kar liya hai!" 
                });
            }
        }

        // ✅ Phone se duplicate check
        const existingPhone = await DarbarBooking.findOne({ phoneNumber, darbarDate });
        if (existingPhone) {
            return res.status(400).json({ 
                message: "Is phone number se is Sunday ke liye already booking ho chuki hai!" 
            });
        }

        const now = moment();
        const bookingTime = now.format("HH:mm");

        const exactSameTimeBooking = await DarbarBooking.findOne({ darbarDate, bookingTime });
        if (exactSameTimeBooking) {
            return res.status(400).json({ message: "Please wait a minute and try again." });
        }

        let tokenSetting = await TokenSetting.findOne({ darbarDate });
        if (!tokenSetting) {
            tokenSetting = new TokenSetting({ darbarDate, currentTokenNumber: 0 });
        }
        tokenSetting.currentTokenNumber += 1;
        await tokenSetting.save();

        const tokenNumber = tokenSetting.currentTokenNumber;

        const newBooking = new DarbarBooking({
            devoteeName, phoneNumber, email, city,
            numberOfPeople, darbarDate, tokenNumber, bookingTime, notes
        });

        await newBooking.save();

        // ✅ Email background mein bhejo (await mat karo)
        if (email) {
            sendBookingConfirmationEmail({
                devoteeName, tokenNumber, darbarDate, numberOfPeople, email
            }).catch(err => console.error("Email error:", err));
        }

        return res.status(201).json({ message: "Booking successful!", tokenNumber, darbarDate });

    } catch (error) {
        console.error("Booking error:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
};

// 2. Admin: Get all Bookings
export const getAllBookings = async (req, res) => {
    try {
        const { date } = req.query;
        let query = {};
        if (date) {
            query.darbarDate = new Date(date);
        }
        
        const bookings = await DarbarBooking.find(query).sort({ tokenNumber: 1 });
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: "Error fetching bookings" });
    }
};

// 3. Admin: Reset Tokens for a specific date
export const resetTokens = async (req, res) => {
    try {
        const darbarDate = getUpcomingSunday();
        darbarDate.setHours(0,0,0,0);
        
        let tokenSetting = await TokenSetting.findOne({ darbarDate });
        if (tokenSetting) {
             tokenSetting.currentTokenNumber = 0;
             await tokenSetting.save();
        } else {
             tokenSetting = new TokenSetting({ darbarDate: darbarDate, currentTokenNumber: 0 });
             await tokenSetting.save();
        }

        res.status(200).json({ message: "Tokens resetting successful for upcoming Darbar." });
    } catch (error) {
         res.status(500).json({ message: "Error resetting tokens" });
    }
};

// 4. Admin: Delete Booking
export const deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;
        await DarbarBooking.findByIdAndDelete(id);
        res.status(200).json({ message: "Booking deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting booking" });
    }
};

// 5. Admin: Update Booking
export const updateBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;
        
        const booking = await DarbarBooking.findByIdAndUpdate(id, updatedData, { new: true });
        res.status(200).json({ message: "Booking updated successfully", booking });
    } catch (error) {
        res.status(500).json({ message: "Error updating booking" });
    }
};

// 6. User: Get User Latest Booking
export const getUserBooking = async (req, res) => {
     try {
         const { phoneNumber } = req.params;
         const latestBooking = await DarbarBooking.findOne({ phoneNumber })
                                    .sort({ createdAt: -1 });

         if (!latestBooking) {
              return res.status(404).json({ message: "No booking found for this phone number." });
         }
         res.status(200).json(latestBooking);
     } catch (error) {
         res.status(500).json({ message: "Error looking up booking." });
     }
};

// 7. User: Get All User Bookings (For Date Segregation)
export const getUserAllBookings = async (req, res) => {
     try {
         const { phoneNumber } = req.params;
         const bookings = await DarbarBooking.find({ phoneNumber }).sort({ darbarDate: -1 });
         
         res.status(200).json(bookings);
     } catch (error) {
         res.status(500).json({ message: "Error fetching user bookings." });
     }
};
