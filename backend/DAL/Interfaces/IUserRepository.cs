using DTOs.Entities;

namespace DAL.Interfaces
{
    public interface IUserRepository : IRepository<User>
    {
        Task<User?> GetUserByEmailAsync(string email);
        Task<User?> GetUserWithPaymentInfoAsync(string id);
        Task<bool> IsEmailExistsAsync(string email);
    }
}