using Microsoft.EntityFrameworkCore;
using SwitchgearApi.Models;

namespace SwitchgearApi.Data
{
    public class SwitchgearDbContext : DbContext
    {
        public SwitchgearDbContext(DbContextOptions<SwitchgearDbContext> options)
            : base(options)
        {
        }

        public DbSet<DocumentPackage> DocumentPackages { get; set; }
        public DbSet<DocumentPage> DocumentPages { get; set; }
        public DbSet<ExtractedParameter> ExtractedParameters { get; set; }
        public DbSet<SwitchgearCubicle> SwitchgearCubicles { get; set; }
        public DbSet<DeviceSelection> DeviceSelections { get; set; }
        public DbSet<DeviationItem> DeviationItems { get; set; }
        public DbSet<SwitchgearInstance> SwitchgearInstances { get; set; }
        public DbSet<CubicleDeviceExtraction> CubicleDeviceExtractions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // DocumentPackage → Pages, Parameters, Lineup, Deviations, Instances (all cascade)
            modelBuilder.Entity<DocumentPage>()
                .HasOne(p => p.DocumentPackage)
                .WithMany(d => d.Pages)
                .HasForeignKey(p => p.DocumentPackageId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ExtractedParameter>()
                .HasOne(p => p.DocumentPackage)
                .WithMany(d => d.Parameters)
                .HasForeignKey(p => p.DocumentPackageId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SwitchgearCubicle>()
                .HasOne(c => c.DocumentPackage)
                .WithMany(d => d.Lineup)
                .HasForeignKey(c => c.DocumentPackageId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<DeviceSelection>()
                .HasOne(d => d.Cubicle)
                .WithMany(c => c.Devices)
                .HasForeignKey(d => d.CubicleId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<DeviationItem>()
                .HasOne(d => d.DocumentPackage)
                .WithMany(dp => dp.Deviations)
                .HasForeignKey(d => d.DocumentPackageId)
                .OnDelete(DeleteBehavior.Cascade);

            // SwitchgearInstance → DocumentPackage (cascade delete)
            modelBuilder.Entity<SwitchgearInstance>()
                .HasOne(i => i.DocumentPackage)
                .WithMany(d => d.Instances)
                .HasForeignKey(i => i.DocumentPackageId)
                .OnDelete(DeleteBehavior.Cascade);

            // ExtractedParameter → SwitchgearInstance (no action on instance delete — parent doc deletion handles it)
            modelBuilder.Entity<ExtractedParameter>()
                .HasOne(p => p.SwitchgearInstance)
                .WithMany(i => i.Parameters)
                .HasForeignKey(p => p.SwitchgearInstanceId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.NoAction);

            // SwitchgearCubicle → SwitchgearInstance
            modelBuilder.Entity<SwitchgearCubicle>()
                .HasOne(c => c.SwitchgearInstance)
                .WithMany(i => i.Cubicles)
                .HasForeignKey(c => c.SwitchgearInstanceId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.NoAction);

            // Indexes
            modelBuilder.Entity<DocumentPackage>().HasIndex(d => d.Status);
            modelBuilder.Entity<DocumentPackage>().HasIndex(d => d.UploadedAt);
            modelBuilder.Entity<ExtractedParameter>().HasIndex(p => p.ConfidenceScore);
            modelBuilder.Entity<ExtractedParameter>().HasIndex(p => p.SwitchgearInstanceId);
            modelBuilder.Entity<SwitchgearCubicle>().HasIndex(c => c.SwitchgearInstanceId);
            modelBuilder.Entity<DeviationItem>().HasIndex(d => d.Resolved);
            modelBuilder.Entity<DeviationItem>().HasIndex(d => d.Severity);

            modelBuilder.Entity<CubicleDeviceExtraction>()
                .HasOne(c => c.DocumentPackage)
                .WithMany()
                .HasForeignKey(c => c.DocumentPackageId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CubicleDeviceExtraction>()
                .HasOne(c => c.SwitchgearInstance)
                .WithMany()
                .HasForeignKey(c => c.SwitchgearInstanceId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.NoAction);

            modelBuilder.Entity<CubicleDeviceExtraction>()
                .HasIndex(c => c.DocumentPackageId);
            modelBuilder.Entity<CubicleDeviceExtraction>()
                .HasIndex(c => c.SwitchgearInstanceId);
        }
    }
}
