using DTOs.Entities;
using Microsoft.EntityFrameworkCore;

namespace DAL
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<PaymentInfo> PaymentInfos { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<LabelClass> LabelClasses { get; set; }
        public DbSet<DataItem> DataItems { get; set; }
        public DbSet<Assignment> Assignments { get; set; }
        public DbSet<Annotation> Annotations { get; set; }
        public DbSet<ReviewLog> ReviewLogs { get; set; }
        public DbSet<Invoice> Invoices { get; set; }
        public DbSet<UserProjectStat> UserProjectStats { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 1. Cấu hình Project - Manager
            modelBuilder.Entity<Project>()
                .HasOne(p => p.Manager)
                .WithMany(u => u.ManagedProjects)
                .HasForeignKey(p => p.ManagerId)
                .OnDelete(DeleteBehavior.Restrict);

            // 2. Cấu hình Assignment - Annotator
            modelBuilder.Entity<Assignment>()
                .HasOne(a => a.Annotator)
                .WithMany(u => u.Assignments)
                .HasForeignKey(a => a.AnnotatorId)
                .OnDelete(DeleteBehavior.Restrict);

            // 3. Cấu hình ReviewLog - Reviewer
            modelBuilder.Entity<ReviewLog>()
                .HasOne(r => r.Reviewer)
                .WithMany(u => u.ReviewsGiven)
                .HasForeignKey(r => r.ReviewerId)
                .OnDelete(DeleteBehavior.Restrict);

            // 4. CẤU HÌNH INVOICE (ĐÃ CẬP NHẬT CHO KHỚP ENTITY MỚI)
            modelBuilder.Entity<Invoice>()
                .HasOne(i => i.User)        // Sửa Annotator -> User
                .WithMany(u => u.Invoices)
                .HasForeignKey(i => i.UserId) // Sửa AnnotatorId -> UserId
                .OnDelete(DeleteBehavior.Restrict);

            // 5. Cấu hình UserProjectStat
            modelBuilder.Entity<UserProjectStat>()
                .HasOne(s => s.User)
                .WithMany(u => u.ProjectStats)
                .HasForeignKey(s => s.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // 6. Cấu hình Assignment - Project (Tránh vòng lặp Cascade Delete)
            modelBuilder.Entity<Assignment>()
                .HasOne(a => a.Project)
                .WithMany()
                .HasForeignKey(a => a.ProjectId)
                .OnDelete(DeleteBehavior.NoAction);

            // 7. Cấu hình Annotation - LabelClass
            modelBuilder.Entity<Annotation>()
                 .HasOne(a => a.LabelClass)
                 .WithMany()
                 .HasForeignKey(a => a.ClassId)
                 .OnDelete(DeleteBehavior.Restrict);

            // 8. Cấu hình độ chính xác số thập phân (Decimal Precision)
            modelBuilder.Entity<Project>()
                .Property(p => p.PricePerLabel)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Project>()
                .Property(p => p.TotalBudget)
                .HasPrecision(18, 2);

            // Cập nhật tên cột cho Invoice
            modelBuilder.Entity<Invoice>()
                .Property(i => i.UnitPrice) // Sửa UnitPriceSnapshot -> UnitPrice
                .HasPrecision(18, 2);

            modelBuilder.Entity<Invoice>()
                .Property(i => i.TotalAmount)
                .HasPrecision(18, 2);
        }
    }
}