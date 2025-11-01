import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";
import { useRoles } from "@/contexts/RolesContext";

export function AdminBadge() {
  const { isAdmin, isLoading } = useRoles();

  if (isLoading || !isAdmin()) {
    return null;
  }

  return (
    <Badge variant="secondary" className="flex items-center gap-1 bg-primary/10 text-primary border-primary/20">
      <Shield className="w-3 h-3" />
      Admin
    </Badge>
  );
}