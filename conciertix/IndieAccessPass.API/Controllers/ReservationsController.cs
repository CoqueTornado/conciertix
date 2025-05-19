using IndieAccessPass.API.Data;
using IndieAccessPass.API.DTOs;
using IndieAccessPass.API.Models;
using IndieAccessPass.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging; // Added for logging

namespace IndieAccessPass.API.Controllers
{
    /// <summary>
    /// API controller for managing event reservations.
    /// </summary>
    [ApiController]
    [Route("api/reservations")]
    public class ReservationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly TicketService _ticketService;
        private readonly IEmailService _emailService;
        private readonly CalendarService _calendarService;
        private readonly ILogger<ReservationsController> _logger;

        /// <summary>
        /// Initializes a new instance of the <see cref="ReservationsController"/> class.
        /// </summary>
        /// <param name="context">The database context.</param>
        /// <param name="ticketService">The service for generating tickets.</param>
        /// <param name="emailService">The service for sending emails.</param>
        /// <param name="calendarService">The service for generating calendar files.</param>
        /// <param name="logger">The logger for this controller.</param>
        public ReservationsController(ApplicationDbContext context, TicketService ticketService, IEmailService emailService, CalendarService calendarService, ILogger<ReservationsController> logger)
        {
            _context = context;
            _ticketService = ticketService;
            _emailService = emailService;
            _calendarService = calendarService;
            _logger = logger;
        }

        /// <summary>
        /// Creates a new reservation for an event. (User authorization required)
        /// </summary>
        /// <param name="createReservationDto">The data transfer object containing reservation details.</param>
        /// <returns>The created reservation details if successful; otherwise, an error response.</returns>
        // POST /api/reservations
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<ReservationDto>> CreateReservation([FromBody] CreateReservationDto createReservationDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid userId))
            {
                _logger.LogWarning("[CreateReservation] Unauthorized attempt: User ID not found or invalid in token.");
                return Unauthorized("User ID not found or invalid.");
            }

            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                _logger.LogWarning($"[CreateReservation] User with ID {userId} not found.");
                return NotFound("User not found.");
            }

            await using var transaction = await _context.Database.BeginTransactionAsync();
            _logger.LogInformation($"[CreateReservation] Beginning transaction for User ID: {userId}, Event ID: {createReservationDto.EventId}");

            try
            {
                var eventToReserve = await _context.Events
                    .Include(e => e.Venue)
                    .FirstOrDefaultAsync(e => e.Id == createReservationDto.EventId);

                if (eventToReserve == null)
                {
                    _logger.LogWarning($"[CreateReservation] Event with ID {createReservationDto.EventId} not found.");
                    return BadRequest("Event not found.");
                }

                if (eventToReserve.Status != "Published")
                {
                    _logger.LogWarning($"[CreateReservation] Attempt to reserve for non-published event ID {eventToReserve.Id}, Status: {eventToReserve.Status}.");
                    return BadRequest("Event is not published and cannot be reserved.");
                }

                if (eventToReserve.AvailableTickets < createReservationDto.NumberOfTickets)
                {
                    _logger.LogWarning($"[CreateReservation] Not enough tickets for event ID {eventToReserve.Id}. Requested: {createReservationDto.NumberOfTickets}, Available: {eventToReserve.AvailableTickets}.");
                    return BadRequest("Not enough tickets available.");
                }
                 if (createReservationDto.NumberOfTickets <= 0)
                {
                    _logger.LogWarning($"[CreateReservation] Invalid number of tickets requested for event ID {eventToReserve.Id}. Requested: {createReservationDto.NumberOfTickets}.");
                    return BadRequest("Number of tickets must be greater than zero.");
                }


                eventToReserve.AvailableTickets -= createReservationDto.NumberOfTickets;

                var reservation = new Reservation
                {
                    EventId = createReservationDto.EventId,
                    UserId = userId,
                    NumberOfTickets = createReservationDto.NumberOfTickets,
                    ReservationDate = DateTime.UtcNow,
                    TotalPrice = eventToReserve.PricePerTicket * createReservationDto.NumberOfTickets,
                    UniqueBookingReference = GenerateUniqueBookingReference(eventToReserve.Id, userId),
                    Status = "Confirmed", // TODO: Consider "PendingPayment" if payment gateway is integrated.
                    User = user,
                    Event = eventToReserve
                };

                _context.Reservations.Add(reservation);
                _context.Events.Update(eventToReserve);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                _logger.LogInformation($"[CreateReservation] Transaction committed. Reservation ID: {reservation.Id} created successfully for User ID: {userId}, Event ID: {eventToReserve.Id}.");


                // Send reservation confirmation email
                try
                {
                    await _emailService.SendReservationConfirmationEmailAsync(reservation);
                    _logger.LogInformation($"[CreateReservation] Confirmation email sent for reservation ID {reservation.Id}.");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"[CreateReservation] Error sending confirmation email for reservation ID {reservation.Id}. User: {user.Email}. This does not roll back the reservation.");
                    // Do not fail the reservation if email sending fails. Log and proceed.
                }

                var reservationDto = new ReservationDto
                {
                    Id = reservation.Id,
                    EventId = reservation.EventId,
                    EventName = eventToReserve.Name,
                    EventDate = eventToReserve.EventDate,
                    UserId = reservation.UserId,
                    UserName = user.Username,
                    NumberOfTickets = reservation.NumberOfTickets,
                    ReservationDate = reservation.ReservationDate,
                    TotalPrice = reservation.TotalPrice,
                    UniqueBookingReference = reservation.UniqueBookingReference,
                    Status = reservation.Status
                };

                return CreatedAtAction(nameof(GetReservationById), new { id = reservation.Id }, reservationDto);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, $"[CreateReservation] Error during reservation creation for User ID: {userId}, Event ID: {createReservationDto.EventId}. Transaction rolled back.");
                return StatusCode(500, "An error occurred while creating the reservation. Please try again.");
            }
        }

        /// <summary>
        /// Gets a paginated list of reservations for the currently authenticated user. (User authorization required)
        /// </summary>
        /// <param name="pageNumber">The page number to retrieve (default is 1).</param>
        /// <param name="pageSize">The number of reservations per page (default is 10).</param>
        /// <returns>A list of the user's reservations.</returns>
        // GET /api/reservations/my-reservations
        [HttpGet("my-reservations")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<ReservationDto>>> GetMyReservations([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid userId))
            {
                 _logger.LogWarning("[GetMyReservations] Unauthorized attempt: User ID not found or invalid in token.");
                return Unauthorized("User ID not found or invalid.");
            }

            var reservations = await _context.Reservations
                .Where(r => r.UserId == userId)
                .Include(r => r.Event)
                .Include(r => r.User)
                .OrderByDescending(r => r.ReservationDate)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new ReservationDto
                {
                    Id = r.Id,
                    EventId = r.EventId,
                    EventName = r.Event.Name, // Assuming Event has a Name property
                    EventDate = r.Event.EventDate, // Assuming Event has an EventDate property
                    UserId = r.UserId,
                    UserName = r.User.Username, // Assuming User has a Username property
                    NumberOfTickets = r.NumberOfTickets,
                    ReservationDate = r.ReservationDate,
                    TotalPrice = r.TotalPrice,
                    UniqueBookingReference = r.UniqueBookingReference,
                    Status = r.Status
                })
                .ToListAsync();
            _logger.LogInformation($"[GetMyReservations] Retrieved {reservations.Count} reservations for User ID: {userId}. Page: {pageNumber}, Size: {pageSize}");
            return Ok(reservations);
        }

        /// <summary>
        /// Gets a specific reservation by its ID. (User authorization required, Admin can access any)
        /// </summary>
        /// <param name="id">The ID of the reservation to retrieve.</param>
        /// <returns>The requested reservation details if found and authorized; otherwise, an error response.</returns>
        // GET /api/reservations/{id}
        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<ReservationDto>> GetReservationById(Guid id)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid userId))
            {
                _logger.LogWarning($"[GetReservationById] Unauthorized attempt for Reservation ID {id}: User ID not found or invalid in token.");
                return Unauthorized("User ID not found or invalid.");
            }

            var reservation = await _context.Reservations
                .Include(r => r.Event)
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (reservation == null)
            {
                _logger.LogWarning($"[GetReservationById] Reservation with ID {id} not found.");
                return NotFound("Reservation not found.");
            }

            bool isAdmin = User.IsInRole("Admin");

            if (!isAdmin && reservation.UserId != userId)
            {
                _logger.LogWarning($"[GetReservationById] Forbidden attempt by User ID {userId} for Reservation ID {id} owned by User ID {reservation.UserId}.");
                return Forbid();
            }

            var reservationDto = new ReservationDto
            {
                Id = reservation.Id,
                EventId = reservation.EventId,
                EventName = reservation.Event.Name,
                EventDate = reservation.Event.EventDate,
                UserId = reservation.UserId,
                UserName = reservation.User.Username,
                NumberOfTickets = reservation.NumberOfTickets,
                ReservationDate = reservation.ReservationDate,
                TotalPrice = reservation.TotalPrice,
                UniqueBookingReference = reservation.UniqueBookingReference,
                Status = reservation.Status
            };
            _logger.LogInformation($"[GetReservationById] Reservation ID {id} retrieved by User ID {userId} (IsAdmin: {isAdmin}).");
            return Ok(reservationDto);
        }

        /// <summary>
        /// Gets the ticket (PDF) for a specific reservation. (User authorization required, Admin can access any)
        /// </summary>
        /// <param name="id">The ID of the reservation for which to get the ticket.</param>
        /// <returns>A PDF file of the ticket if found and authorized; otherwise, an error response.</returns>
        // GET /api/reservations/{id}/ticket
        [HttpGet("{id}/ticket")]
        [Authorize]
        public async Task<IActionResult> GetReservationTicket(Guid id)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid userId))
            {
                _logger.LogWarning($"[GetReservationTicket] Unauthorized attempt for Reservation ID {id}: User ID not found or invalid in token.");
                return Unauthorized("User ID not found or invalid.");
            }

            var reservation = await _context.Reservations
                .Include(r => r.Event)
                    .ThenInclude(e => e.Venue)
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (reservation == null)
            {
                _logger.LogWarning($"[GetReservationTicket] Reservation with ID {id} not found for ticket generation.");
                return NotFound("Reservation not found.");
            }

            bool isAdmin = User.IsInRole("Admin");

            if (!isAdmin && reservation.UserId != userId)
            {
                _logger.LogWarning($"[GetReservationTicket] Forbidden attempt by User ID {userId} for ticket of Reservation ID {id} owned by User ID {reservation.UserId}.");
                return Forbid("You are not authorized to access this ticket.");
            }
             if (reservation.Status != "Confirmed")
            {
                _logger.LogWarning($"[GetReservationTicket] Ticket requested for non-confirmed reservation ID {id}. Status: {reservation.Status}");
                return BadRequest("Ticket can only be generated for confirmed reservations.");
            }


            try
            {
                byte[] pdfBytes = _ticketService.GenerateTicketPdf(reservation);
                _logger.LogInformation($"[GetReservationTicket] Ticket PDF generated for Reservation ID {id}.");
                return File(pdfBytes, "application/pdf", $"IndieAccessPass_Ticket_{reservation.UniqueBookingReference}.pdf");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"[GetReservationTicket] Error generating ticket PDF for Reservation ID {id}.");
                return StatusCode(500, "An error occurred while generating the ticket PDF. Please try again later.");
            }
        }

        /// <summary>
        /// Cancels a reservation. (User authorization required, Admin can cancel any)
        /// </summary>
        /// <param name="id">The ID of the reservation to cancel.</param>
        /// <returns>NoContent if successful; otherwise, an error response.</returns>
        // POST /api/reservations/{id}/cancel
        [HttpPost("{id}/cancel")]
        [Authorize]
        public async Task<IActionResult> CancelReservation(Guid id)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid userId))
            {
                _logger.LogWarning($"[CancelReservation] Unauthorized attempt for Reservation ID {id}: User ID not found or invalid in token.");
                return Unauthorized("User ID not found or invalid.");
            }

            await using var transaction = await _context.Database.BeginTransactionAsync();
            _logger.LogInformation($"[CancelReservation] Beginning transaction for cancelling Reservation ID: {id} by User ID: {userId}.");

            try
            {
                var reservation = await _context.Reservations
                    .Include(r => r.Event)
                        .ThenInclude(e => e.Venue)
                    .Include(r => r.User)
                    .FirstOrDefaultAsync(r => r.Id == id);

                if (reservation == null)
                {
                    _logger.LogWarning($"[CancelReservation] Reservation with ID {id} not found for cancellation.");
                    return NotFound("Reservation not found.");
                }

                bool isAdmin = User.IsInRole("Admin");

                if (!isAdmin && reservation.UserId != userId)
                {
                    _logger.LogWarning($"[CancelReservation] Forbidden attempt by User ID {userId} to cancel Reservation ID {id} owned by User ID {reservation.UserId}.");
                    return Forbid();
                }

                if (reservation.Status == "Cancelled")
                {
                    _logger.LogInformation($"[CancelReservation] Reservation ID {id} is already cancelled.");
                    return BadRequest("Reservation is already cancelled.");
                }
                 // TODO: Add business rule: check if cancellation is allowed (e.g., not too close to event date)
                // if (reservation.Event.EventDate < DateTime.UtcNow.AddDays(1)) // Example: No cancellations within 24 hours
                // {
                //     _logger.LogWarning($"[CancelReservation] Attempt to cancel reservation ID {id} too close to event date.");
                //     return BadRequest("Reservation cannot be cancelled this close to the event date.");
                // }


                var eventToUpdate = reservation.Event;
                if (eventToUpdate == null)
                {
                     await transaction.RollbackAsync();
                     _logger.LogError($"[CancelReservation] Critical error: Associated event not found for Reservation ID {id}. Transaction rolled back.");
                    return StatusCode(500, "Associated event not found for the reservation. Please contact support.");
                }

                reservation.Status = "Cancelled";
                eventToUpdate.AvailableTickets += reservation.NumberOfTickets; // Return tickets to pool

                _context.Reservations.Update(reservation);
                _context.Events.Update(eventToUpdate);

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                _logger.LogInformation($"[CancelReservation] Transaction committed. Reservation ID: {id} cancelled successfully. Tickets returned to Event ID: {eventToUpdate.Id}.");


                // Send reservation cancellation email
                try
                {
                    await _emailService.SendReservationCancellationEmailAsync(reservation);
                    _logger.LogInformation($"[CancelReservation] Cancellation email sent for reservation ID {id}.");
                }
                catch (Exception ex)
                {
                     _logger.LogError(ex, $"[CancelReservation] Error sending cancellation email for reservation ID {id}. User: {reservation.User.Email}. This does not roll back the cancellation.");
                    // Do not fail the cancellation if email sending fails.
                }
                
                // Optionally return the updated DTO, or just NoContent.
                // For simplicity and common practice, NoContent is often preferred for cancellations.
                return NoContent();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, $"[CancelReservation] Error during cancellation for Reservation ID: {id}. Transaction rolled back.");
                return StatusCode(500, "An error occurred while cancelling the reservation. Please try again.");
            }
        }

        /// <summary>
        /// Gets a paginated list of all reservations for a specific event. (Admin only)
        /// </summary>
        /// <param name="eventId">The ID of the event.</param>
        /// <param name="pageNumber">The page number to retrieve (default is 1).</param>
        /// <param name="pageSize">The number of reservations per page (default is 10).</param>
        /// <returns>A list of reservations for the specified event.</returns>
        // GET /api/reservations/event/{eventId}
        [HttpGet("event/{eventId}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<ReservationDto>>> GetReservationsForEvent(Guid eventId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            _logger.LogInformation($"[GetReservationsForEvent] Admin request for Event ID: {eventId}, Page: {pageNumber}, Size: {pageSize}");
            var reservations = await _context.Reservations
                .Where(r => r.EventId == eventId)
                .Include(r => r.Event)
                .Include(r => r.User)
                .OrderByDescending(r => r.ReservationDate)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new ReservationDto
                {
                    Id = r.Id,
                    EventId = r.EventId,
                    EventName = r.Event.Name,
                    EventDate = r.Event.EventDate,
                    UserId = r.UserId,
                    UserName = r.User.Username,
                    NumberOfTickets = r.NumberOfTickets,
                    ReservationDate = r.ReservationDate,
                    TotalPrice = r.TotalPrice,
                    UniqueBookingReference = r.UniqueBookingReference,
                    Status = r.Status
                })
                .ToListAsync();
             _logger.LogInformation($"[GetReservationsForEvent] Retrieved {reservations.Count} reservations for Event ID: {eventId}.");
            return Ok(reservations);
        }

        /// <summary>
        /// Gets a paginated list of all reservations, with optional filtering. (Admin only)
        /// </summary>
        /// <param name="userId">Optional: Filter reservations by user ID.</param>
        /// <param name="eventId">Optional: Filter reservations by event ID.</param>
        /// <param name="status">Optional: Filter reservations by status (e.g., "Confirmed", "Cancelled").</param>
        /// <param name="pageNumber">The page number to retrieve (default is 1).</param>
        /// <param name="pageSize">The number of reservations per page (default is 10).</param>
        /// <returns>A list of all reservations matching the criteria.</returns>
        // GET /api/reservations
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<ReservationDto>>> GetAllReservations(
            [FromQuery] Guid? userId,
            [FromQuery] Guid? eventId,
            [FromQuery] string? status,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            _logger.LogInformation($"[GetAllReservations] Admin request. Filters: UserID={userId}, EventID={eventId}, Status={status}, Page={pageNumber}, Size={pageSize}");
            var query = _context.Reservations
                .Include(r => r.Event)
                .Include(r => r.User)
                .AsQueryable();

            if (userId.HasValue)
            {
                query = query.Where(r => r.UserId == userId.Value);
            }

            if (eventId.HasValue)
            {
                query = query.Where(r => r.EventId == eventId.Value);
            }

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(r => r.Status.ToLower() == status.ToLower());
            }

            var reservations = await query
                .OrderByDescending(r => r.ReservationDate)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new ReservationDto
                {
                    Id = r.Id,
                    EventId = r.EventId,
                    EventName = r.Event.Name,
                    EventDate = r.Event.EventDate,
                    UserId = r.UserId,
                    UserName = r.User.Username,
                    NumberOfTickets = r.NumberOfTickets,
                    ReservationDate = r.ReservationDate,
                    TotalPrice = r.TotalPrice,
                    UniqueBookingReference = r.UniqueBookingReference,
                    Status = r.Status
                })
                .ToListAsync();
            _logger.LogInformation($"[GetAllReservations] Retrieved {reservations.Count} reservations based on filters.");
            return Ok(reservations);
        }

        /// <summary>
        /// Generates a unique booking reference string.
        /// </summary>
        /// <param name="eventId">The ID of the event.</param>
        /// <param name="userId">The ID of the user.</param>
        /// <returns>A unique booking reference string.</returns>
        /// <remarks>
        /// This is a basic example. For production, consider a more robust and potentially shorter
        /// collision-resistant reference generation strategy.
        /// </remarks>
        private string GenerateUniqueBookingReference(Guid eventId, Guid userId)
        {
            // Example: REF-EVT{shortEventId}-USR{shortUserId}-YYYYMMDDHHMMSSFFF-RANDOM{6}
            var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmssfff");
            var randomPart = Guid.NewGuid().ToString("N").Substring(0, 6).ToUpper();
            // Using first 4 chars of Guids for brevity; ensure this is acceptable for your uniqueness needs.
            return $"REF-EVT{eventId.ToString().Substring(0,4).ToUpper()}-USR{userId.ToString().Substring(0,4).ToUpper()}-{timestamp}-{randomPart}";
        }

        /// <summary>
        /// Gets the calendar (.ics file) for a specific reservation. (User authorization required, Admin can access any)
        /// </summary>
        /// <param name="id">The ID of the reservation for which to get the calendar file.</param>
        /// <returns>An .ics file for the event if found and authorized; otherwise, an error response.</returns>
        // GET /api/reservations/{id}/calendar
        [HttpGet("{id}/calendar")]
        [Authorize]
        public async Task<IActionResult> GetReservationCalendar(Guid id)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out Guid userId))
            {
                _logger.LogWarning($"[GetReservationCalendar] Unauthorized attempt for Reservation ID {id}: User ID not found or invalid in token.");
                return Unauthorized("User ID not found or invalid.");
            }

            var reservation = await _context.Reservations
                .Include(r => r.Event)
                    .ThenInclude(e => e.Venue)
                .Include(r => r.User)
                .FirstOrDefaultAsync(r => r.Id == id);

            if (reservation == null)
            {
                _logger.LogWarning($"[GetReservationCalendar] Reservation with ID {id} not found for calendar generation.");
                return NotFound("Reservation not found.");
            }

            bool isAdmin = User.IsInRole("Admin");

            if (!isAdmin && reservation.UserId != userId)
            {
                _logger.LogWarning($"[GetReservationCalendar] Forbidden attempt by User ID {userId} for calendar of Reservation ID {id} owned by User ID {reservation.UserId}.");
                return Forbid("You are not authorized to access this reservation's calendar.");
            }
             if (reservation.Status != "Confirmed")
            {
                _logger.LogWarning($"[GetReservationCalendar] Calendar requested for non-confirmed reservation ID {id}. Status: {reservation.Status}");
                return BadRequest("Calendar invite can only be generated for confirmed reservations.");
            }


            if (reservation.Event == null || reservation.Event.Venue == null)
            {
                _logger.LogError($"[GetReservationCalendar] Critical data missing for Reservation ID {id}: Event or Venue is null. Event: {reservation.Event?.Id}, Venue: {reservation.Event?.Venue?.Id}");
                return StatusCode(500, "Associated event or venue data is missing for the reservation. Cannot generate calendar file.");
            }

            try
            {
                byte[] icsBytes = _calendarService.GenerateIcsFile(reservation);
                _logger.LogInformation($"[GetReservationCalendar] .ics file generated for Reservation ID {id}.");
                return File(icsBytes, "text/calendar", $"event_{reservation.UniqueBookingReference}.ics");
            }
            catch (ArgumentNullException ex)
            {
                _logger.LogError(ex, $"[GetReservationCalendar] Error generating .ics file for Reservation ID {id} due to ArgumentNullException. This likely indicates missing critical data in the reservation, event, or venue object passed to the CalendarService.");
                return StatusCode(500, $"Error generating .ics file: A required piece of information was missing. {ex.Message}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"[GetReservationCalendar] An unexpected error occurred while generating the .ics file for Reservation ID {id}.");
                return StatusCode(500, "An unexpected error occurred while generating the .ics file. Please try again later.");
            }
        }
    }
}