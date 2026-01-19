using DTOs.Entities;
using DTOs.Requests;

namespace BLL.Interfaces
{
    public interface IUserService
    {
        Task<User> RegisterAsync(string fullName, string email, string password, string role);
        Task<string?> LoginAsync(string email, string password);
        Task<User?> GetUserByIdAsync(string id);
        Task<bool> IsEmailExistsAsync(string email);
        Task UpdatePaymentInfoAsync(string userId, string bankName, string bankAccount, string taxCode);

        // Admin methods
        Task<List<User>> GetAllUsersAsync();
        Task UpdateUserAsync(string userId, UpdateUserRequest request);
        Task DeleteUserAsync(string userId);
    }
}