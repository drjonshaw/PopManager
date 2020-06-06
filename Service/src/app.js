const authController = require('./controllers/AuthenticationController.js')
const config = require('../config.js')
const globals = require('./helpers/globals.js')
const logJsonOutput = require('./helpers/logJsonOutput.js')
const wardsController = require('./controllers/WardsController.js')
const fse = require('fs-extra')


console.log("Starting PopManager")

const Main = async function() {   

   // Get credentials from environment variables
   if(process.env.AppApi_USERNAME && process.env.AppApi_PASSWORD && process.env.AppApi_NETWORKID) {
    if(config.debug) { console.log(`>> Using Environment Variables set on server`)}
    } else { 
        require('dotenv').config()
        if(process.env.AppApi_USERNAME && process.env.AppApi_PASSWORD && process.env.AppApi_NETWORKID) {
            if(config.debug) { console.log(`>> Using Environment Variables from .env file`)}
        } else {
            console.error(`No network credentials found. 
            Set environment variables using 'AppApi_USERNAME' & 'AppApi_PASSWORD' & AppApi_NETWORKID 
            or use .env file for local dev.`)
            return;
        }        
    }
    globals.username = process.env.AppApi_USERNAME
    globals.password = process.env.AppApi_PASSWORD
    globals.networkid = process.env.AppApi_NETWORKID 

    // Authenticate and get token (authenticate as superuser to ensure permissions to get all teams)
    let accessToken = await authController.login()
    if(!accessToken) { 
        console.error(`Programme aborted`)
        return 
    }

    // Object for Ward list
    let reportObject = {
        Network: {
            Name: globals.networkName,
            NetworkID: globals.networkGUID,
            NetworkGUID: globals.networkid
        },
        Wards: [],
        Patients: []
    }


    // Get wards and load into index object
    if(!config.debug) {console.log(`>> getting wards and creating index files`)}
    let wardList = await wardsController.GetNetworkWards(accessToken, globals.networkid)    
    reportObject.Wards.push.apply(reportObject.Wards, wardList.Data.AvailablePopulations[0].Sites)    

    // Get patients and load into index object
    for (const site of reportObject.Wards){
        try{
            //site.Areas.forEach(function(area){
            for ( const area of site.Areas){
                try{
                    console.log(`Site: ${site.SiteName} - Ward: ${area.AreaName}`)
                    let patientList = await wardsController.GetPatientList(accessToken, globals.networkid, site.SiteName, area.AreaName)
                    reportObject.Patients.push.apply(reportObject.Patients, patientList.Data.Patients)
                } catch(error) {
                    console.error(`\n ** Error getting patient list for area ${area.AreaName}. ** \n`) //Error ${error}
                }
            }
        } catch(error) {
            console.error(`\n ** Error getting patient list for ${site.SiteName}.  ** \n`); //Error ${error}
        }
    }
    logJsonOutput.logToFile("reportObject", reportObject)

    const { Parser } = require('json2csv');
    const fields = ['SiteName', 'AreaName', 'Bay', 'Bed', 'PatientIdentifiers.PrimaryIdentifier.Value', 'PatientGivenName', 'PatientFamilyName', 'PatientDateOfBirth', 'Clinician.FullName', 'PatientExternalIdentifier', 'AdmissionDate' ];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(reportObject.Patients);
     
    //console.log(csv);
    //await generateFile.Execute((config.outputFolder + "/" + reportObject.Network.Name + ".csv"), "report")
    const file = config.outputFolder + '/' + reportObject.Network.Name + '.csv'

    fse.outputFile(file, csv, err => {
        console.log(err) // => null
      
        fse.readFile(file, 'utf8', (err, data) => {
          if (err) return console.error(err)
          console.log(`csv file created for ${reportObject.Network.Name}`) 
        })
      })
}

Main();