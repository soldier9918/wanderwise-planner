import { confirmDialog } from "@/components/ConfirmDialog";
import { useCallback, useEffect, useRef, useState } from "react";
import { Download, FileIcon, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import BrandCardsSettings from "@/components/BrandCardsSettings";

const BUCKET = "video-assets";
const MAX_BYTES = 50 * 1024 * 1024;

type Item = { name: string; path: string; url: string; size: number; type: string };

export default function Library() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const folder = user ? `${user.id}/library` : "";

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.storage.from(BUCKET).list(folder, { sortBy: { column: "created_at", order: "desc" }, limit: 500 });
    if (error) { toast.error(error.message); setLoading(false); return; }
    const files = (data ?? []).filter((f) => f.id);
    const paths = files.map((f) => `${folder}/${f.name}`);
    const signed = paths.length ? (await supabase.storage.from(BUCKET).createSignedUrls(paths, 3600)).data ?? [] : [];
    setItems(files.map((f, i) => ({
      name: f.name.replace(/^\d+-/, ""),
      path: paths[i],
      url: signed[i]?.signedUrl ?? "",
      size: (f.metadata as any)?.size ?? 0,
      type: (f.metadata as any)?.mimetype ?? "",
    })));
    setLoading(false);
  }, [user, folder]);

  useEffect(() => { load(); }, [load]);

  const uploadOne = async (file: File): Promise<string | null> => {
    if (!user) return null;
    if (file.size > MAX_BYTES) { toast.error(`${file.name} is over 50 MB`); return null; }
    const safe = file.name.replace(/[^\w.\-]+/g, "_");
    const path = `${folder}/${Date.now()}-${safe}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type });
    if (error) { toast.error(`${file.name}: ${error.message}`); return null; }
    await load();
    return path;
  };

  const onFiles = async (files: FileList | null) => {
    if (!files?.length || !user) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      if (file.size > MAX_BYTES) { toast.error(`${file.name} is over 50 MB`); continue; }
      const safe = file.name.replace(/[^\w.\-]+/g, "_");
      const { error } = await supabase.storage.from(BUCKET).upload(`${folder}/${Date.now()}-${safe}`, file, { contentType: file.type });
      if (error) toast.error(`${file.name}: ${error.message}`);
    }
    setUploading(false);
    if (input.current) input.current.value = "";
    toast.success("Saved to your library");
    load();
  };

  const remove = async (item: Item) => {
    if (!(await confirmDialog({ title: "Delete file?", message: `${item.name} will be removed from your library.`, confirmText: "Delete", destructive: true }))) return;
    const { error } = await supabase.storage.from(BUCKET).remove([item.path]);
    if (error) return toast.error(error.message);
    setItems((s) => s.filter((i) => i.path !== item.path));
  };

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="container max-w-5xl py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold">My Library</h1>
            <p className="mt-2 text-muted-foreground">Store your images, logos, clips and audio in one place. Only you can see them.</p>
          </div>
          <input ref={input} type="file" multiple accept="image/*,video/*,audio/*" className="hidden" onChange={(e) => onFiles(e.target.files)} />
          <Button onClick={() => input.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}Upload files
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Images, video and audio, up to 50 MB each.</p>
        <BrandCardsSettings clips={items.filter((i) => i.type.startsWith("video/")).map((i) => ({ name: i.name, path: i.path, url: i.url }))} onUpload={uploadOne} />

        {loading ? (
          <div className="mt-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : items.length === 0 ? (
          <button onClick={() => input.current?.click()} className="mt-8 w-full rounded-xl border-2 border-dashed border-border p-12 text-center text-muted-foreground hover:border-primary">
            <Upload className="mx-auto mb-3 h-8 w-8" />Your library is empty — tap to upload your first file.
          </button>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <div key={item.path} className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="grid aspect-video place-items-center bg-muted">
                  {item.type.startsWith("image/") ? <img src={item.url} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
                    : item.type.startsWith("video/") ? <video src={item.url} className="h-full w-full object-cover" muted controls preload="metadata" />
                    : item.type.startsWith("audio/") ? <audio src={item.url} controls className="w-full px-2" />
                    : <FileIcon className="h-8 w-8 text-muted-foreground" />}
                </div>
                <div className="flex items-center gap-1 p-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium" title={item.name}>{item.name}</p>
                    <p className="text-xs text-muted-foreground">{(item.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                  <Button size="icon" variant="ghost" asChild aria-label="Download"><a href={item.url} download={item.name} target="_blank" rel="noreferrer"><Download className="h-4 w-4" /></a></Button>
                  <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => remove(item)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
