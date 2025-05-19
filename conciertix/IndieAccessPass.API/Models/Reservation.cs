using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

    /// <summary>
    /// Represents a user's reservation for an event.
    /// </summary>
    namespace IndieAccessPass.API.Models
    {
        public class Reservation
        {
            /// <summary>
            /// Gets or sets the unique identifier for the reservation.
            /// This is the primary key.
            /// </summary>
            [Key]
            public Guid Id { get; set; }

            /// <summary>
            /// Gets or sets the unique identifier of the user who made the reservation.
            /// This is a foreign key to the <see cref="User"/> entity.
            /// </summary>
            [Required(ErrorMessage = "User ID is required for the reservation.")]
            public Guid UserId { get; set; }

            /// <summary>
            /// Gets or sets the navigation property for the user who made the reservation. This field is required.
            /// </summary>
            [ForeignKey("UserId")]
            public required User User { get; set; }

            /// <summary>
            /// Gets or sets the unique identifier of the event for which the reservation is made.
            /// This is a foreign key to the <see cref="Event"/> entity.
            /// </summary>
            [Required(ErrorMessage = "Event ID is required for the reservation.")]
            public Guid EventId { get; set; }

            /// <summary>
            /// Gets or sets the navigation property for the event to which this reservation belongs. This field is required.
            /// </summary>
            [ForeignKey("EventId")]
            public required Event Event { get; set; }

            /// <summary>
            /// Gets or sets the number of tickets reserved. This field is required and must be at least 1.
            /// </summary>
            [Required(ErrorMessage = "Number of tickets is required.")]
            [Range(1, int.MaxValue, ErrorMessage = "Number of tickets must be at least 1.")]
            public int NumberOfTickets { get; set; }

            /// <summary>
            /// Gets or sets the date and time when the reservation was made. This field is required.
            /// </summary>
            [Required(ErrorMessage = "Reservation date is required.")]
            public DateTime ReservationDate { get; set; }

            /// <summary>
            /// Gets or sets the total price for the reservation. This field is required.
            /// The value is stored with a precision of 18 digits, with 2 decimal places.
            /// </summary>
            [Required(ErrorMessage = "Total price is required.")]
            [Column(TypeName = "decimal(18,2)")]
            [Range(0, (double)decimal.MaxValue, ErrorMessage = "Total price cannot be negative.")]
            public decimal TotalPrice { get; set; }

            /// <summary>
            /// Gets or sets the unique booking reference code for this reservation. This field is required.
            /// </summary>
            [Required(ErrorMessage = "Unique booking reference is required.")]
            [StringLength(100, ErrorMessage = "Unique booking reference cannot exceed 100 characters.")]
            // TODO: Consider adding an index if this field is frequently queried.
            // modelBuilder.Entity<Reservation>().HasIndex(r => r.UniqueBookingReference).IsUnique(); (in DbContext)
            public required string UniqueBookingReference { get; set; }

            /// <summary>
            /// Gets or sets the status of the reservation (e.g., "Confirmed", "PendingPayment", "Cancelled"). This field is required.
            /// </summary>
            /// <remarks>
            /// Consider using an enum for Status for better type safety and to restrict possible values.
            /// </remarks>
            [Required(ErrorMessage = "Reservation status is required.")]
            [StringLength(20, ErrorMessage = "Status cannot exceed 20 characters.")] // Example length
            public required string Status { get; set; }
        }
    }