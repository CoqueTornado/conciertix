using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace IndieAccessPass.API.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddGenreToArtist : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Genre",
                table: "Artists",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Genre",
                table: "Artists");
        }
    }
}
