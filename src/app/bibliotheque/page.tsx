import { BookOpen, FileText, ExternalLink } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Banner, Card, ChibiSticker } from '@/components/ui/AcademyUI';

export const dynamic = 'force-dynamic';

export default async function LibraryPage() {
  let data: any[] = [];
  let errorMessage = '';
  try {
    const supabase = createSupabaseServerClient();
    const result = await supabase.from('hma_library_items')
      .select('id,title,description,file_path,content_type,is_published,created_at')
      .eq('is_published', true)
      .order('created_at', { ascending: false });
    if (result.error) errorMessage = result.error.message;
    else data = result.data || [];
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : 'Impossible de charger la bibliothèque.';
  }

  return <main className="mha-page">
    <Banner><p className="text-xs font-semibold uppercase tracking-wider text-[#BFD2FF]">Ressources</p><h1 className="mt-3 text-2xl font-bold">Bibliothèque</h1><p className="mt-2 text-sm text-[#BFD2FF]">Retrouve les documents et supports de l’académie.</p><ChibiSticker label="READ"/></Banner>
    <div className="mt-8 flex items-center justify-between"><h2 className="text-lg font-bold">Documents</h2><BookOpen size={20} className="text-[#BFD2FF]"/></div>
    {errorMessage ? <Card className="mt-3 text-sm text-[#BFD2FF]">La bibliothèque n’est pas accessible pour le moment. {errorMessage}</Card> : !data.length ? <Card className="mt-3 text-sm text-[#9AA7C2]">Aucun document publié pour le moment.</Card> : <div className="mt-3 space-y-3">{data.map(doc => <Card key={doc.id} className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-600/15 text-[#BFD2FF]"><FileText size={21}/></span><div className="min-w-0 flex-1"><p className="text-xs text-[#BFD2FF]">{doc.content_type || 'Document'}</p><h3 className="mt-1 font-bold">{doc.title}</h3><p className="mt-1 text-sm text-[#9AA7C2]">{doc.description}</p>{typeof doc.file_path === 'string' && /^https?:\/\//i.test(doc.file_path) ? <a href={doc.file_path} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#BFD2FF]">Ouvrir le document <ExternalLink size={15}/></a> : doc.file_path && <p className="mt-3 break-all text-xs text-[#9AA7C2]">Fichier : {doc.file_path}</p>}</div></Card>)}</div>}
  </main>;
}
