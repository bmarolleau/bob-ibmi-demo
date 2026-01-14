       IDENTIFICATION DIVISION.
       PROGRAM-ID. OLDCUST.
       AUTHOR. IBM CORPORATION.
       DATE-WRITTEN. 01/15/2024.
      *****************************************************************
      * CUSTOMER MASTER FILE MAINTENANCE PROGRAM                      *
      * THIS PROGRAM MAINTAINS THE CUSTOMER MASTER FILE               *
      *****************************************************************
       ENVIRONMENT DIVISION.
       CONFIGURATION SECTION.
       SOURCE-COMPUTER. IBM-370.
       OBJECT-COMPUTER. IBM-370.
       
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT CUSTFILE ASSIGN TO CUSTMAST
               ORGANIZATION IS INDEXED
               ACCESS MODE IS DYNAMIC
               RECORD KEY IS CUST-ID
               FILE STATUS IS WS-FILE-STATUS.
       
       DATA DIVISION.
       FILE SECTION.
       FD  CUSTFILE
           LABEL RECORDS ARE STANDARD
           RECORD CONTAINS 200 CHARACTERS.
       01  CUST-RECORD.
           05  CUST-ID                 PIC X(10).
           05  CUST-NAME               PIC X(30).
           05  CUST-ADDRESS            PIC X(50).
           05  CUST-CITY               PIC X(20).
           05  CUST-STATE              PIC XX.
           05  CUST-ZIP                PIC X(10).
           05  CUST-PHONE              PIC X(15).
           05  CUST-BALANCE            PIC S9(7)V99 COMP-3.
           05  FILLER                  PIC X(56).
       
       WORKING-STORAGE SECTION.
       01  WS-FILE-STATUS              PIC XX.
           88  WS-FILE-OK              VALUE '00'.
           88  WS-FILE-EOF             VALUE '10'.
       
       01  WS-CUSTOMER-COUNT           PIC 9(5) VALUE ZERO.
       
       PROCEDURE DIVISION.
       0000-MAIN-LOGIC.
           PERFORM 1000-INITIALIZE
           PERFORM 2000-PROCESS-RECORDS
               UNTIL WS-FILE-EOF
           PERFORM 3000-TERMINATE
           STOP RUN.
       
       1000-INITIALIZE.
           OPEN INPUT CUSTFILE
           IF NOT WS-FILE-OK
               DISPLAY 'ERROR OPENING CUSTOMER FILE'
               STOP RUN
           END-IF
           READ CUSTFILE
               AT END SET WS-FILE-EOF TO TRUE
           END-READ.
       
       2000-PROCESS-RECORDS.
           ADD 1 TO WS-CUSTOMER-COUNT
           DISPLAY 'PROCESSING CUSTOMER: ' CUST-ID
           READ CUSTFILE
               AT END SET WS-FILE-EOF TO TRUE
           END-READ.
       
       3000-TERMINATE.
           DISPLAY 'TOTAL CUSTOMERS PROCESSED: ' WS-CUSTOMER-COUNT
           CLOSE CUSTFILE.

* Made with Bob
