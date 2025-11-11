import { useEffect, useMemo, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { COLORS, ANIMALS } from "@/lib/constants";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

type Gender = "male" | "female" | "other";

export default function ProfileForm() {
	const navigate = useNavigate();
	const profile = useQuery(api.userProfiles.getProfile);
	const profilePhotoUrl = useQuery(api.userProfiles.getProfilePhotoUrl);
	const updateProfile = useMutation(api.userProfiles.updateProfile);
	const generateUploadUrl = useMutation(api.userProfiles.generateProfilePictureUploadUrl);
	const setProfilePicture = useMutation(api.userProfiles.setProfilePicture);
	const generateAndStoreAvatar = useAction(api.userProfiles.generateAndStoreAvatar);

	const [formData, setFormData] = useState({
		parentName: "",
		childName: "",
		childAge: "",
		childNickName: "",
		childGender: "male" as Gender,
		favoriteColor: "",
		favoriteAnimal: "",
	});
	const [childPhoto, setChildPhoto] = useState<File | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

	useEffect(() => {
		if (!profile) return;
		setFormData({
			parentName: profile.parentName ?? "",
			childName: profile.childName ?? "",
			childAge: (profile.childAge ?? "").toString(),
			childNickName: profile.childNickName ?? "",
			childGender: (profile.childGender ?? "male") as Gender,
			favoriteColor: profile.favoriteColor ?? "",
			favoriteAnimal: profile.favoriteAnimal ?? "",
		});
	}, [profile]);

	useEffect(() => {
		if (!childPhoto) {
			setPreviewUrl(null);
			return;
		}

		const objectUrl = URL.createObjectURL(childPhoto);
		setPreviewUrl(objectUrl);

		return () => {
			URL.revokeObjectURL(objectUrl);
		};
	}, [childPhoto]);

	const genderOptions = useMemo(
		() => [
			{ label: "Female", value: "female" as Gender },
			{ label: "Male", value: "male" as Gender },
			{ label: "Other", value: "other" as Gender },
		],
		[],
	);

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSaving(true);
		try {
			await updateProfile({
				parentName: formData.parentName,
				childName: formData.childName,
				childAge: parseInt(formData.childAge),
				childGender: formData.childGender,
				childNickName: formData.childNickName || undefined,
				favoriteColor: formData.favoriteColor || undefined,
				favoriteAnimal: formData.favoriteAnimal || undefined,
			});

			if (childPhoto) {
				try {
					setIsUploadingPhoto(true);
					const uploadUrl = await generateUploadUrl({});
					const res = await fetch(uploadUrl, {
						method: "POST",
						headers: { "Content-Type": childPhoto.type || "application/octet-stream" },
						body: childPhoto,
					});
					if (!res.ok) {
						throw new Error("Upload failed");
					}
					const json = (await res.json()) as { storageId?: string };
					if (json?.storageId) {
						await setProfilePicture({ storageId: json.storageId });
						try {
							await generateAndStoreAvatar({});
						} catch {
							// Non-blocking
						}
					}
					setChildPhoto(null);
				} catch (_err) {
					toast.error("Photo upload failed. Please try again later.");
				} finally {
					setIsUploadingPhoto(false);
				}
			}

			toast.success("Profile updated");
		} catch (_err) {
			toast.error("Failed to update profile");
		} finally {
			setIsSaving(false);
		}
	};

	if (profile === undefined) {
		return (
			<div className="flex items-center justify-center py-16">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
			</div>
		);
	}

	return (
		<div className="container mx-auto max-w-3xl px-4 py-8">
			<h1 className="text-2xl font-semibold mb-6">Profile</h1>
			<Button
				variant="ghost"
				onClick={() => navigate({ to: "/dashboard" })}
				className="mb-6"
			>
				<ArrowLeft className="h-4 w-4 mr-2" />
				Back to Dashboard
			</Button>
			<div className="flex justify-center mb-6">
				<img
					src={previewUrl ?? profilePhotoUrl ?? ""}
					alt="Profile"
					className="h-24 w-24 rounded-full object-cover border border-muted-foreground/40"
				/>
			</div>
			<Card>
				<CardContent className="p-6">
					<form onSubmit={(e) => void handleSave(e)} className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label htmlFor="parentName" className="block text-sm font-medium mb-2">
									Parent's Name
								</label>
								<Input
									id="parentName"
									value={formData.parentName}
									onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
									placeholder="Enter your name"
								/>
							</div>
							<div>
								<label htmlFor="childName" className="block text-sm font-medium mb-2">
									Child's Name
								</label>
								<Input
									id="childName"
									value={formData.childName}
									onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
									placeholder="Enter child's name"
								/>
							</div>
							<div>
								<label htmlFor="childNickName" className="block text-sm font-medium mb-2">
									Nickname (Optional)
								</label>
								<Input
									id="childNickName"
									value={formData.childNickName}
									onChange={(e) => setFormData({ ...formData, childNickName: e.target.value })}
									placeholder="e.g., Teddy, Sunny"
								/>
							</div>
							<div>
								<label htmlFor="childAge" className="block text-sm font-medium mb-2">
									Child's Age
								</label>
								<Input
									id="childAge"
									type="number"
									min="1"
									max="18"
									value={formData.childAge}
									onChange={(e) => setFormData({ ...formData, childAge: e.target.value })}
									placeholder="Enter age"
								/>
							</div>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<label className="block text-sm font-medium mb-2">Gender</label>
								<div className="flex gap-2">
									{genderOptions.map((g) => (
										<button
											type="button"
											key={g.value}
											onClick={() => setFormData({ ...formData, childGender: g.value })}
											className={`px-3 py-2 rounded-md border text-sm ${
												formData.childGender === g.value
													? "bg-primary text-primary-foreground border-primary"
													: "bg-transparent hover:bg-muted border-muted-foreground/30"
											}`}
										>
											{g.label}
										</button>
									))}
								</div>
							</div>
							<div>
								<label htmlFor="favoriteColor" className="block text-sm font-medium mb-2">
									Favorite Color
								</label>
								<select
									id="favoriteColor"
									value={formData.favoriteColor}
									onChange={(e) => setFormData({ ...formData, favoriteColor: e.target.value })}
									className="w-full p-2 border rounded-md bg-background"
								>
									<option value="">Choose a color</option>
									{COLORS.map((color) => (
										<option key={color} value={color}>
											{color}
										</option>
									))}
								</select>
							</div>
							<div>
								<label htmlFor="favoriteAnimal" className="block text-sm font-medium mb-2">
									Favorite Animal
								</label>
								<select
									id="favoriteAnimal"
									value={formData.favoriteAnimal}
									onChange={(e) => setFormData({ ...formData, favoriteAnimal: e.target.value })}
									className="w-full p-2 border rounded-md bg-background"
								>
									<option value="">Choose an animal</option>
									{ANIMALS.map((animal) => (
										<option key={animal} value={animal}>
											{animal}
										</option>
									))}
								</select>
							</div>
						</div>

						<div>
							<label htmlFor="childPhoto" className="block text-sm font-medium mb-2">
								Child's Photo (Optional)
							</label>
							<input
								id="childPhoto"
								type="file"
								accept="image/*"
								onChange={(e) => {
									const file = e.target.files?.[0] ?? null;
									setChildPhoto(file ?? null);
								}}
								className="w-full p-2 border rounded-md bg-background"
							/>
							{childPhoto && (
								<p className="text-xs text-muted-foreground mt-2">
									Selected: {childPhoto.name} {isUploadingPhoto ? "(Uploading...)" : ""}
								</p>
							)}
						</div>

						<div className="flex justify-end gap-2">
							<Button type="submit" disabled={isSaving || isUploadingPhoto}>
								{isSaving ? "Saving..." : "Save Changes"}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}


