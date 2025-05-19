using IndieAccessPass.API.Models;
using Microsoft.EntityFrameworkCore;

    /// <summary>
    /// Represents the database context for the application, managing entities and their relationships.
    /// </summary>
    namespace IndieAccessPass.API.Data
    {
        public class ApplicationDbContext : DbContext
        {
            /// <summary>
            /// Initializes a new instance of the <see cref="ApplicationDbContext"/> class.
            /// </summary>
            /// <param name="options">The options to be used by a <see cref="DbContext"/>.</param>
            public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
            {
            }

            /// <summary>
            /// Gets or sets the <see cref="DbSet{TEntity}"/> of users.
            /// </summary>
            public DbSet<User> Users { get; set; }
            /// <summary>
            /// Gets or sets the <see cref="DbSet{TEntity}"/> of artists.
            /// </summary>
            public DbSet<Artist> Artists { get; set; }
            /// <summary>
            /// Gets or sets the <see cref="DbSet{TEntity}"/> of venues.
            /// </summary>
            public DbSet<Venue> Venues { get; set; }
            /// <summary>
            /// Gets or sets the <see cref="DbSet{TEntity}"/> of events.
            /// </summary>
            public DbSet<Event> Events { get; set; }
            /// <summary>
            /// Gets or sets the <see cref="DbSet{TEntity}"/> of event-artist associations.
            /// </summary>
            public DbSet<EventArtist> EventArtists { get; set; }
            /// <summary>
            /// Gets or sets the <see cref="DbSet{TEntity}"/> of reservations.
            /// </summary>
            public DbSet<Reservation> Reservations { get; set; }

            /// <summary>
            /// Configures the schema needed for the identity framework.
            /// </summary>
            /// <param name="modelBuilder">The builder being used to construct the model for this context.</param>
            protected override void OnModelCreating(ModelBuilder modelBuilder)
            {
                base.OnModelCreating(modelBuilder);

                // Configure composite key for the EventArtist join table
                modelBuilder.Entity<EventArtist>()
                    .HasKey(ea => new { ea.EventId, ea.ArtistId });

                // Configure relationships for EventArtist (many-to-many between Event and Artist)
                modelBuilder.Entity<EventArtist>()
                    .HasOne(ea => ea.Event)
                    .WithMany(e => e.EventArtists)
                    .HasForeignKey(ea => ea.EventId);

                modelBuilder.Entity<EventArtist>()
                    .HasOne(ea => ea.Artist)
                    .WithMany(a => a.EventArtists)
                    .HasForeignKey(ea => ea.ArtistId);

                // Configure unique constraints for User entity
                modelBuilder.Entity<User>()
                    .HasIndex(u => u.Username)
                    .IsUnique();

                modelBuilder.Entity<User>()
                    .HasIndex(u => u.Email)
                    .IsUnique();
                
                // Configure precision for decimal properties (e.g., PricePerTicket in Event)
                modelBuilder.Entity<Event>()
                    .Property(e => e.PricePerTicket)
                    .HasColumnType("decimal(18,2)"); // Example: 18 total digits, 2 after decimal point

                modelBuilder.Entity<Reservation>()
                    .Property(r => r.TotalPrice)
                    .HasColumnType("decimal(18,2)");


                SeedData(modelBuilder);
            }

            /// <summary>
            /// Seeds initial data into the database.
            /// This method is called during the model creation process.
            /// </summary>
            /// <param name="modelBuilder">The builder being used to construct the model for this context.</param>
            private void SeedData(ModelBuilder modelBuilder)
            {
                // Pre-generate all Guids for deterministic seeding.
                // This ensures that the same IDs are used every time the database is seeded,
                // which is crucial for consistency across environments and for testing.
                var venue1Id = new Guid("a1b2c3d4-e5f6-7788-99a0-bcdef0123450");
                var venue2Id = new Guid("a1b2c3d4-e5f6-7788-99a0-bcdef0123451");
                var venue3Id = new Guid("a1b2c3d4-e5f6-7788-99a0-bcdef0123452");

                var artist1Id = new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234560");
                var artist2Id = new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234561");
                var artist3Id = new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234562");
                var artist4Id = new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234563");
                var artist5Id = new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234564");

                // Define a list of fixed Guids for events to ensure deterministic seeding.
                var eventGuids = new List<Guid> {
                    new Guid("c1d2e3f4-a5b6-7788-99c0-def012345670"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345671"),
                    new Guid("c1d2e3f4-a5b6-7788-99c0-def012345672"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345673"),
                    new Guid("c1d2e3f4-a5b6-7788-99c0-def012345674"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345675"),
                    new Guid("c1d2e3f4-a5b6-7788-99c0-def012345676"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345677"),
                    new Guid("c1d2e3f4-a5b6-7788-99c0-def012345678"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345679"),
                    new Guid("c1d2e3f4-a5b6-7788-99c0-def01234567a"), new Guid("c1d2e3f4-a5b6-7788-99c0-def01234567b"),
                    new Guid("c1d2e3f4-a5b6-7788-99c0-def01234567c"), new Guid("c1d2e3f4-a5b6-7788-99c0-def01234567d"),
                    new Guid("c1d2e3f4-a5b6-7788-99c0-def01234567e"), new Guid("c1d2e3f4-a5b6-7788-99c0-def01234567f"),
                    new Guid("c1d2e3f4-a5b6-7788-99c0-def012345680"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345681"),
                    new Guid("c1d2e3f4-a5b6-7788-99c0-def012345682"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345683"),
                    new Guid("c1d2e3f4-a5b6-7788-99c0-def012345684"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345685"),
                    new Guid("c1d2e3f4-a5b6-7788-99c0-def012345686"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345687"),
                    new Guid("c1d2e3f4-a5b6-7788-99c0-def012345688") // 25th event GUID
                };

                // Seed Venues
                modelBuilder.Entity<Venue>().HasData(
                    new Venue { Id = venue1Id, Name = "The Indie Stage", Address = "123 Music Lane", City = "Metroville" },
                    new Venue { Id = venue2Id, Name = "Rock Hard Place", Address = "456 Rock Road", City = "Groove City" },
                    new Venue { Id = venue3Id, Name = "The Acoustic Corner", Address = "789 Harmony Ave", City = "Serenity Falls" }
                );

                // Seed Artists
                modelBuilder.Entity<Artist>().HasData(
                    new Artist { Id = artist1Id, Name = "The Wandering Minstrels", Bio = "Folk band exploring ancient tales.", Genre = "Folk", ImageUrl = "https://picsum.photos/seed/" + artist1Id + "/150/150" },
                    new Artist { Id = artist2Id, Name = "Synthwave Surfers", Bio = "Riding the waves of 80s nostalgia.", Genre = "Synthwave", ImageUrl = "https://picsum.photos/seed/" + artist2Id + "/150/150" },
                    new Artist { Id = artist3Id, Name = "Cosmic Jazz Quartet", Bio = "Exploring the universe through jazz.", Genre = "Jazz", ImageUrl = "https://picsum.photos/seed/" + artist3Id + "/150/150" },
                    new Artist { Id = artist4Id, Name = "Rebel Riffs", Bio = "Hard-hitting rock anthems.", Genre = "Rock", ImageUrl = "https://picsum.photos/seed/" + artist4Id + "/150/150" },
                    new Artist { Id = artist5Id, Name = "DJ Echo", Bio = "Electronic beats for the soul.", Genre = "Electronic", ImageUrl = "https://picsum.photos/seed/" + artist5Id + "/150/150" }
                );
                
                // Initialize Random with a fixed seed for deterministic data generation.
                var random = new Random(12345);
                // Use a fixed base date for event date calculations to ensure consistency.
                var baseDate = new DateTime(2025, 5, 10, 0, 0, 0, DateTimeKind.Utc);

                var eventsToSeed = new List<Event>();
                var eventArtistsToSeed = new List<EventArtist>();
                int eventGuidCounter = 0; // Counter for iterating through the fixed eventGuids list.

                // Seed Initial 5 Specific Events
                eventsToSeed.Add(new Event { Id = eventGuids[eventGuidCounter], Name = "Folk Fest Under the Stars", Description = "An evening of enchanting folk music.", EventDate = baseDate.AddDays(7).AddHours(18), VenueId = venue1Id, TotalCapacity = 150, AvailableTickets = 150, PricePerTicket = 25.00m, Status = "Published", ImagePosterUrl = "https://picsum.photos/seed/" + eventGuids[eventGuidCounter].ToString() + "/300/200" });
                eventArtistsToSeed.Add(new EventArtist { EventId = eventGuids[eventGuidCounter], ArtistId = artist1Id });
                eventGuidCounter++;

                eventsToSeed.Add(new Event { Id = eventGuids[eventGuidCounter], Name = "Synth Riders Night", Description = "Dive into the retro-future sounds.", EventDate = baseDate.AddDays(10).AddHours(20), VenueId = venue2Id, TotalCapacity = 200, AvailableTickets = 200, PricePerTicket = 30.00m, Status = "Published", ImagePosterUrl = "https://picsum.photos/seed/" + eventGuids[eventGuidCounter].ToString() + "/300/200" });
                eventArtistsToSeed.Add(new EventArtist { EventId = eventGuids[eventGuidCounter], ArtistId = artist2Id });
                eventArtistsToSeed.Add(new EventArtist { EventId = eventGuids[eventGuidCounter], ArtistId = artist5Id });
                eventGuidCounter++;
            
                eventsToSeed.Add(new Event { Id = eventGuids[eventGuidCounter], Name = "Jazz Galaxy Exploration", Description = "A journey through cosmic jazz.", EventDate = baseDate.AddDays(15).AddHours(19), VenueId = venue3Id, TotalCapacity = 100, AvailableTickets = 100, PricePerTicket = 40.00m, Status = "Published", ImagePosterUrl = "https://picsum.photos/seed/" + eventGuids[eventGuidCounter].ToString() + "/300/200" });
                eventArtistsToSeed.Add(new EventArtist { EventId = eventGuids[eventGuidCounter], ArtistId = artist3Id });
                eventGuidCounter++;

                eventsToSeed.Add(new Event { Id = eventGuids[eventGuidCounter], Name = "Rock Rebellion Fest", Description = "Unleash your inner rebel.", EventDate = baseDate.AddDays(20).AddHours(18), VenueId = venue2Id, TotalCapacity = 300, AvailableTickets = 300, PricePerTicket = 35.00m, Status = "Published", ImagePosterUrl = "https://picsum.photos/seed/" + eventGuids[eventGuidCounter].ToString() + "/300/200" });
                eventArtistsToSeed.Add(new EventArtist { EventId = eventGuids[eventGuidCounter], ArtistId = artist4Id });
                eventArtistsToSeed.Add(new EventArtist { EventId = eventGuids[eventGuidCounter], ArtistId = artist1Id });
                eventGuidCounter++;

                eventsToSeed.Add(new Event { Id = eventGuids[eventGuidCounter], Name = "Electronic Bloom", Description = "Experience the bloom of electronic music.", EventDate = baseDate.AddDays(5).AddHours(21), VenueId = venue1Id, TotalCapacity = 250, AvailableTickets = 250, PricePerTicket = 28.00m, Status = "Published", ImagePosterUrl = "https://picsum.photos/seed/" + eventGuids[eventGuidCounter].ToString() + "/300/200" });
                eventArtistsToSeed.Add(new EventArtist { EventId = eventGuids[eventGuidCounter], ArtistId = artist5Id });
                eventGuidCounter++;

                // Arrays for generating additional random events
                string[] eventNamePrefixes = { "Groove", "Sonic", "Rhythm", "Melody", "Harmony", "Beat", "Vibe", "Acoustic", "Electric", "Cosmic" };
                string[] eventNameSuffixes = { "Night", "Fest", "Party", "Showcase", "Gathering", "Experience", "Journey", "Celebration", "Wave", "Echoes" };
                string[] eventDescriptions = {
                    "An unforgettable night of music.", "Experience the latest sounds.", "Get ready to dance!", "A unique musical journey.",
                    "Celebrating the best of indie music.", "Live and loud!", "Intimate acoustic session.", "Epic electronic beats."
                };
                string[] eventStatuses = { "Published", "Draft" }; // Example statuses

                Guid[] availableVenueIds = { venue1Id, venue2Id, venue3Id };
                Guid[] availableArtistIds = { artist1Id, artist2Id, artist3Id, artist4Id, artist5Id };

                // Seed Additional 20 Random Events
                for (int i = 0; i < 20; i++) // Loop to create 20 more events
                {
                    var currentEventId = eventGuids[eventGuidCounter]; // Use the next fixed GUID
                    var selectedVenueId = availableVenueIds[random.Next(availableVenueIds.Length)];
                    var numArtistsForEvent = random.Next(1, 4); // 1 to 3 artists per event
                    var currentEventArtistIds = new List<Guid>();

                    string eventName = $"{eventNamePrefixes[random.Next(eventNamePrefixes.Length)]} {eventNameSuffixes[random.Next(eventNameSuffixes.Length)]} #{i + 6}"; // Start numbering from #6
                    string description = eventDescriptions[random.Next(eventDescriptions.Length)];
                    DateTime eventDate = baseDate.AddDays(random.Next(1, 60)).AddHours(random.Next(18, 23)).AddMinutes(new[] { 0, 15, 30, 45 }[random.Next(4)]);
                    int capacity = random.Next(50, 501); // Capacity between 50 and 500
                    decimal price = Math.Round((decimal)(random.NextDouble() * (70.0 - 10.0) + 10.0), 2); // Price between 10.00 and 70.00
                    string status = eventStatuses[random.Next(eventStatuses.Length)];
                    
                    // Ensure "Published" events are in the future relative to baseDate for realism
                    if (status == "Published" && eventDate < baseDate.AddDays(1)) // Ensure future if published
                    {
                        eventDate = baseDate.AddDays(random.Next(1, 30)); // Reschedule to a future date
                    }
                    else if (status == "Draft" && eventDate > baseDate.AddMonths(2)) // Make drafts not too far in future
                    {
                        eventDate = baseDate.AddDays(random.Next(1,60));
                    }
                    // Example for a "Past" status if it were used:
                    // if (status == "Past") eventDate = baseDate.AddDays(-random.Next(1, 60));


                    string imagePosterUrl = $"https://picsum.photos/seed/{currentEventId.ToString()}/300/200"; // Use event ID for deterministic image

                    eventsToSeed.Add(new Event
                    {
                        Id = currentEventId,
                        Name = eventName,
                        Description = description,
                        EventDate = eventDate,
                        VenueId = selectedVenueId,
                        TotalCapacity = capacity,
                        AvailableTickets = capacity, // Initially all tickets are available
                        PricePerTicket = price,
                        Status = status,
                        ImagePosterUrl = imagePosterUrl
                    });

                    for (int j = 0; j < numArtistsForEvent; j++)
                    {
                        Guid selectedArtistId;
                        do { // Ensure unique artists per event
                            selectedArtistId = availableArtistIds[random.Next(availableArtistIds.Length)];
                        } while (currentEventArtistIds.Contains(selectedArtistId));
                        currentEventArtistIds.Add(selectedArtistId);
                        eventArtistsToSeed.Add(new EventArtist { EventId = currentEventId, ArtistId = selectedArtistId });
                    }
                    eventGuidCounter++; // Move to the next fixed GUID
                }

                modelBuilder.Entity<Event>().HasData(eventsToSeed);
                modelBuilder.Entity<EventArtist>().HasData(eventArtistsToSeed);
            }
        }
}