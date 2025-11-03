using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookTrackingSystem.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddStartedReadingDateToBook : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "StartedReadingDate",
                table: "Books",
                type: "timestamp with time zone",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "StartedReadingDate",
                table: "Books");
        }
    }
}
