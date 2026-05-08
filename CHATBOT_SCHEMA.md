# DuckDB Chatbot Schema
> زیرمجموعه تحلیلی از دیتابیس Oosta — فقط موجودیت‌های مورد نیاز chatbot

---

## جداول موجود در DuckDB

### جغرافیا

**`province`**
| ستون | نوع | توضیح |
|---|---|---|
| `id` | BIGINT PK | کلید اصلی |
| `name` | VARCHAR(100) | نام استان |

**`city`**
| ستون | نوع | توضیح |
|---|---|---|
| `id` | BIGINT PK | کلید اصلی |
| `province_id` | BIGINT FK → province | استان |
| `name` | VARCHAR(100) | نام شهر |

---

### فروشندگان و اوستاکاران

**`gold_seller`**
| ستون | نوع | توضیح |
|---|---|---|
| `id` | BIGINT PK | کلید اصلی |
| `role` | VARCHAR | نوع: seller / support / distribution |
| `shop_name` | VARCHAR(191) | نام فروشگاه |
| `company_name` | VARCHAR(191) | نام شرکت |
| `province_id` | BIGINT FK → province | استان |
| `city_id` | BIGINT FK → city | شهر |
| `is_verified` | INTEGER | وضعیت تأیید: 0=در انتظار / 1=تأیید شده / 2=رد شده |
| `commission` | DECIMAL(5,2) | درصد کمیسیون |

**`ostadkar`**
| ستون | نوع | توضیح |
|---|---|---|
| `id` | BIGINT PK | کلید اصلی |
| `first_name` | VARCHAR(100) | نام |
| `last_name` | VARCHAR(100) | نام خانوادگی |
| `age` | INTEGER | سن |
| `experience_years` | INTEGER | سابقه کار (سال) |
| `city_id` | BIGINT FK → city | شهر |
| `is_verified` | INTEGER | وضعیت تأیید: 0/1/2 |
| `commission` | DECIMAL(5,2) | درصد کمیسیون |
| `created_at` | TIMESTAMP | تاریخ ثبت |

**`skill`**
| ستون | نوع | توضیح |
|---|---|---|
| `id` | BIGINT PK | کلید اصلی |
| `name` | VARCHAR | نام مهارت |

**`ostadkar_skill`** (جدول میانی ManyToMany)
| ستون | نوع | توضیح |
|---|---|---|
| `ostadkar_id` | BIGINT FK → ostadkar | اوستاکار |
| `skill_id` | BIGINT FK → skill | مهارت |

---

### محصولات و فروشگاه

**`shop_category`**
| ستون | نوع | توضیح |
|---|---|---|
| `id` | BIGINT PK | کلید اصلی |
| `parent_id` | BIGINT FK → self | دسته والد (NULL = ریشه) |
| `name` | VARCHAR(255) | نام دسته‌بندی |

**`brand`**
| ستون | نوع | توضیح |
|---|---|---|
| `id` | BIGINT PK | کلید اصلی |
| `name` | VARCHAR | نام برند |

**`collection`**
| ستون | نوع | توضیح |
|---|---|---|
| `id` | BIGINT PK | کلید اصلی |
| `name` | VARCHAR | نام کالکشن |

**`variety`** (گروه تنوع، مثلاً «رنگ»، «سایز»)
| ستون | نوع | توضیح |
|---|---|---|
| `id` | BIGINT PK | کلید اصلی |
| `name` | VARCHAR | نام گروه تنوع |

**`variety_detail`** (مقادیر تنوع، مثلاً «قرمز»، «XL»)
| ستون | نوع | توضیح |
|---|---|---|
| `id` | BIGINT PK | کلید اصلی |
| `variety_id` | BIGINT FK → variety | گروه تنوع |
| `name` | VARCHAR | مقدار تنوع |

**`product`**
| ستون | نوع | توضیح |
|---|---|---|
| `id` | BIGINT PK | کلید اصلی |
| `seller_id` | BIGINT FK → gold_seller | فروشنده |
| `name` | VARCHAR(255) | نام محصول |
| `code` | VARCHAR(255) | کد محصول |
| `category_id` | BIGINT FK → shop_category | دسته‌بندی |
| `collection_id` | BIGINT FK → collection | کالکشن |
| `brand_id` | BIGINT FK → brand | برند |
| `variety_id` | BIGINT FK → variety | نوع تنوع |
| `special` | INTEGER | ویژه: 0/1 |
| `bestseller` | INTEGER | پرفروش: 0/1 |
| `featured` | INTEGER | برجسته: 0/1 |
| `active` | INTEGER | نمایش: 0/1 |
| `status` | INTEGER | تأیید: 0=در انتظار / 1=تأیید / 2=رد |
| `created_at` | TIMESTAMP | تاریخ ثبت |

**`product_variety`** (تنوع‌های هر محصول با قیمت و موجودی)
| ستون | نوع | توضیح |
|---|---|---|
| `id` | BIGINT PK | کلید اصلی |
| `product_id` | BIGINT FK → product | محصول |
| `variety_detail_id` | BIGINT FK → variety_detail | جزئیات تنوع |
| `discount_percent` | DECIMAL(4,2) | درصد تخفیف |
| `stock` | INTEGER | موجودی انبار |
| `extra_price` | BIGINT | قیمت (تومان) |
| `max_order` | INTEGER | حداکثر سفارش |
| `min_order` | INTEGER | حداقل سفارش |

---

### سفارش‌ها

**`order`**
| ستون | نوع | توضیح |
|---|---|---|
| `id` | BIGINT PK | کلید اصلی |
| `status` | VARCHAR | وضعیت: 0=در انتظار پرداخت / 1=پرداخت شده |
| `pay_type` | VARCHAR | نوع پرداخت: 0=درگاه / 1=کیف پول |
| `total_price` | BIGINT | مبلغ کل (تومان) |
| `city` | VARCHAR(15) | شهر تحویل |
| `created_at` | TIMESTAMP | تاریخ ثبت |

**`order_item`**
| ستون | نوع | توضیح |
|---|---|---|
| `id` | BIGINT PK | کلید اصلی |
| `order_id` | BIGINT FK → order | سفارش |
| `product_variety_id` | BIGINT FK → product_variety | تنوع محصول |
| `seller_id` | BIGINT FK → gold_seller | فروشنده |
| `quantity` | INTEGER | تعداد |
| `price` | BIGINT | قیمت در لحظه خرید (تومان) |
| `status` | VARCHAR | وضعیت آیتم |

**`order_shipping`**
| ستون | نوع | توضیح |
|---|---|---|
| `id` | BIGINT PK | کلید اصلی |
| `order_id` | BIGINT FK → order | سفارش |
| `seller_id` | BIGINT FK → gold_seller | فروشنده |
| `shipping_price` | INTEGER | هزینه ارسال (تومان) |

---

### کسب‌وکارها و اشتراک‌ها

**`club_category`**
| ستون | نوع | توضیح |
|---|---|---|
| `id` | BIGINT PK | کلید اصلی |
| `parent_id` | BIGINT FK → self | دسته والد |
| `name` | VARCHAR(255) | نام دسته‌بندی |

**`club`**
| ستون | نوع | توضیح |
|---|---|---|
| `id` | BIGINT PK | کلید اصلی |
| `name` | VARCHAR(100) | نام کسب‌وکار |
| `slug` | VARCHAR | شناسه URL |
| `category_id` | BIGINT FK → club_category | دسته‌بندی |
| `province` | VARCHAR(50) | استان |
| `city` | VARCHAR(50) | شهر |
| `status` | VARCHAR | وضعیت: pending/approved/rejected/suspended |
| `created_at` | TIMESTAMP | تاریخ ثبت |

**`subscription_level`**
| ستون | نوع | توضیح |
|---|---|---|
| `id` | INTEGER PK | کلید اصلی |
| `name` | VARCHAR(100) | نام سطح |
| `level_type` | VARCHAR | level_1 / level_2 / level_3 |
| `max_gallery_images` | INTEGER | حداکثر تصاویر گالری |
| `max_videos` | INTEGER | حداکثر ویدیو |
| `max_products` | INTEGER | حداکثر محصولات |
| `can_be_featured` | BOOLEAN | قابلیت ویژه شدن |
| `analytics_access` | BOOLEAN | دسترسی به آمار |
| `is_active` | BOOLEAN | فعال |

**`subscription_plan`**
| ستون | نوع | توضیح |
|---|---|---|
| `id` | INTEGER PK | کلید اصلی |
| `level_id` | INTEGER FK → subscription_level | سطح اشتراک |
| `name` | VARCHAR | نام پلن |
| `price` | DECIMAL(12,0) | قیمت (تومان) |
| `duration_days` | INTEGER | مدت (روز) |

**`club_subscription`**
| ستون | نوع | توضیح |
|---|---|---|
| `id` | INTEGER PK | کلید اصلی |
| `club_id` | BIGINT FK → club | کسب‌وکار |
| `plan_id` | INTEGER FK → subscription_plan | پلن |
| `start_date` | TIMESTAMP | تاریخ شروع |
| `end_date` | TIMESTAMP | تاریخ پایان |
| `paid_amount` | DECIMAL(12,0) | مبلغ پرداختی (تومان) |
| `status` | VARCHAR | pending/active/expired/cancelled |
| `auto_renewal` | BOOLEAN | تمدید خودکار |

---

### محتوا

**`article_category`**
| ستون | نوع | توضیح |
|---|---|---|
| `id` | BIGINT PK | کلید اصلی |
| `name` | VARCHAR | نام دسته‌بندی مقاله |

**`article_tag`**
| ستون | نوع | توضیح |
|---|---|---|
| `id` | BIGINT PK | کلید اصلی |
| `name` | VARCHAR | نام تگ |

**`article`**
| ستون | نوع | توضیح |
|---|---|---|
| `id` | BIGINT PK | کلید اصلی |
| `title` | VARCHAR(255) | عنوان مقاله |
| `category_id` | BIGINT FK → article_category | دسته‌بندی |
| `author_name` | VARCHAR(100) | نام نویسنده |
| `reading_time` | INTEGER | زمان مطالعه (دقیقه) |
| `views_count` | INTEGER | تعداد بازدید |
| `likes_count` | INTEGER | تعداد لایک |
| `created_at` | TIMESTAMP | تاریخ ثبت |

**`article_tag_map`** (جدول میانی ManyToMany)
| ستون | نوع | توضیح |
|---|---|---|
| `article_id` | BIGINT FK → article | مقاله |
| `tag_id` | BIGINT FK → article_tag | تگ |

---

## موجودیت‌های حذف‌شده (دلیل)

| موجودیت | دلیل حذف |
|---|---|
| OTP / OTPCode | امنیتی |
| Wallet / Transaction / Withdrawal | مالی حساس |
| SellerWallet / SellerTransaction / SellerWithdrawal | مالی حساس |
| Payment (shop & subscriptions) | مالی حساس |
| SkillDocument / FinancialValidationDocument / CustomsDocument | مدارک شخصی حساس |
| Ticket / TicketComment / TicketMessage | پشتیبانی — ارزش تحلیلی ندارد |
| Cart / CartItem | داده موقت |
| Gift | شخصی |
| Customer / User / Profile | اطلاعات شخصی حساس |
| ContactMessage / JobApplication / UserIdea | فرم‌های دریافتی |
| About / Term / Privacy / Banner / FAQ / SocialMedia / Newsletter | محتوای ایستا |
| ProductGallery / MediaItem / Education / Factory | فایل‌های رسانه‌ای |
| UserActivity / UserAddress / ClubWishlist | داده شخصی |
| PurchaseRequestLetter / UserRequest / PartnerUser | فرایند داخلی |
