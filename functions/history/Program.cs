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
              .SetKey("b95498ca3a997f7bc140af7ee34a74d008ae7d312db10cfae0c3e0aea82b4c72828233cd3809b40605f511a18554b49cfb046f94aee71a55123f87e7e4b2428eda338cf808442f321d82e0af6ebcc8897a5b04dbee88376d6a7ccf624d48afb65ffaf9eadf03bdcc126d0c6a423ee5129587c561a9477cd10c047f0f92755d79")
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