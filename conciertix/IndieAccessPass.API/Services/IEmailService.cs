using IndieAccessPass.API.Models;
using System.Threading.Tasks;

    /// <summary>
    /// Defines the contract for an email sending service.
    /// This interface allows for different email service implementations (e.g., SendGrid, SMTP).
    /// </summary>
    namespace IndieAccessPass.API.Services
    {
        public interface IEmailService
        {
            /// <summary>
            /// Sends a registration confirmation email to a new user.
            /// </summary>
            /// <param name="user">The user who has just registered. Must not be null and have a valid email.</param>
            /// <returns>A task representing the asynchronous operation of sending the email.</returns>
            Task SendRegistrationConfirmationEmailAsync(User user);

            /// <summary>
            /// Sends a reservation confirmation email to a user.
            /// </summary>
            /// <param name="reservation">The reservation details. Must not be null.
            /// Associated <see cref="Reservation.User"/> and <see cref="Reservation.Event"/> must be loaded and valid.
            /// </param>
            /// <returns>A task representing the asynchronous operation of sending the email.</returns>
            Task SendReservationConfirmationEmailAsync(Reservation reservation);

            /// <summary>
            /// Sends a reservation cancellation email to a user.
            /// </summary>
            /// <param name="reservation">The reservation that has been cancelled. Must not be null.
            /// Associated <see cref="Reservation.User"/> and <see cref="Reservation.Event"/> must be loaded and valid.
            /// </param>
            /// <returns>A task representing the asynchronous operation of sending the email.</returns>
            Task SendReservationCancellationEmailAsync(Reservation reservation);
        }
    }