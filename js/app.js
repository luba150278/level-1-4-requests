window.onload = () => {
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
  let apiData;
  let repaintTableHeader = true;
  let dateColumnsNumber = 1;
  //get api Data an convert JSON to array;
  /**
   * 
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
            itemInner[x] = inner[x];
          }
          columnCounter++;
        }
        apiData.push(itemInner);
      }
    }
    return apiData;
  }

  async function deleteItem(id) {
    console.log(id)
    const response = await fetch(apiUrl + "/" + id, { method: "DELETE" });
    if (response.ok) {
      apiData = await getDataFromApi();
      return false;
    }
  }



  (async () => {

    apiData = await getDataFromApi();
    let nuberIdColumns;
    let columnsCount;
    let clickAddButton = false;
    //Create congig with table titles and columns
    /**
     * 
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
    let newData;
    start();
    function start() {
      console.log(apiData)
      if (apiData.length == 0) {
        config = config1;
        data = users;
      } else {
        if (repaintTableHeader) {
          config = apiConfig();
        }
        data = apiData;
      }
      console.log(nuberIdColumns)
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
      let title = {};
      //Form data for header table
      title['number'] = '№';
      config.columns.map((arr, i) => {
        title[arr.value] = arr.title;
      })
      usedData.push(title);

      //For data for body table
      data.map((arr, i) => {
        let items = {};
        items['number'] = i + 1;
        for (let key in arr) {
          if (title[key]) {
            items[key] = arr[key];
          }
        }
        usedData.push(items);
      })
      return usedData;
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
      if (isRepaintHead) {
        table = document.createElement('table');
        table.id = idTable;
        tableHead = document.createElement('thead');
        tableRow = document.createElement('tr');
        table.appendChild(tableHead);
        tableHead.appendChild(tableRow);
        formCells('th', 0, true);  //form table head
        formDeleteButtons('th', 'Actions', true);
      } else {
        table = document.getElementById(idTable);
      }

      let tableBody = document.createElement('tbody');
      tableBody.id = 'tbody_1';
      table.appendChild(tableBody);
      //form table body
      for (let i = 1; i < newData.length; i++) {
        tableRow = document.createElement('tr');
        tableBody.appendChild(tableRow);
        formCells('td', i, false);
        formDeleteButtons('td', 'Delete', false, newData[i]['id']);
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
        console.log(btn.id);
        repaintTableHeader = await deleteItem(id);
        repaintTableBody();
      }

      btn.className = 'btnDelete';
      btn.appendChild(textNode);
      th.appendChild(btn);
      tableRow.appendChild(th);
    }

    function repaintTableBody() {
      let table = document.getElementById(idTable)
      table.removeChild(table.lastChild);
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
          inputInTable.addEventListener('keydown', {
            handleEvent(event) { inputEnterData(event, tableRow.id, i, userId) }
          });
          td = document.createElement('td');
          td.appendChild(inputInTable);
          tableRow.appendChild(td);
        }
        //Add userId -> autovalue
        td = document.createElement('td');
        textNode = document.createTextNode(userId);
        td.appendChild(textNode);
        tableRow.appendChild(td);
        //add row on top table
        tableBody.prepend(tableRow);
        clickAddButton = true; //We block the button until the data is sent to the server
      }
    });

    function maxUserId() {
      let sortedData = newData.sort((a, b) => b['id'] > a['id'] ? -1 : 1);
      sortedData.reverse();
      return sortedData[0]['id'] + 1;
    }

    async function newItem(data) {
      const response = fetch(apiUrl,
        {
          method: 'POST',
          headers: { "Content-type": "application/json" },
          body: JSON.stringify(data)
        }
      );

      if (response.ok) {
        apiData = await getDataFromApi();
        //return false;
      }
    }

    async function inputEnterData(e, tableRowId, index, userId) {
      //'13' is "enter code"
      if (e.keyCode == 13) {
        let isNotNull = true
        let row = document.getElementById(tableRowId);
        let td;
        let filedNames = Object.keys(apiData[0]);
        let dataOnServer = {};
        if (index < row.childNodes.length - 1) {
          row.childNodes[index].childNodes[0].focus();
        }

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
        console.log(dataOnServer)
        if (isNotNull) {
          repaintTableHeader = await newItem(dataOnServer);
          repaintTableBody();
          clickAddButton = true;
        }
      }
    }



  })();
}
