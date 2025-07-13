import { useEffect, useState } from "react";

export const PreserveScroll = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleScroll = () => {
    const position = window.scrollY;
    if (position !== 0) {
      setScrollPosition(position);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (scrollPosition !== 0) {
      localStorage.setItem("scrollPosition", (scrollPosition + 10).toString());
    }
  }, [scrollPosition]);

  useEffect(() => {
    const savedScrollPosition = localStorage.getItem("scrollPosition");
    if (savedScrollPosition !== null) {
      setScrollPosition(parseInt(savedScrollPosition));
      window.scrollTo(0, parseInt(savedScrollPosition));
    }
  }, []);

  useEffect(() => {
    const handlePageRefresh = (event: Event) => {
      event.preventDefault();
      if (scrollPosition === 0 && window.scrollY !== 0) {
        localStorage.setItem("scrollPosition", "0");
        setScrollPosition(0);
      }
    };

    window.addEventListener("beforeunload", handlePageRefresh);

    return () => {
      window.removeEventListener("beforeunload", handlePageRefresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};