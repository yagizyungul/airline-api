class FlightDTO {
  constructor(flight) {
    this.flightNumber = flight.flight_number;
    this.dateFrom = flight.date_from;
    this.dateTo = flight.date_to;
    this.airportFrom = flight.airport_from;
    this.airportTo = flight.airport_to;
    this.duration = flight.duration;
    this.capacity = flight.capacity;
    this.remainingSeats = flight.remaining_seats;
  }
}

module.exports = FlightDTO;
