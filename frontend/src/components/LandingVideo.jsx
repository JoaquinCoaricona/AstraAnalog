import {useEffect, useRef, useState} from 'react';

const mediaPath = `${import.meta.env.BASE_URL}media/`;
const prefersStill = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches || Boolean(navigator.connection?.saveData);

export default function LandingVideo() {
  const videoRef = useRef(null);
  const frameRef = useRef(null);
  const [motionPaused, setMotionPaused] = useState(prefersStill);
  const [sourceReady, setSourceReady] = useState(false);
  const [visible, setVisible] = useState(true);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  // Pick once per mount: resizing never downloads a second rendition.
  const [file] = useState(() => window.matchMedia('(max-width: 800px)').matches ? 'astra-pendulum-768.mp4' : 'astra-pendulum-1280.mp4');

  useEffect(() => {
    if (sourceReady || motionPaused) return;
    // Paint the lightweight poster and text before starting the media download.
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(() => setSourceReady(true), {timeout: 1500});
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(() => setSourceReady(true), 250);
    return () => window.clearTimeout(id);
  }, [sourceReady, motionPaused]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {threshold: 0});
    observer.observe(frameRef.current);
    const onVisibility = () => setPageVisible(!document.hidden);
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const respectPreference = () => setMotionPaused(prefersStill());
    document.addEventListener('visibilitychange', onVisibility);
    motion.addEventListener('change', respectPreference);
    navigator.connection?.addEventListener('change', respectPreference);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      motion.removeEventListener('change', respectPreference);
      navigator.connection?.removeEventListener('change', respectPreference);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!sourceReady || motionPaused || !visible || !pageVisible || failed) {video.pause(); return;}
    let active = true;
    video.play().catch(error => {
      if (active && error.name !== 'AbortError') setMotionPaused(true);
    });
    return () => {active = false; video.pause();};
  }, [sourceReady, motionPaused, visible, pageVisible, failed]);

  return <div ref={frameRef} className="landing-media">
    <img className="landing-poster" src={`${mediaPath}astra-poster.jpg`} width="1280" height="720" alt="" fetchPriority="high" decoding="async"/>
    <video ref={videoRef} className={`landing-video ${ready && !failed ? 'is-ready' : ''}`} src={sourceReady ? `${mediaPath}${file}` : undefined} width="1280" height="720" muted playsInline loop preload="none" disablePictureInPicture aria-hidden="true" tabIndex={-1} onLoadedData={() => setReady(true)} onError={() => setFailed(true)}/>
  </div>;
}
