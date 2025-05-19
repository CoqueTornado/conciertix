using IndieAccessPass.API.Data;
using IndieAccessPass.API.DTOs;
using IndieAccessPass.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace IndieAccessPass.API.Controllers
{
    /// <summary>
    /// API controller for managing artists.
    /// </summary>
    [ApiController]
    [Route("api/artists")]
    public class ArtistsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        /// <summary>
        /// Initializes a new instance of the <see cref="ArtistsController"/> class.
        /// </summary>
        /// <param name="context">The database context.</param>
        public ArtistsController(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Gets a paginated list of artists, optionally filtered by a search term.
        /// </summary>
        /// <param name="pageNumber">The page number to retrieve (default is 1).</param>
        /// <param name="pageSize">The number of artists per page (default is 10).</param>
        /// <param name="searchTerm">An optional search term to filter artists by name or genre.</param>
        /// <returns>A list of artists.</returns>
        // GET: api/artists
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ArtistDto>>> GetArtists(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null)
        {
            var query = _context.Artists.AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var lowerSearchTerm = searchTerm.ToLower();
                query = query.Where(a =>
                    (a.Name != null && a.Name.ToLower().Contains(lowerSearchTerm)) ||
                    (a.Genre != null && a.Genre.ToLower().Contains(lowerSearchTerm))
                );
            }

            var artists = await query
                .OrderBy(a => a.Name)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(a => new ArtistDto
                {
                    Id = a.Id,
                    Name = a.Name,
                    Bio = a.Bio,
                    ImageUrl = a.ImageUrl,
                    Genre = a.Genre
                })
                .ToListAsync();

            return Ok(artists);
        }

        /// <summary>
        /// Gets a specific artist by their ID.
        /// </summary>
        /// <param name="id">The ID of the artist to retrieve.</param>
        /// <returns>The requested artist if found; otherwise, NotFound.</returns>
        // GET: api/artists/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<ArtistDto>> GetArtist(Guid id)
        {
            var artist = await _context.Artists
                .Select(a => new ArtistDto
                {
                    Id = a.Id,
                    Name = a.Name,
                    Bio = a.Bio,
                    ImageUrl = a.ImageUrl,
                    Genre = a.Genre
                })
                .FirstOrDefaultAsync(a => a.Id == id);

            if (artist == null)
            {
                return NotFound();
            }

            return Ok(artist);
        }

        /// <summary>
        /// Creates a new artist. (Admin only)
        /// </summary>
        /// <param name="createArtistDto">The data transfer object containing artist information.</param>
        /// <returns>The created artist.</returns>
        // POST: api/artists
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ArtistDto>> CreateArtist(CreateArtistDto createArtistDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var artist = new Artist
            {
                Name = createArtistDto.Name,
                Bio = createArtistDto.Bio,
                ImageUrl = createArtistDto.ImageUrl,
                Genre = createArtistDto.Genre
            };

            _context.Artists.Add(artist);
            await _context.SaveChangesAsync();

            var artistDto = new ArtistDto
            {
                Id = artist.Id,
                Name = artist.Name,
                Bio = artist.Bio,
                ImageUrl = artist.ImageUrl,
                Genre = artist.Genre
            };

            return CreatedAtAction(nameof(GetArtist), new { id = artist.Id }, artistDto);
        }

        /// <summary>
        /// Updates an existing artist. (Admin only)
        /// </summary>
        /// <param name="id">The ID of the artist to update.</param>
        /// <param name="updateArtistDto">The data transfer object containing updated artist information.</param>
        /// <returns>NoContent if successful; otherwise, BadRequest or NotFound.</returns>
        // PUT: api/artists/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateArtist(Guid id, UpdateArtistDto updateArtistDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var artist = await _context.Artists.FindAsync(id);

            if (artist == null)
            {
                return NotFound();
            }

            // Update only the provided fields
            if (updateArtistDto.Name != null)
            {
                artist.Name = updateArtistDto.Name;
            }
            if (updateArtistDto.Bio != null)
            {
                artist.Bio = updateArtistDto.Bio;
            }
            if (updateArtistDto.ImageUrl != null)
            {
                artist.ImageUrl = updateArtistDto.ImageUrl;
            }
            if (updateArtistDto.Genre != null)
            {
                artist.Genre = updateArtistDto.Genre;
            }

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Artists.Any(e => e.Id == id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        /// <summary>
        /// Deletes an artist by their ID. (Admin only)
        /// An artist cannot be deleted if they are associated with any events.
        /// </summary>
        /// <param name="id">The ID of the artist to delete.</param>
        /// <returns>NoContent if successful; otherwise, NotFound or BadRequest.</returns>
        // DELETE: api/artists/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteArtist(Guid id)
        {
            var artist = await _context.Artists.Include(a => a.EventArtists).FirstOrDefaultAsync(a => a.Id == id);

            if (artist == null)
            {
                return NotFound();
            }

            if (artist.EventArtists.Any())
            {
                return BadRequest("Artist cannot be deleted as they are associated with existing events.");
            }

            _context.Artists.Remove(artist);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}