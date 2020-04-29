/* ДЗ 2 - работа с массивами и объектами */

/*
 Задание 1:

 Напишите аналог встроенного метода forEach для работы с массивами
 Посмотрите как работает forEach и повторите это поведение для массива, который будет передан в параметре array
 */
function forEach(array, fn) {
  for (let i = 0; i < array.length; i++) {
    fn(array[i], i, array);
  }
}

/*
 Задание 2:

 Напишите аналог встроенного метода map для работы с массивами
 Посмотрите как работает map и повторите это поведение для массива, который будет передан в параметре array
 */
function map(array, fn) {
  let newArray = [];
  for (let i = 0; i < array.length; i++) {
    let modifiedElement = fn(array[i], i, array);
    newArray.push(modifiedElement);
  }
  return newArray;
}

/*
 Задание 3:

 Напишите аналог встроенного метода reduce для работы с массивами
 Посмотрите как работает reduce и повторите это поведение для массива, который будет передан в параметре array
 */
function reduce(array, fn, initial) {
  let prev;
  let result;
  if (initial) {
    prev = initial;
    for (let i = 0; i < array.length; i++) {
      result = fn(prev,array[i],i,array);
      prev = result;
    }
  } else {
    prev = array[0];
    for (let i = 1; i < array.length; i++) {
      result = fn(prev,array[i],i,array);
      prev = result;
    }
  }
  return result;
}

/*
 Задание 4:

 Функция должна перебрать все свойства объекта, преобразовать их имена в верхний регистр и вернуть в виде массива

 Пример:
   upperProps({ name: 'Сергей', lastName: 'Петров' }) вернет ['NAME', 'LASTNAME']
 */
function upperProps(obj) {
  let propsArr = [];
  for (let val in obj) {
    propsArr.push(val.toUpperCase());
  }
  return propsArr;
}

/*
 Задание 5 *:

 Напишите аналог встроенного метода slice для работы с массивами
 Посмотрите как работает slice и повторите это поведение для массива, который будет передан в параметре array
 */
function slice(array, from = 0, to = array.length) {
  let newArray = [];

  from = from < 0? array.length + from : from;
  to = to < 0? array.length + to : to;
  to = to > array.length? array.length : to;

  for (let i = from; i < to; i++) {
    if (array[i] === undefined) continue;
    newArray.push(array[i]);
  }
  return newArray;
}

/*
 Задание 6 *:

 Функция принимает объект и должна вернуть Proxy для этого объекта
 Proxy должен перехватывать все попытки записи значений свойств и возводить это значение в квадрат
 */
function createProxy(obj) {
  let objProxy = new Proxy(obj, {
    set(target, prop, value) {
      return target[prop] = value * value;
    }
  });
  return objProxy;
}

export {
    forEach,
    map,
    reduce,
    upperProps,
    slice,
    createProxy
};
