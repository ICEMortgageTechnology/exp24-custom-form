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
    let rows = [ { 
      'declarationType' : 'DR',
      'incidentType' : 'flood',
      'declarationTitle' : 'Severe',
      'ihProgramDeclared': false,
      'iaProgramDeclared': false,
      'paProgramDeclared': false,
      'hmProgramDeclared': false,
      'incidentBeginDate' : '2022-12-27',
      'incidentEndDate': '2023-1-5',
      'disasterCloseoutDate' : '2023-3-1'
    }]
    
    let table = await elli.script.getObject('DataResultsCtrl');
    
    table.bind(rows);
}