class PassengerDTO {
  constructor(passenger) {
    this.passengerName = passenger.passenger_name;
    this.seatNumber = passenger.seat_number;
    this.checkedIn = passenger.checked_in;
  }
}

module.exports = PassengerDTO;
