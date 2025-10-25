# AI-Powered Review System - Technical Summary

## System Overview

This document provides a high-level technical summary of the AI-powered review and sentiment analysis system integrated into the SaaS dashboard.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         User Interface (Next.js)                    │
│  ┌───────────────┐  ┌───────────────┐  ┌──────────────────────┐   │
│  │ Submit Review │  │  View Reviews │  │ Analytics Dashboard  │   │
│  │   Form        │  │   List        │  │   (Admin Only)       │   │
│  └───────┬───────┘  └───────┬───────┘  └──────────┬───────────┘   │
│          │                   │                      │               │
└──────────┼───────────────────┼──────────────────────┼───────────────┘
           │                   │                      │
           ▼                   ▼                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       API Layer (Next.js API Routes)                │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  POST /api/reviews                 GET /api/reviews          │  │
│  │  - Auth check (NextAuth)           - Fetch all reviews       │  │
│  │  - Rate limiting (5/min)           - Include sentiment data  │  │
│  │  - Validate input                  - Return JSON             │  │
│  │  - Analyze sentiment               - No auth required        │  │
│  │  - Persist to database                                       │  │
│  └──────────────┬────────────────────────────┬──────────────────┘  │
│                 │                            │                      │
└─────────────────┼────────────────────────────┼──────────────────────┘
                  │                            │
                  ▼                            │
         ┌────────────────────┐               │
         │  AI Analysis Layer │               │
         │   (lib/ai.ts)      │               │
         └────────┬───────────┘               │
                  │                            │
          ┌───────┼───────────┐               │
          │       │           │               │
          ▼       ▼           ▼               │
     ┌─────┐  ┌─────┐  ┌──────────┐          │
     │ GPT │  │  HF │  │Heuristic │          │
     │ 4o  │  │ API │  │ Keyword  │          │
     └─────┘  └─────┘  └──────────┘          │
        │        │           │                │
        └────────┴───────────┘                │
                 │                            │
                 ▼                            │
         ┌──────────────┐                    │
         │ Sentiment    │                    │
         │ Result       │                    │
         │ - score      │                    │
         │ - label      │                    │
         │ - confidence │                    │
         └──────┬───────┘                    │
                │                            │
                ▼                            ▼
┌───────────────────────────────────────────────────────────────────┐
│                    Database Layer (PostgreSQL + Prisma)           │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Review Table                                               │ │
│  │  - text, rating, userId                                     │ │
│  │  - sentimentScore (-1 to 1)                                 │ │
│  │  - sentimentLabel (POSITIVE/NEGATIVE/NEUTRAL)               │ │
│  │  - feedbackCategory (PRODUCT/SERVICE/DELIVERY/OTHER)        │ │
│  │  - aiConfidence (0 to 1)                                    │ │
│  │  - analyzedAt (timestamp)                                   │ │
│  │  - indexes on userId, sentimentLabel, analyzedAt            │ │
│  └─────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. Frontend (`/reviews` Page)

**File**: `app/reviews/page.tsx`

**Features**:
- **Review Submission Form**: Text input, rating selector (1-5), optional category dropdown
- **Review List**: Displays all reviews with sentiment labels, scores, confidence, timestamps
- **Admin Analytics**: Conditional rendering of charts for users with `ADMIN` role
- **Real-time Feedback**: Shows sentiment analysis result immediately after submission

**Tech Stack**:
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- React hooks (useState, useEffect, useMemo)

**User Flow**:
1. User enters review text and rating
2. Submits form → POST to `/api/reviews`
3. Server analyzes sentiment and persists data
4. Page refreshes list to show new review with sentiment badge

---

### 2. Analytics Dashboard (Admin Only)

**File**: `app/reviews/components/ReviewAnalytics.tsx`

**Features**:
- **Pie Chart**: Shows percentage distribution (Positive / Negative / Neutral)
- **Bar Chart**: Shows absolute counts for each sentiment category
- **Color-Coded**: Green (positive), Red (negative), Gray (neutral)

**Tech Stack**:
- Recharts 2.x
- TypeScript interfaces for type safety

**Data Processing**:
```typescript
const counts = { POSITIVE: 0, NEGATIVE: 0, NEUTRAL: 0 };
reviews.forEach(r => {
  const label = r.sentimentLabel || 'NEUTRAL';
  counts[label]++;
});
```

**Visualization**:
- `<PieChart>` with `<Cell>` elements for custom colors
- `<BarChart>` with `<XAxis>`, `<YAxis>`, `<CartesianGrid>`

---

### 3. API Endpoints

#### POST `/api/reviews`

**File**: `app/api/reviews/route.ts`

**Features**:
- **Authentication**: Requires valid NextAuth session
- **Rate Limiting**: 5 reviews per user per minute (in-memory Map)
- **Input Validation**: Checks `text` length (min 3 chars), optional `rating` and `feedbackCategory`
- **Sentiment Analysis**: Calls `analyzeSentiment(text)` from `lib/ai.ts`
- **Database Persistence**: Creates Review record with sentiment fields and legacy compatibility

**Request**:
```json
{
  "text": "Great product, fast delivery!",
  "rating": 5,
  "feedbackCategory": "PRODUCT"
}
```

**Response** (Success):
```json
{
  "message": "Review created",
  "review": {
    "id": "uuid",
    "text": "Great product, fast delivery!",
    "sentiment": "POSITIVE",
    "sentimentScore": 0.92,
    "sentimentLabel": "POSITIVE",
    "feedbackCategory": "PRODUCT",
    "aiConfidence": 0.95
  }
}
```

**Response** (Rate Limit):
```json
{ "error": "Too many reviews. Please try again in a moment." }
```

#### GET `/api/reviews`

**File**: `app/api/reviews/route.ts`

**Features**:
- No authentication required (public list)
- Returns all reviews with sentiment data
- Ordered by `createdAt` DESC

**Response**:
```json
{
  "reviews": [
    {
      "id": "uuid",
      "userId": "uuid",
      "text": "Amazing service!",
      "rating": 5,
      "sentimentScore": 0.98,
      "sentimentLabel": "POSITIVE",
      "feedbackCategory": "SERVICE",
      "aiConfidence": 0.99,
      "analyzedAt": "2024-01-15T10:30:00Z",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### 4. AI Sentiment Analysis

**File**: `lib/ai.ts`

**Function**: `analyzeSentiment(text: string): Promise<SentimentResult>`

**3-Tier Fallback System**:

1. **Tier 1: OpenAI GPT-4o-mini**
   - Uses Chat Completions API with structured JSON output
   - Best accuracy for nuanced/sarcastic text
   - Requires `OPENAI_API_KEY`

2. **Tier 2: HuggingFace Inference**
   - Uses `distilbert-base-uncased-finetuned-sst-2-english` model
   - Fast and reliable binary classifier (POSITIVE/NEGATIVE)
   - Requires `HF_ACCESS_TOKEN`

3. **Tier 3: Heuristic (Keyword-Based)**
   - Counts positive/negative keywords in text
   - Always available (no API dependencies)
   - Lower accuracy but functional offline

**Output**:
```typescript
{
  score: number;      // -1 (very negative) to 1 (very positive)
  label: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  confidence: number; // 0 (uncertain) to 1 (highly confident)
}
```

**Error Handling**:
- All tiers have try-catch blocks
- Logs errors and falls through to next tier
- Guarantees a result (heuristic never fails)

---

### 5. Database Schema

**File**: `prisma/schema.prisma`

**Review Model**:
```prisma
model Review {
  id                String            @id @default(uuid())
  userId            String
  text              String
  rating            Int?
  sentiment         String?           // Legacy
  category          String?           // Legacy
  sentimentScore    Float?            // -1 to 1
  sentimentLabel    SentimentLabel?   // POSITIVE/NEGATIVE/NEUTRAL
  feedbackCategory  FeedbackCategory? // PRODUCT/SERVICE/DELIVERY/OTHER
  aiConfidence      Float?            // 0 to 1
  analyzedAt        DateTime?
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([sentimentLabel])
  @@index([analyzedAt])
}

enum SentimentLabel {
  POSITIVE
  NEGATIVE
  NEUTRAL
}

enum FeedbackCategory {
  PRODUCT
  SERVICE
  DELIVERY
  OTHER
}
```

**Indexes**:
- `userId`: For user-specific review queries
- `sentimentLabel`: For analytics aggregations
- `analyzedAt`: For time-series analysis

---

## Security and Rate Limiting

### Authentication

- **NextAuth Session**: Required for POST `/api/reviews`
- **User ID Extraction**: `session.user.id` links reviews to users
- **Role-Based Access**: Admin-only analytics view

### Rate Limiting

- **Implementation**: In-memory Map with sliding window
- **Limit**: 5 reviews per user per minute
- **Key**: `userId`
- **Response**: 429 with error message

**Code**:
```typescript
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const MAX_REVIEWS_PER_MINUTE = 5;

const now = Date.now();
const userLimit = rateLimits.get(userId);

if (userLimit && userLimit.resetAt > now) {
  if (userLimit.count >= MAX_REVIEWS_PER_MINUTE) {
    return NextResponse.json(
      { error: "Too many reviews. Please try again in a moment." },
      { status: 429 }
    );
  }
  userLimit.count++;
} else {
  rateLimits.set(userId, { count: 1, resetAt: now + 60000 });
}
```

**Note**: In-memory rate limiting resets on server restart. For production, consider Redis or database-backed rate limiting.

---

## Deployment Considerations

### Environment Variables

Required in production:
```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# NextAuth
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://yourdomain.com

# AI Providers (optional but recommended)
OPENAI_API_KEY=sk-...
HF_ACCESS_TOKEN=hf_...
```

### Database Migration

Run after deploying schema changes:
```bash
npm run db:push
# or for production migrations
npm run db:migrate
```

### Vercel Deployment

- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Environment Variables**: Add in Vercel dashboard
- **Prisma**: `postinstall` hook generates client automatically

### Performance Optimization

- **API Caching**: Consider caching GET `/api/reviews` with revalidation
- **Pagination**: Add pagination for large review datasets
- **Database Indexes**: Already optimized for sentiment queries
- **Edge Functions**: Consider using Edge Runtime for faster API responses

---

## Monitoring and Analytics

### Key Metrics

1. **Review Volume**: Total reviews submitted per day/week/month
2. **Sentiment Distribution**: % positive, negative, neutral
3. **AI Tier Usage**: Track which AI tier is used (logs in console)
4. **Average Confidence**: Indicates AI reliability
5. **Category Breakdown**: Reviews by feedback category

### Example Queries

**Sentiment Distribution**:
```sql
SELECT
  sentimentLabel,
  COUNT(*) AS count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) AS percentage
FROM "Review"
GROUP BY sentimentLabel;
```

**Low Confidence Reviews**:
```sql
SELECT text, sentimentLabel, aiConfidence, analyzedAt
FROM "Review"
WHERE aiConfidence < 0.7
ORDER BY aiConfidence ASC
LIMIT 20;
```

**Reviews Over Time**:
```sql
SELECT
  DATE(createdAt) AS date,
  sentimentLabel,
  COUNT(*) AS count
FROM "Review"
WHERE createdAt > NOW() - INTERVAL '30 days'
GROUP BY DATE(createdAt), sentimentLabel
ORDER BY date DESC;
```

---

## Testing Strategy

### Unit Tests

- `lib/ai.ts`: Test each AI tier independently
- `app/api/reviews/route.ts`: Mock Prisma and session

### Integration Tests

- Submit reviews via API and verify database persistence
- Test rate limiting with rapid submissions
- Verify analytics calculations

### E2E Tests

- Full user flow: login → submit review → view in list → check analytics (admin)
- Test sentiment accuracy with known positive/negative samples

---

## Future Enhancements

1. **Advanced Analytics**:
   - Time-series trends (sentiment over time)
   - Category-specific sentiment (e.g., "SERVICE" is positive but "DELIVERY" is negative)
   - Confidence histograms

2. **User Feedback Loop**:
   - "Was this sentiment correct?" button
   - Store corrections for model fine-tuning

3. **Notifications**:
   - Alert admins when negative reviews are detected
   - Slack/email integration

4. **Export**:
   - CSV export with sentiment data
   - PDF reports for stakeholders

5. **Multi-Language Support**:
   - Detect language and route to appropriate model
   - Support non-English reviews

6. **Aspect-Based Sentiment**:
   - Analyze sentiment for specific aspects (price, quality, service)
   - More granular insights

---

## Related Documentation

- **[REVIEW_ANALYTICS_SETUP.md](./REVIEW_ANALYTICS_SETUP.md)**: Detailed setup instructions
- **[SENTIMENT_LOGIC.md](./SENTIMENT_LOGIC.md)**: Deep dive into AI analysis pipeline
- **[COMPLETE_SETUP_GUIDE.md](./COMPLETE_SETUP_GUIDE.md)**: Full project setup guide
- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)**: Database and Prisma configuration
- **[NEXTAUTH_SETUP.md](./NEXTAUTH_SETUP.md)**: Authentication setup

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set environment variables
cp .env.example .env
# Add DATABASE_URL, NEXTAUTH_SECRET, OPENAI_API_KEY, HF_ACCESS_TOKEN

# 3. Run database migrations
npm run db:push

# 4. Start development server
npm run dev

# 5. Test review submission
# Navigate to http://localhost:3000/reviews
# Submit a review and verify sentiment analysis
```

---

## Support

For questions or issues:
1. Check [REVIEW_ANALYTICS_SETUP.md](./REVIEW_ANALYTICS_SETUP.md) troubleshooting section
2. Review code comments in `lib/ai.ts` and `app/api/reviews/route.ts`
3. Open a GitHub issue with logs and reproduction steps

---

**System Status**: ✅ Fully Implemented and Production-Ready (pending DATABASE_URL configuration)
