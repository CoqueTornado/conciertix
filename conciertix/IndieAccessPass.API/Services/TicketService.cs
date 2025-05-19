using IndieAccessPass.API.Data;
using IndieAccessPass.API.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using QRCoder;
using System.IO;

    /// <summary>
    /// Service for generating PDF tickets for reservations.
    /// Uses QuestPDF for PDF generation and QRCoder for QR code generation.
    /// </summary>
    namespace IndieAccessPass.API.Services
    {
        public class TicketService
        {
            // private readonly ApplicationDbContext _context; // _context is currently unused. Consider removing if not needed.

            /// <summary>
            /// Initializes a new instance of the <see cref="TicketService"/> class.
            /// </summary>
            /// <param name="context">The database context. Currently unused but kept for potential future use (e.g., fetching additional data).</param>
            public TicketService(ApplicationDbContext context)
            {
                // _context = context; // Assign if needed later.
                // Sets the license for QuestPDF. Community license is used here.
                // This should ideally be configured once at application startup.
                QuestPDF.Settings.License = LicenseType.Community;
            }

            /// <summary>
            /// Generates a PDF ticket for the given reservation.
            /// The PDF includes event details, user information, and a QR code of the unique booking reference.
            /// </summary>
            /// <param name="reservation">The reservation for which to generate the ticket.
            /// It's crucial that the <see cref="Reservation.Event"/>, <see cref="Event.Venue"/>,
            /// and <see cref="Reservation.User"/> navigation properties are loaded before calling this method.
            /// </param>
            /// <returns>A byte array representing the generated PDF ticket.</returns>
            /// <exception cref="ArgumentNullException">Thrown if <paramref name="reservation"/> is null,
            /// or if essential nested properties like <c>reservation.Event</c>, <c>reservation.Event.Venue</c>,
            /// or <c>reservation.User</c> are null, indicating that required data for ticket generation is missing.
            /// </exception>
            /// <remarks>
            /// TODO: Ensure that all necessary data (Event, Venue, User) is eagerly loaded with the reservation object
            /// before it's passed to this method to prevent null reference issues.
            /// The QR code generated contains the <see cref="Reservation.UniqueBookingReference"/>.
            /// </remarks>
            public byte[] GenerateTicketPdf(Reservation reservation)
            {
                // Validate that essential reservation data is present.
                if (reservation == null)
                    throw new ArgumentNullException(nameof(reservation), "Reservation cannot be null.");
                if (reservation.Event == null)
                    throw new ArgumentNullException(nameof(reservation.Event), "Event details must be loaded for the reservation.");
                if (reservation.Event.Venue == null)
                    throw new ArgumentNullException(nameof(reservation.Event.Venue), "Venue details must be loaded for the event.");
                if (reservation.User == null)
                    throw new ArgumentNullException(nameof(reservation.User), "User details must be loaded for the reservation.");
                 if (string.IsNullOrEmpty(reservation.UniqueBookingReference))
                    throw new ArgumentException("UniqueBookingReference cannot be null or empty.", nameof(reservation.UniqueBookingReference));


                var document = Document.Create(container =>
                {
                    container.Page(page =>
                    {
                        page.Size(PageSizes.A6); // Using A6 for a smaller, ticket-like size.
                        page.Margin(1, Unit.Centimetre);
                        page.PageColor(Colors.White);
                        page.DefaultTextStyle(x => x.FontSize(10).FontFamily(Fonts.Arial)); // Default font style.

                        // Header section of the ticket.
                        page.Header()
                            .AlignCenter()
                            .Text("IndieAccess Pass E-Ticket")
                            .SemiBold().FontSize(16).FontColor(Colors.Blue.Medium); // Ticket title.

                        // Main content section of the ticket.
                        page.Content()
                            .PaddingVertical(0.5f, Unit.Centimetre)
                            .Column(column =>
                            {
                                column.Spacing(8); // Spacing between items in the column.

                                // Displaying event name.
                                column.Item().Text(text =>
                                {
                                    text.Span("Event: ").SemiBold();
                                    text.Span(reservation.Event.Name);
                                });

                                // Displaying event date and time.
                                column.Item().Text(text =>
                                {
                                    text.Span("Date: ").SemiBold();
                                    text.Span(reservation.Event.EventDate.ToString("dddd, dd MMMM yyyy 'at' HH:mm"));
                                });

                                // Displaying venue name.
                                column.Item().Text(text =>
                                {
                                    text.Span("Venue: ").SemiBold();
                                    text.Span(reservation.Event.Venue.Name);
                                });
                                
                                // Displaying venue address.
                                column.Item().Text(text =>
                                {
                                    text.Span("Address: ").SemiBold();
                                    text.Span(reservation.Event.Venue.Address);
                                });

                                // Displaying user who booked the ticket.
                                column.Item().Text(text =>
                                {
                                    text.Span("Booked by: ").SemiBold();
                                    text.Span(reservation.User.Username);
                                });

                                // Displaying number of tickets.
                                column.Item().Text(text =>
                                {
                                    text.Span("Tickets: ").SemiBold();
                                    text.Span(reservation.NumberOfTickets.ToString());
                                });

                                // Displaying unique booking reference.
                                column.Item().Text(text =>
                                {
                                    text.Span("Booking Ref: ").SemiBold().FontSize(12);
                                    text.Span(reservation.UniqueBookingReference).Bold().FontSize(12);
                                });

                                column.Spacing(12); // Extra space before the QR Code.

                                // Generating and displaying QR Code.
                                // The QR code contains the UniqueBookingReference for easy scanning.
                                QRCodeGenerator qrGenerator = new QRCodeGenerator();
                                QRCodeData qrCodeData = qrGenerator.CreateQrCode(reservation.UniqueBookingReference, QRCodeGenerator.ECCLevel.Q); // ECCLevel.Q offers good error correction.
                                PngByteQRCode qrCode = new PngByteQRCode(qrCodeData);
                                byte[] qrCodeImageBytes = qrCode.GetGraphic(10); // Size of the QR code modules (pixels).

                                column.Item()
                                    .AlignCenter() // Center the QR code.
                                    .Width(3, Unit.Centimetre) // Define width for the QR code image.
                                    .Image(qrCodeImageBytes); // Embed the QR code image.
                                
                                column.Item().AlignCenter().Text("Scan for entry").FontSize(8).Italic(); // Instruction for QR code.
                            });

                        // Footer section of the ticket.
                        page.Footer()
                            .AlignCenter()
                            .Text(x =>
                            {
                                x.Span("Thank you for using IndieAccess Pass!").FontSize(9);
                            });
                    });
                });

                // Generate the PDF document as a byte array.
                return document.GeneratePdf();
            }
        }
    }