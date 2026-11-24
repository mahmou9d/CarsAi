# 🚗 دليل تحويل الباك إند إلى Express.js + JWT Auth + AWS S3 (الدليل الشامل النهائي)

## 📌 الفهرس العام

1. [نظرة عامة على المعمارية الجديدة (Architecture)](#-نظرة-عامة-على-المعمارية-الجديدة-architecture)
2. [هيكل مجلد الباك إند (`back/`)](#-هيكل-مجلد-الباك-إند-back)
3. [الخطوة 1: تهيئة المشروع وتثبيت الحزم](#-الخطوة-1-تهيئة-المشروع-وتثبيت-الحزم)
4. [الخطوة 2: ملف `package.json`](#-الخطوة-2-ملف-packagejson)
5. [الخطوة 3: ملف المتغيرات `.env` وإعداد AWS S3](#-الخطوة-3-ملف-المتغيرات-env-وإعداد-aws-s3)
6. [الخطوة 4: ملف `.gitignore`](#-الخطوة-4-ملف-gitignore)
7. [الخطوة 5: Prisma Schema المحدث](#-الخطوة-5-prisma-schema-المحدث)
8. [الخطوة 6: ملفات الإعداد (Config)](#-الخطوة-6-ملفات-الإعداد-config)
9. [الخطوة 7: الدوال المساعدة (Utils) وحذف S3](#-الخطوة-7-الدوال-المساعدة-utils-وحذف-s3)
10. [الخطوة 8: الوسائط والتحكم (Middlewares)](#-الخطوة-8-الوسائط-والتحكم-middlewares)
11. [الخطوة 9: وحدات التحكم الكاملة (Controllers)](#-الخطوة-9-وحدات-التحكم-الكاملة-controllers)
12. [الخطوة 10: ملفات المسارات (Routes)](#-الخطوة-10-ملفات-المسارات-routes)
13. [الخطوة 11: نقطة الانطلاق الرئيسية `src/index.js`](#-الخطوة-11-نقطة-الانطلاق-الرئيسية-srcindexjs)
14. [الخطوة 12: سكريبت إنشاء حساب الأدمن `prisma/seed.js`](#-الخطوة-12-سكريبت-إنشاء-حساب-الأدمن-prismaseedjs)
15. [الخطوة 13: تعديلات الـ Frontend بالكامل (Auth, Header, Forms, Search)](#-الخطوة-13-تعديلات-الـ-frontend-بالكامل)
16. [الخطوة 14: تقنية متقدمة: الرفع المباشر عبر S3 Presigned URLs](#-الخطوة-14-تقنية-متقدمة-الرفع-المباشر-عبر-s3-presigned-urls)
17. [الخطوة 15: اختبار الـ API بـ Postman / Thunder Client](#-الخطوة-15-اختبار-الـ-api-بـ-postman--thunder-client)
18. [الخطوة 16: دليل استكشاف الأخطاء الشائعة (Troubleshooting)](#-الخطوة-16-دليل-استكشاف-الأخطاء-الشائعة-troubleshooting)
19. [الخطوة 17: دليل النشر السحابي (Deployment Guide)](#-الخطوة-17-دليل-النشر-السحابي-deployment-guide)

---

## 🏗️ نظرة عامة على المعمارية الجديدة (Architecture)

سنتحول من:

- **Supabase Storage** ➔ **AWS S3** (باستخدام `@aws-sdk/client-s3` و `multer-s3`)
- **Clerk Auth** ➔ **Custom Auth (JWT + bcryptjs)**
- **Next.js Server Actions** ➔ **Express.js REST API**
- **Arcjet** ➔ **express-rate-limit + helmet**

```mermaid
flowchart LR
    subgraph Frontend ["Next.js Frontend (Port 3000)"]
        UI["React UI Components"]
        AuthCtx["Auth Context (JWT)"]
        APIClient["API Client (fetch / Axios)"]
    end

    subgraph Backend ["Express.js Backend (Port 5000)"]
        Router["Express Routers"]
        AuthMW["JWT Auth Middleware"]
        MulterS3["Multer-S3 Middleware"]
        Ctrl["Controllers"]
        Prisma["Prisma ORM"]
    end

    subgraph External ["الخدمات السحابية"]
        S3["AWS S3 Bucket (Images)"]
        DB[("PostgreSQL Database")]
        Gemini["Google Gemini AI"]
    end

    UI --> AuthCtx --> APIClient
    APIClient -->|"Bearer Token / REST"| Router
    Router --> AuthMW --> Ctrl
    Router --> MulterS3 -->|"Direct Stream"| S3
    Ctrl --> Prisma --> DB
    Ctrl --> Gemini
```

---

## 🏗️ هيكل مجلد الباك إند (`back/`)

```
back/
├── prisma/
│   ├── schema.prisma          # الـ Schema مع password وحذف clerkUserId
│   └── seed.js                # سكريبت إنشاء حساب الأدمن الافتراضي
├── src/
│   ├── config/
│   │   ├── db.js               # إعداد Prisma Client
│   │   ├── s3.js               # إعداد AWS S3 Client (v3)
│   │   └── gemini.js           # إعداد Google Gemini AI
│   ├── middleware/
│   │   ├── auth.js             # فحص وتوثيق JWT Token
│   │   ├── admin.js            # التحقق من رتبة الأدمن (ADMIN)
│   │   ├── upload.js           # رفع الصور مباشرة لـ S3 عبر multer-s3
│   │   └── rateLimiter.js      # Rate Limiting لحماية الـ Endpoints
│   ├── routes/
│   │   ├── auth.routes.js      # مسارات التسجيل والدخول والبروفايل
│   │   ├── cars.routes.js      # مسارات إدارة السيارات (Admin)
│   │   ├── carListing.routes.js# مسارات تصفح السيارات والـ Wishlist
│   │   ├── testDrive.routes.js # مسارات حجز مواعيد تجربة القيادة
│   │   ├── admin.routes.js     # لوحة تحكم الأدمن والإحصائيات
│   │   ├── settings.routes.js  # إعدادات المعرض وساعات العمل
│   │   └── home.routes.js      # الصفحة الرئيسية وبحث الـ AI
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── cars.controller.js
│   │   ├── carListing.controller.js
│   │   ├── testDrive.controller.js
│   │   ├── admin.controller.js
│   │   ├── settings.controller.js
│   │   └── home.controller.js
│   ├── utils/
│   │   ├── s3-helpers.js       # دوال مساعدة لحذف ملفات من S3
│   │   └── helpers.js          # دوال التنسيق (serializeCarData, formatCurrency)
│   └── index.js                # نقطة الانطلاق الرئيسية (Express App)
├── .env
├── package.json
└── .gitignore
```

---

## 📦 الخطوة 1: تهيئة المشروع وتثبيت الحزم

داخل المجلد الرئيسي للمشروع:

```bash
mkdir back
cd back
npm init -y
```

### تثبيت الحزم المطلوبة:

```bash
npm install express cors dotenv @prisma/client bcryptjs jsonwebtoken cookie-parser multer multer-s3 @aws-sdk/client-s3 @aws-sdk/s3-request-presigner uuid @google/generative-ai express-rate-limit helmet morgan
```

### تثبيت أدوات التطوير (Dev Dependencies):

```bash
npm install -D prisma nodemon
```

---

## 📦 الخطوة 2: ملف `package.json`

```json
{
  "name": "carsai-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "db:seed": "node prisma/seed.js",
    "build": "prisma generate && prisma db push"
  }
}
```

---

## 📦 الخطوة 3: ملف المتغيرات `.env` وإعداد AWS S3

قم بإنشاء ملف `.env` في مجلد `back/`:

```env
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# PostgreSQL Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# JWT Config
JWT_SECRET=super_secret_jwt_key_carsai_2026_change_in_production
JWT_EXPIRES_IN=7d

# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
AWS_S3_BUCKET_NAME=carsai-bucket-name

# Google Gemini AI
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

> [!TIP]
> **إعدادات AWS S3 المطلوبة للصور:**
>
> 1. أنشئ Bucket باسم فريد.
> 2. عطل خيار **Block all public access**.
> 3. أضف الـ Bucket Policy التالية للقراءة العامة:
>
> ```json
> {
>   "Version": "2012-10-17",
>   "Statement": [
>     {
>       "Sid": "PublicReadGetObject",
>       "Effect": "Allow",
>       "Principal": "*",
>       "Action": "s3:GetObject",
>       "Resource": "arn:aws:s3:::carsai-bucket-name/*"
>     }
>   ]
> }
> ```
>
> 4. أضف CORS Configuration للـ S3 Bucket:
>
> ```json
> [
>   {
>     "AllowedHeaders": ["*"],
>     "AllowedMethods": ["GET", "HEAD", "PUT", "POST", "DELETE"],
>     "AllowedOrigins": ["*"],
>     "ExposeHeaders": []
>   }
> ]
> ```

---

## 📦 الخطوة 4: ملف `.gitignore`

```gitignore
node_modules/
.env
```

---

## 📦 الخطوة 5: Prisma Schema المحدث

في `back/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ============================================================
// USERS
// ============================================================

model User {
  id              String             @id @default(uuid())
  email           String             @unique
  password        String             // كلمة المرور المشفرة بـ bcrypt
  name            String?
  imageUrl        String?
  phone           String?
  city            String?
  address         String?
  role            UserRole           @default(USER)
  isActive        Boolean            @default(true)
  emailVerified   Boolean            @default(false)
  verifyToken     String?            @unique
  resetToken      String?            @unique
  resetTokenExp   DateTime?
  lastLoginAt     DateTime?
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt

  savedCars       UserSavedCar[]
  testDrives      TestDriveBooking[]
  reviews         CarReview[]
  inquiries       Inquiry[]
  notifications   Notification[]
  savedSearches   SavedSearch[]
  auditLogs       AuditLog[]
  tradeIns        TradeInRequest[]
  financeApps     FinanceApplication[]
  reservations    Reservation[]
  comparisons     CarComparison[]
  carViews        CarView[]

  @@index([role])
  @@index([isActive])
}

enum UserRole {
  USER
  ADMIN
}

// ============================================================
// CARS
// ============================================================

model Car {
  id                String             @id @default(uuid())
  slug              String             @unique
  vin               String?            @unique // رقم الشاسيه
  make              String
  model             String
  trim              String?            // الفئة (مثلاً: Sport / Luxury)
  year              Int
  price             Decimal            @db.Decimal(12, 2)
  discountPrice     Decimal?           @db.Decimal(12, 2)
  currency          String             @default("EGP")
  negotiable        Boolean            @default(false)
  mileage           Int
  color             String
  interiorColor     String?
  fuelType          String
  transmission      String
  bodyType          String
  drivetrain        Drivetrain?
  engineSize        Float?             // سعة المحرك باللتر
  horsepower        Int?
  cylinders         Int?
  seats             Int?
  doors             Int?
  condition         CarCondition       @default(USED)
  ownersCount       Int?               // عدد الملاك السابقين
  hasServiceHistory Boolean            @default(false)
  accidentFree      Boolean            @default(true)
  city              String?
  branchId          String?
  branch            Branch?            @relation(fields: [branchId], references: [id], onDelete: SetNull)
  description       String
  features          String[]           // مثل: فتحة سقف، كاميرا خلفية، مثبت سرعة
  images            String[]           // مصفوفة روابط AWS S3 المباشرة
  videoUrl          String?
  status            CarStatus          @default(AVAILABLE)
  featured          Boolean            @default(false)
  viewsCount        Int                @default(0)
  soldAt            DateTime?
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt

  savedBy           UserSavedCar[]
  testDriveBookings TestDriveBooking[]
  reviews           CarReview[]
  inquiries         Inquiry[]
  priceHistory      PriceHistory[]
  documents         CarDocument[]
  reservations      Reservation[]
  financeApps       FinanceApplication[]
  views             CarView[]
  offers            Offer[]

  @@index([make, model])
  @@index([bodyType])
  @@index([price])
  @@index([year])
  @@index([status])
  @@index([fuelType])
  @@index([featured])
  @@index([condition])
  @@index([city])
  @@index([branchId])
}

enum CarStatus {
  AVAILABLE
  UNAVAILABLE
  RESERVED
  SOLD
}

enum CarCondition {
  NEW
  USED
  CERTIFIED_PRE_OWNED
}

enum Drivetrain {
  FWD
  RWD
  AWD
  FOUR_WD
}

// سجل تغيّر الأسعار
model PriceHistory {
  id        String   @id @default(uuid())
  carId     String
  car       Car      @relation(fields: [carId], references: [id], onDelete: Cascade)
  oldPrice  Decimal  @db.Decimal(12, 2)
  newPrice  Decimal  @db.Decimal(12, 2)
  changedAt DateTime @default(now())

  @@index([carId])
}

// ============================================================
// DEALERSHIP
// ============================================================

model DealershipInfo {
  id           String        @id @default(uuid())
  name         String        @default("CarsAi")
  logoUrl      String?
  address      String        @default("Egypt Cairo")
  latitude     Float?
  longitude    Float?
  phone        String        @default("01009014597")
  whatsapp     String?
  email        String        @default("mohnud0987@gmail.com")
  facebookUrl  String?
  instagramUrl String?
  workingHours WorkingHour[]
  branches     Branch[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}

model WorkingHour {
  id             String         @id @default(uuid())
  dealershipId   String
  dealership     DealershipInfo @relation(fields: [dealershipId], references: [id], onDelete: Cascade)
  dayOfWeek      DayOfWeek
  openTime       String
  closeTime      String
  isOpen         Boolean        @default(true)
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  @@unique([dealershipId, dayOfWeek])
  @@index([dealershipId])
  @@index([dayOfWeek])
  @@index([isOpen])
}

enum DayOfWeek {
  MONDAY
  TUESDAY
  WEDNESDAY
  THURSDAY
  FRIDAY
  SATURDAY
  SUNDAY
}

// ============================================================
// USER INTERACTIONS
// ============================================================

model UserSavedCar {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  carId     String
  car       Car      @relation(fields: [carId], references: [id], onDelete: Cascade)
  savedAt   DateTime @default(now())

  @@unique([userId, carId])
  @@index([userId])
  @@index([carId])
}

// تقييمات وآراء المستخدمين
model CarReview {
  id        String   @id @default(uuid())
  carId     String
  car       Car      @relation(fields: [carId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  rating    Int      // من 1 إلى 5
  comment   String?
  approved  Boolean  @default(false) // موافقة الأدمن قبل الظهور
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, carId])
  @@index([carId])
  @@index([approved])
}

// استفسارات العملاء عن سيارة
model Inquiry {
  id        String        @id @default(uuid())
  carId     String?
  car       Car?          @relation(fields: [carId], references: [id], onDelete: SetNull)
  userId    String?
  user      User?         @relation(fields: [userId], references: [id], onDelete: SetNull)
  name      String
  email     String
  phone     String?
  message   String
  status    InquiryStatus @default(NEW)
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt

  @@index([carId])
  @@index([userId])
  @@index([status])
}

enum InquiryStatus {
  NEW
  IN_PROGRESS
  RESOLVED
  CLOSED
}

// بحث محفوظ مع تنبيهات
model SavedSearch {
  id         String   @id @default(uuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name       String
  filters    Json     // {make, bodyType, minPrice, maxPrice, ...}
  notifyNew  Boolean  @default(true)
  createdAt  DateTime @default(now())

  @@index([userId])
}

model Notification {
  id        String           @id @default(uuid())
  userId    String
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  type      NotificationType
  title     String
  body      String?
  link      String?
  isRead    Boolean          @default(false)
  createdAt DateTime         @default(now())

  @@index([userId, isRead])
}

enum NotificationType {
  BOOKING_UPDATE
  PRICE_DROP
  NEW_CAR_MATCH
  INQUIRY_REPLY
  SYSTEM
}

// ============================================================
// TEST DRIVES
// ============================================================

model TestDriveBooking {
  id              String        @id @default(uuid())
  carId           String
  car             Car           @relation(fields: [carId], references: [id])
  userId          String
  user            User          @relation(fields: [userId], references: [id])
  bookingDate     DateTime      @db.Date
  startTime       String
  endTime         String
  status          BookingStatus @default(PENDING)
  notes           String?
  cancelReason    String?
  confirmedAt     DateTime?
  cancelledAt     DateTime?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([carId])
  @@index([userId])
  @@index([bookingDate])
  @@index([status])
  @@index([carId, bookingDate, startTime])
}

enum BookingStatus {
  PENDING
  CONFIRMED
  COMPLETED
  CANCELLED
  NO_SHOW
}

// ============================================================
// ADMIN
// ============================================================

// سجل عمليات الأدمن
model AuditLog {
  id         String   @id @default(uuid())
  userId     String?
  user       User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  action     String   // مثل: CAR_CREATED, CAR_DELETED, BOOKING_CONFIRMED
  entity     String   // Car, TestDriveBooking, ...
  entityId   String?
  metadata   Json?
  createdAt  DateTime @default(now())

  @@index([userId])
  @@index([entity, entityId])
  @@index([createdAt])
}

// ============================================================
// EXTRA FEATURES (v2)
// ============================================================

// فروع المعرض
model Branch {
  id           String          @id @default(uuid())
  dealershipId String
  dealership   DealershipInfo  @relation(fields: [dealershipId], references: [id], onDelete: Cascade)
  name         String
  city         String
  address      String
  phone        String?
  latitude     Float?
  longitude    Float?
  isActive     Boolean         @default(true)
  cars         Car[]
  createdAt    DateTime        @default(now())
  updatedAt    DateTime        @updatedAt

  @@index([dealershipId])
  @@index([city])
}

// عروض وخصومات موسمية على مجموعة سيارات
model Offer {
  id            String    @id @default(uuid())
  title         String
  description   String?
  bannerUrl     String?
  discountType  DiscountType
  discountValue Decimal   @db.Decimal(12, 2) // نسبة % أو مبلغ ثابت
  couponCode    String?   @unique
  startsAt      DateTime
  endsAt        DateTime
  isActive      Boolean   @default(true)
  cars          Car[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([isActive, startsAt, endsAt])
}

enum DiscountType {
  PERCENTAGE
  FIXED
}

// مستندات السيارة (تقرير فحص، رخصة، دفتر صيانة، ضمان)
model CarDocument {
  id        String       @id @default(uuid())
  carId     String
  car       Car          @relation(fields: [carId], references: [id], onDelete: Cascade)
  type      DocumentType
  name      String
  url       String
  createdAt DateTime     @default(now())

  @@index([carId])
}

enum DocumentType {
  INSPECTION_REPORT
  LICENSE
  SERVICE_BOOK
  WARRANTY
  OTHER
}

// حجز سيارة بعربون
model Reservation {
  id            String            @id @default(uuid())
  carId         String
  car           Car               @relation(fields: [carId], references: [id])
  userId        String
  user          User              @relation(fields: [userId], references: [id])
  depositAmount Decimal           @db.Decimal(12, 2)
  paymentMethod PaymentMethod?
  paymentRef    String?           // رقم العملية من بوابة الدفع
  status        ReservationStatus @default(PENDING)
  expiresAt     DateTime          // ينتهي الحجز تلقائياً بعد مدة
  paidAt        DateTime?
  refundedAt    DateTime?
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  @@index([carId])
  @@index([userId])
  @@index([status])
  @@index([expiresAt])
}

enum ReservationStatus {
  PENDING
  PAID
  EXPIRED
  CANCELLED
  REFUNDED
  CONVERTED_TO_SALE
}

enum PaymentMethod {
  CARD
  CASH
  BANK_TRANSFER
  INSTAPAY
  FAWRY
}

// طلب تمويل / تقسيط
model FinanceApplication {
  id                 String            @id @default(uuid())
  carId              String
  car                Car               @relation(fields: [carId], references: [id])
  userId             String
  user               User              @relation(fields: [userId], references: [id])
  downPayment        Decimal           @db.Decimal(12, 2)
  loanTermMonths     Int
  monthlyIncome      Decimal           @db.Decimal(12, 2)
  employmentType     EmploymentType
  employerName       String?
  estimatedInstallment Decimal?        @db.Decimal(12, 2)
  status             FinanceStatus     @default(SUBMITTED)
  adminNotes         String?
  createdAt          DateTime          @default(now())
  updatedAt          DateTime          @updatedAt

  @@index([carId])
  @@index([userId])
  @@index([status])
}

enum EmploymentType {
  EMPLOYEE
  SELF_EMPLOYED
  BUSINESS_OWNER
  RETIRED
}

enum FinanceStatus {
  SUBMITTED
  UNDER_REVIEW
  APPROVED
  REJECTED
  CANCELLED
}

// طلب تقييم سيارة العميل (Trade-in / بيع سيارتك)
model TradeInRequest {
  id             String         @id @default(uuid())
  userId         String
  user           User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  make           String
  model          String
  year           Int
  mileage        Int
  color          String?
  condition      String
  description    String?
  images         String[]
  expectedPrice  Decimal?       @db.Decimal(12, 2)
  estimatedValue Decimal?       @db.Decimal(12, 2) // تقييم المعرض
  status         TradeInStatus  @default(PENDING)
  adminNotes     String?
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  @@index([userId])
  @@index([status])
}

enum TradeInStatus {
  PENDING
  INSPECTION_SCHEDULED
  OFFER_SENT
  ACCEPTED
  REJECTED
}

// مقارنة بين السيارات (حد أقصى 4 من الـ API)
model CarComparison {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  name      String?
  carIds    String[]
  createdAt DateTime @default(now())

  @@index([userId])
}

// المشاهدات الأخيرة + إحصائيات
model CarView {
  id        String   @id @default(uuid())
  carId     String
  car       Car      @relation(fields: [carId], references: [id], onDelete: Cascade)
  userId    String?
  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  sessionId String?  // للزوار غير المسجلين
  viewedAt  DateTime @default(now())

  @@index([carId, viewedAt])
  @@index([userId, viewedAt])
}

// نشرة بريدية
model NewsletterSubscriber {
  id           String   @id @default(uuid())
  email        String   @unique
  isActive     Boolean  @default(true)
  subscribedAt DateTime @default(now())
}
```

---

## 📄 الخطوة 6: ملفات الإعداد (Config)

### 1. `src/config/db.js`

```js
import { PrismaClient } from "@prisma/client";

const db = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = db;
}

export default db;
```

### 2. `src/config/s3.js`

```js
import { S3Client } from "@aws-sdk/client-s3";

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
```

### 3. `src/config/gemini.js`

```js
import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI = null;

export const getGeminiModel = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key is not configured");
  }

  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  return genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
};
```

---

## 📄 الخطوة 7: الدوال المساعدة (Utils) وحذف S3

### 1. `src/utils/s3-helpers.js`

```js
import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../config/s3.js";

export const extractS3KeyFromUrl = (url) => {
  try {
    const parsedUrl = new URL(url);
    return decodeURIComponent(parsedUrl.pathname.substring(1));
  } catch (error) {
    console.error("Error parsing S3 URL:", error);
    return null;
  }
};

export const deleteS3Files = async (imageUrls = []) => {
  if (!imageUrls || imageUrls.length === 0) return;

  const keys = imageUrls
    .map(extractS3KeyFromUrl)
    .filter(Boolean)
    .map((Key) => ({ Key }));

  if (keys.length === 0) return;

  try {
    const command = new DeleteObjectsCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Delete: {
        Objects: keys,
        Quiet: true,
      },
    });

    await s3Client.send(command);
    console.log(`✅ Successfully deleted ${keys.length} images from S3.`);
  } catch (error) {
    console.error("❌ Error deleting images from S3:", error);
  }
};
```

### 2. `src/utils/helpers.js`

```js
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export const serializeCarData = (car, wishlisted = false) => {
  return {
    ...car,
    price: car.price ? parseFloat(car.price.toString()) : 0,
    createdAt: car.createdAt?.toISOString(),
    updatedAt: car.updatedAt?.toISOString(),
    wishlisted,
  };
};
```

---

## 📄 الخطوة 8: الوسائط والتحكم (Middlewares)

### 1. `src/middleware/auth.js`

```js
import jwt from "jsonwebtoken";
import db from "../config/db.js";

export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

export const requireAuth = async (req, res, next) => {
  try {
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Not authenticated. Please login.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        imageUrl: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User no longer exists.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error:
        error.name === "TokenExpiredError" ? "Token expired" : "Invalid token",
    });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await db.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          imageUrl: true,
          phone: true,
          role: true,
        },
      });
      req.user = user || null;
    }
    next();
  } catch {
    req.user = null;
    next();
  }
};
```

### 2. `src/middleware/admin.js`

```js
import jwt from "jsonwebtoken";
import db from "../config/db.js";

export const requireAdmin = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res
        .status(401)
        .json({ success: false, error: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        error: "Unauthorized: Admin access required.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: "Invalid session." });
  }
};
```

### 3. `src/middleware/upload.js`

```js
import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { s3Client } from "../config/s3.js";

const fileFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/jpg",
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

export const uploadCarImagesToS3 = multer({
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 10,
  },
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      if (!req.carId) {
        req.carId = req.params.carId || uuidv4();
      }
      const ext = path.extname(file.originalname);
      const filename = `image-${Date.now()}-${uuidv4().slice(0, 8)}${ext}`;
      const fullPath = `cars/${req.carId}/${filename}`;
      cb(null, fullPath);
    },
  }),
});

export const uploadSingleImageMemory = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
});
```

### 4. `src/middleware/rateLimiter.js`

```js
import rateLimit from "express-rate-limit";

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  message: {
    success: false,
    error: "Too many requests. Please try again later.",
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: "Too many login attempts. Try again after 15 minutes.",
  },
});

export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    error: "Too many AI requests. Try again after 1 hour.",
  },
});
```

---

## 📄 الخطوة 9: وحدات التحكم الكاملة (Controllers)

### 1. `src/controllers/auth.controller.js`

```js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../config/db.js";
import { generateToken } from "../middleware/auth.js";

// تسجيل مستخدم جديد
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, city, address } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Email and password are required." });
    }

    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, error: "Email is already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        phone,
        city,
        address,
        role: "USER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        imageUrl: true,
        phone: true,
        city: true,
        createdAt: true,
      },
    });

    const token = generateToken(user.id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user,
      token,
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Registration failed." });
  }
};

// تسجيل الدخول
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Email and password are required." });
    }

    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.isActive) {
      return res
        .status(401)
        .json({
          success: false,
          error: "Invalid email or account is inactive.",
        });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid password." });
    }

    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = generateToken(user.id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      imageUrl: user.imageUrl,
      phone: user.phone,
      city: user.city,
    };

    return res.json({
      success: true,
      message: "Logged in successfully.",
      user: safeUser,
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ success: false, error: "Login failed." });
  }
};

// جلب بيانات المستخدم الحالي
export const getMe = async (req, res) => {
  try {
    const user = await db.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        imageUrl: true,
        phone: true,
        city: true,
        address: true,
        createdAt: true,
        _count: {
          select: {
            savedCars: true,
            testDrives: true,
            reservations: true,
          },
        },
      },
    });

    return res.json({ success: true, user });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch profile." });
  }
};

// تسجيل الخروج
export const logout = (req, res) => {
  res.clearCookie("token");
  return res.json({ success: true, message: "Logged out successfully." });
};
```

---

### 2. `src/controllers/cars.controller.js`

````js
import db from "../config/db.js";
import { deleteS3Files } from "../utils/s3-helpers.js";
import { getGeminiModel } from "../config/gemini.js";

// جلب السيارات مع الفلاتر والترتيب والترقيم
export const getCars = async (req, res) => {
  try {
    const {
      search,
      make,
      model,
      bodyType,
      fuelType,
      transmission,
      condition,
      city,
      branchId,
      minPrice,
      maxPrice,
      minYear,
      maxYear,
      featured,
      status = "AVAILABLE",
      sortBy = "newest",
      page = 1,
      limit = 9,
    } = req.query;

    const where = {};

    if (status) where.status = status;
    if (featured === "true") where.featured = true;
    if (make) where.make = { equals: make, mode: "insensitive" };
    if (model) where.model = { contains: model, mode: "insensitive" };
    if (bodyType) where.bodyType = { equals: bodyType, mode: "insensitive" };
    if (fuelType) where.fuelType = { equals: fuelType, mode: "insensitive" };
    if (transmission)
      where.transmission = { equals: transmission, mode: "insensitive" };
    if (condition) where.condition = condition;
    if (city) where.city = { contains: city, mode: "insensitive" };
    if (branchId) where.branchId = branchId;

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (minYear || maxYear) {
      where.year = {};
      if (minYear) where.year.gte = parseInt(minYear);
      if (maxYear) where.year.lte = parseInt(maxYear);
    }

    if (search) {
      where.OR = [
        { make: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { color: { contains: search, mode: "insensitive" } },
      ];
    }

    let orderBy = { createdAt: "desc" };
    if (sortBy === "priceAsc") orderBy = { price: "asc" };
    else if (sortBy === "priceDesc") orderBy = { price: "desc" };
    else if (sortBy === "mileageAsc") orderBy = { mileage: "asc" };
    else if (sortBy === "yearDesc") orderBy = { year: "desc" };
    else if (sortBy === "popular") orderBy = { viewsCount: "desc" };

    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;

    const [cars, total] = await Promise.all([
      db.car.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          branch: { select: { name: true, city: true } },
          savedBy: req.user ? { where: { userId: req.user.id } } : false,
          _count: { select: { reviews: true } },
        },
      }),
      db.car.count({ where }),
    ]);

    const formattedCars = cars.map((c) => ({
      ...c,
      price: parseFloat(c.price),
      discountPrice: c.discountPrice ? parseFloat(c.discountPrice) : null,
      isWishlisted: req.user ? c.savedBy?.length > 0 : false,
      savedBy: undefined,
    }));

    return res.json({
      success: true,
      cars: formattedCars,
      pagination: {
        total,
        page: parseInt(page),
        limit: take,
        pages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error("Get Cars Error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch cars." });
  }
};

// جلب تفاصيل سيارة بواسطة المعرّف أو الـ slug
export const getCarById = async (req, res) => {
  try {
    const { idOrSlug } = req.params;

    const car = await db.car.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        branch: true,
        priceHistory: { orderBy: { changedAt: "desc" }, take: 5 },
        documents: true,
        reviews: {
          where: { approved: true },
          include: { user: { select: { name: true, imageUrl: true } } },
          orderBy: { createdAt: "desc" },
        },
        savedBy: req.user ? { where: { userId: req.user.id } } : false,
      },
    });

    if (!car) {
      return res.status(404).json({ success: false, error: "Car not found." });
    }

    // زيادة عدد المشاهدات
    await db.car.update({
      where: { id: car.id },
      data: { viewsCount: { increment: 1 } },
    });

    // تسجيل المشاهدة
    if (req.user || req.headers["x-session-id"]) {
      await db.carView
        .create({
          data: {
            carId: car.id,
            userId: req.user?.id || null,
            sessionId: req.headers["x-session-id"] || null,
          },
        })
        .catch(() => {});
    }

    return res.json({
      success: true,
      car: {
        ...car,
        price: parseFloat(car.price),
        discountPrice: car.discountPrice ? parseFloat(car.discountPrice) : null,
        isWishlisted: req.user ? car.savedBy?.length > 0 : false,
        savedBy: undefined,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch car." });
  }
};

// إضافة سيارة جديدة (أدمن فقط)
export const createCar = async (req, res) => {
  try {
    const data = req.body;
    const images = req.files ? req.files.map((f) => f.location) : [];

    const slug = `${data.make}-${data.model}-${data.year}-${Date.now()}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");

    const newCar = await db.car.create({
      data: {
        slug,
        vin: data.vin || null,
        make: data.make,
        model: data.model,
        trim: data.trim || null,
        year: parseInt(data.year),
        price: parseFloat(data.price),
        discountPrice: data.discountPrice
          ? parseFloat(data.discountPrice)
          : null,
        currency: data.currency || "EGP",
        mileage: parseInt(data.mileage),
        color: data.color,
        interiorColor: data.interiorColor || null,
        fuelType: data.fuelType,
        transmission: data.transmission,
        bodyType: data.bodyType,
        drivetrain: data.drivetrain || null,
        engineSize: data.engineSize ? parseFloat(data.engineSize) : null,
        horsepower: data.horsepower ? parseInt(data.horsepower) : null,
        seats: data.seats ? parseInt(data.seats) : null,
        doors: data.doors ? parseInt(data.doors) : null,
        condition: data.condition || "USED",
        city: data.city || null,
        branchId: data.branchId || null,
        description: data.description,
        features: Array.isArray(data.features)
          ? data.features
          : JSON.parse(data.features || "[]"),
        images,
        featured: data.featured === "true" || data.featured === true,
        status: data.status || "AVAILABLE",
      },
    });

    // تسجيل العملية في AuditLog
    await db.auditLog
      .create({
        data: {
          userId: req.user.id,
          action: "CAR_CREATED",
          entity: "Car",
          entityId: newCar.id,
          metadata: {
            make: newCar.make,
            model: newCar.model,
            price: newCar.price,
          },
        },
      })
      .catch(() => {});

    return res.status(201).json({ success: true, car: newCar });
  } catch (error) {
    console.error("Create Car Error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Failed to create car." });
  }
};

// تعديل بيانات سيارة وحفظ سجل الأسعار
export const updateCar = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const existingCar = await db.car.findUnique({ where: { id } });
    if (!existingCar) {
      return res.status(404).json({ success: false, error: "Car not found." });
    }

    // إذا تغير السعر، سجله في PriceHistory
    if (
      data.price &&
      parseFloat(data.price) !== parseFloat(existingCar.price)
    ) {
      await db.priceHistory.create({
        data: {
          carId: id,
          oldPrice: existingCar.price,
          newPrice: parseFloat(data.price),
        },
      });
    }

    const updated = await db.car.update({
      where: { id },
      data: {
        ...data,
        price: data.price ? parseFloat(data.price) : undefined,
        discountPrice: data.discountPrice
          ? parseFloat(data.discountPrice)
          : undefined,
        year: data.year ? parseInt(data.year) : undefined,
        mileage: data.mileage ? parseInt(data.mileage) : undefined,
      },
    });

    return res.json({ success: true, car: updated });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Failed to update car." });
  }
};

// حذف سيارة وصورها من AWS S3
export const deleteCar = async (req, res) => {
  try {
    const { id } = req.params;
    const car = await db.car.findUnique({ where: { id } });

    if (!car) {
      return res.status(404).json({ success: false, error: "Car not found." });
    }

    if (car.images && car.images.length > 0) {
      await deleteS3Files(car.images);
    }

    await db.car.delete({ where: { id } });

    await db.auditLog
      .create({
        data: {
          userId: req.user.id,
          action: "CAR_DELETED",
          entity: "Car",
          entityId: id,
        },
      })
      .catch(() => {});

    return res.json({
      success: true,
      message: "Car and associated S3 images deleted.",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Failed to delete car." });
  }
};

// حفظ / إلغاء حفظ في المفضلة
export const toggleSaveCar = async (req, res) => {
  try {
    const { carId } = req.params;
    const userId = req.user.id;

    const existing = await db.userSavedCar.findUnique({
      where: { userId_carId: { userId, carId } },
    });

    if (existing) {
      await db.userSavedCar.delete({
        where: { userId_carId: { userId, carId } },
      });
      return res.json({
        success: true,
        saved: false,
        message: "Removed from favorites.",
      });
    } else {
      await db.userSavedCar.create({
        data: { userId, carId },
      });
      return res.json({
        success: true,
        saved: true,
        message: "Added to favorites.",
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Failed to toggle favorite." });
  }
};

// تحليل صورة سيارة واستخراج مواصفاتها عبر Gemini AI
export const analyzeCarImage = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "No image uploaded" });
    }

    const model = getGeminiModel();
    const prompt = `Analyze this car image and return a strict JSON object with:
    {
      "make": "Manufacturer name",
      "bodyType": "SUV | Sedan | Hatchback | Coupe | Convertible | Truck",
      "color": "Dominant car color",
      "confidence": "HIGH | MEDIUM | LOW"
    }`;

    const imagePart = {
      inlineData: {
        data: req.file.buffer.toString("base64"),
        mimeType: req.file.mimetype,
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const cleaned = response
      .text()
      .replace(/```json|```/g, "")
      .trim();

    return res.json({ success: true, data: JSON.parse(cleaned) });
  } catch (error) {
    console.error("Gemini Error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Image analysis failed." });
  }
};
````

---

### 3. `src/controllers/dealership.controller.js`

```js
import db from "../config/db.js";

export const getDealershipInfo = async (req, res) => {
  try {
    let dealership = await db.dealershipInfo.findFirst({
      include: {
        workingHours: { orderBy: { dayOfWeek: "asc" } },
        branches: { where: { isActive: true } },
      },
    });

    if (!dealership) {
      dealership = await db.dealershipInfo.create({
        data: {
          name: "CarsAi Egypt",
          email: "mohnud0987@gmail.com",
          phone: "01009014597",
          address: "Egypt Cairo",
        },
        include: { workingHours: true, branches: true },
      });
    }

    return res.json({ success: true, dealership });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch dealership info." });
  }
};

export const updateDealershipInfo = async (req, res) => {
  try {
    const data = req.body;
    let dealership = await db.dealershipInfo.findFirst();

    if (!dealership) {
      dealership = await db.dealershipInfo.create({ data });
    } else {
      dealership = await db.dealershipInfo.update({
        where: { id: dealership.id },
        data,
      });
    }

    return res.json({ success: true, dealership });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Failed to update dealership info." });
  }
};
```

---

### 4. `src/controllers/testdrive.controller.js`

```js
import db from "../config/db.js";

// حجز موعد تجربة قيادة
export const bookTestDrive = async (req, res) => {
  try {
    const { carId, bookingDate, startTime, endTime, notes } = req.body;

    if (!carId || !bookingDate || !startTime || !endTime) {
      return res
        .status(400)
        .json({ success: false, error: "All booking details are required." });
    }

    // التحقق من عدم وجود حجز لنفس السيارة في نفس اليوم والوقت
    const conflict = await db.testDriveBooking.findFirst({
      where: {
        carId,
        bookingDate: new Date(bookingDate),
        startTime,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    if (conflict) {
      return res
        .status(400)
        .json({ success: false, error: "This time slot is already reserved." });
    }

    const booking = await db.testDriveBooking.create({
      data: {
        carId,
        userId: req.user.id,
        bookingDate: new Date(bookingDate),
        startTime,
        endTime,
        notes,
      },
      include: {
        car: { select: { make: true, model: true, year: true, images: true } },
      },
    });

    return res.status(201).json({ success: true, booking });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Failed to create booking." });
  }
};

// جلب حجوزات المستخدم
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await db.testDriveBooking.findMany({
      where: { userId: req.user.id },
      include: { car: true },
      orderBy: { bookingDate: "desc" },
    });
    return res.json({ success: true, bookings });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch bookings." });
  }
};

// تحديث حالة الحجز (أدمن)
export const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, cancelReason } = req.body;

    const booking = await db.testDriveBooking.update({
      where: { id },
      data: {
        status,
        cancelReason: cancelReason || null,
        confirmedAt: status === "CONFIRMED" ? new Date() : undefined,
        cancelledAt: status === "CANCELLED" ? new Date() : undefined,
      },
    });

    // إرسال إشعار للمستخدم
    await db.notification
      .create({
        data: {
          userId: booking.userId,
          type: "BOOKING_UPDATE",
          title: `Test Drive Booking ${status}`,
          body: `Your booking status has been updated to: ${status}`,
        },
      })
      .catch(() => {});

    return res.json({ success: true, booking });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Failed to update booking." });
  }
};
```

---

### 5. `src/controllers/inquiries.controller.js`

```js
import db from "../config/db.js";

// تقديم استفسار عن سيارة
export const createInquiry = async (req, res) => {
  try {
    const { carId, name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Name, email, and message are required.",
        });
    }

    const inquiry = await db.inquiry.create({
      data: {
        carId: carId || null,
        userId: req.user?.id || null,
        name,
        email,
        phone,
        message,
      },
    });

    return res.status(201).json({ success: true, inquiry });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Failed to submit inquiry." });
  }
};

// جلب جميع الاستفسارات (أدمن)
export const getInquiries = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const where = status ? { status } : {};

    const [inquiries, total] = await Promise.all([
      db.inquiry.findMany({
        where,
        include: {
          car: {
            select: { make: true, model: true, year: true, images: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: parseInt(limit),
      }),
      db.inquiry.count({ where }),
    ]);

    return res.json({ success: true, inquiries, total });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch inquiries." });
  }
};

// تحديث حالة الاستفسار
export const updateInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const inquiry = await db.inquiry.update({
      where: { id },
      data: { status },
    });

    return res.json({ success: true, inquiry });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Failed to update inquiry." });
  }
};
```

---

### 6. `src/controllers/reviews.controller.js`

```js
import db from "../config/db.js";

// إضافة تقييم سيارة
export const addReview = async (req, res) => {
  try {
    const { carId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ success: false, error: "Rating must be between 1 and 5." });
    }

    const review = await db.carReview.upsert({
      where: { userId_carId: { userId: req.user.id, carId } },
      create: {
        userId: req.user.id,
        carId,
        rating: parseInt(rating),
        comment,
        approved: false, // يتطلب موافقة الأدمن
      },
      update: {
        rating: parseInt(rating),
        comment,
        approved: false,
      },
    });

    return res.json({
      success: true,
      review,
      message: "Review submitted and pending admin approval.",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Failed to submit review." });
  }
};

// موافقة أو رفض التقييم (أدمن)
export const moderateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { approved } = req.body;

    const review = await db.carReview.update({
      where: { id },
      data: { approved: Boolean(approved) },
    });

    return res.json({ success: true, review });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Failed to moderate review." });
  }
};
```

---

### 7. `src/controllers/extra.controller.js`

```js
import db from "../config/db.js";

// مقارنة السيارات (Car Comparison)
export const compareCars = async (req, res) => {
  try {
    const { carIds } = req.body; // مصفوفة معرفات [id1, id2, id3]

    if (!carIds || !Array.isArray(carIds) || carIds.length < 2) {
      return res
        .status(400)
        .json({
          success: false,
          error: "Provide at least 2 car IDs to compare.",
        });
    }

    const cars = await db.car.findMany({
      where: { id: { in: carIds.slice(0, 4) } },
      include: { branch: true },
    });

    return res.json({ success: true, cars });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Comparison failed." });
  }
};

// طلب تمويل وتقسيط (Finance Application)
export const submitFinance = async (req, res) => {
  try {
    const {
      carId,
      downPayment,
      loanTermMonths,
      monthlyIncome,
      employmentType,
      employerName,
    } = req.body;

    const car = await db.car.findUnique({ where: { id: carId } });
    if (!car)
      return res.status(404).json({ success: false, error: "Car not found" });

    // حساب تقريبي للقسط الشهري بفائدة سنوية 12%
    const loanAmount = parseFloat(car.price) - parseFloat(downPayment);
    const monthlyRate = 0.12 / 12;
    const estimatedInstallment =
      (loanAmount * monthlyRate) /
      (1 - Math.pow(1 + monthlyRate, -loanTermMonths));

    const app = await db.financeApplication.create({
      data: {
        carId,
        userId: req.user.id,
        downPayment: parseFloat(downPayment),
        loanTermMonths: parseInt(loanTermMonths),
        monthlyIncome: parseFloat(monthlyIncome),
        employmentType,
        employerName,
        estimatedInstallment,
      },
    });

    return res.status(201).json({ success: true, application: app });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Failed to submit finance request." });
  }
};

// طلب بيع / استبدال سيارة (Trade-in)
export const submitTradeIn = async (req, res) => {
  try {
    const data = req.body;
    const images = req.files ? req.files.map((f) => f.location) : [];

    const request = await db.tradeInRequest.create({
      data: {
        userId: req.user.id,
        make: data.make,
        model: data.model,
        year: parseInt(data.year),
        mileage: parseInt(data.mileage),
        color: data.color,
        condition: data.condition,
        description: data.description,
        expectedPrice: data.expectedPrice
          ? parseFloat(data.expectedPrice)
          : null,
        images,
      },
    });

    return res.status(201).json({ success: true, request });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Failed to submit trade-in request." });
  }
};

// الاشتراك في النشرة البريدية
export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res
        .status(400)
        .json({ success: false, error: "Email is required." });

    await db.newsletterSubscriber.upsert({
      where: { email: email.toLowerCase() },
      create: { email: email.toLowerCase() },
      update: { isActive: true },
    });

    return res.json({ success: true, message: "Subscribed successfully!" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Subscription failed." });
  }
};

// إحصائيات لوحة تحكم الأدمن (Admin Dashboard Analytics)
export const getAdminAnalytics = async (req, res) => {
  try {
    const [
      totalCars,
      availableCars,
      soldCars,
      totalUsers,
      totalBookings,
      totalInquiries,
    ] = await Promise.all([
      db.car.count(),
      db.car.count({ where: { status: "AVAILABLE" } }),
      db.car.count({ where: { status: "SOLD" } }),
      db.user.count({ where: { role: "USER" } }),
      db.testDriveBooking.count(),
      db.inquiry.count(),
    ]);

    const popularCars = await db.car.findMany({
      orderBy: { viewsCount: "desc" },
      take: 5,
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        viewsCount: true,
        price: true,
      },
    });

    return res.json({
      success: true,
      stats: {
        totalCars,
        availableCars,
        soldCars,
        totalUsers,
        totalBookings,
        totalInquiries,
        popularCars,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Failed to fetch analytics." });
  }
};
```

---

## 📄 الخطوة 10: ملفات المسارات (Routes)

### 1. `src/routes/auth.routes.js`

```js
import express from "express";
import {
  register,
  login,
  getMe,
  logout,
} from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/me", requireAuth, getMe);
router.post("/logout", logout);

export default router;
```

### 2. `src/routes/cars.routes.js`

```js
import express from "express";
import {
  getCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  toggleSaveCar,
  analyzeCarImage,
} from "../controllers/cars.controller.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";
import {
  uploadCarImagesToS3,
  uploadSingleImageMemory,
} from "../middleware/upload.js";
import { aiLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.get("/", optionalAuth, getCars);
router.get("/:idOrSlug", optionalAuth, getCarById);
router.post(
  "/analyze-image",
  aiLimiter,
  uploadSingleImageMemory.single("image"),
  analyzeCarImage,
);

// مسارات تتطلب تسجيل دخول
router.post("/:carId/toggle-save", requireAuth, toggleSaveCar);

// مسارات الأدمن فقط
router.post(
  "/",
  requireAdmin,
  uploadCarImagesToS3.array("images", 10),
  createCar,
);
router.put("/:id", requireAdmin, updateCar);
router.delete("/:id", requireAdmin, deleteCar);

export default router;
```

### 3. `src/routes/extra.routes.js`

```js
import express from "express";
import {
  compareCars,
  submitFinance,
  submitTradeIn,
  subscribeNewsletter,
  getAdminAnalytics,
} from "../controllers/extra.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { requireAdmin } from "../middleware/admin.js";
import { uploadCarImagesToS3 } from "../middleware/upload.js";

const router = express.Router();

router.post("/compare", compareCars);
router.post("/newsletter", subscribeNewsletter);
router.post("/finance", requireAuth, submitFinance);
router.post(
  "/trade-in",
  requireAuth,
  uploadCarImagesToS3.array("images", 5),
  submitTradeIn,
);
router.get("/admin/analytics", requireAdmin, getAdminAnalytics);

export default router;
```

---

## 📄 الخطوة 11: نقطة الانطلاق الرئيسية `src/index.js`

```js
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

// استيراد المسارات
import authRoutes from "./routes/auth.routes.js";
import carRoutes from "./routes/cars.routes.js";
import dealershipRoutes from "./routes/dealership.routes.js";
import testDriveRoutes from "./routes/testdrive.routes.js";
import inquiryRoutes from "./routes/inquiries.routes.js";
import extraRoutes from "./routes/extra.routes.js";
import { generalLimiter } from "./middleware/rateLimiter.js";

const app = express();
const PORT = process.env.PORT || 5000;

// إعدادات الحماية والـ Middleware
app.use(helmet());
app.use(morgan("dev"));
app.use(generalLimiter);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// إعدادات CORS للسماح بالاتصال مع الفرونت إند
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);

// فحص صحة الخادم
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// تفعيل المسارات
app.use("/api/auth", authRoutes);
app.use("/api/listings", carRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/dealership", dealershipRoutes);
app.use("/api/test-drives", testDriveRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api", extraRoutes);

// معالجة المسارات غير الموجودة (404)
app.use((req, res) => {
  res.status(404).json({ success: false, error: "API route not found" });
});

// معالجة الأخطاء العامة
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 CarsAI Backend running on http://localhost:${PORT}`);
});
```

---

## 📄 الخطوة 12: سكريبت إنشاء حساب الأدمن والبيانات الأولية `prisma/seed.js`

قم بإنشاء ملف `prisma/seed.js`:

```js
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Database Seeding...");

  // 1. إنشاء حساب الأدمن
  const adminPassword = await bcrypt.hash("admin123456", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@carsai.com" },
    update: {},
    create: {
      email: "admin@carsai.com",
      name: "Super Admin",
      password: adminPassword,
      role: "ADMIN",
      phone: "01009014597",
    },
  });
  console.log("✅ Admin user ready:", admin.email);

  // 2. إنشاء بيانات المعرض
  const dealership = await prisma.dealershipInfo.upsert({
    where: { id: "dealership-default-id" },
    update: {},
    create: {
      id: "dealership-default-id",
      name: "CarsAi Egypt",
      email: "mohnud0987@gmail.com",
      phone: "01009014597",
      address: "Cairo, Egypt",
    },
  });
  console.log("✅ Dealership info ready:", dealership.name);

  // 3. إنشاء ساعات العمل
  const days = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ];
  for (const day of days) {
    await prisma.workingHour.upsert({
      where: {
        dealershipId_dayOfWeek: {
          dealershipId: dealership.id,
          dayOfWeek: day,
        },
      },
      update: {},
      create: {
        dealershipId: dealership.id,
        dayOfWeek: day,
        openTime: "09:00",
        closeTime: "21:00",
        isOpen: day !== "FRIDAY",
      },
    });
  }
  console.log("✅ Working hours seeded.");

  console.log("🎉 Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

لتشغيل الـ Seed:

```bash
node prisma/seed.js
```

---

## 🔧 الخطوة 13: تعديلات الـ Frontend بالكامل

### 1. استبدال مكون الـ Header (بديل Clerk بالكامل)

في `front/components/Header.jsx`:

```jsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { LogOut, User, Car, Calendar, Shield } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo-black.png"
            alt="CarsAI"
            width={120}
            height={40}
            className="dark:hidden"
          />
          <Image
            src="/logo-white.png"
            alt="CarsAI"
            width={120}
            height={40}
            className="hidden dark:block"
          />
        </Link>

        <nav className="flex items-center gap-4">
          <Link href="/cars" className="text-sm font-medium hover:text-primary">
            Browse Cars
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 text-sm font-semibold rounded-full border p-1 pr-3 hover:bg-accent"
              >
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  {user.name ? user.name[0].toUpperCase() : "U"}
                </div>
                <span>{user.name || "My Account"}</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border bg-card p-2 shadow-lg z-50">
                  {user.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent text-primary font-bold"
                    >
                      <Shield className="w-4 h-4" /> Admin Portal
                    </Link>
                  )}
                  <Link
                    href="/saved-cars"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent"
                  >
                    <Car className="w-4 h-4" /> Saved Cars
                  </Link>
                  <Link
                    href="/reservations"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-accent"
                  >
                    <Calendar className="w-4 h-4" /> Reservations
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-destructive/10 text-destructive font-medium"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/sign-in"
                className="text-sm font-medium px-4 py-2 rounded-lg border hover:bg-accent"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="text-sm font-medium px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90"
              >
                Sign Up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
```

### 2. البحث بالصورة بالذكاء الاصطناعي `front/components/home-search.jsx`

```jsx
"use client";

import { useState } from "react";
import fetchAPI from "@/lib/api";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function HomeSearch() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setLoading(true);
    try {
      const res = await fetchAPI("/home/search-by-image", {
        method: "POST",
        body: formData,
      });

      if (res.success && res.data) {
        const { make, bodyType, color } = res.data;
        toast.success(`Identified: ${make || ""} ${bodyType || ""}`);
        router.push(
          `/cars?make=${make || ""}&bodyType=${bodyType || ""}&search=${color || ""}`,
        );
      }
    } catch (err) {
      toast.error(err.message || "Failed to analyze image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center">
      <label className="cursor-pointer flex items-center gap-2 bg-secondary px-4 py-2.5 rounded-xl border hover:bg-secondary/80 font-medium text-sm">
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        ) : (
          <Camera className="w-4 h-4 text-primary" />
        )}
        <span>Search by Car Photo (AI)</span>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
          disabled={loading}
        />
      </label>
    </div>
  );
}
```

### 3. زر حفظ السيارة في المفضلة `front/components/car-card.jsx`

```jsx
import fetchAPI from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Heart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function WishlistButton({ carId, initialWishlisted }) {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(initialWishlisted);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to save cars");
      return;
    }

    setLoading(true);
    try {
      const res = await fetchAPI(`/listings/${carId}/toggle-save`, {
        method: "POST",
      });
      setIsSaved(res.saved);
      toast.success(res.message);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`p-2 rounded-full border shadow-sm transition ${
        isSaved
          ? "bg-red-500 text-white border-red-500"
          : "bg-background text-muted-foreground hover:text-red-500"
      }`}
    >
      <Heart className={`w-4 h-4 ${isSaved ? "fill-white" : ""}`} />
    </button>
  );
}
```

---

## ⚡ الخطوة 14: تقنية متقدمة: الرفع المباشر عبر S3 Presigned URLs

> [!TIP]
> إذا كان لديك عدد صور كبير وتريد **عدم إرهاق خادم Express** برفع الملفات، يمكنك استخدام استراتيجية **Presigned URLs**:
>
> 1. المتصفح يطلب رابط رفع مؤقت من Express.
> 2. Express يولد رابط `PUT` موقع ومؤقت صالح لـ 5 دقائق.
> 3. المتصفح يرفع الصورة مباشرة من جهاز العميل إلى S3!

### 1. دالة توليد الرابط في الباك إند:

```js
// src/controllers/cars.controller.js
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "../config/s3.js";
import { v4 as uuidv4 } from "uuid";

export const getUploadPresignedUrl = async (req, res) => {
  try {
    const { contentType, fileExtension } = req.body;
    const carId = req.query.carId || uuidv4();
    const key = `cars/${carId}/image-${Date.now()}-${uuidv4().slice(0, 6)}.${fileExtension || "jpg"}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      ContentType: contentType || "image/jpeg",
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 300,
    });
    const finalImageUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return res.json({ success: true, presignedUrl, finalImageUrl, carId });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
```

### 2. الرفع المباشر من الفرونت إند:

```js
// front/lib/s3-direct-upload.js
export async function uploadDirectlyToS3(file, carId) {
  const ext = file.name.split(".").pop();

  // 1. طلب الرابط الموقع من السيرفر
  const { presignedUrl, finalImageUrl } = await fetchAPI(
    `/cars/upload-url?carId=${carId || ""}`,
    {
      method: "POST",
      body: JSON.stringify({ contentType: file.type, fileExtension: ext }),
    },
  );

  // 2. الرفع مباشرة إلى AWS S3
  const res = await fetch(presignedUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  if (!res.ok) throw new Error("Failed to upload to S3 directly");
  return finalImageUrl;
}
```

---

## 🧪 الخطوة 15: اختبار الـ API بـ Postman / Thunder Client

يمكنك حفظ الـ JSON التالي واستيراده مباشرة في **Postman** أو **Thunder Client (VS Code)**:

```json
{
  "info": {
    "name": "CarsAI Express API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "http://localhost:5000/api/auth/register",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"John Doe\",\n  \"email\": \"john@example.com\",\n  \"password\": \"password123\"\n}",
              "options": { "raw": { "language": "json" } }
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "url": "http://localhost:5000/api/auth/login",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"admin@carsai.com\",\n  \"password\": \"admin123456\"\n}",
              "options": { "raw": { "language": "json" } }
            }
          }
        },
        {
          "name": "Get Profile (Me)",
          "request": {
            "method": "GET",
            "url": "http://localhost:5000/api/auth/me",
            "header": [
              { "key": "Authorization", "value": "Bearer {{JWT_TOKEN}}" }
            ]
          }
        }
      ]
    },
    {
      "name": "Listings",
      "item": [
        {
          "name": "Get Cars (Filter)",
          "request": {
            "method": "GET",
            "url": "http://localhost:5000/api/listings?make=Toyota&sortBy=priceAsc&page=1&limit=6"
          }
        },
        {
          "name": "Get Car Filters",
          "request": {
            "method": "GET",
            "url": "http://localhost:5000/api/listings/filters"
          }
        }
      ]
    }
  ]
}
```

---

## 🛠️ الخطوة 16: دليل استكشاف الأخطاء الشائعة (Troubleshooting)

| الخطأ                                  | السبب المحتمل                                             | الحل                                                                      |
| -------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------- |
| `AccessDenied on S3 Upload`            | صلاحيات الـ IAM User أو اسم الـ Bucket غير صحيح           | تأكد من إضافة `s3:PutObject` و `s3:DeleteObject` للـ IAM User.            |
| `Images not displaying (Broken links)` | الـ S3 Bucket مغلق للقراءة العامة                         | أضف الـ Bucket Policy المذكورة في الخطوة 3 لفتح القراءة (`s3:GetObject`). |
| `CORS Error in Browser`                | السيرفر لا يسمح بنطاق الفرونت أو غياب `credentials: true` | تأكد من مطابقة `FRONTEND_URL` في ملف `.env` ووجود `credentials: true`.    |
| `JWT Expired / Unauthorized`           | انتهاء صلاحية الرمز                                       | يقوم الـ Auth Context بطلب تسجيل الدخول مجدداً أو تجديد الـ Token.        |

---

## 🌐 الخطوة 17: دليل النشر السحابي (Deployment Guide)

### 1. نشر الباك إند (Express.js) على Render / VPS

1. قم بإنشاء Web Service وأدخل المتغيرات من ملف `.env`.
2. أمر البناء:
   ```bash
   npm install && npx prisma generate
   ```
3. أمر التشغيل:
   ```bash
   npm start
   ```

### 2. نشر الفرونت إند (Next.js) على Vercel

1. في إعدادات البيئة (Environment Variables) أضف:
   ```env
   NEXT_PUBLIC_API_URL=https://your-express-backend.onrender.com/api
   ```
2. تأكد من تحديث `FRONTEND_URL` في الباك إند ليطابق رابط Vercel الخاص بمشروعك للسماح بالـ CORS.
