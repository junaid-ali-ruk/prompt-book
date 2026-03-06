import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import { AGENT_TOOLS, type Prompt } from "@/data/prompts";
import { useSavePrompt } from "@/hooks/use-save-prompt";
import type { ImageSourceType } from "@/lib/prompt-types";

interface PromptFormProps {
  currentUserId: string;
  defaultAuthorName: string;
  initialPrompt?: Prompt;
  onSaved?: (prompt: Prompt) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export default function PromptForm({ currentUserId, defaultAuthorName, initialPrompt, onSaved, onCancel, submitLabel = "SUBMIT PROMPT" }: PromptFormProps) {
  const savePrompt = useSavePrompt(currentUserId);
  const [title, setTitle] = useState(initialPrompt?.title ?? "");
  const [promptText, setPromptText] = useState(initialPrompt?.prompt ?? "");
  const [agent, setAgent] = useState(initialPrompt?.agent ?? AGENT_TOOLS[0]);
  const [authorName, setAuthorName] = useState(initialPrompt?.author ?? defaultAuthorName);
  const [liveUrl, setLiveUrl] = useState(initialPrompt?.liveUrl ?? "");
  const [imageSourceType, setImageSourceType] = useState<ImageSourceType>(initialPrompt?.imageSourceType ?? "upload");
  const [imageUrl, setImageUrl] = useState(initialPrompt?.imageSourceType === "url" ? initialPrompt.image : "");
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (!initialPrompt) return;
    setTitle(initialPrompt.title); setPromptText(initialPrompt.prompt); setAgent(initialPrompt.agent); setAuthorName(initialPrompt.author);
    setLiveUrl(initialPrompt.liveUrl ?? ""); setImageSourceType(initialPrompt.imageSourceType ?? "upload");
    setImageUrl(initialPrompt.imageSourceType === "url" ? initialPrompt.image : ""); setImageFile(null);
  }, [initialPrompt]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const savedPrompt = await savePrompt.mutateAsync({ promptId: initialPrompt?.id, title, prompt: promptText, agent, authorName, liveUrl, imageSourceType, imageUrl, imageFile, existingImageKey: initialPrompt?.imageKey, existingImageUrl: initialPrompt?.image });
      toast.success(initialPrompt ? "Prompt updated and sent for review." : "Prompt submitted for review.");
      onSaved?.(savedPrompt);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save prompt.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="space-y-2"><Label htmlFor="prompt-title" className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Prompt title</Label><Input id="prompt-title" value={title} onChange={event => setTitle(event.target.value)} placeholder="SaaS landing page hero prompt" required className="rounded-sm border-border bg-background text-sm" /></div>
      <div className="space-y-2"><Label htmlFor="prompt-text" className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Prompt content</Label><Textarea id="prompt-text" value={promptText} onChange={event => setPromptText(event.target.value)} placeholder="Describe the prompt, context, and key constraints you used..." required rows={5} className="max-h-80 min-h-32 rounded-sm border-border bg-background text-sm resize-none overflow-y-auto" /></div>
      <div className="space-y-2"><Label htmlFor="prompt-agent" className="text-xs uppercase tracking-[0.15em] text-muted-foreground">AI tool</Label><Select value={agent} onValueChange={value => setAgent(value as typeof agent)}><SelectTrigger id="prompt-agent" className="rounded-sm border-border bg-background text-sm"><SelectValue placeholder="Select the tool used" /></SelectTrigger><SelectContent className="border-border bg-card">{AGENT_TOOLS.map(option => <SelectItem key={option} value={option} className="text-sm">{option}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-2"><Label htmlFor="author-name" className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Display name</Label><Input id="author-name" value={authorName} onChange={event => setAuthorName(event.target.value)} placeholder="How your name should appear" required className="rounded-sm border-border bg-background text-sm" /></div>
      <div className="space-y-2"><Label htmlFor="live-url" className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Live demo URL (optional)</Label><Input id="live-url" value={liveUrl} onChange={event => setLiveUrl(event.target.value)} placeholder="https://example.com/demo" type="url" className="rounded-sm border-border bg-background text-sm" /></div>
      <div className="grid grid-cols-2 gap-2"><Button type="button" variant={imageSourceType === "upload" ? "default" : "outline"} className="rounded-sm text-[11px] uppercase tracking-[0.15em]" onClick={() => setImageSourceType("upload")}>Upload image</Button><Button type="button" variant={imageSourceType === "url" ? "default" : "outline"} className="rounded-sm text-[11px] uppercase tracking-[0.15em]" onClick={() => setImageSourceType("url")}>Image URL</Button></div>
      <div className="space-y-2"><Label htmlFor="prompt-image" className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Preview image</Label>{imageSourceType === "upload" ? <><Input id="prompt-image" type="file" accept="image/*" onChange={event => setImageFile(event.target.files?.[0] ?? null)} className="rounded-sm border-border bg-background text-sm file:text-foreground" /><p className="text-xs text-muted-foreground">Upload JPG, PNG, WebP, or another image file up to 15 MB.</p></> : <><Input id="prompt-image" value={imageUrl} onChange={event => setImageUrl(event.target.value)} placeholder="https://example.com/screenshot.png" type="url" required className="rounded-sm border-border bg-background text-sm" /><p className="text-xs text-muted-foreground">Use a direct `http://` or `https://` image URL.</p></>}</div>
      <div className="flex gap-2">{onCancel ? <Button type="button" variant="outline" className="flex-1 rounded-sm" onClick={onCancel}>Cancel</Button> : null}<Button type="submit" className="glow-heat flex-1 rounded-sm border border-[hsl(var(--heat))] bg-[hsl(var(--heat))] text-[11px] font-semibold uppercase tracking-[0.15em] text-primary-foreground hover:brightness-110" disabled={savePrompt.isPending}>{savePrompt.isPending ? "Saving..." : submitLabel}</Button></div>
    </form>
  );
}

