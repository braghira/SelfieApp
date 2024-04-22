require('dotenv').config()

const os = require('os')

function isDisiMachine() {
    const hostname = os.hostname()
    console.log('Hostname:', hostname)
    // Il regex corrisponde a nomi di host che sono stringhe esadecimali di 12 caratteri
    const disiRegex = /^[0-9a-f]{12}$/
    return disiRegex.test(hostname)
}

function getMongoURI() {
    let uri;
    if (isDisiMachine()) {
        console.log('macchina del DISI')
        uri = process.env.disiDB_URI
    } else {
        console.log('macchina personale')
        uri = process.env.privateDB_URI
    }
    return uri;
}

module.exports = { getMongoURI }