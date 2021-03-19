module.exports = async (req, res) => {
    const { framework } = req.query;
    const sdk = require('node-appwrite');

    // Init SDK 
    let client = new sdk.Client();

    let database = new sdk.Database(client);

    client.setEndpoint('https://appwrite-realtime.monitor-api.com/v1') // Your API Endpoint 
        .setProject('6053363c00af7') // Your project ID 
        .setKey(process.env.API_KEY); // Your secret API key

    try {
        let promise = await database.listDocuments('60533a4bec463');
        let target = promise.documents.find(doc => doc.name === framework);
        if (target) {
            let update = await database.updateDocument('60533a4bec463', target.$id, {
                votes: target.votes + 1
            }, ['*'], []);
            res.status(200).json(update)
        } else {
            res.status(400).send()
        }
    } catch (error) {
        res.status(200).send(error)
    }

}