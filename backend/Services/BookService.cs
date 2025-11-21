
using AutoMapper;
using BookTrackingSystem.DTOs;
using BookTrackingSystem.Models;
using BookTrackingSystem.Models.Enums;
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

        public BookService(IBookRepository bookRepository, IBookTagAssignmentRepository bookTagAssignmentRepository, ITagRepository tagRepository, IMapper mapper, IWebHostEnvironment webHostEnvironment)
        {
            _bookRepository = bookRepository;
            _bookTagAssignmentRepository = bookTagAssignmentRepository;
            _tagRepository = tagRepository;
            _mapper = mapper;
            _webHostEnvironment = webHostEnvironment;
        }

        public async Task<IEnumerable<BookDto>> GetBooksAsync(int? tagId = null, string? search = null)
        {
            var books = await _bookRepository.GetBooksAsync(tagId, search);
            return _mapper.Map<IEnumerable<BookDto>>(books);
        }

        public async Task<BookDto?> GetBookAsync(int id)
        {
            var book = await _bookRepository.GetBookAsync(id);
            if (book == null)
            {
                return null;
            }
            return _mapper.Map<BookDto>(book)!;
        }

        public async Task<BookDto> AddBookAsync(CreateBookDto createBookDto, IFormFile? imageFile)
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
            return _mapper.Map<BookDto>(newBook);
        }

        public async Task<BookDto> UpdateBookAsync(int id, UpdateBookDto updateBookDto, IFormFile? imageFile)
        {
            var book = await _bookRepository.GetBookAsync(id);

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
            return _mapper.Map<BookDto>(updatedBook);
        }

        public async Task DeleteBookAsync(int id)
        {
            await _bookRepository.DeleteBookAsync(id);
        }

        public async Task AssignTagsAsync(int bookId, IEnumerable<int> tagIds)
        {
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
        }

        public async Task UpdateBookStatusAsync(int bookId, ReadingStatus status, DateTime? startedReadingDate = null, DateTime? completedDate = null, string? summary = null)
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
                await _bookRepository.UpdateBookAsync(book);
            }
        }

        public async Task UpdateBookCompletedDateAsync(int bookId, DateTime? completedDate)
        {
            var book = await _bookRepository.GetBookAsync(bookId);
            if (book != null)
            {
                book.CompletedDate = completedDate;
                await _bookRepository.UpdateBookAsync(book); // Ensure the book is updated in the repository
            }
        }

        public async Task UpdateBookSummaryAsync(int bookId, string summary)
        {
            var book = await _bookRepository.GetBookAsync(bookId);
            if (book != null)
            {
                book.Summary = summary;
                await _bookRepository.UpdateBookAsync(book);
            }
        }
    }
}
