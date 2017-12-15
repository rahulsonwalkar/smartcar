const rp = require('request-promise')
const async = require('async')

function httpStream(req, res, callback){

  callback(null, {req: req, res: res})

}


function requestObject(results, callback){

  callback(null, {
    method: 'POST',
    uri: 'http://gmapi.azurewebsites.net/getSecurityStatusService',
    body: {"id": results.httpStream.req.params.id, "responseType": "JSON"},
    json: true
  })

}

async function getHTTPdata(results, callback){

  await rp(results.requestObject).then(function(response){
    if(response.status == 200)
      callback(null, response.data)
    else{
      results.httpStream.res.status(404)
      results.httpStream.res.send("404, invalid ID")
    }
  })

}

function generateResponse(results, callback){

  callback(null, results.getHTTPdata.doors.values.map( x => {
    return {
      "location" : x.location.value,
      "locked" : x.locked.value
    }
  }))

}

function sendResponse(results, callback){

  results.httpStream.res.status(200)
  results.httpStream.res.send(results.generateResponse)
  callback(null)

}

function process (req, res) {

  async.auto({
    httpStream: function(callback) { httpStream(req, res, callback) },
    requestObject: ['httpStream', function(results, callback) { requestObject(results, callback) }],
    getHTTPdata: ['requestObject', function(results,callback) { getHTTPdata(results, callback) }],
    generateResponse: ['getHTTPdata', function(results, callback) { generateResponse(results, callback) }],
    sendResponse: ['generateResponse', function(results, callback) { sendResponse(results, callback) }]
  }, function(err, results){
    if(err)
      console.log(err)
  })

}

module.exports = process
