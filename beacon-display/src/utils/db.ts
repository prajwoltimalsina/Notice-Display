import { openDB } from "idb";

export const dbPromise = openDB("notice-db", 1, {
  upgrade(db) {
    db.createObjectStore("notices", { keyPath: "_id" });
    db.createObjectStore("media", { keyPath: "url" });
  },
});

export async function saveNotices(notices: any[]) {
  const db = await dbPromise;
  const tx = db.transaction("notices", "readwrite");
  for (const n of notices) tx.store.put(n);
  await tx.done;

  const mediaTx = db.transaction("media", "readwrite");
  for (const n of notices) {
    if (!n.fileUrl) continue;
    try {
      const mediaUrl = n.fileUrl.startsWith("http") ? n.fileUrl : `http://localhost:5000${n.fileUrl}`;
      const cached = await db.get("media", mediaUrl);
      if (!cached) {
        const res = await fetch(mediaUrl);
        const blob = await res.blob();
        mediaTx.store.put({ url: mediaUrl, blob });
      }
    } catch (err) {
      console.warn("Failed to cache media:", n.fileUrl, err);
    }
  }
  await mediaTx.done;
}

export async function getNotices() {
  const db = await dbPromise;
  return db.getAll("notices");
}

export async function getMedia(url: string) {
  const db = await dbPromise;
  const mediaUrl = url.startsWith("http") ? url : `http://localhost:5000${url}`;
  const record = await db.get("media", mediaUrl);
  return record?.blob ? URL.createObjectURL(record.blob) : mediaUrl;
}
