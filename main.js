/**
 * Author: Vishal Bhosle
 */

const apiKey = '62247117f01649aea8bf7b6e1a04f4d9';
const baseUrl = "https://newsapi.org/v2/";

const weatherApiKey = "bde2ff81c9664840b15121909191801";
const weatherBaseUrl = "https://api.apixu.com/v1/";

const countryApiUrl = 'https://restcountries.eu/rest/v2/';

const holidayApiKey = '71099430-1835-4185-aced-bfbd78c1b9bd';

const geopluginApiBaseUrl = "http://www.geoplugin.net/";

//https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyBtiHj-_QDVOV0H8eexU-7W-p2AqTzq_N0&latlng=19.199935,73.17955549999999&sensor=true
const googleMaps = "https://maps.googleapis.com/maps/api/geocode/json?latlng=19.199935,73.17955549999999&sensor=true";
const googleMapsKey = 'AIzaSyBtiHj-_QDVOV0H8eexU-7W-p2AqTzq_N0';

var country = "";
var category = "general";
var city = "";

$(document).ready(() => {

    let success = 0;

    getLocationAndAddress();
    
    $.getJSON(geopluginApiBaseUrl + 'json.gp?jsoncallback=?', function (data) {

        //console.log(data);
        city = data.geoplugin_city;
        country = data.geoplugin_countryCode;
        success = 1;
        getCountries();
        getTemperature();
        displayCategory();

    });
    if (success == 0) {

        city = 'new delhi';
        country = 'IN';

        getCountries();
        getTemperature();
        displayCategory();
    }

    setDate();

    $("#city-name").keyup(function () {
        let city = $("#city-name").val();
        getTemperature(city);
    });

    $("#countries").change(() => {
        country = $('#countries').val();
        displayCategory();
    });

    $('#query').keyup(function () {
        let q = $('#query').val();
        if(q) {

            let page = 1;

            $.get(baseUrl + 'everything', { apiKey: apiKey, q: q , page: page}, (res) => {
                $("#news-feed").text("");
                displayArticles(res.articles);
            })

            /*$(window).scroll(function () {
                if ($(this).scrollTop() >= $('body').height() - $(window).height()) {
                    page += 1;
                    $.get(baseUrl + 'everything', { apiKey: apiKey, q: q, page: page }, (res) => {
                        displayArticles(res.articles);
                    })
                }
            })*/

        }
        else {
            displayCategory(category);            
        }
    });

})

function getLocationAndAddress() {
    if((navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);  
    }
}

function showPosition(position) {
    let lat = position.coords.latitude;
    let lon = position.coords.longitude;
    $.get(googleMaps, { key: googleMapsKey,  latlng: lat + ',' + lon}, (res) => {
        alert(JSON.stringify(res));
    })
}

function getCountries() {
    $.get(countryApiUrl + 'all', (res) => {
        res.forEach((c) => {
            $("#countries")
                .append(`<option value="${c.alpha2Code}" ${(country == c.alpha2Code) ? 'selected' : ''}>${c.name}</option>`);
        })
    })
}

function setDate() {
    let date = new Date();
    $('#date').text(date.toDateString());
}

function getTemperature(cityName = city) {
    city = cityName;
    $.get(weatherBaseUrl + 'current.json', { key: weatherApiKey, q: cityName }, (res) => {
        $("#temp").text(res.current.temp_c + " °C");
        $("#msg").text(`${res.location.country}, ${res.location.region}, ${res.location.name}`);
        $("#condition").text(res.current.condition.text);
        $('#weather-icon').attr("src", "http:" + res.current.condition.icon);
    })
}

function displayCategory(categoryName = category) {
    //Set country flag, temprature and conversion
    $.get(countryApiUrl + 'alpha/' + country, (res) => {
        $("#nativeName").text(res.nativeName);
        $('#flag').attr('src', res.flag);
        city = res.capital;
        getTemperature();
        
        //Conversion rate
        $.get("https://api.exchangeratesapi.io/latest",
          {
            base: "USD",
            symbols: res.currencies[0].code
          },
          (data) => {
              $('#currency').text(`Conversion Rate : ${res.currencies[0].symbol} ${data.rates[res.currencies[0].code].toFixed(3)} (${data.base} vs ${res.currencies[0].code})`);
          }
        )
        .fail(() => {
            $("#currency").text("");
        });
    })

    category = categoryName;
    $("#news-feed").text("");
    $.get(baseUrl + 'top-headlines', { apiKey: apiKey, category: category, country: country }, (res) => {
        if (res.articles.length)
            displayArticles(res.articles);
        else
            $("#news-feed").text("No News Available !!");
    })
}

function displayArticles(articles) {
    articles.forEach(article => {
        $('#news-feed').append(card(article));
    });
}

function card(article) {
    let date = new Date(article.publishedAt);
    return `<div class="card mt-4" style="border-radius: 1rem; cursor:pointer" onclick="window.open('${article.url}')">
            <div class="row">
                <div class="col-sm-8">
                    <img class="card-img-top d-md-none d-xs-block" style="border-radius: 1rem 1rem 0rem 0rem; max-height: 16rem;" src="${article.urlToImage}" alt="">
                    <div class="card-body">
                        <h5 class="card-title">${article.title}</h5>
                        <h6 class="card-subtitle mb-2 text-muted">${article.author ? article.author : "Anonymous author"} @
                            ${article.source.name}</h6>
                        <p class="card-text">${article.description}</p>
                        <p class="card-text"><small class="text-muted">${date.toDateString()}</small></p>
                    </div>
                </div>
                <div class="col-sm-4">
                    <img class="card-img d-none d-md-block"  style="border-radius: 0rem 1rem 1rem 0rem; max-height: 16rem;" src="${article.urlToImage}" height="100%" alt="">
                </div>
            </div>
        </div>`;
}
