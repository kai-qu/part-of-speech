// TODO: remove API key!
// NB: You can hit the API just by visiting this page in the browser:
// https://api.harvardartmuseums.org/object?apikey=a5a44240-dac8-11e8-ad47-756c360774b7&title=rabbit

var apiEndpointBaseURL = "https://api.harvardartmuseums.org/object";

// After the document loads, when the form is submitted, query the Harvard art museum API
// to find all of the objects that have a title similar to that query
// and display their JSON and images
$(document).ready(function() {
    $("button").click(function(event) {
	console.log("submit: ", event);

	var query = $( "input:first" ).val();

	console.log("query: ", query);

	var queryString = $.param({
	    apikey: "a5a44240-dac8-11e8-ad47-756c360774b7",
	    title: query,
	    fields: "title,primaryimageurl"
	});
	
	console.log("query string", queryString);

	// TODO: change the div instead of appending
	$.getJSON(apiEndpointBaseURL + "?" + queryString, function(data) {
	    $("#search").append(search);

	    console.log(data);
	    var data_cleaned = data.records;
	    $("#results").append(JSON.stringify(data_cleaned));

	    var index = 1;
	    var image_url = data_cleaned[1].primaryimageurl;
	    console.log(image_url);
	    $("#images").append("<img src='" + image_url + "' width=300>");
	});
    });
});

