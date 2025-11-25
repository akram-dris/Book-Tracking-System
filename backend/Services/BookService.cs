
using AutoMapper;
using BookTrackingSystem.DTOs;
using BookTrackingSystem.Models;
using BookTrackingSystem.Models.Common;
using BookTrackingSystem.Models.Enums;
using BookTrackingSystem.Models.Pagination;
using BookTrackingSystem.Repository;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace BookTrackingSystem.Services
{
    public class BookService : IBookService
    {
        private readonly IBookRepository _bookRepository;
        private readonly IBookTagAssignmentRepository _bookTagAssignmentRepository;
        private readonly ITagRepository _tagRepository;
        private readonly IMapper _mapper;
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly ICacheService _cacheService;

        public BookService(IBookRepository bookRepository, IBookTagAssignmentRepository bookTagAssignmentRepository, ITagRepository tagRepository, IMapper mapper, IWebHostEnvironment webHostEnvironment, ICacheService cacheService)
        {
            _bookRepository = bookRepository;
            _bookTagAssignmentRepository = bookTagAssignmentRepository;
            _tagRepository = tagRepository;
            _mapper = mapper;
            _webHostEnvironment = webHostEnvironment;
            _cacheService = cacheService;
        }

        public async Task<Result<IEnumerable<BookDto>>> GetBooksAsync(int? tagId = null, string? search = null)
        {
            try
            {
                string cacheKey = $"books_list_{tagId}_{search}";
                var books = await _cacheService.GetOrCreateAsync(cacheKey, async () =>
                {
                    var books = await _bookRepository.GetBooksAsync(tagId, search);
                    return _mapper.Map<IEnumerable<BookDto>>(books);
                }) ?? Enumerable.Empty<BookDto>();
                return Result<IEnumerable<BookDto>>.Success(books);
            }
            catch (Exception ex)
            {
                return Result<IEnumerable<BookDto>>.Failure($"An error occurred while retrieving books: {ex.Message}");
            }
        }

        public async Task<Result<PaginatedResult<BookDto>>> GetBooksPaginatedAsync(PaginationParams paginationParams, int? tagId = null)
        {
            try
            {
                var paginatedBooks = await _bookRepository.GetBooksPaginatedAsync(paginationParams, tagId);
                
                var bookDtos = _mapper.Map<List<BookDto>>(paginatedBooks.Items);
                
                var result = new PaginatedResult<BookDto>(
                    bookDtos,
                    paginatedBooks.TotalCount,
                    paginatedBooks.PageNumber,
                    paginatedBooks.PageSize
                );

                return Result<PaginatedResult<BookDto>>.Success(result);
            }
            catch (Exception ex)
            {
                return Result<PaginatedResult<BookDto>>.Failure($"An error occurred while retrieving books: {ex.Message}");
            }
        }

        public async Task<Result<Dictionary<int, int>>> GetBookCountsByStatusAsync()
        {
            try
            {
                var counts = await _bookRepository.GetBookCountsByStatusAsync();
                return Result<Dictionary<int, int>>.Success(counts);
            }
            catch (Exception ex)
            {
                return Result<Dictionary<int, int>>.Failure($"An error occurred while retrieving book counts: {ex.Message}");
            }
        }
        
        public async Task<Result<BookDto>> GetBookAsync(int id)
        {
            try
            {
                string cacheKey = $"book_{id}";
                var bookDto = await _cacheService.GetOrCreateAsync(cacheKey, async () =>
                {
                    var book = await _bookRepository.GetBookAsync(id);
                    if (book == null)
                    {
                        return null;
                    }
                    return _mapper.Map<BookDto>(book);
                });

                if (bookDto == null)
                {
                    return Result<BookDto>.Failure("Book not found");
                }

                return Result<BookDto>.Success(bookDto);
            }
            catch (Exception ex)
            {
                return Result<BookDto>.Failure($"An error occurred while retrieving the book: {ex.Message}");
            }
        }

        public async Task<Result<BookDto>> AddBookAsync(CreateBookDto createBookDto, IFormFile? imageFile)
        {
            try
            {
                var book = _mapper.Map<Book>(createBookDto);

                if (imageFile != null)
                {
                    var uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "images", "books");
                    if (!Directory.Exists(uploadsFolder))
                    {
                        Directory.CreateDirectory(uploadsFolder);
                    }
                    var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(imageFile.FileName);
                    var filePath = Path.Combine(uploadsFolder, uniqueFileName);
                    using (var fileStream = new FileStream(filePath, FileMode.Create))
                    {
                        await imageFile.CopyToAsync(fileStream);
                    }
                    book.ImageUrl = "/images/books/" + uniqueFileName;
                }

                var newBook = await _bookRepository.AddBookAsync(book);
                _cacheService.InvalidateBooks();
                return Result<BookDto>.Success(_mapper.Map<BookDto>(newBook));
            }
            catch (Exception ex)
            {
                return Result<BookDto>.Failure($"An error occurred while adding the book: {ex.Message}");
            }
        }

        public async Task<Result<BookDto>> UpdateBookAsync(int id, UpdateBookDto updateBookDto, IFormFile? imageFile)
        {
            try
            {
                var book = await _bookRepository.GetBookAsync(id);
                
                if (book == null)
                {
                    return Result<BookDto>.Failure("Book not found");
                }

                // Validate that total pages cannot be changed if book is currently reading or completed
                if (book.TotalPages != updateBookDto.TotalPages)
                {
                    if (book.Status == ReadingStatus.CurrentlyReading || 
                        book.Status == ReadingStatus.Completed || 
                        book.Status == ReadingStatus.Summarized)
                    {
                        return Result<BookDto>.Failure("Cannot change total pages after reading has started. The book must be in 'Not Reading' or 'Planning' status to modify total pages.");
                    }
                }

                _mapper.Map(updateBookDto, book);

                if (imageFile != null)
                {
                    if (!string.IsNullOrEmpty(book!.ImageUrl))
                    {
                        var oldImagePath = Path.Combine(_webHostEnvironment.WebRootPath, book.ImageUrl.TrimStart('/'));
                        if (File.Exists(oldImagePath))
                        {
                            File.Delete(oldImagePath);
                        }
                    }

                    var uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "images", "books");
                    if (!Directory.Exists(uploadsFolder))
                    {
                        Directory.CreateDirectory(uploadsFolder);
                    }
                    var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(imageFile.FileName);
                    var filePath = Path.Combine(uploadsFolder, uniqueFileName);
                    using (var fileStream = new FileStream(filePath, FileMode.Create))
                    {
                        await imageFile.CopyToAsync(fileStream);
                    }
                    book.ImageUrl = "/images/books/" + uniqueFileName;
                }

                var updatedBook = await _bookRepository.UpdateBookAsync(book!);
                _cacheService.InvalidateBook(id);
                return Result<BookDto>.Success(_mapper.Map<BookDto>(updatedBook));
            }
            catch (Exception ex)
            {
                return Result<BookDto>.Failure($"An error occurred while updating the book: {ex.Message}");
            }
        }

        public async Task<Result> DeleteBookAsync(int id)
        {
            try
            {
                var book = await _bookRepository.GetBookAsync(id);
                if (book == null)
                {
                    return Result.Failure("Book not found");
                }

                if (!string.IsNullOrEmpty(book.ImageUrl))
                {
                    var imagePath = Path.Combine(_webHostEnvironment.WebRootPath, book.ImageUrl.TrimStart('/'));
                    if (File.Exists(imagePath))
                    {
                        File.Delete(imagePath);
                    }
                }

                await _bookRepository.DeleteBookAsync(id);
                _cacheService.InvalidateBook(id);
                return Result.Success();
            }
            catch (Exception ex)
            {
                return Result.Failure($"An error occurred while deleting the book: {ex.Message}");
            }
        }

        public async Task<Result> AssignTagsAsync(int bookId, IEnumerable<int> tagIds)
        {
            try
            {
                var book = await _bookRepository.GetBookAsync(bookId);
                if (book == null)
                {
                    return Result.Failure("Book not found");
                }

                var existingAssignments = await _bookTagAssignmentRepository.GetByBookIdAsync(bookId);
                foreach (var assignment in existingAssignments)
                {
                    await _bookTagAssignmentRepository.RemoveAsync(assignment);
                }

                foreach (var tagId in tagIds)
                {
                    var tag = await _tagRepository.GetByIdAsync(tagId);
                    if (tag != null)
                    {
                        var newAssignment = new BookTagAssignment
                        {
                            BookId = bookId,
                            TagId = tagId
                        };
                        await _bookTagAssignmentRepository.AddAsync(newAssignment);
                    }
                }
                _cacheService.InvalidateBook(bookId);
                return Result.Success();
            }
            catch (Exception ex)
            {
                return Result.Failure($"An error occurred while assigning tags: {ex.Message}");
            }
        }

        public async Task<Result> UpdateBookStatusAsync(int bookId, ReadingStatus status, DateTime? startedReadingDate = null, DateTime? completedDate = null, string? summary = null, int? rating = null)
        {
            try
            {
                var book = await _bookRepository.GetBookAsync(bookId);
                if (book != null)
                {
                    book.Status = status;
                    if (startedReadingDate.HasValue)
                    {
                        book.StartedReadingDate = startedReadingDate.Value;
                    }
                    if (completedDate.HasValue)
                    {
                        book.CompletedDate = completedDate.Value;
                    }
                    if (!string.IsNullOrEmpty(summary))
                    {
                        book.Summary = summary;
                    }
                    if (rating.HasValue)
                    {
                        book.Rating = rating.Value;
                    }
                    await _bookRepository.UpdateBookAsync(book);
                    _cacheService.InvalidateBook(bookId);
                    return Result.Success();
                }
                return Result.Failure("Book not found");
            }
            catch (Exception ex)
            {
                return Result.Failure($"An error occurred while updating book status: {ex.Message}");
            }
        }

        public async Task<Result> UpdateBookCompletedDateAsync(int bookId, DateTime? completedDate)
        {
            try
            {
                var book = await _bookRepository.GetBookAsync(bookId);
                if (book != null)
                {
                    book.CompletedDate = completedDate;
                    await _bookRepository.UpdateBookAsync(book); // Ensure the book is updated in the repository
                    _cacheService.InvalidateBook(bookId);
                    return Result.Success();
                }
                return Result.Failure("Book not found");
            }
            catch (Exception ex)
            {
                return Result.Failure($"An error occurred while updating book completed date: {ex.Message}");
            }
        }

        public async Task<Result> UpdateBookSummaryAsync(int bookId, string summary)
        {
            try
            {
                var book = await _bookRepository.GetBookAsync(bookId);
                if (book != null)
                {
                    book.Summary = summary;
                    await _bookRepository.UpdateBookAsync(book);
                    _cacheService.InvalidateBook(bookId);
                    return Result.Success();
                }
                return Result.Failure("Book not found");
            }
            catch (Exception ex)
            {
                return Result.Failure($"An error occurred while updating book summary: {ex.Message}");
            }
        }
    }
}
