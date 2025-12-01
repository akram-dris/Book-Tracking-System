using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookTrackingSystem.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddDatabaseIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ReadingSessions_BookId",
                table: "ReadingSessions");

            migrationBuilder.DropIndex(
                name: "IX_BookTagAssignments_TagId",
                table: "BookTagAssignments");

            migrationBuilder.CreateIndex(
                name: "IX_ReadingSessions_BookId_Date",
                table: "ReadingSessions",
                columns: new[] { "BookId", "Date" });

            migrationBuilder.CreateIndex(
                name: "IX_ReadingSessions_Date",
                table: "ReadingSessions",
                column: "Date");

            migrationBuilder.CreateIndex(
                name: "IX_Tags_Name",
                table: "BookTags",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_BookTagAssignments_TagId_BookId",
                table: "BookTagAssignments",
                columns: new[] { "TagId", "BookId" });

            migrationBuilder.CreateIndex(
                name: "IX_Books_CompletedDate",
                table: "Books",
                column: "CompletedDate");

            migrationBuilder.CreateIndex(
                name: "IX_Books_CreatedAt",
                table: "Books",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Books_Rating",
                table: "Books",
                column: "Rating");

            migrationBuilder.CreateIndex(
                name: "IX_Books_StartedReadingDate",
                table: "Books",
                column: "StartedReadingDate");

            migrationBuilder.CreateIndex(
                name: "IX_Books_Status_AuthorId",
                table: "Books",
                columns: new[] { "Status", "AuthorId" });

            migrationBuilder.CreateIndex(
                name: "IX_Authors_Name",
                table: "Authors",
                column: "Name");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ReadingSessions_BookId_Date",
                table: "ReadingSessions");

            migrationBuilder.DropIndex(
                name: "IX_ReadingSessions_Date",
                table: "ReadingSessions");

            migrationBuilder.DropIndex(
                name: "IX_Tags_Name",
                table: "BookTags");

            migrationBuilder.DropIndex(
                name: "IX_BookTagAssignments_TagId_BookId",
                table: "BookTagAssignments");

            migrationBuilder.DropIndex(
                name: "IX_Books_CompletedDate",
                table: "Books");

            migrationBuilder.DropIndex(
                name: "IX_Books_CreatedAt",
                table: "Books");

            migrationBuilder.DropIndex(
                name: "IX_Books_Rating",
                table: "Books");

            migrationBuilder.DropIndex(
                name: "IX_Books_StartedReadingDate",
                table: "Books");

            migrationBuilder.DropIndex(
                name: "IX_Books_Status_AuthorId",
                table: "Books");

            migrationBuilder.DropIndex(
                name: "IX_Authors_Name",
                table: "Authors");

            migrationBuilder.CreateIndex(
                name: "IX_ReadingSessions_BookId",
                table: "ReadingSessions",
                column: "BookId");

            migrationBuilder.CreateIndex(
                name: "IX_BookTagAssignments_TagId",
                table: "BookTagAssignments",
                column: "TagId");
        }
    }
}
