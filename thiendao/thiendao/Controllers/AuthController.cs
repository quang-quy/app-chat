using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using thiendao.DTO;
using thiendao.Model;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _config;
      private readonly IConfiguration _configuration;

    public AuthController(IConfiguration config)
    {
        _config = config;
    }

    public string GenerateJwtToken(int userId, string username)
    {
        var jwtSettings = _config.GetSection("Jwt").Get<JWT>();

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
        new Claim(ClaimTypes.NameIdentifier, userId.ToString()),   // 👈 Quan trọng cho SignalR
        new Claim(ClaimTypes.Name, username)
    };

        var token = new JwtSecurityToken(
            issuer: jwtSettings.Issuer,
            audience: jwtSettings.Audience,
            claims: claims,                                            // 👈 đúng thuộc tính
            expires: DateTime.Now.AddMinutes(jwtSettings.ExperiMinutes),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }


    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        
         try
        {
            var userName = User.FindFirst(ClaimTypes.Name)?.Value;
            var connStr = _config.GetConnectionString("ChatDb");
            using var conn = new SqlConnection(connStr);
            await conn.OpenAsync();
            if (string.IsNullOrEmpty(userName))
            {
                return Unauthorized(new { message = "Không xác định được người dùng" });
            }


            var cmd = new SqlCommand("UPDATE RefreshTokens SET IsRevoked = 1 WHERE UserName = @u", conn);
            cmd.Parameters.AddWithValue("@u", userName);
             cmd.ExecuteNonQuery();

        return Ok(new { message = "Đăng xuất thành công" });
        }

        catch (Exception ex)
        {
            return StatusCode(500, new { message = "có lỗi xảy ra khi đăng xuất", error = ex.Message });
        }
    }





    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        try
        {
            var userName = User.Identity.Name;
            var connect = _config.GetConnectionString("ChatDb");
            using var conn = new SqlConnection(connect);
            await conn.OpenAsync();

            var cmd = new SqlCommand("SELECT DisplayName, Avt FROM Users WHERE UserName = @u", conn);
            cmd.Parameters.AddWithValue("@u", userName);

            using var reader = await cmd.ExecuteReaderAsync();
            if (await reader.ReadAsync())
            {
                var displayName = reader["DisplayName"].ToString();
                var avt = reader["Avt"].ToString();

                return Ok(new { displayName, avt });
            }
            else
            {
                return NotFound(new { message = "Không tìm thấy người dùng" });
            }
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Lấy thông tin người dùng thất bại" });
        }
    }


    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] User request)
    {
        try
        {
            var connStr = _config.GetConnectionString("ChatDb");
            using var conn = new SqlConnection(connStr);
            await conn.OpenAsync();

            // Dùng parameter để tránh SQL Injection
            var cmd = new SqlCommand(
                "SELECT Id, UserName, DisplayName, Password FROM Users WHERE UserName = @u",
                conn
            );
            cmd.Parameters.AddWithValue("@u", request.UserName);

            using var reader = await cmd.ExecuteReaderAsync();
            if (reader.Read())
            {
                var userId = Convert.ToInt32(reader["Id"]);
                var username = reader["UserName"].ToString()!;
                var displayName = reader["DisplayName"].ToString()!;
                var passwordHash = reader["Password"].ToString()!;

             
                if (passwordHash != request.Password)
                {
                    return Unauthorized(new { message = "Sai tài khoản hoặc mật khẩu" });
                }

              
                var token = GenerateJwtToken(userId, username);

                return Ok(new
                {
                    message = "Login thành công",
                    userId,
                    username,
                    displayName,
                    token
                });
            }

            return Unauthorized(new { message = "Sai tài khoản hoặc mật khẩu" });
        }
        catch (Exception ex)
        {
            // Log nếu cần: ex.Message
            return StatusCode(500, new { message = "Đã xảy ra lỗi trong quá trình đăng nhập" });
        }
    }


    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] User request)
    {
        var connStr = _config.GetConnectionString("ChatDb");
        using var conn = new SqlConnection(connStr);
        await conn.OpenAsync();

        // Kiểm tra username đã tồn tại chưa
        var checkCmd = new SqlCommand("SELECT COUNT(*) FROM Users WHERE UserName = @u", conn);
        checkCmd.Parameters.AddWithValue("@u", request.UserName);
        var exists = (int)await checkCmd.ExecuteScalarAsync();
        if (exists > 0)
            return Conflict(new { message = "Username đã tồn tại" });

        // Thêm tài khoản mới
        var insertCmd = new SqlCommand("INSERT INTO Users (UserName, DisplayName, Password) VALUES (@u, @d, @p)", conn);
        insertCmd.Parameters.AddWithValue("@u", request.UserName);
        insertCmd.Parameters.AddWithValue("@d", request.DisplayName);
        insertCmd.Parameters.AddWithValue("@p", request.Password); // nên hash trước

        await insertCmd.ExecuteNonQueryAsync();
        return Ok(new { message = "Đăng ký thành công" });
    }




}


