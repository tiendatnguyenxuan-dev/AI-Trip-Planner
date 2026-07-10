# EXPLAIN ANALYZE — Query Performance Analysis

> **Purpose**: Document execution plans for the top expensive queries before and after Phase 2 optimizations.
> Run these on a populated development DB with representative data volumes.

---

## How to Run

```sql
-- Enable profiling (optional — for total execution time)
SET profiling = 1;

-- Run your query with EXPLAIN ANALYZE
EXPLAIN ANALYZE SELECT ...;

-- Check profile
SHOW PROFILES;
```

---

## Query 1: Trip list by user (N+1 baseline vs JOIN FETCH)

### Before (N+1 — separate query per trip for user)

```sql
EXPLAIN ANALYZE
SELECT t.* FROM trips t WHERE t.user_id = '3fa85f64-5717-4562-b3fc-2c963f66afa6';

-- For each trip, Hibernate issued:
SELECT u.* FROM users u WHERE u.id = ?;  -- × N trips
```

**Finding:**
- Full Index Scan on `idx_trip_user_id` ✅
- But N additional queries for user association ❌
- With 50 trips → 51 SQL queries total

### After (JOIN FETCH — 1 query)

```sql
EXPLAIN ANALYZE
SELECT t.*, u.*
FROM trips t
INNER JOIN users u ON t.user_id = u.id
WHERE t.user_id = '3fa85f64-5717-4562-b3fc-2c963f66afa6'
ORDER BY t.created_at DESC;
```

**Expected Plan:**
```
-> Nested loop inner join  (cost=1.5 rows=5)
    -> Index lookup on t using idx_trip_user_id (user_id='...')  (cost=0.9 rows=5)
    -> Single-row index lookup on u using PRIMARY (id=t.user_id)  (cost=0.2 rows=1)
```

**Result:** 51 queries → 1 query

---

## Query 2: Explore trending (no index vs popularity index)

### Before (no index on popularity_score)

```sql
EXPLAIN ANALYZE
SELECT * FROM explore_items
ORDER BY popularity_score DESC
LIMIT 5;
```

**Finding:**
- Full Table Scan (type: ALL) ❌
- filesort required ❌
- 10,000 rows examined for top 5

### After (index on popularity_score)

```sql
-- After V4__add_indexes.sql adds idx_explore_popularity
EXPLAIN ANALYZE
SELECT * FROM explore_items
WHERE deleted_at IS NULL
ORDER BY popularity_score DESC
LIMIT 5;
```

**Expected Plan:**
```
-> Limit: 5 row(s)
    -> Index scan on explore_items using idx_explore_popularity (reverse)  (rows=5)
```

**Result:** Full scan 10,000 rows → Index scan 5 rows

---

## Query 3: SharedContent trending by type + status

### Before (no user join, N+1 for user data)

```sql
EXPLAIN ANALYZE
SELECT s.* FROM shared_contents s
WHERE s.type = 'TRIP' AND s.status = 'PUBLISHED'
ORDER BY s.total_votes DESC, s.created_at DESC
LIMIT 10;
```

**Finding:**
- Using composite index `idx_shared_type_status` ✅
- N additional queries for user association ❌

### After (JOIN FETCH + index)

```sql
EXPLAIN ANALYZE
SELECT s.*, u.*
FROM shared_contents s
INNER JOIN users u ON s.user_id = u.id
WHERE s.type = 'TRIP' AND s.status = 'PUBLISHED'
  AND s.deleted_at IS NULL
ORDER BY s.total_votes DESC, s.created_at DESC
LIMIT 10;
```

**Expected Plan:**
```
-> Limit: 10 row(s)
    -> Sort: s.total_votes DESC, s.created_at DESC
        -> Nested loop inner join
            -> Index lookup on s using idx_shared_type_status (type='TRIP', status='PUBLISHED')
            -> Single-row index lookup on u using PRIMARY (id=s.user_id)
```

---

## Query 4: Comment list by shared content

### Before (full scan)

```sql
EXPLAIN ANALYZE
SELECT * FROM comments
WHERE shared_content_id = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
```

**Finding:** Full Table Scan ❌ — no index on `shared_content_id`

### After (idx_comment_shared_content_id)

```sql
EXPLAIN ANALYZE
SELECT * FROM comments
WHERE shared_content_id = '3fa85f64-5717-4562-b3fc-2c963f66afa6'
  AND deleted_at IS NULL;
```

**Expected Plan:**
```
-> Index lookup on comments using idx_comment_shared_content_id (shared_content_id='...')
```

---

## Query 5: Cursor Pagination vs OFFSET (Trip History)

### OFFSET approach (degrades at scale)

```sql
EXPLAIN ANALYZE
SELECT * FROM trips
WHERE user_id = '...'
ORDER BY id
LIMIT 10 OFFSET 10000;
```

**Finding:** MySQL must scan and skip 10,000 rows before returning 10 ❌

### Cursor approach

```sql
EXPLAIN ANALYZE
SELECT * FROM trips
WHERE user_id = '...'
  AND id > '3fa85f64-5717-4562-b3fc-2c963f66afa6'
  AND deleted_at IS NULL
ORDER BY id ASC
LIMIT 10;
```

**Expected Plan:**
```
-> Limit: 10 row(s)
    -> Filter: (id > '...' AND deleted_at IS NULL)
        -> Index lookup on trips using idx_trip_user_id (user_id='...')
```

**Result:** O(1) regardless of dataset size

---

## Recommendations Summary

| Query | Issue | Solution | Impact |
|-------|-------|----------|--------|
| Trip list | N+1 (51 queries) | JOIN FETCH | 51 → 1 queries |
| Explore trending | Full table scan | idx_explore_popularity | 10K → 5 rows |
| SharedContent trending | N+1 for users | JOIN FETCH | N → 1 queries |
| Comments | Full scan | idx_comment_shared_content_id | Full → Index |
| Trip history | OFFSET large offset | Cursor pagination | O(N) → O(1) |
