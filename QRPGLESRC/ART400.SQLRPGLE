**FREE
//==============================================================================
// Program: ART400 - Article REST API Service Program Module
// Description: REST API procedures for Article CRUD operations
//              Designed to be exposed via IBM i Integrated Web Services (IWS)
// Author: Generated for Article Management Modernization
// Date: 2025-12-17
//==============================================================================

Ctl-Opt NoMain;
Ctl-Opt DatFmt(*ISO);
Ctl-Opt TimFmt(*ISO);

// Copy field definitions
/Copy QPROTOSRC,ARTICLE

// Data structures for JSON response
Dcl-Ds ArticleResponse Qualified Template;
  success Ind;
  message Char(256);
  article LikeDs(ArticleData);
End-Ds;

Dcl-Ds ArticleListResponse Qualified Template;
  success Ind;
  message Char(256);
  totalRecords Int(10);
  currentPage Int(10);
  pageSize Int(10);
  totalPages Int(10);
  hasMore Ind;
  articles LikeDs(ArticleData) Dim(100);
  articleCount Int(10);
End-Ds;

Dcl-Ds ArticleData Qualified Template;
  id Char(6);
  description Char(50);
  familyCode Char(3);
  familyDescription Char(50);
  vatCode Char(1);
  vatRate Packed(4:2);
  vatDescription Char(20);
  salePrice Packed(7:2);
  warehousePrice Packed(7:2);
  stock Packed(5:0);
  minimumQuantity Packed(5:0);
  deleted Char(1);
  createdDate Date;
  modifiedDate Timestamp;
  modifiedUser Char(11);
  priceWithVAT Packed(9:2);
End-Ds;

//==============================================================================
// Procedure: GetArticle
// Description: Get a single article by ID
// Parameters: articleId - Article ID to retrieve
// Returns: JSON string with article data
//==============================================================================
Dcl-Proc GetArticle Export;
  Dcl-Pi *N Varchar(4096);
    articleId Char(6) Const;
  End-Pi;

  Dcl-S jsonResponse Varchar(4096);
  Dcl-Ds response LikeDs(ArticleResponse);

  // Initialize response
  Clear response;
  response.success = *Off;

  // Query article with joins for family and VAT info
  Exec SQL
    SELECT 
      A.ARID,
      A.ARDESC,
      A.ARTIFA,
      COALESCE(F.FADESC, ''),
      A.ARVATCD,
      COALESCE(V.VATRATE, 0),
      COALESCE(V.VATDESC, ''),
      A.ARSALEPR,
      A.ARWHSPR,
      A.ARSTOCK,
      A.ARMINQTY,
      A.ARDEL,
      A.ARCREA,
      A.ARMOD,
      A.ARMODID
    INTO
      :response.article.id,
      :response.article.description,
      :response.article.familyCode,
      :response.article.familyDescription,
      :response.article.vatCode,
      :response.article.vatRate,
      :response.article.vatDescription,
      :response.article.salePrice,
      :response.article.warehousePrice,
      :response.article.stock,
      :response.article.minimumQuantity,
      :response.article.deleted,
      :response.article.createdDate,
      :response.article.modifiedDate,
      :response.article.modifiedUser
    FROM ARTICLE A
    LEFT JOIN FAMILLY F ON A.ARTIFA = F.FAID
    LEFT JOIN VATDEF V ON A.ARVATCD = V.VATCODE
    WHERE A.ARID = :articleId;

  If SQLCODE = 0;
    response.success = *On;
    response.message = 'Article retrieved successfully';
    
    // Calculate price with VAT
    response.article.priceWithVAT = 
      response.article.salePrice * 
      (1 + response.article.vatRate / 100);
  ElseIf SQLCODE = 100;
    response.message = 'Article not found';
  Else;
    response.message = 'Database error: ' + %Char(SQLCODE);
  EndIf;

  // Build JSON response
  jsonResponse = BuildArticleJSON(response);

  Return jsonResponse;
End-Proc;

//==============================================================================
// Procedure: ListArticles
// Description: Get paginated list of articles
// Parameters: 
//   page - Page number (1-based)
//   pageSize - Records per page
//   positionTo - Optional: Position to article ID
//   includeDeleted - Include soft-deleted records
// Returns: JSON string with article list
//==============================================================================
Dcl-Proc ListArticles Export;
  Dcl-Pi *N Varchar(32000);
    page Int(10) Const;
    pageSize Int(10) Const;
    positionTo Char(6) Const Options(*NoPass);
    includeDeleted Ind Const Options(*NoPass);
  End-Pi;

  Dcl-S jsonResponse Varchar(32000);
  Dcl-Ds response LikeDs(ArticleListResponse);
  Dcl-S offset Int(10);
  Dcl-S whereClause Varchar(256);
  Dcl-S posTo Char(6);
  Dcl-S inclDel Ind;
  Dcl-S i Int(10);

  // Handle optional parameters
  If %Parms() >= 3;
    posTo = positionTo;
  Else;
    posTo = '';
  EndIf;

  If %Parms() >= 4;
    inclDel = includeDeleted;
  Else;
    inclDel = *Off;
  EndIf;

  // Initialize response
  Clear response;
  response.success = *Off;
  response.currentPage = page;
  response.pageSize = pageSize;
  response.articleCount = 0;

  // Build WHERE clause
  If inclDel;
    whereClause = '';
  Else;
    whereClause = 'WHERE A.ARDEL = '' ''';
  EndIf;

  // Add position-to filter
  If posTo <> '';
    If whereClause <> '';
      whereClause += ' AND ';
    Else;
      whereClause = 'WHERE ';
    EndIf;
    whereClause += 'A.ARID >= ''' + %Trim(posTo) + '''';
  EndIf;

  // Get total count
  Exec SQL
    SELECT COUNT(*)
    INTO :response.totalRecords
    FROM ARTICLE A;

  If SQLCODE <> 0;
    response.message = 'Error counting records: ' + %Char(SQLCODE);
    jsonResponse = BuildListJSON(response);
    Return jsonResponse;
  EndIf;

  // Calculate pagination
  response.totalPages = %Div(response.totalRecords + pageSize - 1 : pageSize);
  offset = (page - 1) * pageSize;
  response.hasMore = (page < response.totalPages);

  // Declare cursor for article list
  Exec SQL
    DECLARE C1 CURSOR FOR
    SELECT 
      A.ARID,
      A.ARDESC,
      A.ARTIFA,
      COALESCE(F.FADESC, ''),
      A.ARVATCD,
      COALESCE(V.VATRATE, 0),
      COALESCE(V.VATDESC, ''),
      A.ARSALEPR,
      A.ARWHSPR,
      A.ARSTOCK,
      A.ARMINQTY,
      A.ARDEL,
      A.ARCREA,
      A.ARMOD,
      A.ARMODID
    FROM ARTICLE A
    LEFT JOIN FAMILLY F ON A.ARTIFA = F.FAID
    LEFT JOIN VATDEF V ON A.ARVATCD = V.VATCODE
    ORDER BY A.ARID
    OFFSET :offset ROWS
    FETCH FIRST :pageSize ROWS ONLY;

  Exec SQL OPEN C1;

  If SQLCODE = 0;
    i = 1;
    DoU SQLCODE <> 0 Or i > pageSize;
      Exec SQL
        FETCH C1 INTO
          :response.articles(i).id,
          :response.articles(i).description,
          :response.articles(i).familyCode,
          :response.articles(i).familyDescription,
          :response.articles(i).vatCode,
          :response.articles(i).vatRate,
          :response.articles(i).vatDescription,
          :response.articles(i).salePrice,
          :response.articles(i).warehousePrice,
          :response.articles(i).stock,
          :response.articles(i).minimumQuantity,
          :response.articles(i).deleted,
          :response.articles(i).createdDate,
          :response.articles(i).modifiedDate,
          :response.articles(i).modifiedUser;

      If SQLCODE = 0;
        // Calculate price with VAT
        response.articles(i).priceWithVAT = 
          response.articles(i).salePrice * 
          (1 + response.articles(i).vatRate / 100);
        i += 1;
      EndIf;
    EndDo;

    response.articleCount = i - 1;
    response.success = *On;
    response.message = 'Articles retrieved successfully';
  Else;
    response.message = 'Error opening cursor: ' + %Char(SQLCODE);
  EndIf;

  Exec SQL CLOSE C1;

  // Build JSON response
  jsonResponse = BuildListJSON(response);

  Return jsonResponse;
End-Proc;

//==============================================================================
// Procedure: BuildArticleJSON
// Description: Build JSON string for single article response
//==============================================================================
Dcl-Proc BuildArticleJSON;
  Dcl-Pi *N Varchar(4096);
    response LikeDs(ArticleResponse) Const;
  End-Pi;

  Dcl-S json Varchar(4096);

  json = '{';
  json += '"success":' + %Char(response.success) + ',';
  json += '"message":"' + %Trim(response.message) + '"';

  If response.success;
    json += ',"article":{';
    json += '"id":"' + %Trim(response.article.id) + '",';
    json += '"description":"' + %Trim(response.article.description) + '",';
    json += '"familyCode":"' + %Trim(response.article.familyCode) + '",';
    json += '"familyDescription":"' + %Trim(response.article.familyDescription) + '",';
    json += '"vatCode":"' + %Trim(response.article.vatCode) + '",';
    json += '"vatRate":' + %Char(response.article.vatRate) + ',';
    json += '"vatDescription":"' + %Trim(response.article.vatDescription) + '",';
    json += '"salePrice":' + %Char(response.article.salePrice) + ',';
    json += '"warehousePrice":' + %Char(response.article.warehousePrice) + ',';
    json += '"stock":' + %Char(response.article.stock) + ',';
    json += '"minimumQuantity":' + %Char(response.article.minimumQuantity) + ',';
    json += '"deleted":"' + response.article.deleted + '",';
    json += '"priceWithVAT":' + %Char(response.article.priceWithVAT);
    json += '}';
  EndIf;

  json += '}';

  Return json;
End-Proc;

//==============================================================================
// Procedure: BuildListJSON
// Description: Build JSON string for article list response
//==============================================================================
Dcl-Proc BuildListJSON;
  Dcl-Pi *N Varchar(32000);
    response LikeDs(ArticleListResponse) Const;
  End-Pi;

  Dcl-S json Varchar(32000);
  Dcl-S i Int(10);

  json = '{';
  json += '"success":' + %Char(response.success) + ',';
  json += '"message":"' + %Trim(response.message) + '",';
  json += '"pagination":{';
  json += '"currentPage":' + %Char(response.currentPage) + ',';
  json += '"pageSize":' + %Char(response.pageSize) + ',';
  json += '"totalRecords":' + %Char(response.totalRecords) + ',';
  json += '"totalPages":' + %Char(response.totalPages) + ',';
  json += '"hasMore":' + %Char(response.hasMore);
  json += '},';
  json += '"articles":[';

  For i = 1 To response.articleCount;
    If i > 1;
      json += ',';
    EndIf;
    json += '{';
    json += '"id":"' + %Trim(response.articles(i).id) + '",';
    json += '"description":"' + %Trim(response.articles(i).description) + '",';
    json += '"familyCode":"' + %Trim(response.articles(i).familyCode) + '",';
    json += '"familyDescription":"' + %Trim(response.articles(i).familyDescription) + '",';
    json += '"vatCode":"' + %Trim(response.articles(i).vatCode) + '",';
    json += '"vatRate":' + %Char(response.articles(i).vatRate) + ',';
    json += '"salePrice":' + %Char(response.articles(i).salePrice) + ',';
    json += '"warehousePrice":' + %Char(response.articles(i).warehousePrice) + ',';
    json += '"stock":' + %Char(response.articles(i).stock) + ',';
    json += '"minimumQuantity":' + %Char(response.articles(i).minimumQuantity) + ',';
    json += '"deleted":"' + response.articles(i).deleted + '"';
    json += '}';
  EndFor;

  json += ']}';

  Return json;
End-Proc;