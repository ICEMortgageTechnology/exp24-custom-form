# Encompass Custom Input Form Demo/Exercise
Custom Input Forms are created thru a WYSIWYG, web-based application called the **Input Form Builder (IFB)**. The IFB provides a simple, drag-and-drop experience for designing forms and binding the form elements to data from the loan. The tool is meant to be accessible to users with no development experience; however, it also provides capabilities that are more advanced for developers to more fully customize the behaviors behind the form.

This demo project focuses on the developer-oriented features of the IFB, demonstrating how to introduce code into a form designed in the IFB. You will be led thru several steps, each of which adds additional capabilities to the a sample form or demonstrates best practices in form development. If you prefer not to go thru the individual steps, the project includes a complete version of the form and code in the "final" folder, which you can use as a reference throughout this exercise.

For more information around custom development for Encompass Web, please take a look at the reference documentation, which can be found here: https://developer.icemortgagetechnology.com/developer-connect/docs/encompass-web-developer

## Custom Input Form Steps
The following table of contents lists the different steps included here as well as the objective of each. Each step demonstrates the end state of the specific step. This page will give you the complete set of steps for that step. The steps here assume that you are already familiar with HTML, CSS and JavaScript (ES6).

### Step 1: Starting a new Form
In the first step, you will start by creating a new form for a subject property address section and link the fields to their appropriate field id's. We'll then enable the form and verify it's working as expected in LO Connect.
1. Login to encompass as an admin, navigate to the custom forms, click on "new" and select "new form". Then click the create button. The Input Form Builder will open in a new tab, with your new form.
2. Click on the form name and give your form a new name.
3. Click on Form Layout and select a 1x1 category box. This will initialize our form for us to start building.
4. Drag over the components we will use from the "Form Elements" toolbar. In our case, 5 textboxes.
5. Fill out our component criteria - from left to right, "Street Address", "City", "State", "Zip", "County". Note, you might alsow want to rename the "Control ID" to something more understandable for if/when you use it in your custom code later. For example, give the City textbox a control id name of "CityCtrl".
6. You can also change the section header from "Category 1" to "Subject Property Address".
7. Play with the Layout controls in your "Properties" tab for each textbox so it looks more like a standard property section on a form.
8. Click on each text box and assign it the proper field from within the properties box.
	- URLA.X73 (street address)
	- 12 (city)
	- 14 (state)
	- 15 (zip)
	- 13 (county)
9. Wire up the zip lookup feature for our zip code field. Click on our zip code textbox, then in the Zipcode Lookup section of the properties add the correct fields for each element of city, state, county.
10. Enable the form and save it. Now, on your Admin screen, dropdown the app switcher and select "pipeline".  Open a new loan and navigate to your new custom form to see it load. 

### Step 2: Adding a data table and controlling it with JavaScript
Next, you'll learn how to add custom JavaScript code to populate a Data Tabel tied to the onForm load event. This step will also introduce the basic patterns for interacting with the Encompass Web application thru the Ellie Mae JavaScript Framework (SSF).
1. Let's add a button to the bottom of our form to populate our Data Table.
2. Now we will drag over our data table below our button.
3. Rename your button and data grid controls to something more easily identifiable
4. Open the code editor and add an onLoad function, in which we will add our code to setup our data table's configuration.
5. Now let's tie that onLoad function to our form.
6. Back to our code editor we will create an async function to initialize our data table and then call that from our onLoad function.
```
	//Sample code to configure a data table
	let table = await elli.script.getObject('DataGrid1');		
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
	          "field": "ihProgramDeclared",
	          "label": "IH Program Declared",
	          "type" : "boolean",
	          "sortable": true,
	        },
	        {
	          "field": "incidentBeginDate",
	          "label": "Incident Begin Date",
	          "type" : "Date",
	          "sortable": true,
	        }]
		};
	table.config(settings); 		
```
7. In your code editor, add an async onClick function that we will use to populate our data table.
```
//Sample code to populate a data table's rows
    let rows = [ { 
      'declarationType' : 'DR',
      'ihProgramDeclared': false,
      'incidentBeginDate' : '2022-12-27',
    }];
    
    let table = await elli.script.getObject('DataResultsCtrl');
  
    table.bind(rows);
```
8. Save and Close out your editor.
9. Back on the form, tie your onClick function to your button.
10. Save your form, make sure it's enabled and go view it within Encompass Web as an LO.

### Step 3: Making API calls 
In this step, you will enhance your form by doing an API call to lookup disaster's from FEMA for the supplied subject property address. You will then use the results from that API call to populate your Data Table
1. Rename your button to say "Lookup Disasters".
2. In the onclick function, add the API call to fetch the disasters from the FEMA API. To do this you will use the following API which takes, as a parameter, the state and county.
API: https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries?$count=true&$filter=state eq 'STATE' and designatedArea eq 'COUNTY (County)'.<br />
For more information on this API, you can visit https://www.fema.gov/openfema-data-page/disaster-declarations-summaries-v2.<br />
Remember we store the state in Field ID: 14 and the county in Field ID: 13.
```
//Sample code to get a field ID:
let loanObj = await elli.script.getObject('loan');
let field = await loanObj.getField('<field ID>');

//Sample code on calling http object
let httpObj = await elli.script.getObject('http');
let disasterDeclResults = await httpObj.get(myAPIURL);
```
3. If there are results, iterate over them to build out your table's data set based upon the columns you've configured.
```
//Sample Code
    //If there are disasters, we will build our rows for only the fields we are concerned about
    if(disasterDeclResults.body && disasterDeclResults.body.metadata.count > 0) {
      let myDisasters = [];
      disasterDeclResults.body.DisasterDeclarationsSummaries.forEach((item) => {
        let entry = {};
        entry.declarationType = item.declarationType;
        entry.ihProgramDeclared = item.ihProgramDeclared;
        entry.incidentBeginDate = item.incidentBeginDate;
        myDisasters.push(entry);
      })
      let table = await elli.script.getObject('DataResultsCtrl');
      table.bind(myDisasters);      
    }
```

### final: Adding finishing touches and using custom fields to persist data
Our final version of this tracks and displays our last run date and uses the HMDA county code to match against the FIPS Code to further reduce the result sets. Finally, it persists our last run date as well as the results so we can easily display them on load.  

I leave you to figure this part out.

