SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'dbo.InfinityBilling_CleanLoanCostingMaster', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.InfinityBilling_CleanLoanCostingMaster
    (
        CleanLoanCostingID INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_InfinityBilling_CleanLoanCostingMaster PRIMARY KEY,
        ProjectID INT NOT NULL,
        DealNo NVARCHAR(100) NULL,
        CleanLoanRate DECIMAL(18,2) NOT NULL,
        AddedBy INT NULL,
        AddedDate DATETIME NULL,
        UpdatedBy INT NULL,
        UpdatedDate DATETIME NULL
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_CleanLoanCosting_ProjectDefault' AND object_id = OBJECT_ID(N'dbo.InfinityBilling_CleanLoanCostingMaster'))
    CREATE UNIQUE NONCLUSTERED INDEX UX_CleanLoanCosting_ProjectDefault ON dbo.InfinityBilling_CleanLoanCostingMaster(ProjectID) WHERE DealNo IS NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_CleanLoanCosting_DealException' AND object_id = OBJECT_ID(N'dbo.InfinityBilling_CleanLoanCostingMaster'))
    CREATE UNIQUE NONCLUSTERED INDEX UX_CleanLoanCosting_DealException ON dbo.InfinityBilling_CleanLoanCostingMaster(ProjectID, DealNo) WHERE DealNo IS NOT NULL;
GO

IF OBJECT_ID(N'dbo.usp_GetCleanLoanCosting', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_GetCleanLoanCosting;
GO
CREATE PROCEDURE dbo.usp_GetCleanLoanCosting
AS
BEGIN
    SET NOCOUNT ON;
    SELECT CleanLoanCostingID, ProjectID, DealNo, CleanLoanRate, AddedBy, AddedDate, UpdatedBy, UpdatedDate
    FROM dbo.InfinityBilling_CleanLoanCostingMaster
    ORDER BY ProjectID, CASE WHEN DealNo IS NULL THEN 0 ELSE 1 END, DealNo;
END;
GO

IF OBJECT_ID(N'dbo.usp_InsertUpdateCleanLoanCosting', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_InsertUpdateCleanLoanCosting;
GO
CREATE PROCEDURE dbo.usp_InsertUpdateCleanLoanCosting
    @CleanLoanCostingID INT = 0,
    @ProjectID INT,
    @DealNo NVARCHAR(100) = NULL,
    @CleanLoanRate DECIMAL(18,2),
    @EmployeeID INT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;
    SET @DealNo = NULLIF(LTRIM(RTRIM(@DealNo)), N'');

    IF @ProjectID <= 0 OR @CleanLoanRate IS NULL RETURN -2;

    IF EXISTS (SELECT 1 FROM dbo.InfinityBilling_CleanLoanCostingMaster
               WHERE ProjectID = @ProjectID
                 AND ((DealNo IS NULL AND @DealNo IS NULL) OR DealNo = @DealNo)
                 AND CleanLoanCostingID <> @CleanLoanCostingID)
        RETURN -1;

    BEGIN TRY
        IF @CleanLoanCostingID > 0
        BEGIN
            UPDATE dbo.InfinityBilling_CleanLoanCostingMaster
            SET ProjectID = @ProjectID, DealNo = @DealNo, CleanLoanRate = @CleanLoanRate,
                UpdatedBy = @EmployeeID, UpdatedDate = GETDATE()
            WHERE CleanLoanCostingID = @CleanLoanCostingID;
            IF @@ROWCOUNT = 0 RETURN -3;
        END
        ELSE
            INSERT dbo.InfinityBilling_CleanLoanCostingMaster(ProjectID, DealNo, CleanLoanRate, AddedBy, AddedDate)
            VALUES(@ProjectID, @DealNo, @CleanLoanRate, @EmployeeID, GETDATE());
    END TRY
    BEGIN CATCH
        IF ERROR_NUMBER() IN (2601, 2627) RETURN -1;
        THROW;
    END CATCH;
    RETURN 1;
END;
GO

IF OBJECT_ID(N'dbo.usp_DeleteCleanLoanCosting', N'P') IS NOT NULL
    DROP PROCEDURE dbo.usp_DeleteCleanLoanCosting;
GO
CREATE PROCEDURE dbo.usp_DeleteCleanLoanCosting
    @CleanLoanCostingID INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE dbo.InfinityBilling_CleanLoanCostingMaster WHERE CleanLoanCostingID = @CleanLoanCostingID;
    IF @@ROWCOUNT = 0 RETURN -3;
    RETURN 1;
END;
GO
