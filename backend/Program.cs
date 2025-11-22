
using Microsoft.OpenApi.Models;
using DotNetEnv;
using BookTrackingSystem.Data;
using Microsoft.EntityFrameworkCore;

// Load .env file
Env.Load();

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});

// Add DbContext
var connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// Add repository and service
builder.Services.AddScoped<BookTrackingSystem.Repository.IBookRepository, BookTrackingSystem.Repository.BookRepository>();
builder.Services.AddScoped<BookTrackingSystem.Services.IBookService, BookTrackingSystem.Services.BookService>();
builder.Services.AddScoped<BookTrackingSystem.Repository.IAuthorRepository, BookTrackingSystem.Repository.AuthorRepository>();
builder.Services.AddScoped<BookTrackingSystem.Services.IAuthorService, BookTrackingSystem.Services.AuthorService>();
builder.Services.AddScoped<BookTrackingSystem.Repository.ITagRepository, BookTrackingSystem.Repository.TagRepository>();
builder.Services.AddScoped<BookTrackingSystem.Services.ITagService, BookTrackingSystem.Services.TagService>();
builder.Services.AddScoped<BookTrackingSystem.Repository.IBookTagAssignmentRepository, BookTrackingSystem.Repository.BookTagAssignmentRepository>();
builder.Services.AddScoped<BookTrackingSystem.Repository.IReadingSessionRepository, BookTrackingSystem.Repository.ReadingSessionRepository>();
builder.Services.AddScoped<BookTrackingSystem.Services.IReadingSessionService, BookTrackingSystem.Services.ReadingSessionService>();
builder.Services.AddScoped<BookTrackingSystem.Repository.IReadingGoalRepository, BookTrackingSystem.Repository.ReadingGoalRepository>();
builder.Services.AddScoped<BookTrackingSystem.Services.IReadingGoalService, BookTrackingSystem.Services.ReadingGoalService>();
builder.Services.AddScoped<BookTrackingSystem.Services.IHeatmapService, BookTrackingSystem.Services.HeatmapService>();
builder.Services.AddScoped<BookTrackingSystem.Services.IStreakService, BookTrackingSystem.Services.StreakService>();
builder.Services.AddScoped<BookTrackingSystem.Services.IReadingStatusService, BookTrackingSystem.Services.ReadingStatusService>();
builder.Services.AddScoped<BookTrackingSystem.Services.IStatisticsService, BookTrackingSystem.Services.StatisticsService>();
builder.Services.AddScoped<BookTrackingSystem.Services.ISearchService, BookTrackingSystem.Services.SearchService>();

// Add AutoMapper
builder.Services.AddAutoMapper(typeof(Program));

// Add Swagger generation
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Book Tracking System API",
        Version = "v1",
        Description = "An API for tracking books and reading progress."
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Book Tracking System API v1");
        c.RoutePrefix = string.Empty; // Set Swagger UI at the app's root
    });
}

app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseAuthorization();

app.UseCors("AllowAll");

app.MapControllers();

app.Run();

