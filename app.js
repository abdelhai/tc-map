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
  let {name, phone, hours} = pharmaInfo;
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
                    Landwehrstraße 83, 80336 München
                </td>
            </tr>
            <tr style="width:100%;">
                <td style="width: 10%">
                    <img src="img/0363-telephone.svg"></img>
                </td>
                <td style="width: 80%">
                    ${phone}
                </td>
            </tr>
            <tr style="width:100%;">
                <td style="width: 10%">
                    <img src="img/0803-magnifier.svg"></img>
                </td>
                <td style="width: 80%">
                    Öffnungszeiten: ${hours}
                </td>
            </tr>
        </table>
      </div>

      <table class="bottom-table">
          <tr style="width:100%;">
              <td style="width: 50%;align-content:center">
                  <button onclick="selectOption('delivery')" class="btn" style="margin-right:8px;" type="button">DELIVERY</button>
              </td>
              <td style="width: 50%;align-content:center">
                  <button onclick="selectOption('pickup')" class="btn" style="margin-left:8px;" type="button">PICK UP</button>
              </td>
          </tr>
      </table>
    </div>
`
}

const showCard = (pharmaInfo) => {
  document.getElementById('card-container').innerHTML = createCard(pharmaInfo);
  document.getElementById('card-container').style.display = 'block';
}

const closeCard = () => {
  document.getElementById('card-container').style.display = 'none';
}

const selectOption = (opt) => {
  if (window.TC_PHARMACY === undefined) {
    return
  }

  window.TC_PHARMACY.kind = opt;
  let Android = window.Android || {};
  if (window.Android) {
    Android.pharmaOrder(window.TC_PHARMACY)
  }

  return window.TC_PHARMACY;
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
  map.data.loadGeoJson('stores.json');
  infoWindow = new google.maps.InfoWindow;
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      infoWindow.setPosition(pos);
      infoWindow.setContent('Sie sind hier.');
      infoWindow.open(map);
      map.setCenter(pos);
    });
  }

  const apiKey = 'AIzaSyALb9lFprUdP6ot-Wc-U1QCWvX3PXNgLu0';
//   const infoWindow = new google.maps.InfoWindow();
//   infoWindow.setOptions({pixelOffset: new google.maps.Size(0, -30)});

  // Show the information for a store when its marker is clicked.
  map.data.addListener('click', event => {
    const pharmaInfo = {};
    pharmaInfo.name = event.feature.getProperty('name');
    pharmaInfo.hours = event.feature.getProperty('hours');
    pharmaInfo.phone = event.feature.getProperty('phone');
    pharmaInfo.position = event.feature.getGeometry().get();
    pharmaInfo.id = event.feature.getProperty('id');

    showCard(pharmaInfo)
    window.TC_PHARMACY = pharmaInfo;

    map.setCenter(pharmaInfo.position);
  });

}



