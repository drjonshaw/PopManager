const fse = require('fs-extra') // https://github.com/jprichardson/node-fs-extra
const config = require('../../config.js')

// generateFile
module.exports = {
    async Execute(filepath, data, info) {
        try {
            let res = await fse.outputFile(filepath, data)
            if(res && config.debug) {
                console.log(`>> Created new ${info} file: ${res}`)                       
            }    
            return res
        } catch (err) {
            console.error(err) 
        }
    }
}
