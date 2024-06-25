import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePhoto() {
  const { user } = useAuth();
  return (
    <Avatar>
      <AvatarImage
        src={`${import.meta.env.VITE_BASE_URL}${user?.profilePic}`}
        alt="fp"
      />
      <AvatarFallback>
        {user?.name?.slice(0, 1)}
        {user?.surname?.slice(0, 1)}
      </AvatarFallback>
    </Avatar>
  );
}
