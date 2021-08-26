import { useState, useEffect } from "react";
import "./SCSS/App.scss";
import axios from "axios";
import ReactPlayer from "react-player";
import { BsFillPlayFill, BsFillPauseFill } from "react-icons/bs";
import { GiPocketRadio } from "react-icons/gi";
import { AiOutlineLoading } from "react-icons/ai";

function App() {
  const [url, setUrl] = useState("");
  const [play, setPlay] = useState(false);
  const [data, setData] = useState();
  const [index, setIndex] = useState(0);
  const [playText, setPlayText] = useState(
    <div style={{ marginLeft: "1rem" }}>
      <BsFillPlayFill />
    </div>
  );

  useEffect(() => {
    document.querySelector(".content").style.height =
      document.querySelector(".App").clientHeight -
      20 -
      document.querySelector("header").clientHeight +
      "px";
  }, []);

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
      console.log(data.items[index].id);
    }
  }

  return (
    <div className="App">
      <header>
        YT Radio <GiPocketRadio />
      </header>
      <div className="content">
        <button className="playButton" onClick={handlePlay}>
          {playText}
        </button>
      </div>

      <ReactPlayer
        style={{ display: "none" }}
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
