using Microsoft.AspNetCore.SignalR;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Collections.Concurrent;
using System.Security.Claims;

public class ChatHub : Hub
{
    private readonly IConfiguration _configuration;

    // userId -> danh sách connectionId
    private static readonly ConcurrentDictionary<string, HashSet<string>> UserConnections = new();

    // userId -> DisplayName
    private static readonly ConcurrentDictionary<string, string> UserNames = new();

    public ChatHub(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    // IUserIdProvider để SignalR nhận đúng userId từ JWT
    public class UserIdProvider : IUserIdProvider
    {
        public string GetUserId(HubConnectionContext connection)
        {
            try
            {
                var userId = connection.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (!string.IsNullOrEmpty(userId))
                    return userId;

                return connection.ConnectionId;
            }
            catch
            {
                return connection.ConnectionId;
            }
        }
    }

    private async Task BroadcastAllUsersStatus()
    {
        var onlineIds = UserConnections.Keys.ToHashSet();
        var users = new List<object>();

        string connectionString = _configuration.GetConnectionString("ChatDb");
        using (var conn = new SqlConnection(connectionString))
        {
            await conn.OpenAsync();
            var cmd = new SqlCommand("SELECT Id, DisplayName FROM Users", conn);
            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var id = reader["Id"].ToString();
                users.Add(new
                {
                    userId = id,
                    displayName = reader["DisplayName"].ToString(),
                    status = onlineIds.Contains(id) ? "Online" : "Offline"
                });
            }
        }

        await Clients.All.SendAsync("AllUsersWithStatus", users);
    }


    public override async Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier ?? Context.ConnectionId;
        string displayName = "Unknown";

        try
        {
            string connStr = _configuration.GetConnectionString("ChatDb");
            using var conn = new SqlConnection(connStr);
            await conn.OpenAsync();

            var cmd = new SqlCommand("SELECT DisplayName FROM Users WHERE Id = @id", conn);
            cmd.Parameters.AddWithValue("@id", userId); // giả sử Id là string
            var result = await cmd.ExecuteScalarAsync();
            if (result != null)
                displayName = result.ToString();
        }
        catch
        {
            displayName = "Unknown";
        }

        UserNames[userId] = displayName;

        var connections = UserConnections.GetOrAdd(userId, _ => new HashSet<string>());
        lock (connections)
            connections.Add(Context.ConnectionId);

        if (connections.Count == 1)
            await Clients.All.SendAsync("UserStatusChanged", userId, displayName, "Online");
        await BroadcastAllUsersStatus();

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.UserIdentifier ?? Context.ConnectionId;

        if (UserConnections.TryGetValue(userId, out var connections))
        {
            lock (connections)
                connections.Remove(Context.ConnectionId);

            if (connections.Count == 0)
            {
                UserConnections.TryRemove(userId, out _);
                UserNames.TryRemove(userId, out var displayName);
                await Clients.All.SendAsync("UserStatusChanged", userId, displayName ?? "Unknown", "Offline");
            }
            await BroadcastAllUsersStatus();
        }

        await base.OnDisconnectedAsync(exception);
    }

    public Task SendMessageGroup(string user, string message)
    {
        return Clients.All.SendAsync("ReceiveMessage", user, message);
    }

    public async Task SendMessage(string userId, string message)
    {
        try
        {
            var fromUserId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var fromUserName = Context.User?.Identity?.Name;

            string connStr = _configuration.GetConnectionString("ChatDb");
            using var conn = new SqlConnection(connStr);
            await conn.OpenAsync();

            string sql = @"INSERT INTO Messages (FromUserId, ToUserId, NoiDung, Timestamp)
                       VALUES (@from, @to, @NoiDung, @time)";

            using var cmd = new SqlCommand(sql, conn);
            cmd.Parameters.AddWithValue("@from", fromUserId);
            cmd.Parameters.AddWithValue("@to", userId);
            cmd.Parameters.AddWithValue("@NoiDung", message);
            cmd.Parameters.AddWithValue("@time", DateTime.UtcNow);

            await cmd.ExecuteNonQueryAsync();

            await Clients.User(userId).SendAsync("ReceiveMessage", fromUserId, fromUserName, message);
        }
        catch (Exception ex)
        {
          
            Console.Error.WriteLine($"Lỗi khi gửi tin nhắn: {ex.Message}");
       
            throw;
        }
    }


    public Task GetOnlineUsers()
    {
        try
        {
            var onlineUsers = UserConnections.Keys
                .Select(id => new
                {
                    userId = id,
                    displayName = UserNames.GetValueOrDefault(id) ?? "Unknown"
                })
                .ToList();

            return Clients.Caller.SendAsync("OnlineUsersList", onlineUsers);
        }
        catch
        {
            return Clients.Caller.SendAsync("OnlineUsersList", new List<object>());
        }
    }

    public async Task GetAllUsersWithStatus()
    {
        try
        {
            var onlineIds = UserConnections.Keys.ToHashSet();
            var users = new List<object>();

            string connectionString = _configuration.GetConnectionString("ChatDb");
            using (var conn = new SqlConnection(connectionString))
            {
                await conn.OpenAsync();
                var cmd = new SqlCommand("SELECT Id, DisplayName FROM Users", conn);

                using (var reader = await cmd.ExecuteReaderAsync())
                {
                    while (await reader.ReadAsync())
                    {
                        var id = reader["Id"].ToString();
                        var displayName = reader["DisplayName"].ToString();
                        users.Add(new
                        {
                            userId = id,
                            displayName = reader["DisplayName"].ToString(),
                            status = onlineIds.Contains(id) ? "Online" : "Offline"
                        });
                    }
                }
            }

            await Clients.Caller.SendAsync("AllUsersWithStatus", users);
        }
        catch
        {
            await Clients.Caller.SendAsync("AllUsersWithStatus", new List<object>());
        }
    }
}
