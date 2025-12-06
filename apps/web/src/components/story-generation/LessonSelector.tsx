import MoralLessonCard from "../MoralLessonCard";
import { getLessonMetadata } from "@/lib/formConstant";

interface LessonSelectorProps {
	lessons: string[];
	selectedLesson: string | null;
	onLessonChange: (lesson: string) => void;
}

export default function LessonSelector({
	lessons,
	selectedLesson,
	onLessonChange,
}: LessonSelectorProps) {
	return (
		<div>
			<h3 className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-left">
				What lesson should we learn?
			</h3>
			<div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 justify-center md:justify-start">
				{lessons.map((lessonName: string) => {
					const { icon } = getLessonMetadata(lessonName);
					return (
						<MoralLessonCard
							key={lessonName}
							icon={icon}
							title={lessonName}
							isSelected={selectedLesson === lessonName}
							onClick={() => onLessonChange(lessonName)}
						/>
					);
				})}
			</div>
		</div>
	);
}
