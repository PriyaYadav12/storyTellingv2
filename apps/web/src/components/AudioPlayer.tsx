import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface AudioPlayerProps {
	audioUrl?: string;
	onPlayPause?: (isPlaying: boolean) => void;
}

export default function AudioPlayer({ audioUrl, onPlayPause }: AudioPlayerProps) {
	const [isPlaying, setIsPlaying] = useState(false);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(180);
	const [volume, setVolume] = useState(80);

	const handlePlayPause = () => {
		const newState = !isPlaying;
		setIsPlaying(newState);
		onPlayPause?.(newState);
	};

	const handleSkipBack = () => {
		setCurrentTime(Math.max(0, currentTime - 10));
		console.log("Skip back 10s");
	};

	const handleSkipForward = () => {
		setCurrentTime(Math.min(duration, currentTime + 10));
		console.log("Skip forward 10s");
	};

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, '0')}`;
	};

	return (
		<Card className="p-6 rounded-3xl space-y-4" data-testid="audio-player">
			<div className="space-y-2">
				<Slider
					value={[currentTime]}
					max={duration}
					step={1}
					onValueChange={(value) => setCurrentTime(value[0])}
					className="cursor-pointer"
					data-testid="slider-progress"
				/>
				<div className="flex justify-between text-sm text-muted-foreground">
					<span>{formatTime(currentTime)}</span>
					<span>{formatTime(duration)}</span>
				</div>
			</div>

			<div className="flex items-center justify-center gap-4">
				<Button
					size="icon"
					variant="ghost"
					onClick={handleSkipBack}
					data-testid="button-skip-back"
				>
					<SkipBack className="w-6 h-6" />
				</Button>

				<Button
					size="icon"
					className="w-14 h-14 rounded-full"
					onClick={handlePlayPause}
					data-testid="button-play-pause"
				>
					{isPlaying ? (
						<Pause className="w-6 h-6" fill="currentColor" />
					) : (
						<Play className="w-6 h-6" fill="currentColor" />
					)}
				</Button>

				<Button
					size="icon"
					variant="ghost"
					onClick={handleSkipForward}
					data-testid="button-skip-forward"
				>
					<SkipForward className="w-6 h-6" />
				</Button>
			</div>

			<div className="flex items-center gap-3">
				<Volume2 className="w-5 h-5 text-muted-foreground" />
				<Slider
					value={[volume]}
					max={100}
					step={1}
					onValueChange={(value) => setVolume(value[0])}
					className="cursor-pointer"
					data-testid="slider-volume"
				/>
			</div>
		</Card>
	);
}

