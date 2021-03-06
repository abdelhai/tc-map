window.TC_PHARMACY;
function sanitizeHTML(strings) {
  const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  let result = strings[0];
  for (let i = 1; i < arguments.length; i++) {
    result += String(arguments[i]).replace(/[&<>'"]/g, (char) => {
      return entities[char];
    });
    result += strings[i];
  }
  return result;
}

function createCard(pharmaInfo) {
  let { name, phone, hours, address, addressLink, reservation, delivery} = pharmaInfo;
  return sanitizeHTML`
    <div id="pharmacy-details" class="pharmacy-div">
      <div class="pharmacy-card">
        <table style="width:100%;">
            <tr style="width:100%;">
                <td style="width: 95%">
                    <b>${name}</b>
                </td>
                <td style="width: 5%">
                    <img id="close-details" src="img/0822-cross2.svg" alt="Schließen" onclick="closeCard()"></img>
                </td>
            </tr>
        </table>
        <br>
        <table style="width:100%;">
            <tr style="width:100%;">
                <td style="width: 10%">
                    <img src="img/0379-map-marker.svg"></img>
                </td>
                <td style="width: 80%">
                <a href="${addressLink}" target="_blank">${address}</a>
                </td>
            </tr>
            <tr style="width:100%;">
                <td style="width: 10%">
                    <img src="img/0363-telephone.svg"></img>
                </td>
                <td style="width: 80%">
                <a href="tel:${phone}">${phone}</a>
                </td>
            </tr>
            <tr style="width:100%;">
                <td style="width: 10%">
                    <img src="img/0745-clock3.svg"></img>
                </td>
                <td style="width: 80%">
                    <pre>${hours}</pre>
                </td>
            </tr>
        </table>
      </div>

      <div class="bottom-table" style="${document.location.search.indexOf('browsing=true') === -1 ? '' : 'display:none'}">
          <div style="width:100%;display:flex;flex-direction:row">
              <div class="btn-wrapper" style="display:${reservation ? '' : 'none'};">
                  <button onclick="selectOption('reservation')" class="btn" style="margin-right:8px;" type="button">RESERVIEREN</button>

              </div>
              <div class="btn-wrapper" style="display:${delivery ? '' : 'none'};">
                  <button onclick="selectOption('delivery')" class="btn" style="margin-left:8px;" type="button" >DELIVERY</button>
              </div>
          </div>
      </div>
    </div>
`
}

const timeToString = time => {
  return `${time.getFullYear()}-${time.getMonth()+1}-${time.getDate()}%20${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;
}

const pharmaSearch = (map, limit = 20) => {
  let { lat, lng } = map.getCenter().toJSON();
  let now = new Date();
  let startDT = timeToString(now);
  now.setHours(now.getHours() + 2); // add 2 hours
  let endDT = timeToString(now);
  let url = window.TC_APO_URL;
  url = `${url}?search[limit]=${limit}&search[offset]=0&search[sort]=1&search[location][geographicalPoint][latitude]=${lat}&search[location][geographicalPoint][longitude]=${lng}&search[radius]=10`;
  url += '&search[membersOnly]=true';

  if (document.getElementById('emergency').checked) {
    map.data.forEach(feature => map.data.remove(feature));
    url += `&search[startDateTime]=${startDT}&search[endDateTime]=${endDT}`;
    url += '&notdienst=1';
  }
  if (document.location.search.indexOf('browsing=true') != -1) {
    url += '&search[services]=98';
  }

  if (document.getElementById('delivery').checked) {
    map.data.forEach(feature => map.data.remove(feature));
    url += '&search[services]=99'; // TODO: fix me (Waiting for Thomas to reply)
  }

  map.data.loadGeoJson(url)
  map.data.setStyle(feature => {
    return {
      icon: {
        url: `img/icon_pharmacy.png`,
      }
    };
  });
}

const showCard = (pharmaInfo) => {
  document.getElementById('card-container').innerHTML = createCard(pharmaInfo);
  document.getElementById('card-container').style.display = 'block';
}

const closeCard = () => {
  document.getElementById('card-container').style.display = 'none';
}

const selectOption = (opt) => {
  console.log(TC_PHARMACY)
  if (window.TC_PHARMACY === undefined) {
    return
  }

  window.TC_PHARMACY.kind = opt;
  if (window.Android) {
    if (window.TC_PHARMACY.kind === 'delivery') {
      window.Android.deliverPrescription(window.TC_PHARMACY.id);
      return
    }

    window.Android.reservePrescription(window.TC_PHARMACY.id);
  }

  return window.TC_PHARMACY;
}

const hideKeyboard = () => {
  document.activeElement.blur();
}


const handleMapInteractions = () => {
  closeCard();
  hideKeyboard();
}

const clearMap = () => {

}
function initMap() {

  // Create the map.
  const map = new google.maps.Map(document.getElementsByClassName('map')[0], {
    zoom: 14,
    center: { lat: 48.1351, lng: 11.5820 },
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false
  });

  // Load the stores GeoJSON onto the map.
  infoWindow = new google.maps.InfoWindow;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      map.setCenter(pos);
      map.panTo(pos);
      var marker = new google.maps.Marker({
        position: map.getCenter(),
        icon: 'img/here-marker.png',
        map: map
      });
      infoWindow.setPosition(map.getCenter());
      infoWindow.setContent('Sie sind hier.');
      infoWindow.open(map);
      pharmaSearch(map);


    });
  }

  const apiKey = 'AIzaSyALb9lFprUdP6ot-Wc-U1QCWvX3PXNgLu0';

  // Show the information for a store when its marker is clicked.
  map.data.addListener('click', event => {
    const pharmaInfo = {};
    pharmaInfo.name = event.feature.getProperty('name');
    pharmaInfo.hours = event.feature.getProperty('hours');
    pharmaInfo.phone = event.feature.getProperty('phone');
    pharmaInfo.address = event.feature.getProperty('address');
    pharmaInfo.delivery = event.feature.getProperty('delivery');
    pharmaInfo.reservation = event.feature.getProperty('reservation');
    pharmaInfo.addressLink = 'https://www.google.de/maps/dir//' + pharmaInfo.address.replace(/\s/g, '+')
    pharmaInfo.position = event.feature.getGeometry().get();
    pharmaInfo.id = event.feature.getProperty('id');

    showCard(pharmaInfo)
    window.TC_PHARMACY = pharmaInfo;
    map.setCenter(pharmaInfo.position);
    map.panTo(pharmaInfo.position)
  });

  map.addListener('dragend', () => {
    let idleListener = map.addListener('idle', function () {
      google.maps.event.removeListener(idleListener);
      pharmaSearch(map);
    });
  });


  map.addListener('click', handleMapInteractions, false)
  map.addListener('dragstart', handleMapInteractions, false)

  let autocomplete = new google.maps.places.Autocomplete(document.getElementById('query'));
  autocomplete.bindTo('bounds', map);
  autocomplete.setTypes(['geocode']);

  autocomplete.addListener('place_changed', function () {
    var marker = new google.maps.Marker({
      map: map,
      icon: 'img/here-marker.png',
    });
    var place = autocomplete.getPlace();

    // If the place has a geometry, then present it on a map.
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(14);
    }
    marker.setPosition(place.geometry.location);
    marker.setVisible(true);
    pharmaSearch(map)
  });

  document.getElementById('emergency').addEventListener('click', event => {
    pharmaSearch(map);
  })
  document.getElementById('delivery').addEventListener('click', event => {
    pharmaSearch(map);
  })

}



