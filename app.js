const grid = document.querySelector(".grid");
var masonryItemCount = 0;
var lastRedditPost = "";
var postCount = 0;
var subreddit = "aww/hot";
var fetchBuffer = false;

fetchImages(25);
//Test

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

// Load images to the web page
function LoadImages(url, isVideo, name) {
  if (document.getElementById(name) != null) {
    return;
  }
  if (!isVideo) {
    var img = document.createElement("img");
  }

  const div = document.createElement("div");
  div.classList = "grid-item";
  div.id = "grid-item";

  if (isVideo) {
    var source = document.createElement("source");
    source.src = url;
    const $video = document.createElement("video");
    $video.controls = "controls";
    $video.preload = "loadedmetadata";
    $video.id = name;
    $video.src = url;
    $video.appendChild(source);
    $video.addEventListener("loadedmetadata", function () {
      div.appendChild($video);
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
        //console.log(submission[index].data);
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
