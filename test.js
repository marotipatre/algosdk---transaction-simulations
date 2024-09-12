import algosdk from 'algosdk';

const algodToken = '';
const algodServer = 'https://testnet-api.algonode.cloud';
const algodPort = 443;
// const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

// Initialize the Algod client
let client = new algosdk.Algodv2(algodToken, algodServer, algodPort);

// Smart Contract ID
const appId = 718383248;

(async () => {
    try {
        // Get the smart contract information
        let appInfo = await client.getApplicationByID(appId).do();
        
        // Print the global state (key-value pairs)
        console.log("Global State: ", appInfo.params['global-state']);

    } catch (err) {
        console.error("Error fetching smart contract information: ", err);
    }
})();
