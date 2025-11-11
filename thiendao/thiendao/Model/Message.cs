namespace thiendao.Model
{
    public class Message
    {
        public int MessageId { get; set; }
        public int SenderId { get; set; }
        public string NoiDung { get; set; }
        public DateTime SentAt { get; set; } 
    }
}
