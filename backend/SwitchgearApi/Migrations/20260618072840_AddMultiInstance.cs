using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SwitchgearApi.Migrations
{
    /// <inheritdoc />
    public partial class AddMultiInstance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SwitchgearInstanceId",
                table: "SwitchgearCubicles",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SwitchgearInstanceId",
                table: "ExtractedParameters",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SwitchgearInstanceName",
                table: "ExtractedParameters",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "SwitchgearInstances",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    DocumentPackageId = table.Column<int>(type: "int", nullable: false),
                    InstanceIndex = table.Column<int>(type: "int", nullable: false),
                    InstanceName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Location = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SwitchgearInstances", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SwitchgearInstances_DocumentPackages_DocumentPackageId",
                        column: x => x.DocumentPackageId,
                        principalTable: "DocumentPackages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SwitchgearCubicles_SwitchgearInstanceId",
                table: "SwitchgearCubicles",
                column: "SwitchgearInstanceId");

            migrationBuilder.CreateIndex(
                name: "IX_ExtractedParameters_SwitchgearInstanceId",
                table: "ExtractedParameters",
                column: "SwitchgearInstanceId");

            migrationBuilder.CreateIndex(
                name: "IX_SwitchgearInstances_DocumentPackageId",
                table: "SwitchgearInstances",
                column: "DocumentPackageId");

            migrationBuilder.AddForeignKey(
                name: "FK_ExtractedParameters_SwitchgearInstances_SwitchgearInstanceId",
                table: "ExtractedParameters",
                column: "SwitchgearInstanceId",
                principalTable: "SwitchgearInstances",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SwitchgearCubicles_SwitchgearInstances_SwitchgearInstanceId",
                table: "SwitchgearCubicles",
                column: "SwitchgearInstanceId",
                principalTable: "SwitchgearInstances",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ExtractedParameters_SwitchgearInstances_SwitchgearInstanceId",
                table: "ExtractedParameters");

            migrationBuilder.DropForeignKey(
                name: "FK_SwitchgearCubicles_SwitchgearInstances_SwitchgearInstanceId",
                table: "SwitchgearCubicles");

            migrationBuilder.DropTable(
                name: "SwitchgearInstances");

            migrationBuilder.DropIndex(
                name: "IX_SwitchgearCubicles_SwitchgearInstanceId",
                table: "SwitchgearCubicles");

            migrationBuilder.DropIndex(
                name: "IX_ExtractedParameters_SwitchgearInstanceId",
                table: "ExtractedParameters");

            migrationBuilder.DropColumn(
                name: "SwitchgearInstanceId",
                table: "SwitchgearCubicles");

            migrationBuilder.DropColumn(
                name: "SwitchgearInstanceId",
                table: "ExtractedParameters");

            migrationBuilder.DropColumn(
                name: "SwitchgearInstanceName",
                table: "ExtractedParameters");
        }
    }
}
