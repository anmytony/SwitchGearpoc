using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SwitchgearApi.Migrations
{
    /// <inheritdoc />
    public partial class AddRawPdfBase64 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RawPdfBase64",
                table: "DocumentPackages",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RawPdfBase64",
                table: "DocumentPackages");
        }
    }
}
