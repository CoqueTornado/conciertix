using Ical.Net;
using Ical.Net.CalendarComponents;
using Ical.Net.DataTypes;
using Ical.Net.Serialization;
using IndieAccessPass.API.Models;
using System.Text;

    /// <summary>
    /// Service for generating iCalendar (.ics) files for events.
    /// </summary>
    namespace IndieAccessPass.API.Services
    {
        public class CalendarService
        {
            /// <summary>
            /// Generates an iCalendar (.ics) file as a byte array for a given reservation.
            /// The .ics file contains event details that can be imported into calendar applications.
            /// </summary>
            /// <param name="reservation">The reservation for which to generate the .ics file.
            /// The <see cref="Reservation.Event"/> and <see cref="Event.Venue"/> navigation properties must be loaded.
            /// </param>
            /// <returns>A byte array representing the .ics file content.</returns>
            /// <exception cref="ArgumentNullException">Thrown if <paramref name="reservation"/>,
            /// <see cref="Reservation.Event"/>, or <see cref="Event.Venue"/> is null,
            /// indicating that required data for .ics generation is missing.
            /// </exception>
            /// <remarks>
            /// The event duration is currently assumed to be 2 hours. This can be adjusted or made dynamic.
            /// Event dates are treated as UTC. Ensure <see cref="Event.EventDate"/> is handled correctly regarding timezones.
            /// The UID for the calendar event is generated using the reservation's unique booking reference.
            /// </remarks>
            public byte[] GenerateIcsFile(Reservation reservation)
            {
                if (reservation == null)
                {
                    throw new ArgumentNullException(nameof(reservation), "Reservation cannot be null.");
                }
                if (reservation.Event == null)
                {
                    throw new ArgumentNullException(nameof(reservation.Event), "Event data must be loaded for the reservation to generate an ICS file.");
                }
                if (reservation.Event.Venue == null)
                {
                    throw new ArgumentNullException(nameof(reservation.Event.Venue), "Venue data must be loaded for the event to generate an ICS file.");
                }

                var calendar = new Calendar();
                calendar.Method = "PUBLISH"; // Standard method for distributing event information.

                var calendarEvent = new CalendarEvent
                {
                    Summary = reservation.Event.Name, // Event title
                    Description = reservation.Event.Description, // Event description
                    // DtStart: Start date and time of the event.
                    // Assumes reservation.Event.EventDate is in UTC or can be correctly interpreted as such by CalDateTime.
                    // If EventDate is local and needs conversion, that should happen before this point or be handled here.
                    DtStart = new CalDateTime(reservation.Event.EventDate, "UTC"), // Specify TimeZoneID as UTC
                    // DtEnd: End date and time of the event.
                    // TODO: Consider making event duration configurable or part of the Event model.
                    DtEnd = new CalDateTime(reservation.Event.EventDate.AddHours(2), "UTC"), // Assuming a 2-hour duration.
                    Location = $"{reservation.Event.Venue.Name}, {reservation.Event.Venue.Address}", // Event location
                    // Uid: A globally unique identifier for the event.
                    // Using the booking reference ensures uniqueness within this system's context.
                    // Appending a domain makes it more globally unique as per iCalendar spec.
                    Uid = $"{reservation.UniqueBookingReference}@indieaccesspass.example.com",
                    // DtStamp: Timestamp of when the iCalendar object was created or last modified.
                    DtStamp = new CalDateTime(DateTime.UtcNow)
                };

                calendar.Events.Add(calendarEvent);

                var serializer = new CalendarSerializer();
                var icsString = serializer.SerializeToString(calendar);

                return Encoding.UTF8.GetBytes(icsString);
            }
        }
    }