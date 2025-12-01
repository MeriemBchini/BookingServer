import Booking from "../models/booking.model.js";

export async function createBooking(apartmentId, startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);


  const conflict = await Booking.findOne({
    apartmentId,
    startDate: { $lte: end },
    endDate: { $gte: start },
  });

  if (conflict) return null;

  const booking = new Booking({ apartmentId, startDate, endDate });
  return await booking.save();
}
