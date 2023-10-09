const enigma = require('enigma.js');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

const schema = require('enigma.js/schemas/12.20.0.json');

// Your Sense Enterprise installation hostname:
const engineHost = 'qmi-qs-0313';

// Make sure the port below is accessible from the machine where this example
// is executed. If you changed the QIX Engine port in your installation, change this:
const enginePort = 4747;

// 'engineData' is a special "app id" that indicates you only want to use the global
// QIX interface or session apps, change this to an existing app guid if you intend
// to open that app:
const appId = 'engineData';

// The Sense Enterprise-configured user directory for the user you want to identify
// as:
const userDirectory = 'QMI-QS-0313';

// The user to use when creating the session:
const userId = 'qlik';

// Path to a local folder containing the Sense Enterprise exported certificates:
const certificatesPath = './.certs/';

const sheetListProps = {
  "qInfo": {
    "qType": "SheetList",
    "qId": ""
  },
  "qAppObjectListDef": {
    "qData": {
      "title": "/qMetaDef/title",
      "labelExpression": "/labelExpression",
      "showCondition": "/showCondition",
      "description": "/qMetaDef/description",
      "descriptionExpression": "/qMetaDef/descriptionExpression",
      "thumbnail": "/qMetaDef/thumbnail",
      "cells": "/cells",
      "rank": "/rank",
      "columns": "/columns",
      "rows": "/rows"
    },
    "qType": "sheet"
  }
};

// Helper function to read the contents of the certificate files:
const readCert = (filename) => fs.readFileSync(path.resolve(__dirname, certificatesPath, filename));

const session = enigma.create({
  schema,
  url: `wss://${engineHost}:${enginePort}/app/${appId}`,
  // Notice the non-standard second parameter here, this is how you pass in
  // additional configuration to the 'ws' npm library, if you use a different
  // library you may configure this differently:
  createSocket: (url) => new WebSocket(url, {
    ca: [readCert('root.pem')],
    key: readCert('client_key.pem'),
    cert: readCert('client.pem'),
    headers: {
      'X-Qlik-User': `UserDirectory=${encodeURIComponent(userDirectory)}; UserId=${encodeURIComponent(userId)}`,
    },
  }),
});

session.open().then((global) => {
  console.log('Session was opened successfully');
  return global.getDocList().then((list) => {
    const apps = list.map((app) => `${app.qDocId} (${app.qTitle || 'No title'})`).join(', ');
    console.log(`Apps on this Engine that the configured user can open: ${apps}`);
    // loop through apps > open each app > loop through sheets > setProperties of each sheet to include new object
    list.map(async (app) => {
      console.log(app.qDocId);
      const doc = await global.openDoc({
        "qDocName": app.qDocId
      });
      // const sheetList = await doc.createSessionObject(sheetListProps).then(list => list.getLayout());
      // console.log(sheetList);

      // sheetList.qAppObjectList.qItems.forEach(async (item) => {
      //   const sheetId = item.qInfo.qId;
      //   const sheet = await doc.getObject(sheetId);
      //   const sheetLayout = await sheet.getLayout();
      //   console.log(sheetLayout.qLayout);
      // })
    });
    session.close();
  });
}).catch((error) => {
  console.log('Failed to open session and/or retrieve the app list:', error);
  process.exit(1);
});