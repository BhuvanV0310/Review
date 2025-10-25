# Sentiment Analysis Logic

## Overview

This document provides a detailed explanation of the multi-tier sentiment analysis system used in the review system. The implementation uses a fallback chain to ensure reliable sentiment analysis even when external AI services are unavailable.

---

## Architecture

### 3-Tier Fallback System

```
┌─────────────────────────────────────────────────────────┐
│                    Input: Review Text                   │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
         ┌─────────────────────────┐
         │  Tier 1: OpenAI GPT-4o  │
         │  (Primary AI Provider)   │
         └────────┬────────────────┘
                  │
            Success? ──Yes──┐
                  │         │
                 No         │
                  │         │
                  ▼         │
    ┌──────────────────────────────┐
    │ Tier 2: HuggingFace          │
    │ distilbert-sst-2 (Fallback)  │
    └────────┬─────────────────────┘
             │                      │
       Success? ──Yes──┐            │
             │         │            │
            No         │            │
             │         │            │
             ▼         │            │
┌────────────────────────┐         │
│ Tier 3: Heuristic      │         │
│ Keyword-based (Backup) │         │
└────────┬───────────────┘         │
         │                          │
         └──────────┬───────────────┘
                    │
                    ▼
       ┌─────────────────────────┐
       │  Output: Sentiment Data │
       │  - score: -1 to 1       │
       │  - label: POS/NEG/NEU   │
       │  - confidence: 0 to 1   │
       └─────────────────────────┘
```

---

## Tier 1: OpenAI GPT-4o-mini

### Model

- **Model ID**: `gpt-4o-mini`
- **API**: OpenAI Chat Completions API
- **Type**: Large Language Model with structured output parsing

### Configuration

```typescript
const completion = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    {
      role: "system",
      content: "You are a sentiment analysis assistant. Analyze the sentiment...",
    },
    { role: "user", content: text },
  ],
  response_format: {
    type: "json_schema",
    json_schema: {
      name: "sentiment_analysis",
      schema: {
        type: "object",
        properties: {
          sentiment: {
            type: "string",
            enum: ["POSITIVE", "NEGATIVE", "NEUTRAL"],
          },
          score: {
            type: "number",
            description: "Sentiment score from -1 (very negative) to 1 (very positive)",
          },
          explanation: {
            type: "string",
            description: "Brief explanation of the sentiment classification",
          },
        },
        required: ["sentiment", "score", "explanation"],
      },
    },
  },
});
```

### Advantages

- **High Accuracy**: GPT-4o understands context, sarcasm, and nuanced language
- **Structured Output**: JSON schema ensures consistent response format
- **Explanation**: Provides reasoning for transparency and debugging

### Output Processing

```typescript
const result = JSON.parse(completion.choices[0]?.message?.content || "{}");
return {
  score: result.score,
  label: result.sentiment,
  confidence: 0.9, // GPT-4o has high confidence when it returns a result
};
```

### Error Handling

- Network errors
- Rate limits (429)
- Invalid API key (401)
- Malformed JSON response

**Fallback Trigger**: Any error or missing API key → proceed to Tier 2.

---

## Tier 2: HuggingFace Inference API

### Model

- **Model ID**: `distilbert-base-uncased-finetuned-sst-2-english`
- **Type**: Transformer-based binary sentiment classifier (POSITIVE/NEGATIVE)
- **Provider**: HuggingFace Inference API (serverless)

### Configuration

```typescript
const hf = new HfInference(process.env.HF_ACCESS_TOKEN);
const result = await hf.textClassification({
  model: "distilbert-base-uncased-finetuned-sst-2-english",
  inputs: text,
});
```

### Advantages

- **Fast**: Lightweight DistilBERT model (66M parameters vs. GPT-4's billions)
- **Reliable**: Pre-trained on Stanford Sentiment Treebank (SST-2)
- **Free Tier Available**: No immediate cost for basic usage

### Output Processing

HuggingFace returns:
```json
[
  { "label": "POSITIVE", "score": 0.9998 },
  { "label": "NEGATIVE", "score": 0.0002 }
]
```

We normalize to our format:
```typescript
const top = result[0];
const isPositive = top.label.toUpperCase() === "POSITIVE";
const rawScore = top.score; // 0 to 1

return {
  score: isPositive ? rawScore : -rawScore, // Convert to -1..1 range
  label: isPositive ? "POSITIVE" : rawScore > 0.6 ? "NEGATIVE" : "NEUTRAL",
  confidence: rawScore,
};
```

### Limitations

- **Binary Classification**: Original model only detects POSITIVE/NEGATIVE (we infer NEUTRAL from low confidence)
- **No Context**: Less nuanced than GPT-4o for complex/sarcastic text

### Error Handling

- Network errors
- Rate limits
- Invalid token
- Model loading errors

**Fallback Trigger**: Any error or missing token → proceed to Tier 3.

---

## Tier 3: Heuristic Analysis (Keyword-Based)

### Approach

A **rule-based fallback** using predefined positive and negative keyword dictionaries.

### Algorithm

```typescript
const positiveWords = new Set([
  "good", "great", "excellent", "amazing", "wonderful", "fantastic",
  "love", "best", "perfect", "awesome", "happy", "satisfied",
  "recommend", "impressed", "quality", "helpful", "friendly",
]);

const negativeWords = new Set([
  "bad", "terrible", "awful", "poor", "horrible", "worst",
  "hate", "disappointing", "useless", "waste", "broken", "failed",
  "slow", "rude", "unprofessional", "frustrating", "annoying",
]);

function analyzeHeuristic(text: string) {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  let positiveCount = 0;
  let negativeCount = 0;

  for (const word of words) {
    if (positiveWords.has(word)) positiveCount++;
    if (negativeWords.has(word)) negativeCount++;
  }

  const total = positiveCount + negativeCount || 1;
  const rawScore = (positiveCount - negativeCount) / total;

  // Normalize to -1..1 range
  const score = Math.max(-1, Math.min(1, rawScore));

  // Determine label
  let label: SentimentLabel;
  if (score > 0.1) label = "POSITIVE";
  else if (score < -0.1) label = "NEGATIVE";
  else label = "NEUTRAL";

  // Confidence based on keyword density
  const keywordDensity = total / words.length;
  const confidence = Math.min(0.7, keywordDensity * 2); // Max 0.7 for heuristic

  return { score, label, confidence };
}
```

### Advantages

- **Always Available**: No API dependencies
- **Fast**: Instant analysis (no network calls)
- **Transparent**: Easy to debug and understand

### Limitations

- **Low Accuracy**: Cannot detect sarcasm, context, or complex sentiment
- **Limited Vocabulary**: Only recognizes predefined keywords
- **No Nuance**: Treats "not bad" as neutral instead of positive

### Use Cases

- Emergency fallback when all APIs are down
- Offline development environments
- Basic sentiment detection for simple text

---

## Normalization and Output

All three tiers produce a consistent output format:

```typescript
type SentimentResult = {
  score: number;      // -1 (very negative) to 1 (very positive)
  label: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  confidence: number; // 0 (uncertain) to 1 (highly confident)
};
```

### Score Ranges

| Score Range    | Label    | Interpretation           |
|----------------|----------|--------------------------|
| 0.1 to 1.0     | POSITIVE | Positive sentiment       |
| -0.1 to 0.1    | NEUTRAL  | Ambiguous or balanced    |
| -1.0 to -0.1   | NEGATIVE | Negative sentiment       |

### Confidence Interpretation

| Confidence | Meaning                        | Typical Source   |
|------------|--------------------------------|------------------|
| 0.9 - 1.0  | Very high confidence           | OpenAI           |
| 0.7 - 0.9  | High confidence                | HuggingFace      |
| 0.5 - 0.7  | Moderate confidence            | Heuristic        |
| 0.0 - 0.5  | Low confidence (uncertain)     | Fallback edge    |

---

## Integration with Database

After analysis, the result is stored in the `Review` model:

```typescript
const analysis = await analyzeSentiment(text);

const review = await prisma.review.create({
  data: {
    userId: session.user.id,
    text,
    rating,
    sentimentScore: analysis.score,
    sentimentLabel: analysis.label,
    feedbackCategory: feedbackCategory || null,
    aiConfidence: analysis.confidence,
    analyzedAt: new Date(),
    // Legacy compatibility
    sentiment: analysis.label,
    category: feedbackCategory || null,
  },
});
```

### Fields

- `sentimentScore`: Float (-1 to 1) for sorting/filtering
- `sentimentLabel`: Enum for grouping in analytics
- `aiConfidence`: Float (0 to 1) for quality filtering
- `analyzedAt`: Timestamp for tracking when analysis was performed
- `sentiment` / `category`: Legacy fields for backward compatibility

---

## Performance Considerations

### Latency

| Tier          | Typical Latency |
|---------------|-----------------|
| OpenAI        | 500ms - 2s      |
| HuggingFace   | 200ms - 1s      |
| Heuristic     | < 10ms          |

### Cost

| Tier          | Cost per Request | Notes                          |
|---------------|------------------|--------------------------------|
| OpenAI        | ~$0.0001-0.0003  | Depends on text length         |
| HuggingFace   | Free (limited)   | Paid tiers available           |
| Heuristic     | Free             | No external API calls          |

### Reliability

- **OpenAI**: 99.9% uptime (SLA); requires paid API key
- **HuggingFace**: ~99% uptime; free tier has rate limits
- **Heuristic**: 100% (always available)

---

## Monitoring and Debugging

### Logging

The `analyzeSentiment` function logs each fallback step:

```typescript
console.log("Attempting OpenAI sentiment analysis...");
// ... on error ...
console.error("OpenAI failed, falling back to HuggingFace:", error.message);
// ... on error ...
console.error("HuggingFace failed, using heuristic fallback:", error.message);
```

### Metrics to Track

- **Tier Usage Distribution**: % of analyses by tier (alerts if OpenAI is always failing)
- **Average Confidence**: Lower confidence indicates fallback usage or ambiguous text
- **Latency**: Track response time for performance optimization
- **Error Rate**: Monitor API failures

### Example Monitoring Query

```sql
SELECT
  COUNT(*) AS total_reviews,
  AVG(aiConfidence) AS avg_confidence,
  COUNT(CASE WHEN aiConfidence > 0.9 THEN 1 END) AS high_confidence_count,
  COUNT(CASE WHEN aiConfidence < 0.7 THEN 1 END) AS low_confidence_count
FROM "Review"
WHERE analyzedAt > NOW() - INTERVAL '24 hours';
```

---

## Testing Strategy

### Unit Tests

Test each tier independently:

```typescript
// Test OpenAI tier
it("should analyze positive sentiment via OpenAI", async () => {
  const result = await analyzeSentiment("This is amazing!");
  expect(result.label).toBe("POSITIVE");
  expect(result.score).toBeGreaterThan(0.5);
});

// Test heuristic fallback
it("should fall back to heuristic if APIs fail", async () => {
  // Mock API failures
  const result = await analyzeSentiment("This is great but also terrible");
  expect(result.confidence).toBeLessThan(0.8); // Indicates heuristic usage
});
```

### Integration Tests

Test API endpoint with real reviews:

```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{"text": "Mixed feelings about this product.", "rating": 3}'
```

Expected response includes:
- `sentimentScore` (close to 0 for neutral)
- `sentimentLabel` ("NEUTRAL")
- `aiConfidence` (varies by tier)

---

## Future Enhancements

1. **Fine-Tuning**: Train a custom model on your domain-specific reviews
2. **Aspect-Based Sentiment**: Detect sentiment for specific aspects (price, quality, service)
3. **Emotion Detection**: Beyond positive/negative (e.g., angry, happy, frustrated)
4. **Multi-Language Support**: Extend analysis to non-English reviews
5. **Feedback Loop**: Allow users to correct misclassified sentiment for model improvement

---

## References

- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [HuggingFace Inference API](https://huggingface.co/docs/api-inference)
- [Stanford Sentiment Treebank (SST-2)](https://nlp.stanford.edu/sentiment/)
- [Sentiment Analysis Best Practices](https://huggingface.co/blog/sentiment-analysis-python)

---

**Related Docs**:
- [REVIEW_ANALYTICS_SETUP.md](./REVIEW_ANALYTICS_SETUP.md) - Setup and usage guide
- [REVIEW_SYSTEM_SUMMARY.md](./REVIEW_SYSTEM_SUMMARY.md) - High-level overview
