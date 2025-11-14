using Microsoft.AspNetCore.SignalR;

public class ChatHub : Hub
{
    public async Task SendMessage(string user, string message)
    {
        await Clients.All.SendAsync("ReceiveMessage", user, message);
    }

    private static readonly Dictionary<string, string> OnlineUsers = new();

    public override Task OnConnectedAsync()
    {
        var userId = Context.UserIdentifier ?? Context.ConnectionId;
        OnlineUsers[userId] = "Online";
        Clients.All.SendAsync("UserStatusChanged", userId, "Online");
        return base.OnConnectedAsync();
    }

    public override Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.UserIdentifier ?? Context.ConnectionId;
        OnlineUsers[userId] = "Offline";
        Clients.All.SendAsync("UserStatusChanged", userId, "Offline");
        return base.OnDisconnectedAsync(exception);
    }

    public Task GetOnlineUsers()
    {
        return Clients.Caller.SendAsync("OnlineUsersList", OnlineUsers);
    }
}
