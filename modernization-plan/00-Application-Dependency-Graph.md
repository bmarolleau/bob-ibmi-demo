# Application Dependency Graph and Artifact Catalog

## Overview

This document provides a comprehensive catalog of all artifacts in the IBM i application, their dependencies, and build order. The application is a sample business management system with modules for Articles, Customers, Orders, Providers, and Parameters.

---

## Table of Contents

1. [Dependency Graph](#dependency-graph)
2. [Build Order](#build-order)
3. [Artifact Catalog](#artifact-catalog)
4. [Module Dependencies](#module-dependencies)

---

## Dependency Graph

```
┌─────────────────────────────────────────────────────────────────┐
│                        REFERENCE FILES                           │
│  SAMREF.PF (Field definitions used by all files)                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      PHYSICAL FILES (PF)                         │
│  ARTICLE, CUSTOMER, PROVIDER, ORDER, DETORD, FAMILLY,           │
│  COUNTRY, PARAMETER, ARTIPROV, VATDEF                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      LOGICAL FILES (LF)                          │
│  ARTICLE1, ARTICLE2, CUSTOME1, CUSTOME2, PROVIDE1,              │
│  ORDER1, ORDER2, ORDER3, DETORD1, FAMILL1, COUNTR1, ARTIPRO1   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DISPLAY FILES (DSPF)                        │
│  ART200D, ART201D, ART202D, ART301D, CUS200D, CUS301D,         │
│  ORD200D, ORD201D, ORD202D, PRO200D, PRO201D, PRO202D,         │
│  PAR200D, COU200D, COU301D, FAM301D                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SERVICE PROGRAM MODULES                        │
│  ART300, ART301, ART302 → FARTICLE                             │
│  CUS300, CUS301 → FCUSTOMER                                     │
│  PRO300 → FPROVIDER                                             │
│  COU300, COU301 → FCOUNTRY                                      │
│  FAM300, FAM301 → FFAMILLY                                      │
│  PAR300 → FPARAMETER                                            │
│  LOG300 → LOG                                                   │
│  TXT001 → TXT                                                   │
│  XML001 → XML                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SERVICE PROGRAMS                            │
│  FARTICLE, FCUSTOMER, FPROVIDER, FCOUNTRY, FFAMILLY,           │
│  FPARAMETER, LOG, TXT, XML, XSS, ORDER, FVAT                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BINDING DIRECTORY                           │
│  SAMPLE (contains all service programs)                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION PROGRAMS                        │
│  ART200, ART201, ART202, CUS200, ORD200, ORD201, ORD202,       │
│  PRO200, PRO202, PRO203, PAR200, LOG100, ORD100, ORD101,       │
│  ORD500, ORD700, ORD900, ORD901                                │
└─────────────────────────────────────────────────────────────────┘
```

---

## Build Order

### Phase 1: Foundation (Reference Files)
1. **SAMREF.PF** - Field reference file

### Phase 2: Database Layer (Physical Files)
2. **COUNTRY.PF** - Country master data
3. **FAMILLY.PF** - Article family/category master
4. **VATDEF.PF** - VAT code definitions
5. **PARAMETER.PF** - Application parameters
6. **ARTICLE.PF** - Article master data
7. **CUSTOMER.PF** - Customer master data
8. **PROVIDER.PF** - Provider/supplier master data
9. **ORDER.PF** - Order header data
10. **DETORD.PF** - Order detail/line items
11. **ARTIPROV.PF** - Article-Provider relationship

### Phase 3: Database Layer (Logical Files)
12. **COUNTR1.LF** - Country sorted by name
13. **FAMILL1.LF** - Family sorted by description
14. **ARTICLE1.LF** - Article keyed by ID
15. **ARTICLE2.LF** - Article sorted by description
16. **CUSTOME1.LF** - Customer keyed by ID
17. **CUSTOME2.LF** - Customer sorted by name
18. **PROVIDE1.LF** - Provider keyed by ID
19. **ORDER1.LF** - Order keyed by order number
20. **ORDER2.LF** - Order sorted by customer
21. **ORDER3.LF** - Order sorted by date
22. **DETORD1.LF** - Order detail keyed by order+line
23. **ARTIPRO1.LF** - Article-Provider keyed by article

### Phase 4: SQL Objects
24. **CUSSEQ** - Customer ID sequence
25. **ARTIINF** - Article information table

### Phase 5: User Interface (Display Files)
26. **ART200D.DSPF** - Work with Articles (list)
27. **ART201D.DSPF** - Work with Articles (detail)
28. **ART202D.DSPF** - Article functions
29. **ART301D.DSPF** - Select Article
30. **CUS200D.DSPF** - Work with Customers
31. **CUS301D.DSPF** - Select Customer
32. **COU200D.DSPF** - Work with Countries
33. **COU301D.DSPF** - Select Country
34. **FAM301D.DSPF** - Select Family
35. **ORD200D.DSPF** - Work with Orders (list)
36. **ORD201D.DSPF** - Work with Orders (detail)
37. **ORD202D.DSPF** - Order line items
38. **PRO200D.DSPF** - Work with Providers (list)
39. **PRO201D.DSPF** - Work with Providers (detail)
40. **PRO202D.DSPF** - Provider functions
41. **PAR200D.DSPF** - Parameters maintenance

### Phase 6: Service Programs (Modules)
42. **COU300.RPGLE** → Module for FCOUNTRY
43. **COU301.RPGLE** → Module for FCOUNTRY
44. **FAM300.RPGLE** → Module for FFAMILLY
45. **FAM301.RPGLE** → Module for FFAMILLY
46. **ART300.RPGLE** → Module for FARTICLE
47. **ART301.SQLRPGLE** → Module for FARTICLE
48. **ART302.SQLRPGLE** → Module for FARTICLE
49. **CUS300.RPGLE** → Module for FCUSTOMER
50. **CUS301.SQLRPGLE** → Module for FCUSTOMER
51. **PRO300.RPGLE** → Module for FPROVIDER
52. **PAR300.RPGLE** → Module for FPARAMETER
53. **LOG300.RPGLE** → Module for LOG
54. **TXT001.RPGLE** → Module for TXT
55. **XML001.RPGLE** → Module for XML

### Phase 7: Service Programs (SRVPGM)
56. **FCOUNTRY** - Country management service program
57. **FFAMILLY** - Family management service program
58. **FARTICLE** - Article management service program
59. **FCUSTOMER** - Customer management service program
60. **FPROVIDER** - Provider management service program
61. **FPARAMETER** - Parameter management service program
62. **LOG** - Logging service program
63. **TXT** - Text utilities service program
64. **XML** - XML utilities service program
65. **FVAT** - VAT management service program

### Phase 8: Binding Directory
66. **SAMPLE.BNDDIR** - Binding directory containing all service programs

### Phase 9: Application Programs
67. **ART200.PGM** - Work with Articles (main)
68. **ART201.PGM** - Article suppliers management
69. **ART202.PGM** - Article functions
70. **CUS200.PGM** - Work with Customers (main)
71. **ORD200.PGM** - Work with Orders (main)
72. **ORD201.PGM** - Order detail maintenance
73. **ORD202.PGM** - Order functions
74. **PRO200.PGM** - Work with Providers (main)
75. **PRO202.PGM** - Provider functions
76. **PRO203.PGM** - Provider SQL functions
77. **PAR200.PGM** - Parameters maintenance
78. **LOG100.PGM** - Logging program
79. **ORD100.PGM** - Order entry
80. **ORD101.PGM** - Order validation
81. **ORD500.PGM** - Order printing
82. **ORD700.PGM** - Order processing
83. **ORD900.PGM** - Order utilities
84. **ORD901.PGM** - Order SQL utilities

---

## Artifact Catalog

### 1. Reference Files

#### SAMREF.PF
- **Type**: Physical File (Reference)
- **Location**: `common/SAMREF.PF`
- **Purpose**: Defines common field definitions used across all database files
- **Key Fields**: None (reference only)
- **Dependencies**: None
- **Used By**: All physical files

---

### 2. Physical Files (Master Data)

#### COUNTRY.PF
- **Type**: Physical File
- **Location**: `QDDSSRC/COUNTRY.PF`
- **Purpose**: Country master data (codes, names, ISO codes)
- **Key Fields**: COID (Country ID)
- **Dependencies**: SAMREF
- **Used By**: CUSTOMER, PROVIDER, COUNTR1

#### FAMILLY.PF
- **Type**: Physical File
- **Location**: `QDDSSRC/FAMILLY.PF`
- **Purpose**: Article family/category master data
- **Key Fields**: FAID (Family ID)
- **Dependencies**: SAMREF
- **Used By**: ARTICLE, FAMILL1

#### VATDEF.PF
- **Type**: Physical File
- **Location**: `functionsVAT/vatdef.pf`
- **Purpose**: VAT code definitions and rates
- **Key Fields**: VATCODE
- **Dependencies**: SAMREF
- **Used By**: ARTICLE, FVAT service program

#### PARAMETER.PF
- **Type**: Physical File
- **Location**: `QDDSSRC/PARAMETER.PF`
- **Purpose**: Application configuration parameters
- **Key Fields**: Parameter key
- **Dependencies**: SAMREF
- **Used By**: FPARAMETER, PAR200

#### ARTICLE.PF
- **Type**: Physical File
- **Location**: `QDDSSRC/ARTICLE-Article_File.PF`
- **Purpose**: Article/product master data
- **Key Fields**: ARID (Article ID)
- **Dependencies**: SAMREF, FAMILLY, VATDEF
- **Used By**: ARTICLE1, ARTICLE2, ARTIPROV, DETORD

#### CUSTOMER.PF
- **Type**: Physical File
- **Location**: `QDDSSRC/CUSTOMER.PF`
- **Purpose**: Customer master data
- **Key Fields**: CUID (Customer ID)
- **Dependencies**: SAMREF, COUNTRY
- **Used By**: CUSTOME1, CUSTOME2, ORDER

#### PROVIDER.PF
- **Type**: Physical File
- **Location**: `QDDSSRC/PROVIDER.PF`
- **Purpose**: Provider/supplier master data
- **Key Fields**: PRID (Provider ID)
- **Dependencies**: SAMREF, COUNTRY
- **Used By**: PROVIDE1, ARTIPROV

#### ORDER.PF
- **Type**: Physical File
- **Location**: `QDDSSRC/ORDER.PF`
- **Purpose**: Order header data
- **Key Fields**: ORID (Order ID)
- **Dependencies**: SAMREF, CUSTOMER
- **Used By**: ORDER1, ORDER2, ORDER3, DETORD

#### DETORD.PF
- **Type**: Physical File
- **Location**: `QDDSSRC/DETORD.PF`
- **Purpose**: Order detail/line items
- **Key Fields**: ORID + ODLINE (Order ID + Line Number)
- **Dependencies**: SAMREF, ORDER, ARTICLE
- **Used By**: DETORD1

#### ARTIPROV.PF
- **Type**: Physical File
- **Location**: `QDDSSRC/ARTIPROV.PF`
- **Purpose**: Article-Provider relationship (which providers supply which articles)
- **Key Fields**: ARID + PRID
- **Dependencies**: SAMREF, ARTICLE, PROVIDER
- **Used By**: ARTIPRO1

---

### 3. Logical Files (Indexed Views)

#### ARTICLE1.LF
- **Type**: Logical File
- **Location**: `QDDSSRC/ARTICLE1-Article_File.LF`
- **Purpose**: Article file keyed by Article ID (unique)
- **Key**: ARID
- **Physical File**: ARTICLE
- **Used By**: ART200, ART201, ART202

#### ARTICLE2.LF
- **Type**: Logical File
- **Location**: `QDDSSRC/ARTICLE2.LF`
- **Purpose**: Article file sorted by Description + ID
- **Key**: ARDESC, ARID
- **Physical File**: ARTICLE
- **Used By**: ART200 (for position-to and sorted display)

#### CUSTOME1.LF
- **Type**: Logical File
- **Location**: `QDDSSRC/CUSTOME1.LF`
- **Purpose**: Customer file keyed by Customer ID (unique)
- **Key**: CUID
- **Physical File**: CUSTOMER
- **Used By**: CUS200, ORD200

#### CUSTOME2.LF
- **Type**: Logical File
- **Location**: `QDDSSRC/CUSTOME2.LF`
- **Purpose**: Customer file sorted by Name + ID
- **Key**: CUSTNM, CUID
- **Physical File**: CUSTOMER
- **Used By**: CUS200 (for position-to and sorted display)

#### PROVIDE1.LF
- **Type**: Logical File
- **Location**: `QDDSSRC/PROVIDE1.LF`
- **Purpose**: Provider file keyed by Provider ID (unique)
- **Key**: PRID
- **Physical File**: PROVIDER
- **Used By**: PRO200, PRO202

#### COUNTR1.LF
- **Type**: Logical File
- **Location**: `QDDSSRC/COUNTR1.LF`
- **Purpose**: Country file sorted by Name
- **Key**: COUNTR
- **Physical File**: COUNTRY
- **Used By**: COU301 (country selection)

#### FAMILL1.LF
- **Type**: Logical File
- **Location**: `QDDSSRC/FAMILL1.LF`
- **Purpose**: Family file sorted by Description
- **Key**: FADESC
- **Physical File**: FAMILLY
- **Used By**: FAM301 (family selection)

#### ORDER1.LF, ORDER2.LF, ORDER3.LF
- **Type**: Logical Files
- **Location**: `QDDSSRC/ORDER*.LF`
- **Purpose**: Order files with different sort sequences
- **Physical File**: ORDER
- **Used By**: ORD200, ORD201

#### DETORD1.LF
- **Type**: Logical File
- **Location**: `QDDSSRC/DETORD1.LF`
- **Purpose**: Order detail keyed by Order + Line
- **Key**: ORID, ODLINE
- **Physical File**: DETORD
- **Used By**: ORD201, ORD202

#### ARTIPRO1.LF
- **Type**: Logical File
- **Location**: `QDDSSRC/ARTIPRO1.LF`
- **Purpose**: Article-Provider keyed by Article
- **Key**: ARID
- **Physical File**: ARTIPROV
- **Used By**: ART201 (supplier management)

---

### 4. Display Files (User Interface)

#### ART200D.DSPF
- **Type**: Display File
- **Location**: `QDDSSRC/ART200D-Work_with_Article.DSPF`
- **Purpose**: Work with Articles - main list screen with subfile
- **Formats**: SFL01 (subfile), CTL01 (control), FMT02 (detail), FMT03 (info), KEY01 (footer)
- **Used By**: ART200.PGM
- **Features**: Subfile list, position-to, options (2=Edit, 3=Info, 4=Delete, 6=Suppliers)

#### CUS200D.DSPF
- **Type**: Display File
- **Location**: `QDDSSRC/CUS200D.DSPF`
- **Purpose**: Work with Customers - main list and detail screens
- **Formats**: SFL01 (subfile), CTL01 (control), FMT02 (detail), KEY01 (footer)
- **Used By**: CUS200.PGM
- **Features**: Subfile list, position-to, options (2=Edit, 5=Orders)

#### ORD200D.DSPF
- **Type**: Display File
- **Location**: `QDDSSRC/ORD200D.DSPF`
- **Purpose**: Work with Orders - order list screen
- **Used By**: ORD200.PGM

#### COU301D.DSPF
- **Type**: Display File
- **Location**: `QDDSSRC/COU301D.DSPF`
- **Purpose**: Country selection window (F4 prompt)
- **Used By**: COU301 (SltCountry procedure)

#### FAM301D.DSPF
- **Type**: Display File
- **Location**: `QDDSSRC/FAM301D.DSPF`
- **Purpose**: Family selection window (F4 prompt)
- **Used By**: FAM301 (SltArtFam procedure)

---

### 5. Service Program Modules

#### COU300.RPGLE
- **Type**: RPG Module (NOMAIN)
- **Location**: `QRPGLESRC/COU300.RPGLE`
- **Purpose**: Country utility functions
- **Exports**: GetCountryName, GetCountryIso3, ExistCountry, CloseCountry
- **Dependencies**: COUNTRY.PF, COUNTRY.RPGLEINC
- **Service Program**: FCOUNTRY

#### COU301.RPGLE
- **Type**: RPG Module (NOMAIN)
- **Location**: `QRPGLESRC/COU301.RPGLE`
- **Purpose**: Country selection function (F4 prompt)
- **Exports**: SltCountry
- **Dependencies**: COUNTRY.PF, COUNTR1.LF, COU301D.DSPF
- **Service Program**: FCOUNTRY

#### FAM300.RPGLE
- **Type**: RPG Module (NOMAIN)
- **Location**: `QRPGLESRC/FAM300.RPGLE`
- **Purpose**: Family utility functions
- **Exports**: GetArtFamDesc, ExistArtFam, IsArtFamDeleted, CloseFamilly
- **Dependencies**: FAMILLY.PF
- **Service Program**: FFAMILLY

#### FAM301.RPGLE
- **Type**: RPG Module (NOMAIN)
- **Location**: `QRPGLESRC/FAM301.RPGLE`
- **Purpose**: Family selection function (F4 prompt)
- **Exports**: SltArtFam
- **Dependencies**: FAMILLY.PF, FAMILL1.LF, FAM301D.DSPF
- **Service Program**: FFAMILLY

#### ART300.RPGLE
- **Type**: RPG Module (NOMAIN)
- **Location**: `QRPGLESRC/ART300-Function_Article.RPGLE`
- **Purpose**: Article utility functions
- **Exports**: GetArtDesc, GetArtRefSalPrice, GetArtStockPrice, GetArtFam, GetArtStock, GetArtMinStock, GetArtVatCode, ExistArt, IsArtDeleted, CloseARTICLE1
- **Dependencies**: ARTICLE.PF, ARTICLE1.LF
- **Service Program**: FARTICLE

#### ART301.SQLRPGLE
- **Type**: SQL RPG Module (NOMAIN)
- **Location**: `QRPGLESRC/ART301.SQLRPGLE`
- **Purpose**: Article selection function
- **Exports**: SltArticle
- **Dependencies**: ARTICLE.PF, ART301D.DSPF
- **Service Program**: FARTICLE

#### ART302.SQLRPGLE
- **Type**: SQL RPG Module (NOMAIN)
- **Location**: `QRPGLESRC/ART302.SQLRPGLE`
- **Purpose**: Article information management
- **Exports**: GetArtInfo
- **Dependencies**: ARTIINF table
- **Service Program**: FARTICLE

#### CUS300.RPGLE
- **Type**: RPG Module (NOMAIN)
- **Location**: `QRPGLESRC/CUS300.RPGLE`
- **Purpose**: Customer utility functions
- **Dependencies**: CUSTOMER.PF
- **Service Program**: FCUSTOMER

#### CUS301.SQLRPGLE
- **Type**: SQL RPG Module (NOMAIN)
- **Location**: `QRPGLESRC/CUS301.SQLRPGLE`
- **Purpose**: Customer selection function
- **Dependencies**: CUSTOMER.PF, CUS301D.DSPF
- **Service Program**: FCUSTOMER

#### PRO300.RPGLE
- **Type**: RPG Module (NOMAIN)
- **Location**: `QRPGLESRC/PRO300.RPGLE`
- **Purpose**: Provider utility functions
- **Dependencies**: PROVIDER.PF
- **Service Program**: FPROVIDER

#### PAR300.RPGLE
- **Type**: RPG Module (NOMAIN)
- **Location**: `QRPGLESRC/PAR300.RPGLE`
- **Purpose**: Parameter utility functions
- **Dependencies**: PARAMETER.PF
- **Service Program**: FPARAMETER

#### LOG300.RPGLE
- **Type**: RPG Module (NOMAIN)
- **Location**: `QRPGLESRC/LOG300.RPGLE`
- **Purpose**: Logging utility functions
- **Service Program**: LOG

#### TXT001.RPGLE
- **Type**: RPG Module (NOMAIN)
- **Location**: `QRPGLESRC/TXT001.RPGLE`
- **Purpose**: Text manipulation utilities
- **Service Program**: TXT

#### XML001.RPGLE
- **Type**: RPG Module (NOMAIN)
- **Location**: `QRPGLESRC/XML001.RPGLE`
- **Purpose**: XML processing utilities
- **Service Program**: XML

---

### 6. Service Programs

#### FCOUNTRY
- **Type**: Service Program
- **Binding Source**: `QSRVSRC/FCOUNTRY.BND`
- **Modules**: COU300, COU301
- **Exports**: GetCountryName, GetCountryIso3, ExistCountry, SltCountry
- **Purpose**: Country management and selection
- **Used By**: CUS200, PRO200, and other programs needing country functions

#### FFAMILLY
- **Type**: Service Program
- **Binding Source**: `QSRVSRC/FFAMILLY.BND`
- **Modules**: FAM300, FAM301
- **Exports**: GetArtFamDesc, ExistArtFam, IsArtFamDeleted, SltArtFam
- **Purpose**: Family management and selection
- **Used By**: ART200, ART201, and other programs needing family functions

#### FARTICLE
- **Type**: Service Program
- **Binding Source**: `QSRVSRC/FARTICLE.BND`
- **ILESRVPGM**: `QILESRVSRC/FARTICLE.ILESRVPGM`
- **Modules**: ART300, ART301, ART302
- **Exports**: Article utility functions, SltArticle, GetArtInfo
- **Purpose**: Article management and selection
- **Used By**: ORD200, ORD201, and other programs needing article functions

#### FCUSTOMER
- **Type**: Service Program
- **Binding Source**: `QSRVSRC/FCUSTOMER.BND`
- **Modules**: CUS300, CUS301
- **Purpose**: Customer management and selection
- **Used By**: ORD200 and other programs needing customer functions

#### FPROVIDER
- **Type**: Service Program
- **Binding Source**: `QSRVSRC/FPROVIDER.BND`
- **Modules**: PRO300
- **Purpose**: Provider management
- **Used By**: ART201 and other programs needing provider functions

#### FPARAMETER
- **Type**: Service Program
- **ILESRVPGM**: `QILESRVSRC/FPARAMETER.ILESRVPGM`
- **Modules**: PAR300
- **Purpose**: Parameter management
- **Used By**: Various programs needing application parameters

#### LOG
- **Type**: Service Program
- **ILESRVPGM**: `QILESRVSRC/LOG.ILESRVPGM`
- **Modules**: LOG300
- **Purpose**: Application logging
- **Used By**: Various programs for logging

#### TXT
- **Type**: Service Program
- **Binding Source**: `QSRVSRC/TXT.BND`
- **Modules**: TXT001
- **Purpose**: Text manipulation utilities
- **Used By**: Various programs

#### XML
- **Type**: Service Program
- **Binding Source**: `QSRVSRC/XML.BND`
- **Modules**: XML001
- **Purpose**: XML processing
- **Used By**: Various programs

#### FVAT
- **Type**: Service Program
- **Location**: `functionsVAT/`
- **Purpose**: VAT calculation and management
- **Used By**: ART200, ORD200, and other programs needing VAT calculations

---

### 7. Binding Directory

#### SAMPLE.BNDDIR
- **Type**: Binding Directory
- **Location**: `QBNDSRC/SAMPLE.BNDDIR`
- **Purpose**: Contains references to all service programs
- **Contents**:
  - XML (Text/XML utilities)
  - ORDER (Order processing)
  - TXT (Text utilities)
  - XSS (Security utilities)
  - FARTICLE (Article management)
  - FCUSTOMER (Customer management)
  - FCOUNTRY (Country management) ⚠️ **MISSING - needs to be added**
  - FFAMILLY (Family management)
  - FPARAMETER (Parameter management)
  - FPROVIDER (Provider management)
  - FVAT (VAT management)
  - LOG (Logging)
- **Used By**: All application programs via BNDDIR('SAMPLE') in H-spec

---

### 8. Application Programs

#### ART200.PGM
- **Type**: SQL RPG Program
- **Location**: `QRPGLESRC/ART200-Work_with_article.PGM.SQLRPGLE`
- **Purpose**: Work with Articles - main program
- **Dependencies**: 
  - Files: ARTICLE1, ARTICLE2, ART200D
  - Service Programs: FFAMILLY (via SAMPLE)
  - SQL: ARTIINF table
- **Calls**: ART201 (supplier management)
- **Features**: List articles, create, edit, delete, view info, manage suppliers

#### ART201.PGM
- **Type**: RPG Program
- **Location**: `QRPGLESRC/ART201-Work_with_article.PGM.RPGLE`
- **Purpose**: Article supplier management
- **Dependencies**: ARTIPROV, ARTIPRO1, ART201D
- **Called By**: ART200

#### ART202.PGM
- **Type**: RPG Program
- **Location**: `QRPGLESRC/ART202-Function_Article.PGM.RPGLE`
- **Purpose**: Article utility functions
- **Dependencies**: ARTICLE, ART202D

#### CUS200.PGM
- **Type**: SQL RPG Program
- **Location**: `QRPGLESRC/CUS200.PGM.SQLRPGLE`
- **Purpose**: Work with Customers - main program
- **Dependencies**:
  - Files: CUSTOME1, CUSTOME2, CUS200D
  - Service Programs: FCOUNTRY (via SAMPLE) ⚠️ **MISSING**
  - SQL: CUSSEQ sequence
- **Calls**: ORD200 (customer orders)
- **Features**: List customers, create, edit, view orders

#### ORD200.PGM
- **Type**: SQL RPG Program
- **Location**: `QRPGLESRC/ORD200.PGM.SQLRPGLE`
- **Purpose**: Work with Orders - main program
- **Dependencies**: ORDER files, ORD200D, FCUSTOMER, FARTICLE
- **Calls**: ORD201 (order detail)

#### ORD201.PGM
- **Type**: SQL RPG Program
- **Location**: `QRPGLESRC/ORD201.PGM.SQLRPGLE`
- **Purpose**: Order detail maintenance
- **Dependencies**: DETORD, DETORD1, ORD201D
- **Called By**: ORD200

#### PRO200.PGM
- **Type**: RPG Program
- **Location**: `QRPGLESRC/PRO200.RPGLE`
- **Purpose**: Work with Providers - main program
- **Dependencies**: PROVIDER, PROVIDE1, PRO200D, FCOUNTRY

#### PAR200.PGM
- **Type**: RPG Program
- **Location**: `QRPGLESRC/PAR200.RPGLE`
- **Purpose**: Parameters maintenance
- **Dependencies**: PARAMETER, PAR200D, FPARAMETER

#### LOG100.PGM
- **Type**: RPG Program
- **Location**: `QRPGLESRC/LOG100.PGM.RPGLE`
- **Purpose**: Logging program
- **Dependencies**: LOG service program

---

## Module Dependencies

### Article Module
```
ART200.PGM (Main)
├── ARTICLE1.LF (Update)
├── ARTICLE2.LF (Read sorted)
├── ART200D.DSPF (UI)
├── FFAMILLY.SRVPGM
│   ├── GetArtFamDesc()
│   ├── ExistArtFam()
│   └── SltArtFam()
├── ARTIINF (SQL Table)
└── Calls: ART201.PGM

ART201.PGM (Suppliers)
├── ARTIPROV.PF
├── ARTIPRO1.LF
├── ART201D.DSPF
└── FPROVIDER.SRVPGM
```

### Customer Module
```
CUS200.PGM (Main)
├── CUSTOME1.LF (Update)
├── CUSTOME2.LF (Read sorted)
├── CUS200D.DSPF (UI)
├── FCOUNTRY.SRVPGM ⚠️ MISSING
│   ├── GetCountryName()
│   ├── SltCountry()
│   └── ExistCountry()
├── CUSSEQ (SQL Sequence)
└── Calls: ORD200.PGM
```

### Order Module
```
ORD200.PGM (Main)
├── ORDER files
├── ORD200D.DSPF
├── FCUSTOMER.SRVPGM
├── FARTICLE.SRVPGM
└── Calls: ORD201.PGM

ORD201.PGM (Detail)
├── DETORD.PF
├── DETORD1.LF
├── ORD201D.DSPF
└── FARTICLE.SRVPGM
```

### Provider Module
```
PRO200.PGM (Main)
├── PROVIDER.PF
├── PROVIDE1.LF
├── PRO200D.DSPF
└── FCOUNTRY.SRVPGM
```

---

## Critical Missing Dependencies

### ⚠️ FCOUNTRY Service Program
**Status**: Source exists but service program not created  
**Impact**: CUS200.PGM and PRO200.PGM will fail to bind  
**Solution**: 
1. Compile COU300.RPGLE and COU301.RPGLE as modules
2. Create FCOUNTRY service program from these modules
3. Add FCOUNTRY to SAMPLE.BNDDIR

**Build Commands**:
```bash
CRTRPGMOD MODULE(SAMCO/COU300) SRCFILE(SAMCO/QRPGLESRC) SRCMBR(COU300)
CRTRPGMOD MODULE(SAMCO/COU301) SRCFILE(SAMCO/QRPGLESRC) SRCMBR(COU301)
CRTSRVPGM SRVPGM(SAMCO/FCOUNTRY) MODULE(SAMCO/COU300 SAMCO/COU301) +
          EXPORT(*SRCFILE) SRCFILE(SAMCO/QSRVSRC) SRCMBR(FCOUNTRY)
```

---

## Summary Statistics

- **Physical Files**: 11
- **Logical Files**: 13
- **Display Files**: 16
- **Service Program Modules**: 15
- **Service Programs**: 12
- **Application Programs**: 20+
- **Total Artifacts**: 85+

---

## Notes

1. All programs use `BNDDIR('SAMPLE')` to access service programs
2. Service programs provide reusable business logic
3. Logical files provide different access paths to physical files
4. Display files define the 5250 green screen user interface
5. SQL is used for sequences (CUSSEQ) and some tables (ARTIINF)
6. The application follows a modular architecture with clear separation of concerns

---

**Document Version**: 1.0  
**Last Updated**: December 15, 2025  
**Status**: Complete - Ready for build automation