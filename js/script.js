async function getLocation(latitude, longitude){
    $('#warning').addClass("d-none");
    var weatherApiRequest = "https://api.open-meteo.com/v1/forecast?latitude="+latitude+"&longitude="+longitude+"&hourly=temperature_2m,relativehumidity_2m,apparent_temperature,weathercode&timezone=auto";
    var geoApiRequest = "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude="+latitude+"&longitude="+longitude+"&localityLanguage=en";
    
    try{
        var weatherCodeList = await fetch("./weather-codes.json").then(w => w.json());
        var apiResponse = await fetch(weatherApiRequest);
        var apiReverseGeo = await fetch(geoApiRequest).then(w => w.json());
        var apiResponseJson = await apiResponse.json();
    }catch(e){
        $('#warning2').removeClass("d-none");
    }

    let data = apiResponseJson.hourly;
    let initialCard = null;
    let timeNow = new Date();
    let cards = new Array();

    data.time.forEach((h,i) => {
        let time = data.time[i];
        let temperature = data.temperature_2m[i];                            
        let humidity = data.relativehumidity_2m[i];                            
        let apparentTemperature = data.apparent_temperature[i];                            
        let weathercode = data.weathercode[i]
        
        time = time.split("T");
        if(timeNow.getHours() == time[1].substring(0,2) && initialCard == null){
            initialCard = i;
        }
        cards[i] = `
            <div class="card">
                <div class="card-body">
                    <h6>${time[0]}</h6>
                    <h6>${time[1]}</h6><br>
                    <h2>${Math.round(temperature)} C°</h2><br>
                    Apparent temperature: ${Math.round(apparentTemperature)} C°<br>
                    Humidity: ${humidity}%<br>
                    ${weatherCodeList[weathercode]}
                </div>
            </div>
                    
        `;
    });

    $("#weather-cards").html(cards.join(""));

    $('#weather-cards').slick({
        centerMode: true,
        infinite: true,
        centerPadding: '30px',
        slidesToShow: 3,
        slidesToScroll: 3,
        initialSlide: initialCard,
        prevArrow: $('.slick-prev'),
        nextArrow: $('.slick-next'),
        responsive: [{
            breakpoint: 1080,
            settings: {
                slidesToShow: 2,
                slidesToScroll: 3
            }
        },
        {
            breakpoint: 740,
            settings: {
                slidesToShow: 1,
                slidesToScroll: 3
            }
        }]
    });
    
    $("#weather-cards-row").removeClass("d-none");
    $("#location-info").removeClass("d-none");
    $("#location-info").html(`
        ${apiReverseGeo.principalSubdivision}/${apiReverseGeo.city}
        <i class="qtip tip-top" data-tip="The location accuracy is based on your browser's geolocation!">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle" viewBox="0 0 16 16"> <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/> <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/> </svg> 
        </i>
    `);
}
function getWeather(){
    if (document.cookie.length > 0) {
        let cookies = document.cookie.split(";");

        let latitude = cookies[0].split("=")[1];
        let longitude = cookies[1].split("=")[1];
        getLocation(latitude, longitude);
    }else{
        navigator.geolocation.getCurrentPosition(async position =>{
            let latitude = position.coords.latitude.toFixed(2);
            let longitude = position.coords.longitude.toFixed(2);
            
            const d = new Date();
            const daysExpire = 2;
            d.setTime(d.getTime() + (daysExpire * 24 * 60 * 60 * 1000));
            document.cookie = "latitude=" + latitude + ";expires=" + d.toUTCString() + ";SameSite=None;secure;path=/";
            document.cookie = "longitude=" + longitude + ";expires=" + d.toUTCString() + ";SameSite=None;secure;path=/";

            getLocation(latitude, longitude);
        });
    }
}