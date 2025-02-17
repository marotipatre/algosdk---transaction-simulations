import algosdk from "algosdk";
import fs from 'fs';

// Function to wait for user input
function keypress() {
    return new Promise((resolve) => {
      process.stdin.once('data', () => {
        resolve();
      });
    });
  }

async function atomic_transaction() {
    
    // Read the account details from JSON
          const accountData = JSON.parse(fs.readFileSync('account_details.json', 'utf8'));
          const { generatedAccount } = accountData;
    
     // Convert the sk object back to Uint8Array
     generatedAccount.sk = Uint8Array.from(Object.values(generatedAccount.sk));
    

    // Connect to the Algorand node
    console.log("Connecting to Algorand Testnet");
    
    const algodToken = '';
    const algodServer = 'https://testnet-api.algonode.cloud';
    const algodPort = 443;
    const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

      // Get suggested transaction parameters
      const suggestedParams = await algodClient.getTransactionParams().do();
    
      // Create an asset creation transaction
    
      console.log("Creating the Transactions");
      const transaction = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: generatedAccount.addr,
        to: "RK6K3SMBBNVUH3CZIQNHB4EEDOQSLZHYBLJPSDSBYIQN75RU5VUVWQXGVA",
        amount: 1000, // 0.001 Algo
        note: new Uint8Array(Buffer.from("Please verify your wallet!")),
        suggestedParams,
      });

      const transaction2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: generatedAccount.addr,
        to: "H2JTTS2XK2RWC7G4QZOKTX3ZOJP765MAI35NGZ4DSNC3TMQLCSUHZWXNUQ",
        amount: 1_000_000, // 0.001 Algo
        note: new Uint8Array(Buffer.from("Please verify your wallet!")),
        suggestedParams,
      });
    
    // Check account balance
    const accountInfo = await algodClient.accountInformation(generatedAccount.addr).do();
    if (accountInfo.amount < 1000000) { // Ensure the account has at least 1 Algo
        console.log("Account balance is insufficient. Please fund the account and try again.");
        process.exit(1);
    }

      const at = new algosdk.AtomicTransactionComposer();

      at.addTransaction({txn: transaction, signer: algosdk.makeBasicAccountTransactionSigner(generatedAccount)});
      at.addTransaction({txn: transaction2, signer: algosdk.makeBasicAccountTransactionSigner(generatedAccount)});
      const result = await at.execute(algodClient, 1000);
      
      // Increase the number of rounds to wait for confirmation
      console.log("Transaction successfully sent");
        
      // Loop over the txIDs and display AlgoExplorer URL for each
      result.txIDs.forEach(txid => {
        const url = `https://lora.algokit.io/testnet/tx/${txid}`;
        console.log(`Transaction URL: ${url}`);
      });


        // End the console
        process.exit();
    }

    atomic_transaction();