import html2canvas from 'html2canvas';
import API_KEY from './apikey.js';

const cards = document.querySelectorAll(".cards");
const next_btn = document.querySelector("#next");
const previous_btn = document.querySelector("#previous");
const heart_btn = document.querySelector("#heart-btn");
const download_btn = document.querySelector("#download");
const ui = document.querySelectorAll(".ui");

let max_count = 0
let current_count = 0
let advance_fetch = 15
let item_limit = 5
let page_ready = false

let quotes_dict = {

}

setInterval(async() => {
    if (current_count+item_limit > max_count) {
        let temp_num = max_count
        max_count += advance_fetch
        for (let i = temp_num; i < temp_num+advance_fetch; i++) {
            let bg = await fetch_bg()
            let quotes = await fetch_quote()
            quotes_dict[i] = {
                "image": bg,
                "quote": quotes[0],
                "author": quotes[1],
                "liked": false
            }
            page_ready = true
        }
    }
    try {
      present_image()
    } catch (error) {
      console.log("Fetching...")
    }
}, 200)

async function fetch_bg() {
    return await fetch("https://picsum.photos/600/300")
        .then((response) => response.blob())
        .then((data) => {
            let imageURL = URL.createObjectURL(data)
            console.log(imageURL)
            return imageURL
        });
}

async function fetch_quote() {
    return await fetch("https://api.api-ninjas.com/v1/quotes", {
        method: 'GET',
        headers: { 
            "Content-Type": 'application/json',
            'X-Api-Key': `${API_KEY}`
        },
    })
    .then((response) => response.json())
    .then((data) => {
        console.log(data[0].quote)
        return [data[0].quote, data[0].author]
    })
}

function old_qoute() {
    if(current_count <= 0) {
        return
    }
    current_count --
    heart_btn.checked = quotes_dict[current_count].liked
}

next_btn.addEventListener("click", () => {
    var num_q = Object.keys(quotes_dict).length
    if (num_q <= current_count+1) {
      return
    }
    current_count ++
    try {
      heart_btn.checked = quotes_dict[current_count].liked
    } catch (error) {
      console.info("slow down")

    }
})

previous_btn.addEventListener("click", old_qoute)

function present_image() {
    let data = quotes_dict[current_count]
    if(current_count+1 >= max_count) {
        cards[3].style.backgroundImage="none"
    } else {
        let next = quotes_dict[current_count+1]
        cards[3].style.backgroundImage=`url(${next.image})`
    }
    
    if (current_count == 0) {
        cards[0].style.backgroundImage="none"
    } else {
        let previous = quotes_dict[current_count-1]
        cards[0].style.backgroundImage=`url(${previous.image})`
    }
    cards[1].style.backgroundImage=`url(${data.image})`
    cards[1].querySelector(".quote").innerHTML = data.quote
    cards[1].querySelector(".author").innerHTML = `- ${data.author}`
    cards[2].style.backgroundImage=`url(${data.image})`
    cards[2].querySelector(".quote").innerHTML = data.quote
    cards[2].querySelector(".author").innerHTML = `- ${data.author}`
}

heart_btn.addEventListener('click', () => {
  if(!page_ready) {
    heart_btn.checked = false
    return
  }
    quotes_dict[current_count].liked = heart_btn.checked
})

download_btn.addEventListener("click", () => {
  toImage()
})

function getLines(ctx, text, maxWidth) {
  var words = text.split(" ");
  var lines = [];
  var currentLine = words[0];

  for (var i = 1; i < words.length; i++) {
      var word = words[i];
      var width = ctx.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
          currentLine += " " + word;
      } else {
          lines.push(currentLine);
          currentLine = word;
      }
  }
  lines.push(currentLine);
  return lines;
}

function toImage() {
  let author = quotes_dict[current_count].author
  let divElement = document.getElementById('display-quote');

  const uiNodes = divElement.getElementsByClassName('ui');

  for (let i = uiNodes.length - 1; i >= 0; i--) {
      uiNodes[i].parentNode.removeChild(uiNodes[i]);
  }
  
  html2canvas(divElement).then(canvas => {
    const imgData = canvas.toDataURL('image/png');

    // Create a link element for downloading
    const link = document.createElement('a');
    link.href = imgData;
    link.download = `Quote-by-${author}.png`; // Set the filename

    // Trigger the click event to start the download
    link.click();

    ui.forEach((i) => {
      i.style.display="flex"
    })
  });
}
