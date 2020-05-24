ymaps.ready(init);

function init() {
  const menu = document.querySelector(".menu");
  const submitButton = document.querySelector("#submit-button");
  const closeButton = document.querySelector("#close-button");
  const menuReviews = menu.querySelector(".menu__reviews");
  const menuBlank = menu.querySelector('.menu__item--blank')
  const map = new ymaps.Map("map", {
    center: [55.76, 37.64],
    zoom: 11,
    controls: ["zoomControl"],
    behaviors: ["drag"],
  });

  console.log(menuReviews);

  map.events.add("click", (e) => {
    const coords = e.get("coords");
    console.log(coords);
    const clickX = e.get("domEvent").get("clientX");
    const clickY = e.get("domEvent").get("clientY");

    openMenu(clickX, clickY);
    findAddressByCoords(coords).then((result) => {
      menu.querySelector(".menu__address").textContent = result;
    });
  });

  renderLocalStorage(map);

  function renderLocalStorage(map) {
    for (const item in localStorage) {
      if (typeof localStorage[item] === "string") {
        const arr = JSON.parse(localStorage[item]);
        for (const el of arr) {
          const { address, coords } = el;
          const placemark = createPlacemark(coords);
          map.geoObjects.add(placemark);
        }
      }
    }
  }
  
  function createPlacemark(coords) {
    const placemark = new ymaps.Placemark(coords, {
      hintContent: "This is a hint",
      balloonContent: "This is a baloon",
    });
    return placemark;
  }
  
  async function findAddressByCoords(coords) {
    const address = await ymaps.geocode(coords).then((res) => {
      const firstGeoObject = res.geoObjects.get(0);
      const address = firstGeoObject.getAddressLine();
      return address;
    });
    return address;
    // menu.querySelector(".menu__address").textContent = address;
  }
  
  async function findCoordsByAddress(address) {
    const coords = await ymaps.geocode(address).then((res) => {
      const firstGeoObject = res.geoObjects.get(0);
      const coords = firstGeoObject.geometry.getCoordinates();
      return coords;
    });
    // return coords;
    console.log(coords);
    return coords;
  }
  
  function openMenu(x, y) {
    menu.classList.add("menu--visible");
  
    menu.style.left =
      x >= document.body.offsetWidth - menu.offsetWidth ? "auto" : x + "px";
    menu.style.right = 0;
    menu.style.top =
      y >= document.body.offsetHeight - menu.offsetHeight ? "auto" : y + "px";
    menu.style.bottom = 0;
  }
  
  submitButton.addEventListener("click", (e) => {
    e.preventDefault();
    const review = writeToLocalStorage();
    const reviewNode = createReview(review);
    menuReviews.appendChild(reviewNode);
  });
  
  closeButton.addEventListener("click", (e) => {
    const address = menu.querySelector(".menu__address").textContent;
    menu.classList.remove("menu--visible");
    findCoordsByAddress(address).then((result) => {
      const placemark = createPlacemark(result);
    });
  });
  
  async function writeToLocalStorage() {
    const streetName = menu.querySelector(".menu__address").textContent;
    const coords = await findCoordsByAddress(streetName);
    const review = {
      address: streetName,
      name: menu.name.value,
      company: menu.company.value,
      commentary: menu.commentary.value,
      coords: coords,
    };
    if (localStorage[streetName]) {
      const array = JSON.parse(localStorage[streetName]);
      array.push(review);
      localStorage[streetName] = JSON.stringify(array);
    } else {
      const array = [];
      array.push(review);
      localStorage[streetName] = JSON.stringify(array);
    }
    return review;
  }
  
  function createReview(review) {
    const currentTime = new Date();
    const li = document.createElement("li");
  
    li.classList.add("menu__item");
    li.innerHTML = `
      <div>
          <span class="review__name">${review.name}</span>
          <span class="review__company">${review.company}</span>
          <span class="review__date">${currentTime.getFullYear()}.${currentTime.getMonth()}.${currentTime.getDate()} ${currentTime.getHours()}:${currentTime.getMinutes()}:${currentTime.getSeconds()}</span>
      </div>
      <div>
          <span>${review.commentary}</span>
      </div>
    `;
    menu.name.value = "";
    menu.company.value = "";
    menu.commentary.value = "";
    const blank = menuReviews.querySelector(".menu__item--blank");
  
    return li;
  }
  
}