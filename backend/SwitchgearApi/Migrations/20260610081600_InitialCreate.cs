using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SwitchgearApi.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DocumentPackages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UploadedBy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UploadedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    OverallConfidence = table.Column<double>(type: "float", nullable: false),
                    ErrorMessage = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    XmlOutput = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProcessedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentPackages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DeviationItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DocumentPackageId = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AffectedField = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SourcePageNumbers = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SuggestedValue = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Resolved = table.Column<bool>(type: "bit", nullable: false),
                    EngineersComment = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Severity = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ResolvedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeviationItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DeviationItems_DocumentPackages_DocumentPackageId",
                        column: x => x.DocumentPackageId,
                        principalTable: "DocumentPackages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DocumentPages",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DocumentPackageId = table.Column<int>(type: "int", nullable: false),
                    PageNumber = table.Column<int>(type: "int", nullable: false),
                    Classification = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ClassificationConfidence = table.Column<double>(type: "float", nullable: false),
                    RawContent = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    FilePath = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ClassifiedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentPages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DocumentPages_DocumentPackages_DocumentPackageId",
                        column: x => x.DocumentPackageId,
                        principalTable: "DocumentPackages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ExtractedParameters",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DocumentPackageId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Unit = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ConfidenceScore = table.Column<double>(type: "float", nullable: false),
                    SourcePageNumber = table.Column<int>(type: "int", nullable: false),
                    FlaggedForReview = table.Column<bool>(type: "bit", nullable: false),
                    NormalizedValue = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IsAbbDefault = table.Column<bool>(type: "bit", nullable: true),
                    ExtractionReason = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExtractedParameters", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExtractedParameters_DocumentPackages_DocumentPackageId",
                        column: x => x.DocumentPackageId,
                        principalTable: "DocumentPackages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SwitchgearCubicles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DocumentPackageId = table.Column<int>(type: "int", nullable: false),
                    Position = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AbbProductFamily = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AbbArticleNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    ConfidenceScore = table.Column<double>(type: "float", nullable: false),
                    TopologyWarning = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SwitchgearCubicles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SwitchgearCubicles_DocumentPackages_DocumentPackageId",
                        column: x => x.DocumentPackageId,
                        principalTable: "DocumentPackages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DeviceSelections",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CubicleId = table.Column<int>(type: "int", nullable: false),
                    DeviceType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AbbArticleNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    ConfidenceScore = table.Column<double>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeviceSelections", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DeviceSelections_SwitchgearCubicles_CubicleId",
                        column: x => x.CubicleId,
                        principalTable: "SwitchgearCubicles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DeviationItems_DocumentPackageId",
                table: "DeviationItems",
                column: "DocumentPackageId");

            migrationBuilder.CreateIndex(
                name: "IX_DeviationItems_Resolved",
                table: "DeviationItems",
                column: "Resolved");

            migrationBuilder.CreateIndex(
                name: "IX_DeviationItems_Severity",
                table: "DeviationItems",
                column: "Severity");

            migrationBuilder.CreateIndex(
                name: "IX_DeviceSelections_CubicleId",
                table: "DeviceSelections",
                column: "CubicleId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentPackages_Status",
                table: "DocumentPackages",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentPackages_UploadedAt",
                table: "DocumentPackages",
                column: "UploadedAt");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentPages_DocumentPackageId",
                table: "DocumentPages",
                column: "DocumentPackageId");

            migrationBuilder.CreateIndex(
                name: "IX_ExtractedParameters_ConfidenceScore",
                table: "ExtractedParameters",
                column: "ConfidenceScore");

            migrationBuilder.CreateIndex(
                name: "IX_ExtractedParameters_DocumentPackageId",
                table: "ExtractedParameters",
                column: "DocumentPackageId");

            migrationBuilder.CreateIndex(
                name: "IX_SwitchgearCubicles_DocumentPackageId",
                table: "SwitchgearCubicles",
                column: "DocumentPackageId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DeviationItems");

            migrationBuilder.DropTable(
                name: "DeviceSelections");

            migrationBuilder.DropTable(
                name: "DocumentPages");

            migrationBuilder.DropTable(
                name: "ExtractedParameters");

            migrationBuilder.DropTable(
                name: "SwitchgearCubicles");

            migrationBuilder.DropTable(
                name: "DocumentPackages");
        }
    }
}
