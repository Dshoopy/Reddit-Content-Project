const grid = document.querySelector(".grid");
var masonryItemCount = 0;
var lastRedditPost = "";
var postCount = 0;
var subreddit = "aww/hot";
var fetchBuffer = false;

fetchImages(25);
console.log("TEST");

// Initializing masonry
var elem = document.querySelector(".grid");
var msnry = new Masonry(elem, {
  itemSelector: ".grid-item",
  fitWidth: true,

  transitionDuration: "0",
});

// Refresh masonry layouth after images are loaded
window.addEventListener("load", (event) => {
  var image = document.querySelector("img");
  var isLoaded = image.complete && image.naturalHeight !== 0;
  imagesLoaded(elem, function () {
    msnry.layout();
  });
});

$(window).scroll(function () {
  if (
    $(window).scrollTop() + $(window).height() >=
    $(document).height() - window.innerHeight
  ) {
    fetchImages();
  }
});

// Reloads masonry layout
function relaodLayout() {
  msnry.layout();
}

//TEst
function TestFunc(url) {
  var returnVal;
  var returnVal2;

  returnVal = url.slice(0, url.indexOf("DASH"));
  returnVal += "DASH_audio.mp4";

  var xhttp = new XMLHttpRequest();
  xhttp.open("HEAD", returnVal);
  xhttp.onreadystatechange = function () {
    if (this.readyState == this.DONE) {
      if (
        this.status == "200" &&
        this.getResponseHeader("Content-Type") == "video/mp4"
      ) {
        returnVal2 = true;
      } else {
        returnVal2 = false;
      }
    }
  };

  xhttp.send();

  return [returnVal, returnVal2];
}

// Load images to the web page
function LoadImages(url, isVideo, name) {
  if (document.getElementById(name) != null) {
    return;
  }
  if (!isVideo) {
    var img = document.createElement("img");
    img.classList = "grid-item-img";
  }

  const div = document.createElement("div");
  div.classList = "grid-item";
  div.id = "grid-item";

  if (isVideo) {
    var source = document.createElement("source");
    source.src = url;
    var muteButtonImg = document.createElement("img");
    muteButtonImg.src = "Images/mute-Image.png";
    muteButtonImg.classList = "mute-button-img";
    const $video = document.createElement("video");
    const $audio = document.createElement("audio");
    const $muteButton = document.createElement("button");

    TestFunc(url)[1] ? null : ($audio.src = TestFunc(url)[0]);

    $video.controls = "controls";
    $video.preload = "loadedmetadata";
    $video.id = name;
    $video.src = url;
    $video.classList = "grid-item-video";
    $muteButton.classList = "mute-button";
    $muteButton.textContent = "";
    $audio.muted = true;
    $audio.muted
      ? (muteButtonImg.src = "Images/mute-Image.png")
      : (muteButtonImg.src = "Images/unmute-Image.png");

    $muteButton.addEventListener("click", function () {
      if ($audio.muted) {
        console.log("unmute");
        $audio.muted = false;
        muteButtonImg.src = "Images/unmute-Image.png";
        return;
      } else {
        console.log("mute");
        $audio.muted = true;
        muteButtonImg.src = "Images/mute-Image.png";
        return;
      }
    });

    $video.addEventListener("error", function (event) {
      JSON.stringify(event);
    });
    $video.addEventListener("play", function () {
      $video.preload = "auto";
      if (!$audio.muted) {
        $audio.play();
      }

      $audio.currentTime = $video.currentTime;
    });
    $video.addEventListener("waiting", function () {
      $audio.pause();
      $audio.currentTime = $video.currentTime;
    });
    $video.addEventListener("playing", function () {
      if ($audio.muted) {
        $audio.play();
      }
      $audio.currentTime = $video.currentTime;
    });
    $video.addEventListener("pause", function () {
      $audio.pause();
      $video.preload = "none";
      $audio.currentTime = $video.currentTime;
    });

    $video.addEventListener("timeupdate", function () {
      if ($audio.muted) {
        $audio.play();
      }
    });
    $muteButton.appendChild(muteButtonImg);
    $video.appendChild(source);
    div.appendChild($muteButton);
    $video.addEventListener("loadedmetadata", function () {
      div.appendChild($video);
      div.appendChild($audio);
      grid.appendChild(div);
      msnry.addItems(div);
      msnry.layout();
    });
  } else {
    img.src = url;
    img.id = name;
    img.onload = () => {
      div.appendChild(img);
      grid.appendChild(div);
      msnry.addItems(div);
      msnry.layout();
    };
  }
}

//Scans given url for data type
function checkURL(url) {
  return /png|jpg/g.test(url);
}

function LastPost(name) {
  if (!name) {
    return lastRedditPost;
  }
  lastRedditPost = name;
}

function fetchImages(limit) {
  if (fetchBuffer) {
    return;
  }
  fetchBuffer = true;

  var url =
    "https://www.reddit.com/r/" + subreddit + ".json" + "?limit=" + limit;
  if (LastPost() != "" && LastPost() != undefined) {
    console.log(LastPost());
    url =
      "https://www.reddit.com/r/" +
      subreddit +
      ".json" +
      "?limit=" +
      limit +
      "&after=" +
      LastPost();
    console.log(url);
  }
  fetchImg = fetch(url)
    .then((res) => res.json())
    .then((data) => data.data.children)
    .then((submission) => {
      for (let index = 0; index < submission.length; index++) {
        LastPost(submission[index].data.name);
        if (checkURL(submission[index].data.url)) {
          LoadImages(
            submission[index].data.url,
            false,
            submission[index].data.name
          );
        } else if (
          submission[index].data.media &&
          submission[index].data.media.reddit_video != undefined
        ) {
          LoadImages(
            submission[index].data.media.reddit_video.fallback_url,
            true,
            submission[index].data.name
          );
        }
      }
      fetchBuffer = false;
    })
    .catch((err) => console.log(err));
}
