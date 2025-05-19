using System;

    /// <summary>
    /// Data Transfer Object for a reservation.
    /// </summary>
    namespace IndieAccessPass.API.DTOs
    {
        public class ReservationDto
        {
            /// <summary>
            /// Gets or sets the unique identifier for the reservation.
            /// </summary>
            public Guid Id { get; set; }

            /// <summary>
            /// Gets or sets the unique identifier of the event for which the reservation was made.
            /// </summary>
            public Guid EventId { get; set; }

            /// <summary>
            /// Gets or sets the name of the event.
            /// </summary>
            public string EventName { get; set; } = string.Empty;

            /// <summary>
            /// Gets or sets the date and time of the event.
            /// </summary>
            public DateTime EventDate { get; set; }

            /// <summary>
            /// Gets or sets the unique identifier of the user who made the reservation.
            /// </summary>
            public Guid UserId { get; set; }

            /// <summary>
            /// Gets or sets the username of the user who made the reservation.
            /// </summary>
            public string UserName { get; set; } = string.Empty;

            /// <summary>
            /// Gets or sets the number of tickets reserved.
            /// </summary>
            public int NumberOfTickets { get; set; }

            /// <summary>
            /// Gets or sets the date and time when the reservation was made.
            /// </summary>
            public DateTime ReservationDate { get; set; }

            /// <summary>
            /// Gets or sets the total price for the reservation.
            /// </summary>
            public decimal TotalPrice { get; set; }

            /// <summary>
            /// Gets or sets the unique booking reference for the reservation.
            /// </summary>
            public string UniqueBookingReference { get; set; } = string.Empty;

            /// <summary>
            /// Gets or sets the status of the reservation (e.g., "Confirmed", "Cancelled", "PendingPayment").
            /// </summary>
            public string Status { get; set; } = string.Empty;
        }
    }