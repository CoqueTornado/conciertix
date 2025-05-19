using System;
using System.ComponentModel.DataAnnotations.Schema;

    /// <summary>
    /// Represents the join entity for the many-to-many relationship between <see cref="Event"/> and <see cref="Artist"/>.
    /// It links an event to an artist performing at that event.
    /// </summary>
    namespace IndieAccessPass.API.Models
    {
        public class EventArtist
        {
            /// <summary>
            /// Gets or sets the unique identifier of the event.
            /// This is part of the composite primary key and a foreign key to the <see cref="Event"/> entity.
            /// </summary>
            public Guid EventId { get; set; }

            /// <summary>
            /// Gets or sets the navigation property for the event.
            /// </summary>
            [ForeignKey("EventId")]
            public Event? Event { get; set; }

            /// <summary>
            /// Gets or sets the unique identifier of the artist.
            /// This is part of the composite primary key and a foreign key to the <see cref="Artist"/> entity.
            /// </summary>
            public Guid ArtistId { get; set; }

            /// <summary>
            /// Gets or sets the navigation property for the artist.
            /// </summary>
            [ForeignKey("ArtistId")]
            public Artist? Artist { get; set; }
        }
    }