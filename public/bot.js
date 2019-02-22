// TODO: refactor callback structure of the code and add types

function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}


function randElem(arr) {
    var randIndex = Math.floor(Math.random() * arr.length);
    return arr[randIndex];
}

document.addEventListener("DOMContentLoaded", function() {
    var client_id = getRandomArbitrary(0, 100000000000).toString();

    var socket  = io.connect(); // connect to server

    console.log("trying to join");
    socket.emit('join', {});

    // (*)
    socket.on('word_result', function(data) {
	console.log('got result: ', data.sentence);

	if (data.client_id === client_id) {
	    if (data.sentence === undefined) {
		return generateGenericSuggestion();
	    } 

	    return showBotSuggestion(data.sentence);
	}
    });

    // -------------------

    var apiEndpointBaseURL = "https://api.harvardartmuseums.org/object";

    var botui = new BotUI('bot');

    // Stores all of the things a user has said (a list of lists of words, where a word is a string w/ no spaces)
    var all_text = [];

    botui.message
	.add("talk to me if you get stuck")
	.then(function() { 
	    return botui.message.add({ delay: 1000, content:"i'm listening" }); 
	})
	.then(mainLoop); 

    function mainLoop() {
	// $(".botui-actions-container").get(0).scrollIntoView();

	// Generate input text box
	showUserInputBox()
	    .then(function(res) {
		// quill.focus();

		var user_string = res.value;

		// Store most recent response, then figure out bot response
		// as a function of all responses
		// Strip punctuation and tokenize
		// TODO: store the original if you want to do callbacks

		addToTextEditor(user_string);
		var user_string2 = user_string.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"");
		// note: DON'T remove "'", contraction search actually works
		var words = user_string2.split(' ');
		all_text.push(words);
		console.log("all text: ", all_text);

		return words;
	    })
	    .then(generateSuggestion)
	    .then(mainLoop);

	// $(".botui-actions-container").get(0).scrollIntoView();
    }

    // Display the UI text box for the user to type in.
    function showUserInputBox() {
	return botui.action.text({
	    delay: 0, // 1000
	    action: {
		placeholder: "say something…"
	    }
	})
    }

    function addToTextEditor(string) {  
	var terminals = ["!", "?", "."];
	var str = string.toString();
	var lastChar = str.slice(-1);

	// add space after a finished sentence and newline after an unfinished sentence
	var separator = terminals.includes(lastChar) ? " " : "\n";
	quill.insertText(quill.getLength() - 1, str + separator);
    }

    // Display the bot suggestion in the chat box.
    function showBotSuggestion(bot_response) {
	console.log("resp" + bot_response);

	return botui.message
	    .add({
		// loading: true,
		delay: 0, // 1000
		content: bot_response
	    });
    }

    // Generate a generic suggestion not really based on any context.
    // Used as a fallback if querying other sources fails.
    function generateGenericSuggestion() {
	// TODO: template responses using user input and keywords?
	// TODO: analyze response for "__" (e.g. blanks to fill in)
	var responses = ["[leans forward]",
			 "[glances to the side]",
			 "[shakes head]",
			 "[nods]",
			 "[blinks]",
			 "tell me more",
			 "how does that make you feel?",
			 "but what about the opposite?",
			 "make it more intense",
			 "what would it be in an alternate universe?",
			 "try riffing",
			 "hmm",
			 "go on",
			 "not sure what to make of that",
			 "what do you mean?",
			 "use an old idea",
			 "what would your closest friend do?",
			 "only one element of each kind",
			 "what to increase? what to reduce?",
			 "are there sections? consider transitions",
			 "try faking it!",
			 "honour thy error as a hidden intention",
			 "ask your body",
			 "work at a different speed",
			 "what's interesting about the relationships here?",
			 "try a timeskip",
			 "don't stress one thing more than another",
			 "put that thing down, flip it, and reverse it",
			 "first say it out loud in three different ways",
			 "look, don't think too hard about it",
			 "just write",
			 "i mean, what would Sontag do?",
			 "i mean, what would Joyce do?",
			 "i mean, what would God do?",
			 "i mean, what would Nabokov do?",
			 "i mean, what would Camus do?",
			 "imagine you were a writer for the Onion",
			 "when in doubt try parody",
			 "when in doubt try satire",
			 "when in doubt try pastiche",
			 "when in doubt try metaphor",
			 "when in doubt try simile",
			 "is that figurative?",
			 "do you mean that literally?",
			 "try acting it out",
			 "wow",
			 "lol",
			 "omg",
			 "lmao",
			 "wtf",
			 "haha",
			 "brb",
			 "whoa",
			 "no way",
			 "cool",
			 "okay",
			 "right",
			 "...",
			 "🤔",
			 "🤔",
			 "👀",
			 "👀",
			 "🤠",
			 "🤠",
			 "🤖",
			 "🤖",
			 "💅",
			 "💅"
			];

	return showBotSuggestion(randElem(responses));
    }

    // Generates the search terms based on the responses of the users so far.
    // So far just returns an array with a random word from the most recent response.
    // TODO: Fuzzy search
    // TODO: Remove common meaningless words (e.g., "the", "of")
    function generateSearchTerms(words) { // use all_text
	var fallback = "you";
	var boring_words = ["the", "of", "and", "the", "a", "an", "i"];
	var ok_words = words.filter(word => !boring_words.includes(word.toLowerCase()));

	if (bad(ok_words)) {
	    return [fallback];
	}

	return [randElem(ok_words)];
    }

    // Generates and shows the bot suggestion.
    // Contains actual logic for generating the suggestion (NLP... whatever)
    // as well as the UI update (in a callback, since generating the suggestion is async).
    // Uses most recent response, then all responses (already tokenized) for generating.
    function generateSuggestion(words) { // use all_text
	console.log("most recent human response: ", words);

	// choose whether to return image or language
	var choice = Math.random();

	if (choice < 0.65) {
	    var word = generateSearchTerms(words)[0];
	    socket.emit('lookup', { word: word, client_id: client_id });

	    // short-circuits to event listener marked with (*) for the dictionary lookup

	    // TODO put this back in
	    // return queryGoodreads(generateSearchTerms(words));
	} else {
	    // TODO pull this out
	    var fallback = ["person"];
	    var boring_words = ["the", "of", "and", "the", "a", "an", "i"];
	    var ok_words = words.filter(word => !boring_words.includes(word.toLowerCase()));

	    if (bad(ok_words)) {
		ok_words = fallback;
	    }

	    return queryImage(ok_words);
	}
    }

    // ------- Code related specifically to fetching images ---------

    function bad(arr) {
	return arr === undefined || arr.length == 0;
    }

    function queryImage(words) {
	console.log("querying image with phrase: ", words);
	
	var queryString = $.param({
	    apikey: "YOUR_API_KEY_HERE",
	    title: words.join(" "),
	    fields: "title,primaryimageurl"
	});
	
	console.log("query string: ", queryString);

	$.getJSON(apiEndpointBaseURL + "?" + queryString, function(data) {
	    console.log("image query data: ", data);
	    
	    if (bad(data.records)) { // could also check for error 400
		return generateGenericSuggestion(); // is this supposed to be called?
	    }

	    // Could query for more records; by default I get 10
	    var obj = randElem(data.records);

	    // check non-existence of fields
	    if (!("title" in obj) || !("primaryimageurl" in obj)) {
		return generateGenericSuggestion();
	    }

	    var image_title = obj.title;
	    var image_url = obj.primaryimageurl + "?width=350";
	    var image_markdown = '[![' + image_title + '](' + image_url + ')](' + obj.primaryimageurl + ')^';
	    console.log("image url: ", image_url);

	    return botui.message
		.add({
		    content: image_markdown
		    // https://nrs.harvard.edu/urn-3:HUAM:INV204656_dynmc?height=150
		})
		.then(
		    botui.message
			.add({
			    delay: 10,
			    content: image_title
			}));

	}); // end of getJSON
    }

    // ------- Code related specifically to fetching text ---------

    // So far, sources supported:
    //    - GoodReads quotes, goodquotesapi.herokuapp.com
    // (should probably be refactored into a different file but I hate having multiple files)

    function goodreadsSuccessCallback(result) {
	// Parse the JSON result.
	let chosen = randElem(result.quotes);
	console.log(result);
	return showBotSuggestion(chosen.quote).then(
	    showBotSuggestion(chosen.publication + ", " + chosen.author));
    }

    // keywords should be an array of words that form a phrase, e.g., ['good', 'luck'].
    // phrases shouldn't be too complicated, or there won't be results.
    // one word queries are best.
    function queryGoodreads(keywords) {
	console.log("keywords: ", keywords);
	var query = "https://goodquotesapi.herokuapp.com/title/" + keywords.join("+");
	// var query = "https://goodquotesapi.herokuapp.com/title/good+luck"

	return queryHttp(query, goodreadsSuccessCallback, generateGenericSuggestion);  
    }

    // ------ HTTP Library code - making requests, etc. --------------------------

    // Makes an http request to the URL and returns the result.
    // Katherine, use this function!
    // url should be a string with the full url (https://www....)
    // success and failure are callbacks depending on whether the http request succeeded.
    function queryHttp(url, success, failure) {
	return makeHttpRequestHelper(url)
	    .then(function(result) {
		console.log("query http result", result);
		if (result.status == 200) { 
		    console.log("query http successful");

		    return success(result.response);
		} else {
		    return failure();
		}
	    })
	// Note that this will catch errors returned from the .then block, too.
	    .catch(function() {
		console.log("error occured with http request to " + url);
		return failure();
	    });
    }

    // Sends the actual HTTP request, with two callbacks:
    //   resolve is a function that will be called if the request is successful.
    //   likewise, reject is a function that will be called if the request fails.
    // There's no need to pass them in explicitly. Both of these functions will be magically called in queryHttp,
    // as part of the .then and .catch. (I think so, anyway...)
    // For more info see: https://stackoverflow.com/questions/14220321/how-do-i-return-the-response-from-an-asynchronous-call
    function makeHttpRequestHelper(url) {
	return new Promise(function(resolve, reject) {
	    var xhr = new XMLHttpRequest();
	    xhr.responseType = "json"; // xhr.response will be parsed into a JSON object

	    xhr.onload = function() {
		resolve(this);
	    };
	    xhr.onerror = reject;
	    xhr.open('GET', url);
	    xhr.send();
	});
    }

    // ----- Code for highlighting.------------------

    // Don't highlight stuff when the program is first starting up.
    // Things get phantom selected by botui?
    var selectionEndTimeout = setTimeout(function () {}, 1000);

    document.addEventListener("selectionchange",event=>{
	// console.log("Selection change", event);
	// console.log(event.srcElement.activeElement.className);
	var elemClass = event.srcElement.activeElement.className;

	// Don't respond to selection in either text entry box
	if (elemClass !== "ql-editor" && elemClass !== "botui-actions-text-input") {
	    if (selectionEndTimeout) {
		clearTimeout(selectionEndTimeout);
	    }
	    
	    selectionEndTimeout = setTimeout(function () {
		let selection = document.getSelection ? 
		    document.getSelection().toString() : document.selection.createRange().toString();
		console.log(selection);

		if (selection) {
		    addToTextEditor(selection);
		}
	    }, 600); // wait 600 ms after the last selection change event
	}

    });

});

