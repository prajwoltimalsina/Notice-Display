import { useState, useRef, useEffect } from 'react';
import { Notice } from '@/types/database';
import { FileText, GripVertical, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NoticeCardProps {
  notice: Notice;
  onPositionChange?: (id: string, x: number, y: number) => void;
  onSizeChange?: (id: string, width: number, height: number) => void;
  isEditable?: boolean;
}

export function NoticeCard({ 
  notice, 
  onPositionChange, 
  onSizeChange,
  isEditable = false 
}: NoticeCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [position, setPosition] = useState({ x: notice.position_x, y: notice.position_y });
  const [size, setSize] = useState({ width: notice.width, height: notice.height });
  const cardRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ width: 0, height: 0, x: 0, y: 0 });

  useEffect(() => {
    setPosition({ x: notice.position_x, y: notice.position_y });
    setSize({ width: notice.width, height: notice.height });
  }, [notice.position_x, notice.position_y, notice.width, notice.height]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isEditable) return;
    e.preventDefault();
    setIsDragging(true);
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    if (!isEditable) return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStart.current = {
      width: size.width,
      height: size.height,
      x: e.clientX,
      y: e.clientY
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && cardRef.current?.parentElement) {
        const parent = cardRef.current.parentElement.getBoundingClientRect();
        const newX = e.clientX - parent.left - dragOffset.current.x;
        const newY = e.clientY - parent.top - dragOffset.current.y;
        
        const clampedX = Math.max(0, Math.min(newX, parent.width - size.width));
        const clampedY = Math.max(0, Math.min(newY, parent.height - size.height));
        
        setPosition({ x: clampedX, y: clampedY });
      }
      
      if (isResizing) {
        const deltaX = e.clientX - resizeStart.current.x;
        const deltaY = e.clientY - resizeStart.current.y;
        
        setSize({
          width: Math.max(150, resizeStart.current.width + deltaX),
          height: Math.max(100, resizeStart.current.height + deltaY)
        });
      }
    };

    const handleMouseUp = () => {
      if (isDragging && onPositionChange) {
        onPositionChange(notice._id, position.x, position.y);
      }
      if (isResizing && onSizeChange) {
        onSizeChange(notice._id, size.width, size.height);
      }
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, position, size, notice._id, onPositionChange, onSizeChange]);

  const isPDF = notice.file_type === 'application/pdf';

  return (
    <div
      ref={cardRef}
      className={cn(
        'notice-card glass-panel overflow-hidden',
        isDragging && 'dragging',
        isEditable && 'cursor-move'
      )}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: notice.z_index
      }}
    >
      {/* Drag Handle */}
      {isEditable && (
        <div 
          className="absolute top-2 left-2 p-1 bg-secondary/80 rounded cursor-grab active:cursor-grabbing z-10"
          onMouseDown={handleMouseDown}
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>
      )}

      {/* Content */}
      <div className="w-full h-full">
        {isPDF ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-secondary/50 p-4">
            <FileText className="w-12 h-12 text-primary mb-2" />
            <span className="text-sm text-center font-medium">{notice.title}</span>
            <a 
              href={notice.fileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline mt-2"
            >
              View PDF
            </a>
          </div>
        ) : (
          <img
            src={notice.fileUrl}
            alt={notice.title}
            className="w-full h-full object-cover"
            draggable={false}
          />
        )}
      </div>

      {/* Title Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-3">
        <h3 className="text-sm font-medium truncate">{notice.title}</h3>
      </div>

      {/* Resize Handle */}
      {isEditable && (
        <div
          className="absolute bottom-1 right-1 w-4 h-4 cursor-se-resize opacity-0 hover:opacity-100 transition-opacity"
          onMouseDown={handleResizeStart}
        >
          <Maximize2 className="w-4 h-4 text-primary" />
        </div>
      )}
    </div>
  );
}
