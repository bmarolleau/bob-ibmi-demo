       IDENTIFICATION DIVISION.
       PROGRAM-ID. INVUPDT.
       AUTHOR. SYSTEM PROGRAMMER.
      *****************************************************************
      * INVENTORY UPDATE PROGRAM                                      *
      * UPDATES INVENTORY QUANTITIES FROM TRANSACTION FILE            *
      *****************************************************************
       ENVIRONMENT DIVISION.
       CONFIGURATION SECTION.
       SOURCE-COMPUTER. IBM-370.
       OBJECT-COMPUTER. IBM-370.
       
       INPUT-OUTPUT SECTION.
       FILE-CONTROL.
           SELECT INVMAST ASSIGN TO INVFILE
               ORGANIZATION IS INDEXED
               ACCESS MODE IS RANDOM
               RECORD KEY IS INV-ITEM-NO
               FILE STATUS IS INV-STATUS.
           
           SELECT TRANFILE ASSIGN TO TRANS
               ORGANIZATION IS SEQUENTIAL
               FILE STATUS IS TRAN-STATUS.
       
       DATA DIVISION.
       FILE SECTION.
       FD  INVMAST
           LABEL RECORDS ARE STANDARD.
       01  INV-RECORD.
           05  INV-ITEM-NO             PIC X(10).
           05  INV-DESCRIPTION         PIC X(40).
           05  INV-QTY-ON-HAND         PIC S9(7) COMP-3.
           05  INV-UNIT-PRICE          PIC S9(5)V99 COMP-3.
           05  FILLER                  PIC X(30).
       
       FD  TRANFILE
           LABEL RECORDS ARE STANDARD.
       01  TRAN-RECORD.
           05  TRAN-ITEM-NO            PIC X(10).
           05  TRAN-TYPE               PIC X.
               88  TRAN-RECEIPT        VALUE 'R'.
               88  TRAN-ISSUE          VALUE 'I'.
           05  TRAN-QUANTITY           PIC S9(7).
           05  FILLER                  PIC X(62).
       
       WORKING-STORAGE SECTION.
       01  INV-STATUS                  PIC XX.
       01  TRAN-STATUS                 PIC XX.
           88  TRAN-EOF                VALUE '10'.
       
       01  WS-COUNTERS.
           05  WS-TRANS-READ           PIC 9(5) VALUE ZERO.
           05  WS-TRANS-PROCESSED      PIC 9(5) VALUE ZERO.
           05  WS-TRANS-ERROR          PIC 9(5) VALUE ZERO.
       
       PROCEDURE DIVISION.
       000-MAIN-ROUTINE.
           PERFORM 100-INITIALIZATION
           PERFORM 200-PROCESS-TRANSACTIONS
               UNTIL TRAN-EOF
           PERFORM 300-WRAP-UP
           STOP RUN.
       
       100-INITIALIZATION.
           OPEN I-O INVMAST
           OPEN INPUT TRANFILE
           READ TRANFILE
               AT END SET TRAN-EOF TO TRUE
           END-READ.
       
       200-PROCESS-TRANSACTIONS.
           ADD 1 TO WS-TRANS-READ
           MOVE TRAN-ITEM-NO TO INV-ITEM-NO
           READ INVMAST
               INVALID KEY
                   DISPLAY 'ITEM NOT FOUND: ' TRAN-ITEM-NO
                   ADD 1 TO WS-TRANS-ERROR
               NOT INVALID KEY
                   PERFORM 210-UPDATE-INVENTORY
           END-READ
           READ TRANFILE
               AT END SET TRAN-EOF TO TRUE
           END-READ.
       
       210-UPDATE-INVENTORY.
           IF TRAN-RECEIPT
               ADD TRAN-QUANTITY TO INV-QTY-ON-HAND
           ELSE
               SUBTRACT TRAN-QUANTITY FROM INV-QTY-ON-HAND
           END-IF
           REWRITE INV-RECORD
           ADD 1 TO WS-TRANS-PROCESSED.
       
       300-WRAP-UP.
           DISPLAY 'TRANSACTIONS READ:      ' WS-TRANS-READ
           DISPLAY 'TRANSACTIONS PROCESSED: ' WS-TRANS-PROCESSED
           DISPLAY 'TRANSACTIONS IN ERROR:  ' WS-TRANS-ERROR
           CLOSE INVMAST
           CLOSE TRANFILE.

* Made with Bob
