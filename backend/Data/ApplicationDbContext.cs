
using BookTrackingSystem.Models;
using Microsoft.EntityFrameworkCore;

namespace BookTrackingSystem.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Author> Authors { get; set; }
        public DbSet<Book> Books { get; set; }
        public DbSet<BookTag> BookTags { get; set; }
        public DbSet<BookTagAssignment> BookTagAssignments { get; set; }
        public DbSet<ReadingSession> ReadingSessions { get; set; }
        public DbSet<TargetLevel> TargetLevels { get; set; }
        public DbSet<ReadingTarget> ReadingTargets { get; set; }
        public DbSet<ReadingProgress> ReadingProgresses { get; set; }
        public DbSet<Note> Notes { get; set; }
        public DbSet<Setting> Settings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure composite primary key for BookTagAssignment
            modelBuilder.Entity<BookTagAssignment>()
                .HasKey(bta => new { bta.BookId, bta.TagId });

            // Configure one-to-many relationship between Author and Book
            modelBuilder.Entity<Author>()
                .HasMany(a => a.Books)
                .WithOne(b => b.Author)
                .HasForeignKey(b => b.AuthorId);

            // Configure many-to-many relationship between Book and BookTag
            modelBuilder.Entity<BookTagAssignment>()
                .HasOne(bta => bta.Book)
                .WithMany(b => b.BookTagAssignments)
                .HasForeignKey(bta => bta.BookId);

            modelBuilder.Entity<BookTagAssignment>()
                .HasOne(bta => bta.BookTag)
                .WithMany(bt => bt.BookTagAssignments)
                .HasForeignKey(bta => bta.TagId);

            // Configure one-to-many relationship between Book and ReadingSession
            modelBuilder.Entity<Book>()
                .HasMany(b => b.ReadingSessions)
                .WithOne(rs => rs.Book)
                .HasForeignKey(rs => rs.BookId);

            // Configure one-to-many relationship between Book and ReadingTarget
            modelBuilder.Entity<Book>()
                .HasMany(b => b.ReadingTargets)
                .WithOne(rt => rt.Book)
                .HasForeignKey(rt => rt.BookId);

            // Configure one-to-many relationship between TargetLevel and ReadingTarget
            modelBuilder.Entity<TargetLevel>()
                .HasMany(tl => tl.ReadingTargets)
                .WithOne(rt => rt.TargetLevel)
                .HasForeignKey(rt => rt.LevelId);

            // Configure one-to-many relationship between Book and ReadingProgress
            modelBuilder.Entity<Book>()
                .HasMany(b => b.ReadingProgresses)
                .WithOne(rp => rp.Book)
                .HasForeignKey(rp => rp.BookId);

            // Configure one-to-many relationship between ReadingTarget and ReadingProgress
            modelBuilder.Entity<ReadingTarget>()
                .HasMany(rt => rt.ReadingProgresses)
                .WithOne(rp => rp.ReadingTarget)
                .HasForeignKey(rp => rp.TargetId);

            // Configure one-to-many relationship between Book and Note
            modelBuilder.Entity<Book>()
                .HasMany(b => b.Notes)
                .WithOne(n => n.Book)
                .HasForeignKey(n => n.BookId)
                .IsRequired(false);

            // Configure one-to-one relationship between ReadingSession and Note
            modelBuilder.Entity<ReadingSession>()
                .HasOne(rs => rs.Note)
                .WithOne(n => n.ReadingSession)
                .HasForeignKey<Note>(n => n.SessionId)
                .IsRequired(false);
        }
    }
}
