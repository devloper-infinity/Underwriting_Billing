IF OBJECT_ID(N'dbo.UserMfa', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.UserMfa
    (
        EmployeeId BIGINT NOT NULL CONSTRAINT PK_UserMfa PRIMARY KEY,
        ProtectedSecret NVARCHAR(1000) NOT NULL,
        IsEnabled BIT NOT NULL CONSTRAINT DF_UserMfa_IsEnabled DEFAULT (1),
        EnrolledUtc DATETIME2(0) NOT NULL CONSTRAINT DF_UserMfa_EnrolledUtc DEFAULT (SYSUTCDATETIME()),
        LastUsedUtc DATETIME2(0) NULL
    );
END;
