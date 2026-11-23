import AppModulePage from '@/components/AppModulePage';

export default function CommunautePage() {
  return (
    <AppModulePage
      title="Communauté"
      description="Un espace pour échanger, suivre les actualités et participer à la vie de MHA Academy."
      items={[
        'Discussions et messages',
        'Publications communautaires',
        'Événements de l’académie',
        'Groupes et clans',
      ]}
    />
  );
}
