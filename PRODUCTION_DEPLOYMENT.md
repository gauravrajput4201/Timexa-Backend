# Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Configuration

Create `.env.production` file:

```bash
# Application
NODE_ENV=production
PORT=3000

# MongoDB
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/timexa?retryWrites=true&w=majority

# JWT
JWT_SECRET=<STRONG_SECRET_FROM_crypto.randomBytes(64).toString('hex')>
JWT_EXPIRATION=24h

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# CORS
CORS_ORIGIN=https://yourdomain.com
```

### 2. Create Database Indexes

**IMPORTANT:** Run this BEFORE first deployment to create indexes in background:

```bash
# Install dependencies
npm install

# Create indexes (run once)
npx ts-node scripts/create-indexes.ts
```

This will create all necessary indexes without blocking your production database.

### 3. Build Application

```bash
npm run build
```

### 4. Deploy

```bash
# Set environment
export NODE_ENV=production

# Start application
npm run start:prod
```

## Production Settings Explained

### Auto-Index Behavior

| Environment | autoIndex | autoCreate | Behavior |
|-------------|-----------|------------|----------|
| **Development** | `true` | `true` | Indexes auto-created on startup |
| **Production** | `false` | `false` | Manual index creation required |

### Why Disable Auto-Index in Production?

- ✅ **No startup delays** - App starts instantly
- ✅ **No collection locks** - Database remains responsive
- ✅ **Controlled deployments** - Index creation scheduled during off-peak hours
- ✅ **Zero downtime** - Background index building

### Manual Index Creation Benefits

- Create indexes during maintenance windows
- Use `background: true` to avoid blocking queries
- Monitor index build progress
- Roll back if issues occur

## Monitoring

### Check Index Status

```bash
# Connect to production MongoDB
mongosh "mongodb+srv://cluster.mongodb.net/timexa"

# List all indexes
db.users.getIndexes()
db.verifications.getIndexes()
db.attendancelogs.getIndexes()
```

### Verify TTL Index is Working

```bash
# Check if expired OTPs are being deleted
db.verifications.find({ expiresAt: { $lt: new Date() } })
# Should return empty array if TTL is working
```

## Troubleshooting

### Issue: Indexes not created

**Solution:** Run the index creation script:
```bash
npx ts-node scripts/create-indexes.ts
```

### Issue: Slow queries in production

**Check missing indexes:**
```javascript
// Enable profiling
db.setProfilingLevel(2)

// Check slow queries
db.system.profile.find({ millis: { $gt: 100 } }).sort({ ts: -1 }).limit(10)
```

### Issue: OTPs not expiring

**Verify TTL index:**
```javascript
db.verifications.getIndexes()
// Look for: { expiresAt: 1 } with expireAfterSeconds: 0
```

## Rollback Plan

If deployment fails:

1. **Revert code:** Deploy previous version
2. **Drop new indexes (if needed):**
   ```bash
   db.collection.dropIndex("index_name")
   ```
3. **Check logs:** Review application and MongoDB logs

## Performance Optimization

### After 100K+ Documents

Consider these optimizations:

1. **Partial Indexes** - Index only active documents:
   ```javascript
   db.verifications.createIndex(
     { identifier: 1, purpose: 1 },
     { partialFilterExpression: { status: "ACTIVE" } }
   )
   ```

2. **Index Size Monitoring:**
   ```javascript
   db.stats()
   db.verifications.stats()
   ```

3. **Compound Index Optimization** - Order by query frequency

## Security Checklist

- [ ] Strong JWT_SECRET (64+ characters)
- [ ] MONGODB_URI uses authentication
- [ ] CORS_ORIGIN is not `*`
- [ ] Rate limiting enabled
- [ ] HTTPS enforced
- [ ] Environment variables secured

## Next Steps

1. ✅ Create indexes using migration script
2. ✅ Test in staging environment
3. ✅ Deploy to production
4. ✅ Monitor application logs
5. ✅ Verify index usage with queries

---

**Note:** This configuration ensures zero-downtime deployments and optimal performance in production! 🚀
