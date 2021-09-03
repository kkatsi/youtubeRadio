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
import SimplexNoise from "simplex-noise";

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
  const [disabled, setDisabled] = useState(true);

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
      setUrl(`https://www.youtube.com/embed/${data.items[index].id}`);
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

  function initWaves() {
    let i = 0;
    const canvas = {
      playing: true,
      toggle() {
        this.playing = !this.playing;
      },
      init() {
        this.ele = document.querySelector("#waves");

        if (i === 0) {
          this.resize();
          i++;
        }
        // window.addEventListener("resize", () => this.resize(), false);
        this.ctx = this.ele.getContext("2d");
        return this.ctx;
      },
      // onResize(callback) {
      //   this.resizeCallback = callback;
      // },
      resize() {
        this.width = this.ele.width = window.innerWidth * 2;
        this.height = this.ele.height = window.innerHeight * 2;
        if (window.innerWidth < 550) {
          this.ele.style.width = this.ele.width * 0.2 + "px";
          this.ele.style.height = this.ele.height * 0.2 + "px";
        } else {
          this.ele.style.width = this.ele.width * 0.5 + "px";
          this.ele.style.height = this.ele.height * 0.5 + "px";
        }

        this.ctx = this.ele.getContext("2d");
        this.ctx.scale(2, 2);
        this.resizeCallback && this.resizeCallback();
      },
      run(callback) {
        requestAnimationFrame(() => {
          this.run(callback);
        });
        callback(this.ctx);
      },
    };

    const ctx = canvas.init();

    let objects = [];

    class Wave {
      vectors = [];
      constructor(color) {
        this.color = color;
        this.noise = new SimplexNoise(Math.random());
      }

      drawLine() {
        ctx.strokeStyle = this.color;
        for (let i = 0; i < this.vectors.length; i++) {
          ctx.beginPath();
          const { x, y } = this.vectors[i];
          ctx.lineCap = "round";
          ctx.lineWidth = 2;
          ctx.moveTo(0, 0);
          ctx.lineTo(x, y);
          ctx.closePath();
          ctx.stroke();
        }
      }

      draw(t) {
        ctx.save();
        ctx.translate(window.innerWidth * 0.5, window.innerHeight * 0.5);

        const base = 180;
        const scale = 20;
        this.vectors = [];

        for (let degree = 0; degree < 180; degree++) {
          const radius = (degree / 90) * Math.PI;
          const length =
            base +
            this.noise.noise3D(Math.cos(radius), Math.sin(radius), t) * scale;

          this.vectors.push({
            x: length * Math.cos(radius),
            y: length * Math.sin(radius),
          });
        }
        this.drawLine();

        ctx.restore();
      }
    }

    const init = () => {
      objects = [];
      objects.push(new Wave("#c00"));
    };

    init();

    let tick = 0;
    canvas.run((ctx) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      tick += 0.05;
      objects.forEach((obj) => {
        obj.draw(tick);
      });
    });

    // canvas.onResize(() => {
    //   init();
    // });
  }

  useEffect(() => {
    initWaves();
    document.querySelector("canvas").style.display = "none";
  }, []);

  useEffect(() => {
    if (!loading && firstUpdate.current) {
      playNext();
      console.log("it run");
    }
  }, [data, loading, playNext, justGoToNext]);

  useEffect(() => {
    console.log(disabled);
  }, [disabled]);

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
          <span onClick={mute} className="volumeIcon">
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
      </div>

      <button className="playButton" onClick={handlePlay}>
        {playText}
      </button>

      <canvas id="waves"></canvas>

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
            onChange={(event, value) => {
              setSelectedValue(value.Code);
              setDisabled(false);
              console.log("this");
            }}
            defaultValue={{ Code: "GR", Name: "Greece" }}
            renderInput={(params) => <TextField {...params} margin="normal" />}
          />
          <div style={{ textAlign: "center" }}>
            <button
              className="save-button"
              disabled={disabled || false}
              onClick={() => {
                setCountryName(selectedValue);
                setIndex(0);
                setJustGoToNext((prev) => !prev);
                closeSettings();
                setDisabled(true);
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>

      <ReactPlayer
        controls={true}
        style={{ display: "none" }}
        // style={{ zIndex: 5 }}
        playsinline={true}
        volume={volumeValue / 100}
        muted={false}
        url={url}
        playing={play}
        config={{
          youtube: {
            onUnstarted: function () {
              setPlay(true);
              setPlayText(<BsFillPauseFill />);
              document.querySelector("canvas").style.display = "block";
            },
          },
        }}
        onPlay={() => {
          setPlay(true);
          setPlayText(<BsFillPauseFill />);
          document.querySelector("canvas").style.display = "block";
        }}
        onPause={() => {
          setPlay(false);
          setPlayText(
            <div style={{ marginLeft: "1rem" }}>
              <BsFillPlayFill />
            </div>
          );
          document.querySelector("canvas").style.display = "none";
        }}
        onReady={() => {
          setPlay(true);
          setPlayText(
            <div className="loading">
              <AiOutlineLoading />
            </div>
          );
        }}
        onSeek={() => {
          setPlayText(
            <div className="loading">
              <AiOutlineLoading />
            </div>
          );
          document.querySelector("canvas").style.display = "none";
        }}
        onBuffer={() => {
          setPlay(false);
          setPlayText(
            <div className="loading">
              <AiOutlineLoading />
            </div>
          );
          document.querySelector("canvas").style.display = "none";
        }}
        onEnded={() => setJustGoToNext((prev) => !prev)}
      />
    </div>
  );
}

export default App;
