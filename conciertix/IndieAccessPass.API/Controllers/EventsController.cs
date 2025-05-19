using IndieAccessPass.API.Data;
using IndieAccessPass.API.DTOs;
using IndieAccessPass.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging; // Added for ILogger
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace IndieAccessPass.API.Controllers
{
    /// <summary>
    /// API controller for managing events.
    /// </summary>
    [ApiController]
    [Route("api/events")]
    public class EventsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<EventsController> _logger;

        /// <summary>
        /// Initializes a new instance of the <see cref="EventsController"/> class.
        /// </summary>
        /// <param name="context">The database context.</param>
        /// <param name="logger">The logger for this controller.</param>
        public EventsController(ApplicationDbContext context, ILogger<EventsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Gets a paginated list of published events, with various filtering options.
        /// </summary>
        /// <param name="pageNumber">The page number to retrieve (default is 1).</param>
        /// <param name="pageSize">The number of events per page (default is 10).</param>
        /// <param name="genre">Filters events by artist genre. Currently, this checks if any artist's name contains the genre string. TODO: Improve genre filtering to use actual genre tags if available.</param>
        /// <param name="date">Filters events for a specific date.</param>
        /// <param name="startDate">Filters events occurring on or after this date.</param>
        /// <param name="endDate">Filters events occurring on or before this date.</param>
        /// <param name="city">Filters events by city.</param>
        /// <param name="artistName">Filters events by artist name.</param>
        /// <param name="searchTerm">A general search term to filter events by name, description, venue name, or artist name.</param>
        /// <returns>A list of event data transfer objects.</returns>
        // GET /api/events
        [HttpGet]
        public async Task<ActionResult<IEnumerable<EventDto>>> GetEvents(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? genre = null,
            [FromQuery] DateTime? date = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] string? city = null,
            [FromQuery] string? artistName = null,
            [FromQuery] string? searchTerm = null)
        {
            _logger.LogInformation($"[GetEvents] Received Params: pageNumber={pageNumber}, pageSize={pageSize}, genre={genre}, date={date}, startDate={startDate}, endDate={endDate}, city={city}, artistName={artistName}, searchTerm={searchTerm}");

            var initialQuery = _context.Events
                .Include(e => e.Venue)
                .Include(e => e.EventArtists)
                .ThenInclude(ea => ea.Artist);

            _logger.LogInformation($"[GetEvents] Count BEFORE any filtering: {await initialQuery.CountAsync()}");
            
            var query = initialQuery.AsQueryable();

            // Only retrieve "Published" events for the public API.
            query = query.Where(e => e.Status == "Published");
            _logger.LogInformation($"[GetEvents] Count AFTER 'Status == \"Published\"' filter: {await query.CountAsync()}");
            
            // Apply general search term filter
            if (!string.IsNullOrEmpty(searchTerm))
            {
                var lowerSearchTerm = searchTerm.ToLower();
                query = query.Where(e =>
                    (e.Name != null && e.Name.ToLower().Contains(lowerSearchTerm)) ||
                    (e.Description != null && e.Description.ToLower().Contains(lowerSearchTerm)) ||
                    (e.Venue != null && e.Venue.Name != null && e.Venue.Name.ToLower().Contains(lowerSearchTerm)) ||
                    e.EventArtists.Any(ea => ea.Artist != null && ea.Artist.Name != null && ea.Artist.Name.ToLower().Contains(lowerSearchTerm)));
            }

            // Apply genre filter (currently simplified)
            if (!string.IsNullOrEmpty(genre))
            {
                var lowerGenre = genre.ToLower();
                // This is a simplified genre search. A more robust solution would involve dedicated genre tags/properties.
                query = query.Where(e => e.EventArtists.Any(ea => ea.Artist != null && ea.Artist.Genre != null && ea.Artist.Genre.ToLower().Contains(lowerGenre)));
            }

            // Apply date filters
            if (date.HasValue)
            {
                var specificDateInput = date.Value;
                _logger.LogInformation($"[GetEvents] Date Filter DEBUG: Original specificDate = {specificDateInput}, Kind = {specificDateInput.Kind}, .Date = {specificDateInput.Date}, .Date.Kind = {specificDateInput.Date.Kind}");
                var specificDateComparable = DateTime.SpecifyKind(specificDateInput.Date, DateTimeKind.Utc);
                _logger.LogInformation($"[GetEvents] Date Filter DEBUG: Comparing with EventDate.Date == {specificDateComparable} (Kind: {specificDateComparable.Kind})");
                query = query.Where(e => e.EventDate.Date == specificDateComparable);
            }
            else if (startDate.HasValue && endDate.HasValue)
            {
                var sDateInput = startDate.Value;
                var eDateInput = endDate.Value;
                _logger.LogInformation($"[GetEvents] Date Range Filter DEBUG: Original startDate = {sDateInput}, Kind = {sDateInput.Kind}, .Date = {sDateInput.Date}, .Date.Kind = {sDateInput.Date.Kind}");
                _logger.LogInformation($"[GetEvents] Date Range Filter DEBUG: Original endDate = {eDateInput}, Kind = {eDateInput.Kind}, .Date = {eDateInput.Date}, .Date.Kind = {eDateInput.Date.Kind}");
                
                var sDateComparable = DateTime.SpecifyKind(sDateInput.Date, DateTimeKind.Utc);
                var eDateComparable = DateTime.SpecifyKind(eDateInput.Date, DateTimeKind.Utc);
                
                _logger.LogInformation($"[GetEvents] Date Range Filter DEBUG: Comparing with EventDate.Date >= {sDateComparable} (Kind: {sDateComparable.Kind}) && EventDate.Date <= {eDateComparable} (Kind: {eDateComparable.Kind})");
                query = query.Where(e => e.EventDate.Date >= sDateComparable && e.EventDate.Date <= eDateComparable);
            }
            else if (startDate.HasValue)
            {
                var sDateInput = startDate.Value;
                _logger.LogInformation($"[GetEvents] StartDate Filter DEBUG: Original startDate = {sDateInput}, Kind = {sDateInput.Kind}, .Date = {sDateInput.Date}, .Date.Kind = {sDateInput.Date.Kind}");
                var sDateComparable = DateTime.SpecifyKind(sDateInput.Date, DateTimeKind.Utc);
                _logger.LogInformation($"[GetEvents] StartDate Filter DEBUG: Comparing with EventDate.Date >= {sDateComparable} (Kind: {sDateComparable.Kind})");
                query = query.Where(e => e.EventDate.Date >= sDateComparable);
            }
            else if (endDate.HasValue)
            {
                var eDateInput = endDate.Value;
                _logger.LogInformation($"[GetEvents] EndDate Filter DEBUG: Original endDate = {eDateInput}, Kind = {eDateInput.Kind}, .Date = {eDateInput.Date}, .Date.Kind = {eDateInput.Date.Kind}");
                var eDateComparable = DateTime.SpecifyKind(eDateInput.Date, DateTimeKind.Utc);
                _logger.LogInformation($"[GetEvents] EndDate Filter DEBUG: Comparing with EventDate.Date <= {eDateComparable} (Kind: {eDateComparable.Kind})");
                query = query.Where(e => e.EventDate.Date <= eDateComparable);
            }

            // Apply city filter
            if (!string.IsNullOrEmpty(city))
            {
                var lowerCity = city.ToLower();
                query = query.Where(e => e.Venue != null && e.Venue.City != null && e.Venue.City.ToLower().Contains(lowerCity));
            }

            // Apply artist name filter
            if (!string.IsNullOrEmpty(artistName))
            {
                var lowerArtistName = artistName.ToLower();
                query = query.Where(e => e.EventArtists.Any(ea => ea.Artist != null && ea.Artist.Name != null && ea.Artist.Name.ToLower().Contains(lowerArtistName)));
            }

            _logger.LogInformation($"[GetEvents] Count BEFORE pagination (after all filters): {await query.CountAsync()}");
            
            // Apply pagination
            var events = await query
                .OrderByDescending(e => e.EventDate) // Order by most recent first
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(e => new EventDto
                {
                    Id = e.Id,
                    Name = e.Name,
                    Description = e.Description,
                    EventDate = e.EventDate,
                    VenueName = e.Venue != null ? e.Venue.Name : "N/A",
                    VenueCity = e.Venue != null ? e.Venue.City : "N/A",
                    ArtistNames = e.EventArtists.Select(ea => ea.Artist == null ? null : ea.Artist.Name).OfType<string>().ToList(),
                    TotalCapacity = e.TotalCapacity,
                    AvailableTickets = e.AvailableTickets,
                    PricePerTicket = e.PricePerTicket,
                    ImagePosterUrl = e.ImagePosterUrl,
                    Status = e.Status
                })
                .ToListAsync();

            return Ok(events);
        }

        /// <summary>
        /// Gets a specific event by its ID.
        /// </summary>
        /// <param name="id">The ID of the event to retrieve.</param>
        /// <returns>The requested event data transfer object if found; otherwise, NotFound.</returns>
        // GET /api/events/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<EventDto>> GetEvent(Guid id)
        {
            var eventEntity = await _context.Events
                .Include(e => e.Venue)
                .Include(e => e.EventArtists)
                .ThenInclude(ea => ea.Artist)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (eventEntity == null)
            {
                _logger.LogWarning($"[GetEvent] Event with ID {id} not found.");
                return NotFound();
            }

            var eventDto = new EventDto
            {
                Id = eventEntity.Id,
                Name = eventEntity.Name,
                Description = eventEntity.Description,
                EventDate = eventEntity.EventDate,
                VenueName = eventEntity.Venue?.Name ?? "N/A",
                VenueCity = eventEntity.Venue?.City ?? "N/A",
                ArtistNames = eventEntity.EventArtists.Select(ea => ea.Artist == null ? null : ea.Artist.Name).OfType<string>().ToList(),
                TotalCapacity = eventEntity.TotalCapacity,
                AvailableTickets = eventEntity.AvailableTickets,
                PricePerTicket = eventEntity.PricePerTicket,
                ImagePosterUrl = eventEntity.ImagePosterUrl,
                Status = eventEntity.Status
            };

            return Ok(eventDto);
        }

        /// <summary>
        /// Creates a new event. (Admin only)
        /// </summary>
        /// <param name="createEventDto">The data transfer object containing event creation information.</param>
        /// <returns>The created event data transfer object.</returns>
        // POST /api/events
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<EventDto>> CreateEvent([FromBody] CreateEventDto createEventDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var venue = await _context.Venues.FindAsync(createEventDto.VenueId);
            if (venue == null)
            {
                _logger.LogWarning($"[CreateEvent] Venue with ID {createEventDto.VenueId} not found.");
                return BadRequest($"Venue with ID {createEventDto.VenueId} not found.");
            }

            var artists = new List<Artist>();
            if (createEventDto.ArtistIds != null)
            {
                foreach (var artistId in createEventDto.ArtistIds)
                {
                    var artist = await _context.Artists.FindAsync(artistId);
                    if (artist == null)
                    {
                        _logger.LogWarning($"[CreateEvent] Artist with ID {artistId} not found.");
                        return BadRequest($"Artist with ID {artistId} not found.");
                    }
                    artists.Add(artist);
                }
            }


            var newEvent = new Event
            {
                Id = Guid.NewGuid(),
                Name = createEventDto.Name,
                Description = createEventDto.Description,
                EventDate = createEventDto.EventDate,
                VenueId = createEventDto.VenueId,
                Venue = venue,
                TotalCapacity = createEventDto.TotalCapacity,
                AvailableTickets = createEventDto.TotalCapacity, // Initially, all tickets are available.
                PricePerTicket = createEventDto.PricePerTicket,
                ImagePosterUrl = createEventDto.ImagePosterUrl,
                Status = createEventDto.Status // TODO: Consider validating status string (e.g., "Published", "Draft", "Cancelled")
            };

            _context.Events.Add(newEvent);

            foreach (var artist in artists)
            {
                _context.EventArtists.Add(new EventArtist { EventId = newEvent.Id, ArtistId = artist.Id, Event = newEvent, Artist = artist });
            }

            try
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation($"[CreateEvent] Event '{newEvent.Name}' (ID: {newEvent.Id}) created successfully.");
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "[CreateEvent] Error occurred while saving the event.");
                return StatusCode(500, "An error occurred while saving the event. " + ex.InnerException?.Message ?? ex.Message);
            }


            var eventDto = new EventDto
            {
                Id = newEvent.Id,
                Name = newEvent.Name,
                Description = newEvent.Description,
                EventDate = newEvent.EventDate,
                VenueName = venue.Name,
                VenueCity = venue.City,
                ArtistNames = artists.Select(a => a.Name).ToList(),
                TotalCapacity = newEvent.TotalCapacity,
                AvailableTickets = newEvent.AvailableTickets,
                PricePerTicket = newEvent.PricePerTicket,
                ImagePosterUrl = newEvent.ImagePosterUrl,
                Status = newEvent.Status
            };

            return CreatedAtAction(nameof(GetEvent), new { id = newEvent.Id }, eventDto);
        }

        /// <summary>
        /// Updates an existing event. (Admin only)
        /// </summary>
        /// <param name="id">The ID of the event to update.</param>
        /// <param name="updateEventDto">The data transfer object containing updated event information.</param>
        /// <returns>NoContent if successful; otherwise, BadRequest or NotFound.</returns>
        // PUT /api/events/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateEvent(Guid id, [FromBody] UpdateEventDto updateEventDto)
        {
            if (id == Guid.Empty)
            {
                _logger.LogWarning("[UpdateEvent] Invalid event ID (empty GUID) provided.");
                return BadRequest("Invalid event ID.");
            }
            
            var eventToUpdate = await _context.Events
                .Include(e => e.EventArtists)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (eventToUpdate == null)
            {
                _logger.LogWarning($"[UpdateEvent] Event with ID {id} not found for update.");
                return NotFound();
            }

            // Update properties from DTO
            if (updateEventDto.Name != null) eventToUpdate.Name = updateEventDto.Name;
            if (updateEventDto.Description != null) eventToUpdate.Description = updateEventDto.Description;
            if (updateEventDto.EventDate.HasValue) eventToUpdate.EventDate = updateEventDto.EventDate.Value;
            if (updateEventDto.TotalCapacity.HasValue)
            {
                eventToUpdate.TotalCapacity = updateEventDto.TotalCapacity.Value;
                // TODO: Add logic to adjust AvailableTickets if TotalCapacity changes and is less than current reservations.
            }
            if (updateEventDto.AvailableTickets.HasValue)
            {
                 eventToUpdate.AvailableTickets = updateEventDto.AvailableTickets.Value;
                 // TODO: Ensure AvailableTickets does not exceed TotalCapacity.
            }
            if (updateEventDto.PricePerTicket.HasValue) eventToUpdate.PricePerTicket = updateEventDto.PricePerTicket.Value;
            if (updateEventDto.ImagePosterUrl != null) eventToUpdate.ImagePosterUrl = updateEventDto.ImagePosterUrl;
            if (updateEventDto.Status != null) eventToUpdate.Status = updateEventDto.Status; // TODO: Validate status string

            // Update Venue if provided and different
            if (updateEventDto.VenueId.HasValue && updateEventDto.VenueId.Value != eventToUpdate.VenueId)
            {
                var venue = await _context.Venues.FindAsync(updateEventDto.VenueId.Value);
                if (venue == null)
                {
                    _logger.LogWarning($"[UpdateEvent] Venue with ID {updateEventDto.VenueId.Value} not found during event update.");
                    return BadRequest($"Venue with ID {updateEventDto.VenueId.Value} not found.");
                }
                eventToUpdate.VenueId = updateEventDto.VenueId.Value;
                eventToUpdate.Venue = venue; // Ensure the navigation property is also updated
            }

            // Update Artists if provided
            if (updateEventDto.ArtistIds != null)
            {
                // Remove artists no longer associated with the event
                var artistsToRemove = eventToUpdate.EventArtists
                    .Where(ea => !updateEventDto.ArtistIds.Contains(ea.ArtistId))
                    .ToList();
                _context.EventArtists.RemoveRange(artistsToRemove);

                // Add newly associated artists
                var existingArtistIds = eventToUpdate.EventArtists.Select(ea => ea.ArtistId).ToList();
                foreach (var artistId in updateEventDto.ArtistIds.Except(existingArtistIds))
                {
                    var artist = await _context.Artists.FindAsync(artistId);
                    if (artist == null)
                    {
                        _logger.LogWarning($"[UpdateEvent] Artist with ID {artistId} not found during event update.");
                        return BadRequest($"Artist with ID {artistId} not found.");
                    }
                    _context.EventArtists.Add(new EventArtist { EventId = eventToUpdate.Id, ArtistId = artistId, Event = eventToUpdate, Artist = artist });
                }
            }
            
            try
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation($"[UpdateEvent] Event with ID {id} updated successfully.");
            }
            catch (DbUpdateConcurrencyException ex)
            {
                if (!EventExists(id))
                {
                    _logger.LogWarning(ex, $"[UpdateEvent] Concurrency error: Event with ID {id} not found during save.");
                    return NotFound();
                }
                else
                {
                    _logger.LogError(ex, $"[UpdateEvent] Concurrency error for event ID {id}.");
                    throw;
                }
            }
            catch (DbUpdateException ex)
            {
                 _logger.LogError(ex, $"[UpdateEvent] Database update error for event ID {id}.");
                 return StatusCode(500, "An error occurred while updating the event. " + ex.InnerException?.Message ?? ex.Message);
            }

            return NoContent();
        }


        /// <summary>
        /// Deletes an event by its ID. (Admin only)
        /// This will also remove associated EventArtist entries.
        /// </summary>
        /// <param name="id">The ID of the event to delete.</param>
        /// <returns>NoContent if successful; otherwise, NotFound or an error status code.</returns>
        // DELETE /api/events/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteEvent(Guid id)
        {
            var eventToDelete = await _context.Events
                .Include(e => e.EventArtists) // Include related EventArtists for cascade deletion by EF or manual removal
                .Include(e => e.Reservations) // Include reservations to check before deletion
                .FirstOrDefaultAsync(e => e.Id == id);

            if (eventToDelete == null)
            {
                _logger.LogWarning($"[DeleteEvent] Event with ID {id} not found for deletion.");
                return NotFound();
            }

            // Check if there are any reservations for this event
            if (eventToDelete.Reservations.Any())
            {
                _logger.LogWarning($"[DeleteEvent] Attempted to delete event ID {id} which has existing reservations.");
                return BadRequest("Cannot delete event with existing reservations. Please cancel or reassign reservations first.");
            }

            // Remove related EventArtist entries first (EF might handle this with cascade delete if configured, but explicit is safer)
            _context.EventArtists.RemoveRange(eventToDelete.EventArtists);
            _context.Events.Remove(eventToDelete);

            try
            {
                await _context.SaveChangesAsync();
                _logger.LogInformation($"[DeleteEvent] Event with ID {id} deleted successfully.");
            }
            catch (DbUpdateException ex)
            {
                 _logger.LogError(ex, $"[DeleteEvent] Database error while deleting event ID {id}.");
                 return StatusCode(500, "An error occurred while deleting the event. " + ex.InnerException?.Message ?? ex.Message);
            }

            return NoContent();
        }

        /// <summary>
        /// Checks if an event exists by its ID.
        /// </summary>
        /// <param name="id">The ID of the event to check.</param>
        /// <returns>True if the event exists; otherwise, false.</returns>
        private bool EventExists(Guid id)
        {
            return _context.Events.Any(e => e.Id == id);
        }
    }
}