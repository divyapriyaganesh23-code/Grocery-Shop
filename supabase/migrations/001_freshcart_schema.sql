-- ============================================================================
-- FRESHCART GROCERY SHOP MANAGEMENT SYSTEM
-- PostgreSQL Database Schema & Row-Level Security (RLS) Configuration
-- Supabase Migration: 001_freshcart_schema.sql
-- ============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Enumerations & Custom Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'worker', 'owner');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE worker_status AS ENUM ('available', 'busy', 'on_break', 'offline');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_stage AS ENUM (
        'new_order',
        'confirmed',
        'preparing',
        'packing',
        'packed',
        'out_for_delivery',
        'delivered',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method_type AS ENUM ('cod', 'online_demo');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_type AS ENUM ('pending', 'paid', 'refunded', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE request_status_type AS ENUM (
        'submitted',
        'under_review',
        'approved',
        'rejected',
        'refund_pending',
        'refunded'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE expense_category_type AS ENUM (
        'employee_wages',
        'electricity',
        'rent',
        'transportation',
        'packaging',
        'maintenance',
        'other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 3. PROFILES & USER ACCOUNTS (Role-Based Access Control)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'customer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Employee Profile Extension (Workers & Store Managers)
CREATE TABLE IF NOT EXISTS public.employee_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    employee_code VARCHAR(30) UNIQUE NOT NULL,
    job_title VARCHAR(100) NOT NULL DEFAULT 'Fulfillment Staff',
    status worker_status NOT NULL DEFAULT 'offline',
    is_active BOOLEAN NOT NULL DEFAULT true,
    hired_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Customer Addresses
CREATE TABLE IF NOT EXISTS public.customer_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    address_label VARCHAR(50) DEFAULT 'Home',
    recipient_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    street_address TEXT NOT NULL,
    landmark TEXT,
    city VARCHAR(100) NOT NULL DEFAULT 'Bengaluru',
    postal_code VARCHAR(20) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 4. PRODUCT CATALOG & INVENTORY TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.categories (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(60) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_name VARCHAR(60) DEFAULT 'fa-basket-shopping',
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.products (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES public.categories(id) ON DELETE SET NULL,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(220) UNIQUE NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    original_price NUMERIC(10,2) CHECK (original_price >= price),
    discount_label VARCHAR(50),
    unit VARCHAR(100) NOT NULL DEFAULT '1 kg',
    rating NUMERIC(3,2) DEFAULT 4.5,
    reviews_count INT DEFAULT 0,
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    low_stock_threshold INT NOT NULL DEFAULT 5 CHECK (low_stock_threshold >= 0),
    cost_price NUMERIC(10,2) NOT NULL DEFAULT 0.00, -- Real purchase cost for COGS calculation
    image_url TEXT,
    local_image_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_popular BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Stock Movement Audit Log
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id INT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    movement_type VARCHAR(50) NOT NULL, -- 'purchase', 'order_deduction', 'order_cancellation_restore', 'manual_adjustment', 'damage'
    quantity_changed INT NOT NULL,
    stock_after INT NOT NULL,
    reference_id VARCHAR(100), -- Order ID or Purchase ID
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 5. WISHLIST & CART TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.wishlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(customer_id, product_id)
);

CREATE TABLE IF NOT EXISTS public.carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(cart_id, product_id)
);

-- ============================================================================
-- 6. DELIVERY SLOTS & CAPACITY
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.delivery_slots (
    id SERIAL PRIMARY KEY,
    slot_label VARCHAR(80) NOT NULL, -- e.g., '07:00 AM - 09:00 AM', '10:00 AM - 12:00 PM'
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_orders_per_slot INT NOT NULL DEFAULT 15,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- ============================================================================
-- 7. ORDERS & WORKFLOW TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.orders (
    id VARCHAR(50) PRIMARY KEY, -- e.g., 'FC-2026-1001'
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    delivery_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    cgst NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    sgst NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    payment_method payment_method_type NOT NULL DEFAULT 'cod',
    payment_status payment_status_type NOT NULL DEFAULT 'pending',
    status order_stage NOT NULL DEFAULT 'new_order',
    
    -- Delivery Details
    recipient_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    delivery_address TEXT NOT NULL,
    landmark TEXT,
    delivery_date DATE NOT NULL,
    delivery_slot_id INT REFERENCES public.delivery_slots(id) ON DELETE SET NULL,
    delivery_slot_text VARCHAR(100),
    special_instructions TEXT,
    
    -- Workflow & Time Management
    estimated_prep_minutes INT DEFAULT 45,
    packing_deadline TIMESTAMPTZ,
    assigned_worker_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    
    -- Verification
    delivered_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(50) NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    product_name VARCHAR(200) NOT NULL,
    unit VARCHAR(100) NOT NULL,
    unit_price NUMERIC(10,2) NOT NULL,
    cost_price NUMERIC(10,2) NOT NULL DEFAULT 0.00, -- captured at order time for COGS
    quantity INT NOT NULL CHECK (quantity > 0),
    total_price NUMERIC(10,2) NOT NULL,
    is_packed BOOLEAN NOT NULL DEFAULT false,
    packed_at TIMESTAMPTZ,
    worker_notes TEXT
);

-- Delivery OTP Verification (Securely Server-Side Managed)
CREATE TABLE IF NOT EXISTS public.delivery_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id VARCHAR(50) UNIQUE NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    otp_hash TEXT NOT NULL, -- SHA-256 hash of 6-digit OTP
    otp_plain_demo VARCHAR(10), -- Exclusively displayed in Demo Mode to customer
    attempts INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 5,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    verified_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (timezone('utc'::text, now()) + INTERVAL '24 hours'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 8. RETURNS & CANCELLATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.return_requests (
    id VARCHAR(50) PRIMARY KEY, -- e.g., 'RET-2026-001'
    order_id VARCHAR(50) NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    request_type VARCHAR(20) NOT NULL CHECK (request_type IN ('return', 'cancellation')),
    reason VARCHAR(255) NOT NULL,
    details TEXT,
    image_url TEXT,
    status request_status_type NOT NULL DEFAULT 'submitted',
    refund_amount NUMERIC(10,2) DEFAULT 0.00,
    owner_notes TEXT,
    resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 9. SUPPLIERS, PURCHASES & EXPENSES (Owner Business Intelligence)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.suppliers (
    id SERIAL PRIMARY KEY,
    supplier_code VARCHAR(40) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    address TEXT,
    categories_supplied TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.purchases (
    id VARCHAR(50) PRIMARY KEY, -- e.g., 'PO-2026-01'
    supplier_id INT NOT NULL REFERENCES public.suppliers(id) ON DELETE RESTRICT,
    invoice_number VARCHAR(100),
    purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    payment_status VARCHAR(50) DEFAULT 'paid',
    notes TEXT,
    received_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.purchase_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_id VARCHAR(50) NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    cost_price NUMERIC(10,2) NOT NULL CHECK (cost_price >= 0),
    total_cost NUMERIC(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category expense_category_type NOT NULL,
    title VARCHAR(150) NOT NULL,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 10. ATTENDANCE MANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    work_date DATE NOT NULL DEFAULT CURRENT_DATE,
    check_in TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    check_out TIMESTAMPTZ,
    working_hours NUMERIC(4,2),
    status VARCHAR(50) NOT NULL DEFAULT 'present', -- 'present', 'late', 'half_day', 'absent'
    notes TEXT,
    UNIQUE(worker_id, work_date)
);

-- ============================================================================
-- 11. NOTIFICATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info', -- 'order', 'stock', 'system', 'return'
    is_read BOOLEAN NOT NULL DEFAULT false,
    link_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS across all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper security functions
CREATE OR REPLACE FUNCTION public.get_current_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_worker()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('worker', 'owner')
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Profiles: Public can read basic store profiles, users manage own profile, owners view all
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.is_owner());

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Owners can manage all profiles" ON public.profiles
    FOR ALL USING (public.is_owner());

-- Products & Categories: Public can read active items
CREATE POLICY "Public can view active categories" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Owners can manage categories" ON public.categories
    FOR ALL USING (public.is_owner());

CREATE POLICY "Public can view active products" ON public.products
    FOR SELECT USING (is_active = true OR public.is_owner());

CREATE POLICY "Owners can manage products" ON public.products
    FOR ALL USING (public.is_owner());

-- Wishlist: Customer isolation
CREATE POLICY "Customers manage own wishlist" ON public.wishlist_items
    FOR ALL USING (auth.uid() = customer_id);

-- Carts & Items: Customer isolation
CREATE POLICY "Customers manage own carts" ON public.carts
    FOR ALL USING (auth.uid() = customer_id);

CREATE POLICY "Customers manage own cart items" ON public.cart_items
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.carts WHERE carts.id = cart_items.cart_id AND carts.customer_id = auth.uid())
    );

-- Orders: Customers view own orders, Workers view assigned orders, Owners view all
CREATE POLICY "Customers can view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = customer_id OR public.is_owner() OR auth.uid() = assigned_worker_id);

CREATE POLICY "Customers can insert own orders" ON public.orders
    FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Workers can update assigned orders" ON public.orders
    FOR UPDATE USING (auth.uid() = assigned_worker_id OR public.is_owner());

CREATE POLICY "Owners can manage all orders" ON public.orders
    FOR ALL USING (public.is_owner());

-- Order Items
CREATE POLICY "Order items access" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id 
            AND (orders.customer_id = auth.uid() OR orders.assigned_worker_id = auth.uid() OR public.is_owner())
        )
    );

CREATE POLICY "Workers and owners can update packing status" ON public.order_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = order_items.order_id 
            AND (orders.assigned_worker_id = auth.uid() OR public.is_owner())
        )
    );

-- OTP Verifications: High Security
CREATE POLICY "Customer can view own demo OTP" ON public.delivery_verifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders 
            WHERE orders.id = delivery_verifications.order_id 
            AND orders.customer_id = auth.uid()
        )
    );

CREATE POLICY "Owners can view all OTP records" ON public.delivery_verifications
    FOR ALL USING (public.is_owner());

-- Financials & Management: Strictly Owner Only
CREATE POLICY "Owner only suppliers" ON public.suppliers FOR ALL USING (public.is_owner());
CREATE POLICY "Owner only purchases" ON public.purchases FOR ALL USING (public.is_owner());
CREATE POLICY "Owner only purchase items" ON public.purchase_items FOR ALL USING (public.is_owner());
CREATE POLICY "Owner only expenses" ON public.expenses FOR ALL USING (public.is_owner());
CREATE POLICY "Owner only stock movements" ON public.stock_movements FOR ALL USING (public.is_owner());

-- Attendance: Workers view & insert own, Owners view all
CREATE POLICY "Workers can view & manage own attendance" ON public.attendance
    FOR ALL USING (auth.uid() = worker_id OR public.is_owner());

-- Notifications
CREATE POLICY "Users read own notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- 13. SEED DATA (Delivery Slots, Demo Categories & Initial Configuration)
-- ============================================================================

INSERT INTO public.delivery_slots (slot_label, start_time, end_time, max_orders_per_slot)
VALUES
    ('Morning Slot (07:00 AM - 09:00 AM)', '07:00:00', '09:00:00', 20),
    ('Mid-Morning (09:00 AM - 11:00 AM)', '09:00:00', '11:00:00', 25),
    ('Afternoon (01:00 PM - 03:00 PM)', '13:00:00', '15:00:00', 20),
    ('Evening Slot (04:00 PM - 06:00 PM)', '16:00:00', '18:00:00', 30),
    ('Night Express (07:00 PM - 09:00 PM)', '19:00:00', '21:00:00', 25)
ON CONFLICT DO NOTHING;

INSERT INTO public.categories (slug, name, description, icon_name, display_order)
VALUES
    ('fruits', 'Fruits', 'Fresh seasonal orchard fruits and organic berries', 'fa-apple-whole', 1),
    ('vegetables', 'Vegetables', 'Farm-fresh leafy greens and root vegetables', 'fa-carrot', 2),
    ('dairy', 'Dairy Products', 'Farm milk, artisanal cheeses, butter & yogurt', 'fa-cow', 3),
    ('bakery', 'Bakery Items', 'Artisanal breads, sourdough, buns & croissants', 'fa-bread-slice', 4),
    ('snacks', 'Snacks', 'Crispy healthy chips, dry fruits, cookies & granola', 'fa-cookie-bite', 5),
    ('beverages', 'Beverages', 'Cold pressed juices, organic tea & roasted coffee', 'fa-mug-hot', 6),
    ('grains', 'Rice and Grains', 'Traditional basmati, millets, pulses and oats', 'fa-wheat-awn', 7),
    ('spices', 'Spices', 'Handmade whole and ground Indian spices & herbs', 'fa-pepper-hot', 8),
    ('personal', 'Personal Care', 'Natural personal hygiene, soaps, oral care & oils', 'fa-pump-soap', 9),
    ('household', 'Household Essentials', 'Eco-friendly detergents and surface cleaners', 'fa-broom', 10),
    ('frozen', 'Frozen Foods', 'IQF fresh garden peas, frozen sweet corn & berries', 'fa-snowflake', 11)
ON CONFLICT DO NOTHING;
