- Enigma.js auth against client managed Qlik server with certificates.
- Trying to loop through all apps
- Set propoerties of each sheet to include an object
    - Can we inject a test object?
    - Can we inject an extension object 'cui-banner.zip'? (type 'cui-banner')
    - When we drop an obejct via the sense UI, engine method -> see 'SetFullPropertyTree.json"

Closest ecample I could find in the docs: https://help.qlik.com/en-US/sense-developer/3.1/Subsystems/EngineAPI/Content/WorkingWithAppsAndVisualizations/SetGetProperties/set-properties.htm 


potential methods:
global.getDocList()
global.openDoc()
doc.createSessionObject(sheetListProps)
listSessionObj.getLayout()
doc.getObject(sheetId)
sheet.getLayout()
sheet.setFullPropertyTree(props)