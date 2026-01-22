
-- Correct query for FAMILLY table
SELECT
    PACODE as code,
    PARM2 as description -- Description
FROM SAMCO.PARAMETER
WHERE PACODE = 'VAT'
ORDER BY PARM3;

SELECT * from SAMCO.PARAMETER;


SELECT 
    FAID as code,
    FADESC as description
FROM SAMCO.FAMILLY
ORDER BY FAID;

INSERT INTO SAMCO.ARTICLE (
    ARID,
    ARDESC,
    ARSALEPR,
    ARWHSPR,
    ARTIFA,
    ARSTOCK,
    ARMINQTY,
    ARCUSQTY,
    ARPURQTY,
    ARVATCD,
    ARCREA,
    ARMOD,
    ARMODID,
    ARDEL
) VALUES (
    'ART00B',  -- Article ID
    'desc',  -- Description
    2,  -- Sale Price
    2,  -- Warehouse Price
    'CLO',  -- Family Code
    1,  -- Stock
    1,  -- Minimum Quantity
    0,  -- Customer Quantity (default 0)
    0,  -- Purchase Quantity (default 0)
    '0',  -- VAT Code
    CURRENT_DATE,  -- Creation Date
    CURRENT_TIMESTAMP,  -- Modified Timestamp
    CURRENT_USER,  -- Modified User
    ''  -- Not deleted (empty string)
);


SELECT * from SAMCO.ARTICLE;

DELETE FROM SAMCO.ARTICLE WHERE ARID = '';