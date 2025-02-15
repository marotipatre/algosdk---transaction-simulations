import algosdk from "algosdk";
import fs from 'fs';



async function transaction() {

// Read the account details from JSON
      const accountData = JSON.parse(fs.readFileSync('account_details.json', 'utf8'));
      const { address, privateKey } = accountData;

 // Convert the private key from base64 string back to Uint8Array
  const privateKeyUint8 = new Uint8Array(Buffer.from(privateKey, 'base64'));

  // Connect to the Algorand node
  console.log("Connecting to Algorand Testnet");

const algodToken = '';
const algodServer = 'https://testnet-api.algonode.cloud';
const algodPort = 443;
const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

 // Get suggested transaction parameters
 const suggestedParams = await algodClient.getTransactionParams().do();

 // Create an transaction

 console.log("Creating the Transaction");
    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: address,
    suggestedParams,
    to: 'RK6K3SMBBNVUH3CZIQNHB4EEDOQSLZHYBLJPSDSBYIQN75RU5VUVWQXGVA',
    amount: 1_000_000,
    note: new Uint8Array(Buffer.from('Hello World')),
    });


    // Sign the transaction
    const signedTxn = algosdk.signTransaction(txn, privateKeyUint8);

    // Submit the transaction to the network
    await algodClient.sendRawTransaction(signedTxn.blob).do();

    // Wait for confirmation
    
    const result = await algosdk.waitForConfirmation(algodClient, txn.txID().toString(), 3);

    console.log("Transaction deployed");
    console.log(`Transaction ID: ${txn.txID()}`);

    // Display AlgoExplorer URL
    const url = `https://lora.algokit.io/testnet/transaction/${txn.txID()}`;
    console.log(`Transaction URL: ${url}`);


    // End the console
    process.exit();



}

transaction();