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
        string connectionString = _configuration.GetConnectionString("SCMChat");

        using (SqlConnection conn = new SqlConnection(connectionString))
        {
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

            string query = "INSERT INTO Users (Username, Password, Email, Introduce) VALUES (@Username, @Password, @Email, @Introduce)";
            SqlCommand cmd = new SqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@Username", user.UserName);
            cmd.Parameters.AddWithValue("@Password", user.Password);
            cmd.Parameters.AddWithValue("@Email", user.Email);
            cmd.Parameters.AddWithValue("@Introduce", user.Introduce);

            conn.Open();
            int result = cmd.ExecuteNonQuery();
            conn.Close();

            if (result > 0)
                return Ok(new { message = "Tạo tài khoản thành công" });
            else
                return StatusCode(500, new { message = "Lỗi khi tạo tài khoản" });
        }
    }
}
