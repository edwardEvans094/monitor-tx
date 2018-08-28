'use strict';

const cron = require('node-cron');
const CONSTANTS = require('./constant')
const ScheduleTask = require('./schedule-task')
const EthereumService = require('./ethereum/ethereum')
var txs = []


const init = (config) => {
  //todo init task schedule with params
  // node: array { url, prune, }
  // default block confirm
  // default lost timeout
  // dafault interval time
  // txs 
  var expression = config.expression || CONSTANTS.DEFAULT_EXPRESION
  if(config.txs){
    txs = config.txs
    txs = txs.map(tx => Object.assign(tx, {
      timeStamp: new Date().getTime()
    }))
  }
  var arrayNodes = config.nodes || CONSTANTS.DEFAULT_NODE
  var network = config.network || CONSTANTS.DEFAULT_NETWORK
  var getReceipt = config.getReceipt || CONSTANTS.DEFAULT_GET_RECEIPT
  var globalBlockConfirm = config.blockConfirm || CONSTANTS.DEFAULT_BLOCK_CONFIRM
  var lostTimeout = config.lostTimeout || CONSTANTS.DEFAULT_TIMEDOUT

  var ethereumService = new EthereumService(arrayNodes)
  var scheduleTask = new ScheduleTask(ethereumService, network, getReceipt, globalBlockConfirm, lostTimeout)

  cron.schedule(expression, () => {
    scheduleTask.exec(txs, (tx) => {
      const indexDel = txs.map(t => t.hash).indexOf(tx.hash)
      if(indexDel < 0) console.log("Cannot index delete tx")
      else {
        txs.splice(indexDel, 1)
      }
    })
  });
}

const addTx = (txConfig, callback, finishCallback) => {
  // add tx to array txs to check status
  // with config
  // hash:
  // block confirm
  
  
  // callback return [tx data, current block confirm] when current < blockConfirm
  // finishCallback return [tx data, block confirm] current > blockConfirm 
  // -> clear tx from array
}

const removeTx = (hash) => {
  //remove tx with hash from array
}

module.exports = {
  init, addTx, removeTx
}