namespace BookTrackingSystem.Models.Common
{
    public class Result<T>
    {
        public bool IsSuccess { get; set; }
        public T? Data { get; set; }
        public List<string> Errors { get; set; } = new();

        public static Result<T> Success(T data)
        {
            return new Result<T>
            {
                IsSuccess = true,
                Data = data,
                Errors = new List<string>()
            };
        }

        public static Result<T> Failure(string error)
        {
            return new Result<T>
            {
                IsSuccess = false,
                Data = default,
                Errors = new List<string> { error }
            };
        }

        public static Result<T> Failure(IEnumerable<string> errors)
        {
            return new Result<T>
            {
                IsSuccess = false,
                Data = default,
                Errors = errors.ToList()
            };
        }
    }

    public class Result
    {
        public bool IsSuccess { get; set; }
        public List<string> Errors { get; set; } = new();

        public static Result Success()
        {
            return new Result
            {
                IsSuccess = true,
                Errors = new List<string>()
            };
        }

        public static Result Failure(string error)
        {
            return new Result
            {
                IsSuccess = false,
                Errors = new List<string> { error }
            };
        }

        public static Result Failure(IEnumerable<string> errors)
        {
            return new Result
            {
                IsSuccess = false,
                Errors = errors.ToList()
            };
        }
    }
}
