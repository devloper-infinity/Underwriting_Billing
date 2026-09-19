SET XACT_ABORT ON;
BEGIN TRANSACTION;

IF OBJECT_ID(N'dbo.usp_AllVendorCostingComparison', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_AllVendorCostingComparison;
IF OBJECT_ID(N'dbo.usp_AllVendorCostingInvoiceDetails', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_AllVendorCostingInvoiceDetails;
IF OBJECT_ID(N'dbo.ufn_AllVendorCostingNormalized', N'IF') IS NOT NULL
    DROP FUNCTION dbo.ufn_AllVendorCostingNormalized;

-- Keep the legacy report aligned with the ERP process field.
IF OBJECT_ID(N'dbo.usp_AllVendorCosting', N'P') IS NOT NULL
BEGIN
    DECLARE @LegacySql NVARCHAR(MAX)=OBJECT_DEFINITION(OBJECT_ID(N'dbo.usp_AllVendorCosting'));
    SET @LegacySql=REPLACE(@LegacySql,N'@InvoiceType, Process, ProjectNo',N'@InvoiceType, ERPProcess, ProjectNo');
    SET @LegacySql=REPLACE(@LegacySql,N'group by Process, ProjectNo',N'group by ERPProcess, ProjectNo');
    SET @LegacySql=STUFF(@LegacySql,1,LEN(N'create procedure'),N'ALTER procedure');
    EXEC sys.sp_executesql @LegacySql;
END;
GO

CREATE FUNCTION dbo.ufn_AllVendorCostingNormalized
(
    @FromDate DATE,
    @ToDate DATE
)
RETURNS TABLE
AS
RETURN
(
    WITH Rates AS
    (
        SELECT
            (SELECT TOP (1) TRY_CONVERT(DECIMAL(18,2), Rate) FROM [Infinity-UWVendorBilling].dbo.VenodrRateConfigurationMaster WHERE Vendor=N'Scienna' ORDER BY TRY_CONVERT(DATE, FormDate) DESC) SciennaRate,
            (SELECT TOP (1) TRY_CONVERT(DECIMAL(18,2), Rate) FROM [Infinity-UWVendorBilling].dbo.VenodrRateConfigurationMaster WHERE Vendor=N'Compliance') ComplianceRate,
            (SELECT TOP (1) TRY_CONVERT(DECIMAL(18,2), Rate) FROM [Infinity-UWVendorBilling].dbo.VenodrRateConfigurationMaster WHERE Vendor=N'Loan Logics') LoanLogicsRate,
            (SELECT TOP (1) TRY_CONVERT(DECIMAL(18,2), Rate) FROM [Infinity-UWVendorBilling].dbo.VenodrRateConfigurationMaster WHERE Vendor=N'LauraMac') LauraMacRate
    ),
    SciennaUsage AS
    (
        SELECT s.Month, s.Year, NULLIF(LTRIM(RTRIM(s.Client)), N'') Project,
               SUM(ISNULL(TRY_CONVERT(DECIMAL(18,2), REPLACE(REPLACE(s.UsageFees,N'$',N''),N',',N'')),0)) USD,
               SUM(ISNULL(TRY_CONVERT(INT, s.LoansReviewed),0)) Volume
        FROM [Infinity-UWVendorBilling].dbo.Scienna s
        WHERE TRY_CONVERT(DATE,CONCAT(s.Year,RIGHT(N'0'+CONVERT(NVARCHAR(2),
              CASE s.Month WHEN N'January' THEN 1 WHEN N'February' THEN 2 WHEN N'March' THEN 3 WHEN N'April' THEN 4 WHEN N'May' THEN 5 WHEN N'June' THEN 6 WHEN N'July' THEN 7 WHEN N'August' THEN 8 WHEN N'September' THEN 9 WHEN N'October' THEN 10 WHEN N'November' THEN 11 WHEN N'December' THEN 12 END),2),N'01'),112) BETWEEN @FromDate AND @ToDate
          AND EXISTS (SELECT 1 FROM [Infinity-UWVendorBilling].dbo.Infinity_InvoiceDetails i WHERE i.Month=s.Month AND i.Year=s.Year AND i.InvoiceType=N'Scienna')
        GROUP BY s.Month, s.Year, NULLIF(LTRIM(RTRIM(s.Client)), N'')
    ),
    SciennaLabour AS
    (
        SELECT l.Month, l.Year, NULLIF(LTRIM(RTRIM(l.Client)), N'') Project,
               SUM(ISNULL(TRY_CONVERT(DECIMAL(18,2), REPLACE(REPLACE(l.Fee,N'$',N''),N',',N'')),0)) Labour
        FROM [Infinity-UWVendorBilling].dbo.SciennaLabour l
        WHERE TRY_CONVERT(DATE,CONCAT(l.Year,RIGHT(N'0'+CONVERT(NVARCHAR(2),
              CASE l.Month WHEN N'January' THEN 1 WHEN N'February' THEN 2 WHEN N'March' THEN 3 WHEN N'April' THEN 4 WHEN N'May' THEN 5 WHEN N'June' THEN 6 WHEN N'July' THEN 7 WHEN N'August' THEN 8 WHEN N'September' THEN 9 WHEN N'October' THEN 10 WHEN N'November' THEN 11 WHEN N'December' THEN 12 END),2),N'01'),112) BETWEEN @FromDate AND @ToDate
          AND EXISTS (SELECT 1 FROM [Infinity-UWVendorBilling].dbo.Infinity_InvoiceDetails i WHERE i.Month=l.Month AND i.Year=l.Year AND i.InvoiceType=N'Scienna')
        GROUP BY l.Month, l.Year, NULLIF(LTRIM(RTRIM(l.Client)), N'')
    ),
    SourceRows AS
    (
        SELECT N'Scienna' Vendor, N'' Process, COALESCE(u.Project,l.Project,N'') Project,
               ISNULL(u.USD,0) USD, ISNULL(u.Volume,0) Volume, ISNULL(r.SciennaRate,0) BaseRate,
               ISNULL(l.Labour,0) Labour
        FROM SciennaUsage u
        FULL OUTER JOIN SciennaLabour l ON l.Month=u.Month AND l.Year=u.Year AND ISNULL(l.Project,N'')=ISNULL(u.Project,N'')
        CROSS JOIN Rates r

        UNION ALL
        SELECT N'Compliance', N'', LEFT(c.SysRemark,CHARINDEX(N'-',c.SysRemark+N'-')-1),
               ISNULL(r.ComplianceRate,0)*COUNT(c.CompEaseID), COUNT(c.CompEaseID), ISNULL(r.ComplianceRate,0), 0
        FROM [Infinity-UWVendorBilling].dbo.ComplianceEase c CROSS JOIN Rates r
        WHERE c.CABillable=1
          AND TRY_CONVERT(DATE,CONCAT(c.Year,RIGHT(N'0'+CONVERT(NVARCHAR(2),CASE c.Month WHEN N'January' THEN 1 WHEN N'February' THEN 2 WHEN N'March' THEN 3 WHEN N'April' THEN 4 WHEN N'May' THEN 5 WHEN N'June' THEN 6 WHEN N'July' THEN 7 WHEN N'August' THEN 8 WHEN N'September' THEN 9 WHEN N'October' THEN 10 WHEN N'November' THEN 11 WHEN N'December' THEN 12 END),2),N'01'),112) BETWEEN @FromDate AND @ToDate
          AND EXISTS (SELECT 1 FROM [Infinity-UWVendorBilling].dbo.Infinity_InvoiceDetails i WHERE i.Month=c.Month AND i.Year=c.Year AND i.InvoiceType=N'Compliance')
        GROUP BY LEFT(c.SysRemark,CHARINDEX(N'-',c.SysRemark+N'-')-1), r.ComplianceRate

        UNION ALL
        SELECT N'LoanLogics', N'', LEFT(x.SysRemark,CHARINDEX(N'-',x.SysRemark+N'-')-1),
               ISNULL(r.LoanLogicsRate,0)*COUNT(x.BillingID), COUNT(x.BillingID), ISNULL(r.LoanLogicsRate,0), 0
        FROM [Canopy-UWVendorBilling].dbo.LoanLogics x CROSS JOIN Rates r
        WHERE TRY_CONVERT(DATE,CONCAT(x.Year,RIGHT(N'0'+CONVERT(NVARCHAR(2),CASE x.Month WHEN N'January' THEN 1 WHEN N'February' THEN 2 WHEN N'March' THEN 3 WHEN N'April' THEN 4 WHEN N'May' THEN 5 WHEN N'June' THEN 6 WHEN N'July' THEN 7 WHEN N'August' THEN 8 WHEN N'September' THEN 9 WHEN N'October' THEN 10 WHEN N'November' THEN 11 WHEN N'December' THEN 12 END),2),N'01'),112) BETWEEN @FromDate AND @ToDate
          AND LEFT(x.SysRemark,CHARINDEX(N'-',x.SysRemark+N'-')-1) IN (SELECT ProjectName FROM InfinityERP.dbo.Project WHERE SubdomainID<>99)
          AND EXISTS (SELECT 1 FROM [Infinity-UWVendorBilling].dbo.Infinity_InvoiceDetails i WHERE i.Month=x.Month AND i.Year=x.Year AND i.InvoiceType=N'LoanLogics')
        GROUP BY LEFT(x.SysRemark,CHARINDEX(N'-',x.SysRemark+N'-')-1), r.LoanLogicsRate

        UNION ALL
        SELECT N'LauraMac', N'', LEFT(x.SysRemark,CHARINDEX(N'-',x.SysRemark+N'-')-1),
               ISNULL(r.LauraMacRate,0)*COUNT(x.LauraMacID), COUNT(x.LauraMacID), ISNULL(r.LauraMacRate,0), 0
        FROM [Canopy-UWVendorBilling].dbo.LauraMac x CROSS JOIN Rates r
        WHERE TRY_CONVERT(DATE,CONCAT(x.Year,RIGHT(N'0'+CONVERT(NVARCHAR(2),CASE x.Month WHEN N'January' THEN 1 WHEN N'February' THEN 2 WHEN N'March' THEN 3 WHEN N'April' THEN 4 WHEN N'May' THEN 5 WHEN N'June' THEN 6 WHEN N'July' THEN 7 WHEN N'August' THEN 8 WHEN N'September' THEN 9 WHEN N'October' THEN 10 WHEN N'November' THEN 11 WHEN N'December' THEN 12 END),2),N'01'),112) BETWEEN @FromDate AND @ToDate
          AND LEFT(x.SysRemark,CHARINDEX(N'-',x.SysRemark+N'-')-1) IN (SELECT ProjectName FROM InfinityERP.dbo.Project WHERE SubdomainID<>99)
          AND EXISTS (SELECT 1 FROM [Infinity-UWVendorBilling].dbo.Infinity_InvoiceDetails i WHERE i.Month=x.Month AND i.Year=x.Year AND i.InvoiceType=N'LauraMac')
        GROUP BY LEFT(x.SysRemark,CHARINDEX(N'-',x.SysRemark+N'-')-1), r.LauraMacRate

        UNION ALL
        SELECT NULLIF(LTRIM(RTRIM(i.Delay)),N''),NULLIF(LTRIM(RTRIM(i.Delay)),N''),N'561',
               SUM(ISNULL(TRY_CONVERT(DECIMAL(18,2),REPLACE(REPLACE(i.Balance,N'$',N''),N',',N'')),0)),
               SUM(ISNULL(TRY_CONVERT(BIGINT,REPLACE(i.IsApproved1Remark,N',',N'')),0)),0,0
        FROM [Infinity-UWVendorBilling].dbo.Infinity_InvoiceDetails i
        WHERE i.InvoiceType=N'Remote UW' AND NULLIF(LTRIM(RTRIM(i.Delay)),N'') IS NOT NULL
          AND TRY_CONVERT(DATE,CONCAT(i.Year,RIGHT(N'0'+CONVERT(NVARCHAR(2),CASE i.Month WHEN N'January' THEN 1 WHEN N'February' THEN 2 WHEN N'March' THEN 3 WHEN N'April' THEN 4 WHEN N'May' THEN 5 WHEN N'June' THEN 6 WHEN N'July' THEN 7 WHEN N'August' THEN 8 WHEN N'September' THEN 9 WHEN N'October' THEN 10 WHEN N'November' THEN 11 WHEN N'December' THEN 12 END),2),N'01'),112) BETWEEN @FromDate AND @ToDate
        GROUP BY NULLIF(LTRIM(RTRIM(i.Delay)),N'')

        UNION ALL
        SELECT i.InvoiceType, ISNULL(x.ERPProcess,N''), ISNULL(x.ProjectNo,N''),
               SUM(ISNULL(TRY_CONVERT(DECIMAL(18,2),x.InvoiceAmount),0)), COUNT(x.[Loan#]), 0, 0
        FROM [Infinity-UWVendorBilling].dbo.Infinity_Remote_UWBilling1099 x
        INNER JOIN (SELECT DISTINCT InvoiceID,InvoiceType FROM [Infinity-UWVendorBilling].dbo.Infinity_InvoiceDetails
                    WHERE InvoiceType IN (N'True Resources',N'Smart Hire')
                      AND TRY_CONVERT(DATE,CONCAT(Year,RIGHT(N'0'+CONVERT(NVARCHAR(2),CASE Month WHEN N'January' THEN 1 WHEN N'February' THEN 2 WHEN N'March' THEN 3 WHEN N'April' THEN 4 WHEN N'May' THEN 5 WHEN N'June' THEN 6 WHEN N'July' THEN 7 WHEN N'August' THEN 8 WHEN N'September' THEN 9 WHEN N'October' THEN 10 WHEN N'November' THEN 11 WHEN N'December' THEN 12 END),2),N'01'),112) BETWEEN @FromDate AND @ToDate) i ON i.InvoiceID=x.InvoiceID
        GROUP BY i.InvoiceType, ISNULL(x.ERPProcess,N''), ISNULL(x.ProjectNo,N'')

        UNION ALL
        SELECT h.HeaderName, N'', CASE WHEN c.AppliesToAllProjects=1 THEN N'' ELSE ISNULL(cp.ProjectName,N'') END,
               SUM(ISNULL(c.Amount,0)), 0, 0, 0
        FROM dbo.CostingHeaderMaster h
        LEFT JOIN dbo.CostingMaster c ON c.CostingHeaderID=h.CostingHeaderID AND c.IsActive=1
             AND TRY_CONVERT(DATE,CONCAT(c.CostingYear,RIGHT(N'0'+CONVERT(NVARCHAR(2),c.CostingMonth),2),N'01'),112) BETWEEN @FromDate AND @ToDate
        LEFT JOIN dbo.CostingMasterProject cp ON cp.CostingID=c.CostingID
        WHERE h.IsActive=1
        GROUP BY h.HeaderName, CASE WHEN c.AppliesToAllProjects=1 THEN N'' ELSE ISNULL(cp.ProjectName,N'') END
    )
    SELECT Vendor, Process, Project,
           CONVERT(DECIMAL(18,2),SUM(USD)) USD,
           CONVERT(BIGINT,SUM(Volume)) Volume,
           CONVERT(DECIMAL(18,4),CASE WHEN Vendor IN (N'Scienna',N'Compliance',N'LoanLogics',N'LauraMac') THEN MAX(BaseRate)
                WHEN SUM(Volume)<>0 THEN SUM(USD)/SUM(Volume) ELSE 0 END) Rate,
           CONVERT(DECIMAL(18,2),SUM(Labour)) Labour,
           CONVERT(DECIMAL(18,2),SUM(USD)+SUM(Labour)) Total
    FROM SourceRows
    GROUP BY Vendor,Process,Project
);
GO

CREATE PROCEDURE dbo.usp_AllVendorCostingComparison
    @PeriodAFrom DATE,
    @PeriodATo DATE,
    @PeriodBFrom DATE = NULL,
    @PeriodBTo DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    IF @PeriodAFrom>@PeriodATo THROW 50001,N'Period A start date must not be after its end date.',1;
    IF (@PeriodBFrom IS NULL AND @PeriodBTo IS NOT NULL) OR (@PeriodBFrom IS NOT NULL AND @PeriodBTo IS NULL) THROW 50002,N'Period B requires both dates.',1;
    IF @PeriodBFrom>@PeriodBTo THROW 50003,N'Period B start date must not be after its end date.',1;

    SELECT * INTO #A FROM dbo.ufn_AllVendorCostingNormalized(@PeriodAFrom,@PeriodATo);
    SELECT * INTO #B FROM dbo.ufn_AllVendorCostingNormalized(@PeriodBFrom,@PeriodBTo);

    SELECT COALESCE(a.Vendor,b.Vendor) Vendor,COALESCE(a.Process,b.Process) Process,COALESCE(a.Project,b.Project) Project,
           a.USD PeriodA_USD,b.USD PeriodB_USD,ISNULL(a.USD,0)-ISNULL(b.USD,0) Difference_USD,
           CASE WHEN ISNULL(b.USD,0)=0 THEN NULL ELSE (ISNULL(a.USD,0)-b.USD)*100.0/ABS(b.USD) END DifferencePct_USD,
           a.Volume PeriodA_Volume,b.Volume PeriodB_Volume,ISNULL(a.Volume,0)-ISNULL(b.Volume,0) Difference_Volume,
           CASE WHEN ISNULL(b.Volume,0)=0 THEN NULL ELSE (ISNULL(a.Volume,0)-b.Volume)*100.0/ABS(b.Volume) END DifferencePct_Volume,
           a.Rate PeriodA_Rate,b.Rate PeriodB_Rate,ISNULL(a.Rate,0)-ISNULL(b.Rate,0) Difference_Rate,
           CASE WHEN ISNULL(b.Rate,0)=0 THEN NULL ELSE (ISNULL(a.Rate,0)-b.Rate)*100.0/ABS(b.Rate) END DifferencePct_Rate,
           a.Labour PeriodA_Labour,b.Labour PeriodB_Labour,ISNULL(a.Labour,0)-ISNULL(b.Labour,0) Difference_Labour,
           CASE WHEN ISNULL(b.Labour,0)=0 THEN NULL ELSE (ISNULL(a.Labour,0)-b.Labour)*100.0/ABS(b.Labour) END DifferencePct_Labour,
           a.Total PeriodA_Total,b.Total PeriodB_Total,ISNULL(a.Total,0)-ISNULL(b.Total,0) Difference_Total,
           CASE WHEN ISNULL(b.Total,0)=0 THEN NULL ELSE (ISNULL(a.Total,0)-b.Total)*100.0/ABS(b.Total) END DifferencePct_Total
    INTO #Detail
    FROM #A a FULL OUTER JOIN #B b ON b.Vendor=a.Vendor AND b.Process=a.Process AND b.Project=a.Project;

    SELECT Vendor,
           SUM(ISNULL(PeriodA_USD,0)) PeriodA_USD,SUM(ISNULL(PeriodB_USD,0)) PeriodB_USD,SUM(Difference_USD) Difference_USD,
           CASE WHEN SUM(ISNULL(PeriodB_USD,0))=0 THEN NULL ELSE SUM(Difference_USD)*100.0/ABS(SUM(PeriodB_USD)) END DifferencePct_USD,
           SUM(ISNULL(PeriodA_Volume,0)) PeriodA_Volume,SUM(ISNULL(PeriodB_Volume,0)) PeriodB_Volume,SUM(Difference_Volume) Difference_Volume,
           CASE WHEN SUM(ISNULL(PeriodB_Volume,0))=0 THEN NULL ELSE SUM(Difference_Volume)*100.0/ABS(SUM(PeriodB_Volume)) END DifferencePct_Volume,
           CASE WHEN SUM(ISNULL(PeriodA_Volume,0))=0 THEN 0 ELSE SUM(ISNULL(PeriodA_USD,0))/SUM(ISNULL(PeriodA_Volume,0)) END PeriodA_Rate,
           CASE WHEN SUM(ISNULL(PeriodB_Volume,0))=0 THEN 0 ELSE SUM(ISNULL(PeriodB_USD,0))/SUM(ISNULL(PeriodB_Volume,0)) END PeriodB_Rate,
           CASE WHEN SUM(ISNULL(PeriodA_Volume,0))=0 THEN 0 ELSE SUM(ISNULL(PeriodA_USD,0))/SUM(ISNULL(PeriodA_Volume,0)) END-
           CASE WHEN SUM(ISNULL(PeriodB_Volume,0))=0 THEN 0 ELSE SUM(ISNULL(PeriodB_USD,0))/SUM(ISNULL(PeriodB_Volume,0)) END Difference_Rate,
           CASE WHEN SUM(ISNULL(PeriodB_Volume,0))=0 OR SUM(ISNULL(PeriodB_USD,0))=0 THEN NULL ELSE
             ((CASE WHEN SUM(ISNULL(PeriodA_Volume,0))=0 THEN 0 ELSE SUM(ISNULL(PeriodA_USD,0))/SUM(ISNULL(PeriodA_Volume,0)) END)-
              (SUM(ISNULL(PeriodB_USD,0))/SUM(ISNULL(PeriodB_Volume,0))))*100.0/ABS(SUM(ISNULL(PeriodB_USD,0))/SUM(ISNULL(PeriodB_Volume,0))) END DifferencePct_Rate,
           SUM(ISNULL(PeriodA_Labour,0)) PeriodA_Labour,SUM(ISNULL(PeriodB_Labour,0)) PeriodB_Labour,SUM(Difference_Labour) Difference_Labour,
           CASE WHEN SUM(ISNULL(PeriodB_Labour,0))=0 THEN NULL ELSE SUM(Difference_Labour)*100.0/ABS(SUM(PeriodB_Labour)) END DifferencePct_Labour,
           SUM(ISNULL(PeriodA_Total,0)) PeriodA_Total,SUM(ISNULL(PeriodB_Total,0)) PeriodB_Total,SUM(Difference_Total) Difference_Total,
           CASE WHEN SUM(ISNULL(PeriodB_Total,0))=0 THEN NULL ELSE SUM(Difference_Total)*100.0/ABS(SUM(PeriodB_Total)) END DifferencePct_Total
    FROM #Detail GROUP BY Vendor ORDER BY CASE Vendor WHEN N'Scienna' THEN 1 WHEN N'Compliance' THEN 2 WHEN N'LoanLogics' THEN 3 WHEN N'LauraMac' THEN 4 WHEN N'True Resources' THEN 5 WHEN N'Smart Hire' THEN 6 ELSE 99 END,Vendor;

    SELECT * FROM #Detail ORDER BY CASE Vendor WHEN N'Scienna' THEN 1 WHEN N'Compliance' THEN 2 WHEN N'LoanLogics' THEN 3 WHEN N'LauraMac' THEN 4 WHEN N'True Resources' THEN 5 WHEN N'Smart Hire' THEN 6 ELSE 99 END,Vendor,Process,Project;
END;
GO

CREATE PROCEDURE dbo.usp_AllVendorCostingInvoiceDetails
    @Vendor NVARCHAR(100), @Project NVARCHAR(200)=NULL, @Process NVARCHAR(200)=NULL,
    @FromDate DATE, @ToDate DATE
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Rate DECIMAL(18,2)=(SELECT TOP(1) TRY_CONVERT(DECIMAL(18,2),Rate) FROM [Infinity-UWVendorBilling].dbo.VenodrRateConfigurationMaster WHERE Vendor=@Vendor OR (@Vendor=N'LoanLogics' AND Vendor=N'Loan Logics') ORDER BY TRY_CONVERT(DATE,FormDate) DESC);
    IF @Vendor=N'Scienna'
    BEGIN
        SELECT N'Usage' DetailType,s.InvoiceID,s.Month,s.Year,s.Client Project,s.Project Reference,s.PeriodEnding Description,
               TRY_CONVERT(DECIMAL(18,2),s.LoansReviewed) Volume,TRY_CONVERT(DECIMAL(18,2),s.PerLoanUsageFees) Rate,TRY_CONVERT(DECIMAL(18,2),REPLACE(REPLACE(s.UsageFees,N'$',N''),N',',N'')) Amount
        FROM [Infinity-UWVendorBilling].dbo.Scienna s WHERE (@Project IS NULL OR @Project=N'' OR s.Client=@Project) AND TRY_CONVERT(DATE,CONCAT(s.Year,RIGHT(N'0'+CONVERT(NVARCHAR(2),CASE s.Month WHEN N'January' THEN 1 WHEN N'February' THEN 2 WHEN N'March' THEN 3 WHEN N'April' THEN 4 WHEN N'May' THEN 5 WHEN N'June' THEN 6 WHEN N'July' THEN 7 WHEN N'August' THEN 8 WHEN N'September' THEN 9 WHEN N'October' THEN 10 WHEN N'November' THEN 11 WHEN N'December' THEN 12 END),2),N'01'),112) BETWEEN @FromDate AND @ToDate
        UNION ALL
        SELECT N'Labour',l.InvoiceID,l.Month,l.Year,l.Client,l.Personnel,l.Activity,TRY_CONVERT(DECIMAL(18,2),l.Hours),TRY_CONVERT(DECIMAL(18,2),l.Rate),TRY_CONVERT(DECIMAL(18,2),REPLACE(REPLACE(l.Fee,N'$',N''),N',',N''))
        FROM [Infinity-UWVendorBilling].dbo.SciennaLabour l WHERE (@Project IS NULL OR @Project=N'' OR l.Client=@Project) AND TRY_CONVERT(DATE,CONCAT(l.Year,RIGHT(N'0'+CONVERT(NVARCHAR(2),CASE l.Month WHEN N'January' THEN 1 WHEN N'February' THEN 2 WHEN N'March' THEN 3 WHEN N'April' THEN 4 WHEN N'May' THEN 5 WHEN N'June' THEN 6 WHEN N'July' THEN 7 WHEN N'August' THEN 8 WHEN N'September' THEN 9 WHEN N'October' THEN 10 WHEN N'November' THEN 11 WHEN N'December' THEN 12 END),2),N'01'),112) BETWEEN @FromDate AND @ToDate;
        RETURN;
    END
    IF @Vendor=N'Compliance'
    BEGIN
        SELECT N'Invoice' DetailType,c.InvoiceID,c.Month,c.Year,LEFT(c.SysRemark,CHARINDEX(N'-',c.SysRemark+N'-')-1) Project,c.LoanNo Reference,c.Product Description,CONVERT(DECIMAL(18,2),1) Volume,@Rate Rate,@Rate Amount FROM [Infinity-UWVendorBilling].dbo.ComplianceEase c WHERE c.CABillable=1 AND (@Project IS NULL OR @Project=N'' OR LEFT(c.SysRemark,CHARINDEX(N'-',c.SysRemark+N'-')-1)=@Project) AND TRY_CONVERT(DATE,CONCAT(c.Year,RIGHT(N'0'+CONVERT(NVARCHAR(2),CASE c.Month WHEN N'January' THEN 1 WHEN N'February' THEN 2 WHEN N'March' THEN 3 WHEN N'April' THEN 4 WHEN N'May' THEN 5 WHEN N'June' THEN 6 WHEN N'July' THEN 7 WHEN N'August' THEN 8 WHEN N'September' THEN 9 WHEN N'October' THEN 10 WHEN N'November' THEN 11 WHEN N'December' THEN 12 END),2),N'01'),112) BETWEEN @FromDate AND @ToDate; RETURN;
    END
    IF @Vendor IN(N'LoanLogics',N'LauraMac')
    BEGIN
        IF @Vendor=N'LoanLogics' SELECT N'Invoice' DetailType,x.InvoiceID,x.Month,x.Year,LEFT(x.SysRemark,CHARINDEX(N'-',x.SysRemark+N'-')-1) Project,x.LoanNumber Reference,x.FeeType Description,CONVERT(DECIMAL(18,2),1) Volume,@Rate Rate,@Rate Amount FROM [Canopy-UWVendorBilling].dbo.LoanLogics x WHERE (@Project IS NULL OR @Project=N'' OR LEFT(x.SysRemark,CHARINDEX(N'-',x.SysRemark+N'-')-1)=@Project) AND TRY_CONVERT(DATE,CONCAT(x.Year,RIGHT(N'0'+CONVERT(NVARCHAR(2),CASE x.Month WHEN N'January' THEN 1 WHEN N'February' THEN 2 WHEN N'March' THEN 3 WHEN N'April' THEN 4 WHEN N'May' THEN 5 WHEN N'June' THEN 6 WHEN N'July' THEN 7 WHEN N'August' THEN 8 WHEN N'September' THEN 9 WHEN N'October' THEN 10 WHEN N'November' THEN 11 WHEN N'December' THEN 12 END),2),N'01'),112) BETWEEN @FromDate AND @ToDate;
        ELSE SELECT N'Invoice',x.InvoiceID,x.Month,x.Year,LEFT(x.SysRemark,CHARINDEX(N'-',x.SysRemark+N'-')-1),x.LoanNo,x.TransactionID,CONVERT(DECIMAL(18,2),1),@Rate,@Rate FROM [Canopy-UWVendorBilling].dbo.LauraMac x WHERE (@Project IS NULL OR @Project=N'' OR LEFT(x.SysRemark,CHARINDEX(N'-',x.SysRemark+N'-')-1)=@Project) AND TRY_CONVERT(DATE,CONCAT(x.Year,RIGHT(N'0'+CONVERT(NVARCHAR(2),CASE x.Month WHEN N'January' THEN 1 WHEN N'February' THEN 2 WHEN N'March' THEN 3 WHEN N'April' THEN 4 WHEN N'May' THEN 5 WHEN N'June' THEN 6 WHEN N'July' THEN 7 WHEN N'August' THEN 8 WHEN N'September' THEN 9 WHEN N'October' THEN 10 WHEN N'November' THEN 11 WHEN N'December' THEN 12 END),2),N'01'),112) BETWEEN @FromDate AND @ToDate; RETURN;
    END
    IF @Vendor IN(N'True Resources',N'Smart Hire')
    BEGIN
        SELECT N'Invoice' DetailType,x.InvoiceID,i.Month,i.Year,x.ProjectNo Project,x.[Loan#] Reference,x.EmployeeName Description,CONVERT(DECIMAL(18,2),1) Volume,TRY_CONVERT(DECIMAL(18,2),x.RatePerLoan) Rate,TRY_CONVERT(DECIMAL(18,2),x.InvoiceAmount) Amount FROM [Infinity-UWVendorBilling].dbo.Infinity_Remote_UWBilling1099 x INNER JOIN [Infinity-UWVendorBilling].dbo.Infinity_InvoiceDetails i ON i.InvoiceID=x.InvoiceID AND i.InvoiceType=@Vendor WHERE (@Project IS NULL OR @Project=N'' OR x.ProjectNo=@Project) AND (@Process IS NULL OR @Process=N'' OR x.ERPProcess=@Process) AND TRY_CONVERT(DATE,CONCAT(i.Year,RIGHT(N'0'+CONVERT(NVARCHAR(2),CASE i.Month WHEN N'January' THEN 1 WHEN N'February' THEN 2 WHEN N'March' THEN 3 WHEN N'April' THEN 4 WHEN N'May' THEN 5 WHEN N'June' THEN 6 WHEN N'July' THEN 7 WHEN N'August' THEN 8 WHEN N'September' THEN 9 WHEN N'October' THEN 10 WHEN N'November' THEN 11 WHEN N'December' THEN 12 END),2),N'01'),112) BETWEEN @FromDate AND @ToDate; RETURN;
    END
    IF @Vendor IN(N'LynnHott',N'CoreyDaise',N'LucyBeltran')
    BEGIN
        SELECT N'Invoice' DetailType,i.InvoiceID,i.Month,i.Year,N'561' Project,i.Delay Reference,N'Remote UW' Description,TRY_CONVERT(DECIMAL(18,2),REPLACE(i.IsApproved1Remark,N',',N'')) Volume,CASE WHEN ISNULL(TRY_CONVERT(DECIMAL(18,2),REPLACE(i.IsApproved1Remark,N',',N'')),0)=0 THEN NULL ELSE TRY_CONVERT(DECIMAL(18,2),REPLACE(REPLACE(i.Balance,N'$',N''),N',',N''))/TRY_CONVERT(DECIMAL(18,2),REPLACE(i.IsApproved1Remark,N',',N'')) END Rate,TRY_CONVERT(DECIMAL(18,2),REPLACE(REPLACE(i.Balance,N'$',N''),N',',N'')) Amount
        FROM [Infinity-UWVendorBilling].dbo.Infinity_InvoiceDetails i WHERE i.InvoiceType=N'Remote UW' AND LTRIM(RTRIM(i.Delay))=@Vendor AND TRY_CONVERT(DATE,CONCAT(i.Year,RIGHT(N'0'+CONVERT(NVARCHAR(2),CASE i.Month WHEN N'January' THEN 1 WHEN N'February' THEN 2 WHEN N'March' THEN 3 WHEN N'April' THEN 4 WHEN N'May' THEN 5 WHEN N'June' THEN 6 WHEN N'July' THEN 7 WHEN N'August' THEN 8 WHEN N'September' THEN 9 WHEN N'October' THEN 10 WHEN N'November' THEN 11 WHEN N'December' THEN 12 END),2),N'01'),112) BETWEEN @FromDate AND @ToDate; RETURN;
    END
    SELECT N'Costing' DetailType,c.CostingID InvoiceID,DATENAME(MONTH,DATEFROMPARTS(c.CostingYear,c.CostingMonth,1)) Month,c.CostingYear Year,CASE WHEN c.AppliesToAllProjects=1 THEN N'All Projects' ELSE cp.ProjectName END Project,h.HeaderName Reference,N'Configured Cost' Description,CONVERT(DECIMAL(18,2),1) Volume,CONVERT(DECIMAL(18,2),c.Amount) Rate,CONVERT(DECIMAL(18,2),c.Amount) Amount FROM dbo.CostingMaster c INNER JOIN dbo.CostingHeaderMaster h ON h.CostingHeaderID=c.CostingHeaderID LEFT JOIN dbo.CostingMasterProject cp ON cp.CostingID=c.CostingID WHERE h.HeaderName=@Vendor AND c.IsActive=1 AND (@Project IS NULL OR @Project=N'' OR cp.ProjectName=@Project) AND TRY_CONVERT(DATE,CONCAT(c.CostingYear,RIGHT(N'0'+CONVERT(NVARCHAR(2),c.CostingMonth),2),N'01'),112) BETWEEN @FromDate AND @ToDate;
END;
GO

COMMIT TRANSACTION;
