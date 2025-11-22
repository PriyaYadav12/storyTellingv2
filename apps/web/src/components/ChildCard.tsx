import { Card, Button } from "@/components/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui";
import { Edit, Trash2, Camera, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "@story-telling-v2/backend/convex/_generated/api";
import { toast } from "sonner";

export default function ChildCard({ child, totalChildren, onEdit, onDelete, profilePictureUrl, onProfilePictureUpdate }: any) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const generateUploadUrl = useMutation(api.userProfiles.generateProfilePictureUploadUrl);
  const setProfilePicture = useMutation(api.userProfiles.setProfilePicture);
  const generateAndStoreAvatar = useAction(api.userProfiles.generateAndStoreAvatar);

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type - only PNG and JPEG allowed
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      toast.error("Please select a PNG or JPEG image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    try {
      setIsUploading(true);
      const uploadUrl = await generateUploadUrl({});
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const json = (await res.json()) as { storageId?: string };
      if (json?.storageId) {
        await setProfilePicture({ storageId: json.storageId, childId: child.id });
        
        // Generate avatar in background (non-blocking)
        generateAndStoreAvatar({ childId: child.id }).catch((error) => {
          // Avatar generation can fail silently
          console.error("Avatar generation failed:", error);
        });
        
        toast.success("Profile picture updated!");
        onProfilePictureUpdate?.();
      }
    } catch (error) {
      toast.error("Failed to upload profile picture");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <Card className="p-6 rounded-xl bg-muted/20">
      <div className="flex gap-4">
        {/* Profile Picture */}
        <div className="relative">
          <Avatar className="w-20 h-20 cursor-pointer" onClick={handleProfilePictureClick}>
            {profilePictureUrl ? (
              <AvatarImage src={profilePictureUrl} alt={child.name} />
            ) : null}
            <AvatarFallback className="text-2xl text-gray-700 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100">
              {child.name?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Button
            size="icon"
            variant="secondary"
            className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full"
            onClick={handleProfilePictureClick}
            disabled={isUploading}
          >
            {isUploading ? (
              <Upload className="w-3 h-3 animate-spin" />
            ) : (
              <Camera className="w-3 h-3" />
            )}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Child Info */}
        <div className="flex-1 space-y-1">
          <h3 className="font-bold text-lg text-black">{child.name}</h3>
          <p className="text-sm text-black">Age: {child.age}</p>
          {child.nickName && (
            <p className="text-sm text-black">Nickname: {child.nickName}</p>
          )}
          {child.favoriteColor && (
            <p className="text-sm text-black">Favorite Color: {child.favoriteColor}</p>
          )}
          {child.favoriteAnimal && (
            <p className="text-sm text-black">Favorite Animal: {child.favoriteAnimal}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" onClick={onEdit}>
            <Edit className="w-4 h-4" />
          </Button>

          {totalChildren === 2 && (
            <Button size="icon" variant="ghost" onClick={onDelete}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
