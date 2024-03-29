/* global L:readonly */
import {enableFormsAndFilters, setCoordinates} from './form.js'
import { createCard } from './card.js';
import { getDefauldCoordinates } from './data.js';
import {debounce} from './debounce.js';
import { getData } from './api.js';


const ADS_COUNT = 10;
const LOWER_PRICE_LIMIT = 10000;
const UPPER_PRICE_LIMIT = 50000;

let data = [];

// // Функция выключения элементов формы с фильтрами

const mapFiltersElement = document.querySelector('.map__filters');

const mapFiltersDisabled = () => {
  mapFiltersElement.classList.add('map__filters--disabled');

  for (let i = 0; i < mapFiltersElement.children.length; i++) {
    mapFiltersElement.children[i].setAttribute('disabled', 'disabled');
  }

};

mapFiltersDisabled();

const disableMapFilters = () => {
  mapFiltersDisabled();
};

disableMapFilters();

// Инициализация карты

const map = L.map('map-canvas');

map.setView({
  lat: getDefauldCoordinates().lat,
  lng: getDefauldCoordinates().lng,
}, 12);

const mainPinIcon = L.icon({
  iconUrl: '../img/main-pin.svg',
  iconSize: [52, 52],
  iconAnchor: [26, 52],
});

const mainPinMarker = L.marker(
  {
    lat: getDefauldCoordinates().lat,
    lng: getDefauldCoordinates().lng,
  },
  {
    draggable: true,
    icon: mainPinIcon,
  },
);
mainPinMarker.addTo(map);

L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
).addTo(map);


// Получение адреса главной метки от ее перемещения по карте

mainPinMarker.on('moveend', (evt) => {
  const getNewCoordinates = () => evt.target.getLatLng();
  setCoordinates(getNewCoordinates);
});


//  Функция возвращения карты в начальное состояние

const resetMap = () => {
  map.setView({
    lat: getDefauldCoordinates().lat,
    lng: getDefauldCoordinates().lng,
  }, 12);

  mainPinMarker.setLatLng([getDefauldCoordinates().lat, getDefauldCoordinates().lng]).update();
};

// Фильтрация меток объявлений на карте

const typeElement = mapFiltersElement.querySelector('#housing-type');
const roomsElement = mapFiltersElement.querySelector('#housing-rooms');
const guestsElement = mapFiltersElement.querySelector('#housing-guests');
const priceElement = mapFiltersElement.querySelector('#housing-price');

const checkbyType = (adObject) => (typeElement.value === 'any') ? true : (adObject.offer.type === typeElement.value);
const checkbyRooms = (adObject) => (roomsElement.value === 'any') ? true : (adObject.offer.rooms === Number(roomsElement.value));
const checkbyGuests = (adObject) => (guestsElement.value === 'any') ? true : (adObject.offer.guests <= Number(guestsElement.value));

const checkbyPrice = (adObject) => {
  if (priceElement.value === 'any') {
    return true;
  }
  else if (priceElement.value === 'low') {
    return adObject.offer.price < LOWER_PRICE_LIMIT;
  }
  else if (priceElement.value === 'high') {
    return adObject.offer.price > UPPER_PRICE_LIMIT;
  }
  return (adObject.offer.price > LOWER_PRICE_LIMIT) && (adObject.offer.price < UPPER_PRICE_LIMIT);
};

const wifiElement = mapFiltersElement.querySelector('#filter-wifi');
const dishwasherElement = mapFiltersElement.querySelector('#filter-dishwasher');
const parkingElement = mapFiltersElement.querySelector('#filter-parking');
const washerElement = mapFiltersElement.querySelector('#filter-washer');
const elevatorElement = mapFiltersElement.querySelector('#filter-elevator');
const conditionerElement = mapFiltersElement.querySelector('#filter-conditioner');

const checkByWifi = (adObject) => (!wifiElement.checked) ? true : (adObject.offer.features.includes(wifiElement.value));
const checkByDishwasher = (adObject) => (!dishwasherElement.checked) ? true : (adObject.offer.features.includes(dishwasherElement.value));
const checkByParking = (adObject) => (!parkingElement.checked) ? true : (adObject.offer.features.includes(parkingElement.value));
const checkByWasher = (adObject) => (!washerElement.checked) ? true : (adObject.offer.features.includes(washerElement.value));
const checkByElevator = (adObject) => (!elevatorElement.checked) ? true : (adObject.offer.features.includes(elevatorElement.value));
const checkByConditioner = (adObject) => (!conditionerElement.checked) ? true : (adObject.offer.features.includes(conditionerElement.value));

const checkByFeatures = (adObject) => {
  if (!adObject.offer.features) {
    adObject.offer.features = [];
    return true;
  }
  return (checkByWifi(adObject) && checkByDishwasher(adObject) && checkByParking(adObject) && checkByWasher(adObject) && checkByElevator(adObject) && checkByConditioner(adObject));
};

const checkAllFilters = (adsListElement) => (checkbyType(adsListElement) && checkbyRooms(adsListElement) && checkbyGuests(adsListElement) &&
    checkbyPrice(adsListElement) && checkByFeatures(adsListElement));


// Вывод маркеров объявлений на основе данных сгенерированного массива объявлений

const markers = L.layerGroup();

const setAdsToMap = () => {
  data
    .filter(checkAllFilters)
    .slice(0, ADS_COUNT)
    .forEach((adsListElement) => {
      const icon = L.icon({
        iconUrl: '../img/pin.svg',
        iconSize: [40, 40],
        iconAnchor: [20, 40],
      });

      const marker = L.marker(
        {
          lat: adsListElement.location.lat,
          lng: adsListElement.location.lng,
        },
        {
          icon,
        },
      );
      marker
        .bindPopup(
          createCard(adsListElement),
          {
            keepInView: true,
          },
        );
      markers
        .addLayer(marker)
        .addTo(map);
    });
};

// Включение форм и получение данных после инициализации

const makeInitialization = () => {
  map.whenReady(() => {
    enableFormsAndFilters();
    getData((adsList) => {
      data = adsList;
      setAdsToMap();
    });
  });
};

mapFiltersElement.addEventListener('change', debounce(() => {
  markers.clearLayers();
  setAdsToMap();
}));

export {setAdsToMap, resetMap, makeInitialization};
