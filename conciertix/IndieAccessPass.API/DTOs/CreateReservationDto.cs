using System;
using System.ComponentModel.DataAnnotations;

    /// <summary>
    /// Data Transfer Object for creating a new reservation.
    /// </summary>
    namespace IndieAccessPass.API.DTOs
    {
        public class CreateReservationDto
        {
            /// <summary>
            /// Gets or sets the unique identifier of the event for which the reservation is being made.
            /// This field is required.
            /// </summary>
            [Required(ErrorMessage = "Event ID is required.")]
            public Guid EventId { get; set; }

            /// <summary>
            /// Gets or sets the number of tickets to reserve for the event.
            /// This field is required and must be at least 1.
            /// </summary>
            [Required(ErrorMessage = "Number of tickets is required.")]
            [Range(1, 10, ErrorMessage = "Number of tickets must be between 1 and 10.")] // Example range, adjust as needed
            public int NumberOfTickets { get; set; }
        }
    }