/*
 ДЗ 7 - Создать редактор cookie с возможностью фильтрации

 7.1: На странице должна быть таблица со списком имеющихся cookie. Таблица должна иметь следующие столбцы:
   - имя
   - значение
   - удалить (при нажатии на кнопку, выбранная cookie удаляется из браузера и таблицы)

 7.2: На странице должна быть форма для добавления новой cookie. Форма должна содержать следующие поля:
   - имя
   - значение
   - добавить (при нажатии на кнопку, в браузер и таблицу добавляется новая cookie с указанным именем и значением)

 Если добавляется cookie с именем уже существующей cookie, то ее значение в браузере и таблице должно быть обновлено

 7.3: На странице должно быть текстовое поле для фильтрации cookie
 В таблице должны быть только те cookie, в имени или значении которых, хотя бы частично, есть введенное значение
 Если в поле фильтра пусто, то должны выводиться все доступные cookie
 Если добавляемая cookie не соответсвует фильтру, то она должна быть добавлена только в браузер, но не в таблицу
 Если добавляется cookie, с именем уже существующей cookie и ее новое значение не соответствует фильтру,
 то ее значение должно быть обновлено в браузере, а из таблицы cookie должна быть удалена

 Запрещено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер
 */

/*
 homeworkContainer - это контейнер для всех ваших домашних заданий
 Если вы создаете новые html-элементы и добавляете их на страницу, то добавляйте их только в этот контейнер

 Пример:
   const newDiv = document.createElement('div');
   homeworkContainer.appendChild(newDiv);
 */
const homeworkContainer = document.querySelector("#homework-container");
// текстовое поле для фильтрации cookie
const filterNameInput = homeworkContainer.querySelector("#filter-name-input");
// текстовое поле с именем cookie
const addNameInput = homeworkContainer.querySelector("#add-name-input");
// текстовое поле со значением cookie
const addValueInput = homeworkContainer.querySelector("#add-value-input");
// кнопка "добавить cookie"
const addButton = homeworkContainer.querySelector("#add-button");
// таблица со списком cookie
const listTable = homeworkContainer.querySelector("#list-table tbody");

showCookies();

filterNameInput.addEventListener("keyup", function () {
  // здесь можно обработать нажатия на клавиши внутри текстового поля для фильтрации cookie
  checkIfMatches(filterNameInput.value);
});

addButton.addEventListener("click", () => {
  // здесь можно обработать нажатие на кнопку "добавить cookie"
  document.cookie = `${addNameInput.value}=${addValueInput.value}`;
  addNameInput.value = "";
  addValueInput.value = "";
  showCookies();
});

function getCookies() {
  const cookies = document.cookie.split("; ").reduce((prev, next) => {
    const [name, value] = next.split("=");

    prev[name] = value;
    return prev;
  }, {});

  return cookies;
}

function showCookies() {
  listTable.innerHTML = "";

  const cookies = getCookies();
  addToDom(cookies);
}

function addToDom(cookies) {
  if (cookies) {
    const fragment = document.createDocumentFragment();

    for (const cookie in cookies) {
      const node = createNode(cookie, cookies[cookie]);
      fragment.appendChild(node);
    }
    return listTable.appendChild(fragment);
  }
}

function createNode(elemName, elemValue) {
  const tr = document.createElement("tr");
  const name = document.createElement("th");
  const value = document.createElement("th");
  const button = document.createElement("button");

  name.textContent = elemName;
  value.textContent = elemValue;
  button.textContent = "button";

  tr.appendChild(name);
  tr.appendChild(value);
  tr.appendChild(button);

  button.addEventListener("click", (e) => {
    return deleteCookie(tr, elemName, elemValue);
  });
  return tr;
}

function deleteCookie(elem, name, value) {
  document.cookie = `${name}=${value}; max-age=0`;
  return listTable.removeChild(elem);
}

function checkIfMatches(currentValue) {
  const cookies = getCookies();

  listTable.innerHTML = "";
  const fragment = document.createDocumentFragment();

  for (const cookie in cookies) {
    if (cookie.toLowerCase().includes(currentValue.toLowerCase()) || cookies[cookie].toLowerCase().includes(currentValue.toLowerCase())) {
      const node = createNode(cookie, cookies[cookie]);
      fragment.appendChild(node);
    }
  }
  listTable.appendChild(fragment);
}