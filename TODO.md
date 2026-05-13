# Hotel Reservation System - Implementation TODO

- [ ] Add online payment enforcement (credit/e-wallet) to booking creation (frontend + backend)
- [ ] Auto-confirm booking on creation (status becomes `confirmed` immediately)
- [ ] Strengthen double-booking prevention using DB transaction / overlap check
- [ ] Update DB schema (bookings.payment_method, bookings.payment_status)
- [ ] Block admin from changing status for auto-confirmed bookings (backend enforcement)
- [ ] Update frontend admin logic if necessary (remove pending confirm/cancel expectations)
- [ ] Run backend/frontend tests: overlapping booking + missing payment method

