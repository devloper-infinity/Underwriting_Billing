SET XACT_ABORT ON;
BEGIN TRANSACTION;

IF OBJECT_ID(N'dbo.CostingHeaderMaster', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.CostingHeaderMaster
    (
        CostingHeaderID INT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_CostingHeaderMaster PRIMARY KEY,
        HeaderName NVARCHAR(200) NOT NULL,
        IsActive BIT NOT NULL CONSTRAINT DF_CostingHeaderMaster_IsActive DEFAULT (1),
        CreatedBy NVARCHAR(100) NOT NULL,
        CreatedOn DATETIME2(0) NOT NULL CONSTRAINT DF_CostingHeaderMaster_CreatedOn DEFAULT (SYSDATETIME()),
        ModifiedBy NVARCHAR(100) NULL,
        ModifiedOn DATETIME2(0) NULL,
        CONSTRAINT UQ_CostingHeaderMaster_HeaderName UNIQUE (HeaderName)
    );
END;

IF OBJECT_ID(N'dbo.CostingMaster', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.CostingMaster
    (
        CostingID INT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_CostingMaster PRIMARY KEY,
        CostingMonth TINYINT NOT NULL,
        CostingYear SMALLINT NOT NULL,
        CostingHeaderID INT NOT NULL,
        Amount DECIMAL(18,2) NOT NULL,
        AppliesToAllProjects BIT NOT NULL CONSTRAINT DF_CostingMaster_AllProjects DEFAULT (1),
        IsActive BIT NOT NULL CONSTRAINT DF_CostingMaster_IsActive DEFAULT (1),
        CreatedBy NVARCHAR(100) NOT NULL,
        CreatedOn DATETIME2(0) NOT NULL CONSTRAINT DF_CostingMaster_CreatedOn DEFAULT (SYSDATETIME()),
        ModifiedBy NVARCHAR(100) NULL,
        ModifiedOn DATETIME2(0) NULL,
        CONSTRAINT FK_CostingMaster_CostingHeaderMaster FOREIGN KEY (CostingHeaderID)
            REFERENCES dbo.CostingHeaderMaster (CostingHeaderID),
        CONSTRAINT CK_CostingMaster_Month CHECK (CostingMonth BETWEEN 1 AND 12),
        CONSTRAINT CK_CostingMaster_Year CHECK (CostingYear BETWEEN 2000 AND 9999),
        CONSTRAINT CK_CostingMaster_Amount CHECK (Amount >= 0)
    );
END;

IF COL_LENGTH(N'dbo.CostingMaster', N'AppliesToAllProjects') IS NULL
BEGIN
    ALTER TABLE dbo.CostingMaster ADD AppliesToAllProjects BIT NOT NULL
        CONSTRAINT DF_CostingMaster_AllProjects DEFAULT (1) WITH VALUES;
END;

IF EXISTS (SELECT 1 FROM sys.key_constraints WHERE [name] = N'UQ_CostingMaster_PeriodHeader')
    ALTER TABLE dbo.CostingMaster DROP CONSTRAINT UQ_CostingMaster_PeriodHeader;

IF OBJECT_ID(N'dbo.CostingMasterProject', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.CostingMasterProject
    (
        CostingID INT NOT NULL,
        ProjectID INT NOT NULL,
        ProjectName NVARCHAR(300) NOT NULL,
        CONSTRAINT PK_CostingMasterProject PRIMARY KEY (CostingID, ProjectID),
        CONSTRAINT FK_CostingMasterProject_CostingMaster FOREIGN KEY (CostingID)
            REFERENCES dbo.CostingMaster (CostingID)
    );

    CREATE INDEX IX_CostingMasterProject_ProjectID
        ON dbo.CostingMasterProject (ProjectID, CostingID);
END;

IF OBJECT_ID(N'dbo.CostingMasterHistory', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.CostingMasterHistory
    (
        CostingHistoryID BIGINT IDENTITY(1,1) NOT NULL
            CONSTRAINT PK_CostingMasterHistory PRIMARY KEY,
        CostingID INT NOT NULL,
        CostingMonth TINYINT NOT NULL,
        CostingYear SMALLINT NOT NULL,
        CostingHeaderID INT NOT NULL,
        HeaderName NVARCHAR(200) NOT NULL,
        Amount DECIMAL(18,2) NOT NULL,
        IsActive BIT NOT NULL,
        ActionName NVARCHAR(10) NOT NULL,
        ChangedBy NVARCHAR(100) NOT NULL,
        ChangedOn DATETIME2(0) NOT NULL CONSTRAINT DF_CostingMasterHistory_ChangedOn DEFAULT (SYSDATETIME())
    );

    CREATE INDEX IX_CostingMasterHistory_CostingID
        ON dbo.CostingMasterHistory (CostingID, ChangedOn DESC);
END;

IF OBJECT_ID(N'dbo.TR_CostingMaster_Audit', N'TR') IS NOT NULL
    DROP TRIGGER dbo.TR_CostingMaster_Audit;
GO

CREATE TRIGGER dbo.TR_CostingMaster_Audit
ON dbo.CostingMaster
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    INSERT dbo.CostingMasterHistory
    (
        CostingID, CostingMonth, CostingYear, CostingHeaderID, HeaderName,
        Amount, IsActive, ActionName, ChangedBy, ChangedOn
    )
    SELECT
        COALESCE(i.CostingID, d.CostingID),
        COALESCE(i.CostingMonth, d.CostingMonth),
        COALESCE(i.CostingYear, d.CostingYear),
        COALESCE(i.CostingHeaderID, d.CostingHeaderID),
        h.HeaderName,
        COALESCE(i.Amount, d.Amount),
        COALESCE(i.IsActive, d.IsActive),
        CASE
            WHEN i.CostingID IS NOT NULL AND d.CostingID IS NULL THEN N'INSERT'
            WHEN i.CostingID IS NOT NULL AND d.CostingID IS NOT NULL THEN N'UPDATE'
            ELSE N'DELETE'
        END,
        COALESCE(i.ModifiedBy, i.CreatedBy, d.ModifiedBy, d.CreatedBy, N'System'),
        SYSDATETIME()
    FROM inserted i
    FULL OUTER JOIN deleted d ON d.CostingID = i.CostingID
    INNER JOIN dbo.CostingHeaderMaster h
        ON h.CostingHeaderID = COALESCE(i.CostingHeaderID, d.CostingHeaderID);
END;
GO

COMMIT TRANSACTION;
