# SAMCO Library - Sample Data Population Guide

## Overview

The `POPULATE_SAMCO_TABLES.sql` script populates all tables in the SAMCO library with comprehensive sample data for testing the Article Management Web Application.

## What's Included

The script populates the following tables with sample data:

| Table | Records | Description |
|-------|---------|-------------|
| COUNTRY | 10 | Country codes (FR, US, GB, DE, ES, IT, BE, NL, CH, CA) |
| FAMILLY | 10 | Product families (Electronics, Furniture, Clothing, Books, Toys, Sports, Garden, Food, Home, Office) |
| ARTICLE | 33 | Products across all families with realistic prices and stock levels |
| PROVIDER | 10 | Suppliers with complete contact information |
| CUSTOMER | 10 | Customers with credit limits and order history |
| ORDER | 10 | Customer orders with dates |
| DETORD | 24 | Order line items with quantities and prices |
| ARTIPROV | 33 | Article-Provider relationships with buy prices |
| PARAMETER | 10 | Application configuration parameters |

## Sample Data Highlights

### Articles (33 items)
- **Electronics**: Laptops, mice, cables, headphones, smartphones
- **Furniture**: Chairs, desks, bookshelves, coffee tables
- **Clothing**: T-shirts, jeans, jackets
- **Books**: Programming guides, business handbooks, novels
- **Toys**: Building blocks, RC cars, board games
- **Sports**: Yoga mats, dumbbells, tennis rackets
- **Garden**: Hoses, plant pots, tool sets
- **Food**: Coffee, tea, chocolate
- **Home Appliances**: Vacuum cleaners, coffee makers, microwaves
- **Office Supplies**: Paper, pens, notebooks

### VAT Codes
- **Code 2**: 20% (Standard rate) - Most products
- **Code 1**: 10% (Reduced rate) - Books and food items

### Customers
10 customers with varying credit limits (€50,000 - €120,000) and recent order history

### Orders
10 orders from January 2026, some delivered, some pending

## How to Execute the Script

### Method 1: Using ACS (Access Client Solutions) Run SQL Scripts

1. Open **IBM i Access Client Solutions**
2. Connect to your IBM i system
3. Go to **Run SQL Scripts**
4. Open the `POPULATE_SAMCO_TABLES.sql` file
5. Click **Run All** (or press F5)
6. Review the results in the Messages tab

### Method 2: Using RUNSQLSTM Command

1. Upload the SQL file to IBM i (e.g., to QSQLSRC source file)
2. Run the command:
   ```
   RUNSQLSTM SRCFILE(QSQLSRC) SRCMBR(POPULATE) COMMIT(*NONE) NAMING(*SQL)
   ```

### Method 3: Using STRSQL Interactive SQL

1. Start interactive SQL:
   ```
   STRSQL
   ```
2. Copy and paste sections of the script
3. Execute each section separately

## Before Running

### Option 1: Clear Existing Data (Recommended for Testing)

Uncomment the DELETE statements at the beginning of the script to clear existing data:

```sql
DELETE FROM SAMCO.ARTIPROV;
DELETE FROM SAMCO.DETORD;
DELETE FROM SAMCO.ORDER;
DELETE FROM SAMCO.ARTICLE;
DELETE FROM SAMCO.CUSTOMER;
DELETE FROM SAMCO.PROVIDER;
DELETE FROM SAMCO.FAMILLY;
DELETE FROM SAMCO.COUNTRY;
DELETE FROM SAMCO.PARAMETER;
```

**Note**: Delete statements are in reverse order of dependencies to avoid foreign key violations.

### Option 2: Keep Existing Data

Leave the DELETE statements commented out. The script will add new records to existing data.

**Warning**: This may cause duplicate key errors if records with the same IDs already exist.

## After Running

### Verify Data Was Inserted

Run these queries to check record counts:

```sql
SELECT COUNT(*) AS COUNTRY_COUNT FROM SAMCO.COUNTRY;
SELECT COUNT(*) AS FAMILY_COUNT FROM SAMCO.FAMILLY;
SELECT COUNT(*) AS ARTICLE_COUNT FROM SAMCO.ARTICLE;
SELECT COUNT(*) AS PROVIDER_COUNT FROM SAMCO.PROVIDER;
SELECT COUNT(*) AS CUSTOMER_COUNT FROM SAMCO.CUSTOMER;
SELECT COUNT(*) AS ORDER_COUNT FROM SAMCO.ORDER;
SELECT COUNT(*) AS DETORD_COUNT FROM SAMCO.DETORD;
SELECT COUNT(*) AS ARTIPROV_COUNT FROM SAMCO.ARTIPROV;
SELECT COUNT(*) AS PARAMETER_COUNT FROM SAMCO.PARAMETER;
```

Expected results:
- COUNTRY: 10
- FAMILLY: 10
- ARTICLE: 33
- PROVIDER: 10
- CUSTOMER: 10
- ORDER: 10
- DETORD: 24
- ARTIPROV: 33
- PARAMETER: 10

### Sample Queries for Testing

#### View All Articles with Family Information
```sql
SELECT 
    a.ARID, 
    a.ARDESC, 
    a.ARSALEPR, 
    a.ARSTOCK,
    f.FADESC AS FAMILY, 
    a.ARVATCD
FROM SAMCO.ARTICLE a
LEFT JOIN SAMCO.FAMILLY f ON a.ARTIFA = f.FAID
WHERE a.ARDEL = ''
ORDER BY a.ARID;
```

#### View All Orders with Customer Information
```sql
SELECT 
    o.ORID, 
    o.ORDATE, 
    c.CUSTNM, 
    c.CUCITY
FROM SAMCO.ORDER o
JOIN SAMCO.CUSTOMER c ON o.ORCUID = c.CUID
ORDER BY o.ORDATE DESC;
```

#### View Order Details for a Specific Order
```sql
SELECT 
    d.ODORID, 
    d.ODLINE, 
    a.ARDESC, 
    d.ODQTY, 
    d.ODPRICE, 
    d.ODTOT
FROM SAMCO.DETORD d
JOIN SAMCO.ARTICLE a ON d.ODARID = a.ARID
WHERE d.ODORID = 1
ORDER BY d.ODLINE;
```

#### View Articles with Provider Information
```sql
SELECT 
    a.ARID,
    a.ARDESC,
    a.ARSALEPR AS SALE_PRICE,
    p.PROVNM AS PROVIDER,
    ap.APPRICE AS BUY_PRICE,
    ap.APREF AS PROVIDER_REF
FROM SAMCO.ARTICLE a
JOIN SAMCO.ARTIPROV ap ON a.ARID = ap.APARID
JOIN SAMCO.PROVIDER p ON ap.APPRID = p.PRID
WHERE a.ARDEL = ''
ORDER BY a.ARID;
```

## Testing the Web Application

After populating the data, you can test the Article Management Web Application:

### 1. Test Family Dropdown
The Family dropdown should show:
- ELE - Electronics
- FUR - Furniture
- CLO - Clothing
- BOO - Books
- TOY - Toys
- SPO - Sports Equipment
- GAR - Garden
- FOO - Food
- HOM - Home Appliances
- OFF - Office Supplies

### 2. Test VAT Code Dropdown
The VAT Code dropdown should show:
- 2 - Standard VAT Rate (20%)
- 1 - Reduced VAT Rate (10%)
- 0 - Zero VAT Rate (0%)

**Note**: You need to add VAT definitions to the SAMREF table. Add this to the script if needed:

```sql
-- Add VAT definitions to SAMREF table
INSERT INTO SAMCO.SAMREF (VATCODE, VATRATE, VATDESC) VALUES
('0', 0.00, 'Zero VAT Rate'),
('1', 10.00, 'Reduced VAT Rate'),
('2', 20.00, 'Standard VAT Rate');
```

### 3. Test Article List
The article list should display 33 articles with:
- Article IDs from 000001 to 000092
- Descriptions
- Family codes
- Stock levels
- Prices

### 4. Test Article Creation
Try creating a new article:
- Description: "Test Product"
- Family: ELE (Electronics)
- VAT Code: 2 (20%)
- Sale Price: 99.99
- Warehouse Price: 75.00
- Stock: 100
- Minimum Quantity: 10

### 5. Test Article Update
Edit an existing article (e.g., 000001) and change:
- Description or price
- Stock level
- Save and verify changes

## Troubleshooting

### Error: "Duplicate key value"
**Cause**: Records with the same IDs already exist in the tables.

**Solution**: 
1. Uncomment the DELETE statements at the beginning of the script
2. Re-run the script

### Error: "SQL0204 - Object not found"
**Cause**: Tables don't exist in the SAMCO library.

**Solution**: 
1. Verify the library name is correct
2. Create the tables first using the DDS source files
3. Check that you have authority to the library

### Error: "SQL0530 - Foreign key constraint violation"
**Cause**: Trying to insert data that references non-existent parent records.

**Solution**: 
1. Run the script in the order provided
2. Don't skip sections
3. Ensure parent tables are populated before child tables

### Error: "SQL0551 - Not authorized"
**Cause**: User doesn't have INSERT authority to the tables.

**Solution**: 
1. Contact your system administrator
2. Grant INSERT authority: `GRTOBJAUT OBJ(SAMCO/*ALL) OBJTYPE(*FILE) USER(youruser) AUT(*ALL)`

## Data Relationships

```
COUNTRY
   ↓
CUSTOMER ← ORDER → DETORD → ARTICLE ← ARTIPROV → PROVIDER
                              ↓
                           FAMILLY
```

## Customization

You can customize the sample data by:

1. **Adding More Records**: Copy and modify INSERT statements
2. **Changing Values**: Edit prices, descriptions, quantities
3. **Adding New Families**: Add rows to FAMILLY table
4. **Adding New Countries**: Add rows to COUNTRY table
5. **Creating More Orders**: Add rows to ORDER and DETORD tables

## Maintenance

### To Update Stock Levels
```sql
UPDATE SAMCO.ARTICLE 
SET ARSTOCK = 200 
WHERE ARID = '000001';
```

### To Mark Articles as Deleted
```sql
UPDATE SAMCO.ARTICLE 
SET ARDEL = 'X' 
WHERE ARID = '000001';
```

### To Add New Articles
```sql
INSERT INTO SAMCO.ARTICLE (
    ARID, ARDESC, ARSALEPR, ARWHSPR, ARTIFA, 
    ARSTOCK, ARMINQTY, ARCUSQTY, ARPURQTY, ARVATCD, 
    ARCREA, ARMOD, ARMODID, ARDEL
) VALUES (
    '000099', 'New Product', 49.99, 30.00, 'ELE',
    50, 10, 0, 0, '2',
    CURRENT DATE, CURRENT TIMESTAMP, 'ADMIN', ''
);
```

## Support

For issues or questions:
1. Check the error messages in the SQL script output
2. Verify table structures match the DDS definitions
3. Review the API_QUERIES.md file for query examples
4. Check the REST_API_INTEGRATION.md for API integration details

---

**Made with Bob**