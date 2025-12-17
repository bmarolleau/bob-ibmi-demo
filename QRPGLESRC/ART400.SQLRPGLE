**FREE
//==============================================================================
// Program: ART400 - Article REST API Service Program Module
// Description: Simple REST API to list all articles
//              Designed for IBM i Integrated Web Services (IWS)
// Author: Generated for Article Management Modernization
// Date: 2025-12-17
//==============================================================================

Ctl-Opt NoMain;
Ctl-Opt DatFmt(*ISO);
Ctl-Opt TimFmt(*ISO);

// Copy field definitions from IFS
/copy QPROTOSRC/ARTICLE

//==============================================================================
// Data Structure for Article List Item
//==============================================================================
Dcl-Ds ArticleItem Qualified Template;
  id Char(6);
  description Char(50);
  familyCode Char(3);
  familyDescription Char(50);
  vatCode Char(1);
  vatRate Packed(4:2);
  salePrice Packed(7:2);
  warehousePrice Packed(7:2);
  stock Packed(5:0);
  minimumQuantity Packed(5:0);
  deleted Char(1);
End-Ds;

//==============================================================================
// Data Structure for Article List Response
// IWS will automatically convert this to JSON
//==============================================================================
Dcl-Ds ArticleListResponse Qualified Template;
  success Ind;
  message Char(256);
  totalRecords Int(10);
  articleData LikeDs(ArticleItem) Dim(1000);  // Max 1000 articles
  articleCount Int(10);
End-Ds;

//==============================================================================
// Procedure: ListAllArticles
// Description: Get all articles (no pagination)
// Parameters: None
// Returns: Data structure (IWS converts to JSON)
//==============================================================================
Dcl-Proc ListAllArticles Export;
  Dcl-Pi *N LikeDs(ArticleListResponse);
  End-Pi;

  Dcl-Ds response LikeDs(ArticleListResponse);
  Dcl-S i Int(10);

  // Initialize response
  Clear response;
  response.success = *Off;
  response.articleCount = 0;

  // Declare cursor for all articles
  Exec SQL
    DECLARE C1 CURSOR FOR
    SELECT 
      A.ARID,
      A.ARDESC,
      A.ARTIFA,
      COALESCE(F.FADESC, ''),
      A.ARVATCD,
      COALESCE(V.VATRATE, 0),
      A.ARSALEPR,
      A.ARWHSPR,
      A.ARSTOCK,
      A.ARMINQTY,
      A.ARDEL
    FROM ARTICLE A
    LEFT JOIN FAMILLY F ON A.ARTIFA = F.FAID
    LEFT JOIN VATDEF V ON A.ARVATCD = V.VATCODE
    WHERE A.ARDEL = ' '
    ORDER BY A.ARID;

  Exec SQL OPEN C1;

  If SQLCODE = 0;
    i = 1;
    DoU SQLCODE <> 0 Or i > 1000;  // Max 1000 articles
      Exec SQL
        FETCH C1 INTO
          :response.articleData(i).id,
          :response.articleData(i).description,
          :response.articleData(i).familyCode,
          :response.articleData(i).familyDescription,
          :response.articleData(i).vatCode,
          :response.articleData(i).vatRate,
          :response.articleData(i).salePrice,
          :response.articleData(i).warehousePrice,
          :response.articleData(i).stock,
          :response.articleData(i).minimumQuantity,
          :response.articleData(i).deleted;

      If SQLCODE = 0;
        i += 1;
      EndIf;
    EndDo;

    response.articleCount = i - 1;
    response.totalRecords = response.articleCount;
    response.success = *On;
    response.message = 'Articles retrieved successfully';
  Else;
    response.message = 'Error opening cursor: ' + %Char(SQLCODE);
  EndIf;

  Exec SQL CLOSE C1;

  Return response;
End-Proc;