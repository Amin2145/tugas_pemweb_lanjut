-- ============================================================
-- CoffeeSync - Supabase PostgreSQL Schema + Seed Data
-- Paste this into Supabase SQL Editor and click "Run"
-- ============================================================

-- Drop existing tables
DROP TABLE IF EXISTS detail_transaksi CASCADE;
DROP TABLE IF EXISTS transaksi CASCADE;
DROP TABLE IF EXISTS detail_pembelian CASCADE;
DROP TABLE IF EXISTS pembelian CASCADE;
DROP TABLE IF EXISTS mutasi_stok CASCADE;
DROP TABLE IF EXISTS stok CASCADE;
DROP TABLE IF EXISTS produk CASCADE;
DROP TABLE IF EXISTS kategori CASCADE;
DROP TABLE IF EXISTS supplier CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS cabang CASCADE;

-- 1. Cabang
CREATE TABLE cabang (
    id SERIAL PRIMARY KEY,
    nama_cabang VARCHAR(100) NOT NULL,
    alamat TEXT,
    telepon VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('owner','admin','kasir')),
    cabang_id INT REFERENCES cabang(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Kategori
CREATE TABLE kategori (
    id SERIAL PRIMARY KEY,
    nama_kategori VARCHAR(100) NOT NULL
);

-- 4. Produk
CREATE TABLE produk (
    id SERIAL PRIMARY KEY,
    kategori_id INT REFERENCES kategori(id) ON DELETE SET NULL,
    nama_produk VARCHAR(100) NOT NULL,
    harga DECIMAL(12,2) NOT NULL DEFAULT 0,
    gambar TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif','nonaktif'))
);

-- 5. Stok
CREATE TABLE stok (
    id SERIAL PRIMARY KEY,
    produk_id INT REFERENCES produk(id) ON DELETE CASCADE,
    cabang_id INT REFERENCES cabang(id) ON DELETE CASCADE,
    jumlah INT NOT NULL DEFAULT 0,
    minimum_stok INT NOT NULL DEFAULT 10,
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(produk_id, cabang_id)
);

-- 6. Supplier
CREATE TABLE supplier (
    id SERIAL PRIMARY KEY,
    nama_supplier VARCHAR(100) NOT NULL,
    telepon VARCHAR(20),
    alamat TEXT
);

-- 7. Pembelian (Purchases from suppliers)
CREATE TABLE pembelian (
    id SERIAL PRIMARY KEY,
    supplier_id INT REFERENCES supplier(id) ON DELETE SET NULL,
    cabang_id INT REFERENCES cabang(id) ON DELETE CASCADE,
    tanggal TIMESTAMP DEFAULT NOW(),
    total DECIMAL(12,2) NOT NULL DEFAULT 0
);

-- 8. Detail Pembelian
CREATE TABLE detail_pembelian (
    id SERIAL PRIMARY KEY,
    pembelian_id INT REFERENCES pembelian(id) ON DELETE CASCADE,
    produk_id INT REFERENCES produk(id) ON DELETE SET NULL,
    qty INT NOT NULL,
    harga DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL
);

-- 9. Transaksi
CREATE TABLE transaksi (
    id SERIAL PRIMARY KEY,
    kasir_id UUID REFERENCES users(id) ON DELETE SET NULL,
    cabang_id INT REFERENCES cabang(id) ON DELETE CASCADE,
    tanggal TIMESTAMP DEFAULT NOW(),
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    metode_bayar VARCHAR(20) NOT NULL DEFAULT 'tunai' CHECK (metode_bayar IN ('tunai','qris','transfer'))
);

-- 10. Detail Transaksi
CREATE TABLE detail_transaksi (
    id SERIAL PRIMARY KEY,
    transaksi_id INT REFERENCES transaksi(id) ON DELETE CASCADE,
    produk_id INT REFERENCES produk(id) ON DELETE SET NULL,
    qty INT NOT NULL,
    harga DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL
);

-- 11. Mutasi Stok
CREATE TABLE mutasi_stok (
    id SERIAL PRIMARY KEY,
    produk_id INT REFERENCES produk(id) ON DELETE CASCADE,
    cabang_asal INT REFERENCES cabang(id) ON DELETE CASCADE,
    cabang_tujuan INT REFERENCES cabang(id) ON DELETE CASCADE,
    qty INT NOT NULL CHECK (qty > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
    tanggal TIMESTAMP DEFAULT NOW()
);

-- Auto-update stok.updated_at trigger
CREATE OR REPLACE FUNCTION update_stok_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_stok_updated
BEFORE UPDATE ON stok
FOR EACH ROW EXECUTE FUNCTION update_stok_timestamp();

-- Enable Realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE transaksi;
ALTER PUBLICATION supabase_realtime ADD TABLE stok;
ALTER PUBLICATION supabase_realtime ADD TABLE mutasi_stok;

-- ============================================================
-- SEED DATA
-- ============================================================

-- Cabang
INSERT INTO cabang (id, nama_cabang, alamat, telepon) VALUES
(1, 'CoffeeSync Bandung', 'Jl. Dago No. 12, Bandung', '081234567890'),
(2, 'CoffeeSync Jakarta', 'Jl. Kemang Raya No. 45, Jakarta Selatan', '081298765432'),
(3, 'CoffeeSync Surabaya', 'Jl. Tunjungan No. 88, Surabaya', '081345678901');
SELECT setval('cabang_id_seq', 3);

-- Kategori
INSERT INTO kategori (id, nama_kategori) VALUES
(1, 'Espresso Based'),
(2, 'Manual Brew'),
(3, 'Non-Coffee'),
(4, 'Pastry'),
(5, 'Snack'),
(6, 'Coffee Beans');
SELECT setval('kategori_id_seq', 6);

-- Produk
INSERT INTO produk (id, kategori_id, nama_produk, harga, status) VALUES
(1,  1, 'Espresso Single',         18000, 'aktif'),
(2,  1, 'Espresso Double',         24000, 'aktif'),
(3,  1, 'Café Latte',              28000, 'aktif'),
(4,  1, 'Cappuccino',              28000, 'aktif'),
(5,  1, 'Iced Americano',          22000, 'aktif'),
(6,  1, 'Flat White',              30000, 'aktif'),
(7,  1, 'Mocha Latte',             32000, 'aktif'),
(8,  2, 'V60 Drip',                35000, 'aktif'),
(9,  2, 'Aeropress',               35000, 'aktif'),
(10, 2, 'Cold Brew 250ml',         28000, 'aktif'),
(11, 3, 'Matcha Latte',            30000, 'aktif'),
(12, 3, 'Chocolate',               28000, 'aktif'),
(13, 3, 'Taro Latte',              28000, 'aktif'),
(14, 4, 'Butter Croissant',        25000, 'aktif'),
(15, 4, 'Chocolate Muffin',        22000, 'aktif'),
(16, 5, 'French Fries',            20000, 'aktif'),
(17, 6, 'Gayo Arabica 250g',       95000, 'aktif'),
(18, 6, 'Toraja Kalosi 250g',     105000, 'aktif');
SELECT setval('produk_id_seq', 18);

-- Supplier
INSERT INTO supplier (id, nama_supplier, telepon, alamat) VALUES
(1, 'PT Kopi Nusantara', '08111222333', 'Jl. Industri No. 5, Bandung'),
(2, 'CV Susu Segar Jaya', '08122334455', 'Jl. Peternakan No. 10, Bogor'),
(3, 'UD Tepung Makmur', '08133445566', 'Jl. Pasar Baru No. 3, Jakarta');
SELECT setval('supplier_id_seq', 3);

-- Users (password = plain text '123456' for testing, in production use Supabase Auth)
INSERT INTO users (id, nama, email, password, role, cabang_id) VALUES
('a0000000-0000-0000-0000-000000000001', 'Budi Santoso', 'owner@coffeesync.id', '123456', 'owner', NULL),
('a0000000-0000-0000-0000-000000000002', 'Andi Wijaya', 'admin.bdg@coffeesync.id', '123456', 'admin', 1),
('a0000000-0000-0000-0000-000000000003', 'Agus Purnomo', 'admin.jkt@coffeesync.id', '123456', 'admin', 2),
('a0000000-0000-0000-0000-000000000004', 'Adit Pratama', 'admin.sby@coffeesync.id', '123456', 'admin', 3),
('a0000000-0000-0000-0000-000000000005', 'Kiki Amelia', 'kasir.bdg@coffeesync.id', '123456', 'kasir', 1),
('a0000000-0000-0000-0000-000000000006', 'Kevin Saputra', 'kasir.jkt@coffeesync.id', '123456', 'kasir', 2),
('a0000000-0000-0000-0000-000000000007', 'Karin Dewi', 'kasir.sby@coffeesync.id', '123456', 'kasir', 3);

-- Stok per cabang
INSERT INTO stok (produk_id, cabang_id, jumlah, minimum_stok) VALUES
-- Bandung
(1,1,50,10),(2,1,40,10),(3,1,35,10),(4,1,8,10),(5,1,45,10),(6,1,20,10),(7,1,30,10),
(8,1,15,5),(9,1,12,5),(10,1,25,10),(11,1,18,10),(12,1,22,10),(13,1,15,10),
(14,1,4,10),(15,1,20,10),(16,1,30,10),(17,1,10,5),(18,1,8,5),
-- Jakarta
(1,2,60,15),(2,2,50,15),(3,2,55,15),(4,2,45,15),(5,2,40,15),(6,2,35,15),(7,2,42,15),
(8,2,20,5),(9,2,18,5),(10,2,30,10),(11,2,25,10),(12,2,35,10),(13,2,20,10),
(14,2,12,10),(15,2,15,10),(16,2,25,10),(17,2,3,5),(18,2,5,5),
-- Surabaya
(1,3,30,10),(2,3,25,10),(3,3,20,10),(4,3,18,10),(5,3,35,10),(6,3,15,10),(7,3,22,10),
(8,3,10,5),(9,3,8,5),(10,3,5,10),(11,3,12,10),(12,3,15,10),(13,3,10,10),
(14,3,6,10),(15,3,7,10),(16,3,20,10),(17,3,12,5),(18,3,9,5);

-- Sample transactions (today & yesterday)
INSERT INTO transaksi (id, kasir_id, cabang_id, tanggal, total, metode_bayar) VALUES
(1, 'a0000000-0000-0000-0000-000000000005', 1, NOW() - INTERVAL '1 hour',  78000,  'tunai'),
(2, 'a0000000-0000-0000-0000-000000000006', 2, NOW() - INTERVAL '2 hours', 117000, 'qris'),
(3, 'a0000000-0000-0000-0000-000000000007', 3, NOW() - INTERVAL '3 hours', 53000,  'tunai'),
(4, 'a0000000-0000-0000-0000-000000000005', 1, NOW() - INTERVAL '25 hours', 120000, 'transfer'),
(5, 'a0000000-0000-0000-0000-000000000006', 2, NOW() - INTERVAL '28 hours', 185000, 'tunai'),
(6, 'a0000000-0000-0000-0000-000000000007', 3, NOW() - INTERVAL '30 hours', 95000,  'qris'),
(7, 'a0000000-0000-0000-0000-000000000005', 1, NOW() - INTERVAL '49 hours', 95000,  'tunai'),
(8, 'a0000000-0000-0000-0000-000000000006', 2, NOW() - INTERVAL '52 hours', 220000, 'transfer');
SELECT setval('transaksi_id_seq', 8);

INSERT INTO detail_transaksi (transaksi_id, produk_id, qty, harga, subtotal) VALUES
(1, 3, 2, 28000, 56000),(1, 15, 1, 22000, 22000),
(2, 17, 1, 95000, 95000),(2, 1, 1, 18000, 18000),(2, 16, 1, 20000, 4000),
(3, 4, 1, 28000, 28000),(3, 14, 1, 25000, 25000),
(4, 3, 3, 28000, 84000),(4, 5, 1, 22000, 22000),(4, 16, 1, 20000, 14000),
(5, 7, 3, 32000, 96000),(5, 11, 2, 30000, 60000),(5, 14, 1, 25000, 29000),
(6, 8, 1, 35000, 35000),(6, 11, 2, 30000, 60000),
(7, 17, 1, 95000, 95000),
(8, 3, 4, 28000, 112000),(8, 11, 3, 30000, 90000),(8, 15, 1, 22000, 18000);

-- Mutasi stok
INSERT INTO mutasi_stok (produk_id, cabang_asal, cabang_tujuan, qty, status, tanggal) VALUES
(17, 1, 2, 5, 'pending',  NOW() - INTERVAL '2 hours'),
(3,  3, 1, 10, 'approved', NOW() - INTERVAL '1 day'),
(11, 2, 3, 8, 'rejected', NOW() - INTERVAL '2 days');
