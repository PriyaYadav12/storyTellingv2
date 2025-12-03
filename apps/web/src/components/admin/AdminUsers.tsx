import { useQuery } from "convex/react";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Users, Mail, User, Calendar, Flame, Trophy } from "lucide-react";

export function AdminUsers() {
	const users = useQuery(api.auth.listAllUsers);
	console.log("Users:", users);
	if (users === undefined) {
		return (
			<div className="flex items-center justify-center py-20">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
			</div>
		);
	}

	if (users.length === 0) {
		return (
			<div className="text-center py-12">
				<Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
				<p className="text-muted-foreground">No users found</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="grid gap-4">
				{users.map((user: any) => (
					<Card key={user.id}>
						<CardHeader>
							<div className="flex items-start justify-between">
								<div className="flex items-center gap-3">
									<div>
										<CardTitle className="flex items-center gap-2">
											{user.profile?.parentName || user.name}
										</CardTitle>
										<CardDescription className="flex items-center gap-2 mt-1">
											<Mail className="h-3 w-3" />
											{user.email}
										</CardDescription>
									</div>
								</div>
								<div className="text-sm text-muted-foreground flex items-center gap-1">
									<Calendar className="h-4 w-4" />
									{new Date(user.createdAt).toLocaleDateString()}
								</div>
							</div>
						</CardHeader>
						<CardContent>
							{user.profile ? (
								<div className="space-y-4">
									{/* Child 1 Information */}
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
										<div>
											<div className="flex items-center gap-3 mb-3">
												<Avatar className="h-12 w-12">
													{user.profile.childProfilePictureUrl ?(
														<AvatarImage src={user.profile.childProfilePictureUrl} alt={user.profile.childName} />
													) : null}
													<AvatarFallback className="bg-primary/10 text-primary">
														{user.profile.childName?.[0]?.toUpperCase() || "C"}
													</AvatarFallback>
												</Avatar>
												<Avatar className="h-12 w-12">
													{user.profile.childAvatarUrl ? (
														<AvatarImage src={user.profile.childAvatarUrl} alt={user.profile.childName} />
													) : null}
													<AvatarFallback className="bg-primary/10 text-primary">
														{user.profile.childName?.[0]?.toUpperCase() || "C"}
													</AvatarFallback>
												</Avatar>
											</div>
											<div className="space-y-1 text-sm">
											<h4 className="font-semibold text-sm">Child 1</h4>
												<p><span className="text-muted-foreground">Name:</span> {user.profile.childName}</p>
												{user.profile.childNickName && (
													<p><span className="text-muted-foreground">Nickname:</span> {user.profile.childNickName}</p>
												)}
												<p><span className="text-muted-foreground">Age:</span> {user.profile.childAge}</p>
												<p><span className="text-muted-foreground">Gender:</span> {user.profile.childGender}</p>
												{user.profile.favoriteColor && (
													<p><span className="text-muted-foreground">Favorite Color:</span> {user.profile.favoriteColor}</p>
												)}
												{user.profile.favoriteAnimal && (
													<p><span className="text-muted-foreground">Favorite Animal:</span> {user.profile.favoriteAnimal}</p>
												)}
											</div>
										</div>
										<div className="flex items-center gap-4">
											{user.profile.currentStreak !== undefined && (
												<div className="flex items-center gap-2">
													<Flame className="h-5 w-5 text-orange-500" />
													<div>
														<p className="text-xs text-muted-foreground">Current Streak</p>
														<p className="font-semibold">{user.profile.currentStreak} days</p>
													</div>
												</div>
											)}
											{user.profile.longestStreak !== undefined && (
												<div className="flex items-center gap-2">
													<Trophy className="h-5 w-5 text-yellow-500" />
													<div>
														<p className="text-xs text-muted-foreground">Longest Streak</p>
														<p className="font-semibold">{user.profile.longestStreak} days</p>
													</div>
												</div>
											)}
										</div>
									</div>

									{/* Child 2 Information */}
									{user.profile.child2Name && (
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
											<div>
												<div className="flex items-center gap-3 mb-3">
													<Avatar className="h-12 w-12">
														{user.profile.child2AvatarUrl ? (
															<AvatarImage src={user.profile.child2AvatarUrl} alt={user.profile.child2Name} />
														) : user.profile.child2ProfilePictureUrl ? (
															<AvatarImage src={user.profile.child2ProfilePictureUrl} alt={user.profile.child2Name} />
														) : null}
														<AvatarFallback className="bg-primary/10 text-primary">
															{user.profile.child2Name?.[0]?.toUpperCase() || "C"}
														</AvatarFallback>
													</Avatar>
													<h4 className="font-semibold text-sm">Child 2</h4>
												</div>
												<div className="space-y-1 text-sm">
													<p><span className="text-muted-foreground">Name:</span> {user.profile.child2Name}</p>
													{user.profile.child2Age && (
														<p><span className="text-muted-foreground">Age:</span> {user.profile.child2Age}</p>
													)}
													{user.profile.child2Gender && (
														<p><span className="text-muted-foreground">Gender:</span> {user.profile.child2Gender}</p>
													)}
												</div>
											</div>
										</div>
									)}
								</div>
							) : (
								<div className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-lg">
									No profile information available
								</div>
							)}
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
