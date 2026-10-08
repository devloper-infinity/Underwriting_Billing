/*
    Read-only source for the Sent To Client Excel download.
    ProjectName 561 is ProjectID 70.  The archived rows already represent the
    invoiced month, so this procedure must never rebuild InfinityBilling_OrderDetail.
*/
IF OBJECT_ID(N'dbo.usp_GetSentToClientMonthlyInvoiceExcel', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetSentToClientMonthlyInvoiceExcel;
GO

CREATE PROCEDURE dbo.usp_GetSentToClientMonthlyInvoiceExcel
    @ProjectID      INT,
    @BillingPeriod  NVARCHAR(1000)
AS
BEGIN
    SET NOCOUNT ON;

    IF @ProjectID = 70
    BEGIN
        ;WITH LoanData AS
        (
            SELECT
                W.TrackingSheetID, W.Temp2 AS [PRP ID], W.Temp3 AS [Seller Loan ID],
                W.Temp1 AS [Infinity Deal#], W.Temp165 AS [Client Name],
                W.Temp8 AS [Purchase Entity], W.Temp45 AS [Received Date],
                W.Temp37 AS [Dispatch Date], W.Temp40 AS [Original Balance],
                W.Temp189 AS [Channel], ISNULL(CM.CleanLoan, 'No') AS [Clean Loan? (Yes/No)],
                CASE WHEN ISNULL(CM.CleanLoan, 'No') = 'Yes' THEN 'No'
                     WHEN W.Temp38 = 'Yes' THEN 'Yes'
                     ELSE 'No' END AS [TRID Charges Applicable? (Yes/No)],
                CASE WHEN LEN(ISNULL(W.Temp116, '')) > 1 AND ISNULL(CM.CleanLoan, 'No') = 'No'
                     THEN 'Yes' ELSE 'No' END AS [Loan Docs Inventory Charges Applicable (Yes/No)],
                W.Temp116 AS [Loan Docs Inventory (in Mins)],
                CASE WHEN ISNUMERIC(REPLACE(REPLACE(REPLACE(W.Temp40, ' ', ''), ',', ''), '$', '')) = 1
                          AND CAST(REPLACE(REPLACE(REPLACE(W.Temp40, ' ', ''), ',', ''), '$', '') AS DECIMAL(18,2)) >= 1250000
                     THEN 'Yes' ELSE 'No' END AS [Uninsured Loan? (Yes/No)],
                ROW_NUMBER() OVER
                (
                    PARTITION BY W.Temp2, W.Temp3, W.Temp1, W.Temp165, W.Temp8,
                                 W.Temp45, W.Temp37, W.Temp40, W.Temp189,
                                 ISNULL(CM.CleanLoan, 'No'), W.Temp38, W.Temp116
                    ORDER BY W.TrackingSheetID
                ) AS ChargeRow
            FROM dbo.InfinityBilling_OrderDetail_MonthlyBilling W
            LEFT JOIN dbo.InfinityBilling_ChannelMaster CM ON CM.Channel = W.Temp189
            WHERE W.ProjectID = @ProjectID
              AND W.BillingPeriod = @BillingPeriod
        ), Costed AS
        (
            SELECT L.*,
                CAST(CASE WHEN L.ChargeRow <> 1 THEN 0
                          WHEN L.[Clean Loan? (Yes/No)] = 'Yes'
                          THEN COALESCE(CLDeal.CleanLoanRate, CLProject.CleanLoanRate, 0)
                          ELSE ISNULL(TRY_CONVERT(DECIMAL(18,2), PerLoan.IBV_Remark), 0) END AS DECIMAL(18,2)) AS PerLoanCharge,
                CAST(CASE WHEN L.ChargeRow <> 1 THEN 0
                          WHEN L.[Uninsured Loan? (Yes/No)] = 'No'
                          THEN ISNULL(TRY_CONVERT(DECIMAL(18,2), Ins.IBV_Remark), 0) ELSE 0 END AS DECIMAL(18,2)) AS InsuranceCharge,
                CAST(CASE WHEN L.ChargeRow <> 1 THEN 0
                          WHEN L.[Clean Loan? (Yes/No)] = 'No' AND L.[TRID Charges Applicable? (Yes/No)] = 'Yes'
                          THEN ISNULL(TRY_CONVERT(DECIMAL(18,2), Trid.IBV_Remark), 0) ELSE 0 END AS DECIMAL(18,2)) AS TridCharge,
                CAST(CASE WHEN L.ChargeRow <> 1 THEN 0
                          WHEN L.[Clean Loan? (Yes/No)] = 'No'
                               AND L.[Loan Docs Inventory Charges Applicable (Yes/No)] = 'Yes'
                          THEN (ISNULL(TRY_CONVERT(DECIMAL(18,2), L.[Loan Docs Inventory (in Mins)]), 0) / 60)
                               * ISNULL(TRY_CONVERT(DECIMAL(18,2), LoanDocs.IBV_Remark), 0)
                          ELSE 0 END AS DECIMAL(18,2)) AS DocumentCharge
            FROM LoanData L
            LEFT JOIN dbo.InfinityBilling_CleanLoanCostingMaster CLDeal
              ON CLDeal.ProjectID = @ProjectID AND CLDeal.DealNo = L.[Infinity Deal#]
            LEFT JOIN dbo.InfinityBilling_CleanLoanCostingMaster CLProject
              ON CLProject.ProjectID = @ProjectID AND CLProject.DealNo IS NULL
            LEFT JOIN dbo.InfinityBilling_ParametersValuesCostingUW PerLoan
              ON PerLoan.IBV_ClientProcess = L.[Infinity Deal#] AND PerLoan.IBV_ParameterID = 1
            LEFT JOIN dbo.InfinityBilling_ParametersValuesCostingUW Ins
              ON Ins.IBV_ClientProcess = L.[Infinity Deal#] AND Ins.IBV_ParameterID = 40
            LEFT JOIN dbo.InfinityBilling_ParametersValuesCostingUW Trid
              ON Trid.IBV_ClientProcess = L.[Infinity Deal#] AND Trid.IBV_ParameterID = 41
            LEFT JOIN dbo.InfinityBilling_ParametersValuesCostingUW LoanDocs
              ON LoanDocs.IBV_ClientProcess = L.[Infinity Deal#] AND LoanDocs.IBV_ParameterID = 107
        )
        SELECT TrackingSheetID, [PRP ID], [Seller Loan ID], [Infinity Deal#], [Client Name],
               [Purchase Entity], '' AS [Paying Entity], [Received Date], [Dispatch Date],
               [Original Balance], [Channel], [Clean Loan? (Yes/No)],
               [TRID Charges Applicable? (Yes/No)],
               [Loan Docs Inventory Charges Applicable (Yes/No)],
               [Loan Docs Inventory (in Mins)], PerLoanCharge AS [Per Loan Charges],
               InsuranceCharge AS [Repurchase Insurance coverage],
               TridCharge AS [TRID loan Charges], DocumentCharge AS [Loan Document Inventory Charges],
               CAST(PerLoanCharge + InsuranceCharge + TridCharge + DocumentCharge AS DECIMAL(18,2)) AS Total,
               [Uninsured Loan? (Yes/No)]
        INTO #MonthlyResult
        FROM Costed;

        /* The archive does not retain the old CleanLoan flag that controlled
           TRID/document charges. Reconcile those optional components to the
           amount that was actually invoiced, without changing base/insurance. */
        DECLARE @InvoiceAmount DECIMAL(18,2);
        DECLARE @BaseAmount DECIMAL(18,2);
        DECLARE @TridAmount DECIMAL(18,2);
        DECLARE @DocumentAmount DECIMAL(18,2);
        DECLARE @IncludeTrid BIT = 0;
        DECLARE @IncludeDocument BIT = 0;

        SELECT TOP (1) @InvoiceAmount =
               ISNULL(TRY_CONVERT(DECIMAL(18,2), NULLIF(Invoice_Amount, N'')),
                      TRY_CONVERT(DECIMAL(18,2), TotalAmount))
        FROM dbo.InfinityBilling_InvoiceMaster
        WHERE ProjectID = @ProjectID AND BillingPeriod = @BillingPeriod
          AND ISNULL(DFlag, 0) = 0
        ORDER BY InvoiceID DESC;

        SELECT @BaseAmount = SUM([Per Loan Charges] + [Repurchase Insurance coverage]),
               @TridAmount = SUM([TRID loan Charges]),
               @DocumentAmount = SUM([Loan Document Inventory Charges])
        FROM #MonthlyResult;

        IF ABS((@BaseAmount + @TridAmount) - @InvoiceAmount) < ABS(@BaseAmount - @InvoiceAmount)
            SET @IncludeTrid = 1;
        IF ABS((@BaseAmount + @DocumentAmount) - @InvoiceAmount) <
           ABS((@BaseAmount + CASE WHEN @IncludeTrid = 1 THEN @TridAmount ELSE 0 END) - @InvoiceAmount)
        BEGIN
            SET @IncludeTrid = 0;
            SET @IncludeDocument = 1;
        END;
        IF ABS((@BaseAmount + @TridAmount + @DocumentAmount) - @InvoiceAmount) <
           ABS((@BaseAmount + CASE WHEN @IncludeTrid = 1 THEN @TridAmount ELSE 0 END
                            + CASE WHEN @IncludeDocument = 1 THEN @DocumentAmount ELSE 0 END) - @InvoiceAmount)
        BEGIN
            SET @IncludeTrid = 1;
            SET @IncludeDocument = 1;
        END;

        UPDATE #MonthlyResult
        SET [TRID loan Charges] = CASE WHEN @IncludeTrid = 1 THEN [TRID loan Charges] ELSE 0 END,
            [Loan Document Inventory Charges] = CASE WHEN @IncludeDocument = 1 THEN [Loan Document Inventory Charges] ELSE 0 END;
        UPDATE #MonthlyResult
        SET Total = [Per Loan Charges] + [Repurchase Insurance coverage]
                  + [TRID loan Charges] + [Loan Document Inventory Charges];

        DECLARE @OtherBillingPeriod NVARCHAR(100);
        DECLARE @PeriodStart DATE = TRY_CONVERT(DATE,
            LTRIM(RTRIM(LEFT(@BillingPeriod, CHARINDEX('~', @BillingPeriod) - 1))), 106);
        SET @OtherBillingPeriod = DATENAME(MONTH, @PeriodStart) + N'~'
                                + CONVERT(NVARCHAR(4), YEAR(@PeriodStart));

        ALTER TABLE #MonthlyResult ADD OtherBillingSort BIT NOT NULL DEFAULT (0);

        INSERT INTO #MonthlyResult
            (TrackingSheetID, [PRP ID], [Seller Loan ID], [Infinity Deal#], [Client Name],
             [Purchase Entity], [Paying Entity], [Received Date], [Dispatch Date],
             [Original Balance], [Channel], [Clean Loan? (Yes/No)],
             [TRID Charges Applicable? (Yes/No)],
             [Loan Docs Inventory Charges Applicable (Yes/No)],
             [Loan Docs Inventory (in Mins)], [Per Loan Charges],
             [Repurchase Insurance coverage], [TRID loan Charges],
             [Loan Document Inventory Charges], Total,
             [Uninsured Loan? (Yes/No)], OtherBillingSort)
        SELECT 0, DisplayName, ChargeType, N'', N'',
               N'', N'', N'', N'', N'', N'', N'', N'', N'', N'',
               0, 0, 0, 0,
               ISNULL(TRY_CONVERT(DECIMAL(18,2), Amount), 0), N'', 1
        FROM dbo.InfinityBilling_OtherBillingAmount
        WHERE BillingPeriod = @OtherBillingPeriod
          AND (ProjectId = CONVERT(NVARCHAR(20), @ProjectID) OR ProjectId IS NULL)
          AND NULLIF(LTRIM(RTRIM(ChargeType)), '') IS NOT NULL;

        SELECT TrackingSheetID, [PRP ID], [Seller Loan ID], [Infinity Deal#], [Client Name],
               [Purchase Entity], [Paying Entity], [Received Date], [Dispatch Date],
               [Original Balance], [Channel], [Clean Loan? (Yes/No)],
               [TRID Charges Applicable? (Yes/No)],
               [Loan Docs Inventory Charges Applicable (Yes/No)],
               [Loan Docs Inventory (in Mins)], [Per Loan Charges],
               [Repurchase Insurance coverage], [TRID loan Charges],
               [Loan Document Inventory Charges], Total,
               [Uninsured Loan? (Yes/No)]
        FROM #MonthlyResult
        ORDER BY OtherBillingSort, TrackingSheetID;
        SELECT TOP (1)
               ISNULL(TRY_CONVERT(DECIMAL(18,2), NULLIF(Invoice_Amount, N'')),
                      TRY_CONVERT(DECIMAL(18,2), TotalAmount)) AS TotalCost
        FROM dbo.InfinityBilling_InvoiceMaster
        WHERE ProjectID = @ProjectID
          AND BillingPeriod = @BillingPeriod
          AND ISNULL(DFlag, 0) = 0
        ORDER BY InvoiceID DESC;
        RETURN;
    END;

    /* Other projects: return the archived loan-level fields with their existing
       configured Excel headings.  This remains read-only and month-specific. */
    DECLARE @Columns NVARCHAR(MAX);
    DECLARE @Sql NVARCHAR(MAX);

    SELECT @Columns = STUFF((
        SELECT N',' + QUOTENAME(M.ColumnName) + N' AS ' + QUOTENAME(M.FieldName)
        FROM
        (
            SELECT DISTINCT C.ColumnName,
                   (SELECT DFM.FieldName
                    FROM InfinityERP.dbo.WBT_DomianWiseFieldMaster DFM
                    WHERE DFM.DomainFieldID = PWF.FieldName) AS FieldName,
                   CM.ProjectFieldID
            FROM InfinityERP.dbo.WBT_ColumnMapping CM
            INNER JOIN InfinityERP.dbo.WBT_ColumnMaster C
                ON C.ColumnId = CM.CoumnID
            INNER JOIN InfinityERP.dbo.WBT_ProjectWiseFieldMaster PWF
                ON PWF.ProjectFieldId = CM.ProjectFieldID
            WHERE PWF.ProjectId = REPLACE(@ProjectID, 171, 83)
              AND C.ColumnName <> N'ProjectID'
        ) M
        WHERE M.FieldName IS NOT NULL
        ORDER BY M.ProjectFieldID
        FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)'), 1, 1, N'');

    IF NULLIF(@Columns, N'') IS NULL
        THROW 50002, 'No configured loan-level fields were found for this project.', 1;

    SET @Sql = N'SELECT TrackingSheetID,' + @Columns
             + N' FROM dbo.InfinityBilling_OrderDetail_MonthlyBilling'
             + N' WHERE ProjectID = @PProjectID AND BillingPeriod = @PBillingPeriod;'
             + N' SELECT CAST(0 AS DECIMAL(18,2)) AS TotalCost;';

    EXEC sys.sp_executesql @Sql,
         N'@PProjectID INT, @PBillingPeriod NVARCHAR(1000)',
         @PProjectID = @ProjectID, @PBillingPeriod = @BillingPeriod;
END;
GO
