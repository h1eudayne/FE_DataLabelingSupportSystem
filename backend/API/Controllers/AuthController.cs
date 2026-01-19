using BLL.Interfaces;
using DTOs.Requests;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;

        public AuthController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            try
            {
                var user = await _userService.RegisterAsync(request.FullName, request.Email, request.Password, request.Role);
                return Ok(new { Message = "Registration successful", UserId = user.Id });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var token = await _userService.LoginAsync(request.Email, request.Password);
            if (token == null)
            {
                return Unauthorized(new { Message = "Invalid email or password" });
            }

            return Ok(new
            {
                Message = "Login successful",
                AccessToken = token,
                TokenType = "Bearer"
            });
        }
    }
}