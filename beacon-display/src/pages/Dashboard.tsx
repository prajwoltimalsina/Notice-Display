import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMongoAuth } from '@/hooks/useMongoAuth';
import { useNotices } from '@/hooks/useNotices';
import { Header } from '@/components/Header';
import { NoticeCanvas } from '@/components/NoticeCanvas';
import { InfoBar } from '@/components/InfoBar';
import { Loader2, LayoutGrid, MonitorPlay } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { user, isLoading: authLoading } = useMongoAuth();
  const { notices, isLoading: noticesLoading } = useNotices();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || noticesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6 animate-fade-in">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">View and arrange notices on the canvas</p>
            </div>
            <Link to="/display">
              <Button variant="outline" className="gap-2">
                <MonitorPlay className="w-4 h-4" />
                Full Display
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="glass-panel p-4 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <LayoutGrid className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{notices.length}</p>
                  <p className="text-sm text-muted-foreground">Total Notices</p>
                </div>
              </div>
            </div>
            <div className="glass-panel p-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <LayoutGrid className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{notices.filter(n => n.is_published).length}</p>
                  <p className="text-sm text-muted-foreground">Published</p>
                </div>
              </div>
            </div>
            <div className="glass-panel p-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <LayoutGrid className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{notices.filter(n => !n.is_published).length}</p>
                  <p className="text-sm text-muted-foreground">Drafts</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden animate-fade-in" style={{ height: 'calc(100vh - 320px)', minHeight: '400px', animationDelay: '0.4s' }}>
            <NoticeCanvas notices={notices} isEditable={true} />
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">Drag notices to rearrange them. Changes sync in real-time.</p>
        </div>
      </main>
      <InfoBar />
    </div>
  );
}
