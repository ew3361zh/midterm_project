//welcome message
alert('Welcome to the ARTIC Modern Art Quiz. Answer ANY or ALL of the questions for each piece to try and reach 100 points! But be careful, each wrong answer takes 5 points off your score.')

//create variable for new image to hold the painting image
let image = new Image()

//elements set up for CSS if player wins (i.e. gets 100 points)
let bodyElement = document.getElementById('body')
let pointsIdElement = document.getElementById('points-id')
let winningElement = document.querySelector('#winning')

//variable for span element
let pointsElement = document.querySelector('#points')

//tracker for points accumulated
let pointsTally = 0

//create canvas element and context element - initially used canvas to have "correct"
// or "wrong" written across the painting but might not do that anymore, we'll see
let canvas = document.querySelector('#canvas')
let context = canvas.getContext('2d')

//variables for button elements and the result element
let nameResultElement = document.querySelector('#name-answer')
let titleResultElement = document.querySelector('#title-answer')
let dateResultElement = document.querySelector('#date-answer')
let submitButton = document.querySelector("#submit-answer")
let playAgainButton = document.querySelector('#play-again')

//variables for input elements
let titleInput = document.querySelector('#piece-name')
let dateInput = document.querySelector('#date-made')
let artistInput = document.querySelector('#artist-name')
let continueElement = document.querySelector('#continue')

let height = 0
let width = 0

//add return to submit answer for usability
document.addEventListener('keyup', function() { 
    if (event.keyCode == 13) {
        submitButton.click()
    }
})

//add header for contact info in case program too aggressively fetches
let headers = {'User-Agent' : 'Web Client Midterm Art Quiz Program (ew3361zh@mail.minneapolis.edu'}

//initialize answer variables to later be filled in the getNewArtPiece function and then
//referenced in the submitButton event listener
let title = ''
let artistName = ''
let date = ''

//set up boolean for whether the user has tried to answer at least one of the questions
let hasAnswered = false 

//pick random page number from their 100 pages of data available for art that meets the contemporary style search result
let pageNumber = Math.floor(Math.random()*(100))

//initialize url with randomized page# within search-term of modern art
let url = `https://api.artic.edu/api/v1/artworks/search?q=modern&page=${pageNumber}`

//create reusable function of getting a new art piece for original page load
//and use with play again button
function getNewArtPiece () {
    fetch(url, headers) //make URL request
    .then( response => response.json())
    .then(articJson => {
        //there are 10 records per page in the search results, so this will pick a random record w/in the random page
        let recordNumber = Math.floor(Math.random()*(10))

        //get the data for that particular randomly selected record
        let contempData = articJson.data[recordNumber]
        
        //pull the specific link to the api on that particular piece
        let url2 = contempData.api_link
        
        //run a secondary fetch to access the piece api page
        fetch(url2, headers)
        .then( response2 => response2.json())
        .then(articJson2 => {
            //set up the data variable for this api page
            let articData2 = articJson2.data
            date = articData2.date_end
            
            //there are a small number of pieces that have a null value
            //for the image_id which crashes the program. I decided to run a check
            //on that value being null and if so, redo the search and choose another
            //record. I don't think there are any search result pages where all the 
            //pieces lack image_id and in testing it hasn't come up.
            //Also some pieces within the "modern" search result came back with
            //dates way earlier than the normal dates used for Modern art
        if (articData2.image_id == null || date < 1850) {
            getNewArtPiece() //restart the process
            return //stop this time through the getNewArtPiece function
        }
            
            //assuming there is an image_id at this point, set up getting the image
            //result from the page to load into the canvas
            let image_id = articData2.image_id
            let config = articJson2.config.iiif_url
            
            //using the 843 sized version because according to their site it is
            //"the most common size ued by our website"
            image.src = `${config}/${image_id}/full/843,/0/default.jpg`
            
            //get the title, date, and artist name of the piece
            title = articData2.title
            artistName = articData2.artist_title
            
            //get width and height of the lqip image which can be used to
            //draw the real image since it's the same
            width = articData2.thumbnail.width
            height = articData2.thumbnail.height

            //log the artist name, date and title so you can make 
            //sure the program works while using it
            console.log(artistName)
            console.log(title)
            console.log(date)
            
            
            //draw the image to proportion (may change this later but it's currently working realatively well)
                image.addEventListener('load', function() {
                if (height > width) {
                context.drawImage(image, 0, 0, width/height * 500, 500) //draws the image after it's loaded
                } else if (width > height) {
                context.drawImage(image, 0, 0, 500, height/width * 500) //draws the image after it's loaded
                } else {
                context.drawImage(image, 0, 0, 500, 500) //draws the image after it's loaded
                }
                
            }) 
             
            artistInput.focus()
            
            
        })
        .catch(error => { //error handling
            console.log(error)
            alert('Error fetching data form the ARTIC API during the secondary piece search')
        })

    })
    .catch(error => { //error handling
        console.log(error)
        alert('Error fetching data form the ARTIC API during the initial search')
    })

}

//call getNewArtPiece for original page load
getNewArtPiece()

//function to check if pieces of user answer are in the full answer
//taken from https://stackoverflow.com/questions/53606337/check-if-array-contains-all-elements-of-another-array
function answerCheck(arr, arr2){
    return arr.every(i => arr2.includes(i));
  }



function nameCorrect(nameAnswer) {
    // do all the checks here, normalize name and compare
    // return true/false 

    nameAnswer = nameAnswer.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toUpperCase()
    //create a list of the answer to check the pieces against the full correct answer
    let nameAnswerList = nameAnswer.split(' ')
    //second bit of code to remove extra internal spaces in user answers taken from https://stackoverflow.com/questions/16974664/remove-extra-spaces-in-string-javascript
    nameAnswer = nameAnswer.replace(/\s+/g,' ').trim()
    
    let normalizedArtistName = artistName.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toUpperCase()
    //normalizing and uppercasing the artist name and also changing it to a list
    //so that if the user enters "Manet" and the artist is "Edouard Manet", they get it right
    let artistNameList = artistName.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toUpperCase().split(' ')
    
    // replacing the condition if (answerCheck(nameAnswerList, artistNameList) || artistNameList.includes(nameAnswer) || normalizedArtistName == nameAnswer)

    if (answerCheck(nameAnswerList, artistNameList)) {
        return true
    } else if (artistNameList.includes(nameAnswer)) {
        return true
    } else if (normalizedArtistName == nameAnswer) {
        return true 
    }

    return false 
}


//submit button event listener
submitButton.addEventListener('click', function () {
    //reactivate all the inputs
    titleInput.disabled = true
    dateInput.disabled = true
    artistInput.disabled = true

    //using normalization here because of the instances of accented letters in the artist and piece names
    //so also wanted to make sure to accomodate for the user potentially using them
    //normalize and replace code taken from https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
    let nameAnswer = artistInput.value
    
    
    //just doing a normalization, uppercase and internal/external trim on the title of the piece and title answer
    let titleAnswer = titleInput.value.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toUpperCase()
    titleAnswer = titleAnswer.replace(/\s+/g,' ').trim()
    //TODO may try to do something to make it easier on the user to guess the name correctly
    //like a close-enough type of thing that removes articles from the title
    let pieceName = title.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toUpperCase()

    //just internal/external trim for the date
    let dateAnswer = dateInput.value
    dateAnswer = dateAnswer.replace(/\s+/g,' ').trim()

    //check to make sure the user has answered at least one of the questions
    if (nameAnswer.length < 1 && titleAnswer < 1 && dateAnswer < 1){
        alert('You have to answer at least one of the questions')
        //undo the disabling of these inputs on pressing the submit button so they can still answer
        titleInput.disabled = false
        dateInput.disabled = false
        artistInput.disabled = false
        //refocus on the artist input field
        artistInput.focus()
        return
    }

    //if user has reached this far, they've successfully submitted at least one answer
    //so change has answered to true so they can "play again"
    hasAnswered = true

    //logic blocks for calculating whether the user has gotten the answers right
    if (nameAnswer == '') {
        // do whatever if user hasn't answered (nothing?)
    }
    else if (nameCorrect(nameAnswer)) {  // answered and the answer is right
        nameResultElement.innerHTML = `Correct! + 10 Points! ${artistName} is the artist of this piece`
        nameResultElement.classList.remove('text-danger')
        nameResultElement.classList.add('text-success')
        pointsTally = pointsTally + 10
    } else {   // answered but wrong answer 
        nameResultElement.innerHTML = `-5 points. Sorry, the correct answer is ${artistName}`
        nameResultElement.classList.remove('text-success')
        nameResultElement.classList.add('text-danger')
        pointsTally = pointsTally - 5  
    } 
    
    if (titleAnswer == pieceName) {
        titleResultElement.innerHTML = `Correct! +20 Points! '${title}' is the title of this piece`
        titleResultElement.classList.remove('text-danger')
        titleResultElement.classList.add('text-success')
        pointsTally = pointsTally + 20
    } else if (titleAnswer != '' && titleAnswer != pieceName){
        titleResultElement.innerHTML = `-5 points. Sorry, the correct answer is '${title}'`
        titleResultElement.classList.remove('text-success')
        titleResultElement.classList.add('text-danger')
        pointsTally = pointsTally - 5
    } 

    if (dateAnswer >= date - 25 && dateAnswer <= date + 25) {
        dateResultElement.innerHTML = `Correct! +5 points! ${date} is the exact year this was made`
        dateResultElement.classList.remove('text-danger')
        dateResultElement.classList.add('text-success')
        pointsTally = pointsTally + 5
    } else if (dateAnswer != '' && (dateAnswer < date - 25 || dateAnswer > date + 25)){
        dateResultElement.innerHTML = `-5 points. Sorry, the correct year is ${date}`
        dateResultElement.classList.remove('text-success')
        dateResultElement.classList.add('text-danger')
        pointsTally = pointsTally - 5
    } 

    //wanted to make sure user couldn't keep submitting right answers to run up their scores
    submitButton.disabled = true
    //note for how to keep playing after the first question
    continueElement.innerHTML = 'Press "Play Again" to move to the next piece!'
    
    //get the points tally totaled up based on user answers
    pointsElement.innerHTML = pointsTally
    //if player gets 100 points or more, they win, so this if block has an event for winning
    if (pointsTally >= 100) {
        bodyElement.classList.toggle('body-gradient')
        winningElement.classList.toggle('winning')
        winningElement.innerHTML = `****You win!!! Your total points is ${pointsTally}****`
        continueElement.innerHTML = 'Press "Next piece" to start a new game!'
    }
    
    //return to stop this time through the submit button event listener. Was having some
    //trouble earlier with multiple countings of points within the same submit click event
    return
})

//play again button eventlistener
playAgainButton.addEventListener('click', function(){
    //set up to prevent the user from skipping a question
    if (hasAnswered == false){
        alert('You can\'t skip a question, this is real life')
        return
    }
    //if they've scored 100 points and are pressing this button, this resets the winning screen to a new game
    if (pointsTally >= 100) {
        pointsElement.innerHTML = 0
        pointsTally = 0
        winningElement.classList.toggle('winning')
        bodyElement.classList.toggle('body-gradient')
        winningElement.innerHTML = 'The goal of the quiz is to earn 100 points!'
    }

    //clear the canvas for the next upload
    context.clearRect(0, 0, 500, 500)

    //refocus on the user answer element for their next turn
    artistInput.focus()

    //clear the continue element
    continueElement.innerHTML = ''
    
    //clear the user answers and activate the input fields again
    artistInput.value = ''
    artistInput.disabled = false
    titleInput.value = ''
    titleInput.disabled = false
    dateInput.value = ''
    dateInput.disabled = false
   
    //clear the result text from the previous game
    nameResultElement.innerHTML = ''
    titleResultElement.innerHTML = ''
    dateResultElement.innerHTML = ''
    
    //select another random number from the length of the list of countries
    pageNumber = Math.floor(Math.random()*(100))
    
    //reset url
    url = `https://api.artic.edu/api/v1/artworks?page=${pageNumber}`
    
    //reset the hasanswered boolean
    hasAnswered = false
    
    //reallow the submit button
    submitButton.disabled = false
    
    height = 0
    width = 0

    //call getNewArtPiece function to select a new artwork
    getNewArtPiece()
})