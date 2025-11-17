using Azure.Core;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Security.Claims;
using thiendao.Model;

namespace thiendao.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsernewController : ControllerBase
    {
        private readonly IConfiguration _config;
        private readonly IWebHostEnvironment _env;

        public UsernewController(IConfiguration config, IWebHostEnvironment env)
        {
            _config = config;
            _env = env;
        }

        [HttpPost("upload-avatar")]
        public async Task<IActionResult> UploadAvatar(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest(new { message = "Không có file nào được chọn" });

                // Lấy user từ claim (token)
                var userName = User.FindFirst(ClaimTypes.Name)?.Value;
                if (string.IsNullOrEmpty(userName))
                    return Unauthorized(new { message = "Không xác định được người dùng" });

                // Tạo đường dẫn lưu file
                var uploadsFolder = Path.Combine(_env.WebRootPath, "avatars");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Tạo URL để lưu vào DB
                var avatarUrl = $"{Request.Scheme}://{Request.Host}/avatars/{fileName}";

                // Cập nhật DB
                var connStr = _config.GetConnectionString("ChatDb");
                using var conn = new SqlConnection(connStr);
                await conn.OpenAsync();

                var cmd = new SqlCommand("UPDATE Users SET Avt = @url WHERE UserName = @u", conn);
                cmd.Parameters.AddWithValue("@url", avatarUrl);
                cmd.Parameters.AddWithValue("@u", userName);
                await cmd.ExecuteNonQueryAsync();

                return Ok(new { message = "Upload thành công", avatarUrl });
            }
            catch (Exception ex)
            {
                // Trả về lỗi 500 kèm thông tin chi tiết
                return StatusCode(500, new { message = "Có lỗi xảy ra khi upload avatar", error = ex.Message });
            }
        }


    }
}
