function displayCard() {
  return sanitizeHTML`
    <div id="pharmacy-details" class="pharmacy-div">
      <div class="pharmacy-card">
        <table style="width:100%;">
            <tr style="width:100%;">
                <td style="width: 95%">
                    <b>{name}</b>
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
                    {phone}
                </td>
            </tr>
            <tr style="width:100%;">
                <td style="width: 10%">
                    <img src="img/0803-magnifier.svg"></img>
                </td>
                <td style="width: 80%">
                    Öffnungszeiten: {hours}
                </td>
            </tr>
        </table>
      </div>

      <table class="bottom-table">
          <tr style="width:100%;">
              <td style="width: 50%;align-content:center">
                  <button class="btn" style="margin-right:8px;" type="button">DELIVERY</button>
              </td>
              <td style="width: 50%;align-content:center">
                  <button class="btn" style="margin-left:8px;" type="button">PICK UP</button>
              </td>
          </tr>
      </table>
    </div>
`
}


const  sanitizeHTML = (strings) => {
  const entities = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'};
  let result = strings[0];
  return result;
  for (let i = 1; i < arguments.length; i++) {
    result += String(arguments[i]).replace(/[&<>'"]/g, (char) => {
      return entities[char];
    });
    result += strings[i];
  }
  return result;
}

function setapoid(id) {
  window.APO_ID = id;
  console.log(window.APO_ID);
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

  // Define the custom marker icons, using the store's "category".
  // map.data.setStyle(feature => {
  //   return {
  //     icon: {
  //       url: `img/icons8-marker-80.png`,
  //       scaledSize: new google.maps.Size(40, 40)
  //     }
  //   };
  // });
  // console.log(map.data)

  const apiKey = 'AIzaSyALb9lFprUdP6ot-Wc-U1QCWvX3PXNgLu0';
  const infoWindow = new google.maps.InfoWindow();
  infoWindow.setOptions({pixelOffset: new google.maps.Size(0, -30)});

  // Show the information for a store when its marker is clicked.
  map.data.addListener('click', event => {
    const category = event.feature.getProperty('category');
    const name = event.feature.getProperty('name');
    const description = event.feature.getProperty('description');
    const hours = event.feature.getProperty('hours');
    const phone = event.feature.getProperty('phone');
    const position = event.feature.getGeometry().get();
    const id = event.feature.getProperty('id');

    // const content = sanitizeHTML`
    //     <h2>${name}</h2><p>${description}</p>
    //     <p><b>Open:</b> ${hours}<br/><b>Phone:</b> ${phone}</p>
    //     <p>
    //     <a href="#" class="cta-btn" onclick="setapoid(${id})" >Abholen</a>
    //     <a href="#" class="cta-btn" onclick="setapoid(${id})" >Liefern lassen</a>
    //     </p>
    // `;

    // infoWindow.setContent(content);
    // infoWindow.setPosition(position);
    document.getElementById('card-container').innerHTML = displayCard();
    document.getElementById('card-container').style.display = 'block';

    map.setCenter(position);
    //infoWindow.open(map);
  });

}

const closeCard = () => {
  document.getElementById('card-container').style.display = 'none';
}

