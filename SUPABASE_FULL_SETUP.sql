-- ==============================================================================
-- SUPABASE FULL DATABASE SETUP (FRESH START)
-- ==============================================================================
-- 
-- INSTRUCTIONS:
-- 1. Go to your Supabase Dashboard (https://supabase.com/dashboard)
-- 2. Open your project and go to "SQL Editor".
-- 3. Click "New Query" and paste ALL the code below.
-- 4. Click "Run".
-- ==============================================================================

-- -------------------------------------------------------------------------
-- STEP 1: CLEANUP (DANGEROUS: Drops everything to start fresh)
-- -------------------------------------------------------------------------
DROP TABLE IF EXISTS public.testimonials CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- -------------------------------------------------------------------------
-- STEP 2: CREATE TABLES
-- -------------------------------------------------------------------------

-- 1. USERS TABLE
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. PRODUCTS TABLE
CREATE TABLE public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    image_url TEXT,
    category TEXT,
    stock_quantity INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ORDERS TABLE
CREATE TABLE public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_address TEXT NOT NULL,
    items JSONB DEFAULT '[]'::jsonb NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    delivery_charge DECIMAL(12,2) DEFAULT 0 NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    payment_method TEXT NOT NULL,
    trx_id TEXT,
    tracking_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TESTIMONIALS TABLE
CREATE TABLE public.testimonials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -------------------------------------------------------------------------
-- STEP 3: ENABLE ROW LEVEL SECURITY (RLS)
-- -------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------------------
-- STEP 4: CREATE RLS POLICIES (CLEAN & NON-RECURSIVE)
-- -------------------------------------------------------------------------

-- USERS POLICIES
CREATE POLICY "Public profiles are visible" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can manage own profile" ON public.users FOR ALL USING (auth.uid() = id);
CREATE POLICY "Admin full access users" ON public.users FOR ALL USING (auth.jwt() ->> 'email' = 'abirmohsin02@gmail.com');

-- PRODUCTS POLICIES
CREATE POLICY "Products are visible to everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Admin can manage products" ON public.products FOR ALL USING (auth.jwt() ->> 'email' = 'abirmohsin02@gmail.com');

-- ORDERS POLICIES
CREATE POLICY "Users can see own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin can manage all orders" ON public.orders FOR ALL USING (auth.jwt() ->> 'email' = 'abirmohsin02@gmail.com');

-- TESTIMONIALS POLICIES
CREATE POLICY "Approved testimonials are visible" ON public.testimonials FOR SELECT USING (is_approved = true OR auth.uid() = user_id);
CREATE POLICY "Users can post testimonials" ON public.testimonials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin manage testimonials" ON public.testimonials FOR ALL USING (auth.jwt() ->> 'email' = 'abirmohsin02@gmail.com');

-- -------------------------------------------------------------------------
-- STEP 5: SAMPLE DATA (OPTIONAL)
-- -------------------------------------------------------------------------
-- Uncomment below if you want some test products
-- INSERT INTO public.products (name, description, price, category, stock_quantity, is_featured) VALUES
-- ('Sample Product 1', 'Authentic handmade item', 1200.00, 'Handmade', 10, true),
-- ('Sample Product 2', 'Traditional wear', 2500.00, 'Clothing', 5, false);

-- ==============================================================================
-- DONE! Your Supabase database is now perfectly set up.
-- ==============================================================================
