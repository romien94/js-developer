ymaps.ready(init);

function init() {
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

  // renderLocalStorage();

  const customItemContentLayout = ymaps.templateLayoutFactory.createClass(
    "<div class=ballon_body>{{ properties.balloonContentBody || raw }}</div>"
  );

  const clusterer = new ymaps.Clusterer({
    clusterDisableClickZoom: true,
    clusterOpenBalloonOnClick: true,
    // Устанавливаем стандартный макет балуна кластера "Карусель".
    clusterBalloonContentLayout: "cluster#balloonCarousel",
    // Устанавливаем собственный макет.
    clusterBalloonItemContentLayout: customItemContentLayout,
    // Устанавливаем режим открытия балуна.
    // В данном примере балун никогда не будет открываться в режиме панели.
    clusterBalloonPanelMaxMapArea: 0,
    // Устанавливаем размеры макета контента балуна (в пикселях).
    clusterBalloonContentLayoutWidth: 200,
    clusterBalloonContentLayoutHeight: 130,
    // Устанавливаем максимальное количество элементов в нижней панели на одной странице
    clusterBalloonPagerSize: 5,
    // Настройка внешнего вида нижней панели.
    // Режим marker рекомендуется использовать с небольшим количеством элементов.
    // clusterBalloonPagerType: 'marker',
    // Можно отключить зацикливание списка при навигации при помощи боковых стрелок.
    // clusterBalloonCycling: false,
    // Можно отключить отображение меню навигации.
    // clusterBalloonPagerVisible: false
  });

  const placemarks = [];
  renderLocalStorage();

  function renderLocalStorage() {
    for (const item in localStorage) {
      if (typeof localStorage[item] !== "string") continue;
      const [coords, ...reviews] = JSON.parse(localStorage[item]);
      for (const review of reviews) {
        const placemark = new ymaps.Placemark(coords, {
          balloonContentBody: createReviewNode(review),
        });
        placemarks.push(placemark);
      }
    }
  }

  clusterer.add(placemarks);
  map.geoObjects.add(clusterer);

  function createReviewNode(review) {
    const node = [
      '<div class="slider__item">',
      '<div class="slider__content">',
      `<span class="slider__company">${review.company}</span>`,
      `<a href="" class="slider__address">${review.address}</a>`,
      `<span class="slider__commentary">${review.commentary}</span>`,
      "</div>",
      `<span class="slider__date">${review.date}</span>`,
      "</div>",
    ].join("");
    return node;
  }

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
    const link = document.querySelector(".slider__address");

    link.addEventListener("click", (e) => {
      e.preventDefault();
      const address = e.target.textContent;
      const menuAddress = document.querySelector(".menu__address");
      const x = e.clientX;
      const y = e.clientY;

      openMenu(x, y);
      map.balloon.close();
      menuAddress.textContent = address;
      menuReviews.innerText = "";
      const arr = JSON.parse(localStorage[address]).slice(1);
      const fragment = document.createDocumentFragment();
      for (const elem of arr) {
        const review = createReviewLi(elem);
        fragment.appendChild(review);
      }
      menuReviews.appendChild(fragment);
    });
  });

  submitButton.addEventListener("click", (e) => {
    e.preventDefault();
    if (checkIfContaintsBlankElement(menuReviews)) menuReviews.removeChild(menuBlank);
    createReview()
      .then((review) => {
        const address = review.address;
        const coords = JSON.parse(localStorage[address])[0];
        const node = createReviewLi(review);
        menuReviews.appendChild(node);
        return { review, address, coords };
      })
      .then(({ review, address, coords }) => {
        const placemark = new ymaps.Placemark(coords, {
          balloonContentBody: createReviewNode(review),
        });
        placemarks.push(placemark);
        clusterer.add(placemark);
      });
    renderLocalStorage();
  });

  closeButton.addEventListener("click", (e) => {
    const address = menu.querySelector(".menu__address").textContent;
    menu.classList.remove("menu--visible");
  });

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

  function createReviewLi(review) {
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