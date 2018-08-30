var monitorTx = require("./src")

monitorTx.init({
  expression: "*/10 * * * * *",       //every 10 s
  mineCallback: (err, txData) => {
    console.log("_____________-callback", err, txData)
  },
  confirmCallback: (err, txData) => {
    console.log("_____________-finishCallback", err, txData)
  },
  txs: [
    { /// transfer
      hash: "0xd910078d3c2630acfdf15c0f72b09d0808639fcc5323ea6fe054e9444f90525d",
    },
    
    // { /// trade
    //   hash: "0xe763ffe95d02e231f1d7450a08488b588447c8bf604953077fefc1eef369e901e",
    //   callback: (err, txData) => {
    //     console.log("_____________-callback", err, txData)
    //   },
    //   finishCallback: (err, txData) => {
    //     console.log("_____________-finishCallback", err, txData)
    //   }
    // }

  ]
})

// setTimeout(() => {
//   monitorTx.addTx({
//     hash: "0xd910078d3c2630acfdf15c0f72b09d0808639fc234c5323ea6fe054e9444f90525d",
//     callback: (err, txData) => {
//       console.log("++++++++++++++++++++++++=callback", err, txData )
//     },
//     finishCallback: (err, txData) => {
//       console.log("++++++++++++++++++++++++=finishCallback", err, txData )
//     }
//   })
// }, 5000)