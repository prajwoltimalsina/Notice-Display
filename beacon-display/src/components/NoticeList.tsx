import { Notice } from '@/types/database';
import { useNotices } from '@/hooks/useNotices';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Trash2, Eye, EyeOff, FileText, Image } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';

interface NoticeListProps {
  notices: Notice[];
}

export function NoticeList({ notices }: NoticeListProps) {
  const { togglePublish, deleteNotice } = useNotices();

  const handleTogglePublish = async (notice: Notice) => {
    await togglePublish(notice._id);
  };

  const handleDelete = async (id: string) => {
    await deleteNotice(id);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === 'application/pdf') {
      return <FileText className="w-5 h-5 text-destructive" />;
    }
    return <Image className="w-5 h-5 text-primary" />;
  };

  const getStatusBadge = (notice: Notice) => {
    if (notice.is_published || notice.status === 'published') {
      return (
        <Badge variant="default" className="bg-primary/20 text-primary border-0">
          <Eye className="w-3 h-3 mr-1" />
          Published
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <EyeOff className="w-3 h-3 mr-1" />
        Draft
      </Badge>
    );
  };

  return (
    <div className="space-y-3">
      {notices.map((notice) => (
        <div
          key={notice._id}
          className="glass-panel p-4 flex items-center gap-4 animate-fade-in"
        >
          {/* Thumbnail */}
          <div className="w-16 h-16 rounded-lg bg-secondary flex-shrink-0 overflow-hidden">
            {notice.file_type?.startsWith('image/') ? (
              <img
                src={notice.fileUrl}
                alt={notice.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {getFileIcon(notice.file_type)}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium truncate">{notice.title}</h3>
              {getStatusBadge(notice)}
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {notice.description || 'No description'}
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Created {formatDistanceToNow(new Date(notice.created_at), { addSuffix: true })}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Switch
              checked={notice.is_published}
              onCheckedChange={() => handleTogglePublish(notice)}
            />
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Notice</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{notice.title}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(notice._id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ))}

      {notices.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No notices yet. Create your first notice above.</p>
        </div>
      )}
    </div>
  );
}
