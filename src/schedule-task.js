
const CONSTANTS = require('./constant')
const converter = require("./converter")
const loadEnv = require("./env")
const async = require("async")
////tx = {}
// hash:
// block confirm
// lost time out
// timeStamp


module.exports = class ScheduleTask {
  constructor(
    ethService, 
    network, 
    getReceipt, 
    globalBlockConfirm, 
    lostTimeout
  ) {
    this.EthereumService = ethService
    this.network = network
    this.BlockchainInfo = loadEnv(this.network)
    this.MappedTokens = converter.mapAddress(this.BlockchainInfo.tokens)
    this.getReceipt = getReceipt
    this.globalBlockConfirm = globalBlockConfirm
    this.lostTimeout = lostTimeout
  }

  processTrade(txData, callback){
    this.EthereumService.callMultiNode('exactTradeData', txData.input)
    .then(tradeData => {
      const tokenSymbol = this.MappedTokens[tradeData.src.toLowerCase()]

      const amount = converter.toToken(tradeData.srcAmount, this.BlockchainInfo.tokens[tokenSymbol].decimals)
      return callback(null, {
        blockNumber: txData.blockNumber,
        from: txData.from,
        to: tradeData.destAddress,
        amount: amount,
        tokenSymbol: tokenSymbol,
        tokenName: this.BlockchainInfo.tokens[tokenSymbol].name
        // rate ?
      })
    })
    .catch(callback)
  }

  processTransfer(txData, callback){
    if (converter.isZero(txData.value)) {
      // transfer token
      this.EthereumService.callMultiNode('exactTransferData', txData.input)
      .then(transferData => {
        const tokenSymbol = this.MappedTokens[txData.to.toLowerCase()]
        if(!tokenSymbol) return callback("token not support by Kyber!")

        const amount = converter.toToken(transferData._value, this.BlockchainInfo.tokens[tokenSymbol].decimals)

        return callback(null, {
          blockNumber: txData.blockNumber,
          from: txData.from,
          to: transferData._to,
          amount: amount,
          tokenSymbol: tokenSymbol,
          tokenName: this.BlockchainInfo.tokens[tokenSymbol].name
          // rate ?
        })
      })
      .catch(callback)

    } else {
      // transfer ether
      return callback(null, {
        blockNumber: txData.blockNumber,
        from: txData.from,
        to: txData.to,
        amount: converter.toToken(txData.value, this.BlockchainInfo.tokens["ETH"].decimals),
        tokenSymbol: "ETH",
        tokenName: this.BlockchainInfo.tokens["ETH"].name
        // rate ?
      })
    }
  }

  getTransactionReceipt(hash, callback){
    this.EthereumService.callMultiNode('getTransactionReceipt', hash)
    .then(result => {
      return callback(null, result)
    })
    .catch(callback)
  }

  getCurrentBlock(callback){
    this.EthereumService.callMultiNode('getCurrentBlock')
    .then(blockNo => {
      return callback(null, blockNo)
    })
    .catch(callback)
  }

  getConfirmData(hash, callback){
    this.EthereumService.callMultiNode('getTx', hash)
    .then(txData => {
      if (txData.to.toLowerCase() == this.BlockchainInfo.network.toLowerCase()) {
        return this.processTrade(txData, callback)
      } else {
        return this.processTransfer(txData, callback)
      }

    })
    .catch(callback)
  }

  processTx(tx, callback, finishCallback) {

    // this.getTransactionReceipt(tx.hash)

    // this.getConfirmData(tx.hash)

    async.parallel({
      receipt: asyncCallback => this.getTransactionReceipt(tx.hash, asyncCallback),
      currentBlock: asyncCallback => this.getCurrentBlock(asyncCallback),
      confirm: asyncCallback => this.getConfirmData(tx.hash, asyncCallback)
  }, (err, results) => {
    if(err) {
      /// handle tx pending or lost

      const now = new Date().getTime()
      if(now - tx.timeStamp > this.lostTimeout) return finishCallback(null, { status: 'lost'})
      else return callback(null, {pending: true})
    }

    const blockRange = converter.minusBig(results.currentBlock, results.confirm.blockNumber)
    const confirmBlock = tx.confirmBlock || this.globalBlockConfirm
    const txStatus = results.receipt.status ? 'success' : 'fail'
    if(blockRange > confirmBlock){
      //todo push finish callback
      // clear tx from array
      return finishCallback(null, {
        data: results.confirm,
        confirmBlock: blockRange,
        status: txStatus,
        ...(this.getReceipt && {receipt: results.receipt})
      })
    } else {
      return callback(null, {
        hash: tx.hash,
        data: results.confirm,
        confirmBlock: blockRange,
        status: txStatus,
      })
    }
  });
}



  exec(txs, clearCallback) {
    try {
      txs.map(tx => {
        this.processTx(tx, tx['callback'], (finalErr, finalResult) => {
          tx['finishCallback'](finalErr, finalResult);
          return clearCallback(tx)
        })
      })
    } catch (error) {
      console.log("!!!!!!!!Error: ", error)
    }
    
  }




}