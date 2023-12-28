setupDisasterDeclarationsTableConfig = async () => {
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

populateDisasterDeclarationsTable = async (disasterDeclData) => {
  if (disasterDeclData) {
    let table = await elli.script.getObject('DataResultsCtrl');
    table.bind(disasterDeclData);
  }
}

setLastRunDate = async (date) => {
  let lastRunDtCtrl = await elli.script.getObject('LastRunDateCtrl');
  if(date) {
    lastRunDtCtrl.text(date);
  } else {
    lastRunDtCtrl.text('');
  }
}

async function SearchButtonCtrl_click(ctrl) { 
  let loanObj = await elli.script.getObject('loan');
  let httpObj = await elli.script.getObject('http');
  let state = await loanObj.getField('14');
  let county = await loanObj.getField('13');

  //The hmdaCountyCode is the same as the FIPS Code
  let hmdaCountyCode = await loanObj.getField('HMDA.X111');
  
  if (state && county) {
    //Fetch the disasters for the area
    let femaDisasterDeclUrl = 'https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries';
    let filterParams = "$count=true&$filter=state eq '"+state+"' and designatedArea eq '"+county+" (County)'";
    let disasterDeclResults = await httpObj.get(femaDisasterDeclUrl+'?'+filterParams);

    //Custom date field is formated as yyyy-MM-dd
    let lastRunDt = new Date(Date.parse(disasterDeclResults.body.metadata.rundate));
    let formattedDate = ('0' + lastRunDt.getDate()).slice(-2);
    let formattedMonth = ('0' + (lastRunDt.getMonth() + 1)).slice(-2);
    let formattedYear = lastRunDt.getFullYear();
    let lastRunDtFormatted = formattedYear + '-' + formattedMonth + '-' + formattedDate ;

    //Update last run date
    setLastRunDate(lastRunDtFormatted);
    
    //If there are disasters, fetch the FIPS code from the Melissa DB for more fine grained focus on area
    if(disasterDeclResults.body && disasterDeclResults.body.metadata.count > 0) {
      //filter disasters based upon fips
      let myDisasters = [];
      disasterDeclResults.body.DisasterDeclarationsSummaries.forEach((item) => {
        let fipsStateCode = hmdaCountyCode.substring(0,2);
        let fipsCountyCode = hmdaCountyCode.substring(2);
        if (item.fipsStateCode == fipsStateCode && item.fipsCountyCode == fipsCountyCode) {
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
        }
      })
      populateDisasterDeclarationsTable(myDisasters);
      loanObj.setFields({'CX.DISASTDECL':JSON.stringify(myDisasters), 'CX.DISASTDECLLASTRUNDT':lastRunDtFormatted});
      
      console.log(JSON.stringify(myDisasters));
    } else {
      loanObj.setFields({'CX.DISASTDECLLASTRUNDT':lastRunDtFormatted});
    }
  } else {
    alert("You must have a valid state and county specified.")
  }
}

async function form_onload() {
  let loanObj = await elli.script.getObject('loan');
  try {
    let disasterDeclData = await loanObj.getField('CX.DISASTDECL');
    let disasterDeclDate = await loanObj.getField('CX.DISASTDECLLASTRUNDT');
  
    setLastRunDate(disasterDeclDate);
    
    if ( disasterDeclData ) {
     await populateDisasterDeclarationsTable(JSON.parse(disasterDeclData));
    } 
  } catch (e) {
    console.log(e);    
  }
  setupDisasterDeclarationsTableConfig();
}

