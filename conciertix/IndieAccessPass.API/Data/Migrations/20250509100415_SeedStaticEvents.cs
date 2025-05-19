using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace IndieAccessPass.API.Data.Migrations
{
    /// <inheritdoc />
    public partial class SeedStaticEvents : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Artists",
                columns: new[] { "Id", "Bio", "Genre", "ImageUrl", "Name" },
                values: new object[,]
                {
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234560"), "Folk band exploring ancient tales.", "Folk", "https://picsum.photos/seed/folk/150/150", "The Wandering Minstrels" },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234561"), "Riding the waves of 80s nostalgia.", "Synthwave", "https://picsum.photos/seed/synthwave/150/150", "Synthwave Surfers" },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234562"), "Exploring the universe through jazz.", "Jazz", "https://picsum.photos/seed/jazz/150/150", "Cosmic Jazz Quartet" },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234563"), "Hard-hitting rock anthems.", "Rock", "https://picsum.photos/seed/rock/150/150", "Rebel Riffs" },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234564"), "Electronic beats for the soul.", "Electronic", "https://picsum.photos/seed/electronic/150/150", "DJ Echo" },
                    { new Guid("f81d4fae-7dec-11d0-a765-00a0c91e6bf6"), "The enigmatic Coque Tornado.", "Indie Pop Gótico", "https://picsum.photos/seed/coquetornado/150/150", "Coque Tornado" }
                });

            migrationBuilder.InsertData(
                table: "Venues",
                columns: new[] { "Id", "Address", "City", "Name" },
                values: new object[,]
                {
                    { new Guid("a1b2c3d4-e5f6-7788-99a0-bcdef0123450"), "123 Music Lane", "Metroville", "The Indie Stage" },
                    { new Guid("a1b2c3d4-e5f6-7788-99a0-bcdef0123451"), "456 Rock Road", "Groove City", "Rock Hard Place" },
                    { new Guid("a1b2c3d4-e5f6-7788-99a0-bcdef0123452"), "789 Harmony Ave", "Serenity Falls", "The Acoustic Corner" },
                    { new Guid("d4b7a5e3-1c9f-4b2a-8e7d-6f5c4b3a2e1d"), "Calle Gran Vía, 35", "Madrid", "Palacio de la Música" }
                });

            migrationBuilder.InsertData(
                table: "Events",
                columns: new[] { "Id", "AvailableTickets", "Description", "EventDate", "ImagePosterUrl", "Name", "PricePerTicket", "Status", "TotalCapacity", "VenueId" },
                values: new object[,]
                {
                    { new Guid("c1d2e3f4-a5b6-7788-99c0-def012345670"), 150, "An evening of enchanting folk music.", new DateTime(2025, 5, 17, 18, 0, 0, 0, DateTimeKind.Utc), "https://via.placeholder.com/300x200/FFC107/000000?text=FolkFest", "Folk Fest Under the Stars", 25.00m, "Published", 150, new Guid("a1b2c3d4-e5f6-7788-99a0-bcdef0123450") },
                    { new Guid("c1d2e3f4-a5b6-7788-99c0-def012345671"), 200, "Dive into the retro-future sounds.", new DateTime(2025, 5, 20, 20, 0, 0, 0, DateTimeKind.Utc), "https://via.placeholder.com/300x200/00BCD4/FFFFFF?text=SynthNight", "Synth Riders Night", 30.00m, "Published", 200, new Guid("a1b2c3d4-e5f6-7788-99a0-bcdef0123451") },
                    { new Guid("c1d2e3f4-a5b6-7788-99c0-def012345672"), 100, "A journey through cosmic jazz.", new DateTime(2025, 5, 25, 19, 0, 0, 0, DateTimeKind.Utc), "https://via.placeholder.com/300x200/9C27B0/FFFFFF?text=JazzGalaxy", "Jazz Galaxy Exploration", 40.00m, "Published", 100, new Guid("a1b2c3d4-e5f6-7788-99a0-bcdef0123452") },
                    { new Guid("c1d2e3f4-a5b6-7788-99c0-def012345673"), 300, "Unleash your inner rebel.", new DateTime(2025, 5, 30, 18, 0, 0, 0, DateTimeKind.Utc), "https://via.placeholder.com/300x200/F44336/FFFFFF?text=RockRebellion", "Rock Rebellion Fest", 35.00m, "Published", 300, new Guid("a1b2c3d4-e5f6-7788-99a0-bcdef0123451") },
                    { new Guid("c1d2e3f4-a5b6-7788-99c0-def012345674"), 250, "Experience the bloom of electronic music.", new DateTime(2025, 5, 15, 21, 0, 0, 0, DateTimeKind.Utc), "https://via.placeholder.com/300x200/4CAF50/FFFFFF?text=ElectronicBloom", "Electronic Bloom", 28.00m, "Published", 250, new Guid("a1b2c3d4-e5f6-7788-99a0-bcdef0123450") },
                    { new Guid("c1d2e3f4-a5b6-7788-99c0-def012345675"), 50, "Intimate acoustic session.", new DateTime(2025, 5, 11, 18, 0, 0, 0, DateTimeKind.Utc), "https://via.placeholder.com/300x200/000000/FFFFFF?text=Event+6", "Acoustic Experience #1", 10m, "Published", 50, new Guid("a1b2c3d4-e5f6-7788-99a0-bcdef0123450") },
                    { new Guid("c1d2e3f4-a5b6-7788-99c0-def012345676"), 60, "Experience the latest sounds.", new DateTime(2025, 5, 14, 19, 15, 0, 0, DateTimeKind.Utc), "https://via.placeholder.com/300x200/12D687/FFFFFF?text=Event+7", "Rhythm Experience #2", 11.5m, "Draft", 60, new Guid("a1b2c3d4-e5f6-7788-99a0-bcdef0123450") },
                    { new Guid("c1d2e3f4-a5b6-7788-99c0-def012345677"), 70, "An unforgettable night of music.", new DateTime(2025, 5, 17, 20, 30, 0, 0, DateTimeKind.Utc), "https://via.placeholder.com/300x200/25AD0E/FFFFFF?text=Event+8", "Electric Showcase #3", 13m, "Published", 70, new Guid("a1b2c3d4-e5f6-7788-99a0-bcdef0123450") },
                    { new Guid("c1d2e3f4-a5b6-7788-99c0-def012345678"), 80, "A unique musical journey.", new DateTime(2025, 5, 20, 21, 45, 0, 0, DateTimeKind.Utc), "https://via.placeholder.com/300x200/388395/FFFFFF?text=Event+9", "Acoustic Celebration #4", 14.5m, "Draft", 80, new Guid("a1b2c3d4-e5f6-7788-99a0-bcdef0123451") },
                    { new Guid("c1d2e3f4-a5b6-7788-99c0-def012345679"), 90, "Intimate acoustic session.", new DateTime(2025, 5, 23, 22, 0, 0, 0, DateTimeKind.Utc), "https://via.placeholder.com/300x200/4B5A1C/FFFFFF?text=Event+10", "Harmony Party #5", 16m, "Published", 90, new Guid("a1b2c3d4-e5f6-7788-99a0-bcdef0123450") },
                    { new Guid("c1d2e3f4-a5b6-7788-99c0-def01234567a"), 100, "Get ready to dance!", new DateTime(2025, 5, 26, 23, 15, 0, 0, DateTimeKind.Utc), "https://via.placeholder.com/300x200/5E30A3/FFFFFF?text=Event+11", "Acoustic Gathering #6", 17.5m, "Draft", 100, new Guid("a1b2c3d4-e5f6-7788-99a0-bcdef0123451") },
                    { new Guid("c1d2e3f4-a5b6-7788-99c0-def01234567b"), 110, "Intimate acoustic session.", new DateTime(2025, 5, 29, 18, 30, 0, 0, DateTimeKind.Utc), "https://via.placeholder.com/300x200/71072A/FFFFFF?text=Event+12", "Electric Fest #7", 19m, "Published", 110, new Guid("a1b2c3d4-e5f6-7788-99a0-bcdef0123450") },
                    { new Guid("c1d2e3f4-a5b6-7788-99c0-def01234567c"), 120, "An unforgettable night of music.", new DateTime(2025, 6, 1, 19, 45, 0, 0, DateTimeKind.Utc), "https://via.placeholder.com/300x200/83DDB1/FFFFFF?text=Event+13", "Beat Celebration #8", 20.5m, "Draft", 120, new Guid("a1b2c3d4-e5f6-7788-99a0-bcdef0123451") },
                    { new Guid("c1d2e3f4-a5b6-7788-99c0-def01234567d"), 130, "An unforgettable night of music.", new DateTime(2025, 6, 4, 20, 0, 0, 0, DateTimeKind.Utc), "https://via.placeholder.com/300x200/96B438/FFFFFF?text=Event+14", "Harmony Showcase #9", 22m, "Published", 130, new Guid("a1b2c3d4-e5f6-7788-99a0-bcdef0123450") },
                    { new Guid("c1d2e3f4-a5b6-7788-99c0-def01234567e"), 140, "Get ready to dance!", new DateTime(2025, 6, 7, 21, 15, 0, 0, DateTimeKind.Utc), "https://via.placeholder.com/300x200/A98ABF/FFFFFF?text=Event+15", "Acoustic Celebration #10", 23.5m, "Draft", 140, new Guid("a1b2c3d4-e5f6-7788-99a0-bcdef0123450") },
                    { new Guid("c1d2e3f4-a5b6-7788-99c0-def01234567f"), 150, "An unforgettable night of music.", new DateTime(2025, 6, 10, 22, 30, 0, 0, DateTimeKind.Utc), "https://via.placeholder.com/300x200/BC6146/FFFFFF?text=Event+16", "Rhythm Night #11", 25m, "Published", 150, new Guid("a1b2c3d4-e5f6-7788-99a0-bcdef0123451") },
                    { new Guid("c1d2e3f4-a5b6-7788-99c0-def012345680"), 160, "Intimate acoustic session.", new DateTime(2025, 6, 13, 23, 45, 0, 0, DateTimeKind.Utc), "https://via.placeholder.com/300x200/CF37CD/FFFFFF?text=Event+17", "Vibe Night #12", 26.5m, "Draft", 160, new Guid("a1b2c3d4-e5f6-7788-99a0-bcdef0123451") },
                    { new Guid("c1d2e3f4-a5b6-7788-99c0-def012345681"), 170, "Get ready to dance!", new DateTime(2025, 6, 16, 18, 0, 0, 0, DateTimeKind.Utc), "https://via.placeholder.com/300x200/E20E54/FFFFFF?text=Event+18", "Cosmic Experience #13", 28m, "Published", 170, new Guid("a1b2c3d4-e5f6-7788-99a0-bcdef0123452") },
                    { new Guid("c1d2e3f4-a5b6-7788-99c0-def012345682"), 180, "Celebrating the best of indie music.", new DateTime(2025, 6, 19, 19, 15, 0, 0, DateTimeKind.Utc), "https://via.placeholder.com/300x200/F4E4DB/FFFFFF?text=Event+19", "Rhythm Gathering #14", 29.5m, "Draft", 180, new Guid("a1b2c3d4-e5f6-7788-99a0-bcdef0123450") },
                    { new Guid("c1d2e3f4-a5b6-7788-99c0-def012345683"), 190, "Epic electronic beats.", new DateTime(2025, 6, 22, 20, 30, 0, 0, DateTimeKind.Utc), "https://via.placeholder.com/300x200/07BB63/FFFFFF?text=Event+20", "Electric Fest #15", 31m, "Published", 190, new Guid("a1b2c3d4-e5f6-7788-99a0-bcdef0123451") },
                    { new Guid("c1d2e3f4-a5b6-7788-99c0-def012345684"), 200, "Live and loud!", new DateTime(2025, 6, 25, 21, 45, 0, 0, DateTimeKind.Utc), "https://via.placeholder.com/300x200/1A91EA/FFFFFF?text=Event+21", "Melody Party #16", 32.5m, "Draft", 200, new Guid("a1b2c3d4-e5f6-7788-99a0-bcdef0123450") },
                    { new Guid("c1d2e3f4-a5b6-7788-99c0-def012345685"), 210, "Get ready to dance!", new DateTime(2025, 6, 28, 22, 0, 0, 0, DateTimeKind.Utc), "https://via.placeholder.com/300x200/2D6871/FFFFFF?text=Event+22", "Harmony Celebration #17", 34m, "Published", 210, new Guid("a1b2c3d4-e5f6-7788-99a0-bcdef0123452") },
                    { new Guid("c1d2e3f4-a5b6-7788-99c0-def012345686"), 220, "Epic electronic beats.", new DateTime(2025, 7, 1, 23, 15, 0, 0, DateTimeKind.Utc), "https://via.placeholder.com/300x200/403EF8/FFFFFF?text=Event+23", "Sonic Fest #18", 35.5m, "Draft", 220, new Guid("a1b2c3d4-e5f6-7788-99a0-bcdef0123450") },
                    { new Guid("c1d2e3f4-a5b6-7788-99c0-def012345687"), 230, "Intimate acoustic session.", new DateTime(2025, 7, 4, 18, 30, 0, 0, DateTimeKind.Utc), "https://via.placeholder.com/300x200/53157F/FFFFFF?text=Event+24", "Electric Journey #19", 37m, "Published", 230, new Guid("a1b2c3d4-e5f6-7788-99a0-bcdef0123451") },
                    { new Guid("c1d2e3f4-a5b6-7788-99c0-def012345688"), 240, "An unforgettable night of music.", new DateTime(2025, 7, 7, 19, 45, 0, 0, DateTimeKind.Utc), "https://via.placeholder.com/300x200/65EC06/FFFFFF?text=Event+25", "Acoustic Fest #20", 38.5m, "Draft", 240, new Guid("a1b2c3d4-e5f6-7788-99a0-bcdef0123452") },
                    { new Guid("e5c6b4a3-2d8e-5c1b-9f6a-7f4d5b3c2f0e"), 250, "Gran concierto de Coque Tornado presentando su último trabajo.", new DateTime(2025, 8, 1, 20, 0, 0, DateTimeKind.Utc), "https://picsum.photos/seed/coquetornadoevent/400/250", "Coque Tornado en Palacio de la Música", 10.00m, "Published", 250, new Guid("d4b7a5e3-1c9f-4b2a-8e7d-6f5c4b3a2e1d") }
                });

            migrationBuilder.InsertData(
                table: "EventArtists",
                columns: new[] { "ArtistId", "EventId" },
                values: new object[,]
                {
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234560"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345670") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234561"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345671") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234564"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345671") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234562"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345672") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234560"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345673") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234563"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345673") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234564"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345674") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234564"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345675") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234560"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345676") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234561"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345676") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234563"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345676") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234561"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345677") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234562"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345677") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234563"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345677") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234561"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345678") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234563"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345678") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234560"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345679") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234562"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345679") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234561"), new Guid("c1d2e3f4-a5b6-7788-99c0-def01234567a") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234563"), new Guid("c1d2e3f4-a5b6-7788-99c0-def01234567a") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234562"), new Guid("c1d2e3f4-a5b6-7788-99c0-def01234567b") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234563"), new Guid("c1d2e3f4-a5b6-7788-99c0-def01234567b") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234564"), new Guid("c1d2e3f4-a5b6-7788-99c0-def01234567c") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234564"), new Guid("c1d2e3f4-a5b6-7788-99c0-def01234567d") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234561"), new Guid("c1d2e3f4-a5b6-7788-99c0-def01234567e") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234562"), new Guid("c1d2e3f4-a5b6-7788-99c0-def01234567e") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234563"), new Guid("c1d2e3f4-a5b6-7788-99c0-def01234567e") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234561"), new Guid("c1d2e3f4-a5b6-7788-99c0-def01234567f") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234564"), new Guid("c1d2e3f4-a5b6-7788-99c0-def01234567f") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234560"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345680") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234562"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345680") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234561"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345681") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234562"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345682") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234560"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345683") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234561"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345684") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234563"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345684") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234564"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345684") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234560"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345685") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234561"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345685") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234564"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345685") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234560"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345686") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234561"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345686") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234562"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345686") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234562"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345687") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234563"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345687") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234561"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345688") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234562"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345688") },
                    { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234564"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345688") },
                    { new Guid("f81d4fae-7dec-11d0-a765-00a0c91e6bf6"), new Guid("e5c6b4a3-2d8e-5c1b-9f6a-7f4d5b3c2f0e") }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234560"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345670") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234561"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345671") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234564"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345671") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234562"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345672") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234560"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345673") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234563"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345673") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234564"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345674") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234564"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345675") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234560"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345676") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234561"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345676") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234563"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345676") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234561"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345677") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234562"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345677") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234563"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345677") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234561"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345678") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234563"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345678") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234560"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345679") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234562"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345679") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234561"), new Guid("c1d2e3f4-a5b6-7788-99c0-def01234567a") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234563"), new Guid("c1d2e3f4-a5b6-7788-99c0-def01234567a") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234562"), new Guid("c1d2e3f4-a5b6-7788-99c0-def01234567b") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234563"), new Guid("c1d2e3f4-a5b6-7788-99c0-def01234567b") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234564"), new Guid("c1d2e3f4-a5b6-7788-99c0-def01234567c") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234564"), new Guid("c1d2e3f4-a5b6-7788-99c0-def01234567d") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234561"), new Guid("c1d2e3f4-a5b6-7788-99c0-def01234567e") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234562"), new Guid("c1d2e3f4-a5b6-7788-99c0-def01234567e") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234563"), new Guid("c1d2e3f4-a5b6-7788-99c0-def01234567e") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234561"), new Guid("c1d2e3f4-a5b6-7788-99c0-def01234567f") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234564"), new Guid("c1d2e3f4-a5b6-7788-99c0-def01234567f") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234560"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345680") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234562"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345680") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234561"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345681") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234562"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345682") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234560"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345683") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234561"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345684") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234563"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345684") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234564"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345684") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234560"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345685") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234561"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345685") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234564"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345685") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234560"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345686") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234561"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345686") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234562"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345686") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234562"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345687") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234563"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345687") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234561"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345688") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234562"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345688") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234564"), new Guid("c1d2e3f4-a5b6-7788-99c0-def012345688") });

            migrationBuilder.DeleteData(
                table: "EventArtists",
                keyColumns: new[] { "ArtistId", "EventId" },
                keyValues: new object[] { new Guid("f81d4fae-7dec-11d0-a765-00a0c91e6bf6"), new Guid("e5c6b4a3-2d8e-5c1b-9f6a-7f4d5b3c2f0e") });

            migrationBuilder.DeleteData(
                table: "Artists",
                keyColumn: "Id",
                keyValue: new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234560"));

            migrationBuilder.DeleteData(
                table: "Artists",
                keyColumn: "Id",
                keyValue: new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234561"));

            migrationBuilder.DeleteData(
                table: "Artists",
                keyColumn: "Id",
                keyValue: new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234562"));

            migrationBuilder.DeleteData(
                table: "Artists",
                keyColumn: "Id",
                keyValue: new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234563"));

            migrationBuilder.DeleteData(
                table: "Artists",
                keyColumn: "Id",
                keyValue: new Guid("b1c2d3e4-f5a6-7788-99b0-cdef01234564"));

            migrationBuilder.DeleteData(
                table: "Artists",
                keyColumn: "Id",
                keyValue: new Guid("f81d4fae-7dec-11d0-a765-00a0c91e6bf6"));

            migrationBuilder.DeleteData(
                table: "Events",
                keyColumn: "Id",
                keyValue: new Guid("c1d2e3f4-a5b6-7788-99c0-def012345670"));

            migrationBuilder.DeleteData(
                table: "Events",
                keyColumn: "Id",
                keyValue: new Guid("c1d2e3f4-a5b6-7788-99c0-def012345671"));

            migrationBuilder.DeleteData(
                table: "Events",
                keyColumn: "Id",
                keyValue: new Guid("c1d2e3f4-a5b6-7788-99c0-def012345672"));

            migrationBuilder.DeleteData(
                table: "Events",
                keyColumn: "Id",
                keyValue: new Guid("c1d2e3f4-a5b6-7788-99c0-def012345673"));

            migrationBuilder.DeleteData(
                table: "Events",
                keyColumn: "Id",
                keyValue: new Guid("c1d2e3f4-a5b6-7788-99c0-def012345674"));

            migrationBuilder.DeleteData(
                table: "Events",
                keyColumn: "Id",
                keyValue: new Guid("c1d2e3f4-a5b6-7788-99c0-def012345675"));

            migrationBuilder.DeleteData(
                table: "Events",
                keyColumn: "Id",
                keyValue: new Guid("c1d2e3f4-a5b6-7788-99c0-def012345676"));

            migrationBuilder.DeleteData(
                table: "Events",
                keyColumn: "Id",
                keyValue: new Guid("c1d2e3f4-a5b6-7788-99c0-def012345677"));

            migrationBuilder.DeleteData(
                table: "Events",
                keyColumn: "Id",
                keyValue: new Guid("c1d2e3f4-a5b6-7788-99c0-def012345678"));

            migrationBuilder.DeleteData(
                table: "Events",
                keyColumn: "Id",
                keyValue: new Guid("c1d2e3f4-a5b6-7788-99c0-def012345679"));

            migrationBuilder.DeleteData(
                table: "Events",
                keyColumn: "Id",
                keyValue: new Guid("c1d2e3f4-a5b6-7788-99c0-def01234567a"));

            migrationBuilder.DeleteData(
                table: "Events",
                keyColumn: "Id",
                keyValue: new Guid("c1d2e3f4-a5b6-7788-99c0-def01234567b"));

            migrationBuilder.DeleteData(
                table: "Events",
                keyColumn: "Id",
                keyValue: new Guid("c1d2e3f4-a5b6-7788-99c0-def01234567c"));

            migrationBuilder.DeleteData(
                table: "Events",
                keyColumn: "Id",
                keyValue: new Guid("c1d2e3f4-a5b6-7788-99c0-def01234567d"));

            migrationBuilder.DeleteData(
                table: "Events",
                keyColumn: "Id",
                keyValue: new Guid("c1d2e3f4-a5b6-7788-99c0-def01234567e"));

            migrationBuilder.DeleteData(
                table: "Events",
                keyColumn: "Id",
                keyValue: new Guid("c1d2e3f4-a5b6-7788-99c0-def01234567f"));

            migrationBuilder.DeleteData(
                table: "Events",
                keyColumn: "Id",
                keyValue: new Guid("c1d2e3f4-a5b6-7788-99c0-def012345680"));

            migrationBuilder.DeleteData(
                table: "Events",
                keyColumn: "Id",
                keyValue: new Guid("c1d2e3f4-a5b6-7788-99c0-def012345681"));

            migrationBuilder.DeleteData(
                table: "Events",
                keyColumn: "Id",
                keyValue: new Guid("c1d2e3f4-a5b6-7788-99c0-def012345682"));

            migrationBuilder.DeleteData(
                table: "Events",
                keyColumn: "Id",
                keyValue: new Guid("c1d2e3f4-a5b6-7788-99c0-def012345683"));

            migrationBuilder.DeleteData(
                table: "Events",
                keyColumn: "Id",
                keyValue: new Guid("c1d2e3f4-a5b6-7788-99c0-def012345684"));

            migrationBuilder.DeleteData(
                table: "Events",
                keyColumn: "Id",
                keyValue: new Guid("c1d2e3f4-a5b6-7788-99c0-def012345685"));

            migrationBuilder.DeleteData(
                table: "Events",
                keyColumn: "Id",
                keyValue: new Guid("c1d2e3f4-a5b6-7788-99c0-def012345686"));

            migrationBuilder.DeleteData(
                table: "Events",
                keyColumn: "Id",
                keyValue: new Guid("c1d2e3f4-a5b6-7788-99c0-def012345687"));

            migrationBuilder.DeleteData(
                table: "Events",
                keyColumn: "Id",
                keyValue: new Guid("c1d2e3f4-a5b6-7788-99c0-def012345688"));

            migrationBuilder.DeleteData(
                table: "Events",
                keyColumn: "Id",
                keyValue: new Guid("e5c6b4a3-2d8e-5c1b-9f6a-7f4d5b3c2f0e"));

            migrationBuilder.DeleteData(
                table: "Venues",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-e5f6-7788-99a0-bcdef0123450"));

            migrationBuilder.DeleteData(
                table: "Venues",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-e5f6-7788-99a0-bcdef0123451"));

            migrationBuilder.DeleteData(
                table: "Venues",
                keyColumn: "Id",
                keyValue: new Guid("a1b2c3d4-e5f6-7788-99a0-bcdef0123452"));
            migrationBuilder.DeleteData(
                table: "Venues",
                keyColumn: "Id",
                keyValue: new Guid("d4b7a5e3-1c9f-4b2a-8e7d-6f5c4b3a2e1d"));
        }
    }
}
