using IndieAccessPass.API.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SendGrid;
using SendGrid.Helpers.Mail;
using System;
using System.Threading.Tasks;

    /// <summary>
    /// Service for sending emails using SendGrid.
    /// Implements the <see cref="IEmailService"/> interface.
    /// </summary>
    namespace IndieAccessPass.API.Services
    {
        public class EmailService : IEmailService
        {
            private readonly IConfiguration _configuration;
            private readonly ILogger<EmailService> _logger;
            private readonly string _apiKey;
            private readonly string _senderEmail;
            private readonly string _senderName;

            /// <summary>
            /// Initializes a new instance of the <see cref="EmailService"/> class.
            /// Retrieves SendGrid API key, sender email, and sender name from configuration.
            /// </summary>
            /// <param name="configuration">The application configuration, used to access email settings.</param>
            /// <param name="logger">The logger for this service.</param>
            /// <exception cref="InvalidOperationException">Thrown if essential email settings (ApiKey, SenderEmail, SenderName) are not configured or are empty.</exception>
            public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
            {
                _configuration = configuration;
                _logger = logger;

                // Retrieve email settings from configuration.
                // Throw an exception if critical settings are missing or empty to prevent runtime errors.
                _apiKey = _configuration["EmailSettings:ApiKey"] ?? throw new InvalidOperationException("SendGrid API Key (EmailSettings:ApiKey) is not configured in appsettings.json.");
                _senderEmail = _configuration["EmailSettings:SenderEmail"] ?? throw new InvalidOperationException("Sender Email (EmailSettings:SenderEmail) is not configured in appsettings.json.");
                _senderName = _configuration["EmailSettings:SenderName"] ?? throw new InvalidOperationException("Sender Name (EmailSettings:SenderName) is not configured in appsettings.json.");

                if (string.IsNullOrWhiteSpace(_apiKey))
                {
                    throw new InvalidOperationException("EmailSettings:ApiKey cannot be empty. Please provide a valid SendGrid API Key.");
                }
                if (string.IsNullOrWhiteSpace(_senderEmail))
                {
                    throw new InvalidOperationException("EmailSettings:SenderEmail cannot be empty. Please provide a valid sender email address.");
                }
                if (string.IsNullOrWhiteSpace(_senderName))
                {
                    throw new InvalidOperationException("EmailSettings:SenderName cannot be empty. Please provide a sender name.");
                }
                _logger.LogInformation("EmailService initialized. Sender: {SenderName} <{SenderEmail}>", _senderName, _senderEmail);
            }

            /// <summary>
            /// Sends a registration confirmation email to a new user.
            /// </summary>
            /// <param name="user">The user who has just registered. Must not be null and must have a valid email address.</param>
            /// <returns>A task representing the asynchronous operation.</returns>
            public async Task SendRegistrationConfirmationEmailAsync(User user)
            {
                if (user == null)
                {
                    _logger.LogWarning("[SendRegistrationConfirmationEmailAsync] Attempted to send email to a null user object.");
                    return; // Or throw ArgumentNullException
                }
                if (string.IsNullOrWhiteSpace(user.Email))
                {
                    _logger.LogWarning("[SendRegistrationConfirmationEmailAsync] User (ID: {UserId}) email is null or empty. Cannot send registration email.", user.Id);
                    return; // Or throw ArgumentException
                }
                 if (string.IsNullOrWhiteSpace(user.Username))
                {
                    _logger.LogWarning("[SendRegistrationConfirmationEmailAsync] User (ID: {UserId}) username is null or empty. Using email as fallback for greeting.", user.Id);
                    // Potentially use email as a fallback for username in greeting if absolutely necessary, or make username mandatory for email.
                }


                var client = new SendGridClient(_apiKey);
                var from = new EmailAddress(_senderEmail, _senderName);
                var subject = "Welcome to IndieAccess Pass!";
                var to = new EmailAddress(user.Email, user.Username ?? user.Email); // Use username if available, else email
                var plainTextContent = $"Hi {user.Username ?? "there"},\n\nWelcome to IndieAccess Pass! We're excited to have you.\n\nThanks,\nThe IndieAccess Pass Team";
                var htmlContent = $"<p>Hi {user.Username ?? "there"},</p>" +
                                    "<p>Welcome to IndieAccess Pass! We're excited to have you.</p>" +
                                    "<p>Thanks,<br>The IndieAccess Pass Team</p>";
                var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);
                _logger.LogInformation("[SendRegistrationConfirmationEmailAsync] Preparing to send registration email to {UserEmail}", user.Email);

                try
                {
                    var response = await client.SendEmailAsync(msg);
                    if (response.IsSuccessStatusCode)
                    {
                        _logger.LogInformation("[SendRegistrationConfirmationEmailAsync] Registration confirmation email sent successfully to {UserEmail}. Status Code: {StatusCode}", user.Email, response.StatusCode);
                    }
                    else
                    {
                        string responseBody = await response.Body.ReadAsStringAsync();
                        _logger.LogError("[SendRegistrationConfirmationEmailAsync] Failed to send registration confirmation email to {UserEmail}. Status Code: {StatusCode}. Response Body: {ResponseBody}", user.Email, response.StatusCode, responseBody);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "[SendRegistrationConfirmationEmailAsync] Exception occurred while sending registration confirmation email to {UserEmail}.", user.Email);
                    // Depending on policy, might re-throw or handle silently.
                }
            }

            /// <summary>
            /// Sends a reservation confirmation email to a user.
            /// </summary>
            /// <param name="reservation">The reservation details. Must not be null.
            /// The <see cref="Reservation.User"/> and <see cref="Reservation.Event"/> navigation properties must be loaded and valid.
            /// </param>
            /// <returns>A task representing the asynchronous operation.</returns>
            public async Task SendReservationConfirmationEmailAsync(Reservation reservation)
            {
                if (reservation == null)
                {
                     _logger.LogWarning("[SendReservationConfirmationEmailAsync] Attempted to send email for a null reservation object.");
                    return;
                }
                if (reservation.User == null || string.IsNullOrWhiteSpace(reservation.User.Email))
                {
                    _logger.LogWarning("[SendReservationConfirmationEmailAsync] Reservation (ID: {ReservationId}) user or user email is null/empty. Cannot send confirmation email.", reservation.Id);
                    return;
                }
                if (reservation.Event == null)
                {
                     _logger.LogWarning("[SendReservationConfirmationEmailAsync] Reservation (ID: {ReservationId}) event data is null. Cannot send confirmation email.", reservation.Id);
                    return;
                }
                // It's good practice to ensure Event.Venue is loaded if you intend to use it in the email,
                // though current template doesn't explicitly use reservation.Event.Venue.Name for example.
                // if (reservation.Event.Venue == null)
                // {
                //     _logger.LogWarning("[SendReservationConfirmationEmailAsync] Reservation (ID: {ReservationId}) event venue data is null.", reservation.Id);
                //     // Decide if this is critical for the email content.
                // }


                var client = new SendGridClient(_apiKey);
                var from = new EmailAddress(_senderEmail, _senderName);
                var subject = $"Your IndieAccess Pass Reservation for {reservation.Event.Name} is Confirmed!";
                var to = new EmailAddress(reservation.User.Email, reservation.User.Username ?? reservation.User.Email);

                var plainTextContent = $"Hi {reservation.User.Username ?? "there"},\n\n" +
                                       $"Your reservation for {reservation.Event.Name} is confirmed!\n\n" +
                                       $"Event: {reservation.Event.Name}\n" +
                                       $"Date: {reservation.Event.EventDate:MMMM dd, yyyy HH:mm} (UTC)\n" + // Specify UTC if applicable
                                       // Example if Venue was guaranteed: $"Venue: {reservation.Event.Venue.Name}\n" +
                                       $"Number of Tickets: {reservation.NumberOfTickets}\n" +
                                       $"Total Price: ${reservation.TotalPrice:F2}\n" +
                                       $"Booking Reference: {reservation.UniqueBookingReference}\n\n" + // Using UniqueBookingReference
                                       "We look forward to seeing you there!\n\n" +
                                       "Thanks,\nThe IndieAccess Pass Team";

                var htmlContent = $"<p>Hi {reservation.User.Username ?? "there"},</p>" +
                                  $"<p>Your reservation for <strong>{reservation.Event.Name}</strong> is confirmed!</p>" +
                                  "<h3>Reservation Details:</h3>" +
                                  "<ul>" +
                                  $"<li><strong>Event:</strong> {reservation.Event.Name}</li>" +
                                  $"<li><strong>Date:</strong> {reservation.Event.EventDate:MMMM dd, yyyy HH:mm} (UTC)</li>" + // Specify UTC
                                  // Example if Venue was guaranteed: $"<li><strong>Venue:</strong> {reservation.Event.Venue.Name}</li>" +
                                  $"<li><strong>Number of Tickets:</strong> {reservation.NumberOfTickets}</li>" +
                                  $"<li><strong>Total Price:</strong> ${reservation.TotalPrice:F2}</li>" +
                                  $"<li><strong>Booking Reference:</strong> {reservation.UniqueBookingReference}</li>" + // Using UniqueBookingReference
                                  "</ul>" +
                                  "<p>We look forward to seeing you there!</p>" +
                                  "<p>Thanks,<br>The IndieAccess Pass Team</p>";

                var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);
                _logger.LogInformation("[SendReservationConfirmationEmailAsync] Preparing to send reservation confirmation email to {UserEmail} for Reservation ID: {ReservationId}", reservation.User.Email, reservation.Id);


                try
                {
                    var response = await client.SendEmailAsync(msg);
                    if (response.IsSuccessStatusCode)
                    {
                        _logger.LogInformation("[SendReservationConfirmationEmailAsync] Reservation confirmation email sent successfully to {UserEmail} for Reservation ID: {ReservationId}. Status Code: {StatusCode}", reservation.User.Email, reservation.Id, response.StatusCode);
                    }
                    else
                    {
                        string responseBody = await response.Body.ReadAsStringAsync();
                        _logger.LogError("[SendReservationConfirmationEmailAsync] Failed to send reservation confirmation email to {UserEmail} for Reservation ID: {ReservationId}. Status Code: {StatusCode}. Response Body: {ResponseBody}", reservation.User.Email, reservation.Id, response.StatusCode, responseBody);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "[SendReservationConfirmationEmailAsync] Exception occurred while sending reservation confirmation email to {UserEmail} for Reservation ID: {ReservationId}.", reservation.User.Email, reservation.Id);
                }
            }

            /// <summary>
            /// Sends a reservation cancellation email to a user.
            /// </summary>
            /// <param name="reservation">The reservation that has been cancelled. Must not be null.
            /// The <see cref="Reservation.User"/> and <see cref="Reservation.Event"/> navigation properties must be loaded and valid.
            /// </param>
            /// <returns>A task representing the asynchronous operation.</returns>
            public async Task SendReservationCancellationEmailAsync(Reservation reservation)
            {
                if (reservation == null)
                {
                    _logger.LogWarning("[SendReservationCancellationEmailAsync] Attempted to send email for a null reservation object.");
                    return;
                }
                 if (reservation.User == null || string.IsNullOrWhiteSpace(reservation.User.Email))
                {
                    _logger.LogWarning("[SendReservationCancellationEmailAsync] Reservation (ID: {ReservationId}) user or user email is null/empty. Cannot send cancellation email.", reservation.Id);
                    return;
                }
                if (reservation.Event == null)
                {
                    _logger.LogWarning("[SendReservationCancellationEmailAsync] Reservation (ID: {ReservationId}) event data is null. Cannot send cancellation email.", reservation.Id);
                    return;
                }

                var client = new SendGridClient(_apiKey);
                var from = new EmailAddress(_senderEmail, _senderName);
                var subject = $"Your IndieAccess Pass Reservation for {reservation.Event.Name} has been Cancelled";
                var to = new EmailAddress(reservation.User.Email, reservation.User.Username ?? reservation.User.Email);

                var plainTextContent = $"Hi {reservation.User.Username ?? "there"},\n\n" +
                                       $"Your reservation for {reservation.Event.Name} (Booking Reference: {reservation.UniqueBookingReference}) has been successfully cancelled.\n\n" +
                                       $"Event: {reservation.Event.Name}\n" +
                                       $"Date: {reservation.Event.EventDate:MMMM dd, yyyy HH:mm} (UTC)\n\n" + // Specify UTC
                                       "If you did not request this cancellation, please contact our support team immediately.\n\n" +
                                       "Thanks,\nThe IndieAccess Pass Team";

                var htmlContent = $"<p>Hi {reservation.User.Username ?? "there"},</p>" +
                                  $"<p>Your reservation for <strong>{reservation.Event.Name}</strong> (Booking Reference: {reservation.UniqueBookingReference}) has been successfully cancelled.</p>" +
                                  "<h3>Cancelled Reservation Details:</h3>" +
                                  "<ul>" +
                                  $"<li><strong>Event:</strong> {reservation.Event.Name}</li>" +
                                  $"<li><strong>Date:</strong> {reservation.Event.EventDate:MMMM dd, yyyy HH:mm} (UTC)</li>" + // Specify UTC
                                  $"<li><strong>Booking Reference:</strong> {reservation.UniqueBookingReference}</li>" +
                                  "</ul>" +
                                  "<p>If you did not request this cancellation, please contact our support team immediately.</p>" +
                                  "<p>Thanks,<br>The IndieAccess Pass Team</p>";

                var msg = MailHelper.CreateSingleEmail(from, to, subject, plainTextContent, htmlContent);
                 _logger.LogInformation("[SendReservationCancellationEmailAsync] Preparing to send reservation cancellation email to {UserEmail} for Reservation ID: {ReservationId}", reservation.User.Email, reservation.Id);

                try
                {
                    var response = await client.SendEmailAsync(msg);
                    if (response.IsSuccessStatusCode)
                    {
                        _logger.LogInformation("[SendReservationCancellationEmailAsync] Reservation cancellation email sent successfully to {UserEmail} for Reservation ID: {ReservationId}. Status Code: {StatusCode}", reservation.User.Email, reservation.Id, response.StatusCode);
                    }
                    else
                    {
                        string responseBody = await response.Body.ReadAsStringAsync();
                        _logger.LogError("[SendReservationCancellationEmailAsync] Failed to send reservation cancellation email to {UserEmail} for Reservation ID: {ReservationId}. Status Code: {StatusCode}. Response Body: {ResponseBody}", reservation.User.Email, reservation.Id, response.StatusCode, responseBody);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "[SendReservationCancellationEmailAsync] Exception occurred while sending reservation cancellation email to {UserEmail} for Reservation ID: {ReservationId}.", reservation.User.Email, reservation.Id);
                }
            }
        }
}