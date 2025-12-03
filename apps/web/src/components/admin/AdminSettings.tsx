import { EditableThemes } from "./settings/editable/EditableThemes";
import { EditableLessons } from "./settings/editable/EditableLessons";
import { ReadOnlyStructures } from "./settings/readonly/ReadOnlyStructures";
import { ReadOnlyFlavorOpenings } from "./settings/readonly/ReadOnlyFlavorOpenings";
import { ReadOnlyFlavorEndings } from "./settings/readonly/ReadOnlyFlavorEndings";
import { ReadOnlyFlavorPayoffs } from "./settings/readonly/ReadOnlyFlavorPayoffs";
import { ReadOnlyFlavorObstacles } from "./settings/readonly/ReadOnlyFlavorObstacles";
import { ReadOnlyFlavorMagicalTriggers } from "./settings/readonly/ReadOnlyFlavorMagicalTriggers";

export function AdminSettings() {
	return (
		<div className="space-y-6">
			{/* Editable Sections */}
			<EditableThemes />
			<EditableLessons />

			{/* Read-only Sections */}
			<ReadOnlyStructures />
			<ReadOnlyFlavorOpenings />
			<ReadOnlyFlavorEndings />
			<ReadOnlyFlavorPayoffs />
			<ReadOnlyFlavorObstacles />
			<ReadOnlyFlavorMagicalTriggers />
		</div>
	);
}
