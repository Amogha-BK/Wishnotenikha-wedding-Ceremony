import { validateRecord, type WeddingRecord } from "../invitation/schema";

const database = "wishnote-owner-v1";
async function transact(
  mode: IDBTransactionMode,
  action: "get" | "put" | "delete",
  value?: WeddingRecord,
): Promise<unknown> {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(database, 1);
    request.onupgradeneeded = () => request.result.createObjectStore("drafts");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(new Error("Local storage is unavailable. Export JSON to keep your work."));
    request.onblocked = () => reject(new Error("Close other editor tabs and try again."));
  });
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction("drafts", mode);
      const store = tx.objectStore("drafts");
      const request =
        action === "put"
          ? store.put(value, "current")
          : action === "delete"
            ? store.delete("current")
            : store.get("current");
      tx.oncomplete = () => resolve(request.result);
      tx.onerror = tx.onabort = () =>
        reject(
          new Error("Could not save locally. Export JSON instead; browser storage may be full."),
        );
    });
  } finally {
    db.close();
  }
}
export const saveDraft = (value: WeddingRecord) => transact("readwrite", "put", value);
export const clearDraft = () => transact("readwrite", "delete");
export async function loadDraft(): Promise<WeddingRecord | null> {
  const value = await transact("readonly", "get");
  return value === undefined ? null : validateRecord(value);
}
