class TicketDTO {
  constructor(ticket) {
    this.ticketNumber = ticket.ticket_number;
    this.status = ticket.status;
  }
}

module.exports = TicketDTO;
