# Monitor Kyber Transaction

The monitor-tx module is tiny task scheduler to monitor status of transaction make by Kyber.Network for node.js based on GNU crontab. 

## Getting Started

Install monitor-tx using npm:

```console
$ npm install --save monitor-tx
```

```javascript
var monitorTx = require('monitor-tx');

monitorTx.init({...params})

monitorTx.addTx({
  hash: "0xe763ffe95d02e231f1d745...8bf604953077fefc1eef369e901e",
  amount: '0.7653',
  symbol: 'KNC'
})

```

### Allowed prams init

|     field               |        value                         |      Detail                                                                      |
|-------------------------|--------------------------------------|----------------------------------------------------------------------------------|
|     nodes               |     Array<string>                    |    Array url of node, match with network                                         |
|     network             |     'ropsten'/'mainnet'/'kovan'      |    Network of transaction base on                                                |
|     expression          |     "* * * * *"                      |    Cron Syntax                                                                   |
|     blockConfirm        |     Number                           |    Number of block confirm                                                       |
|     lostTimeout         |     Number(second)                   |    Time to check transaction is lost                                             |
|     includeReceipt      |     Bolean                           |    Is include receipt to confirmCallback data                                    |
|     sqlPath             |     String                           |    Path to sqlite db                                                             |
|     mineCallback        |     Function                         |    Callback call each time cron fetched tx data, but confirm block is not enough |
|     confirmCallback     |     Function                         |    Callback call when block confirm is enount or tx lost                         |

Default value:
  DEFAULT_EXPRESION = "*/15 * * * * *";  //  every 10s
  DEFAULT_BLOCK_CONFIRM = 5;
  DEFAULT_TIMEDOUT = 15 * 60            //  15 MINS
  DEFAULT_NODE = ['https://ropsten.infura.io']
  DEFAULT_NETWORK = 'ropsten' 
  DEFAULT_GET_RECEIPT = false
  DEFAULT_SQL_PATH = './src/db/txs.db'

#### Cron Syntax

This is a quick reference to cron syntax and also shows the options supported by node-cron.

Allowed fields

```
 # ┌────────────── second (optional)
 # │ ┌──────────── minute
 # │ │ ┌────────── hour
 # │ │ │ ┌──────── day of month
 # │ │ │ │ ┌────── month
 # │ │ │ │ │ ┌──── day of week
 # │ │ │ │ │ │
 # │ │ │ │ │ │
 # * * * * * *
```

Allowed values

|     field    |        value        |
|--------------|---------------------|
|    second    |         0-59        |
|    minute    |         0-59        |
|     hour     |         0-23        |
| day of month |         1-31        |
|     month    |     1-12 (or names) |
|  day of week |     0-7 (or names, 0 or 7 are sunday)  |

```javascript
var cron = require('node-cron');

cron.schedule('*/2 * * * *', function(){
  console.log('running a task every two minutes');
});
```

#### Sample callback data

```javascript
  data:
   { type: 'trade',
     blockNumber: 3918689,
     from: '0x8fA07F46353A2B17E93457592a94a0Fc1CEb783F',
     to: '0x8fa07f46353a2b17e92645567894a0fc1ceb783f',
     amount: '0.7653230595192',
     tokenSymbol: 'KNC',
     tokenName: 'KyberNetwork',
     srcTokenSymbol: 'OMG',
     srcAmount: '0.1',
     srcTokenName: 'OmiseGO',
     inputTokenSymbol: 'OMG',
     inputAmount: '0.1',
     inputTokenName: 'OmiseGO' },
  confirmBlock: '25861',
  status: 'success',
  confirm: { status: 'success', amount: 0.7653, symbol: 'KNC' } }
});
```

when tx pending
```
err: null 
{ pending: true }
```




