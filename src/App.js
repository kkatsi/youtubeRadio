import { useState, useEffect } from "react";
import "./SCSS/App.scss";
import axios from "axios";
import ReactPlayer from "react-player";
import { BsFillPlayFill, BsFillPauseFill } from "react-icons/bs";
import { GiPocketRadio, GiSettingsKnobs } from "react-icons/gi";
import { AiOutlineLoading } from "react-icons/ai";
import { MdVolumeUp, MdVolumeOff } from "react-icons/md";
import Grid from "@material-ui/core/Grid";
import Slider from "@material-ui/core/Slider";

function App() {
  let photoUrl, photoWidth, photoHeight;
  const [url, setUrl] = useState("");
  const [play, setPlay] = useState(false);
  const [data, setData] = useState();
  const [index, setIndex] = useState(0);
  const [playText, setPlayText] = useState(
    <div style={{ marginLeft: "1rem" }}>
      <BsFillPlayFill />
    </div>
  );

  const [countryName, setCountryName] = useState("GR");
  const [songName, setSongName] = useState("");
  // const [songPhoto, setSongPhoto] = useState("");

  const [volumeValue, setVolumeValue] = useState(100);
  const [prevVolumeValue, setPrevVolumeValue] = useState();

  const handleChange = (event, newValue) => {
    setVolumeValue(newValue);
  };

  // useEffect(() => {
  //   document.querySelector(".content").style.height =
  //     document.querySelector(".App").clientHeight -
  //     20 -
  //     document.querySelector("header").clientHeight +
  //     "px";
  // }, []);

  function requestData() {
    axios({
      method: "get",
      url: `https://youtube.googleapis.com/youtube/v3/videos`,
      params: {
        part: "snippet",
        chart: "mostPopular",
        regionCode: "GR",
        videoCategoryId: "10",
        maxResults: "50",
        key: process.env.REACT_APP_YOUTUBE_API_KEY,
      },
    }).then((res) => {
      console.log(res.data);
      const unshuffled = res.data.items;
      const shuffled = unshuffled
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
      res.data.items = shuffled;
      setUrl(`https://www.youtube.com/watch?v=${res.data.items[0].id}`);
      console.log(res.data.items[0]);
      setSongName(res.data.items[0].snippet.localized.title);
      if (window.innerWidth > 786) {
        photoUrl = res.data.items[0].snippet.thumbnails.high.url;
        photoWidth = res.data.items[0].snippet.thumbnails.high.width;
        photoHeight = res.data.items[0].snippet.thumbnails.high.height;
      } else {
        photoUrl = res.data.items[0].snippet.thumbnails.medium.url;
        photoWidth = res.data.items[0].snippet.thumbnails.medium.width;
        photoHeight = res.data.items[0].snippet.thumbnails.medium.height;
      }
      document.querySelector(
        ".songPhoto"
      ).style.backgroundImage = `url(${photoUrl})`;
      document.querySelector(".songPhoto").style.width = photoWidth + "px";
      document.querySelector(".songPhoto").style.height = photoHeight + "px";
      // document.querySelector(".App").style.backgroundColor = "transparent";

      setPlay(true);
      setIndex(0);
      setData(res.data);
    });
  }

  // useEffect(() => {
  //   if (data) {
  //     if (index === data.items.length) requestData(data.nextPageToken);
  //   }
  // }, [index, data, requestData]);

  function handlePlay() {
    if (!play) {
      if (!data) {
        document.querySelector(".playButton").classList.add("move");
        setPlayText(
          <div className="loading">
            <AiOutlineLoading />
          </div>
        );
        requestData();
        return;
      }
      setPlay(true);
      return;
    }
    setPlay(false);
  }

  function playNext() {
    setIndex((prevIndex) => prevIndex + 1);
    if (index < data.items.length - 1) {
      setUrl(`https://www.youtube.com/watch?v=${data.items[index + 1].id}`);
      setSongName(data.items[index + 1].snippet.localized.title);
      if (window.innerWidth > 786) {
        photoUrl = data.items[index + 1].snippet.thumbnails.high.url;
        photoWidth = data.items[index + 1].snippet.thumbnails.high.width;
        photoHeight = data.items[index + 1].snippet.thumbnails.high.height;
      } else {
        photoUrl = data.items[index + 1].snippet.thumbnails.medium.url;
        photoWidth = data.items[index + 1].snippet.thumbnails.medium.width;
        photoHeight = data.items[index + 1].snippet.thumbnails.medium.height;
      }
      document.querySelector(
        ".songPhoto"
      ).style.backgroundImage = `url(${photoUrl})`;
      document.querySelector(".songPhoto").style.width = photoWidth + "px";
      document.querySelector(".songPhoto").style.height = photoHeight + "px";
      // console.log(data.items[index].id);
    }
  }

  function mute(e) {
    if (volumeValue === 0) {
      setVolumeValue(prevVolumeValue);
      return;
    }
    setPrevVolumeValue(volumeValue);
    setVolumeValue(0);
  }

  return (
    <div className="App">
      {/* <div
        className="bg-image"
        style={{ backgroundImage: `url(${songPhoto})` }}
      ></div>
      <div className="overlay"></div> */}
      <header>
        YT Radio <GiPocketRadio />
      </header>

      <div className="content">
        <div className="songPhoto"></div>
        <div className="volumeSettings">
          <span onClick={mute}>
            {volumeValue !== 0 ? <MdVolumeUp /> : <MdVolumeOff />}
          </span>
          <Grid item xs>
            <Slider
              value={volumeValue}
              onChange={handleChange}
              aria-labelledby="continuous-slider"
              style={{ marginLeft: ".5rem" }}
            />
          </Grid>
        </div>
        <span className="songName">
          {songName !== "" ? (
            <>
              <span className="playingNow">Playing Now: </span>
              <span>{songName}</span>
            </>
          ) : (
            ""
          )}
        </span>
        <div className="countrySettings">
          <span>{countryName}</span>
          <span>
            <GiSettingsKnobs />
          </span>
        </div>

        <button className="playButton" onClick={handlePlay}>
          {playText}
        </button>
      </div>

      <ReactPlayer
        style={{ display: "none" }}
        volume={volumeValue / 100}
        muted={false}
        url={url}
        playing={play}
        onPlay={() => {
          setPlay(true);
          setPlayText(<BsFillPauseFill />);
        }}
        onPause={() => {
          setPlay(false);
          setPlayText(
            <div style={{ marginLeft: "1rem" }}>
              <BsFillPlayFill />
            </div>
          );
        }}
        onReady={() =>
          setPlayText(
            <div className="loading">
              <AiOutlineLoading />
            </div>
          )
        }
        onSeek={() =>
          setPlayText(
            <div className="loading">
              <AiOutlineLoading />
            </div>
          )
        }
        onBuffer={() => {
          setPlay(false);
          setPlayText(
            <div className="loading">
              <AiOutlineLoading />
            </div>
          );
        }}
        onEnded={playNext}
        controls={true}
      />
    </div>
  );
}

export default App;
