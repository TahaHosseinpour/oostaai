# ساختار دیتابیس پروژه Oosta

> **دیتابیس:** MySQL | **فریمورک:** Django 5.1.6 | **تاریخ:** 2026-02-26

---

## فهرست

1. [موجودیت‌ها](#موجودیت‌ها)
2. [روابط بین موجودیت‌ها](#روابط-بین-موجودیت‌ها)
3. [جزئیات فیلدها](#جزئیات-فیلدها)

---

## موجودیت‌ها

### اپ `account` (کاربران و احراز هویت اصلی)
| موجودیت | توضیح |
|---|---|
| `Customer` | کاربر اصلی سیستم (حقیقی / حقوقی) |
| `GoldSeller` | پروفایل فروشنده / نماینده |
| `OstadKar` | پروفایل اوستاکار |
| `SkillDocument` | مدارک مهارت اوستاکار |
| `FinancialValidationDocument` | مدارک اعتبارسنجی مالی فروشنده |
| `CustomsDocument` | اسناد گمرکی فروشنده |
| `OTP` | کدهای تأیید یکبار مصرف |
| `Wallet` | کیف پول کاربر |
| `Transaction` | تراکنش‌های مالی کاربر |
| `Withdrawal` | درخواست‌های برداشت کاربر |
| `SellerWallet` | کیف پول فروشنده |
| `SellerTransaction` | تراکنش‌های فروشنده |
| `SellerWithdrawal` | درخواست‌های تسویه فروشنده |
| `Gift` | هدایا بین کاربران |
| `Ticket` | تیکت پشتیبانی کاربر |
| `TicketComment` | پیام‌های تیکت |
| `UserRequest` | درخواست کاربر به نماینده |
| `PurchaseRequestLetter` | نامه درخواست خرید |
| `PartnerUser` | کاربر همکار (Proxy) |

### اپ `accounts` (سیستم کاربری جدید)
| موجودیت | توضیح |
|---|---|
| `User` | کاربر جدید (AbstractUser) |
| `OTPCode` | کد تأیید پیشرفته |
| `Profile` | پروفایل تکمیلی کاربر |
| `IndividualProfile` | پروفایل حقیقی |
| `LegalProfile` | پروفایل حقوقی |
| `PurchaseRequest` | درخواست خرید سازمانی |
| `Transaction` | تراکنش‌های مالی (نسخه جدید) |
| `Wallet` | کیف پول (نسخه جدید) |
| `ClubWishlist` | علاقه‌مندی کسب‌وکارها |
| `Ticket` | تیکت پشتیبانی (نسخه جدید) |
| `TicketMessage` | پیام‌های تیکت |
| `UserAddress` | آدرس‌های کاربر |
| `UserActivity` | ثبت فعالیت‌های کاربر |

### اپ `shop` (فروشگاه)
| موجودیت | توضیح |
|---|---|
| `Category` | دسته‌بندی محصولات (درختی) |
| `Collection` | کالکشن محصولات |
| `Brand` | برند محصولات |
| `Variety` | گروه تنوع (مثل: رنگ، سایز) |
| `VarietyDetail` | جزئیات تنوع (مثل: قرمز، XL) |
| `Product` | محصول |
| `ProductGallery` | گالری تصاویر محصول |
| `ProductVariety` | تنوع محصول با قیمت و موجودی |
| `ProductFavorite` | علاقه‌مندی‌های محصول |
| `Cart` | سبد خرید |
| `CartItem` | آیتم سبد خرید |
| `Order` | سفارش |
| `OrderItem` | آیتم سفارش |
| `OrderShipping` | اطلاعات ارسال سفارش |
| `ShippingMethod` | روش ارسال (پیک) |
| `ShippingPost` | هزینه ارسال پستی |
| `Payment` | پرداخت سفارش |

### اپ `core` (محتوا و صفحات عمومی)
| موجودیت | توضیح |
|---|---|
| `About` | صفحه درباره ما |
| `Term` | قوانین و مقررات |
| `Privacy` | حریم خصوصی |
| `Contact` | راه‌های ارتباطی |
| `ContactMessage` | پیام‌های تماس با ما |
| `ArticleCategory` | دسته‌بندی مقالات |
| `ArticleTag` | برچسب مقالات |
| `Article` | مقالات |
| `ArticleComment` | نظرات مقالات (درختی) |
| `FAQ` | سوالات متداول |
| `Banner` | بنرهای تبلیغاتی |
| `Service` | خدمات |
| `GuideLine` | راهنمای مشتریان |
| `Catalog` | کاتالوگ‌ها |
| `News` | اخبار |
| `MediaItem` | گالری رسانه (تصویر / ویدیو) |
| `Education` | ویدیوهای آموزشی |
| `Factory` | معرفی کارخانه |
| `JobApplication` | فرم استخدام |
| `UserIdea` | ایده‌های کاربران |
| `Province` | استان‌ها |
| `City` | شهرها |
| `SocialMedia` | شبکه‌های اجتماعی |
| `Newsletter` | مشترکین خبرنامه |
| `Skill` | مهارت‌ها |

### اپ `clubs` (کسب‌وکارها)
| موجودیت | توضیح |
|---|---|
| `Province` | استان (نسخه clubs) |
| `City` | شهر (نسخه clubs) |
| `Category` | دسته‌بندی کسب‌وکار (درختی) |
| `Club` | کسب‌وکار / واحد صنعتی |

### اپ `subscriptions` (اشتراک‌ها)
| موجودیت | توضیح |
|---|---|
| `SubscriptionLevel` | سطوح اشتراک (۳ سطح) |
| `SubscriptionPlan` | پلن‌های اشتراک |
| `ClubSubscription` | اشتراک خریداری شده توسط کسب‌وکار |
| `Payment` | پرداخت اشتراک |

---

## روابط بین موجودیت‌ها

```
Customer (account)
├── OneToOne → GoldSeller         (gold_seller_profile)
├── OneToOne → OstadKar            (ostadkar_profile)
├── OneToOne → Wallet              (wallet_user)
├── ForeignKey ← Transaction       (wallet / user)
├── ForeignKey ← Withdrawal        (user)
├── ForeignKey ← Gift (sender)     (sent_gifts)
├── ForeignKey ← Gift (recipient)  (received_gifts)
├── ForeignKey ← Ticket            (user)
├── ForeignKey ← PurchaseRequestLetter (user)
└── ForeignKey ← UserRequest       (user)

GoldSeller (account)
├── OneToOne → SellerWallet        (wallet)
├── ForeignKey → Province          (province)
├── ForeignKey → City              (city)
├── ForeignKey ← SellerTransaction (transactions)
├── ForeignKey ← SellerWithdrawal  (withdraws)
├── ForeignKey ← Product           (products)
├── ForeignKey ← OrderItem         (order_details)
├── ForeignKey ← OrderShipping     (order_shippings)
├── ForeignKey ← ShippingMethod    (shipping_methods)
└── ForeignKey ← UserRequest       (received_requests)

OstadKar (account)
├── ManyToMany → Skill             (skills)
├── ForeignKey → City (clubs.City) (ostadkars)
└── ForeignKey ← SkillDocument    (skill_documents)

Order (shop)
├── ForeignKey → Customer          (orders)
├── ForeignKey ← OrderItem         (order_details)
├── ForeignKey ← OrderShipping     (order_shippings)
├── OneToOne ← Payment             (payment)
├── ForeignKey ← Transaction       (orders)
└── ForeignKey ← Gift              (gifts)

Product (shop)
├── ForeignKey → GoldSeller        (products)
├── ForeignKey → Category          (products)
├── ForeignKey → Collection        (collection_products)
├── ForeignKey → Brand             (brand_products)
├── ForeignKey → Variety           (products)
├── ForeignKey ← ProductGallery    (product_galleries)
├── ForeignKey ← ProductVariety    (product_varieties)
└── ForeignKey ← ProductFavorite

ProductVariety (shop)
├── ForeignKey → Product           (product_varieties)
├── ForeignKey → VarietyDetail     (product_varieties)
├── ForeignKey ← CartItem          (product_variety)
└── ForeignKey ← OrderItem         (product_variety)

VarietyDetail (shop)
└── ForeignKey → Variety           (variety_details)

Cart (shop)
├── ForeignKey → Customer          (user)
└── ForeignKey ← CartItem          (items)

Club (clubs)
├── ForeignKey → User (accounts)   (clubs)
├── ForeignKey → Category (clubs)  (clubs)
└── ForeignKey ← ClubSubscription  (club)

ClubSubscription (subscriptions)
├── ForeignKey → Club              (club)
└── ForeignKey → SubscriptionPlan  (plan)

SubscriptionPlan (subscriptions)
└── ForeignKey → SubscriptionLevel (plan)

Article (core)
├── ForeignKey → ArticleCategory   (articles)
├── ManyToMany → ArticleTag        (articles)
└── ForeignKey ← ArticleComment    (comments)

ArticleComment (core)
├── ForeignKey → Article           (comments)
└── ForeignKey → self              (replies) [درختی]

Province (core/clubs)
└── ForeignKey ← City              (cities)
```

---

## جزئیات فیلدها

### `Customer` (account/models.py)
| فیلد | نوع | توضیح |
|---|---|---|
| `id` | BigAutoField | کلید اصلی |
| `phone_number` | PhoneNumberField | شماره تلفن (unique) |
| `image` | ImageField | تصویر پروفایل |
| `customer_type` | CharField | نوع کاربر: individual / company |
| `national_id` | CharField(10) | کد ملی |
| `iban` | CharField(191) | شماره شبا |
| `card_number` | CharField(16) | شماره کارت |
| `bank_account_number` | CharField(20) | شماره حساب |
| `bank_owner_name` | CharField(100) | نام صاحب حساب |
| `bank_name` | CharField(100) | نام بانک |
| `bank_country` | CharField(100) | کشور بانک |
| `address` | TextField | آدرس |
| `company_name` | CharField(191) | نام حقوقی |
| `registration_number` | CharField(191) | شماره ثبت |
| `code_eqtesadi` | CharField(12) | کد اقتصادی |
| `postal_code` | CharField(10) | کد پستی |
| `created_at` | DateTimeField | تاریخ ثبت |
| `updated_at` | DateTimeField | تاریخ بروزرسانی |

---

### `GoldSeller` (account/models.py)
| فیلد | نوع | توضیح |
|---|---|---|
| `id` | BigAutoField | کلید اصلی |
| `user` | OneToOneField → Customer | کاربر مرتبط |
| `role` | CharField | نوع: seller / support / distribution |
| `shop_name` | CharField(191) | نام فروشگاه |
| `company_name` | CharField(191) | نام شرکت |
| `business_email` | EmailField | ایمیل شرکتی |
| `phone` | CharField(20) | تلفن تماس |
| `license_number` | CharField(50) | شماره جواز کسب |
| `national_id` | CharField(10) | کد ملی |
| `province` | ForeignKey → Province | استان |
| `city` | ForeignKey → City | شهر |
| `iban` | CharField(191) | شماره شبا |
| `is_verified` | IntegerField | وضعیت تأیید: 0/1/2 |
| `commission` | DecimalField(5,2) | درصد کمیسیون |
| `cancel_reason` | CharField(255) | علت رد |

---

### `OstadKar` (account/models.py)
| فیلد | نوع | توضیح |
|---|---|---|
| `id` | BigAutoField | کلید اصلی |
| `user` | OneToOneField → Customer | کاربر مرتبط |
| `first_name` | CharField(100) | نام |
| `last_name` | CharField(100) | نام خانوادگی |
| `age` | PositiveIntegerField | سن (18-90) |
| `experience_years` | PositiveIntegerField | سابقه (سال) |
| `skills` | ManyToManyField → Skill | مهارت‌ها |
| `city` | ForeignKey → clubs.City | شهر |
| `profile_image` | ImageField | عکس پروفایل |
| `instagram` | CharField(200) | اینستاگرام |
| `telegram` | CharField(200) | تلگرام |
| `iban` | CharField(191) | شماره شبا |
| `is_verified` | IntegerField | وضعیت تأیید: 0/1/2 |
| `commission` | DecimalField(5,2) | درصد کمیسیون |
| `created_at` | DateTimeField | تاریخ ثبت |

---

### `Wallet` (account/models.py)
| فیلد | نوع | توضیح |
|---|---|---|
| `id` | BigAutoField | کلید اصلی |
| `user` | OneToOneField → Customer | کاربر |
| `balance` | BigIntegerField | موجودی (تومان) |
| `created_at` | DateTimeField | تاریخ ثبت |

---

### `Transaction` (account/models.py)
| فیلد | نوع | توضیح |
|---|---|---|
| `id` | BigAutoField | کلید اصلی |
| `wallet` | ForeignKey → Wallet | کیف پول |
| `user` | ForeignKey → Customer | کاربر |
| `order` | ForeignKey → Order | سفارش مرتبط |
| `amount` | BigIntegerField | مبلغ |
| `transaction_type` | CharField | نوع: deposit / withdraw |
| `authority` | CharField(50) | کد پرداخت (unique) |
| `description` | TextField | توضیحات |
| `status` | BooleanField | وضعیت |
| `created_at` | DateTimeField | تاریخ ثبت |

---

### `Gift` (account/models.py)
| فیلد | نوع | توضیح |
|---|---|---|
| `id` | BigAutoField | کلید اصلی |
| `sender` | ForeignKey → Customer | فرستنده |
| `recipient` | ForeignKey → Customer | گیرنده |
| `order` | ForeignKey → Order | سفارش مرتبط |
| `title` | CharField(255) | عنوان هدیه |
| `name` | CharField(255) | نام تحویل‌گیرنده |
| `image` | ImageField | تصویر |
| `video` | FileField | ویدیو |
| `audio` | FileField | فایل صوتی |
| `message` | TextField | پیام هدیه |
| `created_at` | DateTimeField | تاریخ ارسال |

---

### `Product` (shop/models.py)
| فیلد | نوع | توضیح |
|---|---|---|
| `id` | BigAutoField | کلید اصلی |
| `seller` | ForeignKey → GoldSeller | فروشنده |
| `name` | CharField(255) | نام محصول |
| `code` | CharField(255) | کد محصول |
| `short_description` | TextField | توضیح کوتاه |
| `description` | TextField | توضیحات کامل |
| `variety` | ForeignKey → Variety | نوع تنوع |
| `category` | ForeignKey → Category | دسته‌بندی |
| `collection` | ForeignKey → Collection | کالکشن |
| `brand` | ForeignKey → Brand | برند |
| `video` | FileField | ویدیو |
| `voice` | FileField | فایل صوتی |
| `special` | IntegerField | ویژه (0/1) |
| `bestseller` | IntegerField | پرفروش (0/1) |
| `featured` | IntegerField | برجسته (0/1) |
| `active` | IntegerField | در حال نمایش (0/1) |
| `status` | IntegerField | وضعیت تأیید: 0/1/2 |
| `cancel_reason` | CharField(255) | علت رد |
| `created_at` | DateTimeField | تاریخ ثبت |

---

### `ProductVariety` (shop/models.py)
| فیلد | نوع | توضیح |
|---|---|---|
| `id` | BigAutoField | کلید اصلی |
| `product` | ForeignKey → Product | محصول |
| `variety_detail` | ForeignKey → VarietyDetail | جزئیات تنوع |
| `discount_percent` | DecimalField(4,2) | درصد تخفیف |
| `stock` | IntegerField | موجودی انبار |
| `extra_price` | BigIntegerField | قیمت (تومان) |
| `max_order` | IntegerField | حداکثر سفارش |
| `min_order` | IntegerField | حداقل سفارش |

---

### `Order` (shop/models.py)
| فیلد | نوع | توضیح |
|---|---|---|
| `id` | BigAutoField | کلید اصلی |
| `user` | ForeignKey → Customer | کاربر |
| `status` | CharField | وضعیت: 0=انتظار / 1=پرداخت شده |
| `pay_type` | CharField | نوع پرداخت: 0=درگاه / 1=کیف پول |
| `total_price` | BigIntegerField | مبلغ کل |
| `full_name` | CharField(100) | نام تحویل‌گیرنده |
| `phone` | CharField(15) | تلفن تحویل‌گیرنده |
| `city` | CharField(15) | شهر |
| `address` | TextField | آدرس |
| `postalcode` | CharField(15) | کد پستی |
| `number` | CharField(15) | پلاک |
| `unit` | CharField(15) | واحد |
| `description` | TextField | توضیحات |
| `created_at` | DateTimeField | تاریخ ثبت |

---

### `OrderItem` (shop/models.py)
| فیلد | نوع | توضیح |
|---|---|---|
| `id` | BigAutoField | کلید اصلی |
| `order` | ForeignKey → Order | سفارش |
| `product_variety` | ForeignKey → ProductVariety | تنوع محصول |
| `seller` | ForeignKey → GoldSeller | فروشنده |
| `quantity` | PositiveIntegerField | تعداد |
| `price` | BigIntegerField | قیمت در لحظه خرید |
| `status` | CharField | وضعیت آیتم |
| `cancel_reason` | CharField(255) | علت لغو |

---

### `OrderShipping` (shop/models.py)
| فیلد | نوع | توضیح |
|---|---|---|
| `id` | BigAutoField | کلید اصلی |
| `order` | ForeignKey → Order | سفارش |
| `seller` | ForeignKey → GoldSeller | فروشنده |
| `shipping_method` | ForeignKey → ShippingMethod | روش ارسال (پیک) |
| `shipping_post` | ForeignKey → ShippingPost | روش ارسال (پست) |
| `shipping_price` | PositiveIntegerField | هزینه ارسال |
| `tracking_code` | CharField(30) | کد رهگیری |

---

### `Payment` (shop/models.py)
| فیلد | نوع | توضیح |
|---|---|---|
| `id` | BigAutoField | کلید اصلی |
| `order` | OneToOneField → Order | سفارش |
| `amount` | BigIntegerField | مبلغ |
| `status` | CharField | وضعیت: 0/1/2 |
| `transaction_id` | CharField(100) | شماره پیگیری |

---

### `Club` (clubs/models.py)
| فیلد | نوع | توضیح |
|---|---|---|
| `id` | BigAutoField | کلید اصلی |
| `owner` | ForeignKey → accounts.User | مالک |
| `name` | CharField(100) | نام کسب‌وکار |
| `slug` | SlugField | اسلاگ (unique) |
| `category` | ForeignKey → clubs.Category | دسته‌بندی |
| `description` | TextField | توضیحات |
| `address` | TextField | آدرس |
| `phone` | CharField(15) | تلفن |
| `email` | EmailField | ایمیل |
| `logo` | ImageField | لوگو |
| `cover_image` | ImageField | تصویر کاور |
| `province` | CharField(50) | استان |
| `city` | CharField(50) | شهر |
| `status` | CharField | وضعیت: pending/approved/rejected/suspended |
| `created_at` | DateTimeField | تاریخ ثبت |

---

### `SubscriptionLevel` (subscriptions/models.py)
| فیلد | نوع | توضیح |
|---|---|---|
| `id` | AutoField | کلید اصلی |
| `name` | CharField(100) | نام سطح |
| `level_type` | CharField | level_1 / level_2 / level_3 |
| `max_gallery_images` | IntegerField | حداکثر تصاویر گالری |
| `max_videos` | IntegerField | حداکثر ویدیو |
| `max_products` | IntegerField | حداکثر محصولات |
| `can_be_featured` | BooleanField | قابلیت ویژه شدن |
| `analytics_access` | BooleanField | دسترسی به آمار |
| `api_access` | BooleanField | دسترسی API |
| `is_active` | BooleanField | فعال |

---

### `ClubSubscription` (subscriptions/models.py)
| فیلد | نوع | توضیح |
|---|---|---|
| `id` | AutoField | کلید اصلی |
| `club` | ForeignKey → Club | کسب‌وکار |
| `plan` | ForeignKey → SubscriptionPlan | پلن انتخابی |
| `start_date` | DateTimeField | تاریخ شروع |
| `end_date` | DateTimeField | تاریخ پایان |
| `paid_amount` | DecimalField(12,0) | مبلغ پرداختی |
| `status` | CharField | pending/active/expired/cancelled |
| `transaction_id` | CharField(100) | شناسه تراکنش زرین‌پال |
| `authority` | CharField(100) | کد authority |
| `auto_renewal` | BooleanField | تمدید خودکار |

---

### `Article` (core/models.py)
| فیلد | نوع | توضیح |
|---|---|---|
| `id` | BigAutoField | کلید اصلی |
| `title` | CharField(255) | عنوان |
| `image` | ImageField | تصویر |
| `short_description` | TextField | توضیح کوتاه |
| `content` | RichTextField | محتوا (CKEditor) |
| `category` | ForeignKey → ArticleCategory | دسته‌بندی |
| `tags` | ManyToManyField → ArticleTag | برچسب‌ها |
| `author_name` | CharField(100) | نام نویسنده |
| `reading_time` | PositiveIntegerField | زمان مطالعه (دقیقه) |
| `views_count` | PositiveIntegerField | تعداد بازدید |
| `likes_count` | PositiveIntegerField | تعداد لایک |
| `created_at` | DateTimeField | تاریخ ثبت |

---

### `Province` و `City` (core/models.py)
| فیلد | نوع | توضیح |
|---|---|---|
| `Province.id` | BigAutoField | کلید اصلی |
| `Province.name` | CharField(100) | نام استان |
| `City.id` | BigAutoField | کلید اصلی |
| `City.province` | ForeignKey → Province | استان |
| `City.name` | CharField(100) | نام شهر |

---

## نکات مهم معماری

1. **دو سیستم کاربری موازی:** `account.Customer` (فعلی) و `accounts.User` (جدید) — هر دو فعال هستند
2. **Soft Delete:** مدل‌های `Category`, `Brand`, `Collection`, `Product`, `ProductVariety` از `SafeDeleteModel` استفاده می‌کنند
3. **چند Province/City:** موجودیت Province و City در هر دو اپ `core` و `clubs` تعریف شده‌اند
4. **Multi-language:** اکثر مدل‌های اصلی فیلدهای ترجمه (fa, en, ar, tr, ru) دارند
5. **BaseModel:** اکثر مدل‌ها از BaseModel با فیلدهای `created_at` و `updated_at` ارث می‌برند
