-- ─── Tabela de perfis ────────────────────────────────────────────────────────
create table public.perfis (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  nome          text not null,
  plano         text not null default 'basico' check (plano in ('basico', 'pro')),
  ativo         boolean not null default false,
  stripe_customer_id      text,
  stripe_subscription_id  text,
  criado_em     timestamptz not null default now()
);

alter table public.perfis enable row level security;

create policy "Usuário vê e edita seu próprio perfil"
  on public.perfis for all
  using (auth.uid() = id);

-- ─── Tabela de clientes Pro ───────────────────────────────────────────────────
create table public.clientes_pro (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.perfis(id) on delete cascade,
  nome             text not null,
  data_nascimento  date not null,
  notas            text,
  criado_em        timestamptz not null default now()
);

alter table public.clientes_pro enable row level security;

create policy "Usuário gerencia seus clientes"
  on public.clientes_pro for all
  using (auth.uid() = user_id);

-- ─── Tabela de relatórios ─────────────────────────────────────────────────────
create table public.relatorios (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.perfis(id) on delete cascade,
  cliente_id      uuid references public.clientes_pro(id) on delete set null,
  cliente_nome    text not null,
  tiragem         jsonb not null default '[]',
  texto_editado   text not null default '',
  criado_em       timestamptz not null default now()
);

alter table public.relatorios enable row level security;

create policy "Usuário gerencia seus relatórios"
  on public.relatorios for all
  using (auth.uid() = user_id);

-- ─── Tabela de leads (landing page) ──────────────────────────────────────────
create table public.leads (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  nome       text,
  plano      text,
  origem     text default 'landing',
  criado_em  timestamptz not null default now()
);

alter table public.leads enable row level security;

-- Leads só podem ser inseridos (sem leitura pelo front)
create policy "Inserir lead"
  on public.leads for insert
  with check (true);
