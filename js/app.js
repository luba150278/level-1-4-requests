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

  //get api Data an convert JSON to array;
  async function getDataFromApi() {
    let i = 0;
    let apiData = []
    let response = await fetch(apiUrl);
    if (response.ok) {
      let json = await response.json();
      let data = json.data;
      let dateField, month, day, inner, itemInner;
      for (let item in data) {
        inner = data[item];
        itemInner = {};
        for (let x in inner) {
          //check date format and convert it to "dd.mm.yyyy"
          if (typeof inner[x] == 'string' && !isNaN(Date.parse(inner[x]))) {
            dateField = new Date(Date.parse(inner[x]));
            month = dateField.getMonth() + 1;
            month = (month <= 9) ? `0${month}` : month;
            day = (dateField.getDate() <= 9) ? `0${dateField.getDate()}` : dateField.getDate();
            itemInner[x] = `${day}.${month}.${dateField.getFullYear()}`;
          } else {
            itemInner[x] = inner[x];
          }
        }
        apiData.push(itemInner);
      }
    }
    return apiData;
  }

  (async () => {
    let apiData = await getDataFromApi();
    //Create congig with table titles and columns
    let apiConfig = () => {
      let titles = apiData[0];
      let config = {};
      config['parent'] = config1.parent;
      let columns = []
      let itemColumnConfig;
      for (let title in titles) {
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
    if (apiData.length == 0) {
      config = config1;
      data = users;
    } else {
      config = apiConfig();
      data = apiData;
    }

    let newData = tableData(config, data); //Select data equals config colums; 
    DataTable(config, true, 'tbl_1'); //Start adding table

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
      } else {
        table = document.getElementById(idTable);
      }

      let tableBody = document.createElement('tbody');
      table.appendChild(tableBody);
      //form table body
      for (let i = 1; i < newData.length; i++) {
        tableRow = document.createElement('tr');
        tableBody.appendChild(tableRow);
        formCells('td', i, false);
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
      let i = 1;
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

  })();
}