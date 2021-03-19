using Appwrite;
using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace history
{
    class Program
    {
        static async Task Main(string[] args)
        {
            var client = new Client();
            client
              .SetEndPoint("https://appwrite-realtime.monitor-api.com/v1")
              .SetProject("6053363c00af7")
              .SetKey(Environment.GetEnvironmentVariable("KEY"))
            ;

            var timestamp = DateTimeOffset.Now;

            var database = new Database(client);

            var result = await database.ListDocuments("60533a4bec463");
            var content = await result.Content.ReadAsStringAsync();
            var frameworks = JsonSerializer.Deserialize<ListFrameworks>(content);

            var resultHistory = await database.ListDocuments("60533681b159f");
            var contentHistory = await resultHistory.Content.ReadAsStringAsync();
            var history = JsonSerializer.Deserialize<ListHistory>(contentHistory);

            foreach (var entry in history.Documents)
            {
                var found = Array.Find(frameworks.Documents, f => f.Name == entry.Framework);
                if (found != null)
                {
                    Console.WriteLine(found.Votes.ToString());
                    entry.Data.Add(found.Votes.ToString());

                    while (entry.Data.Count > 10)
                    {
                        entry.Data.RemoveAt(0);
                    }

                    await database.UpdateDocument("60533681b159f", entry.ID, entry, new List<object>(0) { "*" }, new List<object>());
                }
            }
        }
    }
}

public class Framework
{
    [JsonPropertyNameAttribute("name")]
    public string Name { get; set; }

    [JsonPropertyNameAttribute("votes")]
    public int Votes { get; set; }
}

public class ListFrameworks
{
    [JsonPropertyNameAttribute("documents")]
    public Framework[] Documents { get; set; }
}

public class History
{
    [JsonPropertyNameAttribute("$id")]
    public string ID { get; set; }

    [JsonPropertyNameAttribute("framework")]
    public string Framework { get; set; }

    [JsonPropertyNameAttribute("data")]
    public List<string> Data { get; set; }
}

public class ListHistory
{
    [JsonPropertyNameAttribute("documents")]
    public History[] Documents { get; set; }
}