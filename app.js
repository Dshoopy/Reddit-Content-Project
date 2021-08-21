const grid = document.querySelector(".grid");
var masonryItemCount = 0;
var lastRedditPost = "";
var postCount = 0;
var subreddit = "aww/hot";
var fetchBuffer = false;
var isLoadingVideos = false;
var videoArray = [[], [], []];

fetchContent(50);
console.log("TEST");

// Initializing masonry
var elem = document.querySelector(".grid");
var msnry = new Masonry(elem, {
  itemSelector: ".grid-item",
  fitWidth: true,

  transitionDuration: "0",
});

$(window).scroll(function () {
  if (
    $(window).scrollTop() + $(window).height() >=
    $(document).height() - window.innerHeight
  ) {
    fetchContent(50);
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
function LoadVideo(vArray1, vArray3, vArray2) {
  isLoadingVideos = true;
  if (vArray1.length <= 0) {
    isLoadingVideos = false;
    return;
  }
  var url = vArray1.pop();
  var name = vArray2.pop();
  var div = vArray3.pop();
  var myurl = url.slice(0, url.indexOf("DASH")) + "DASH_audio.mp4";
  var xhttp = new XMLHttpRequest();
  xhttp.open("HEAD", myurl);
  xhttp.onreadystatechange = function () {
    if (this.readyState == this.DONE) {
      if (
        this.status == "200" &&
        this.getResponseHeader("Content-Type") == "video/mp4"
      ) {
        const $muteButton = document.createElement("button");
        var muteButtonImg = document.createElement("img");
        muteButtonImg.src = "Images/mute-Image.png";
        muteButtonImg.classList = "mute-button-img";
        $muteButton.classList = "mute-button";
        $muteButton.textContent = "";
        // AUDIO ELEMENT
        const $audio = document.createElement("audio");
        $audio.muted = true;
        $audio.muted
          ? (muteButtonImg.src = "Images/mute-Image.png")
          : (muteButtonImg.src = "Images/unmute-Image.png");
        TestFunc(url)[1] ? null : ($audio.src = TestFunc(url)[0]);
        $muteButton.appendChild(muteButtonImg);
        div.appendChild($muteButton);
        div.appendChild($audio);
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
          if (!$audio.muted) {
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
      }
      //if(this.getResponseHeader("Content-Type") == "")
      // MUTE BUTTON
    }
  };
  xhttp.send();

  // SOURCE ELEMENT
  var source = document.createElement("source");
  source.src = url;

  // VIDEO ELEMENT
  const $video = document.createElement("video");
  $video.controls = "controls";
  $video.preload = "loadedmetadata";
  $video.id = name;
  $video.src = url;
  $video.classList = "grid-item-video";
  $($video)
    .last()
    .on("error", (event) => {
      alert("an error accured: " + event.message);
    });

  // APPEND

  $video.appendChild(source);
  $video.addEventListener("loadeddata", function () {
    if ($video.readyState >= 3) {
      document.getElementById("grid-item-img-placeholder" + name).remove();
      document.getElementById("grid-item-loading-img" + name).remove();
      div.appendChild($video);
      relaodLayout();
      LoadVideo(vArray1, vArray3, vArray2);
    }
  });
}

// Load images to the web page
function LoadImage(url, div, name) {
  var img = document.createElement("img");
  img.classList = "grid-item-img";
  img.src = url;
  img.id = name;
  img.onload = () => {
    document.getElementById("grid-item-img-placeholder" + name).remove();
    document.getElementById("grid-item-loading-img" + name).remove();
    div.appendChild(img);
    relaodLayout();
  };
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

function fetchContent(limit) {
  if (fetchBuffer) {
    return;
  }
  fetchBuffer = true;
  var posts = 0;
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
      for (let index = 0; posts < 12; index++) {
        //
        LastPost(submission[index].data.name);
        if (index == limit) {
          break;
        }

        if (checkURL(submission[index].data.url)) {
          if (!document.getElementById(submission[index].data.name)) {
            console.log(submission[index].data);
            posts++;
            var div = document.createElement("div");
            var div2 = document.createElement("div2");
            div2.classList = "grid-item-container";
            div.appendChild(div2);
            div.classList = "grid-item";
            div.id = submission[index].data.name;
            var img = document.createElement("img");
            var loadingGif = document.createElement("img");
            loadingGif.src = "Images/14844.gif";
            loadingGif.classList = "grid-item-loading-img";
            img.width = submission[index].data.preview.images[0].source.width;
            img.height = submission[index].data.preview.images[0].source.height;

            img.classList = "grid-item-img-placeholder";
            img.id = "grid-item-img-placeholder" + submission[index].data.name;
            loadingGif.id =
              "grid-item-loading-img" + submission[index].data.name;
            div2.appendChild(loadingGif);
            div2.appendChild(img);
            grid.appendChild(div);
            msnry.addItems(div);
            msnry.layout();
            LoadImage(
              submission[index].data.url,
              div2,
              submission[index].data.name
            );
          }
        } else if (
          submission[index].data.media &&
          submission[index].data.media.reddit_video != undefined
        ) {
          console.log(submission[index].data);
          posts++;
          var div = document.createElement("div");
          var div2 = document.createElement("div2");
          div2.classList = "grid-item-container";
          div.appendChild(div2);
          var img = document.createElement("img");
          var loadingGif = document.createElement("img");
          loadingGif.src = "Images/14844.gif";
          loadingGif.classList = "grid-item-loading-img";
          img.width = submission[index].data.preview.images[0].source.width;
          img.height = submission[index].data.preview.images[0].source.height;
          img.id = "grid-item-img-placeholder" + submission[index].data.name;
          loadingGif.id = "grid-item-loading-img" + submission[index].data.name;
          img.classList = "grid-item-video-placeholder";
          div.classList = "grid-item";
          div.id = submission[index].data.name;

          div2.appendChild(loadingGif);
          div2.appendChild(img);
          grid.appendChild(div);
          msnry.addItems(div);
          relaodLayout();
          videoArray[0].push(
            submission[index].data.media.reddit_video.fallback_url
          );
          videoArray[1].push(submission[index].data.name);
          videoArray[2].push(div2);
          if (!isLoadingVideos) {
            LoadVideo(videoArray[0], videoArray[2], videoArray[1]);
          }
        }
      }

      fetchBuffer = false;
    })
    .catch((err) => console.log(err));
}
