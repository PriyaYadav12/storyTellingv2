import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

type SceneImage = {
  url: string;
  description?: string | null;
  sceneNumber?: number | null;
};

interface StoryMediaPlayerProps {
  images: SceneImage[] | undefined | null;
  audioUrl?: string | null;
}

export function StoryMediaPlayer(props: StoryMediaPlayerProps) {
  const images = useMemo(() => (Array.isArray(props.images) ? props.images.filter((i) => !!i?.url) : []), [props.images]);
  const audioUrl = props.audioUrl ?? undefined;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const segmentDuration = useMemo(() => {
    if (!duration || images.length === 0) return 0;
    return duration / images.length;
  }, [duration, images.length]);

  const currentIndex = useMemo(() => {
    if (!segmentDuration || images.length === 0) return 0;
    const idx = Math.floor(currentTime / segmentDuration);
    return Math.min(images.length - 1, Math.max(0, idx));
  }, [currentTime, segmentDuration, images.length]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoaded = () => setDuration(audio.duration || 0);
    const onTime = () => setCurrentTime(audio.currentTime || 0);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
    };
  }, [audioUrl]);

  useEffect(() => {
    // Reset playback when inputs change
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setCurrentTime(0);
    setIsPlaying(false);
  }, [audioUrl, images.length]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        // ignore
      }
    }
  };

  const jumpToIndex = (index: number) => {
    const audio = audioRef.current;
    if (!audio || !segmentDuration) return;
    const clamped = Math.min(images.length - 1, Math.max(0, index));
    audio.currentTime = clamped * segmentDuration;
    setCurrentTime(audio.currentTime);
  };

  const goPrev = () => jumpToIndex(currentIndex - 1);
  const goNext = () => jumpToIndex(currentIndex + 1);

  if (!images.length) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-purple-100 dark:border-purple-900 bg-muted aspect-[16/9]">
      <div className="h-full w-full">
        {images[currentIndex]?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={images[currentIndex].url}
            alt={images[currentIndex]?.description || `Scene ${images[currentIndex]?.sceneNumber ?? currentIndex + 1}`}
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground">Loading image…</div>
        )}
      </div>

      {/* Left/Right controls */}
      <div className="absolute inset-y-0 left-0 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="m-2 rounded-full bg-background/60 hover:bg-background/80"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={goNext}
          disabled={currentIndex >= images.length - 1}
          className="m-2 rounded-full bg-background/60 hover:bg-background/80"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Bottom bar: play/pause & index */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-2 p-3 bg-gradient-to-t from-black/50 to-transparent text-white">
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="icon" onClick={togglePlay} className="rounded-full" disabled={!audioUrl}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <div className="text-xs opacity-80">
            {segmentDuration ? `${currentIndex + 1}/${images.length}` : ""}
          </div>
        </div>
        <div className="text-xs opacity-80">
          {duration
            ? `${Math.floor(currentTime)}/${Math.floor(duration)}s`
            : audioUrl
            ? "Loading audio…"
            : "Narration generating…"}
        </div>
      </div>

      {/* Hidden audio element synchronized with slideshow */}
      {audioUrl ? (
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
      ) : null}
    </div>
  );
}


