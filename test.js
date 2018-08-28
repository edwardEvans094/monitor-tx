var monitorTx = require("./src")

monitorTx.init({
  expression: "*/10 * * * * *",       //every 10 s
  txs: [
    // { /// transfer
    //   hash: "0xd910078d3c2630acfdf15c0f72b09d0808639fcc5323ea6fe054e9444f90525d",
    //   callback: (err, txData) => {
    //   },
    //   finishCallback: (err, txData) => {
    //   }
    // },
    { /// trade
      hash: "0xe763ffe95d02e231f1d7450a0848b588447c8bf604953077fefc1eef32342343",
      callback: (err, txData) => {
        console.log("_____________-callback", err, txData)
      },
      finishCallback: (err, txData) => {
        console.log("______________finishCallback", err, txData)
      }
    }

  ]
})