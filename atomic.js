import algosdk from "algosdk";
import { AtomicTransactionComposer } from "algosdk";
import { getAccounts } from "../sandbox";

(async function () {
  try {
    const token = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    const server = "http://localhost";
    const port = 4001;

    const client = new algosdk.Algodv2(token, server, port);

    const accts = await getAccounts();

    const myAccountA = accts[0];
    console.log("My account A address: %s", myAccountA.addr);

    const myAccountB = accts[1];
    console.log("My account B address: %s", myAccountB.addr);

    let accountInfo = await client.accountInformation(myAccountA.addr).do();
    console.log("Account A balance: %d microAlgos", accountInfo.amount);

    accountInfo = await client.accountInformation(myAccountB.addr).do();
    console.log("Account B balance: %d microAlgos", accountInfo.amount);

    const signerA = algosdk.makeBasicAccountTransactionSigner({ addr: myAccountA.addr, sk: myAccountA.privateKey });
    const signerB = algosdk.makeBasicAccountTransactionSigner({ addr: myAccountB.addr, sk: myAccountB.privateKey });

    const atc = new AtomicTransactionComposer();

    const sp = await client.getTransactionParams().do();

    const txn1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: myAccountB.addr,
      to: myAccountA.addr,
      amount: 100000,
      suggestedParams: sp,
    });
    atc.addTransaction({ txn: txn1, signer: signerB });

    const txn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: myAccountA.addr,
      to: myAccountB.addr,
      amount: 200000,
      suggestedParams: sp,
    });
    atc.addTransaction({ txn: txn2, signer: signerA });

    const results = await atc.execute(client, 2);

    console.log("Confirmed in round: ", results.confirmedRound);

    console.log("Transaction 1 " + results.txIDs[0] + " confirmed in round " + results.confirmedRound);
    console.log("Transaction 2 " + results.txIDs[1] + " confirmed in round " + results.confirmedRound);
    console.log("Group ID = " + Buffer.from(txn2.group).toString('base64'));

    accountInfo = await client.accountInformation(myAccountA.addr).do();
    console.log("Account A balance: %d microAlgos", accountInfo.amount);
    accountInfo = await client.accountInformation(myAccountB.addr).do();
    console.log("Account B balance: %d microAlgos", accountInfo.amount);

  } catch (error) {
    console.error("err", error);
    return;
  }
})();
