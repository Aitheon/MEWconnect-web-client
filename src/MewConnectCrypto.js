import createLogger from 'logging'

import eccrypto from 'eccrypto/browser'
import ethUtils from 'ethereumjs-util'
import crypto from 'crypto'
import secp256k1 from 'secp256k1'
import Buffer from 'buffer'

const buffer = Buffer.buffer

const logger = createLogger('MewCrypto')
/**
 *
 */
class MewConnectCrypto {
  constructor(options = {}) {
    this.crypto = options.crypto || crypto
    this.secp256k1 = options.secp256k1 || secp256k1
    this.ethUtil = options.ethUtils || ethUtils
    this.Buffer = options.buffer || buffer
    this.eccrypto = options.eccrypto || eccrypto
  }

  static create() {
    return new MewConnectCrypto({
      crypto,
      secp256k1,
      ethUtils,
      buffer,
      eccrypto
    })
  }

  /**
   *
   * @param pvtKey
   */
  setPrivate(pvtKey) {
    this.prvt = Buffer.from(pvtKey, 'hex')
  }

  /**
   *
   * @returns {*}
   */
  generateMessage() {
    return this.crypto.randomBytes(32).toString('hex')
  }

  /**
   *
   * @returns {{pub, pvt}}
   */
  // Not the Address, but generate them for the connection check
  prepareKey() {
    this.prvt = this.generatePrivate() // Uint8Array
    this.pub = this.generatePublic(this.prvt) // Uint8Array
    return this.addKey(this.pub, this.prvt)
  }

  /**
   *
   * @returns {*}
   */
  generatePrivate() {
    let privKey
    do {
      privKey = this.crypto.randomBytes(32)
    } while (!this.secp256k1.privateKeyVerify(privKey))
    return privKey
  }

  /**
   *
   * @param privKey
   * @returns {*}
   */
  generatePublic(privKey) {
    const pvt = new this.Buffer(privKey, 'hex')
    this.prvt = pvt
    return this.secp256k1.publicKeyCreate(pvt)
  }

  /**
   *
   * @param dataToSend
   * @returns {Promise<string>}
   */
  encrypt(dataToSend) {
    const publicKeyA = eccrypto.getPublic(this.prvt)
    return new Promise((resolve, reject) => {
      this.eccrypto
        .encrypt(publicKeyA, this.Buffer.from(dataToSend))
        .then(_initial => {
          resolve(_initial)
        })
        .catch(error => {
          reject(error)
        })
    })
  }

  /**
   *
   * @param dataToSee
   * @returns {Promise<string>}
   */
  decrypt(dataToSee) {
    return new Promise((resolve, reject) => {
      this.eccrypto
        .decrypt(this.prvt, {
          ciphertext: Buffer.from(dataToSee.ciphertext),
          ephemPublicKey: Buffer.from(dataToSee.ephemPublicKey),
          iv: Buffer.from(dataToSee.iv),
          mac: Buffer.from(dataToSee.mac)
        })
        .then(_initial => {
          let result
          try {
            if (this.isJSON(_initial)) {
              const humanRadable = JSON.parse(_initial)
              if (Array.isArray(humanRadable)) {
                result = humanRadable[0]
              } else {
                result = humanRadable
              }
            } else {
              result = _initial.toString()
            }
          } catch (e) {
            logger.error(e)
          }
          resolve(JSON.stringify(result))
        })
        .catch(error => {
          reject(error)
        })
    })
  }

  /**
   *
   * @param msgToSign
   * @returns {Promise<string>}
   */
  signMessage(msgToSign) {
    return new Promise((resolve, reject) => {
      try {
        const msg = this.ethUtil.hashPersonalMessage(
          this.ethUtil.toBuffer(msgToSign)
        )
        const signed = this.ethUtil.ecsign(
          this.Buffer.from(msg),
          new this.Buffer(this.prvt, 'hex')
        )
        // eslint-disable-next-line max-len
        const combined = this.Buffer.concat([
          this.Buffer.from([signed.v]),
          this.Buffer.from(signed.r),
          this.Buffer.from(signed.s)
        ])
        const combinedHex = combined.toString('hex')
        resolve(combinedHex)
      } catch (e) {
        reject(e)
      }
    })
  }

  /**
   *
   * @param pub
   * @param pvt
   * @returns {{pub: *, pvt: *}}
   */
  addKey(pub, pvt) {
    return { pub, pvt }
  }

  /**
   *
   * @param buf
   * @returns {string}
   */
  bufferToConnId(buf) {
    return buf.toString('hex').slice(32)
  }

  isJSON(arg) {
    try {
      JSON.parse(arg)
      return true
    } catch (e) {
      return false
    }
  }
}

export default MewConnectCrypto
