# bsv-is-final-tx

Checks if a BSV transaction is final

## Installation

```
npm i bsv-is-final-tx
```

## Usage

```js
const isFinal = require('bsv-is-final-tx')
const bsv = require('bsv') // bsv@^1.5.5, not bsv@2

(async () => {
  const tx = new bsv.Transaction('TX_HEX_HERE')
  console.log(await isFinal(tx))
})()
```

## License

The license for the code in this repository is the Open BSV License.
