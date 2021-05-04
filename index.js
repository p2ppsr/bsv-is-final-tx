const axios = require('axios')
const bsv = require('bsv')

const MAXINT = 0xffffffff
const BLOCK_LIMIT = 500000000

module.exports = async tx => {
  if (!(tx instanceof bsv.Transaction)) {
    throw new TypeError('The first parameter must be an instance of bsv.Transaction.')
  }
  if (tx.inputs.every(i => i.sequenceNumber === MAXINT)) {
    return true
  }
  const lockTime = tx.nLockTime
  if (lockTime < BLOCK_LIMIT) {
    const { data } = await axios.get(
      'https://api.whatsonchain.com/v1/bsv/main/chain/info'
    )
    return lockTime < data.blocks
  } else {
    return lockTime < parseInt(Date.now() / 1000)
  }
}
