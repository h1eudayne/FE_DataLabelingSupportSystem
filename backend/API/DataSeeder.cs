using DAL;
using DTOs.Constants;
using DTOs.Entities;
using Microsoft.EntityFrameworkCore;

namespace API
{
    public static class DataSeeder
    {
        public static async Task SeedUsersAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            if (await context.Users.AnyAsync()) return;
            var users = new List<User>
            {
                new User
                {
                    FullName = "Admin",
                    Email = "Admin@Gmail.com",
                    Role = UserRoles.Admin,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("1")
                },

                new User
                {
                    FullName = "Manager",
                    Email = "Manager@Gmail.com",
                    Role = UserRoles.Manager,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("1")
                },

                new User
                {
                    FullName = "Staff",
                    Email = "Staff@Gmail.com",
                    Role = UserRoles.Annotator,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("1")
                }
            };

            await context.Users.AddRangeAsync(users);
            await context.SaveChangesAsync();
        }
    }
}