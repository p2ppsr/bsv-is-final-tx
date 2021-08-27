const axios = require('axios')
const bsv = require('bsv')

const MAXINT = 0xffffffff
const BLOCK_LIMIT = 500000000

/**
 * Checks that a transaction is final
 * @param {String} tx A serialized transaction hex string
 * @returns {Promise<Boolean>} whether the transaction is final
 */
module.exports = async tx => {
  if (!(tx instanceof bsv.Transaction)) {
    tx = new bsv.Transaction(tx)
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
