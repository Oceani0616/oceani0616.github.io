--
layout:     secbas
title:      " "
subtitle:   "Per aspera ad astra, per fas et nefas"
date:       2023-05-10 18:37:29
author:     "Oceani Cheng"
Comment:    true
header-img: "img/hzlys_bg.jpg"
tags:
    - Life
    - CUHK
    - Memory 
---

## Congratulations！

You find my secret base. 

Enjoy your Reward Music.

<audio controls>
  <source src="/assets/music/Aliosha_Noodle Reunion.mp3" type="audio/mp3">
</audio>




**Who are u?**

<p id="browser-info"></p>
<script>
var browserInfo = "Your Browser is: " + navigator.userAgent
var DeviceInfo = "Your Device is: " + navigator.platform
document.getElementById("browser-info").textContent = browserInfo
</script>

**where r u?**


<p id="user-ip"></p>
<p id="user-location"></p>
<script>
function getUserLocation() {
  var locationAPI = "https://ipapi.co/" + userIP + "/json/";
  fetch(locationAPI)
    .then(response => response.json())
    .then(data => {
      var userLocation = "Location: " + data.city + ", " + data.region + ", " + data.country_name;
      document.getElementById("user-location").textContent = userLocation;
    })
    .catch(error => console.log(error));
}
</script>
