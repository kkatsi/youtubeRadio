import { useState, useEffect } from "react";
import axios from "axios";

export default function useGetTrends(country) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios({
      method: "get",
      url: `https://youtube.googleapis.com/youtube/v3/videos`,
      params: {
        part: "snippet",
        chart: "mostPopular",
        regionCode: country,
        videoCategoryId: "10",
        maxResults: "50",
        key: process.env.REACT_APP_YOUTUBE_API_KEY,
      },
    }).then((res) => {
      const unshuffled = res.data.items;
      const shuffled = unshuffled
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);
      res.data.items = shuffled;
      setData(res.data);
      setLoading(false);
    });
  }, [country]);
  return {
    data,
    loading,
  };
}
