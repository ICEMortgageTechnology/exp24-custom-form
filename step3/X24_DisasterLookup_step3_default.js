async function setupTable() {
  let table = await elli.script.getObject('DataResultsCtrl');
  
  let settings = {
      "height": "600px",
      "enableSorting": true,
      "storeIdProperty": "5",
      "columns": [
        {
          "field": "declarationType",
          "label": "Declaration Type",
          "sortable": true,
        },
        {
          "field": "incidentType",
          "label": "Incident Type",
          "sortable": true,
        },
        {
          "field": "declarationTitle",
          "label": "Delcaration Title",
          "sortable": true,
        },
        {
          "field": "ihProgramDeclared",
          "label": "IH Program Declared",
          "type" : "boolean",
          "sortable": true,
        },
        {
          "field": "iaProgramDeclared",
          "label": "IA Program Declared",
          "type" : "boolean",
          "sortable": true,
        },
        {
          "field": "paProgramDeclared",
          "label": "PA Program Declared",
          "type" : "boolean",
          "sortable": true,
        },
        {
          "field": "hmProgramDeclared",
          "label": "HM Program Declared",
          "type" : "boolean",
          "sortable": true,
        },
        {
          "field": "incidentBeginDate",
          "label": "Incident Begin Date",
          "type" : "Date",
          "sortable": true,
        },
        {
          "field": "incidentEndDate",
          "label": "Incident End Date",
          "type" : "Date",
          "sortable": true,
        },
        {
          "field": "disasterCloseoutDate",
          "label": "Disaster Closeout Date",
          "type" : "Date",
          "sortable": true,
        }]
  };
  table.config(settings);  
}

function onLoad() {
  setupTable();
}

async function onClick() {
  let loanObj = await elli.script.getObject('loan');
  let httpObj = await elli.script.getObject('http');
  let state = await loanObj.getField('14');
  let county = await loanObj.getField('13');
  
  if (state && county) {
    //Fetch the disasters for the area
    let femaDisasterDeclUrl = 'https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries';
    let filterParams = "$count=true&$filter=state eq '"+state+"' and designatedArea eq '"+county+" (County)'";
    let disasterDeclResults = await httpObj.get(femaDisasterDeclUrl+'?'+filterParams);

    //If there are disasters, we will build our rows for only the fields we are concerned about
    if(disasterDeclResults.body && disasterDeclResults.body.metadata.count > 0) {
      let myDisasters = [];
      disasterDeclResults.body.DisasterDeclarationsSummaries.forEach((item) => {
        let entry = {};
        entry.declarationType = item.declarationType;
        entry.incidentType = item.incidentType;
        entry.declarationTitle = item.declarationTitle;
        entry.ihProgramDeclared = item.ihProgramDeclared;
        entry.iaProgramDeclared = item.iaProgramDeclared;
        entry.paProgramDeclared = item.paProgramDeclared;
        entry.hmProgramDeclared = item.hmProgramDeclared;
        entry.incidentBeginDate = item.incidentBeginDate;
        entry.incidentEndDate = item.incidentEndDate;
        entry.disasterCloseoutDate = item.disasterCloseoutDate;
        myDisasters.push(entry);
      })
      let table = await elli.script.getObject('DataResultsCtrl');
      table.bind(myDisasters);      
    } else {
      alert("No disasters found!");
    }
  }
    

}