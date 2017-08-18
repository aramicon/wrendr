//Javascript code for Wrendr slide Viewer

	$(document).ready(function(){
		
	var fileDisplayArea = document.getElementById('fileDisplayArea');   
	var slidesItems = [];
	var displayWindow;
	var slideDisplayed = 0;
	var slideDisplayedID = "";
	var maximumSlideLength = 0;
	
	$('#openDisplayButton').click(function() {
		//need to add options when opening the window
		var displayOptionsText = "?";
		
		var fontSizeOption = $("#fontSizeOption").val();
		if (fontSizeOption == 'maximize_biggest_slide') {
			//need to send number of characters in the biggest slide- slide with MOST characters
			fontSizeOption = maximumSlideLength;
		}
		displayOptionsText += "fontSizeOption=" + fontSizeOption;
		
		displayWindow = window.open("displaywindow.html"+displayOptionsText, "", "width=800,height=800,toolbar=yes");
		$('#displayWindowInfo').html("DISPLAY WINDOW OPEN");
		
		
		var first_slide_id = "slide_1";
		
			if (document.getElementById(first_slide_id)){	
				//alert("first slide exists!");
				first_slide_id = "#" + first_slide_id;
				$("div.slideLine").removeClass('current_slide')
				$(first_slide_id).addClass('current_slide');			
				slideText = $(first_slide_id).find(".slide_text").html();	
				//alert(slideText);				
				$('#displayWindowInfo').removeClass('warning').fadeIn(5000);
				if (displayWindow != undefined){				
					$('#displayWindowInfo').html("SENDING...");
					//alert("send message");
					displayWindow.postMessage(slideText, "*");				
				}
			}
		
		
		
	});
	
	$('#previous_button').click(function() {
			previousslide();
	});
	$('#next_button').click(function() {
			nextslide();
	});
	
	
	$('#slidesDisplayArea').on('dblclick', 'div.slideLine', function() {
		$("div.slideLine").removeClass('current_slide')
		$(this).addClass('current_slide');
		
		//if there is a window send it the slide
		slideText = $(this).find(".slide_text").html();
		
		//alert(slideText);
		$('#displayWindowInfo').removeClass('warning').fadeIn(5000);
		if (displayWindow != undefined){
			//alert("call window");
			//displayWindow.displayslide(slideText);
			$('#displayWindowInfo').html("SENDING...");
			displayWindow.postMessage(slideText, "*");
			//displayWindow.focus(
		}
		else{			
			$('#displayWindowInfo').addClass('warning').fadeIn(10000);			
		}
			
		$(this).addClass('current_slide_shown');
		slideDisplayed = 1;
		slideDisplayedID = this.id;
		var positionOfslide = $(this).offset().top - $('#slidesDisplayArea').offset().top;
		//alert($(this).offset().top + " --- " + $(this).position().top);
		//$( "#slidesDisplayArea" ).scrollTop( positionOfslide )
		this.scrollIntoView();			
		
		//display in the control_panel_slide_display
		slideNumber = $(this).find(".slide_no").html();
		$("#control_panel_slide_display").html("<span>" + slideText + "</span>");
		$("#control_panel_slide_info_display").html(slideNumber + "/" + slidesItems.length.toString());
		
		
			

	});
		
	window.addEventListener("message", receiveMessage, false);
	
	function updateSubtilesFile() {
	  var nBytes = 0,
		  oFiles = document.getElementById("uploadInput").files,
		  nFiles = oFiles.length;
		  
			//we only want to allow one file to be selected
		if (nFiles > 1){
			alert("You have selected "+nFiles+ " files: please selected one slides text file!");
		}
		else{
			//try to read the text file as slides	
			slidesFile =  oFiles[0];
			slidesFileName = slidesFile.name;
			slidesFileSize = slidesFile.size;
			var textType = /text.*/;
		}
	  for (var nFileId = 0; nFileId < nFiles; nFileId++) {
		nBytes += oFiles[nFileId].size;
	  }
	  var sizeOutput = slidesFileSize + " bytes";
	  
	 
	  document.getElementById("fileName").innerHTML = slidesFileName;
	  document.getElementById("fileSize").innerHTML = sizeOutput;
	
	  
		if (slidesFile.type.match(textType)) {
			var reader = new FileReader();
			
			reader.onload = function(e) { //triggered when a text file is loaded
				//load the text into an array of objects
				//clear the results list
				$("#slidesDisplayArea").html("")
				//alert("load!");
				slidesItems = []; //clear the array
				allslidesLines = []; //clear the array
				entireslidesText = reader.result.replace(/[\r]+/g, '');			//replace the carraige returns to help split new lines properly
				allslidesLines = entireslidesText.split(/\n\n/);
				//loop through the lines and append to the results div
				slide_no = 1;
				maximumSlideLength = 0;
				comments_no = 0;
				for (i=0;i<allslidesLines.length;i++){
					
					//#IMAGE (filepath or url must be given)
					if (allslidesLines[i].trim().substring(0, 6) == "#IMAGE"){
							//set up a slides object for an image
						var slide = {};
						slide.text = "<img class='imageSlide' src='"+allslidesLines[i].replace("#IMAGE",'').trim() +"'/>";//just set it to a blank string
						slide.number = slide_no;						
						slidesItems.push({"text":' ',"number":slide.number});
						$("#slidesDisplayArea").append("<div id = 'slide_" + slide.number + "' class = 'slideLine image_slide'>" + "<span class='slide_no' >"+slide.number + "</span>" + "<span id = 'slide_text_"+slide.number+"' class='slide_text'>" + slide.text + "</span></div");
						slide_no += 1;
					}//is it a #BLANK slide?
					if (allslidesLines[i].trim().substring(0, 6) == "#BLANK"){
							//set up a slides object for a BLANK slide
						var slide = {};
						slide.text = ' ';//just set it to a blank string
						slide.number = slide_no;
						
						slidesItems.push({"text":' ',"number":slide.number});
						$("#slidesDisplayArea").append("<div id = 'slide_" + slide.number + "' class = 'slideLine blank_slide'>" + "<span class='slide_no' >"+slide.number + "</span>" + "<span id = 'slide_text_"+slide.number+"' class='slide_text'>" + ' ' + "</span></div");
						slide_no += 1;
					}
					//check if it is a comment
					else if (allslidesLines[i].trim()[0] == "#"){
							$("#slidesDisplayArea").append("<div class = 'slideComment'>" + allslidesLines[i] + "</div");
							comments_no += 1;
					}
					else if(allslidesLines[i].length <= 0){ //if the slide is empty, ignore it
						//do nothing
					}
					else{
						//set up a slides object
						var slide = {};
						//slide.text = allslidesLines[i].replace("\n", "<br />");
						//get the length and check if it is a new maximum length
						if (allslidesLines[i].length > maximumSlideLength){
							maximumSlideLength = allslidesLines[i].length;
						}
						var slideText = allslidesLines[i];
												
						slide.text = slideText;
						slide.number = slide_no;
						
						slidesItems.push({"text":slide.text,"number":slide.number});
						$("#slidesDisplayArea").append("<div id = 'slide_" + slide.number + "' class = 'slideLine'>" + "<span class='slide_no' >"+slide.number + "</span>" + "<span id = 'slide_text_"+slide.number+"' class='slide_text'>" + slide.text + "</span></div");
						slide_no += 1;
					}
				}
				
				//show some overall info
				$("#slidesLoadedInfo").append("Total Lines in file = "+ allslidesLines.length + ". Number of comments = " + comments_no + ". Number of slides = " + (slide_no-1) + ". Maximum slide length: " + maximumSlideLength);
				//$("#slidesLoadedInfo").addClass('current_slide');
				//fileDisplayArea.innerText = reader.result;
			}

			reader.readAsText(slidesFile);  
		} else {
			fileDisplayArea.innerText = "File not supported!";
		}
		
		// document.getElementById("maximumSlideLength").innerHTML = maximumSlideLength;
	}

	function receiveMessage(event)
	{
	  // Do we trust the sender of this message?  (might be
	  // different from what we originally opened, for example).
	 // if (event.origin !== "http://example.com")
	   // return;
		message_received = event.data; //if it is an OK we have jsut displayed a slide
		if (message_received == "OK"){
			$('#displayWindowInfo').html("slide DISPLAYED");
		}
		else if (message_received == "NEXT"){ //go to the next slide
			nextslide();
		}
		else if (message_received == "PREVIOUS"){ //go to the previous slide
			previousslide();
		}
		else if (message_received == "FIRST"){ //open the first slide
			//display the first slide, if one exists
			var first_slide_id = "slide_text_1";
		
			if (document.getElementById(first_slide_id)){				
				$("div.slideLine").removeClass('current_slide')
				$(first_slide_id).addClass('current_slide');			
				slideText = $(first_slide_id).find(".slide_text").html();			
				$('#displayWindowInfo').removeClass('warning').fadeIn(5000);
				if (displayWindow != undefined){				
					$('#displayWindowInfo').html("SENDING...");
					displayWindow.postMessage(slideText, "*");				
				}
			}
		}		
		
	  // event.source is popup
	  // event.data is "hi there yourself!  the secret response is: rheeeeet!"
	}	
	
    $(".instructionsHeader").click(function(){
        $(".instructions").toggle();
    });
	
	
	$('#uploadInput').on("change", function(){ 
		updateSubtilesFile(); 
		
		});
	

	$("body").keydown(function(e) {
	  if(e.which == 39) { //next arrow key
			nextslide();
	  }
	  else if(e.which == 37) { //previous arrow key
			previousslide();
	  }
	});
	
	function nextslide(){
		if (slideDisplayed ==1){ //a slide has been displayed			
			if(slideDisplayedID){
				//try to display the next slide
				//id format is slide_2 so we need to parse out the number, increment and try to find it
				var slideDisplayedID_elements = slideDisplayedID.split("_");
				var id_number = parseInt(slideDisplayedID_elements[slideDisplayedID_elements.length-1]);
				if (id_number > 0 && id_number < slidesItems.length){
					id_number += 1;
					nextslideId =  slideDisplayedID_elements[0] + "_" + id_number.toString();
					//alert(nextslideId);
					currentslide = $("#" + nextslideId);
					//displayslide(currentslide);
					//if there is a window send it the slide
					slideText = $(currentslide).find(".slide_text").html();
					$("div.slideLine").removeClass('current_slide');
					$(currentslide).addClass('current_slide');	
					$('#displayWindowInfo').removeClass('warning').fadeIn(10000);
					if (displayWindow != undefined){	
						$('#displayWindowInfo').html("SENDING...");
						displayWindow.postMessage(slideText, "*");	
					}
					else{			
						$('#displayWindowInfo').addClass('warning').fadeIn(10000);			
					}					
					$(currentslide).addClass('current_slide_shown');
					slideDisplayed = 1;
					slideDisplayedID = $(currentslide).attr('id');
					$(currentslide).focus();					
					
					//display in the control_panel_slide_display
					slideNumber = $(currentslide).find(".slide_no").html();
					$("#control_panel_slide_display").html("<span>" + slideText + "</span>");
					$("#control_panel_slide_info_display").html(slideNumber + "/" + slidesItems.length.toString());

					//$(currentslide).scrollIntoView();	
						document.getElementById(nextslideId).scrollIntoView();			
				}
			}
		}
	}
	
	function previousslide(){
			if (slideDisplayed ==1){ //a slide has been displayed			
			if(slideDisplayedID){
				//try to display the next slide
				//id format is slide_2 so we need to parse out the number, increment and try to find it
				var slideDisplayedID_elements = slideDisplayedID.split("_");
				var id_number = parseInt(slideDisplayedID_elements[slideDisplayedID_elements.length-1]);
				if (id_number > 1){
					id_number -= 1;
					nextslideId =  slideDisplayedID_elements[0] + "_" + id_number.toString();
					//alert(nextslideId);
					currentslide = $("#" + nextslideId);
					//displayslide(currentslide);
					//if there is a window send it the slide
					slideText = $(currentslide).find(".slide_text").html();
					$("div.slideLine").removeClass('current_slide')
					$(currentslide).addClass('current_slide');
					$('#displayWindowInfo').removeClass('warning').fadeIn(10000);
					if (displayWindow != undefined){		
						$('#displayWindowInfo').html("SENDING...");
						displayWindow.postMessage(slideText, "*");	
					}
					else{			
						$('#displayWindowInfo').addClass('warning').fadeIn(10000);			
					}					
					$(currentslide).addClass('current_slide_shown');
					slideDisplayed = 1;
					slideDisplayedID = $(currentslide).attr('id');
					$(currentslide).focus();
					
					//display in the control_panel_slide_display
					slideNumber = $(currentslide).find(".slide_no").html();
					$("#control_panel_slide_display").html("<span>" + slideText + "</span>");
					$("#control_panel_slide_info_display").html(slideNumber + "/" + slidesItems.length.toString());
					
					//$(currentslide).scrollIntoView();
					document.getElementById(nextslideId).scrollIntoView();					
				}
			}
		}
	}
})



