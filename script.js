let songs;
let currfolder

function formatSecondsToMinutesSeconds(seconds) {
  // Ensure seconds is a valid number
  if (isNaN(seconds) || seconds < 0) {
    return 'Invalid input';
  }

  // Calculate minutes and seconds
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  // Add leading zeros if necessary
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  // Return the formatted time
  return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder) {
  currfolder = folder;
  let a = await fetch(`http://127.0.0.1:5500/${currfolder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a")
  songs = []
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${currfolder}/`)[1]);
    }

  }
  // show all the song in playlist
  let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0];
  songUl.innerHTML = ""
  for (const song of songs) {
    songUl.innerHTML = songUl.innerHTML + `<li> 
        <img src="music .svg" alt="" />
        <div class="info">
          <div>${song.replaceAll("%20", " ")}</div>
          <div>Rishabh</div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
          <img class="invert" src="play.svg" alt="" />
        </div>
         </li>`;

  }


  //atttach an eventlistner to evry song
  Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
    e.addEventListener("click", element => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    })
  })
  return songs;
}
let currentSong = new Audio();
const playMusic = (track, pause = false) => {
  currentSong.src = `/${currfolder}/` + track;
  if (!pause) {

    currentSong.play();
    play.src = "pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00"


}

async function displayAlbums() {
  let a = await fetch(`http://127.0.0.1:5500/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  let cardContainer= document.querySelector(".cardContainer")
  div.innerHTML = response;
  let anchor = div.getElementsByTagName("a")
  
  Array.from(anchor).forEach(async e=>{
    if (e.href.includes("/songs")) {
      let folder = e.href.split("/").slice(-1)[0]
      
      //get metadata of a folder
      let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
      let response = await a.json();
      
      cardContainer.innerHTML = cardContainer.innerHTML + ` <div  data-folder="${folder}" class="card">
      <div  class="play">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 384 512"
          style="width: 20px; height: 20px"
        >
          <!--!Font Awesome Free 6.5.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
          <path
            d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"
          />
        </svg>
      </div>
      <img
        src= "/songs/${folder}/cover.jpg"
        alt=""
      />
      <h2>${response.title}</h2>
      <p>${response.description}</p>
    </div>`
    //load the playist whenever card is clicked

    Array.from(document.getElementsByClassName("card")).forEach(e=>{
      e.addEventListener("click" , async item=>{
        songs= await getSongs(`songs/${item.currentTarget.dataset.folder}`)
        playMusic(songs[0])
      })
    })
    }
  })

  
}

async function main() {


  //get all the songs

  await getSongs("songs/hiphop");
  playMusic(songs[0], true)

  // display all the aulbum
  displayAlbums();


  // adding event to play and pause

  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "pause.svg"
    }
    else {
      currentSong.pause();
      play.src = "play.svg"
    }
  })

  // listen for timeupdate listner
  currentSong.addEventListener("timeupdate", () => {

    document.querySelector(".songtime").innerHTML = `${formatSecondsToMinutesSeconds(currentSong.currentTime)} / ${formatSecondsToMinutesSeconds(currentSong.duration)}`
    document.querySelector("#circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";

  })
  // add a eventlistner to seekbar
  document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector("#circle").style.left = percent + "%";
    currentSong.currentTime = ((currentSong.duration) * percent) / 100;
  })
  // adding event istner for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0"
  })

  document.querySelector(".exit").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%"
  })
  // add an eventlistner to a previous 
  previous.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if ((index - 1) >= 0) {
      playMusic(songs[index - 1])
    }
  })
  // add an eventlistner to a next
  next.addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if ((index + 1) < songs.length) {
      playMusic(songs[index + 1])
    }
  })
  // add an event to volume
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100;
  })
  //add event listner to mute 
  document.querySelector(".volume img").addEventListener("click" , e=>{
    if(e.target.src.includes ("volume.svg")){
      e.target.src= e.target.src.replace("volume.svg" , "mute.svg");
      currentSong.volume= 0;
      
      document.querySelector(".range").getElementsByTagName("input")[0].value = 0
    }
    else{
      currentSong.volume= .1;
      e.target.src= e.target.src.replace("mute.svg" , "volume.svg");
      document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }
  } )

  

}


main();