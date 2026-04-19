import { useState, useEffect, useCallback, useRef } from "react";
import { Notice } from "@/types/database";
import { FileText } from "lucide-react";
import { saveNotices, getNotices, getMedia } from "@/utils/db";

interface NoticeSlideshowProps {
  notices: Notice[];
  intervalMs?: number;
  pollIntervalMs?: number; // New: how often to check for new notices
}

export function NoticeSlideshow({
  notices,
  intervalMs = 10000,
  pollIntervalMs = 30000, // Poll every 30 seconds by default
}: NoticeSlideshowProps) {
  const [offlineNotices, setOfflineNotices] = useState<Notice[]>(notices);
  const [mediaMap, setMediaMap] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  // const [isTransitioning, setIsTransitioning] = useState(false);
  const lastFetchedIdsRef = useRef<string>("");

  const noticesPerView = 2;

  // Core fetch function — only updates state if notices actually changed
  const fetchAndUpdateNotices = useCallback(async () => {
    if (!navigator.onLine) return;

    try {
      const res = await fetch("http://localhost:5000/api/notices/published");
      const data: Notice[] = await res.json();

      // Compare by serializing IDs + published state to detect changes
      const newIds = data
        .map((n) => `${n._id}:${n.is_published}`)
        .sort()
        .join(",");

      if (newIds === lastFetchedIdsRef.current) return; // No changes, skip re-render
      lastFetchedIdsRef.current = newIds;

      await saveNotices(data);
      setOfflineNotices(data);

      const map: Record<string, string> = {};
      await Promise.all(
        data.map(async (n: Notice) => {
          if (n.fileUrl) map[n._id] = await getMedia(n.fileUrl);
        }),
      );
      setMediaMap(map);
    } catch {
      // silent fail — use cached data
    }
  }, []);

  // Initial load: use IndexedDB cache first, then fetch from server
  useEffect(() => {
    async function initialLoad() {
      const cached = notices.length > 0 ? notices : await getNotices();

      if (cached.length > 0) {
        setOfflineNotices(cached);
        const map: Record<string, string> = {};
        await Promise.all(
          cached.map(async (n) => {
            if (n.fileUrl) map[n._id] = await getMedia(n.fileUrl);
          }),
        );
        setMediaMap(map);
      }

      await fetchAndUpdateNotices();
    }

    initialLoad();

    const handleOnline = () => fetchAndUpdateNotices();
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [notices, fetchAndUpdateNotices]);

  // ✅ Polling: auto-fetch new notices from any device on interval
  useEffect(() => {
    const poll = setInterval(fetchAndUpdateNotices, pollIntervalMs);
    return () => clearInterval(poll);
  }, [fetchAndUpdateNotices, pollIntervalMs]);

  // ✅ Visibility API: re-fetch immediately when tab becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchAndUpdateNotices();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [fetchAndUpdateNotices]);

  const publishedNotices = offlineNotices.filter((n) => n.is_published);

  // Create infinite circular loop by duplicating first notices at the end
  const circularNotices =
    publishedNotices.length >= 2
      ? [...publishedNotices, publishedNotices[0], publishedNotices[1]]
      : publishedNotices;

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % publishedNotices.length);
  }, [publishedNotices.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) =>
      prev === 0 ? publishedNotices.length - 1 : prev - 1,
    );
  }, [publishedNotices.length]);

  useEffect(() => {
    if (publishedNotices.length === 0) return;
    const interval = setInterval(goToNext, intervalMs);
    return () => clearInterval(interval);
  }, [publishedNotices.length, intervalMs, goToNext]);

  useEffect(() => {
    if (currentIndex >= publishedNotices.length) setCurrentIndex(0);
  }, [publishedNotices.length, currentIndex]);

  if (publishedNotices.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-900 rounded-lg">
        <div className="text-center p-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-900/50 flex items-center justify-center">
            <span className="text-3xl">📋</span>
          </div>
          <h3 className="text-xl font-medium text-slate-300">
            No notices to display
          </h3>
          <p className="text-sm text-slate-500 mt-2">
            Notices will appear here when published
          </p>
        </div>
      </div>
    );
  }

  const renderNotice = (notice: Notice, idx?: number) => {
    const mediaUrl = mediaMap[notice._id] || notice.fileUrl;
    const isImage = notice?.file_type?.startsWith("image/");
    const isPdf = notice?.file_type === "application/pdf";
    const isVideo = notice?.file_type?.startsWith("video/");

    return (
      <div
        key={`${notice._id}-${idx}`}
        className="w-1/2 flex-shrink-0 flex flex-col min-w-0 bg-slate-900/95 border border-slate-700 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
      >
        <div className="flex-1 relative overflow-hidden p-1">
          {isImage ? (
            <img
              src={mediaUrl}
              alt={notice.title}
              className="w-full h-full object-fill rounded-lg"
            />
          ) : isVideo ? (
            <video
              src={mediaUrl}
              controls
              className="w-full h-full rounded-lg"
              style={{ objectFit: "fill" }}
            />
          ) : isPdf ? (
            <iframe
              src={`${mediaUrl}#toolbar=0&navpanes=0&view=FitH`}
              sandbox=""
              className="w-full h-full border-0 rounded-lg"
              title={notice.title}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <FileText className="w-12 h-12 text-blue-400 mb-2" />
              <h3 className="text-lg font-semibold text-slate-200">
                {notice.title}
              </h3>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-1 relative overflow-hidden">
        <div
          className="w-full h-[calc(100%+25px)] flex gap-1 p-1 transition-transform duration-700 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * (100 / noticesPerView)}%)`,
          }}
        >
          {circularNotices.map((notice, idx) => renderNotice(notice, idx))}
        </div>
      </div>
    </div>
  );
}
