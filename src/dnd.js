/* Задание со звездочкой */

/*
 Создайте страницу с кнопкой.
 При нажатии на кнопку должен создаваться div со случайными размерами, цветом и позицией на экране
 Необходимо предоставить возможность перетаскивать созданные div при помощи drag and drop
 Запрещено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер
 */

const button = document.createElement('button');

button.id = 'addDiv';
button.textContent = 'button';
document.body.appendChild(button)

/*
 homeworkContainer - это контейнер для всех ваших домашних заданий
 Если вы создаете новые html-элементы и добавляете их на страницу, то дабавляйте их только в этот контейнер

 Пример:
   const newDiv = document.createElement('div');
   homeworkContainer.appendChild(newDiv);
 */
const homeworkContainer = document.querySelector('#homework-container');

/*
 Функция должна создавать и возвращать новый div с классом draggable-div и случайными размерами/цветом/позицией
 Функция должна только создавать элемент и задвать ему случайные размер/позицию/цвет
 Функция НЕ должна добавлять элемент на страницу. На страницу элемент добавляется отдельно

 Пример:
   const newDiv = createDiv();
   homeworkContainer.appendChild(newDiv);
 */

function createDiv() {
    const div = document.createElement('div');

    div.classList.add('draggable-div');

    let styles = {
        width: `${randomize(10, 300)}%`,
        height: `${randomize(10, 300)}%`,
        backgroundColor: `#${(0x1000000 + Math.floor(Math.random() * 0x1000000)).toString(16).substr(1)}`,
        left: `${randomize(0, 100)}%`,
        top: `${randomize(0, 100)}%`
    }

    for (const el in styles) {
        div.style[el] = styles[el];
    }

    function randomize(min, max) {
        return Math.floor(min + Math.random() * (max + 1 - min));
    }

    return div;
}

/*
 Функция должна добавлять обработчики событий для перетаскивания элемента при помощи drag and drop

 Пример:
   const newDiv = createDiv();
   homeworkContainer.appendChild(newDiv);
   addListeners(newDiv);
 */
function addListeners(target) {
    target.setAttribute('draggable', true);

    target.addEventListener('dragstart', e => {
        let startXPos = e.pageX - target.getBoundingClientRect().x;
        let startYPos = e.pageY - target.getBoundingClientRect().y;

        target.addEventListener('drag', e => {
            changePosition(e.pageX, e.pageY)
        });

        target.addEventListener('dragend', e => {
            changePosition(e.pageX, e.pageY)
        });

        function changePosition(pageX, pageY) {
            target.style.left = pageX - startXPos + 'px';
            target.style.top = pageY - startYPos + 'px';
        }

    })
}

let addDivButton = homeworkContainer.querySelector('#addDiv');

addDivButton.addEventListener('click', function () {
    // создать новый div
    const div = createDiv();

    // добавить на страницу
    homeworkContainer.appendChild(div);
    // назначить обработчики событий мыши для реализации D&D
    addListeners(div);
    // можно не назначать обработчики событий каждому div в отдельности, а использовать делегирование
    // или использовать HTML5 D&D - https://www.html5rocks.com/ru/tutorials/dnd/basics/
});

export {
    createDiv
};
