import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Briefcase, Calculator, Cog, ExternalLink, GraduationCap, MessageSquareReply, Sun } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { DEMO_REPLIES } from '@/data/platform-demo';
import ClientView from '@/components/platform/ClientView';
import NewClientWizard from '@/components/platform/NewClientWizard';
import CalculatorView from '@/components/platform/CalculatorView';
import ClientsView from '@/components/platform/ClientsView';
import RepliesView from '@/components/platform/RepliesView';
import TodayView from '@/components/platform/TodayView';
import OnboardingView from '@/components/platform/OnboardingView';
import { PRACTICE_COUNT, PracticeTarget, onboardingMemory } from '@/components/platform/onboarding';

const NAV = [
  { id: 'start', label: 'Първи стъпки', icon: GraduationCap },
  { id: 'today', label: 'Днес', icon: Sun },
  { id: 'clients', label: 'Клиенти', icon: Briefcase },
  { id: 'replies', label: 'Отговори', icon: MessageSquareReply },
  { id: 'calc', label: 'Калкулатор', icon: Calculator },
] as const;

type Tab = (typeof NAV)[number]['id'];

const Platform = () => {
  const [params, setParams] = useSearchParams();
  const tab = (NAV.some((n) => n.id === params.get('tab')) ? params.get('tab') : 'today') as Tab;
  const clientId = params.get('client');
  const [resolved, setResolved] = useState<Set<string>>(new Set());
  const [handled, setHandled] = useState<Set<string>>(new Set());
  const [step, setStepState] = useState(onboardingMemory.step);
  const [practiced, setPracticed] = useState(onboardingMemory.practiced);
  const navigate = useNavigate();
  const setStep = (n: number) => {
    onboardingMemory.step = n;
    setStepState(n);
  };
  const practice = (id: string, to: PracticeTarget) => {
    const next = new Set(practiced).add(id);
    onboardingMemory.practiced = next;
    setPracticed(next);
    if ('path' in to) navigate(to.path);
    else go(to.tab, 'client' in to ? to.client : undefined);
  };
  const repliesLeft = DEMO_REPLIES.length - handled.size;

  const go = (next: Tab, client?: string) => {
    const p = new URLSearchParams();
    if (next !== 'today') p.set('tab', next);
    if (client) p.set('client', client);
    setParams(p);
    window.scrollTo({ top: 0 });
  };

  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'P4G Платформа · прототип';
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, nofollow';
    document.head.appendChild(robots);
    return () => {
      document.title = prevTitle;
      robots.remove();
    };
  }, []);

  const badge = (id: Tab) => {
    if (id === 'replies' && repliesLeft > 0) return repliesLeft;
    if (id === 'start' && practiced.size < PRACTICE_COUNT) return `${practiced.size}/${PRACTICE_COUNT}`;
    return null;
  };

  return (
    <div className="min-h-screen bg-secondary/50 lg:flex">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-muted p-4 text-white lg:flex">
        <Link to="/platform" className="flex items-center gap-2 px-2 py-1">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-sm font-bold">P4G</span>
          <span className="font-bold">Платформа</span>
        </Link>
        <nav className="mt-8 space-y-1">
          {NAV.map((n) => {
            const Icon = n.icon;
            const on = tab === n.id;
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => go(n.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  on ? 'bg-white/10 text-white' : 'text-white/65 hover:bg-white/5 hover:text-white'
                )}
              >
                <Icon className="h-4 w-4" />
                {n.label}
                {badge(n.id) && <span className="ml-auto rounded-full bg-primary px-2 text-xs">{badge(n.id)}</span>}
              </button>
            );
          })}
        </nav>
        <div className="mt-auto space-y-3">
          <Link
            to="/system"
            className="flex items-center gap-3 rounded-lg border border-white/10 px-3 py-2.5 text-sm text-white/65 transition-colors hover:text-white"
          >
            <Cog className="h-4 w-4" />
            Под капака: скилове
            <ExternalLink className="ml-auto h-3.5 w-3.5" />
          </Link>
          <div className="flex items-center gap-3 px-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-bold">В</span>
            <div className="text-sm">
              <p className="font-medium">Вес</p>
              <p className="text-xs text-white/55">P4G екип</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur lg:hidden">
          <span className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-xs font-bold text-white">P4G</span>
            <span className="font-bold">Платформа</span>
          </span>
          <Link to="/system" className="flex items-center gap-1 text-xs text-muted-foreground">
            <Cog className="h-4 w-4" /> Скилове
          </Link>
        </header>

        <div className="bg-accent/10 px-4 py-1.5 text-center text-xs text-accent sm:px-8">
          Прототип: клиентите, хората и числата са примерни. Фазите, гейтовете и скиловете са от system-map.json.
        </div>

        <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-8 sm:pt-10 lg:pb-16">
          {tab === 'start' && <OnboardingView step={step} setStep={setStep} practiced={practiced} onPractice={practice} />}
          {tab === 'today' && practiced.size < PRACTICE_COUNT && (
            <button
              type="button"
              onClick={() => go('start')}
              className="group mb-6 flex w-full items-center gap-3 rounded-2xl border border-accent/30 bg-accent/[0.07] p-4 text-left transition-colors hover:bg-accent/[0.12]"
            >
              <GraduationCap className="h-6 w-6 shrink-0 text-accent" />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">Нови сте в екипа?</span>
                <span className="block text-sm text-muted-foreground">Пет кратки стъпки: как работи системата, кое решавате вие и четири упражнения.</span>
              </span>
              <ArrowRight className="h-5 w-5 shrink-0 text-accent transition-transform group-hover:translate-x-0.5" />
            </button>
          )}
          {tab === 'today' && (
            <TodayView
              resolved={resolved}
              repliesLeft={repliesLeft}
              onResolve={(key, label) => {
                setResolved(new Set(resolved).add(key));
                toast.success('Отбелязано', { description: `${label}. Агентът продължава.` });
              }}
              onOpenClient={(id) => go('clients', id)}
              onOpenReplies={() => go('replies')}
            />
          )}
          {tab === 'clients' && !clientId && <ClientsView onOpenClient={(id) => go('clients', id)} onNewClient={() => go('clients', 'new')} />}
          {tab === 'clients' && clientId === 'new' && <NewClientWizard onCancel={() => go('clients')} onDone={(id) => go('clients', id)} />}
          {tab === 'clients' && clientId && clientId !== 'new' && <ClientView key={clientId} clientId={clientId} onBack={() => go('clients')} />}
          {tab === 'calc' && <CalculatorView />}
          {tab === 'replies' && (
            <RepliesView
              handled={handled}
              onHandle={(id, verb) => {
                setHandled(new Set(handled).add(id));
                toast.success(verb, { description: 'Hermes поема оттук.' });
              }}
            />
          )}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        {NAV.map((n) => {
          const Icon = n.icon;
          const on = tab === n.id;
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => go(n.id)}
              className={cn('relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium', on ? 'text-primary' : 'text-muted-foreground')}
            >
              <Icon className="h-5 w-5" />
              {n.label}
              {badge(n.id) && (
                <span className="absolute right-[calc(50%-20px)] top-1.5 rounded-full bg-primary px-1.5 text-[10px] text-white">{badge(n.id)}</span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Platform;
