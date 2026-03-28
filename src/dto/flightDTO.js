class FlightDTO {
  constructor(flight) {
    this.flightNumber = flight.flight_number;
    this.duration = flight.duration;
  }
}

module.exports = FlightDTO;
