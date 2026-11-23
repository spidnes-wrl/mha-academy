import { Coins, ExternalLink, ShoppingBag } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Banner, Card, ChibiSticker } from '@/components/ui/AcademyUI';
export const dynamic = 'force-dynamic';
export default async function ShopPage() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from('hma_shop_items').select('id,name,description,price,image_url,external_link').eq('is_available',true).order('created_at',{ascending:false});
  return <main className="mha-page">
    <Banner><p className="text-xs font-semibold uppercase tracking-wider text-[#BFD2FF]">Économie MHA</p><h1 className="mt-3 text-2xl font-bold">Boutique</h1><p className="mt-2 text-sm text-[#BFD2FF]">Découvre les articles disponibles.</p><ChibiSticker label="SHOP"/></Banner>
    <div className="mt-8 flex items-center justify-between"><h2 className="text-lg font-bold">Articles disponibles</h2><ShoppingBag size={20} className="text-[#BFD2FF]"/></div>
    {error ? <Card className="mt-3 text-sm text-[#BFD2FF]">La boutique n’est pas accessible pour le moment.</Card> : !data?.length ? <Card className="mt-3 text-sm text-[#9AA7C2]">Aucun article disponible pour le moment.</Card> : <div className="mt-3 grid grid-cols-2 gap-3">{data.map(item=><Card key={item.id} className="p-3">{item.image_url ? <img src={item.image_url} alt="" className="mb-3 aspect-square w-full rounded-xl object-cover"/> : <div className="mb-3 grid aspect-square place-items-center rounded-xl bg-blue-600/10 text-[#BFD2FF]"><ShoppingBag size={30}/></div>}<h3 className="font-bold">{item.name}</h3><p className="mt-1 line-clamp-3 text-xs leading-5 text-[#9AA7C2]">{item.description}</p><p className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[#BFD2FF]"><Coins size={15}/>{item.price}</p>{item.external_link && <a href={item.external_link} target="_blank" rel="noreferrer" aria-label={`Voir ${item.name}`} className="mt-3 flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#1B2437] text-xs font-semibold">Voir l’article <ExternalLink size={14}/></a>}</Card>)}</div>}
  </main>;
}
