namespace thiendao.DTO
{
    public class JWT
    {
        public string? Key { get; set; }
        public string? Issuer { get; set; }
        public string? Audience { get; set; }
        public int ExperiMinutes { get; set; }
    }
}
