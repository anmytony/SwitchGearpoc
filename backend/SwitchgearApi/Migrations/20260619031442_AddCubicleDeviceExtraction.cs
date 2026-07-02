using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SwitchgearApi.Migrations
{
    /// <inheritdoc />
    public partial class AddCubicleDeviceExtraction : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CubicleDeviceExtractions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DocumentPackageId = table.Column<int>(type: "int", nullable: false),
                    SwitchgearInstanceId = table.Column<int>(type: "int", nullable: true),
                    FunctionalPosition = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PanelType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CBModel = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CBRating = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CTRatio = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    VTRatio = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RelayModel = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProtectionFunctions = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExtractionPath = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ConfidenceScore = table.Column<double>(type: "float", nullable: false),
                    SourcePage = table.Column<int>(type: "int", nullable: false),
                    SourceBoundingBox = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CubicleDeviceExtractions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CubicleDeviceExtractions_DocumentPackages_DocumentPackageId",
                        column: x => x.DocumentPackageId,
                        principalTable: "DocumentPackages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CubicleDeviceExtractions_SwitchgearInstances_SwitchgearInstanceId",
                        column: x => x.SwitchgearInstanceId,
                        principalTable: "SwitchgearInstances",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_CubicleDeviceExtractions_DocumentPackageId",
                table: "CubicleDeviceExtractions",
                column: "DocumentPackageId");

            migrationBuilder.CreateIndex(
                name: "IX_CubicleDeviceExtractions_SwitchgearInstanceId",
                table: "CubicleDeviceExtractions",
                column: "SwitchgearInstanceId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CubicleDeviceExtractions");
        }
    }
}
