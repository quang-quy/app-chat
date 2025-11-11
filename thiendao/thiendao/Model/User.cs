using System.ComponentModel.DataAnnotations.Schema;

namespace thiendao.Model
{
    [Table("Users2")]
    public class User
    {
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string DisplayName { get; set; }
    }
}
