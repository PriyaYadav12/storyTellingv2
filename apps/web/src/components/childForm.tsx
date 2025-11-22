import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input, Label, Button } from "@/components/ui";
import { COLORS, ANIMALS } from "@/lib/constants";
import { toast } from "sonner";

export default function ChildForm({
  isOpen,
  onClose,
  editingChild,
  profile,
  updateProfile,
  updateChild2,
}: any) {
  const isChild1 = editingChild === "1";
  const isChild2 = editingChild === "2";

  const [form, setForm] = useState({
    name: "",
    age: "",
    nickName: "",
    gender: "male",
    favoriteColor: "",
    favoriteAnimal: "",
  });

  useEffect(() => {
    if (isChild1) {
      setForm({
        name: profile.childName ?? "",
        age: profile.childAge?.toString() ?? "",
        nickName: profile.childNickName ?? "",
        gender: profile.childGender ?? "male",
        favoriteColor: profile.favoriteColor ?? "",
        favoriteAnimal: profile.favoriteAnimal ?? "",
      });
    } else if (isChild2) {
      setForm({
        name: profile.child2Name ?? "",
        age: profile.child2Age?.toString() ?? "",
        nickName: profile.child2NickName ?? "",
        gender: profile.child2Gender ?? "male",
        favoriteColor: profile.child2FavoriteColor ?? "",
        favoriteAnimal: profile.child2FavoriteAnimal ?? "",
      });
    }
  }, [editingChild]);

  const handleSave = async () => {
    if (!form.name || !form.age) return toast.error("Fill required fields");

    if (isChild1) {
      await updateProfile({
        parentName: profile.parentName,
        childName: form.name,
        childAge: Number(form.age),
        childGender: form.gender,
        childNickName: form.nickName || undefined,
        favoriteColor: form.favoriteColor || undefined,
        favoriteAnimal: form.favoriteAnimal || undefined,
      });
    } else {
      await updateChild2({
        child2Name: form.name,
        child2Age: Number(form.age),
        child2Gender: form.gender,
        child2NickName: form.nickName || undefined,
        child2FavoriteColor: form.favoriteColor || undefined,
        child2FavoriteAnimal: form.favoriteAnimal || undefined,
      });
    }

    toast.success("Saved!");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingChild ? "Edit Child" : "Add Child"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Name *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>Nickname</Label>
            <Input
              value={form.nickName}
              onChange={(e) => setForm({ ...form, nickName: e.target.value })}
            />
          </div>
          <div>
            <Label>Age *</Label>
            <Input
              type="number"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
            />
          </div>

          <div>
            <Label>Gender</Label>
            <div className="flex gap-2">
              {["female", "male", "other"].map((g) => (
                <button
                  key={g}
                  className={`px-4 py-2 rounded-xl border ${
                    form.gender === g ? "bg-primary text-white" : "border-muted"
                  }`}
                  onClick={() => setForm({ ...form, gender: g })}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Favorite Color</Label>
            <select
              className="input"
              value={form.favoriteColor}
              onChange={(e) => setForm({ ...form, favoriteColor: e.target.value })}
            >
              <option value="">Choose a color</option>
              {COLORS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <Label>Favorite Animal</Label>
            <select
              className="input"
              value={form.favoriteAnimal}
              onChange={(e) => setForm({ ...form, favoriteAnimal: e.target.value })}
            >
              <option value="">Choose an animal</option>
              {ANIMALS.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
