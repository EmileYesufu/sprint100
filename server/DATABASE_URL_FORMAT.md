# PostgreSQL DATABASE_URL Format Reference

## 📊 **Standard Format**
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

## 🔧 **Component Breakdown**

| Component | Description | Example |
|-----------|-------------|---------|
| `postgresql://` | Protocol | `postgresql://` |
| `USER` | Database username | `sprint100_user` |
| `PASSWORD` | Database password | `secure_password123` |
| `HOST` | Database hostname | `localhost` or `db.example.com` |
| `PORT` | Database port | `5432` (default) |
| `DATABASE` | Database name | `sprint100_prod` |

## 🌍 **Environment Examples**

### **Local Development**
```bash
DATABASE_URL="postgresql://sprint100_user:sprint100_pass@localhost:5432/sprint100_dev"
```

### **Production (Render.com)**
```bash
DATABASE_URL="postgresql://user:pass@dpg-abc123-a.oregon-postgres.render.com:5432/sprint100_prod"
```

### **Production (Heroku)**
```bash
DATABASE_URL="postgresql://user:pass@ec2-123-456-789.compute-1.amazonaws.com:5432/db123456"
```

### **Production (Fly.io)**
```bash
DATABASE_URL="postgresql://user:pass@sprint100-db.internal:5432/sprint100"
```

## 🔒 **Security Notes**

1. **Password Requirements**: Use strong passwords (12+ characters)
2. **SSL Connection**: Production databases should use SSL
3. **Environment Variables**: Never commit DATABASE_URL to version control
4. **Access Control**: Limit database access to application servers only

## 🧪 **Testing Connection**

```bash
# Test connection with psql
psql "postgresql://user:pass@host:port/database" -c "SELECT 1;"

# Test with backup script
export DATABASE_URL="postgresql://user:pass@host:port/database"
bash scripts/db_backup.sh
```

## 📋 **Validation Checklist**

- [ ] URL starts with `postgresql://`
- [ ] Contains username and password
- [ ] Host is accessible
- [ ] Port is correct (usually 5432)
- [ ] Database name is valid
- [ ] Connection test passes
- [ ] Backup script works
- [ ] Restore script works
