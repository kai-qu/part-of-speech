// TODO: remove API key!

var apiBaseURL = "https://od-api.oxforddictionaries.com:443/api/v1/entries/"
var app_id = 'ca4688bd'
var app_key = '7d84e5a55b03a914cc3ad52dcad0dfa5'

var language = 'en'
var word_id = 'Ace'

// After the document loads, when the form is submitted, query the API and display results
$(document).ready(function() {
    $("button").click(function(event) {
	console.log("submit: ", event);

	var query = $( "input:first" ).val();

	console.log("query: ", query);

	var full_url = apiBaseURL + language + '/' + word_id; //.lower()

	$.ajax({
	    url: full_url,
	    type: 'GET',
	    // dataType: 'json',
	    headers: {
		// 'Access-Control-Allow-Origin': "*",
		'app_id': app_id,
		'app_key': app_key
	    },
	    // contentType: 'application/json; charset=utf-8',
	    success: function (result) {
		console.log("success: ", result);
	    },
	    error: function (error) {
		console.log("failure: ", error);
	    }
	});

	// TODO: change the div instead of appending
	// $.getJSON(full_url, function(data) {
	//     $("#search").append(search);

	//     console.log(data);

	//     $("#results").append(JSON.stringify(data));

	//     var index = 1;
	    // var image_url = data_cleaned[1].primaryimageurl;
	    // console.log(image_url);
	    // $("#quotes").append("<img src='" + image_url + "' width=300>");

	// });
    });
});

