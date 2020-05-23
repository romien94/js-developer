ymaps.ready(init);

function init() {
  const geoObjects = [];
  const menu = document.querySelector(".menu");
  const submitButton = menu.querySelector("#submit-button");
  const closeButton = menu.querySelector("#close-button");
  const menuReviews = menu.querySelector(".menu__reviews");
  const menuAddress = menu.querySelector(".menu__address");
  const menuBlank = menu.querySelector(".menu__item--blank");
  let coords;

  const map = new ymaps.Map("map", {
    center: [55.76, 37.64],
    zoom: 11,
    controls: ["zoomControl"],
    behaviors: ["drag"],
  });

  renderLocalStorage();

  const clusterer = new ymaps.Clusterer({
    clusterDisableClickZoom: true,
    clusterOpenBalloonOnClick: true,
  });

  map.geoObjects.add(clusterer);
  clusterer.add(geoObjects);
  clusterer.events.add("click", (e) => {
    const target = e.get("target");
    const geoObjects = target.getGeoObjects();
    for (const el of geoObjects) {
      const coords = el.geometry.getCoordinates();
      const address = findAddressByCoords(coords).then((res) => {
        const reviews = JSON.parse(localStorage[res]).slice(1);
        console.log(reviews);
      });
    }
  });


  map.events.add("click", (e) => {
    coords = e.get("coords");
    const clickX = e.get("domEvent").get("clientX");
    const clickY = e.get("domEvent").get("clientY");

    findAddressByCoords(coords)
      .then((address) => {
        menuReviews.innerText = "";
        menuReviews.appendChild(menuBlank);
        menuAddress.textContent = address;
      })
      .then((result) => openMenu(clickX, clickY));
  });

  map.balloon.events.add("open", (e) => {
    if (openMenu) {
      menu.classList.remove("menu--visible");
    }
    const sliderList = document.querySelector(".slider__list");
    const leftButton = document.querySelector(".slider__button");
    const rightButton = document.querySelector(".slider__button--right");
    const link = document.querySelector(".slider__address");
    const maxRight = sliderList.children.length * 100;
    let currentLeft = 0;

    leftButton.addEventListener("click", (e) => {
      currentLeft += 100;
      if (currentLeft <= maxRight) currentLeft = 0;
      sliderList.style.transform = `translateX(${currentLeft}%)`;
    });
    rightButton.addEventListener("click", (e) => {
      currentLeft -= 100;
      if (currentLeft <= -maxRight) currentLeft = 0;
      sliderList.style.transform = `translateX(${currentLeft}%)`;
    });

    link.addEventListener("click", (e) => {
      e.preventDefault();
      const address = sliderList.querySelector(".slider__address").textContent;
      const x = e.clientX;
      const y = e.clientY;

      openMenu(x, y);
      map.balloon.close();
      menuAddress.textContent = address;
      menuReviews.innerText = "";
      const arr = JSON.parse(localStorage[address]).slice(1);
      const fragment = document.createDocumentFragment();
      for (const elem of arr) {
        const review = createReviewNode(elem);
        fragment.appendChild(review);
      }
      menuReviews.appendChild(fragment);
    });
  });

  submitButton.addEventListener("click", (e) => {
    e.preventDefault();
    if (checkIfContaintsBlankElement(menuReviews)) {
      menuReviews.removeChild(menuBlank);
      createReview()
        .then((review) => {
          const address = review.address;
          const coords = JSON.parse(localStorage[address])[0];
          const node = createReviewNode(review);
          menuReviews.appendChild(node);
          return { address, coords };
        })
        .then(({ address, coords }) => {
          const placemark = createPlacemark(address, coords);
          map.geoObjects.add(placemark);
        });
    } else {
      createReview()
        .then(async (review) => createReviewNode(review))
        .then((review) => {
          menuReviews.appendChild(review);
        });
    }
  });

  closeButton.addEventListener("click", (e) => {
    const address = menu.querySelector(".menu__address").textContent;
    menu.classList.remove("menu--visible");
  });

  function createPlacemark(address, coords) {
    const CustomLayoutClass = ymaps.templateLayoutFactory.createClass(
      '<div class="slider">' +
        '<button class="slider__button slider__button--left"><</button>' +
        '<ul class="slider__list">' +
        "{% for review in properties.reviews %}" +
        '<li class="slider__item">' +
        '<div class="slider__content">' +
        '<span class="slider__company">{{review.company}}</span>' +
        '<a href="#" class="slider__address">{{review.address}}</a>' +
        '<span class="slider__commentary">{{review.commentary}}</span>' +
        "</div>" +
        '<span class="slider__date">{{review.date}}</span>' +
        "</li>" +
        "{% endfor %}" +
        "</ul>" +
        '<button class="slider__button slider__button--right">></button>' +
        '<ul class="paginator">' +
        "{% for index,item in properties.reviews %}" +
        `<li>{{index}}</li>` +
        "{% endfor %}" +
        "</ul>" +
        "</div>"
    );
    const arr = JSON.parse(localStorage[address]).slice(1);
    const placemark = new ymaps.Placemark(
      coords,
      {
        reviews: arr,
      },
      {
        balloonContentLayout: CustomLayoutClass,
      }
    );
    if (arr.length > 1) {
      placemark.properties.set({
        iconContent: `${arr.length}`,
        id: address,
      });
    }
    geoObjects.push(placemark);
    return placemark;
  }

  function renderLocalStorage(item) {
    if (item) {
      const arr = JSON.parse(localStorage[item]);
      const placemark = createPlacemark(item, arr[0]);
      map.geoObjects.add(placemark);
    } else {
      for (const item in localStorage) {
        if (typeof localStorage[item] === "string") {
          const arr = JSON.parse(localStorage[item]);
          const placemark = createPlacemark(item, arr[0]);
          map.geoObjects.add(placemark);
        }
      }
    }
  }

  function checkIfContaintsBlankElement(node) {
    if (node.children[0].classList.contains("menu__item--blank")) {
      return true;
    }
    return false;
  }

  async function createReview() {
    const streetName = menu.querySelector(".menu__address").textContent;
    const currentTime = new Date();
    const review = {
      address: menuAddress.textContent,
      name: menu.name.value,
      company: menu.company.value,
      commentary: menu.commentary.value,
      date: `${currentTime.getFullYear()}.${currentTime.getMonth()}.${currentTime.getDate()} ${currentTime.getHours()}:${currentTime.getMinutes()}:${currentTime.getSeconds()}`,
    };
    if (localStorage[streetName]) {
      const array = JSON.parse(localStorage[streetName]);
      array.push(review);
      localStorage[streetName] = JSON.stringify(array);
    } else {
      const array = [];
      array.push(coords, review);
      localStorage[streetName] = JSON.stringify(array);
    }
    return review;
  }

  function createReviewNode(review) {
    const li = document.createElement("li");

    li.classList.add("menu__item");
    li.innerHTML = `
      <div>
          <div class="review__name">${review.name}</div>
          <div class="review__company">${review.company}</div>
          <div class="review__date">${review.date}</div>
      </div>
      <div>
          <div>${review.commentary}</div>
      </div>
    `;
    menu.name.value = "";
    menu.company.value = "";
    menu.commentary.value = "";
    return li;
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

  function openMenu(x, y) {
    menu.classList.add("menu--visible");

    menu.style.left =
      x >= document.body.offsetWidth - menu.offsetWidth ? "auto" : x + "px";
    menu.style.right = 0;
    menu.style.top =
      y >= document.body.offsetHeight - menu.offsetHeight ? "auto" : y + "px";
    menu.style.bottom = 0;
  }
}
