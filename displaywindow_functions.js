//slides viewer display window functions
//alert("welcome to the display!")

$(document).ready(function(){
	
	var directorSource;
	var fitChars = -1;
	
	var fretHeight = 20;
	var stringWidth = 20;
	var textOffsetY = -3;
	
	// Called sometime after postMessage is called
	function receiveMessage(event)
	{ 
		var slideText = event.data;
		
		//work out the correct font size based on the maximumSlideLength parameter
		var maximumSlideLength = getUrlParameter("fontSizeOption");
		if (Number.isInteger(maximumSlideLength)){ //we have been sent an integer for the number of characters that must fit
			fitChars = maximumSlideLength;
		}
		else if (maximumSlideLength == "maximize_each_slide"){
			fitChars = slideText.length;
			
		}
		
		if (fitChars > -1){
			//update the font size used
			//the usable width is affected by having info such as chords displayed on the left
			
			var infoPanelWidth = 0;
			//search the slide text for chords (or other additions that might affect the info panel)
			if (slideText.search(/\[\[/) >= 0){
				infoPanelWidth = 180;
			};
			var windowWidth = window.innerWidth - infoPanelWidth;
			var windowHeight = window.innerHeight;
			var totalAreaAvailable = windowWidth * windowHeight;
			
			//get the font aspect ratio using the test slide sample text
			//$("#slidesTextTest").html(slideText);			
			//alert("Window is " + windowWidth + " X " + windowHeight);
			var testHeight = document.getElementById("slidesTextTest").clientHeight;
			var testWidth = document.getElementById("slidesTextTest").clientWidth;
			var testAspectRatio = testHeight/(testWidth/10); //this div contains 10 characters to find h/w ratio of font
			
			//work out how many lines are in the slide: number of <br /> tags + 1			
			
			var numberOfLines = (slideText.match(/\n/g) || []).length + 1;
			var slideLines = slideText.split("\n");
			var longestLineLength = 0;
			for (i=0;i<slideLines.length;i++){
				if (slideLines[i].length > longestLineLength){
					longestLineLength = slideLines[i].length;
				}
			}
			
			//Now we can work out how many characters worth of space that we need
			var totalCharacterSpacesNeeded = longestLineLength * numberOfLines;
			
			maxCharacterWidth = windowWidth/longestLineLength;
			estimatedLineHeight = maxCharacterWidth*testAspectRatio;
			//we have to make sure that this height is not too big so that the text fits vertically as well as horizontally
			
			while (estimatedLineHeight*numberOfLines >= windowHeight){
				maxCharacterWidth -= 1;
				estimatedLineHeight = maxCharacterWidth*testAspectRatio;
			}
			
			var newHeight = Math.floor((estimatedLineHeight/2)*0.8);			
			
			//work out the new font size based on what font size will fill the available area
			//var newHeight = Math.floor(Math.sqrt(totalAreaAvailable*testAspectRatio));			
			//var newHeight = Math.floor((Math.sqrt((totalAreaAvailable*testAspectRatio)/(totalCharacterSpacesNeeded)))/2);
			//alert("testAspectRatio = " + testAspectRatio + "\n\n" + "totalAreaAvailable = " + totalAreaAvailable + "\n\n" + "totalCharacterSpacesNeeded = " + totalCharacterSpacesNeeded + "\n\n" + "new font size = " + newHeight + "\n\n" + " calculated New Area = " + newHeight*(newHeight/testAspectRatio)*totalCharacterSpacesNeeded );
			
			//var newHeight = Math.floor((testAspectRatio*windowWidth)/longestLineLength);
			
			//alert("testAspectRatio = " + testAspectRatio + "\n\n" + "windowWidth = " + windowWidth + "\n\n" + "longestLineLength = " + longestLineLength + "\n\n" + "new font size = " + newHeight);
									
			
			$("#slidesText").css("fontSize", newHeight);
		}
		else{
			$("#slidesText").css("fontSize", 48);
		}
		slideText = slideText.replace(/  /g, '&nbsp;&nbsp;'); //replace spaces with &nbsp;, otherwise multiple spaces will be removed by the browser
		//changed to remove pairs of spaces as single spaces need to be kept- replacing single spaces from an <img src=x> tag causes problems
		slideText = slideText.replace(/[\n]+/g, '<br />'); //replace returns with br tags
		
		//we may need to show some info in the topInfoArea, e.g. chords. Want to remove duplicates!
		//var chordsToDisplay = (slideText.match(/\[\[.\]\]/g) || []);
		//only work on this if the etxt contained chords/etc
		if (infoPanelWidth > 0){
			//add the div IF it is not already there...
			if (!document.getElementById('chordsDisplay')){
				var c = document.createElement('canvas');
				c.id = "chordsDisplay";
				c.width = infoPanelWidth;
				
				$( ".slidesWindow" ).prepend(c);
				
			}
			else{
				var c = document.getElementById('chordsDisplay');
			}
			
			var chordsToDisplay = (slideText.match(/\[\[[a-zA-Z0-9#]+\]\]/g) || []); //
			if (chordsToDisplay.length > 0){
				chordsToDisplay = uniq(chordsToDisplay);
				//set the height based on the number of chords found
				c.height = chordsToDisplay.length * 130;
			}
			//turn the chords into a chunk of HTML that can be displayed
			var topAreaHTML = "";
			//clear the canvas used to draw chords
			
			var ctx = c.getContext('2d');
			ctx.font = "18px Arial";
			ctx.clearRect(0, 0, c.width, c.height);
			
			for (i=0;i<chordsToDisplay.length;i++){
				var chord = chordsToDisplay[i];
				chord = chord.replace(/\[\[/g, '');	
				chord = chord.replace(/\]\]/g, '');
				//topAreaHTML += chord;
				//draw in the chord
				
				var fretHeight = 20;
				var stringWidth = 20;
				var textOffsetY = -3;
				//try to find the chord in the chord_dictionary
				var cdl = chord_dictionary.length;
				var k = 0;
				var is_chord_found = 0;
				var chord_to_check = {};
				var chord_details = {};
				while (k < cdl && is_chord_found == 0){
					chord_to_check = chord_dictionary[k];
					if (chord_to_check.name == chord){
						chord_details = {
						  name : chord_to_check.name,
						  type: chord_to_check.type,
						  placement: chord_to_check.placement,
						  fingering: chord_to_check.fingering,
						  fret:chord_to_check.fret
						};
						is_chord_found = 1;
					}
					k++;
				}
				if (chord_details){
					//ignore if there is no placement
					if (chord_details.placement){
						drawChord(ctx,chord_details,i);
						//increase the height of the canvas?
						//c.height = c.height + 100;
					}
				}
			
			}	
			
			//create spans for any chords with the format [[D]]
			slideText = slideText.replace(/\[\[/g, '<span class="chord">');	
			slideText = slideText.replace(/\]\]/g, '</span>&nbsp;&nbsp;&nbsp;&nbsp;');	
		
		
			//add a topAreaHTML if it exists
			if (topAreaHTML.length > 0){
				$("#topInfoArea").html(topAreaHTML);
			}	
		}
		else{
			$('canvas').remove();
		}	
		$("#slidesText").html(slideText);  
		//$("#slidesTextTest").html("");  
		
		
		directorSource = event.source;
		directorSource.postMessage("OK","*"); //return a message to indicate that the message was displayed ok
		
		
	}

	function callNextslide(){
		//send a message to the director page to call the next slide (the slide viewer does not know anythign about the slides
		directorSource.postMessage("NEXT","*");
	}

	function callPreviousslide(){
		//send a message to the director page to call the next slide (the slide viewer does not know anythign about the slides
		directorSource.postMessage("PREVIOUS","*");
	}

	window.addEventListener("message", receiveMessage, false);


	$("body").keydown(function(e) {
		  if(e.which == 39) { //next arrow key
				callNextslide();
		  }
		  else if(e.which == 37) { //previous arrow key
				callPreviousslide();
		  }
		});
	$("body").click(function(){
		//go to the next slide when the user clicks anywhere on the viewer
		callNextslide();
	})
	
	var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};
		
	function uniq(a) {
		var seen = {};
		var out = [];
		var len = a.length;
		var j = 0;
		for(var i = 0; i < len; i++) {
			 var item = a[i];
			 if(seen[item] !== 1) {
				   seen[item] = 1;
				   out[j++] = item;
			 }
		}
		return out;
	}

	function removeX(array){
		if(array){
			var searchTerm = 'x';
			cleanArray = [];
		  
			for(n=0; n<=array.length - 1; n++){
				if(array[n] != searchTerm ){
					cleanArray.push(parseInt(array[n]));
				}
			}
			return cleanArray;
		}
	}

	function drawChord(ctx,chord,chord_no){ // from https://codepen.io/Bijingus/pen/pbyEBq
	  try{
		  var offsetY = chord_no * 130 + 14;
		  var offsetX = 0;
		  
		  ctx.font = "bold 14pt Arial";			
			
		  //draw the chord name
			ctx.fillStyle = 'black';				
			y = offsetY;
			
			ctx.fillText(chord.name, (100+stringWidth)/2, y);
			
			offsetY += 2;
			
			ctx.fillStyle = 'gray';
			ctx.font = "bold 10pt Arial";			
			var starting_text_offset = offsetY;
		  
		  
			var maxPos = Math.max.apply(Math, removeX(chord.placement));
			var minPos = 0;// Math.min.apply(Math, removeX(chord.placement));
		  
		  // console.log(chord.placement);
		  
		  // show an extra fret if fewer than 4 are to be displayed
		  var maxPosLimit = maxPos + 1;
		  if (maxPosLimit > 4){
			  maxPosLimit = 4;
		  }
		  
		  
		  for(f=minPos; f<=maxPosLimit; f++){
			ctx.beginPath();
			
			if(f == 0 && chord.fret == 0){
			  ctx.lineWidth = 4;			
			} else{
			  ctx.lineWidth = 1;			  
			}
			if (f==0 && chord.fret > 0){
				//add a FRET number				
				ctx.fillStyle = 'gray';				
				y = offsetY;
				ctx.font = "italic 10pt Arial";			
				ctx.fillText("fr" + chord.fret, (110+stringWidth), offsetY + fretHeight + 4);
				ctx.font = "bold 10pt Arial";				
			}
			
			//draw the frets
			ctx.moveTo(0 + stringWidth, offsetY + fretHeight);
			ctx.lineTo(100 + stringWidth, offsetY + fretHeight);
			ctx.strokeStyle = 'gray';
			ctx.stroke();
			
			var offsetY = offsetY + 20;
		  }
		  
		  for(ci=0; ci<chord.placement.length; ci++){    
			var stringH = (maxPosLimit - minPos) * fretHeight;
			
			if(chord.placement[ci] == 'x'){
			  var y = starting_text_offset + fretHeight + textOffsetY;
			} else{
			  var y = starting_text_offset + (fretHeight * chord.placement[ci]) + fretHeight + textOffsetY;
			}
			
			var x = stringWidth + offsetX - (stringWidth / 4);
			
			//draw the strings and finger placements
			ctx.beginPath();
			if (chord.placement[ci] == 'x'){
				//do not draw any circle, use gray text
				ctx.font = "italic 10pt Arial";	
				ctx.moveTo(offsetX + stringWidth, starting_text_offset + 0 + fretHeight);
				ctx.lineTo(offsetX + stringWidth, starting_text_offset + stringH + fretHeight);

				ctx.fillStyle = 'grey';
				ctx.fillText(chord.fingering[ci], x, y);

				ctx.stroke();
				ctx.font = "bold 10pt Arial";	
			}
			else if (chord.placement[ci] == 0){
				//draw a white cricle, black boundary, with no text
				//draw a black circle and white text
				ctx.fillStyle = 'white';
					
				ctx.arc(x+4, y-5, 4, 0, 2 * Math.PI); //cricle for fretting
				ctx.stroke();
				
				ctx.moveTo(offsetX + stringWidth, starting_text_offset + 0 + fretHeight);
				ctx.lineTo(offsetX + stringWidth, starting_text_offset + stringH + fretHeight);

				//ctx.fillStyle = 'white';
				//ctx.fillText(chord.fingering[ci], x, y);

				ctx.stroke();
			}
			else{
				//draw a black circle and white text
				ctx.fillStyle = 'black';				
				
				ctx.arc(x+4, y-5, 7, 0, 2 * Math.PI); //cricle for fretting
				ctx.fill();
				
				ctx.moveTo(offsetX + stringWidth, starting_text_offset + 0 + fretHeight);
				ctx.lineTo(offsetX + stringWidth, starting_text_offset + stringH + fretHeight);
				
			
				
				ctx.fillStyle = 'white';
				ctx.fillText(chord.fingering[ci], x, y);

				ctx.stroke();
			}
			
			var offsetX = offsetX + stringWidth;
		  }
	  }
	  catch(err) {
		console.log(err.message);
		}
	}	

});