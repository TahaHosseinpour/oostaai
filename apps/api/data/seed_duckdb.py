"""
Seed script: creates readonly.duckdb with realistic test data for Oosta chatbot.
Run: python seed_duckdb.py
"""
import duckdb
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "readonly.duckdb")

if os.path.exists(DB_PATH):
    os.remove(DB_PATH)

db = duckdb.connect(DB_PATH)

# ─── Geography ───────────────────────────────────────────────────────────────

db.execute("""
CREATE TABLE province (
    id BIGINT PRIMARY KEY,
    name VARCHAR(100)
)
""")
db.executemany("INSERT INTO province VALUES (?, ?)", [
    (1,  "تهران"),
    (2,  "اصفهان"),
    (3,  "فارس"),
    (4,  "خراسان رضوی"),
    (5,  "آذربایجان شرقی"),
    (6,  "مازندران"),
    (7,  "گیلان"),
    (8,  "البرز"),
])

db.execute("""
CREATE TABLE city (
    id BIGINT PRIMARY KEY,
    province_id BIGINT,
    name VARCHAR(100)
)
""")
db.executemany("INSERT INTO city VALUES (?, ?, ?)", [
    (1,  1, "تهران"),
    (2,  1, "شهریار"),
    (3,  1, "ری"),
    (4,  2, "اصفهان"),
    (5,  2, "کاشان"),
    (6,  3, "شیراز"),
    (7,  3, "مرودشت"),
    (8,  4, "مشهد"),
    (9,  4, "نیشابور"),
    (10, 5, "تبریز"),
    (11, 6, "ساری"),
    (12, 7, "رشت"),
    (13, 8, "کرج"),
])

# ─── Skills ──────────────────────────────────────────────────────────────────

db.execute("""
CREATE TABLE skill (
    id BIGINT PRIMARY KEY,
    name VARCHAR
)
""")
db.executemany("INSERT INTO skill VALUES (?, ?)", [
    (1, "برق‌کشی"),
    (2, "لوله‌کشی"),
    (3, "نقاشی ساختمان"),
    (4, "کاشی‌کاری"),
    (5, "جوشکاری"),
    (6, "نجاری"),
    (7, "سرامیک‌کاری"),
    (8, "گچ‌کاری"),
    (9, "نصب کولر"),
    (10, "تعمیر لوازم خانگی"),
])

# ─── OstadKar (skilled workers) ──────────────────────────────────────────────

db.execute("""
CREATE TABLE ostadkar (
    id BIGINT PRIMARY KEY,
    first_name VARCHAR(100),
    last_name  VARCHAR(100),
    age        INTEGER,
    experience_years INTEGER,
    city_id    BIGINT,
    is_verified INTEGER,
    commission  DECIMAL(5,2),
    created_at  TIMESTAMP
)
""")
db.executemany("INSERT INTO ostadkar VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [
    (1,  "علی",     "رضایی",     35, 10, 1,  1, 15.00, "2023-01-10 09:00:00"),
    (2,  "محمد",    "کریمی",     28, 5,  4,  1, 12.00, "2023-03-15 10:30:00"),
    (3,  "حسن",     "محمدی",     42, 18, 8,  1, 10.00, "2022-11-20 08:00:00"),
    (4,  "رضا",     "احمدی",     31, 7,  1,  1, 13.50, "2023-05-05 11:00:00"),
    (5,  "مجید",    "حسینی",     26, 3,  10, 0, 12.00, "2024-01-08 14:00:00"),
    (6,  "سعید",    "نوری",      50, 25, 6,  1, 10.00, "2022-06-01 09:00:00"),
    (7,  "امیر",    "صادقی",     38, 12, 13, 1, 14.00, "2023-02-20 10:00:00"),
    (8,  "فرهاد",   "علیزاده",   29, 4,  1,  2, 12.00, "2024-03-12 15:00:00"),
    (9,  "کامران",  "ملکی",      45, 20, 4,  1, 11.00, "2022-09-15 08:30:00"),
    (10, "داریوش",  "پورمحمدی", 33, 8,  8,  1, 13.00, "2023-07-22 12:00:00"),
])

db.execute("""
CREATE TABLE ostadkar_skill (
    ostadkar_id BIGINT,
    skill_id    BIGINT
)
""")
db.executemany("INSERT INTO ostadkar_skill VALUES (?, ?)", [
    (1, 1), (1, 9),
    (2, 2), (2, 4),
    (3, 3), (3, 8),
    (4, 5), (4, 6),
    (5, 1), (5, 7),
    (6, 2), (6, 4), (6, 7),
    (7, 6), (7, 8),
    (8, 10),
    (9, 3), (9, 8),
    (10, 5), (10, 6),
])

# ─── Sellers ─────────────────────────────────────────────────────────────────

db.execute("""
CREATE TABLE gold_seller (
    id           BIGINT PRIMARY KEY,
    role         VARCHAR,
    shop_name    VARCHAR(191),
    company_name VARCHAR(191),
    province_id  BIGINT,
    city_id      BIGINT,
    is_verified  INTEGER,
    commission   DECIMAL(5,2)
)
""")
db.executemany("INSERT INTO gold_seller VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [
    (1,  "seller",       "طلا و جواهر پارسیان",    "شرکت پارسیان طلا",         1,  1,  1, 8.00),
    (2,  "seller",       "فروشگاه نقره آریا",       "آریا نقره",                 1,  1,  1, 7.50),
    (3,  "seller",       "جواهرات اصفهان",          "صنایع طلای اصفهان",         2,  4,  1, 9.00),
    (4,  "seller",       "طلای مشهد",               "طلای خراسان",               4,  8,  1, 8.50),
    (5,  "seller",       "فروشگاه تبریز گلد",       "تبریز گلد",                 5,  10, 1, 7.00),
    (6,  "distribution", "توزیع مرکزی اوستا",       "اوستا توزیع",               1,  1,  1, 5.00),
    (7,  "seller",       "جواهری کرج",              "کرج جیولری",                8,  13, 1, 8.00),
    (8,  "seller",       "طلا شیراز",               "شیراز طلا و جواهر",         3,  6,  1, 9.00),
    (9,  "seller",       "نقره گیلان",              "گیلان سیلور",               7,  12, 0, 7.50),
    (10, "support",      "پشتیبانی مرکزی",          "اوستا سرویس",               1,  1,  1, 0.00),
])

# ─── Shop categories ─────────────────────────────────────────────────────────

db.execute("""
CREATE TABLE shop_category (
    id        BIGINT PRIMARY KEY,
    parent_id BIGINT,
    name      VARCHAR(255)
)
""")
db.executemany("INSERT INTO shop_category VALUES (?, ?, ?)", [
    (1,  None, "طلا"),
    (2,  None, "نقره"),
    (3,  None, "جواهرات"),
    (4,  1,    "انگشتر طلا"),
    (5,  1,    "گردنبند طلا"),
    (6,  1,    "دستبند طلا"),
    (7,  1,    "گوشواره طلا"),
    (8,  2,    "انگشتر نقره"),
    (9,  2,    "دستبند نقره"),
    (10, 3,    "انگشتر جواهر"),
    (11, 3,    "گردنبند جواهر"),
])

db.execute("CREATE TABLE brand (id BIGINT PRIMARY KEY, name VARCHAR)")
db.executemany("INSERT INTO brand VALUES (?, ?)", [
    (1, "گلستان"),
    (2, "آریانا"),
    (3, "پارسیان"),
    (4, "الماس"),
    (5, "زرین"),
])

db.execute("CREATE TABLE collection (id BIGINT PRIMARY KEY, name VARCHAR)")
db.executemany("INSERT INTO collection VALUES (?, ?)", [
    (1, "کلکسیون بهار ۱۴۰۳"),
    (2, "کلکسیون کلاسیک"),
    (3, "کلکسیون مدرن"),
    (4, "کلکسیون عروسی"),
])

db.execute("CREATE TABLE variety (id BIGINT PRIMARY KEY, name VARCHAR)")
db.executemany("INSERT INTO variety VALUES (?, ?)", [
    (1, "عیار"),
    (2, "رنگ"),
])

db.execute("""
CREATE TABLE variety_detail (
    id        BIGINT PRIMARY KEY,
    variety_id BIGINT,
    name      VARCHAR
)
""")
db.executemany("INSERT INTO variety_detail VALUES (?, ?, ?)", [
    (1, 1, "۱۸ عیار"),
    (2, 1, "۲۱ عیار"),
    (3, 1, "۲۴ عیار"),
    (4, 2, "زرد"),
    (5, 2, "سفید"),
    (6, 2, "رزگلد"),
])

# ─── Products ────────────────────────────────────────────────────────────────

db.execute("""
CREATE TABLE product (
    id            BIGINT PRIMARY KEY,
    seller_id     BIGINT,
    name          VARCHAR(255),
    code          VARCHAR(255),
    category_id   BIGINT,
    collection_id BIGINT,
    brand_id      BIGINT,
    variety_id    BIGINT,
    special       INTEGER,
    bestseller    INTEGER,
    featured      INTEGER,
    active        INTEGER,
    status        INTEGER,
    created_at    TIMESTAMP
)
""")
db.executemany("INSERT INTO product VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [
    (1,  1, "انگشتر طلا مدل گل رز",       "RNG-001", 4,  1, 1, 1, 1, 1, 1, 1, 1, "2024-01-15 10:00:00"),
    (2,  1, "گردنبند طلا زنجیر فیگارو",   "NCK-001", 5,  2, 1, 1, 0, 1, 0, 1, 1, "2024-01-20 11:00:00"),
    (3,  2, "دستبند نقره بافت",            "BRC-001", 9,  2, 2, 2, 0, 0, 1, 1, 1, "2024-02-05 09:00:00"),
    (4,  3, "انگشتر جواهر الماس",          "RNG-002", 10, 4, 4, 1, 1, 0, 1, 1, 1, "2024-02-10 14:00:00"),
    (5,  3, "گوشواره طلا آویز",            "ERR-001", 7,  1, 3, 1, 0, 1, 0, 1, 1, "2024-03-01 10:30:00"),
    (6,  4, "انگشتر طلا مردانه",           "RNG-003", 4,  2, 5, 1, 0, 0, 0, 1, 1, "2024-03-15 08:00:00"),
    (7,  4, "گردنبند جواهر یاقوت",         "NCK-002", 11, 4, 4, 1, 1, 1, 1, 1, 1, "2024-04-01 11:00:00"),
    (8,  5, "دستبند طلا زنانه",            "BRC-002", 6,  3, 2, 1, 0, 1, 1, 1, 1, "2024-04-10 12:00:00"),
    (9,  1, "انگشتر نقره فیروزه",          "RNG-004", 8,  2, 2, 2, 0, 0, 0, 0, 0, "2024-04-20 09:00:00"),
    (10, 2, "گوشواره نقره گوی",            "ERR-002", 7,  3, 2, 2, 0, 1, 0, 1, 1, "2024-05-01 10:00:00"),
    (11, 6, "انگشتر طلا کلاسیک",           "RNG-005", 4,  2, 1, 1, 0, 0, 1, 1, 1, "2024-05-10 14:00:00"),
    (12, 7, "گردنبند طلا قلب",             "NCK-003", 5,  1, 3, 1, 1, 1, 0, 1, 1, "2024-05-20 11:00:00"),
    (13, 8, "انگشتر جواهر زمرد",           "RNG-006", 10, 4, 4, 1, 1, 0, 1, 1, 1, "2024-06-01 09:00:00"),
    (14, 2, "دستبند طلا ظریف",             "BRC-003", 6,  3, 1, 1, 0, 1, 1, 1, 1, "2024-06-15 10:00:00"),
    (15, 3, "گوشواره طلا گوی",             "ERR-003", 7,  2, 3, 1, 0, 0, 0, 1, 2, "2024-07-01 08:00:00"),
])

db.execute("""
CREATE TABLE product_variety (
    id               BIGINT PRIMARY KEY,
    product_id       BIGINT,
    variety_detail_id BIGINT,
    discount_percent  DECIMAL(4,2),
    stock            INTEGER,
    extra_price      BIGINT,
    max_order        INTEGER,
    min_order        INTEGER
)
""")
db.executemany("INSERT INTO product_variety VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [
    (1,  1,  1, 5.00,  12, 12500000,  5, 1),
    (2,  1,  2, 0.00,  8,  14800000,  5, 1),
    (3,  2,  1, 10.00, 20, 8900000,   3, 1),
    (4,  2,  4, 0.00,  15, 9200000,   3, 1),
    (5,  3,  4, 0.00,  30, 2100000,   10, 1),
    (6,  3,  5, 5.00,  25, 2300000,   10, 1),
    (7,  4,  1, 0.00,  5,  85000000,  2, 1),
    (8,  5,  1, 8.00,  18, 6700000,   5, 1),
    (9,  5,  5, 0.00,  10, 7100000,   5, 1),
    (10, 6,  2, 0.00,  7,  18500000,  3, 1),
    (11, 7,  1, 0.00,  3,  125000000, 2, 1),
    (12, 8,  1, 5.00,  22, 11200000,  5, 1),
    (13, 8,  6, 0.00,  14, 12800000,  5, 1),
    (14, 10, 4, 0.00,  40, 1800000,   10, 1),
    (15, 11, 1, 0.00,  9,  13500000,  5, 1),
    (16, 12, 1, 15.00, 16, 9800000,   5, 1),
    (17, 13, 1, 0.00,  4,  95000000,  2, 1),
    (18, 14, 1, 5.00,  28, 7600000,   5, 1),
])

# ─── Orders ──────────────────────────────────────────────────────────────────

db.execute("""
CREATE TABLE "order" (
    id          BIGINT PRIMARY KEY,
    status      VARCHAR,
    pay_type    VARCHAR,
    total_price BIGINT,
    city        VARCHAR(15),
    created_at  TIMESTAMP
)
""")
db.executemany('INSERT INTO "order" VALUES (?, ?, ?, ?, ?, ?)', [
    (1,  "1", "0", 12500000,  "تهران",   "2024-03-10 11:00:00"),
    (2,  "1", "1", 8900000,   "اصفهان",  "2024-03-15 14:30:00"),
    (3,  "1", "0", 27400000,  "تهران",   "2024-03-20 09:00:00"),
    (4,  "1", "0", 85000000,  "مشهد",    "2024-04-02 10:00:00"),
    (5,  "1", "1", 6700000,   "تهران",   "2024-04-08 15:00:00"),
    (6,  "0", "0", 14800000,  "شیراز",   "2024-04-12 12:00:00"),
    (7,  "1", "0", 125000000, "تهران",   "2024-04-18 11:00:00"),
    (8,  "1", "1", 11200000,  "کرج",     "2024-04-25 09:30:00"),
    (9,  "1", "0", 18500000,  "تبریز",   "2024-05-03 13:00:00"),
    (10, "1", "0", 9800000,   "تهران",   "2024-05-10 10:00:00"),
    (11, "1", "1", 7600000,   "مشهد",    "2024-05-18 14:00:00"),
    (12, "0", "0", 95000000,  "اصفهان",  "2024-05-22 09:00:00"),
    (13, "1", "0", 13500000,  "تهران",   "2024-06-01 11:30:00"),
    (14, "1", "1", 2100000,   "رشت",     "2024-06-10 16:00:00"),
    (15, "1", "0", 38700000,  "تهران",   "2024-06-20 10:00:00"),
    (16, "1", "0", 12800000,  "کرج",     "2024-07-05 09:00:00"),
    (17, "1", "1", 9200000,   "تهران",   "2024-07-12 14:30:00"),
    (18, "0", "0", 6700000,   "ساری",    "2024-07-18 11:00:00"),
    (19, "1", "0", 85000000,  "تهران",   "2024-07-25 10:00:00"),
    (20, "1", "0", 24300000,  "اصفهان",  "2024-08-02 09:30:00"),
])

db.execute("""
CREATE TABLE order_item (
    id                BIGINT PRIMARY KEY,
    order_id          BIGINT,
    product_variety_id BIGINT,
    seller_id         BIGINT,
    quantity          INTEGER,
    price             BIGINT,
    status            VARCHAR
)
""")
db.executemany("INSERT INTO order_item VALUES (?, ?, ?, ?, ?, ?, ?)", [
    (1,  1,  1,  1, 1, 12500000,  "delivered"),
    (2,  2,  3,  1, 1, 8900000,   "delivered"),
    (3,  3,  7,  3, 1, 85000000,  "delivered"),
    (4,  3,  5,  2, 1, 2100000,   "delivered"),
    (5,  4,  7,  3, 1, 85000000,  "delivered"),
    (6,  5,  8,  3, 1, 6700000,   "delivered"),
    (7,  7,  11, 4, 1, 125000000, "delivered"),
    (8,  8,  12, 5, 1, 11200000,  "delivered"),
    (9,  9,  10, 5, 1, 18500000,  "delivered"),
    (10, 10, 16, 7, 1, 9800000,   "delivered"),
    (11, 11, 18, 8, 1, 7600000,   "delivered"),
    (12, 13, 15, 6, 1, 13500000,  "delivered"),
    (13, 14, 14, 2, 1, 2100000,   "delivered"),
    (14, 15, 1,  1, 1, 12500000,  "delivered"),
    (15, 15, 8,  3, 2, 6700000,   "delivered"),
    (16, 16, 13, 5, 1, 12800000,  "delivered"),
    (17, 17, 4,  1, 1, 9200000,   "delivered"),
    (18, 19, 7,  3, 1, 85000000,  "processing"),
    (19, 20, 12, 5, 1, 11200000,  "delivered"),
    (20, 20, 16, 7, 1, 9800000,   "delivered"),
])

db.execute("""
CREATE TABLE order_shipping (
    id             BIGINT PRIMARY KEY,
    order_id       BIGINT,
    seller_id      BIGINT,
    shipping_price INTEGER
)
""")
db.executemany("INSERT INTO order_shipping VALUES (?, ?, ?, ?)", [
    (1,  1,  1, 50000),
    (2,  2,  1, 45000),
    (3,  3,  3, 60000),
    (4,  4,  3, 55000),
    (5,  5,  1, 50000),
    (6,  7,  4, 65000),
    (7,  8,  5, 50000),
    (8,  9,  5, 55000),
    (9,  10, 7, 50000),
    (10, 11, 8, 50000),
])

# ─── Clubs & Subscriptions ───────────────────────────────────────────────────

db.execute("""
CREATE TABLE club_category (
    id        BIGINT PRIMARY KEY,
    parent_id BIGINT,
    name      VARCHAR(255)
)
""")
db.executemany("INSERT INTO club_category VALUES (?, ?, ?)", [
    (1, None, "طلا و جواهر"),
    (2, None, "صنایع دستی"),
    (3, None, "پوشاک"),
    (4, 1,    "طلافروشی"),
    (5, 1,    "جواهرفروشی"),
    (6, 1,    "نقره‌فروشی"),
    (7, 2,    "صنایع دستی سنتی"),
    (8, 2,    "سفالگری"),
])

db.execute("""
CREATE TABLE club (
    id          BIGINT PRIMARY KEY,
    name        VARCHAR(100),
    slug        VARCHAR,
    category_id BIGINT,
    province    VARCHAR(50),
    city        VARCHAR(50),
    status      VARCHAR,
    created_at  TIMESTAMP
)
""")
db.executemany("INSERT INTO club VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [
    (1,  "طلافروشی پارسیان",       "parsian-gold",      4, "تهران",          "تهران",    "approved",  "2023-06-01 10:00:00"),
    (2,  "جواهرات آریانا",          "ariana-jewel",      5, "تهران",          "تهران",    "approved",  "2023-07-15 11:00:00"),
    (3,  "نقره‌فروشی اصفهان",       "isfahan-silver",    6, "اصفهان",         "اصفهان",   "approved",  "2023-08-20 09:00:00"),
    (4,  "طلای مشهد",               "mashhad-gold",      4, "خراسان رضوی",   "مشهد",     "approved",  "2023-09-10 10:00:00"),
    (5,  "جواهری تبریز",            "tabriz-jewel",      5, "آذربایجان شرقی","تبریز",    "approved",  "2023-10-05 14:00:00"),
    (6,  "صنایع دستی گیلان",        "gilan-craft",       7, "گیلان",          "رشت",      "approved",  "2023-11-15 09:00:00"),
    (7,  "طلافروشی کرج",            "karaj-gold",        4, "البرز",          "کرج",      "approved",  "2024-01-10 10:00:00"),
    (8,  "نقره شیراز",              "shiraz-silver",     6, "فارس",           "شیراز",    "approved",  "2024-02-01 11:00:00"),
    (9,  "سفالگری ری",              "rey-pottery",       8, "تهران",          "ری",       "pending",   "2024-03-20 09:00:00"),
    (10, "طلای ساری",               "sari-gold",         4, "مازندران",       "ساری",     "approved",  "2024-04-05 10:00:00"),
    (11, "جواهرات لوکس تهران",      "tehran-luxury",     5, "تهران",          "تهران",    "approved",  "2024-04-20 14:00:00"),
    (12, "نقره‌کاری سنتی کاشان",    "kashan-silver",     6, "اصفهان",         "کاشان",    "suspended", "2024-05-01 09:00:00"),
    (13, "طلافروشی نیشابور",        "neyshabur-gold",    4, "خراسان رضوی",   "نیشابور",  "approved",  "2024-05-15 10:00:00"),
    (14, "جواهری مرودشت",           "marvdasht-jewel",   5, "فارس",           "مرودشت",   "rejected",  "2024-06-01 11:00:00"),
    (15, "صنایع دستی تبریز",        "tabriz-craft",      7, "آذربایجان شرقی","تبریز",    "approved",  "2024-06-20 09:00:00"),
])

db.execute("""
CREATE TABLE subscription_level (
    id                 INTEGER PRIMARY KEY,
    name               VARCHAR(100),
    level_type         VARCHAR,
    max_gallery_images INTEGER,
    max_videos         INTEGER,
    max_products       INTEGER,
    can_be_featured    BOOLEAN,
    analytics_access   BOOLEAN,
    is_active          BOOLEAN
)
""")
db.executemany("INSERT INTO subscription_level VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [
    (1, "برنزی",  "level_1", 5,  1,  20,  False, False, True),
    (2, "نقره‌ای", "level_2", 15, 3,  100, True,  True,  True),
    (3, "طلایی",  "level_3", 50, 10, 500, True,  True,  True),
])

db.execute("""
CREATE TABLE subscription_plan (
    id           INTEGER PRIMARY KEY,
    level_id     INTEGER,
    name         VARCHAR,
    price        DECIMAL(12,0),
    duration_days INTEGER
)
""")
db.executemany("INSERT INTO subscription_plan VALUES (?, ?, ?, ?, ?)", [
    (1, 1, "برنزی ماهانه",    490000,   30),
    (2, 1, "برنزی سالانه",    4500000,  365),
    (3, 2, "نقره‌ای ماهانه",  990000,   30),
    (4, 2, "نقره‌ای سالانه",  9500000,  365),
    (5, 3, "طلایی ماهانه",    1990000,  30),
    (6, 3, "طلایی سالانه",    19000000, 365),
])

db.execute("""
CREATE TABLE club_subscription (
    id           INTEGER PRIMARY KEY,
    club_id      BIGINT,
    plan_id      INTEGER,
    start_date   TIMESTAMP,
    end_date     TIMESTAMP,
    paid_amount  DECIMAL(12,0),
    status       VARCHAR,
    auto_renewal BOOLEAN
)
""")
db.executemany("INSERT INTO club_subscription VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [
    (1,  1,  6, "2024-01-01", "2025-01-01", 19000000, "active",    True),
    (2,  2,  4, "2024-01-15", "2025-01-15", 9500000,  "active",    True),
    (3,  3,  3, "2024-02-01", "2024-03-01", 990000,   "expired",   False),
    (4,  3,  3, "2024-03-01", "2024-04-01", 990000,   "expired",   False),
    (5,  3,  4, "2024-04-01", "2025-04-01", 9500000,  "active",    True),
    (6,  4,  5, "2024-03-10", "2024-04-10", 1990000,  "expired",   False),
    (7,  4,  6, "2024-04-10", "2025-04-10", 19000000, "active",    True),
    (8,  5,  2, "2024-04-05", "2025-04-05", 4500000,  "active",    False),
    (9,  6,  1, "2024-05-01", "2024-06-01", 490000,   "expired",   False),
    (10, 7,  4, "2024-05-20", "2025-05-20", 9500000,  "active",    True),
    (11, 8,  3, "2024-06-01", "2024-07-01", 990000,   "expired",   False),
    (12, 10, 6, "2024-07-01", "2025-07-01", 19000000, "active",    True),
    (13, 11, 6, "2024-07-15", "2025-07-15", 19000000, "active",    True),
    (14, 13, 3, "2024-08-01", "2024-09-01", 990000,   "active",    False),
    (15, 15, 2, "2024-08-10", "2025-08-10", 4500000,  "active",    True),
])

# ─── Articles ────────────────────────────────────────────────────────────────

db.execute("CREATE TABLE article_category (id BIGINT PRIMARY KEY, name VARCHAR)")
db.executemany("INSERT INTO article_category VALUES (?, ?)", [
    (1, "آموزش خرید طلا"),
    (2, "نگهداری جواهرات"),
    (3, "بازار طلا"),
    (4, "معرفی محصول"),
])

db.execute("CREATE TABLE article_tag (id BIGINT PRIMARY KEY, name VARCHAR)")
db.executemany("INSERT INTO article_tag VALUES (?, ?)", [
    (1, "طلا"),
    (2, "نقره"),
    (3, "جواهر"),
    (4, "سرمایه‌گذاری"),
    (5, "مراقبت"),
    (6, "خرید آنلاین"),
])

db.execute("""
CREATE TABLE article (
    id           BIGINT PRIMARY KEY,
    title        VARCHAR(255),
    category_id  BIGINT,
    author_name  VARCHAR(100),
    reading_time INTEGER,
    views_count  INTEGER,
    likes_count  INTEGER,
    created_at   TIMESTAMP
)
""")
db.executemany("INSERT INTO article VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [
    (1,  "چگونه طلای اصل را تشخیص دهیم؟",         1, "سارا احمدی",   5,  4250, 312, "2024-01-10 10:00:00"),
    (2,  "راهنمای خرید انگشتر طلای عروسی",         1, "مریم رضایی",   8,  6800, 520, "2024-01-25 11:00:00"),
    (3,  "نگهداری از جواهرات نقره در خانه",         2, "لیلا محمدی",   4,  3100, 245, "2024-02-05 09:00:00"),
    (4,  "پیش‌بینی بازار طلا در سال ۱۴۰۳",         3, "حامد کریمی",   6,  8900, 670, "2024-02-20 14:00:00"),
    (5,  "معرفی کلکسیون بهار ۱۴۰۳ اوستا",          4, "زهرا نوری",    3,  2400, 180, "2024-03-01 10:00:00"),
    (6,  "تفاوت طلای ۱۸ و ۲۱ عیار",               1, "سارا احمدی",   5,  5200, 420, "2024-03-15 11:00:00"),
    (7,  "بهترین زمان خرید طلا برای سرمایه‌گذاری",  3, "حامد کریمی",   7,  7600, 580, "2024-04-01 09:00:00"),
    (8,  "مراقبت از انگشتر جواهر",                 2, "لیلا محمدی",   4,  2800, 195, "2024-04-15 10:00:00"),
    (9,  "خرید آنلاین طلا: نکات امنیتی",           1, "مریم رضایی",   6,  4100, 310, "2024-05-01 11:00:00"),
    (10, "معرفی برندهای معتبر جواهرات ایرانی",      4, "زهرا نوری",    5,  3500, 260, "2024-05-20 14:00:00"),
])

db.execute("""
CREATE TABLE article_tag_map (
    article_id BIGINT,
    tag_id     BIGINT
)
""")
db.executemany("INSERT INTO article_tag_map VALUES (?, ?)", [
    (1, 1), (1, 6),
    (2, 1), (2, 3), (2, 6),
    (3, 2), (3, 5),
    (4, 1), (4, 4),
    (5, 1), (5, 3),
    (6, 1),
    (7, 1), (7, 4),
    (8, 3), (8, 5),
    (9, 1), (9, 6),
    (10, 1), (10, 2), (10, 3),
])

# ─── Verify ───────────────────────────────────────────────────────────────────

db.close()

# Quick sanity check
db = duckdb.connect(DB_PATH, read_only=True)
tables = db.execute("SHOW TABLES").fetchall()
print(f"\nDuckDB file created: {DB_PATH}\n")
print(f"{'جدول':<25} {'ردیف':>6}")
print("-" * 33)
for (t,) in tables:
    count = db.execute(f'SELECT COUNT(*) FROM "{t}"').fetchone()[0]
    print(f"{t:<25} {count:>6}")
db.close()
print("\nآماده استفاده!")
