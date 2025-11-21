import { useEffect, useMemo, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { COLORS, ANIMALS } from "@/lib/constants";
import { toast } from "sonner";
import { User, Mail, Calendar, Globe, Edit, Plus, Trash2 } from "lucide-react";

type Gender = "male" | "female" | "other";

interface Child {
	id: string;
	name: string;
	age: number;
	nickName?: string;
	gender: Gender;
	favoriteColor?: string;
	favoriteAnimal?: string;
}

export default function ProfileForm() {
	const profile = useQuery(api.userProfiles.getProfile);
	const profilePhotoUrl = useQuery(api.userProfiles.getProfilePhotoUrl);
	const updateProfile = useMutation(api.userProfiles.updateProfile);
	const updateChild2 = useMutation(api.userProfiles.updateChild2);
	const user = useQuery(api.auth.getCurrentUser);
	const stories = useQuery(api.stories.list, {});
	
	const [isAddChildDialogOpen, setIsAddChildDialogOpen] = useState(false);
	const [editingChildId, setEditingChildId] = useState<string | null>(null);
	const [child2FormData, setChild2FormData] = useState({
		child2Name: "",
		child2Age: "",
		child2NickName: "",
		child2Gender: "male" as Gender,
		child2FavoriteColor: "",
		child2FavoriteAnimal: "",
	});
	const [child1FormData, setChild1FormData] = useState({
		childName: "",
		childAge: "",
		childNickName: "",
		childGender: "male" as Gender,
		favoriteColor: "",
		favoriteAnimal: "",
	});
	const [isSavingChild2, setIsSavingChild2] = useState(false);
	const [isSavingChild1, setIsSavingChild1] = useState(false);

	const genderOptions = useMemo(
		() => [
			{ label: "Female", value: "female" as Gender },
			{ label: "Male", value: "male" as Gender },
			{ label: "Other", value: "other" as Gender },
		],
		[],
	);

	// Build children array from profile
	const children = useMemo(() => {
		const childrenList: Child[] = [];
		if (profile?.childName) {
			childrenList.push({
				id: "1",
				name: profile.childName,
				age: profile.childAge,
				nickName: profile.childNickName,
				gender: profile.childGender,
				favoriteColor: profile.favoriteColor,
				favoriteAnimal: profile.favoriteAnimal,
			});
		}
		if (profile?.child2Name) {
			childrenList.push({
				id: "2",
				name: profile.child2Name,
				age: profile.child2Age ?? 0,
				nickName: profile.child2NickName,
				gender: profile.child2Gender ?? "male",
				favoriteColor: profile.child2FavoriteColor,
				favoriteAnimal: profile.child2FavoriteAnimal,
			});
		}
		return childrenList;
	}, [profile]);

	const canAddChild = children.length < 2;

	// Calculate statistics
	const stats = useMemo(() => {
		const storiesList = stories || [];
		const storiesCreated = storiesList.length;
		const readingTime = Math.round(storiesCreated * 3);
		const currentStreak = 7; // TODO: Calculate from actual data
		const achievements = Math.floor(storiesCreated / 3);
		return { storiesCreated, readingTime, currentStreak, achievements };
	}, [stories]);

	const handleAddChild = () => {
		setEditingChildId(null);
		setChild2FormData({
			child2Name: "",
			child2Age: "",
			child2NickName: "",
			child2Gender: "male",
			child2FavoriteColor: "",
			child2FavoriteAnimal: "",
		});
		setIsAddChildDialogOpen(true);
	};

	const handleSaveChild2 = async () => {
		if (!child2FormData.child2Name || !child2FormData.child2Age) {
			toast.error("Please fill in all required fields");
			return;
		}

		setIsSavingChild2(true);
		try {
			await updateChild2({
				child2Name: child2FormData.child2Name,
				child2Age: parseInt(child2FormData.child2Age),
				child2Gender: child2FormData.child2Gender,
				child2NickName: child2FormData.child2NickName || undefined,
				child2FavoriteColor: child2FormData.child2FavoriteColor || undefined,
				child2FavoriteAnimal: child2FormData.child2FavoriteAnimal || undefined,
			});
			toast.success("Child added successfully");
			setIsAddChildDialogOpen(false);
		} catch (err) {
			toast.error("Failed to add child");
		} finally {
			setIsSavingChild2(false);
		}
	};

	const handleEditChild = (id: string) => {
		if (id === "2" && profile?.child2Name) {
			setEditingChildId("2");
			setChild2FormData({
				child2Name: profile.child2Name,
				child2Age: (profile.child2Age ?? 0).toString(),
				child2NickName: profile.child2NickName ?? "",
				child2Gender: profile.child2Gender ?? "male",
				child2FavoriteColor: profile.child2FavoriteColor ?? "",
				child2FavoriteAnimal: profile.child2FavoriteAnimal ?? "",
			});
			setIsAddChildDialogOpen(true);
		} else if (id === "1" && profile?.childName) {
			setEditingChildId("1");
			setChild1FormData({
				childName: profile.childName,
				childAge: profile.childAge.toString(),
				childNickName: profile.childNickName ?? "",
				childGender: profile.childGender,
				favoriteColor: profile.favoriteColor ?? "",
				favoriteAnimal: profile.favoriteAnimal ?? "",
			});
			setIsAddChildDialogOpen(true);
		}
	};

	const handleSaveChild1 = async () => {
		if (!child1FormData.childName || !child1FormData.childAge) {
			toast.error("Please fill in all required fields");
			return;
		}

		setIsSavingChild1(true);
		try {
			await updateProfile({
				parentName: profile?.parentName || "",
				childName: child1FormData.childName,
				childAge: parseInt(child1FormData.childAge),
				childGender: child1FormData.childGender,
				childNickName: child1FormData.childNickName || undefined,
				favoriteColor: child1FormData.favoriteColor || undefined,
				favoriteAnimal: child1FormData.favoriteAnimal || undefined,
			});
			toast.success("Child updated successfully");
			setIsAddChildDialogOpen(false);
		} catch (err) {
			toast.error("Failed to update child");
		} finally {
			setIsSavingChild1(false);
		}
	};

	const handleDeleteChild = async (id: string) => {
		if (id === "2") {
			try {
				await updateChild2({
					child2Name: undefined,
					child2Age: undefined,
					child2Gender: undefined,
					child2NickName: undefined,
					child2FavoriteColor: undefined,
					child2FavoriteAnimal: undefined,
				});
				toast.success("Child removed");
			} catch (err) {
				toast.error("Failed to remove child");
			}
		} else if (id === "1") {
			// Can't delete the first child (from onboarding) - show message
			toast.error("The first child cannot be deleted. Please contact support if needed.");
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
	const email = user?.email || "No email available";
	const preferredLanguage = "English";
	const memberSince = profile?.createdAt
		? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
		: "Recently";

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
								<Avatar className="w-24 h-24">
									<AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary to-accent text-white">
										{userName.charAt(0)}
									</AvatarFallback>
								</Avatar>
								<div className="flex-1">
									<h2 className="text-3xl font-bold">{userName}</h2>
									<p className="text-muted-foreground">{email || "No email available"}</p>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-2">
									<Label htmlFor="name" className="text-base font-semibold flex items-center gap-2">
										<User className="w-4 h-4" />
										Name
									</Label>
									<Input
										id="name"
										value={userName}
										className="rounded-xl h-12"
										readOnly
										data-testid="input-name"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="email" className="text-base font-semibold flex items-center gap-2">
										<Mail className="w-4 h-4" />
										Email
									</Label>
									<Input
										id="email"
										value={email || "Not available"}
										type="email"
										className="rounded-xl h-12"
										readOnly
										data-testid="input-email"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="language" className="text-base font-semibold flex items-center gap-2">
										<Globe className="w-4 h-4" />
										Preferred Language
									</Label>
									<Input
										id="language"
										value={preferredLanguage}
										className="rounded-xl h-12"
										readOnly
										data-testid="input-language"
									/>
								</div>

								<div className="space-y-2">
									<Label className="text-base font-semibold flex items-center gap-2">
										<Calendar className="w-4 h-4" />
										Member Since
									</Label>
									<Input
										value={memberSince}
										className="rounded-xl h-12"
										readOnly
										data-testid="input-member-since"
									/>
								</div>
							</div>
						</div>
					</Card>

					<Card className="p-8 rounded-3xl" data-testid="card-children">
						<div className="space-y-6">
							<div className="flex items-center justify-between">
								<h2 className="text-2xl font-bold">Children</h2>
								{canAddChild && (
									<Button
										className="rounded-2xl"
										onClick={handleAddChild}
										data-testid="button-add-child"
									>
										<Plus className="w-4 h-4 mr-2" />
										Add Child
									</Button>
								)}
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{children.map((child) => {
									const favoriteDisplay = child.favoriteColor || child.favoriteAnimal;
									const favoriteAnimalDisplay = child.favoriteAnimal || "No favorite animal";
									const nicknameDisplay = child.nickName || "No nickname";
									const showDelete = children.length === 2;
									
									return (
										<Card
											key={child.id}
											className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5"
											data-testid={`card-child-${child.id}`}
										>
											<div className="flex items-start justify-between">
												<div className="space-y-2">
													<h3 className="text-xl font-bold">{child.name}</h3>
													<div className="space-y-1 text-sm text-muted-foreground">
														<p>Age: {child.age} years</p>
														{favoriteDisplay && (
															<div className="flex items-center gap-2">
																<span>Favorite:</span>
																<Badge variant="secondary" className="rounded-xl">
																	{favoriteDisplay}
																</Badge>
															</div>
														)}
														{nicknameDisplay && (
															<div className="flex items-center gap-2">
																<span>Nickname:</span>
																<Badge variant="secondary" className="rounded-xl">
																	{nicknameDisplay}
																</Badge>
															</div>
														)}
														{favoriteAnimalDisplay && (
															<div className="flex items-center gap-2">
																<span>Favorite Animal:</span>
																<Badge variant="secondary" className="rounded-xl">
																	{favoriteAnimalDisplay}
																</Badge>
															</div>
														)}
													</div>
													
												</div>
												<div className="flex gap-2">
													<Button
														size="icon"
														variant="ghost"
														onClick={() => handleEditChild(child.id)}
														data-testid={`button-edit-child-${child.id}`}
													>
														<Edit className="w-4 h-4" />
													</Button>
													{showDelete && (
														<Button
															size="icon"
															variant="ghost"
															onClick={() => handleDeleteChild(child.id)}
															data-testid={`button-delete-child-${child.id}`}
														>
															<Trash2 className="w-4 h-4 text-destructive" />
														</Button>
													)}
												</div>
											</div>
										</Card>
									);
								})}
							</div>
						</div>
					</Card>
				</div>
			</main>

			<Dialog open={isAddChildDialogOpen} onOpenChange={setIsAddChildDialogOpen}>
				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle>{editingChildId === "1" ? "Edit Child" : editingChildId === "2" ? "Edit Child" : "Add Child"}</DialogTitle>
						<DialogDescription>
							{editingChildId ? "Update child information." : "Add a second child to your profile. You can add up to 2 children."}
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						{editingChildId === "1" ? (
							<>
								<div className="space-y-2">
									<Label htmlFor="child1Name">Child's Name *</Label>
									<Input
										id="child1Name"
										value={child1FormData.childName}
										onChange={(e) => setChild1FormData({ ...child1FormData, childName: e.target.value })}
										placeholder="Enter child's name"
										className="rounded-xl h-12"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="child1NickName">Nickname (Optional)</Label>
									<Input
										id="child1NickName"
										value={child1FormData.childNickName}
										onChange={(e) => setChild1FormData({ ...child1FormData, childNickName: e.target.value })}
										placeholder="e.g., Teddy, Sunny"
										className="rounded-xl h-12"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="child1Age">Child's Age *</Label>
									<Input
										id="child1Age"
										type="number"
										min="1"
										max="18"
										value={child1FormData.childAge}
										onChange={(e) => setChild1FormData({ ...child1FormData, childAge: e.target.value })}
										placeholder="Enter age"
										className="rounded-xl h-12"
									/>
								</div>
								<div className="space-y-2">
									<Label>Gender *</Label>
									<div className="flex gap-2">
										{genderOptions.map((g) => (
											<button
												type="button"
												key={g.value}
												onClick={() => setChild1FormData({ ...child1FormData, childGender: g.value })}
												className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
													child1FormData.childGender === g.value
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
									<Label htmlFor="child1FavoriteColor">Favorite Color</Label>
									<select
										id="child1FavoriteColor"
										value={child1FormData.favoriteColor}
										onChange={(e) => setChild1FormData({ ...child1FormData, favoriteColor: e.target.value })}
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
									<Label htmlFor="child1FavoriteAnimal">Favorite Animal</Label>
									<select
										id="child1FavoriteAnimal"
										value={child1FormData.favoriteAnimal}
										onChange={(e) => setChild1FormData({ ...child1FormData, favoriteAnimal: e.target.value })}
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
							</>
						) : (
							<>
								<div className="space-y-2">
									<Label htmlFor="child2Name">Child's Name *</Label>
									<Input
										id="child2Name"
										value={child2FormData.child2Name}
										onChange={(e) => setChild2FormData({ ...child2FormData, child2Name: e.target.value })}
										placeholder="Enter child's name"
										className="rounded-xl h-12"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="child2NickName">Nickname (Optional)</Label>
									<Input
										id="child2NickName"
										value={child2FormData.child2NickName}
										onChange={(e) => setChild2FormData({ ...child2FormData, child2NickName: e.target.value })}
										placeholder="e.g., Teddy, Sunny"
										className="rounded-xl h-12"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="child2Age">Child's Age *</Label>
									<Input
										id="child2Age"
										type="number"
										min="1"
										max="18"
										value={child2FormData.child2Age}
										onChange={(e) => setChild2FormData({ ...child2FormData, child2Age: e.target.value })}
										placeholder="Enter age"
										className="rounded-xl h-12"
									/>
								</div>
								<div className="space-y-2">
									<Label>Gender *</Label>
									<div className="flex gap-2">
										{genderOptions.map((g) => (
											<button
												type="button"
												key={g.value}
												onClick={() => setChild2FormData({ ...child2FormData, child2Gender: g.value })}
												className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
													child2FormData.child2Gender === g.value
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
									<Label htmlFor="child2FavoriteColor">Favorite Color</Label>
									<select
										id="child2FavoriteColor"
										value={child2FormData.child2FavoriteColor}
										onChange={(e) => setChild2FormData({ ...child2FormData, child2FavoriteColor: e.target.value })}
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
									<Label htmlFor="child2FavoriteAnimal">Favorite Animal</Label>
									<select
										id="child2FavoriteAnimal"
										value={child2FormData.child2FavoriteAnimal}
										onChange={(e) => setChild2FormData({ ...child2FormData, child2FavoriteAnimal: e.target.value })}
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
							</>
						)}
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setIsAddChildDialogOpen(false)}
							className="rounded-2xl"
						>
							Cancel
						</Button>
						<Button
							onClick={editingChildId === "1" ? handleSaveChild1 : handleSaveChild2}
							disabled={isSavingChild1 || isSavingChild2}
							className="rounded-2xl"
						>
							{(isSavingChild1 || isSavingChild2) ? "Saving..." : "Save"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
