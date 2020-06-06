const axios = require('axios')
const qs = require('querystring')
const config = require('../../config.js')
const logJsonOutput = require('../helpers/logJsonOutput.js')
const globals = require('../helpers/globals.js')


module.exports = {
    async GetPatientList (token, networkID, site, area) {
        try {
            let data = null

            const url = `${globals.urlscheme}${config.environment}${globals.appHost}/Patients/SearchForPatientsByPopulation?networkId=${networkID}&clinician=&site=${site}&area=${area}&skip=0&take=50`
            const headerContent = {
                  'Authorization': 'Bearer ' + token,
                  'Accept': 'application/json;version=10',
                  'Content-Type': 'application/json;charset=UTF-8',
                  'Cache-Control': 'no-cache',
                  'API-Key': 'FF99FF99-FF99-FF99-FF99-FF99FF99FF99'
                }
            let response = await axios.get(url, {headers: headerContent})

            if (!(/^2/.test('' + response.status))) { // Status Codes other than 2xx 
                console.error("GetWardList API call error: Status code: " + response.status);
            }
            else {
                if(config.debug) {
                    if(config.debug){
                        //console.log(">> GetTeams API call success: Status code: " + response.status);
                        //logJsonOutput.logToFile("PatientList", response.data)
                    }
                }
                return response.data;
            }
                 
        } catch (err) {
            console.log(err)
        }
    },

    // Get list of sites and areas (wards) for networks
    async GetNetworkWards (token, networkID) {
        try {
            let data = null

            const url = `${globals.urlscheme}${config.environment}${globals.appHost}/Populations/GetAllPopulationsForUser?includePatientSearchPopulations=true&networkIdToFilterBy=${networkID}`
            const headerContent = {
                  'Authorization': 'Bearer ' + token,
                  'Accept': 'application/json;version=15',
                  'Content-Type': 'application/json;charset=UTF-8',
                  'Cache-Control': 'no-cache',
                  'API-Key': 'FF99FF99-FF99-FF99-FF99-FF99FF99FF99'
                }
            let response = await axios.get(url, {headers: headerContent})

            if (!(/^2/.test('' + response.status))) { // Status Codes other than 2xx 
                console.error("GetWards error: Status code: " + response.status);
            }
            else {
                if(config.debug) {
                    if(config.debug){
                        console.log(">> Get Wards success: Status code: " + response.status);
                        logJsonOutput.logToFile("NetworkWards", response.data)
                    }
                }
                return response.data;
            }
                 
        } catch (err) {
            console.log(err)
        }
    }
}