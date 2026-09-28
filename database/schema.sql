-- PostgreSQL / Supabase. Run as migration owner, never in the browser.
begin;
create table if not exists public.categories(id text primary key,slug text unique not null,name text not null);
create table if not exists public.warehouses(id text primary key,name text not null);
create table if not exists public.products(
 id text primary key,sku text unique not null,slug text unique not null check(slug ~ '^[a-z0-9-]+$'),
 category_id text not null references public.categories(id),warehouse_id text references public.warehouses(id),
 name text not null,brand text,model text not null,description text not null,
 price_cop bigint not null check(price_cop>0),previous_price_cop bigint check(previous_price_cop>0),
 color text not null,state text not null check(state in ('active','review','inactive')),
 family text,material text,weight_g integer,featured boolean not null default false,home_rank integer not null default 9999,
 benefits jsonb not null default '[]',size_note text not null default '',
 updated_at timestamptz not null default now(),created_at timestamptz not null default now());
create index if not exists products_category_price on public.products(category_id,price_cop) where state!='inactive';
create index if not exists products_warehouse on public.products(warehouse_id);
create table if not exists public.variants(id text primary key,product_id text not null references public.products(id) on delete cascade,size text not null,color text not null,unique(product_id,size,color));
create index if not exists variants_product on public.variants(product_id);
create table if not exists public.inventory(variant_id text references public.variants(id) on delete cascade,warehouse_id text references public.warehouses(id),quantity integer check(quantity>=0),checked_at timestamptz,primary key(variant_id,warehouse_id));
create table if not exists public.product_images(id text primary key,product_id text not null references public.products(id) on delete cascade,url text not null,sort_order integer not null,alt text not null,unique(product_id,sort_order));
create index if not exists images_product on public.product_images(product_id,sort_order);
create table if not exists public.product_seo(product_id text primary key references public.products(id) on delete cascade,title text not null,description text not null);
create table if not exists public.promotions(id text primary key,warehouse_id text references public.warehouses(id),name text not null,rules jsonb not null,valid_from timestamptz,valid_until timestamptz,approved boolean not null default false);
create table if not exists public.user_profiles(id uuid primary key references auth.users(id) on delete cascade,role text not null default 'customer' check(role in ('customer','editor','admin')),created_at timestamptz default now());
-- Public reads only. No anon or authenticated insert/update/delete policies.
alter table public.categories enable row level security;
alter table public.warehouses enable row level security;
alter table public.products enable row level security;
alter table public.variants enable row level security;
alter table public.inventory enable row level security;
alter table public.product_images enable row level security;
alter table public.product_seo enable row level security;
alter table public.promotions enable row level security;
alter table public.user_profiles enable row level security;
drop policy if exists catalog_read on public.products;
create policy catalog_read on public.products for select to anon,authenticated using(state in ('active','review'));
drop policy if exists categories_read on public.categories;
create policy categories_read on public.categories for select to anon,authenticated using(true);
drop policy if exists variants_read on public.variants;
create policy variants_read on public.variants for select to anon,authenticated using(exists(select 1 from public.products p where p.id=product_id and p.state!='inactive'));
drop policy if exists images_read on public.product_images;
create policy images_read on public.product_images for select to anon,authenticated using(exists(select 1 from public.products p where p.id=product_id and p.state!='inactive'));
drop policy if exists seo_read on public.product_seo;
create policy seo_read on public.product_seo for select to anon,authenticated using(exists(select 1 from public.products p where p.id=product_id and p.state!='inactive'));
drop policy if exists inventory_read on public.inventory;
create policy inventory_read on public.inventory for select to anon,authenticated using(exists(select 1 from public.variants v join public.products p on p.id=v.product_id where v.id=variant_id and p.state!='inactive'));
create or replace view public.catalog_public with(security_invoker=true) as select p.id,
 jsonb_build_object('id',p.id,'sku',p.sku,'name',p.name,'slug',p.slug,'category',p.category_id,'brand',p.brand,'model',p.model,'price',p.price_cop,'previousPrice',p.previous_price_cop,'currency','COP','color',p.color,'state',p.state,'warehouse',p.warehouse_id,'family',p.family,'description',p.description,'benefits',p.benefits,'sizeNote',p.size_note,'material',p.material,'weight',p.weight_g,'featured',p.featured,'rank',p.home_rank,
 'sizes',coalesce((select jsonb_agg(v.size order by v.id) from public.variants v where v.product_id=p.id),'[]'::jsonb),
 'images',coalesce((select jsonb_agg(i.url order by i.sort_order) from public.product_images i where i.product_id=p.id),'[]'::jsonb),
 'stock',(select case when count(*)=0 or count(i.quantity)!=count(*) then null else sum(i.quantity) end from public.variants v left join public.inventory i on i.variant_id=v.id where v.product_id=p.id),
 'seoTitle',coalesce(s.title,p.name||' | Evolución Urbana Store'),'seoDescription',coalesce(s.description,p.description)) as payload
 from public.products p left join public.product_seo s on s.product_id=p.id where p.state in ('active','review');
grant select on public.categories,public.products,public.variants,public.inventory,public.product_images,public.product_seo,public.catalog_public to anon,authenticated;
revoke all on public.promotions,public.user_profiles from anon,authenticated;
create or replace function public.touch_product() returns trigger language plpgsql set search_path=public as $$begin new.updated_at=now();return new;end;$$;
drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products for each row execute function public.touch_product();
commit;
