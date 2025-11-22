import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import { Button, Card, Avatar, AvatarFallback } from "@/components/ui";
import ChildForm from "./childForm";
import ChildCard from "./ChildCard";
import { Plus } from "lucide-react";
import { toast } from "sonner";


export default function ProfileForm() {
  const profile = useQuery(api.userProfiles.getProfile);
  const user = useQuery(api.auth.getCurrentUser);
  const stories = useQuery(api.stories.list, {});
  const child1PhotoUrl = useQuery(api.userProfiles.getProfilePhotoUrl, { childId: "1" });
  const child2PhotoUrl = useQuery(api.userProfiles.getProfilePhotoUrl, { childId: "2" });

  const updateProfile = useMutation(api.userProfiles.updateProfile);
  const updateChild2 = useMutation(api.userProfiles.updateChild2);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<null | "1" | "2">(null);

  // Construct children list
  const children = useMemo(() => {
    const arr = [];

    if (profile?.childName) {
      arr.push({
        id: "1",
        name: profile.childName,
        age: profile.childAge,
        gender: profile.childGender,
        nickName: profile.childNickName,
        favoriteColor: profile.favoriteColor,
        favoriteAnimal: profile.favoriteAnimal,
        photoUrl: child1PhotoUrl,
      });
    }

    if (profile?.child2Name) {
      arr.push({
        id: "2",
        name: profile.child2Name,
        age: profile.child2Age,
        gender: profile.child2Gender,
        nickName: profile.child2NickName,
        favoriteColor: profile.child2FavoriteColor,
        favoriteAnimal: profile.child2FavoriteAnimal,
        photoUrl: child2PhotoUrl,
      });
    }

    return arr;
  }, [profile, child1PhotoUrl, child2PhotoUrl]);

  const canAddChild = children.length < 2;

  const handleEdit = (id: "1" | "2") => {
    setEditingChild(id);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingChild(null);
    setDialogOpen(true);
  };

  if (!profile) return <div>Loading...</div>;

  const userName = profile.parentName;
  const email = user?.email;

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12 max-w-4xl space-y-8">
        {/* PROFILE CARD */}
        <Card className="p-8 rounded-3xl">
          <div className="flex gap-6">
            <Avatar className="w-24 h-24">
              <AvatarFallback className="text-3xl text-gray-700 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
                {userName?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-3xl font-bold">{userName}</h2>
              <p className="text-muted-foreground">{email}</p>
            </div>
          </div>
        </Card>

        {/* CHILDREN CARD */}
        <Card className="p-8 rounded-3xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Children</h2>
            {canAddChild && (
              <Button onClick={handleAdd} className="rounded-xl">
                <Plus className="w-4 h-4 mr-2" /> Add Child
              </Button>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {children.map((child) => (
              <ChildCard
                key={child.id}
                child={child}
                totalChildren={children.length}
                profilePictureUrl={child.photoUrl}
                onEdit={() => handleEdit(child.id as "1" | "2")}
                onDelete={async () => {
                  if (child.id === "1") return toast.error("Cannot delete first child");
                  await updateChild2({
                    child2Name: undefined,
                    child2Age: undefined,
                  });
                }}
                onProfilePictureUpdate={() => {
                  // Profile picture will be refetched automatically via useQuery
                }}
              />
            ))}
          </div>
        </Card>
      </main>

      {/* MODAL FOR ADD/EDIT */}
      {dialogOpen && (
        <ChildForm
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          editingChild={editingChild}
          profile={profile}
          updateProfile={updateProfile}
          updateChild2={updateChild2}
        />
      )}
    </div>
  );
}
