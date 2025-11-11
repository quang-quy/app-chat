using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using thiendao.Model;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _config;

    public AuthController(IConfiguration config)
    {
        _config = config;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] User request)
    {
        var connStr = _config.GetConnectionString("ChatDb");
        using var conn = new SqlConnection(connStr);
        await conn.OpenAsync();

        var cmd = new SqlCommand("SELECT * FROM Users WHERE UserName = @u AND Password = @p", conn);
        cmd.Parameters.AddWithValue("@u", request.UserName);
        cmd.Parameters.AddWithValue("@p", request.Password); 

        using var reader = await cmd.ExecuteReaderAsync();
        if (reader.Read())
        {
            var displayName = reader["DisplayName"].ToString();
            return Ok(new { message = "Login thành công", displayName });
        }

        return Unauthorized(new { message = "Sai tài khoản hoặc mật khẩu" });
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


