//Input data
const config1 = {
  parent: '#usersTable',
  columns: [
    { title: 'Имя', value: 'name' },
    { title: 'Фамилия', value: 'surname' },
    { title: 'Возраст', value: 'age' },
  ]
};

const users = [
  { id: 30050, name: 'Вася', surname: 'Петров', age: 12 },
  { id: 30051, name: 'Иван', surname: 'Васечкин', age: 15 },
  { id: 30051, name: 'Анжела', surname: 'Иванова', age: 15 },
  { id: 30051, name: 'Вячеслав', surname: 'Андреев', age: 15 },
];
//--------------------------------API--------------------------------
let apiUrl = "https://mock-api.shpp.me/lmyetolkina/users";
let apiData; //data from json-file
let repaintTableHeader = true; //Paint in first load page
let dateColumnsNumber = 1; //for column with date format convert string to 'dd.mm.yyyy'

/**
 * get api Data an convert JSON to array;
 */
async function getDataFromApi() {

  let apiData = []
  let response = await fetch(apiUrl);
  if (response.ok) {
    let json = await response.json();
    let data = json.data;

    let dateField, month, day, inner, itemInner;
    let columnCounter;
    for (let item in data) {
      inner = data[item];
      itemInner = {};
      columnCounter = 1;
      for (let x in inner) {
        //check date format and convert it to "dd.mm.yyyy"
        if (typeof inner[x] == 'string' && !isNaN(Date.parse(inner[x]))) {
          dateColumnsNumber = columnCounter + 1;
          dateField = new Date(Date.parse(inner[x]));
          month = dateField.getMonth() + 1;
          month = (month <= 9) ? `0${month}` : month;
          day = (dateField.getDate() <= 9) ? `0${dateField.getDate()}` : dateField.getDate();
          itemInner[x] = `${day}.${month}.${dateField.getFullYear()}`;
        } else {
          if (x == 'id') {
            itemInner[x] = item;
          } else {
            itemInner[x] = inner[x];
          }
        }
        columnCounter++;
      }
      apiData.push(itemInner);
    }
  }
  return apiData;
}

/**
 * delete user from database and visual table
 * @param {*} id user Id
 */
async function deleteItem(id) {
  let response = await fetch(apiUrl + "/" + id, { method: "DELETE" });
  if (response.ok) {
    return false;
  }
}

/**
 * Create new item in database
 * @param {*} data string with new user data
 */
async function newItem(data) {
  let response = await fetch(apiUrl,
    {
      method: 'POST',
      headers: { "Content-type": "application/json" },
      body: JSON.stringify(data)
    }
  );

  if (response.ok) {
    return false;
  }
}

/**
 * Main block - create page element, table data, add event listeners etc
 */
(async () => {

  apiData = await getDataFromApi(); //extract data from server json-file
  let nuberIdColumns;
  let columnsCount; //count columns in data
  let clickAddButton = false; //block add button then new item was created but wasn't loaded on server

  /**
   * Create congig from json-fiel. Made table titles and columns
   */
  let apiConfig = () => {
    let titles = apiData[0];
    columnsCount = 1;
    let config = {};
    config['parent'] = config1.parent;
    let columns = []
    let itemColumnConfig;
    for (let title in titles) {

      columnsCount++;
      if (String(title).toLocaleLowerCase().indexOf('id') != -1) {
        nuberIdColumns = columnsCount;
      }
      itemColumnConfig = {};
      itemColumnConfig['title'] = title.charAt(0).toUpperCase() + title.slice(1);
      itemColumnConfig['value'] = title;
      columns.push(itemColumnConfig);
    }
    config['columns'] = columns;
    return config;
  }

  //-------------------------TABLE--------------------------------------
  let tableRow;
  let idParent; //id div where was added table
  let idTable;  //id table
  let config, data;
  let newData; //choose start data. It can be local or remote (json) data
  let searchVal = ''; //data in search fields
  let tableHeader;
  start();

  /**
   * TODO - may be create two variant...
   */
  function start() {
    if (apiData.length == 0) {
      config = config1;
      data = users;
    } else {
      if (repaintTableHeader) {
        config = apiConfig();
      }
      data = apiData;
    }
    newData = tableData(config, data); //Select data equals config colums;      
    DataTable(config, repaintTableHeader, 'tbl_1'); //Start adding table     
  }

  /**
  * Select data to the table
  * @param {*} config 
  * @param {*} data 
  */
  function tableData(config, data) {
    let usedData = [];
    tableHeader = getTableHeader(config);

    usedData.push(tableHeader);
    //For data for body table
    data.map((arr, i) => {
      let items = {};
      items['number'] = i + 1;
      for (let key in arr) {
        if (tableHeader[key]) {
          items[key] = arr[key];
        }
      }
      usedData.push(items);
    })
    return usedData;
  }

  function getTableHeader(config) {
    let title = {};
    //Form data for header table
    title['number'] = '№';
    config.columns.map((arr, i) => {
      title[arr.value] = arr.title;
    })
    return title;
  }

  /**
   * Main function - form data, create table and add it in HTML.
   * Here also repaint body after use sorting
   * @param {*} config - data about table titles and needed columns
   * @param {*} isRepaintHead if use sort then we didn't repaint table header
   * @param {*} tableName - table id 
   */
  function DataTable(config, isRepaintHead, tableName) {
    idTable = tableName;
    idParent = config.parent.substring(1);
    let table, tableHead;
    //form table head
    if (isRepaintHead) {
      table = document.createElement('table');
      table.id = idTable;
      tableHead = document.createElement('thead');
      tableRow = document.createElement('tr');
      table.appendChild(tableHead);
      tableHead.appendChild(tableRow);
      formCells('th', 0, true);
      formDeleteButtons('th', 'Actions', true);
    } else {
      table = document.getElementById(idTable);
    }

    //form table body
    let tableBody = document.createElement('tbody');
    tableBody.id = 'tbody_1';
    table.appendChild(tableBody);

    for (let i = 1; i < newData.length; i++) {
      tableRow = document.createElement('tr');
      tableBody.appendChild(tableRow);
      formCells('td', i, false);
      formDeleteButtons('td', 'Delete item', false, newData[i]['id']);
    }
    document.getElementById(idParent).append(table);
  }

  /**
   * Form cells in table 
   * @param {*} el element
   * @param {*} index index in the table
   * @param {*} isArrow just for header - add filter arrow
   */
  function formCells(el, index, isArrow) {
    for (let key in newData[index]) {     
      tableRow.appendChild(addTextToCell(el, newData[index][key], isArrow, key));
    }
  }

  /**
   *  Add text to row cell
   * @param {*} element 
   * @param {*} text 
   * @param {*} isArrow - for header add filter arrows
   * @param {*} id - element id
   */
  function addTextToCell(element, text, isArrow, id) {
    let th = document.createElement(element);
    th.setAttribute('aria-label', newData[0][id]);
    if (id == 'id') {
      th.className = 'hidden';
    }
    let textNode = document.createTextNode(text);
    th.appendChild(textNode);

    if (isArrow) {
      th.id = `th_${id}`;
      let arrow = document.createElement("div");
      arrow.className = "arrow";
      th.onclick = () => sort(id, arrow);
      th.appendChild(arrow);
    }
    return th;
  }

  /**
   * For every table row add button "Delete item"
   * @param {*} el element
   * @param {*} text text content
   * @param {*} isHeader for header add just title
   * @param {*} id user Id use for form element id
   */
  function formDeleteButtons(el, text, isHeader, id) {
    let th = document.createElement(el);
    let textNode = document.createTextNode(text);
    if (isHeader) {
      th.appendChild(textNode);
      tableRow.appendChild(th);
      return;
    }
    let btn = document.createElement('button');

    btn.id = `btn${id}`;
    btn.onclick = async () => {
      repaintTableHeader = await deleteItem(id);
      apiData = await getDataFromApi();
      repaintTableBody();
    }

    btn.className = 'btnDelete';
    btn.appendChild(textNode);
    th.appendChild(btn);
    tableRow.appendChild(th);
  }

  /**
   * Repaint table body after delete or add item 
   */
  function repaintTableBody() {
    let table = document.getElementById(idTable)
    table.removeChild(table.lastChild);
    clickAddButton = false;
    start();
  }

  /**
   * Sort table by column
   * @param {*} columnName name of table column
   * @param {*} arrow 
   */
  function sort(columnName, arrow) {


    let sortedData = newData.filter((item, i) => i > 0);

    //sort body data
    if (arrow.classList.contains("arrow-up")) {
      arrow.classList.remove("arrow-up");
      arrow.classList.add("arrow-down");
      sortedData.sort((a, b) => a[columnName] > b[columnName] ? -1 : 1);
    } else {
      arrow.classList.remove("arrow-down");
      arrow.classList.add("arrow-up");
      sortedData.sort((a, b) => a[columnName] < b[columnName] ? -1 : 1);
    }
    //change old table data by sorted data
    for (let i = 1; i < newData.length; i++) {
      newData[i] = sortedData[i - 1];
    }

    //repaint table body
    let table = document.getElementById(idTable)
    table.removeChild(table.lastChild);
    DataTable(config1, false, idTable);

  }

  let btnAdd = document.getElementById("btnAdd");
  /**
   * Add event listener to "Add item" buton. First "click" - add row for data, second click -> hidden with row
   */
  btnAdd.addEventListener("click", (event) => {
    //We can click the "Add" button just one time before load data on the server
    if (!clickAddButton) {
      let userId = maxUserId();
      let tableBody = document.getElementById('tbody_1');
      tableRow = document.createElement('tr');
      let tableRowId = 'inputRow';
      tableRow.id = tableRowId;
      let td = document.createElement('td');
      let inputInTable;
      //Add № value -> auto value
      let textNode = document.createTextNode(newData.length);
      td.appendChild(textNode);
      tableRow.appendChild(td);
      //Add input fileds
      for (let i = 2; i <= columnsCount - 1; i++) {
        inputInTable = document.createElement('input');
        if (i != dateColumnsNumber) {
          inputInTable.type = 'text';
        } else {
          inputInTable.type = 'date';
        }
        inputInTable.id = `in_${i}`;
        inputInTable.className = 'inputEmpty';

        inputInTable.addEventListener('keydown', {
          handleEvent(event) { inputEnterData(event, tableRow.id, i, userId) }
        });
        td = document.createElement('td');
        td.appendChild(inputInTable);
        tableRow.appendChild(td);
      }
      //Add userId -> autovalue
      td = document.createElement('td');
      td.className = 'hidden';
      textNode = document.createTextNode(userId);
      td.appendChild(textNode);
      tableRow.appendChild(td);
      //add row on top table
      tableBody.prepend(tableRow);
      clickAddButton = true; //We block the button until the data is sent to the server
    }
  });

  /**
   * Find max user Id and increment it for new user
   */
  function maxUserId() {
    let bodyData = newData.filter((item, i) => item.id != "Id");
    let sortedData = bodyData.sort((a, b) => b['id'] > a['id'] ? -1 : 1);
    sortedData.reverse();
    return Number(sortedData[0]['id']) + 1;
  }

  /**
   * After every "enter" click check data. If all fields aren't empty create new item in database
   * @param {*} e - event
   * @param {*} tableRowId - for input row add special id
   * @param {*} index - column index
   * @param {*} userId - user id
   */
  async function inputEnterData(e, tableRowId, index, userId) {

    //'13' is "enter code"
    if (e.keyCode == 13) {
      let isNotNull = true //checked flag
      let row = document.getElementById(tableRowId);
      let td;
      let filedNames = Object.keys(apiData[0]);
      let dataOnServer = {};
      //set focus on next rigth column after "enter" click
      if (index < row.childNodes.length - 1) {
        row.childNodes[index].childNodes[0].focus();
      }

      //Check fields, if field is empty set "false" in checked flag
      for (let i = 1; i < row.childNodes.length - 1; i++) {
        td = row.childNodes[i];
        if (!td.childNodes[0].value) {
          isNotNull = false;
        } else {
          dataOnServer[filedNames[i - 1]] = td.childNodes[0].value;
          isNotNull = true;
        }
      }
      dataOnServer[filedNames[filedNames.length - 1]] = userId;
      //if all row fields are fill, load item on server
      if (isNotNull) {
        repaintTableHeader = await newItem(dataOnServer);
        apiData = await getDataFromApi();
        repaintTableBody();
        searchVal = '';
        document.getElementById('search').value = searchVal;
      }
    }
  }

  /**
   * Search data by the context in all table rows
   */
  document.getElementById('search').addEventListener('keyup', () => {

    searchVal = document.getElementById('search').value.toLowerCase();

    //repaintTable
    let table = document.getElementById(idTable)
    table.remove();
    repaintTableHeader = true;
    start();
    //filtered
    let filterData = newData.filter((item, i) => i == 0 || (item.name.toLowerCase().indexOf(searchVal) != -1 || item.surname.toLowerCase().indexOf(searchVal) != -1 || item.avatar.toLowerCase().indexOf(searchVal) != -1 || item.birthday.toLowerCase().indexOf(searchVal) != -1))
    let idData = filterData.map(item => item.id);
    let tableRows = document.getElementsByTagName('tr');
    let id;

    for (let i = 1; i < tableRows.length; i++) {
      id = tableRows[i].childNodes[nuberIdColumns - 1].childNodes[0].nodeValue;
      if (idData.indexOf(id) == -1) {
        tableRows[i].classList.add('hidden');
      } else {
        tableRows[i].classList.remove('hidden');
      }
    }
    newData = filterData;
  })


})();


