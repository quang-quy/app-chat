using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using thiendao.Model;
using Microsoft.Data.SqlClient;


[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public UserController(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [HttpPost("CreateAccount")]
    public IActionResult CreateAccount([FromBody] User user)
    {
        try
        {
            string? connectionString = _configuration.GetConnectionString("ChatDb");
            if (string.IsNullOrEmpty(connectionString))
            {
                return StatusCode(500, new { message = "Lỗi cấu hình chuỗi kết nối" });
            }

            using (SqlConnection conn = new SqlConnection(connectionString))
            {
                conn.Open();

                // Kiểm tra tài khoản đã tồn tại
                string checkQuery = "SELECT COUNT(*) FROM Users WHERE Username = @Username";
                using (SqlCommand checkCmd = new SqlCommand(checkQuery, conn))
                {
                    checkCmd.Parameters.AddWithValue("@Username", user.UserName);
                    int count = (int)checkCmd.ExecuteScalar();

                    if (count > 0)
                    {
                        return BadRequest(new { message = "Tên đăng nhập đã tồn tại" });
                    }
                }

                // Thêm tài khoản mới
                string query = "INSERT INTO Users (Username, Password, Email, Introduce, DisplayName) VALUES (@Username, @Password, @Email, @Introduce, @DisplayName)";
                using (SqlCommand cmd = new SqlCommand(query, conn))
                {
                    cmd.Parameters.AddWithValue("@Username", user.UserName);
                    cmd.Parameters.AddWithValue("@Password", user.Password);
                    cmd.Parameters.AddWithValue("@Email", user.Email);
                    cmd.Parameters.AddWithValue("@Introduce", user.Introduce);
                    cmd.Parameters.AddWithValue("@DisplayName", user.DisplayName);

                    int result = cmd.ExecuteNonQuery();

                    if (result > 0)
                        return Ok(new { message = "Tạo tài khoản thành công" });
                    else
                        return StatusCode(500, new { message = "Lỗi khi tạo tài khoản" });
                }
            }
        }
        catch (SqlException sqlEx)
        {
            return StatusCode(500, new { message = "Lỗi cơ sở dữ liệu", detail = sqlEx.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi không xác định", detail = ex.Message });
        }
    }

}
