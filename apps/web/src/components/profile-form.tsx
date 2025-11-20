import { useEffect, useMemo, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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

	const userName = profile?.parentName || "User";
	const email = ""; // Email not available in profile
	const preferredLanguage = "English"; // Default or from profile if available

	return (
		<div className="min-h-screen bg-background">
			<main className="container mx-auto px-4 md:px-8 py-8 md:py-12">
				<div className="max-w-4xl mx-auto space-y-8">
					<div className="text-center space-y-4">
						<h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-chart-3 bg-clip-text text-transparent">
							My Profile
						</h1>
						<p className="text-xl text-muted-foreground">
							Manage your account and family settings
						</p>
					</div>

					<Card className="p-8 rounded-3xl" data-testid="card-profile-info">
						<div className="space-y-6">
							<div className="flex items-center gap-6">
								<div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20">
									<img
										src={previewUrl ?? profilePhotoUrl ?? ""}
										alt="Profile"
										className="w-full h-full object-cover"
									/>
								</div>
								<div className="flex-1">
									<h2 className="text-3xl font-bold">{userName}</h2>
									<p className="text-muted-foreground">{email || "No email available"}</p>
								</div>
								<Button variant="outline" className="rounded-2xl" data-testid="button-edit-profile">
									Edit Profile
								</Button>
							</div>

							<form onSubmit={(e) => void handleSave(e)} className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-2">
										<label htmlFor="parentName" className="text-base font-semibold flex items-center gap-2">
											Parent's Name
										</label>
										<Input
											id="parentName"
											value={formData.parentName}
											onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
											placeholder="Enter your name"
											className="rounded-xl h-12"
											data-testid="input-name"
										/>
									</div>
									<div className="space-y-2">
										<label htmlFor="childName" className="text-base font-semibold flex items-center gap-2">
											Child's Name
										</label>
										<Input
											id="childName"
											value={formData.childName}
											onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
											placeholder="Enter child's name"
											className="rounded-xl h-12"
											data-testid="input-child-name"
										/>
									</div>
									<div className="space-y-2">
										<label htmlFor="childNickName" className="text-base font-semibold flex items-center gap-2">
											Nickname (Optional)
										</label>
										<Input
											id="childNickName"
											value={formData.childNickName}
											onChange={(e) => setFormData({ ...formData, childNickName: e.target.value })}
											placeholder="e.g., Teddy, Sunny"
											className="rounded-xl h-12"
										/>
									</div>
									<div className="space-y-2">
										<label htmlFor="childAge" className="text-base font-semibold flex items-center gap-2">
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
											className="rounded-xl h-12"
										/>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
									<div className="space-y-2">
										<label className="text-base font-semibold flex items-center gap-2">Gender</label>
										<div className="flex gap-2">
											{genderOptions.map((g) => (
												<button
													type="button"
													key={g.value}
													onClick={() => setFormData({ ...formData, childGender: g.value })}
													className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
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
									<div className="space-y-2">
										<label htmlFor="favoriteColor" className="text-base font-semibold flex items-center gap-2">
											Favorite Color
										</label>
										<select
											id="favoriteColor"
											value={formData.favoriteColor}
											onChange={(e) => setFormData({ ...formData, favoriteColor: e.target.value })}
											className="w-full p-3 border rounded-xl bg-background h-12"
										>
											<option value="">Choose a color</option>
											{COLORS.map((color) => (
												<option key={color} value={color}>
													{color}
												</option>
											))}
										</select>
									</div>
									<div className="space-y-2">
										<label htmlFor="favoriteAnimal" className="text-base font-semibold flex items-center gap-2">
											Favorite Animal
										</label>
										<select
											id="favoriteAnimal"
											value={formData.favoriteAnimal}
											onChange={(e) => setFormData({ ...formData, favoriteAnimal: e.target.value })}
											className="w-full p-3 border rounded-xl bg-background h-12"
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

								<div className="space-y-2">
									<label htmlFor="childPhoto" className="text-base font-semibold flex items-center gap-2">
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
										className="w-full p-3 border rounded-xl bg-background"
									/>
									{childPhoto && (
										<p className="text-sm text-muted-foreground mt-2">
											Selected: {childPhoto.name} {isUploadingPhoto ? "(Uploading...)" : ""}
										</p>
									)}
								</div>

								<div className="flex justify-end gap-2 pt-4">
									<Button type="submit" disabled={isSaving || isUploadingPhoto} className="rounded-2xl px-8">
										{isSaving ? "Saving..." : "Save Changes"}
									</Button>
								</div>
							</form>
						</div>
					</Card>

					<Card className="p-8 rounded-3xl bg-gradient-to-br from-chart-1/10 to-chart-2/10" data-testid="card-stats">
						<h2 className="text-2xl font-bold mb-6">Account Statistics</h2>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
							<div className="text-center">
								<div className="text-4xl font-bold text-chart-1">0</div>
								<div className="text-sm text-muted-foreground mt-1">Stories Created</div>
							</div>
							<div className="text-center">
								<div className="text-4xl font-bold text-chart-2">0h</div>
								<div className="text-sm text-muted-foreground mt-1">Total Reading Time</div>
							</div>
							<div className="text-center">
								<div className="text-4xl font-bold text-chart-3">0</div>
								<div className="text-sm text-muted-foreground mt-1">Day Streak</div>
							</div>
							<div className="text-center">
								<div className="text-4xl font-bold text-chart-4">0</div>
								<div className="text-sm text-muted-foreground mt-1">Achievements</div>
							</div>
						</div>
					</Card>
				</div>
			</main>
		</div>
	);
}


