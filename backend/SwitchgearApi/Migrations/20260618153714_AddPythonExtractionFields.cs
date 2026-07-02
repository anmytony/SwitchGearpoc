using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SwitchgearApi.Migrations
{
    /// <inheritdoc />
    public partial class AddPythonExtractionFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TopologySummary",
                table: "SwitchgearInstances",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ExtractionPath",
                table: "ExtractedParameters",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SourceBoundingBox",
                table: "ExtractedParameters",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SourceText",
                table: "ExtractedParameters",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TopologySummary",
                table: "SwitchgearInstances");

            migrationBuilder.DropColumn(
                name: "ExtractionPath",
                table: "ExtractedParameters");

            migrationBuilder.DropColumn(
                name: "SourceBoundingBox",
                table: "ExtractedParameters");

            migrationBuilder.DropColumn(
                name: "SourceText",
                table: "ExtractedParameters");
        }
    }
}
