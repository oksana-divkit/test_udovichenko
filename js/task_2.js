window.onload = function() {
  renderCitiesList();

  let map;
  let infoWindow;

  initMap();
}

function renderCitiesList() {

  axios.get('https://restcountries.eu/rest/v2/all')
    .then(function(res) {
      let citiesHtml = '';
      const data = res.data;

      for (let i = 0; i < data.length; i++) {
        citiesHtml += '<div class="cities-list__item" \
          data-code="'+ data[i].alpha2Code + '" \
          data-name="' + data[i].name + '"> \
            <div class="cities-list__title">'
              + data[i].name +
            '</div> \
          </div>';
      }

      document.getElementsByClassName('cities-list')[0].innerHTML = citiesHtml;

      initCitiesList();
    });
}

function initMap() {
  const myLatlng = {lat: -25.363, lng: 131.044};

  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 4,
    center: myLatlng
  });

  infoWindow = new google.maps.InfoWindow(
          {content: 'Click the map to get card!', position: myLatlng});
  infoWindow.open(map);

  map.addListener('click', function(e) {
    infoWindow.close();
    infoWindow = new google.maps.InfoWindow({position: e.latLng});
    infoWindow.setContent('...Loading');
    infoWindow.open(map);

    const url='https://secure.geonames.org/countryCodeJSON?lat=' + e.latLng.lat() + '&lng=' + e.latLng.lng() +'&username=ks_rew';

    axios.get(url)
      .then(function(res) {
        let windowContent = res.data.countryName || res.data.status.message;
        infoWindow.setContent(windowContent);

        if (res.data.countryCode) {
          document.querySelector('[data-code$=' + res.data.countryCode + ']').scrollIntoView({block: "center", behavior: "smooth"});
        }
      })
      .catch(err => console.log(err));
  });
}

function initCitiesList() {
  const citiesEl = document.getElementsByClassName('cities-list__item');

  for (let i = 0; i < citiesEl.length; i++) {
    citiesEl[i].addEventListener('click', handleClickCity, false);
  }
}

function handleClickCity() {
    const el = this;
    const cityName = el.getAttribute("data-name");
    el.classList.add('loading');

    infoWindow.close();

    const url='https://secure.geonames.org/searchJSON?q=' + cityName + '&maxRows=1&lang=en&username=ks_rew&style=full';

    axios.get(url)
      .then(function(res) {
        const city = res.data.geonames[0];
        const latLng = new google.maps.LatLng(city.lat, city.lng);

        infoWindow.close();
        infoWindow = new google.maps.InfoWindow({position: latLng});
        infoWindow.setContent(city.countryName);
        infoWindow.open(map);
       
        map.setZoom(4);
        map.panTo(latLng);
        
        el.classList.remove('loading');
      })
      .catch(err => console.log(err));
}