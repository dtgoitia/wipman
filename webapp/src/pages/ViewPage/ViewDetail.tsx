import { Tags } from "../../components/ViewTags";
import { View } from "../../domain/types";

interface ViewDetailProps {
  view: View;
}
export function ViewDetail({ view }: ViewDetailProps) {
  return (
    <div>
      <Tags tags={view.tags} />
    </div>
  );
}
