import { useState, useEffect, useCallback, useRef } from "react";
import "./SCSS/App.scss";
// import axios from "axios";
import ReactPlayer from "react-player";
import { BsFillPlayFill, BsFillPauseFill } from "react-icons/bs";
import { GiSettingsKnobs } from "react-icons/gi";
import { GrClose } from "react-icons/gr";
import { AiOutlineLoading } from "react-icons/ai";
import { MdVolumeUp, MdVolumeOff } from "react-icons/md";
import Grid from "@material-ui/core/Grid";
import Slider from "@material-ui/core/Slider";
import randomColor from "randomcolor";
import logo from "./assets/Untitled-1.png";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import countries from "./assets/countries.json";
import useGetTrends from "./Hooks/useGetTrends";

function App() {
  const [url, setUrl] = useState("");
  const [play, setPlay] = useState(false);
  const [index, setIndex] = useState(0);
  const [rColor, setRColor] = useState(randomColor());
  const [playText, setPlayText] = useState(
    <div style={{ marginLeft: "1rem" }}>
      <BsFillPlayFill />
    </div>
  );

  const defaultProps = {
    options: countries,
    getOptionLabel: (option) => option.Name,
  };

  const [countryName, setCountryName] = useState("GR");
  const [songName, setSongName] = useState("");
  const [selectedValue, setSelectedValue] = useState("GR");

  const [volumeValue, setVolumeValue] = useState(100);
  const [prevVolumeValue, setPrevVolumeValue] = useState();

  const [justGoToNext, setJustGoToNext] = useState(false);

  const { data, loading } = useGetTrends(countryName);

  const handleChange = (event, newValue) => {
    setVolumeValue(newValue);
  };

  const playNext = useCallback(() => {
    console.log(data);
    let photoUrl, photoWidth, photoHeight;
    if (data && index < data.items?.length - 1) {
      setUrl(`https://www.youtube.com/watch?v=${data.items[index].id}`);
      setSongName(data.items[index].snippet.localized.title);
      if (window.innerWidth > 786) {
        photoUrl = data.items[index].snippet.thumbnails.high.url;
        photoWidth = data.items[index].snippet.thumbnails.high.width;
        photoHeight = data.items[index].snippet.thumbnails.high.height;
      } else {
        photoUrl = data.items[index].snippet.thumbnails.medium.url;
        photoWidth = data.items[index].snippet.thumbnails.medium.width;
        photoHeight = data.items[index].snippet.thumbnails.medium.height;
      }
      document.querySelector(
        ".songPhoto"
      ).style.backgroundImage = `url(${photoUrl}), linear-gradient(350deg, #181818, ${rColor}40)`;
      document.querySelector(
        ".songPhoto"
      ).style.backgroundColor = `${rColor}25`;
      document.querySelector(".songPhoto").style.width = photoWidth + "px";
      document.querySelector(".songPhoto").style.height = photoHeight + "px";
      document.querySelector(
        ".App"
      ).style.background = `linear-gradient(350deg, #181818 38%,${rColor} 100%)`;
      setRColor(randomColor());
      // console.log(data.items[index].id);
      if (index === 0) setPlay(true);
      setIndex((prevIndex) => prevIndex + 1);
    }
  }, [data, justGoToNext]);

  const firstUpdate = useRef(false);

  useEffect(() => {
    if (!loading && firstUpdate.current) {
      playNext();
      console.log("it run");
    }
  }, [data, loading, playNext, justGoToNext]);

  function handlePlay() {
    if (!play) {
      if (index === 0) {
        document.querySelector(".playButton").classList.add("move");
        setPlayText(
          <div className="loading">
            <AiOutlineLoading />
          </div>
        );
        firstUpdate.current = true;
        console.log(index);
        playNext();
        return;
      }
      setPlay(true);
      return;
    }
    setPlay(false);
  }

  function mute(e) {
    if (volumeValue === 0) {
      setVolumeValue(prevVolumeValue);
      return;
    }
    setPrevVolumeValue(volumeValue);
    setVolumeValue(0);
  }

  function swipeScreen() {
    document.querySelector(".location-settings").classList.add("openSettings");
    document
      .querySelector(".location-settings")
      .classList.remove("closeSettings");
  }

  function closeSettings() {
    document
      .querySelector(".location-settings")
      .classList.remove("openSettings");
    document.querySelector(".location-settings").classList.add("closeSettings");
  }

  return (
    <div className="App">
      {/* <div
        className="bg-image"
        style={{ backgroundImage: `url(${songPhoto})` }}
      ></div>
      <div className="overlay"></div> */}
      <header>
        <img src={logo} style={{ margin: "auto" }} alt="logo" />
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
              style={{ marginLeft: "1rem" }}
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
        <div className="countrySettings" onClick={swipeScreen}>
          <span>{countryName}</span>
          <span>
            <GiSettingsKnobs />
          </span>
        </div>

        <button className="playButton" onClick={handlePlay}>
          {playText}
        </button>
      </div>

      <div className="location-settings">
        <div className="top">
          <GrClose
            color="red"
            style={{ fontSize: "1.3rem", cursor: "pointer" }}
            onClick={closeSettings}
          />
          <span className="title">Country Settings</span>
        </div>
        <div className="select">
          <span>Playing the trends in:</span>
          <Autocomplete
            {...defaultProps}
            id="auto-select"
            autoComplete
            onChange={(event, value) => setSelectedValue(value.Code)}
            defaultValue={{ Code: "GR", Name: "Greece" }}
            renderInput={(params) => <TextField {...params} margin="normal" />}
          />
          <div style={{ textAlign: "center" }}>
            <button
              className="save-button"
              onClick={() => {
                setCountryName(selectedValue);
                setIndex(0);
                setJustGoToNext((prev) => !prev);
                closeSettings();
              }}
            >
              Save
            </button>
          </div>
        </div>
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
        onReady={() => {
          setPlay(true);
          setPlayText(
            <div className="loading">
              <AiOutlineLoading />
            </div>
          );
        }}
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
        onEnded={() => setJustGoToNext((prev) => !prev)}
        // controls={true}
      />
    </div>
  );
}

export default App;
