import { useNotices } from '@/hooks/useNotices';
import { useDisplaySettings } from '@/hooks/useDisplaySettings';
import { NoticeSlideshow } from '@/components/NoticeSlideshow';
import { DisplaySidebar } from '@/components/DisplaySidebar';
import { MarqueeFooter } from '@/components/MarqueeFooter';
import { Loader2, Home, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useMongoAuth } from '@/hooks/useMongoAuth';

export default function Display() {
  // Use publicOnly=true to fetch only published notices
  const { notices, isLoading } = useNotices(true);
  const { getSetting, isLoading: settingsLoading } = useDisplaySettings();
  const { user, isAdmin } = useMongoAuth();

  if (isLoading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-950">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  const footerMessage = getSetting('footer_message', 'Welcome to Kathmandu University | School of Science | Excellence Through Knowledge');

  return (
    <div className="min-h-screen h-screen flex flex-col overflow-hidden bg-gradient-to-br from-blue-800 via-blue-900 to-blue-950">
      {/* Navigation Controls - Top Left Corner */}
      <div className="absolute top-4 left-4 z-50 flex gap-2 opacity-30 hover:opacity-100 transition-opacity duration-300">
        <Link to="/">
          <Button variant="secondary" size="icon" className="backdrop-blur-sm bg-white/20 hover:bg-white/40 border-0 text-white">
            <Home className="w-5 h-5" />
          </Button>
        </Link>
        {user && isAdmin && (
          <Link to="/admin">
            <Button variant="secondary" size="icon" className="backdrop-blur-sm bg-white/20 hover:bg-white/40 border-0 text-white">
              <Settings className="w-5 h-5" />
            </Button>
          </Link>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex gap-3 p-3 min-h-0">
        {/* Notice Display Area - Takes remaining space */}
        <div className="flex-1 min-w-0">
          <NoticeSlideshow notices={notices} intervalMs={10000} />
        </div>

        {/* Right Sidebar - Fixed width */}
        <div className="w-48 md:w-56 lg:w-64 flex-shrink-0 rounded-lg overflow-hidden shadow-2xl">
          <DisplaySidebar />
        </div>
      </div>

      {/* Animated Footer */}
      <div className="flex-shrink-0">
        <MarqueeFooter message={footerMessage} />
      </div>
    </div>
  );
}
