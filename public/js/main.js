const tweetUl = document.querySelector('.tweet');
const mapDiv = document.querySelector('.map');
const up = document.querySelector('.up');

// SHOW MAP FUNCTION
var mymap = null;

function showMap(key, center, zoom) {
    if (mymap !== undefined && mymap !== null) {
        mymap.remove(); // should remove the map from UI and clean the inner children of DOM element
        console.log(mymap); // nothing should actually happen to the value of mymap
    }
    // MAP INIT
    L.mapquest.key = key;
    // 'map' refers to a <div> element with the ID map
    mymap = L.mapquest.map('map', {
        center: center,
        zoom: +zoom,
        layers: L.mapquest.tileLayer('map')
    });
    // Go Up
    goOnTop();
};

// SOCKET IO
const socket = io();
// ON CONNECT EVENT
socket.on('connect', () => {
    console.log('Connected.');
});
// ON TWEET EVENT APPEND TWEETS INTO THE DOM
socket.on('tweet', tweet => {
    // console.log(tweet);
    // Create li element
    let li = document.createElement('li');
    li.innerHTML = `
    <div class='tw-header'  style='background:url(${tweet.user.profile_background_image_url_https});background-repeat: no-repeat;background-size: cover; background-position: center;'>
    <div class='tw-date'> 🕜 <small>${tweet.created_at.substring(0, 19)}</small></div>
    
    <div class='tw-img'><img src='${tweet.user.profile_image_url}' /></div>
    </div>
    <div class='tw-card'>

    <div class='tw-link'>🔗: <a href='https://twitter.com/${tweet.user.screen_name}' target='blank'>${tweet.user.screen_name}</a>
    </div>

    <div class='tw-user'>Username: ${tweet.user.name} <small> ☑️ ${tweet.user.verified}</small></div>

    <div class='tw-desc'>
    <details>
    <summary>ℹ️nfo</summary>
    ${tweet.user.description === null ? '🃏' : tweet.user.description}
    </details> 
    </div>

    <div class='tw-show-map' onclick="showMap('${key}', ['${tweet.place.bounding_box.coordinates[0][0][1]}', '${tweet.place.bounding_box.coordinates[0][0][0]}'], '13')"><small>⬆️ Show Origin Place </small></div>
    
    <div class='tw-country'>Country: <small> ${tweet.place.country} </small></div>
    <div class='tw-country-code'>Country Code: <small> ${tweet.place.country_code} </small></div>

    <div class='tw-place-full'>Place Full Name : <small> ${tweet.place.full_name} </small></div>

    <div class='tw-place-name'>Place Name : <small> ${tweet.place.name} </small></div>

    <div class='tw-place-type'>Place Type : <small> ${tweet.place.place_type} </small></div>

    <div class='tw-location'>Location: ${tweet.user.location === null ? '' : tweet.user.location }</div>
    
    <div class='tw-source'>Source: ${tweet.source}</div>
   
    <div class='tw-url'><a href='${tweet.user.url === null ? '' : tweet.user.url}' target='blank'>${tweet.user.url === null ? '' : tweet.user.url}</a></div>
    
    <div class='tw-followers'>Followers: ${tweet.user.followers_count}</div>
    <div class='tw-followers'>Friends: ${tweet.user.friends_count}</div>
    
    <div class='tw-text'>💬: ${tweet.text}</div>
   
    <div class='tw-media-url'><img src="${tweet.entities.media !== undefined && tweet.entities.media[0].type === 'photo' ? tweet.entities.media[0].media_url : '/imgs/twbg.png' }"></div>

    </div>
    `;

    // Append
    tweetUl.prepend(li);
});
// ON MAP COORDINATES
socket.on('latlng', latLngArr => {
    // Run show map
    showMap(key, latLngArr, '7');
})

// GO ON PAGE TOP
// Check page scoll top
const onTopFunction = () => {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        up.style.display = 'block';
    } else {
        up.style.display = 'none';
    }
};
// ON SCROLL EVENT RUN ON TOP FUNCTION
window.onscroll = () => onTopFunction();

// GO ON TOP FUNCTION
const goOnTop = () => {
    const options = { top: 0, left: 0, behavior: 'smooth' };
    // Scroll on top
    window.scrollTo(options);
};
// ON CLICK EVENT GO UP 
up.onclick = () => {
    goOnTop();
};