import { Notice } from "@/types/database";
import { NoticeCard } from "./NoticeCard";
import { useNotices } from "@/hooks/useNotices";

interface NoticeCanvasProps {
  notices: Notice[];
  isEditable?: boolean;
}

export function NoticeCanvas({
  notices,
  isEditable = false,
}: NoticeCanvasProps) {
  const { updateNotice } = useNotices();

  const handlePositionChange = async (id: string, x: number, y: number) => {
    await updateNotice(id, { position_x: x, position_y: y });
  };

  const handleSizeChange = async (
    id: string,
    width: number,
    height: number,
  ) => {
    await updateNotice(id, { width, height });
  };

  // Filter only published notices
  const publishedNotices = notices.filter((n) => n.is_published);

  return (
    <div className="relative w-full h-full canvas-grid overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent pointer-events-none" />

      {publishedNotices.map((notice) => (
        <NoticeCard
          key={notice._id}
          notice={notice}
          isEditable={isEditable}
          onPositionChange={handlePositionChange}
          onSizeChange={handleSizeChange}
        />
      ))}

      {publishedNotices.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-secondary/50 flex items-center justify-center">
              <span className="text-4xl">📋</span>
            </div>
            <h3 className="text-xl font-medium text-muted-foreground">
              No notices to display
            </h3>
            <p className="text-sm text-muted-foreground/70 mt-2">
              Notices will appear here when published
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
