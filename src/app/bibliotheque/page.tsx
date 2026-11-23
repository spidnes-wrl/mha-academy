import { BookOpen, FileText, ExternalLink } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Banner, Card, ChibiSticker } from '@/components/ui/AcademyUI';
export const dynamic = 'force-dynamic';
export default async function LibraryPage() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from('hma_documents').select('id,title,description,file_url,category,created_at').eq('access_level','public').order('created_at',{ascending:false});
  return <main className="mha-page">
    <Banner><p className="text-xs font-semibold uppercase tracking-wider text-[#BFD2FF]">Ressources</p><h1 className="mt-3 text-2xl font-bold">Bibliothèque</h1><p className="mt-2 text-sm text-[#BFD2FF]">Retrouve les documents et supports de l’académie.</p><ChibiSticker label="READ"/></Banner>
    <div className="mt-8 flex items-center justify-between"><h2 className="text-lg font-bold">Documents</h2><BookOpen size={20} className="text-[#BFD2FF]"/></div>
    {error ? <Card className="mt-3 text-sm text-[#BFD2FF]">Les documents ne sont pas accessibles pour le moment.</Card> : !data?.length ? <Card className="mt-3 text-sm text-[#9AA7C2]">Aucun document public pour le moment.</Card> : <div className="mt-3 space-y-3">{data.map(doc=><Card key={doc.id} className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-600/15 text-[#BFD2FF]"><FileText size={21}/></span><div className="min-w-0 flex-1"><p className="text-xs text-[#BFD2FF]">{doc.category}</p><h3 className="mt-1 font-bold">{doc.title}</h3><p className="mt-1 text-sm text-[#9AA7C2]">{doc.description}</p>{doc.file_url && <a href={doc.file_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#BFD2FF]">Ouvrir le document <ExternalLink size={15}/></a>}</div></Card>)}</div>}
  </main>;
}
